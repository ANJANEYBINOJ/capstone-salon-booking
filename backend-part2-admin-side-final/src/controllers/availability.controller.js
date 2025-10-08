import { DateTime, Interval } from "luxon";
import Service from "../models/Service.js";
import StaffAvailability from "../models/StaffAvailability.js";
import TimeOff from "../models/TimeOff.js";
import Booking from "../models/Booking.js";

// helper: HH:mm -> minutes from midnight
const toMins = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export async function getAvailability(req, res) {
  const { serviceId, date, staffId } = req.query; // date as 'YYYY-MM-DD'
  if (!serviceId || !date) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "serviceId and date required" }});

  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Service not found" }});
  const duration = service.duration_minutes;

  const target = DateTime.fromISO(date, { zone: "local" });
  const weekday = target.weekday % 7; // Luxon: 1=Mon..7=Sun → we want 0=Sun..6=Sat
  const dayStart = target.startOf("day");
  const dayEnd   = target.endOf("day");

  // Availability sources
  const availQuery = { weekday, ...(staffId && { staff_id: staffId }) };
  const allAvailability = await StaffAvailability.find(availQuery).lean();
  if (!allAvailability.length) return res.json({ slots: [] });

  // Time off windows (for specific staff only)
  const timeOff = staffId
    ? await TimeOff.find({ staff_id: staffId, date: { $gte: dayStart.toJSDate(), $lte: dayEnd.toJSDate() } }).lean()
    : [];

  // Existing bookings for that day (any status except cancelled/no_show)
  const bookingQuery = {
    start_datetime: { $lt: dayEnd.toJSDate() },
    end_datetime:   { $gt: dayStart.toJSDate() },
    status: { $nin: ["cancelled", "no_show"] },
    ...(staffId && { staff_id: staffId })
  };
  const dayBookings = await Booking.find(bookingQuery).lean();

  // Build slots per availability rule
  const slots = [];
  for (const av of allAvailability) {
    const windowStart = dayStart.plus({ minutes: toMins(av.start_time) });
    const windowEnd   = dayStart.plus({ minutes: toMins(av.end_time) });

    // subtract breaks
    const breakIntervals = (av.breaks || []).map(b =>
      Interval.fromDateTimes(
        dayStart.plus({ minutes: toMins(b.start) }),
        dayStart.plus({ minutes: toMins(b.end) })
      )
    );

    // walk the window in 'duration' steps
    for (let t = windowStart; t.plus({ minutes: duration }) <= windowEnd; t = t.plus({ minutes: 15 })) { // 15-min granularity
      const candidate = Interval.fromDateTimes(t, t.plus({ minutes: duration }));

      // skip if in the past
      if (candidate.start < DateTime.now()) continue;

      // skip if overlaps a break
      if (breakIntervals.some(br => br.overlaps(candidate))) continue;

      // skip if overlaps time-off
      if (timeOff.some(off => {
        if (off.all_day) return true;
        if (!off.start_time || !off.end_time) return true;
        const offInt = Interval.fromDateTimes(
          dayStart.plus({ minutes: toMins(off.start_time) }),
          dayStart.plus({ minutes: toMins(off.end_time) })
        );
        return offInt.overlaps(candidate);
      })) continue;

      // skip if overlaps an existing booking
      const overlaps = dayBookings.some(b => {
        const bInt = Interval.fromDateTimes(DateTime.fromJSDate(b.start_datetime), DateTime.fromJSDate(b.end_datetime));
        return bInt.overlaps(candidate) && (!staffId || String(b.staff_id) === String(staffId));
      });
      if (overlaps) continue;

      slots.push({ start: candidate.start.toISO(), end: candidate.end.toISO(), staff_id: av.staff_id });
    }
  }

  res.json({ slots });
}

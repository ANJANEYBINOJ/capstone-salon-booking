import { DateTime, Interval } from "luxon";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import StaffAvailability from "../models/StaffAvailability.js";
import Booking from "../models/Booking.js";

export async function assertSlotIsBookable({ staffId, serviceId, startISO, tz = "UTC", ignoreBookingId = null }) {
  const service = await Service.findById(serviceId).lean();
  if (!service || !service.active) throw new Error("Service not available");
  const start = DateTime.fromISO(startISO, { zone: tz });
  if (!start.isValid) throw new Error("Invalid start_datetime");

  const end = start.plus({ minutes: service.duration_minutes });

  // 1) Availability window (weekday, time + breaks)
  const weekday = start.weekday; // 1 = Monday
  const avail = await StaffAvailability.findOne({ staff_id: staffId, weekday }).lean();
  if (!avail) throw new Error("Staff not available that day");

  const dayStart = DateTime.fromFormat(avail.start_time, "HH:mm", { zone: tz }).set({
    year: start.year, month: start.month, day: start.day,
  });
  const dayEnd = DateTime.fromFormat(avail.end_time, "HH:mm", { zone: tz }).set({
    year: start.year, month: start.month, day: start.day,
  });

  const appt = Interval.fromDateTimes(start, end);
  const work = Interval.fromDateTimes(dayStart, dayEnd);
  if (!appt.isValid || !work.contains(appt.start) || !work.contains(appt.end)) {
    throw new Error("Outside working hours");
  }

  for (const br of (avail.breaks || [])) {
    const bStart = DateTime.fromFormat(br.start, "HH:mm", { zone: tz }).set({ year: start.year, month: start.month, day: start.day });
    const bEnd   = DateTime.fromFormat(br.end, "HH:mm", { zone: tz }).set({ year: start.year, month: start.month, day: start.day });
    if (appt.overlaps(Interval.fromDateTimes(bStart, bEnd))) throw new Error("Overlaps staff break");
  }

  // 2) Overlapping bookings for this staff
  const q = {
    staff_id: new mongoose.Types.ObjectId(staffId),
    status: { $in: ["confirmed", "pending"] },
    start_datetime: { $lt: end.toJSDate() },
    end_datetime:   { $gt: start.toJSDate() },
  };
  if (ignoreBookingId) q._id = { $ne: ignoreBookingId };

  const conflict = await Booking.findOne(q).lean();
  if (conflict) throw new Error("Overlaps another booking");
}

import { DateTime } from "luxon";
import Booking from "../../models/Booking.js";

export async function summary(req, res) {
  const now = DateTime.now();
  const start = now.startOf("day").toJSDate();
  const end   = now.endOf("day").toJSDate();

  const today = await Booking.find({ start_datetime: { $gte: start, $lte: end } }).lean();

  const kpis = {
    todaysBookings: today.length,
    pendingActions: today.filter(b => b.status === "pending").length,
    noShows: today.filter(b => b.status === "no_show").length,
  };

  const schedule = today
    .sort((a,b) => new Date(a.start_datetime) - new Date(b.start_datetime))
    .map(b => ({
      id: b._id,
      start: b.start_datetime,
      end: b.end_datetime,
      status: b.status,
      service: b.service_name_snapshot,
      staff_id: b.staff_id
    }));

  res.json({ kpis, schedule });
}

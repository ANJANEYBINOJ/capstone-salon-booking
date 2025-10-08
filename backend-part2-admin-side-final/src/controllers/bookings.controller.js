import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

export async function createBooking(req, res, next) {
  const { service_id, staff_id, start_datetime } = req.body;
  if (!service_id || !start_datetime) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "service_id and start_datetime required" }});

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const svc = await Service.findById(service_id).session(session);
    if (!svc) throw { status: 404, message: "Service not found" };

    const start = new Date(start_datetime);
    const end = new Date(start.getTime() + svc.duration_minutes * 60000);

    // Double-booking guard (server-side overlap check inside the txn)
    const overlap = await Booking.findOne({
      staff_id,
      status: { $nin: ["cancelled", "no_show"] },
      start_datetime: { $lt: end },
      end_datetime:   { $gt: start }
    }).session(session);

    if (overlap) throw { status: 409, code: "DOUBLE_BOOK", message: "Selected slot is no longer available" };

    const booking = await Booking.create([{
      customer_id: req.user.id,
      service_id, staff_id: staff_id || null,
      start_datetime: start,
      end_datetime: end,
      status: "confirmed",
      price_snapshot: svc.base_price
    }], { session });

    await session.commitTransaction();
    res.status(201).json(booking[0]);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

export async function getMyBookings(req, res) {
  const { page = 1, limit = 20, status } = req.query;
  const q = { customer_id: req.user.id };
  if (status) q.status = status;
  const [items, total] = await Promise.all([
    Booking.find(q).sort({ start_datetime: -1 }).skip((page-1)*limit).limit(Number(limit)),
    Booking.countDocuments(q)
  ]);
  res.json({ items, total });
}

export async function getBooking(req, res) {
  const b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Booking not found" }});
  if (String(b.customer_id) !== req.user.id) return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not yours" }});
  res.json(b);
}

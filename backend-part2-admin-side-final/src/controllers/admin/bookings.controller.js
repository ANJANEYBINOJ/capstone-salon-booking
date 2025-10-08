// src/controllers/admin/bookings.controller.js
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import { assertSlotIsBookable } from "../../utils/scheduling.js";

// helper: populate names for UI
const populateAll = (q) =>
  q
    .populate({ path: "customer_id", select: "name email" })
    .populate({ path: "service_id",  select: "name duration_minutes base_price" })
    .populate({ path: "staff_id",    select: "name title" });

const parseISO = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

export async function list(req, res) {
  const { from, to, status, serviceId, staffId } = req.query;
  const q = {};
  if (status) q.status = status;
  if (serviceId) q.service_id = serviceId;
  if (staffId) q.staff_id = staffId;

  const f = parseISO(from);
  const t = parseISO(to);
  if ((from && !f) || (to && !t)) {
    return res
      .status(400)
      .json({ error: { code: "BAD_DATE", message: "from/to must be ISO dates" } });
  }
  if (f || t) {
    q.start_datetime = {};
    if (f) q.start_datetime.$gte = f;
    if (t) q.start_datetime.$lte = t;
  }

  const items = await populateAll(
    Booking.find(q).sort({ start_datetime: 1 })
  ).lean();

  res.json({ items });
}

export async function cancel(req, res) {
  const b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ error: { code: "NOT_FOUND" } });
  if (["cancelled", "completed", "no_show"].includes(b.status)) {
    return res
      .status(400)
      .json({ error: { code: "INVALID_STATE", message: "Cannot cancel" } });
  }
  b.status = "cancelled";
  b.cancelled_at = new Date();
  b.cancelled_by = "admin";
  b.cancel_reason = req.body?.reason ?? b.cancel_reason;
  await b.save();

  const populated = await populateAll(Booking.findById(b._id)).lean();
  res.json(populated);
}

export async function noShow(req, res) {
  const b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ error: { code: "NOT_FOUND" } });
  if (["cancelled", "completed"].includes(b.status)) {
    return res.status(400).json({ error: { code: "INVALID_STATE" } });
  }
  b.status = "no_show";
  b.no_show_marked_at = new Date();
  await b.save();

  const populated = await populateAll(Booking.findById(b._id)).lean();
  res.json(populated);
}

export async function reschedule(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ error: { code: "NOT_FOUND" } });

  const staffId = req.body.staff_id || b.staff_id;
  const startISO = req.body.start_datetime;

  // return a friendly 400 instead of crashing the server
  try {
    await assertSlotIsBookable({
      staffId,
      serviceId: b.service_id,
      startISO,
      tz: "UTC",
      ignoreBookingId: b._id,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: { code: "INVALID_SLOT", message: err.message } });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      b.rescheduled_from = b.start_datetime;
      b.staff_id = staffId;
      b.start_datetime = new Date(startISO);
      await b.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const populated = await populateAll(Booking.findById(b._id)).lean();
  res.json(populated);
}

// src/controllers/admin/bookings.controller.js
export async function calendar(req, res) {
  const f = parseISO(req.query.from);
  const t = parseISO(req.query.to);
  if (!f || !t) {
    return res
      .status(400)
      .json({ error: { code: "BAD_DATE", message: "from/to are required ISO dates" } });
  }

  const { staffId, serviceId, status } = req.query;

  const q = {
    // return any booking that overlaps the window
    start_datetime: { $lt: t },
    end_datetime:   { $gt: f },
  };
  if (staffId)   q.staff_id = staffId;
  if (serviceId) q.service_id = serviceId;
  if (status)    q.status = status; // "pending","confirmed","completed","no_show","cancelled"

  const items = await Booking.find(q)
    .select("_id start_datetime end_datetime staff_id service_id status service_name_snapshot")
    .lean();

  const events = items.map(b => ({
    id: b._id,
    start: b.start_datetime,
    end: b.end_datetime,
    staff_id: b.staff_id,
    service_id: b.service_id,
    status: b.status,
    title: b.service_name_snapshot || "Appointment",
  }));

  res.json({ events });
}

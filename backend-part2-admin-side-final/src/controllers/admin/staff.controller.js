import { validationResult } from "express-validator";
import Staff from "../../models/Staff.js";
import StaffAvailability from "../../models/StaffAvailability.js";

export async function list(req, res) {
  const items = await Staff.find({}).sort({ createdAt: -1 }).lean();
  res.json({ items });
}
export async function detail(req, res) {
  const item = await Staff.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: { code: "NOT_FOUND" }});
  res.json(item);
}
export async function create(req, res) {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = await Staff.create({
    name: req.body.name,
    title: req.body.title ?? "",
    active: true,
    service_ids: req.body.service_ids ?? [],
  });
  res.status(201).json(item);
}
export async function update(req, res) {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ error: { code: "NOT_FOUND" }});
  res.json(item);
}
export async function remove(req, res) {
  const item = await Staff.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: { code: "NOT_FOUND" }});
  await StaffAvailability.deleteMany({ staff_id: item._id });
  res.json({ ok: true });
}

// ------- Availability (Mon=1 .. Sun=7) -------
export async function getAvailability(req, res) {
  const weeks = await StaffAvailability.find({ staff_id: req.params.id }).lean();
  res.json({ week: weeks });
}

export async function setAvailability(req, res) {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { week } = req.body;
  // week: [{ weekday:1, start_time:"10:00", end_time:"18:00", breaks:[{start:"13:00", end:"14:00"}] }, ...]
  await StaffAvailability.deleteMany({ staff_id: req.params.id });
  const insert = week.map(w => ({ ...w, staff_id: req.params.id }));
  await StaffAvailability.insertMany(insert);
  const saved = await StaffAvailability.find({ staff_id: req.params.id }).lean();
  res.json({ week: saved });
}

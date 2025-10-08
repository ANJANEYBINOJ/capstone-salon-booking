import { validationResult } from "express-validator";
import Service from "../../models/Service.js";

export async function list(req, res) {
  const items = await Service.find({}).sort({ createdAt: -1 }).lean();
  res.json({ items });
}
export async function detail(req, res) {
  const item = await Service.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: { code: "NOT_FOUND" }});
  res.json(item);
}
export async function create(req, res) {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = await Service.create({
    name: req.body.name,
    category_id: req.body.category_id,
    description: req.body.description ?? "",
    duration_minutes: req.body.duration_minutes,
    base_price: req.body.base_price,
    active: req.body.active ?? true,
  });
  res.status(201).json(item);
}
export async function update(req, res) {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ error: { code: "NOT_FOUND" }});
  res.json(item);
}
export async function remove(req, res) {
  const item = await Service.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: { code: "NOT_FOUND" }});
  res.json({ ok: true });
}

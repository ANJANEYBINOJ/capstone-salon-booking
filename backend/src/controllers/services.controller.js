import Service from "../models/Service.js";
import Staff from "../models/Staff.js";

export async function listServices(req, res) {
  const { categoryId, durationMin, durationMax, page = 1, limit = 20 } = req.query;
  const q = { active: true };
  if (categoryId) q.category_id = categoryId;
  if (durationMin || durationMax) q.duration_minutes = {
    ...(durationMin && { $gte: Number(durationMin) }),
    ...(durationMax && { $lte: Number(durationMax) })
  };
  const [items, total] = await Promise.all([
    Service.find(q).sort({ name: 1 }).skip((page-1)*limit).limit(Number(limit)),
    Service.countDocuments(q)
  ]);
  res.json({ items, total });
}

export async function getService(req, res) {
  const svc = await Service.findById(req.params.id);
  if (!svc) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Service not found" }});
  res.json(svc);
}

export async function getServiceStaff(req, res) {
  const staff = await Staff.find({ service_ids: req.params.id, active: true })
                           .select("_id name title");
  res.json(staff);
}

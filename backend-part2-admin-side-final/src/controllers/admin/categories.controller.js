import { validationResult } from "express-validator";
import ServiceCategory from "../../models/ServiceCategory.js";

// ✅ Get all categories
export async function list(req, res) {
  try {
    const items = await ServiceCategory.find().sort({ display_order: 1 }).lean();
    res.json({ items });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: { message: "Failed to fetch categories" } });
  }
}

// ✅ Get single category
export async function detail(req, res) {
  const item = await ServiceCategory.findById(req.params.id).lean();
  if (!item)
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Category not found" } });
  res.json(item);
}

// ✅ Create new category
export async function create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const item = await ServiceCategory.create({
      name: req.body.name,
      description: req.body.description ?? "",
      display_order: req.body.display_order ?? 0,
    });
    res.status(201).json(item);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: { message: "Failed to create category" } });
  }
}

// ✅ Update category
export async function update(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const item = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item)
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Category not found" } });
  res.json(item);
}

// ✅ Delete category
export async function remove(req, res) {
  const item = await ServiceCategory.findByIdAndDelete(req.params.id);
  if (!item)
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Category not found" } });
  res.json({ ok: true });
}

// src/controllers/me.controller.js
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function getProfile(req, res) {
  const u = await User.findById(req.user.id).select("_id name email phone role");
  if (!u) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
  res.json({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role });
}

export async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email } = req.body;

  const u = await User.findById(req.user.id);
  if (!u) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });

  // If email is changing, ensure unique
  if (email && email !== u.email) {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: { code: "EMAIL_EXISTS", message: "Email already in use" } });
    u.email = email;
  }

  if (name) u.name = name;

  await u.save();
  res.json({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role });
}

export async function changePassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { old_password, new_password } = req.body;

  const u = await User.findById(req.user.id).select("+password_hash");
  if (!u) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });

  const ok = await bcrypt.compare(old_password, u.password_hash);
  if (!ok) {
    return res.status(400).json({ error: { code: "BAD_OLD_PASSWORD", message: "Old password is incorrect" } });
  }

  u.password_hash = await bcrypt.hash(new_password, 10);
  await u.save();

  res.json({ ok: true });
}

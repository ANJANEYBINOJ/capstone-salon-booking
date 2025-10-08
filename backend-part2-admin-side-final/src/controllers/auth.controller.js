// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const WEEK = 7 * 24 * 60 * 60 * 1000;

export async function register(req, res) {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: { code: "EMAIL_EXISTS", message: "Email already in use" }});
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, password_hash });
  res.status(201).json({ id: user._id });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: { code: "BAD_CREDENTIALS", message: "Invalid email or password" }});
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: { code: "BAD_CREDENTIALS", message: "Invalid email or password" }});

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true", // false on localhost, true in prod HTTPS
    maxAge: WEEK,
  });

  res.json({ id: user._id, role: user.role, name: user.name });
}

// NEW: return current user (uses cookie)
export async function me(req, res) {
  const user = await User.findById(req.user.id).select("_id name email role");
  if (!user) return res.status(401).json({ error: { code: "UNAUTHENTICATED" }});
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
}

export async function logout(_req, res) {
  res.clearCookie("token", { sameSite: "lax", secure: process.env.COOKIE_SECURE === "true" });
  res.json({ ok: true });
}

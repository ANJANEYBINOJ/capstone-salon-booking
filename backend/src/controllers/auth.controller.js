import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
  // httpOnly cookie (can also support Authorization header)
  res.cookie("token", token, { httpOnly: true, secure: process.env.COOKIE_SECURE === "true", sameSite: "lax" });
  res.json({ id: user._id, role: user.role, name: user.name });
}

export async function logout(_req, res) {
  res.clearCookie("token");
  res.json({ ok: true });
}

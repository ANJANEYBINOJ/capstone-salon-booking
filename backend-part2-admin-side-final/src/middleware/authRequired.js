// src/middleware/authRequired.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authRequired(req, res, next) {
  try {
    // 1) read token from cookie or Authorization header
    const raw =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!raw) {
      return res.status(401).json({
        error: { code: "UNAUTHENTICATED", message: "Login required" },
      });
    }

    // 2) verify JWT
    const payload = jwt.verify(raw, process.env.JWT_SECRET);

    // 3) ensure user still exists/is active
    const user = await User.findById(payload.id)
      .select("_id name email role active")
      .lean();

    if (!user || user.active === false) {
      return res.status(401).json({
        error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
      });
    }

    // 4) attach to request for downstream handlers
    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
    });
  }
}

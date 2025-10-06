import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ","");
  if (!token) return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Login required" } });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // {id, role}
    next();
  } catch {
    return res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Invalid or expired token" } });
  }
}

export function allowRoles(...roles) {
  return (req, _res, next) => (roles.includes(req.user?.role) ? next() : next({ status: 403, message: "Forbidden" }));
}

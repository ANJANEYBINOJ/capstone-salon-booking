export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({ error: { code: err.code || "SERVER_ERROR", message: err.message || "Server error" } });
}

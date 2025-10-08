// routes/auth.routes.js (or wherever you wire auth)
import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { register, login, logout, me } from "../controllers/auth.controller.js";

const r = Router();
r.post("/auth/register", register);
r.post("/auth/login", login);
r.post("/auth/logout", logout);
r.get("/auth/me", authRequired, me);
export default r;

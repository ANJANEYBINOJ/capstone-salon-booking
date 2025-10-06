import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { getMyBookings } from "../controllers/bookings.controller.js";
const r = Router();
r.get("/bookings", authRequired, getMyBookings);
export default r;

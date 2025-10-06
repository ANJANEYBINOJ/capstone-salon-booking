import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { createBooking, getBooking } from "../controllers/bookings.controller.js";
const r = Router();
r.post("/", authRequired, createBooking);
r.get("/:id", authRequired, getBooking);
export default r;

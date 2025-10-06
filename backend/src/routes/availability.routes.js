import { Router } from "express";
import { getAvailability } from "../controllers/availability.controller.js";
const r = Router();
r.get("/", getAvailability);
export default r;

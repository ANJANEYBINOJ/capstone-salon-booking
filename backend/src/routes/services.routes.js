import { Router } from "express";
import { listServices, getService, getServiceStaff } from "../controllers/services.controller.js";
const r = Router();
r.get("/", listServices);
r.get("/:id", getService);
r.get("/:id/staff", getServiceStaff);
export default r;

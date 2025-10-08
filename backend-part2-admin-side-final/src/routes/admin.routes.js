import { Router } from "express";
import { body, param, query } from "express-validator";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

import * as svc from "../controllers/admin/services.controller.js";
import * as staff from "../controllers/admin/staff.controller.js";
import * as book from "../controllers/admin/bookings.controller.js";
import * as dash from "../controllers/admin/dashboard.controller.js";
import * as cat from "../controllers/admin/categories.controller.js";
const r = Router();
r.use(authRequired, requireRole("admin"));
// ---- Categories ----
r.get("/categories", cat.list);
r.get("/categories/:id", param("id").isMongoId(), cat.detail);
r.post(
  "/categories",
  body("name").isString().trim().notEmpty(),
  body("description").optional().isString(),
  body("display_order").optional().isInt({ min: 0 }),
  cat.create
);
r.patch(
  "/categories/:id",
  param("id").isMongoId(),
  body("name").optional().isString(),
  body("description").optional().isString(),
  body("display_order").optional().isInt({ min: 0 }),
  cat.update
);
r.delete("/categories/:id", param("id").isMongoId(), cat.remove);



// ---- Services ----
r.get("/services", svc.list);
r.post("/services",
  body("name").isString().trim().notEmpty(),
  body("category_id").isMongoId(),
  body("duration_minutes").isInt({ min: 5 }),
  body("base_price").isInt({ min: 0 }),
  svc.create
);
r.get("/services/:id", param("id").isMongoId(), svc.detail);
r.patch("/services/:id",
  param("id").isMongoId(),
  body("name").optional().isString().trim(),
  body("duration_minutes").optional().isInt({ min: 5 }),
  body("base_price").optional().isInt({ min: 0 }),
  body("active").optional().isBoolean(),
  svc.update
);
r.delete("/services/:id", param("id").isMongoId(), svc.remove);

// ---- Staff ----
r.get("/staff", staff.list);
r.post("/staff",
  body("name").isString().trim().notEmpty(),
  body("title").optional().isString(),
  body("service_ids").optional().isArray(),
  staff.create
);
r.get("/staff/:id", param("id").isMongoId(), staff.detail);
r.patch("/staff/:id",
  param("id").isMongoId(),
  body("name").optional().isString().trim(),
  body("title").optional().isString(),
  body("active").optional().isBoolean(),
  body("service_ids").optional().isArray(),
  staff.update
);
r.delete("/staff/:id", param("id").isMongoId(), staff.remove);

// Availability (weekly)
r.get("/staff/:id/availability", param("id").isMongoId(), staff.getAvailability);
r.put("/staff/:id/availability",
  param("id").isMongoId(),
  body("week").isArray({ min: 1 }).withMessage("Provide Mon–Sun entries present for active days"),
  staff.setAvailability
);

// ---- Bookings (admin) ----
r.get("/bookings",
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("status").optional().isIn(["pending","confirmed","cancelled","no_show","completed"]),
  query("serviceId").optional().isMongoId(),
  query("staffId").optional().isMongoId(),
  book.list
);
r.patch("/bookings/:id/cancel",
  param("id").isMongoId(),
  body("reason").optional().isString(),
  book.cancel
);
r.patch("/bookings/:id/no-show", param("id").isMongoId(), book.noShow);
r.patch("/bookings/:id/reschedule",
  param("id").isMongoId(),
  body("start_datetime").isISO8601(),
  body("staff_id").optional().isMongoId(),
  book.reschedule
);

// ---- Dashboard & Calendar ----
r.get("/dashboard/summary", dash.summary); // KPIs + today schedule
r.get("/calendar",
  query("from").isISO8601(),
  query("to").isISO8601(),
  book.calendar // events for grid
);

export default r;

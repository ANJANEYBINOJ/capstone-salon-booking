
// src/routes/me.routes.js
import { Router } from "express";
import { body } from "express-validator";
import { authRequired } from "../middleware/auth.js";
import { getProfile, updateProfile, changePassword } from "../controllers/me.controller.js";
import { getMyBookings } from "../controllers/bookings.controller.js";
const r = Router();
r.use(authRequired);

r.get("/bookings", getMyBookings);

// Profile
r.get("/profile", getProfile);
r.patch(
  "/profile",
  body("name").optional().isString().isLength({ min: 2 }).withMessage("Name too short"),
  body("email").optional().isEmail().withMessage("Invalid email"),
  updateProfile
);

// Password
r.patch(
  "/password",
  body("old_password").isString().isLength({ min: 6 }),
  body("new_password").isString().isLength({ min: 6 }).withMessage("Min 6 chars"),
  changePassword
);


export default r;

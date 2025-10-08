import "dotenv/config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import meRoutes from "./routes/me.routes.js";
import { errorHandler } from "./middleware/error.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(cors({ origin: true, credentials: true })); // tighten in prod per spec
app.use(cookieParser());
app.use(express.json());

// Mount routes (prefixes from requirements)
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/services", servicesRoutes);
app.use("/availability", availabilityRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/me", meRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
});

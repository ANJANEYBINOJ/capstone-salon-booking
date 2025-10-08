import mongoose from "mongoose";
import Service from "./Service.js"; // only needed if you keep the hook

const schema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    service_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    staff_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Staff", index: true },

    start_datetime: { type: Date, index: true, required: true },
    end_datetime:   { type: Date, required: true },

    // status already admin-friendly
    status: { type: String, enum: ["pending","confirmed","cancelled","completed","no_show"], default: "confirmed" },

    // snapshots
    price_snapshot: { type: Number, required: true, min: 0 },
    duration_minutes_snapshot: { type: Number },     // optional
    service_name_snapshot: String,                   // optional

    // notes/audit (optional)
    notes: String,
    admin_note: String,
    cancel_reason: String,
    cancelled_by: { type: String, enum: ["customer","admin"] },
    cancelled_at: Date,
    no_show_marked_at: Date,
    rescheduled_from: Date,
    reschedule_count: { type: Number, default: 0 },

    source: { type: String, enum: ["web","admin","walkin"], default: "web" }, // optional
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// helpful indexes
schema.index({ staff_id: 1, start_datetime: 1, end_datetime: 1 });
schema.index({ customer_id: 1, start_datetime: -1 });

// keep end up-to-date on create/reschedule (optional but recommended)
schema.pre("validate", async function(next) {
  if (this.isModified("start_datetime") || this.isModified("service_id")) {
    let minutes = this.duration_minutes_snapshot;
    if (!minutes) {
      const svc = await Service.findById(this.service_id).select("duration_minutes name");
      if (!svc) return next(new Error("Service not found"));
      minutes = svc.duration_minutes;
      this.duration_minutes_snapshot = minutes;
      if (!this.service_name_snapshot) this.service_name_snapshot = svc.name;
    }
    this.end_datetime = new Date(this.start_datetime.getTime() + minutes * 60000);
  }
  next();
});

export default mongoose.model("Booking", schema);

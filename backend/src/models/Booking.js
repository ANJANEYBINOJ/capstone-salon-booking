import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    service_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    staff_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Staff", index: true },
    start_datetime: { type: Date, index: true, required: true },
    end_datetime:   { type: Date, required: true },
    status: { type: String, enum: ["pending","confirmed","cancelled","completed","no_show"], default: "confirmed" },
    price_snapshot: { type: Number, required: true, min: 0 },
    notes: String
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Helpful compound index for overlap checks
schema.index({ staff_id: 1, start_datetime: 1 });

export default mongoose.model("Booking", schema);

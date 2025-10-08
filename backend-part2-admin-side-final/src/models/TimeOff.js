import mongoose from "mongoose";
const schema = new mongoose.Schema({
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", index: true, required: true },
  date: { type: Date, required: true, index: true },
  all_day: { type: Boolean, default: true },
  start_time: { type: String },
  end_time: { type: String },
  reason: String
});
schema.index({ staff_id: 1, date: 1 });
export default mongoose.model("TimeOff", schema);

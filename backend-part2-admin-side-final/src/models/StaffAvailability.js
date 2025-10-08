import mongoose from "mongoose";
const breakSchema = new mongoose.Schema({
  start: { type: String, match: /^\d{2}:\d{2}$/ },
  end:   { type: String, match: /^\d{2}:\d{2}$/ }
}, {_id:false});

const schema = new mongoose.Schema({
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", index: true, required: true },
  weekday: { type: Number, min: 0, max: 6, required: true }, // 0=Sun
  start_time: { type: String, match: /^\d{2}:\d{2}$/, required: true },
  end_time:   { type: String, match: /^\d{2}:\d{2}$/, required: true },
  breaks: [breakSchema],
  effective_from: Date,
  effective_to: Date
});
schema.index({ staff_id: 1, weekday: 1 });
export default mongoose.model("StaffAvailability", schema);

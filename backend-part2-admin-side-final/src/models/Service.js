import mongoose from "mongoose";
const schema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", index: true, required: true },
  name: { type: String, required: true },
  description: String,
  duration_minutes: { type: Number, required: true, min: 5 },
  base_price: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true }
});
export default mongoose.model("Service", schema);

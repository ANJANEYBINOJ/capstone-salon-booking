import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  display_order: { type: Number, default: 0 }
});
export default mongoose.model("ServiceCategory", schema);

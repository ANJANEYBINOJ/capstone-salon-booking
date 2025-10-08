import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  title: String,
  bio: String,
  photo_url: String,
  active: { type: Boolean, default: true },
  service_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }]
});
export default mongoose.model("Staff", schema);

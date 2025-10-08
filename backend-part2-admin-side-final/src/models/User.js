import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: String,
    password_hash: { type: String, required: true },
    status: { type: String, enum: ["active", "invited", "disabled"], default: "active" }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model("User", userSchema);

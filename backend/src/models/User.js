import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  demoBalance: { type: Number, default: 10000 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

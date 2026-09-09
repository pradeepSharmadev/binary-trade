import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  direction: { type: String, enum: ["UP", "DOWN"], required: true },
  amount: { type: Number, required: true, min: 1 },
  entryPrice: { type: Number, required: true },
  expiryPrice: { type: Number, default: null },
  expiryAt: { type: Date, required: true },
  payoutRate: { type: Number, default: 0.8 },
  result: { type: String, enum: ["OPEN", "WIN", "LOSS", "DRAW"], default: "OPEN" },
  payout: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  settledAt: { type: Date, default: null }
});

tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ result: 1, expiryAt: 1 });

export default mongoose.model("Trade", tradeSchema);

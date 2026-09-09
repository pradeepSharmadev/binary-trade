import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["INITIAL", "STAKE", "PAYOUT", "REFUND"], required: true },
  amount: { type: Number, required: true },
  tradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Trade", default: null },
  balanceAfter: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

ledgerSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("LedgerEntry", ledgerSchema);

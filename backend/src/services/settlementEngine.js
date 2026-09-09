import Trade from "../models/Trade.js";
import { getPrice } from "./marketEngine.js";
import { credit } from "./ledgerService.js";

export async function settleExpiredTrades(io) {
  const trades = await Trade.find({
    result: "OPEN",
    expiryAt: { $lte: new Date() }
  }).limit(100);

  for (const trade of trades) {
    const expiryPrice = getPrice(trade.symbol);
    if (expiryPrice == null) continue;

    let result = "DRAW";
    if (expiryPrice > trade.entryPrice) result = trade.direction === "UP" ? "WIN" : "LOSS";
    if (expiryPrice < trade.entryPrice) result = trade.direction === "DOWN" ? "WIN" : "LOSS";

    let payout = 0;
    if (result === "WIN") payout = Number((trade.amount * (1 + trade.payoutRate)).toFixed(2));
    if (result === "DRAW") payout = trade.amount;

    trade.expiryPrice = expiryPrice;
    trade.result = result;
    trade.payout = payout;
    trade.settledAt = new Date();
    await trade.save();

    if (payout > 0) await credit(trade.userId, payout, trade._id, result === "DRAW" ? "REFUND" : "PAYOUT");

    io.to(String(trade.userId)).emit("trade:settled", {
      tradeId: String(trade._id),
      result,
      payout,
      expiryPrice
    });
  }
}

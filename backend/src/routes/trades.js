import express from "express";
import Trade from "../models/Trade.js";
import { auth } from "../middleware/auth.js";
import { symbols, getPrice } from "../services/marketEngine.js";
import { debitStake } from "../services/ledgerService.js";

const router = express.Router();

// get trades
router.get("/", auth, async (req, res) => {
  const trades = await Trade.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(trades);
});

// create trade
router.post("/", auth, async (req, res) => {
  try {
    const symbol = String(req.body.symbol || "").toUpperCase();
    const direction = String(req.body.direction || "").toUpperCase();
    const amount = Number(req.body.amount);
    const expirySeconds = Number(req.body.expirySeconds);

    if (!symbols.includes(symbol)) return res.status(400).json({ message: "Invalid symbol" });
    if (!["UP", "DOWN"].includes(direction)) return res.status(400).json({ message: "Invalid direction" });
    if (![30, 60, 300].includes(expirySeconds)) return res.status(400).json({ message: "Invalid expiry" });
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000) return res.status(400).json({ message: "Amount must be between $1 and $10,000" });

    const entryPrice = getPrice(symbol);
    const trade = await Trade.create({
      userId: req.user._id,
      symbol,
      direction,
      amount: Number(amount.toFixed(2)),
      entryPrice,
      expiryAt: new Date(Date.now() + expirySeconds * 1000),
      payoutRate: 0.8
    });

    const balance = await debitStake(req.user._id, trade.amount, trade._id);
    res.status(201).json({ trade, balance });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;

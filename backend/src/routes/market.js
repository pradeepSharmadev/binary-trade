import express from "express";
import { symbols, getPrice, getCandles } from "../services/marketEngine.js";

const router = express.Router();

router.get("/", (req, res) => {
  const prices = Object.fromEntries(symbols.map(s => [s, getPrice(s)]));
  res.json({ symbols, prices });
});

router.get("/:symbol/candles", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  if (!symbols.includes(symbol)) return res.status(404).json({ message: "Unknown symbol" });
  res.json(getCandles(symbol));
});

export default router;

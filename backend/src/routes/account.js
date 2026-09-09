import express from "express";
import { auth } from "../middleware/auth.js";
import LedgerEntry from "../models/LedgerEntry.js";

const router = express.Router();

// get ledger entry of user send demo balance and 50 ledger entries
router.get("/", auth, async (req, res) => {
  const ledger = await LedgerEntry.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ balance: req.user.demoBalance, ledger });
});

export default router;

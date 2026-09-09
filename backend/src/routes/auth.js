import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";
import { recordInitialBalance } from "../services/ledgerService.js";

const router = express.Router();

function tokenFor(user) {
  return jwt.sign({ userId: user._id.toString() }, config.jwtSecret, { expiresIn: "7d" });
}

// auth register
router.post("/register", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || password.length < 6) {
      return res.status(400).json({ message: "Valid email and password (6+ chars) required" });
    }

    if (await User.exists({ email })) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, demoBalance: 10000 });
    await recordInitialBalance(user);

    res.json({
      token: tokenFor(user),
      user: { id: String(user._id), email: user.email, demoBalance: user.demoBalance }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// auth login
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: tokenFor(user),
      user: { id: String(user._id), email: user.email, demoBalance: user.demoBalance }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

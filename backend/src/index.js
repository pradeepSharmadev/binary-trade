import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import marketRoutes from "./routes/market.js";
import accountRoutes from "./routes/account.js";
import tradeRoutes from "./routes/trades.js";
import { symbols, tick, getPrice } from "./services/marketEngine.js";
import { settleExpiredTrades } from "./services/settlementEngine.js";

// create express app
const app = express();

// create http server
const server = http.createServer(app);

// create socket server
const io = new Server(server, { cors: { origin: config.clientUrl } });

// app uses CORS origin and setup middlewares
app.use(cors({ origin: config.clientUrl }));
app.use(express.json());

// define routes
app.get("/api/health", (_, res) => res.json({ ok: true }));

// services routes
app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/trades", tradeRoutes);

// initialize io connection event
io.on("connection", (socket) => {
  socket.on("auth:join", (userId) => {
    if (userId) socket.join(String(userId));
  });
});

// main function handle the mongodb call and on every interval server pings updated prices
// listen server rest db connect and then ping update
async function main() {
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB connected");

  setInterval(async () => {
    const updates = tick();
    const prices = Object.fromEntries(symbols.map((s) => [s, getPrice(s)]));
    io.emit("market:update", { prices, updates });
    try {
      await settleExpiredTrades(io);
    } catch (e) {
      console.error("Settlement error:", e);
    }
  }, 700);

  server.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

// safely call the main function to start the server and catch error
main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import React, { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock3,
  CircleHelp,
} from "lucide-react";
import { API } from "../services/api";
import { socket } from "../socket";
import CandleChart from "../components/CandleChart";

//default symbols and names of supported digital coin/currency
const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD"];
const NAMES = {
  EURUSD: "EUR / USD",
  GBPUSD: "GBP / USD",
  USDJPY: "USD / JPY",
  XAUUSD: "Gold / USD",
  BTCUSD: "BTC / USD",
};

const Dashboard = ({ user, onLogout }) => {
  const [symbol, setSymbol] = useState("EURUSD");
  const [prices, setPrices] = useState({});
  const [candles, setCandles] = useState([]);
  const [amount, setAmount] = useState(10);
  const [expiry, setExpiry] = useState(60);
  const [balance, setBalance] = useState(user.demoBalance);
  const [trades, setTrades] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [notice, setNotice] = useState("");

  async function load() {
    const [m, c, t, a] = await Promise.all([
      API.get("/market"),
      API.get(`/market/${symbol}/candles`),
      API.get("/trades"),
      API.get("/account"),
    ]);
    setPrices(m.data.prices);
    setCandles(c.data);
    setTrades(t.data);
    setBalance(a.data.balance);
  }

  useEffect(() => {
    load();
  }, [symbol]);

  useEffect(() => {
    socket.emit("auth:join", user.id);
    const onMarket = ({ prices, updates }) => {
      setPrices(prices);
      const update = updates[symbol];
      if (update) {
        setCandles((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (!last || last.time !== update.candle.time)
            next.push(update.candle);
          else next[next.length - 1] = update.candle;
          return next.slice(-240);
        });
      }
    };
    const onSettled = ({ result, payout }) => {
      setNotice(
        result === "WIN"
          ? `Trade won — payout $${payout.toFixed(2)}`
          : result === "DRAW"
            ? "Trade refunded at expiry."
            : "Trade expired — loss.",
      );
      load();
      setTimeout(() => setNotice(""), 4500);
    };
    socket.on("market:update", onMarket);
    socket.on("trade:settled", onSettled);
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => {
      socket.off("market:update", onMarket);
      socket.off("trade:settled", onSettled);
      clearInterval(timer);
    };
  }, [symbol, user.id]);

  const current = prices[symbol];
  const openTrades = trades.filter((t) => t.result === "OPEN");
  const recentTrades = trades.filter((t) => t.result !== "OPEN").slice(0, 10);

  async function place(direction) {
    try {
      const { data } = await API.post("/trades", {
        symbol,
        direction,
        amount: Number(amount),
        expirySeconds: expiry,
      });
      setBalance(data.balance);
      setTrades((prev) => [data.trade, ...prev]);
      setNotice(`${direction} contract opened at ${data.trade.entryPrice}`);
      setTimeout(() => setNotice(""), 3000);
    } catch (e) {
      setNotice(e.response?.data?.message || "Could not open trade");
    }
  }

  function remaining(expiryAt) {
    return Math.max(0, Math.ceil((new Date(expiryAt).getTime() - now) / 1000));
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Binary-Trade</div>
        <div className="demo-pill">DEMO ACCOUNT</div>
        <div className="top-actions">
          <div className="balance">
            <Wallet size={16} /> ${balance.toFixed(2)}
          </div>
          <button className="icon-btn" title="Demo only">
            <CircleHelp size={18} />
          </button>
          <button className="icon-btn" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {notice && <div className="toast">{notice}</div>}

      <main className="layout">
        <aside className="sidebar">
          <div className="side-title">MARKETS</div>
          {SYMBOLS.map((s) => (
            <button
              key={s}
              className={`market ${s === symbol ? "active" : ""}`}
              onClick={() => setSymbol(s)}
            >
              <span>
                <b>{NAMES[s]}</b>
                <small>{s}</small>
              </span>
              <strong>{prices[s] ?? "—"}</strong>
            </button>
          ))}
        </aside>

        <section className="workspace">
          <div className="instrument">
            <div>
              <div className="eyebrow">MARKET</div>
              <h1>{NAMES[symbol]}</h1>
            </div>
            <div className="live-price">
              <span className="dot"></span>
              {current ?? "—"}
            </div>
          </div>

          <CandleChart candles={candles} symbol={symbol} />

          <section className="contracts">
            <div className="section-head">
              <h2>Open contracts</h2>
              <span>{openTrades.length} active</span>
            </div>
            {openTrades.length === 0 ? (
              <div className="empty">No open contracts</div>
            ) : (
              openTrades.map((t) => (
                <div className="contract-row" key={t._id}>
                  <span
                    className={t.direction === "UP" ? "up-text" : "down-text"}
                  >
                    {t.direction === "UP" ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}{" "}
                    {t.symbol}
                  </span>
                  <span>Entry {t.entryPrice}</span>
                  <span>${t.amount.toFixed(2)}</span>
                  <span className="countdown">
                    <Clock3 size={15} /> {remaining(t.expiryAt)}s
                  </span>
                </div>
              ))
            )}
          </section>

          <section className="contracts">
            <div className="section-head">
              <h2>History</h2>
              <span>Latest 10</span>
            </div>
            {recentTrades.length === 0 ? (
              <div className="empty">
                Your completed contracts will appear here.
              </div>
            ) : (
              recentTrades.map((t) => (
                <div className="contract-row history-row" key={t._id}>
                  <span
                    className={t.direction === "UP" ? "up-text" : "down-text"}
                  >
                    {t.direction}
                  </span>
                  <span>{t.symbol}</span>
                  <span>${t.amount.toFixed(2)}</span>
                  <span
                    className={
                      t.result === "WIN"
                        ? "up-text"
                        : t.result === "LOSS"
                          ? "down-text"
                          : ""
                    }
                  >
                    {t.result}
                  </span>
                  <span>{t.payout ? `$${t.payout.toFixed(2)}` : "—"}</span>
                </div>
              ))
            )}
          </section>
        </section>

        <aside className="tradebox">
          <div className="side-title">NEW CONTRACT</div>
          <div className="selected-asset">
            <span>{NAMES[symbol]}</span>
            <strong>{current ?? "—"}</strong>
          </div>

          <label>Investment</label>
          <div className="amount-wrap">
            <span>$</span>
            <input
              type="number"
              min="1"
              max="10000"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <label>Expiry</label>
          <div className="expiry-grid">
            {[30, 60, 300].map((x) => (
              <button
                key={x}
                className={expiry === x ? "selected" : ""}
                onClick={() => setExpiry(x)}
              >
                {x < 60 ? `${x}s` : `${x / 60}m`}
              </button>
            ))}
          </div>

          <div className="payout">
            <span>Potential return</span>
            <strong>+80%</strong>
          </div>

          <button className="trade-btn up" onClick={() => place("UP")}>
            <TrendingUp /> UP
          </button>
          <button className="trade-btn down" onClick={() => place("DOWN")}>
            <TrendingDown /> DOWN
          </button>

          <p className="risk-note">
            Demo only. Prices are simulated and funds have no cash value.
          </p>
        </aside>
      </main>
    </div>
  );
}

export default Dashboard
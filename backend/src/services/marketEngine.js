// const definitions = {
//   EURUSD: { price: 1.17234001, decimals: 7, volatility: 0.00001802 },
//   GBPUSD: { price: 1.34621003, decimals: 7, volatility: 0.00002202 },
//   USDJPY: { price: 147.820006, decimals: 5, volatility: 0.003502 },
//   XAUUSD: { price: 3641.25005, decimals: 4, volatility: 0.12501 },
//   BTCUSD: { price: 111250.00003, decimals: 4, volatility: 4.50001 }
// };

// const state = {};

// for (const [symbol, def] of Object.entries(definitions)) {
//   state[symbol] = {
//     price: def.price,
//     candles: createSeedCandles(def.price, def.decimals, 120, def.volatility)
//   };
// }

// function round(n, decimals) {
//   return Number(n.toFixed(decimals));
// }

// function createSeedCandles(start, decimals, count, volatility) {
//   const candles = [];
//   let p = start;
//   const now = Math.floor(Date.now() / 1000);
//   for (let i = count; i > 0; i--) {
//     const time = now - i * 5;
//     const open = p;
//     const close = p + (Math.random() - 0.5) * volatility * 3;
//     const high = Math.max(open, close) + Math.random() * volatility;
//     const low = Math.min(open, close) - Math.random() * volatility;
//     p = close;
//     candles.push({
//       time,
//       open: round(open, decimals),
//       high: round(high, decimals),
//       low: round(low, decimals),
//       close: round(close, decimals)
//     });
//   }
//   return candles;
// }

// export const symbols = Object.keys(definitions);

// export function getPrice(symbol) {
//   return state[symbol]?.price ?? null;
// }

// export function getCandles(symbol) {
//   return state[symbol]?.candles ?? [];
// }

// export function tick() {
//   const updates = {};
//   const currentSecond = Math.floor(Date.now() / 1000);
//   const bucket = Math.floor(currentSecond / 5) * 5;

//   for (const [symbol, def] of Object.entries(definitions)) {
//     const s = state[symbol];
//     const previous = s.price;
//     const next = round(
//       Math.max(0.00001, previous + (Math.random() - 0.5) * def.volatility),
//       def.decimals
//     );
//     s.price = next;

//     let candle = s.candles[s.candles.length - 1];

//     if (!candle || candle.time !== bucket) {
//       candle = {
//         time: bucket,
//         open: previous,
//         high: Math.max(previous, next),
//         low: Math.min(previous, next),
//         close: next
//       };
//       s.candles.push(candle);
//       if (s.candles.length > 240) s.candles.shift();
//     } else {
//       candle.high = Math.max(candle.high, next);
//       candle.low = Math.min(candle.low, next);
//       candle.close = next;
//     }

//     updates[symbol] = { price: next, candle };
//   }

//   return updates;
// }

const definitions = {
  EURUSD: { price: 1.17234, decimals: 7, volatility: 0.000018 },
  GBPUSD: { price: 1.34621, decimals: 7, volatility: 0.000022 },
  USDJPY: { price: 147.82, decimals: 5, volatility: 0.0035 },
  XAUUSD: { price: 3641.25, decimals: 4, volatility: 0.125 },
  BTCUSD: { price: 111250.0, decimals: 4, volatility: 4.5 },
};

const state = {};

for (const [symbol, def] of Object.entries(definitions)) {
  state[symbol] = {
    price: def.price,
    candles: createSeedCandles(def.price, def.decimals, 120, def.volatility),
  };
}

function round(n, decimals) {
  return Number(n.toFixed(decimals));
}

function createSeedCandles(start, decimals, count, volatility) {
  const candles = [];
  let p = start;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count; i > 0; i--) {
    const time = now - i * 5;

    const open = p;
    const close = p + (Math.random() - 0.5) * volatility * 3;

    const high = Math.max(open, close) + Math.random() * volatility;

    const low = Math.min(open, close) - Math.random() * volatility;

    p = close;

    candles.push({
      time,
      open: round(open, decimals),
      high: round(high, decimals),
      low: round(low, decimals),
      close: round(close, decimals),
    });
  }

  return candles;
}

export const symbols = Object.keys(definitions);

export function getPrice(symbol) {
  return state[symbol]?.price ?? null;
}

export function getCandles(symbol) {
  return state[symbol]?.candles ?? [];
}

export function tick() {
  const updates = {};
  const currentSecond = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(currentSecond / 5) * 5;

  for (const [symbol, def] of Object.entries(definitions)) {
    const s = state[symbol];
    const previous = s.price;

    const next = round(
      Math.max(0.0000001, previous + (Math.random() - 0.5) * def.volatility),
      def.decimals,
    );

    s.price = next;

    let candle = s.candles[s.candles.length - 1];

    if (!candle || candle.time !== bucket) {
      candle = {
        time: bucket,
        open: round(previous, def.decimals),
        high: round(Math.max(previous, next), def.decimals),
        low: round(Math.min(previous, next), def.decimals),
        close: next,
      };

      s.candles.push(candle);

      if (s.candles.length > 240) {
        s.candles.shift();
      }
    } else {
      candle.high = round(Math.max(candle.high, next), def.decimals);

      candle.low = round(Math.min(candle.low, next), def.decimals);

      candle.close = next;
    }

    updates[symbol] = {
      price: next,
      candle,
    };
  }

  return updates;
}

// // import React, { useEffect, useRef } from "react";
// // import { createChart, CandlestickSeries } from "lightweight-charts";

// // const CandleChart = ({ candles = [] }) => {
// //   const containerRef = useRef(null);
// //   const seriesRef = useRef(null);

// //   useEffect(() => {
// //     if (!containerRef.current) return;

// //     const chart = createChart(containerRef.current, {
// //       width: containerRef.current.clientWidth,
// //       height: containerRef.current.clientHeight,

// //       layout: {
// //         background: {
// //           color: "#0d1324",
// //         },
// //         textColor: "#93a4c7",
// //       },

// //       grid: {
// //         vertLines: {
// //           color: "#17213a",
// //         },
// //         horzLines: {
// //           color: "#17213a",
// //         },
// //       },

// //       rightPriceScale: {
// //         borderColor: "#24304b",
// //       },

// //       timeScale: {
// //         borderColor: "#24304b",
// //         timeVisible: true,
// //         secondsVisible: false,
// //       },
// //     });

// //     const series = chart.addSeries(CandlestickSeries, {
// //       upColor: "#22c55e",
// //       downColor: "#ef4444",
// //       borderVisible: false,
// //       wickUpColor: "#22c55e",
// //       wickDownColor: "#ef4444",
// //     });

// //     seriesRef.current = series;

// //     const resize = () => {
// //       if (!containerRef.current) return;

// //       chart.applyOptions({
// //         width: containerRef.current.clientWidth,
// //         height: containerRef.current.clientHeight,
// //       });
// //     };

// //     resize();

// //     window.addEventListener("resize", resize);

// //     return () => {
// //       window.removeEventListener("resize", resize);
// //       chart.remove();
// //       seriesRef.current = null;
// //     };
// //   }, []);

// //   useEffect(() => {
// //     if (!seriesRef.current || !candles.length) return;

// //     const data = [...candles]
// //       .sort((a, b) => a.time - b.time)
// //       .map((candle) => ({
// //         time: candle.time,
// //         open: Number(candle.open),
// //         high: Number(candle.high),
// //         low: Number(candle.low),
// //         close: Number(candle.close),
// //       }));

// //     seriesRef.current.setData(data);
// //   }, [candles]);

// //   return <div ref={containerRef} className="chart" />;
// // };

// // export default CandleChart;

// import React, { useEffect, useRef, useState } from "react";
// import {
//   createChart,
//   CandlestickSeries,
// } from "lightweight-charts";

// /**
//  * Convert different time formats to Unix seconds.
//  *
//  * Supported:
//  * - Unix seconds: 1726147200
//  * - Unix milliseconds: 1726147200000
//  * - ISO date string: "2026-09-12T17:35:00.000Z"
//  */
// function toUnixSeconds(value) {
//   if (value == null) return null;

//   if (typeof value === "number") {
//     return value > 1e12
//       ? Math.floor(value / 1000)
//       : Math.floor(value);
//   }

//   const parsed = new Date(value).getTime();

//   return Number.isFinite(parsed)
//     ? Math.floor(parsed / 1000)
//     : null;
// }

// function formatTime(unixSeconds) {
//   if (!unixSeconds) return "—";

//   return new Date(unixSeconds * 1000).toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
// }

// function formatCountdown(expiryAt, now) {
//   const expiryMs = new Date(expiryAt).getTime();
//   const remaining = Math.max(0, Math.ceil((expiryMs - now) / 1000));

//   const minutes = Math.floor(remaining / 60);
//   const seconds = remaining % 60;

//   return `${String(minutes).padStart(2, "0")}:${String(
//     seconds
//   ).padStart(2, "0")}`;
// }

// function formatPrice(value, precision = 7) {
//   if (value == null || !Number.isFinite(Number(value))) return "—";

//   return Number(value).toFixed(precision);
// }

// /**
//  * Expected trade shape:
//  *
//  * {
//  *   _id: "trade-id",
//  *   symbol: "EURUSD",
//  *   direction: "UP",
//  *   amount: 100,
//  *   entryPrice: 1.1722032,
//  *   entryTime: 1726147200,       // preferred
//  *   expiryAt: "2026-09-12T18:00:00.000Z",
//  *   result: "OPEN"
//  * }
//  *
//  * If your backend uses createdAt/openedAt instead of entryTime,
//  * the component has fallbacks below.
//  */
// const CandleChart = ({
//   candles = [],
//   symbol,
//   hoverDirection = null,
//   expiry = 60,
//   trades = [],
//   now = Date.now(),
//   currentPrice,
//   pricePrecision = 7,
// }) => {
//   const containerRef = useRef(null);
//   const chartRef = useRef(null);
//   const seriesRef = useRef(null);

//   const [hoveredCandle, setHoveredCandle] = useState(null);
//   const [layoutVersion, setLayoutVersion] = useState(0);

//   /**
//    * 1. Create the chart only once.
//    */
//   useEffect(() => {
//     if (!containerRef.current) return;

//     const container = containerRef.current;

//     const chart = createChart(container, {
//       width: container.clientWidth,
//       height: container.clientHeight,

//       layout: {
//         background: {
//           color: "#1d1e22",
//         },
//         textColor: "#9ca3af",
//         attributionLogo: false,
//       },

//       grid: {
//         vertLines: {
//           color: "#303238",
//         },
//         horzLines: {
//           color: "#303238",
//         },
//       },

//       rightPriceScale: {
//         borderVisible: false,

//         // This controls the visible price scale precision.
//         // Example: 1.1722032
//         mode: 0,
//       },

//       timeScale: {
//         borderVisible: false,
//         timeVisible: true,
//         secondsVisible: true,
//         rightOffset: 8,
//         barSpacing: 10,
//       },

//       crosshair: {
//         vertLine: {
//           color: "#8b8d94",
//           width: 1,
//           style: 2,
//           labelBackgroundColor: "#555861",
//         },
//         horzLine: {
//           color: "#8b8d94",
//           width: 1,
//           style: 2,
//           labelBackgroundColor: "#555861",
//         },
//       },

//       handleScroll: {
//         mouseWheel: true,
//         pressedMouseMove: true,
//         horzTouchDrag: true,
//         vertTouchDrag: true,
//       },

//       handleScale: {
//         mouseWheel: true,
//         pinch: true,
//         axisPressedMouseMove: true,
//       },
//     });

//     const series = chart.addSeries(CandlestickSeries, {
//       upColor: "#1683e8",
//       downColor: "#ff626c",

//       borderUpColor: "#1683e8",
//       borderDownColor: "#ff626c",

//       wickUpColor: "#1683e8",
//       wickDownColor: "#ff626c",

//       // Precise OHLC and price-scale formatting.
//       priceFormat: {
//         type: "price",
//         precision: pricePrecision,
//         minMove: 1 / 10 ** pricePrecision,
//       },
//     });

//     chartRef.current = chart;
//     seriesRef.current = series;

//     /**
//      * ResizeObserver is better than only window.resize.
//      */
//     const resizeObserver = new ResizeObserver(() => {
//       if (!containerRef.current) return;

//       chart.applyOptions({
//         width: containerRef.current.clientWidth,
//         height: containerRef.current.clientHeight,
//       });

//       setLayoutVersion((v) => v + 1);
//     });

//     resizeObserver.observe(container);

//     /**
//      * 2. Crosshair → OHLC values.
//      *
//      * We intentionally keep the last valid candle when the cursor
//      * leaves the chart, so the OHLC panel remains visible.
//      */
//     const onCrosshairMove = (param) => {
//       if (!param.time || !param.seriesData) {
//         return;
//       }

//       const candle = param.seriesData.get(series);

//       if (!candle) return;

//       setHoveredCandle({
//         time: toUnixSeconds(param.time),
//         open: Number(candle.open),
//         high: Number(candle.high),
//         low: Number(candle.low),
//         close: Number(candle.close),
//       });

//       setLayoutVersion((v) => v + 1);
//     };

//     chart.subscribeCrosshairMove(onCrosshairMove);

//     /**
//      * Redraw custom overlays when the chart's visible range changes.
//      */
//     const onVisibleRangeChange = () => {
//       setLayoutVersion((v) => v + 1);
//     };

//     chart
//       .timeScale()
//       .subscribeVisibleLogicalRangeChange(onVisibleRangeChange);

//     return () => {
//       resizeObserver.disconnect();

//       chart.unsubscribeCrosshairMove(onCrosshairMove);

//       chart
//         .timeScale()
//         .unsubscribeVisibleLogicalRangeChange(onVisibleRangeChange);

//       chart.remove();

//       chartRef.current = null;
//       seriesRef.current = null;
//     };
//   }, [pricePrecision]);

//   /**
//    * 3. Update candle data only.
//    *
//    * This does NOT recreate the chart.
//    */
//   useEffect(() => {
//     if (!seriesRef.current || !candles.length) return;

//     const data = [...candles]
//       .sort((a, b) => Number(a.time) - Number(b.time))
//       .map((candle) => ({
//         time: toUnixSeconds(candle.time),
//         open: Number(candle.open),
//         high: Number(candle.high),
//         low: Number(candle.low),
//         close: Number(candle.close),
//       }))
//       .filter(
//         (candle) =>
//           candle.time &&
//           Number.isFinite(candle.open) &&
//           Number.isFinite(candle.high) &&
//           Number.isFinite(candle.low) &&
//           Number.isFinite(candle.close)
//       );

//     seriesRef.current.setData(data);

//     setLayoutVersion((v) => v + 1);
//   }, [candles]);

//   /**
//    * Force the overlay to recalculate when these values change.
//    *
//    * The chart itself is NOT recreated.
//    */
//   useEffect(() => {
//     setLayoutVersion((v) => v + 1);
//   }, [trades, hoverDirection, now, currentPrice, expiry]);

//   const lastCandle = candles[candles.length - 1];

//   const livePrice =
//     currentPrice != null
//       ? Number(currentPrice)
//       : Number(lastCandle?.close);

//   /**
//    * Convert a trade into a normalized overlay object.
//    */
//   const normalizedTrades = trades
//     .filter((trade) => trade.result === "OPEN")
//     .filter((trade) => trade.symbol === symbol)
//     .map((trade) => {
//       const entryTime = toUnixSeconds(
//         trade.entryTime ??
//           trade.openedAt ??
//           trade.createdAt ??
//           trade.timestamp
//       );

//       const expiryTime = toUnixSeconds(trade.expiryAt);

//       return {
//         ...trade,
//         entryTime,
//         expiryTime,
//         entryPrice: Number(trade.entryPrice),
//         amount: Number(trade.amount),
//       };
//     })
//     .filter(
//       (trade) =>
//         trade.entryTime &&
//         trade.expiryTime &&
//         Number.isFinite(trade.entryPrice)
//     );

//   /**
//    * 4. Render custom overlays.
//    *
//    * We use SVG over the chart because the native chart is already
//    * managing candles, scales, scrolling, and zooming.
//    */
//   const renderTradeOverlays = () => {
//     const chart = chartRef.current;
//     const series = seriesRef.current;
//     const container = containerRef.current;

//     if (!chart || !series || !container) return null;

//     const width = container.clientWidth;
//     const height = container.clientHeight;

//     const timeScale = chart.timeScale();

//     const getX = (time) => {
//       const coordinate = timeScale.timeToCoordinate(time);
//       return coordinate == null ? null : coordinate;
//     };

//     const getY = (price) => {
//       const coordinate = series.priceToCoordinate(price);
//       return coordinate == null ? null : coordinate;
//     };

//     const overlays = [];

//     /**
//      * A. Temporary UP/DOWN preview.
//      *
//      * It is not a real trade. It disappears when hoverDirection
//      * becomes null.
//      */
//     if (
//       hoverDirection &&
//       Number.isFinite(livePrice) &&
//       livePrice > 0
//     ) {
//       const previewColor =
//         hoverDirection === "UP" ? "#16d889" : "#ff4f5e";

//       const previewY = getY(livePrice);

//       if (previewY != null) {
//         const previewLabel =
//           hoverDirection === "UP" ? "UP" : "DOWN";

//         overlays.push(
//           <g key="preview" opacity="0.95">
//             <line
//               x1={0}
//               y1={previewY}
//               x2={width}
//               y2={previewY}
//               stroke={previewColor}
//               strokeWidth="2"
//             />

//             <rect
//               x={Math.max(0, width - 160)}
//               y={previewY - 17}
//               width="160"
//               height="34"
//               rx="6"
//               fill={previewColor}
//             />

//             <text
//               x={width - 150}
//               y={previewY + 5}
//               fill="#ffffff"
//               fontSize="13"
//               fontWeight="600"
//             >
//               {formatPrice(livePrice, pricePrecision)}
//             </text>

//             <text
//               x={width - 45}
//               y={previewY + 5}
//               fill="#ffffff"
//               fontSize="12"
//               fontWeight="700"
//               textAnchor="middle"
//             >
//               {previewLabel}
//             </text>
//           </g>
//         );
//       }
//     }

//     /**
//      * B. Persistent placed trades.
//      */
//     normalizedTrades.forEach((trade) => {
//       const color =
//         trade.direction === "UP" ? "#16d889" : "#ff4f5e";

//       const x1 = getX(trade.entryTime);
//       const y = getY(trade.entryPrice);

//       if (x1 == null || y == null) return;

//       // If expiry is outside the visible range, extend the line
//       // toward the right side of the chart.
//       const expiryX = getX(trade.expiryTime);
//       const x2 = expiryX == null ? width - 12 : expiryX;

//       const safeX2 = Math.max(x1 + 8, x2);

//       const countdown = formatCountdown(trade.expiryAt, now);

//       const directionLabel =
//         trade.direction === "UP" ? "UP" : "DOWN";

//       overlays.push(
//         <g key={trade._id}>
//           {/* Entry → expiry line */}
//           <line
//             x1={x1}
//             y1={y}
//             x2={safeX2}
//             y2={y}
//             stroke={color}
//             strokeWidth="2"
//           />

//           {/* Entry point */}
//           <circle
//             cx={x1}
//             cy={y}
//             r="7"
//             fill={color}
//             stroke="#ffffff"
//             strokeWidth="2"
//           />

//           {/* Amount flag */}
//           <rect
//             x={x1 - 78}
//             y={y - 17}
//             width="62"
//             height="34"
//             rx="3"
//             fill="#f5c542"
//           />

//           <text
//             x={x1 - 47}
//             y={y + 5}
//             fill="#171717"
//             fontSize="12"
//             fontWeight="700"
//             textAnchor="middle"
//           >
//             {Number.isFinite(trade.amount)
//               ? trade.amount.toFixed(2)
//               : "—"}
//           </text>

//           {/* Flag pointer */}
//           <polygon
//             points={`${x1 - 16},${y - 17} ${x1 - 5},${y} ${x1 - 16},${y + 17}`}
//             fill="#f5c542"
//           />

//           {/* Countdown near expiry */}
//           <rect
//             x={Math.min(safeX2 - 72, width - 82)}
//             y={y - 45}
//             width="70"
//             height="27"
//             rx="5"
//             fill="#2b2d33"
//             stroke={color}
//             strokeWidth="1"
//           />

//           <text
//             x={Math.min(safeX2 - 37, width - 47)}
//             y={y - 27}
//             fill="#ffffff"
//             fontSize="12"
//             fontWeight="700"
//             textAnchor="middle"
//           >
//             {countdown}
//           </text>

//           {/* Direction label */}
//           <text
//             x={Math.min(safeX2 - 37, width - 47)}
//             y={y + 32}
//             fill={color}
//             fontSize="11"
//             fontWeight="700"
//             textAnchor="middle"
//           >
//             {directionLabel}
//           </text>
//         </g>
//       );
//     });

//     return overlays;
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="candle-chart-container"
//       style={{
//         position: "relative",
//         width: "100%",
//         height: "620px",
//         overflow: "hidden",
//         background: "#1d1e22",
//       }}
//     >
//       {/* Lightweight Charts is mounted here */}
//       <div
//         className="lightweight-chart"
//         style={{
//           position: "absolute",
//           inset: 0,
//         }}
//       />

//       {/*
//         IMPORTANT:
//         We need to mount Lightweight Charts into the same container,
//         but the custom overlay must be above the chart.

//         The chart is initialized on containerRef, so the SVG is
//         rendered after the chart's internal elements.
//       */}

//       <svg
//         key={layoutVersion}
//         className="chart-overlay"
//         width="100%"
//         height="100%"
//         viewBox={`0 0 ${
//           containerRef.current?.clientWidth || 1
//         } ${containerRef.current?.clientHeight || 1}`}
//         preserveAspectRatio="none"
//         style={{
//           position: "absolute",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 10,
//         }}
//       >
//         {renderTradeOverlays()}
//       </svg>

//       {/* Persistent OHLC information */}
//       {hoveredCandle && (
//         <div
//           className="ohlc-panel"
//           style={{
//             position: "absolute",
//             left: "14px",
//             bottom: "76px",
//             zIndex: 20,
//             color: "#b8bbc4",
//             fontSize: "13px",
//             lineHeight: 1.65,
//             pointerEvents: "none",
//             background: "rgba(29, 30, 34, 0.82)",
//             padding: "8px 12px",
//             borderRadius: "6px",
//           }}
//         >
//           <div>
//             <span>Time&nbsp;&nbsp;</span>
//             <strong style={{ color: "#ffffff" }}>
//               {formatTime(hoveredCandle.time)}
//             </strong>
//           </div>

//           <div>
//             <span>Open&nbsp;&nbsp;</span>
//             <strong style={{ color: "#ffffff" }}>
//               {formatPrice(hoveredCandle.open, pricePrecision)}
//             </strong>
//           </div>

//           <div>
//             <span>High&nbsp;&nbsp;</span>
//             <strong style={{ color: "#ffffff" }}>
//               {formatPrice(hoveredCandle.high, pricePrecision)}
//             </strong>
//           </div>

//           <div>
//             <span>Low&nbsp;&nbsp;</span>
//             <strong style={{ color: "#ffffff" }}>
//               {formatPrice(hoveredCandle.low, pricePrecision)}
//             </strong>
//           </div>

//           <div>
//             <span>Close&nbsp;</span>
//             <strong style={{ color: "#ffffff" }}>
//               {formatPrice(hoveredCandle.close, pricePrecision)}
//             </strong>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CandleChart;

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  CrosshairMode,
} from "lightweight-charts";

import "./CandleChart.css";

const COLORS = {
  chartBg: "#0e1526",
  deepBg: "#080d19",
  border: "#1d2941",

  text: "#94a3b8",
  textBright: "#e2e8f0",

  candleUp: "#1683e8",
  candleDown: "#ff626c",

  up: "#16d889",
  upDark: "#079b61",

  down: "#ff5264",
  downDark: "#c92d43",

  gold: "#f5c542",
};

const PRICE_PRECISION = 7;

function formatPrice(value, precision = PRICE_PRECISION) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return number.toFixed(precision);
}

function formatTime(time) {
  if (!time) return "—";

  const date =
    typeof time === "number" ? new Date(time * 1000) : new Date(time);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatCountdown(expiryAt, now) {
  if (!expiryAt) return "00:00";

  const expiryTime = new Date(expiryAt).getTime();

  if (!Number.isFinite(expiryTime)) return "00:00";

  const remaining = Math.max(0, Math.ceil((expiryTime - now) / 1000));

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

/**
 * Convert different possible backend time formats
 * into Lightweight Charts' Unix timestamp in seconds.
 */
function toUnixSeconds(value) {
  if (value == null) return null;

  if (typeof value === "number") {
    // If milliseconds were supplied, convert to seconds.
    return value > 10_000_000_000 ? Math.floor(value / 1000) : value;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) return null;

  return Math.floor(timestamp / 1000);
}

function normalizeCandle(candle) {
  return {
    time: toUnixSeconds(candle.time),
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
  };
}

const CandleChart = ({
  candles = [],
  symbol,

  // Hover preview
  hoverDirection = null,
  expiry = 60,
  amount = 0,

  // Actual open trades
  trades = [],

  // Current live price
  currentPrice,

  // Dashboard's continuously updated Date.now()
  now = Date.now(),

  // Optional chart height
  height = 560,
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const overlayRef = useRef(null);
  const crosshairTooltipRef = useRef(null);

  const [crosshairData, setCrosshairData] = useState(null);

  /*
   * Keep the latest values in refs so chart event callbacks
   * do not need to recreate the chart.
   */
  const candlesRef = useRef(candles);
  const tradesRef = useRef(trades);
  const hoverDirectionRef = useRef(hoverDirection);
  const amountRef = useRef(amount);
  const expiryRef = useRef(expiry);
  const currentPriceRef = useRef(currentPrice);
  const nowRef = useRef(now);

  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  useEffect(() => {
    tradesRef.current = trades;
  }, [trades]);

  useEffect(() => {
    hoverDirectionRef.current = hoverDirection;
  }, [hoverDirection]);

  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  useEffect(() => {
    expiryRef.current = expiry;
  }, [expiry]);

  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  useEffect(() => {
    nowRef.current = now;
  }, [now]);

  /*
   * ============================================================
   * 1. CREATE CHART — runs only once
   * ============================================================
   */
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height,

      layout: {
        background: {
          color: COLORS.chartBg,
        },
        textColor: COLORS.text,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
      },

      grid: {
        vertLines: {
          color: COLORS.border,
          style: 0,
        },
        horzLines: {
          color: COLORS.border,
          style: 0,
        },
      },

      crosshair: {
        mode: CrosshairMode.Normal,

        vertLine: {
          color: "#64748b",
          width: 1,
          style: 2,
          labelBackgroundColor: "#334155",
        },

        horzLine: {
          color: "#64748b",
          width: 1,
          style: 2,
          labelBackgroundColor: "#334155",
        },
      },

      rightPriceScale: {
        borderColor: COLORS.border,
        textColor: COLORS.text,

        // Keeps the price scale visible.
        autoScale: true,

        scaleMargins: {
          top: 0.12,
          bottom: 0.12,
        },
      },

      timeScale: {
        borderColor: COLORS.border,
        timeVisible: true,
        secondsVisible: true,

        rightOffset: 8,
        barSpacing: 8,
        minBarSpacing: 3,
      },

      localization: {
        priceFormatter: (price) => formatPrice(price, PRICE_PRECISION),
      },

      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },

      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.candleUp,
      downColor: COLORS.candleDown,

      borderUpColor: COLORS.candleUp,
      borderDownColor: COLORS.candleDown,

      wickUpColor: COLORS.candleUp,
      wickDownColor: COLORS.candleDown,

      priceFormat: {
        type: "price",
        precision: PRICE_PRECISION,
        minMove: 1 / 10 ** PRICE_PRECISION,
      },
    });

    chartRef.current = chart;
    seriesRef.current = series;

    /*
     * ------------------------------------------------------------
     * CROSSHAIR: show OHLC + time for the candle under cursor
     * ------------------------------------------------------------
     */
    const handleCrosshairMove = (param) => {
      if (!param || !param.time || !param.point || !seriesRef.current) {
        setCrosshairData(null);
        return;
      }

      const candle = param.seriesData?.get(seriesRef.current);

      if (!candle) {
        setCrosshairData(null);
        return;
      }

      setCrosshairData({
        time: param.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        x: param.point.x,
        y: param.point.y,
      });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    /*
     * ------------------------------------------------------------
     * RESIZE OBSERVER
     * ------------------------------------------------------------
     */
    const resizeObserver = new ResizeObserver(() => {
      if (!chartContainerRef.current) return;

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });

      renderOverlays();
    });

    resizeObserver.observe(container);

    /*
     * ------------------------------------------------------------
     * IMPORTANT:
     * Re-render overlays when chart is scrolled / zoomed.
     * Otherwise trade lines would not follow candles.
     * ------------------------------------------------------------
     */
    const handleVisibleRangeChange = () => {
      renderOverlays();
    };

    chart.timeScale().subscribeVisibleTimeRangeChange(handleVisibleRangeChange);

    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    function renderOverlays() {
      // This function is replaced by the latest implementation
      // through the ref below.
      renderOverlaysRef.current?.();
    }

    return () => {
      resizeObserver.disconnect();

      chart.unsubscribeCrosshairMove(handleCrosshairMove);

      chart
        .timeScale()
        .unsubscribeVisibleTimeRangeChange(handleVisibleRangeChange);

      chart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

      chart.remove();

      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  /*
   * A ref is used so chart listeners can call the latest
   * overlay renderer without recreating the chart.
   */
  const renderOverlaysRef = useRef(null);

  /*
   * ============================================================
   * 2. SET CANDLE DATA
   * ============================================================
   */
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;

    const data = candles
      .map(normalizeCandle)
      .filter(
        (candle) =>
          candle.time &&
          Number.isFinite(candle.open) &&
          Number.isFinite(candle.high) &&
          Number.isFinite(candle.low) &&
          Number.isFinite(candle.close),
      )
      .sort((a, b) => a.time - b.time);

    if (!data.length) return;

    seriesRef.current.setData(data);

    // Only fit on initial data load.
    // Do not fit every live update, or the chart will jump.
    if (data.length > 0 && !chartRef.current.__hasFitted) {
      chartRef.current.timeScale().fitContent();
      chartRef.current.__hasFitted = true;
    }

    renderOverlaysRef.current?.();
  }, [candles]);

  /*
   * ============================================================
   * 3. OVERLAY RENDERER
   *
   * Uses HTML/CSS over the canvas:
   * - Preview line
   * - Open trade lines
   * - Amount badges
   * - Arrow
   * - Countdown
   * - Right-side price label
   * ============================================================
   */
  useEffect(() => {
    renderOverlaysRef.current = () => {
      const chart = chartRef.current;
      const series = seriesRef.current;
      const overlay = overlayRef.current;

      if (!chart || !series || !overlay) return;

      const width = overlay.clientWidth;
      const height = overlay.clientHeight;

      if (!width || !height) return;

      const timeScale = chart.timeScale();

      const getX = (time) => {
        if (!time) return null;

        const x = timeScale.timeToCoordinate(time);

        return x == null ? null : x;
      };

      const getY = (price) => {
        if (!Number.isFinite(Number(price))) return null;

        const y = series.priceToCoordinate(Number(price));

        return y == null ? null : y;
      };

      const livePrice =
        currentPriceRef.current != null
          ? Number(currentPriceRef.current)
          : Number(candlesRef.current[candlesRef.current.length - 1]?.close);

      /*
       * We use the chart pane's coordinate system.
       * The right-side labels are positioned at the chart's
       * visible right edge.
       */
      let html = "";

      /*
       * ----------------------------------------------------------
       * PREVIEW
       * Appears when hoverDirection is UP or DOWN.
       * Disappears when hoverDirection becomes null.
       * ----------------------------------------------------------
       */
      const direction = hoverDirectionRef.current;

      if (direction && Number.isFinite(livePrice)) {
        const y = getY(livePrice);

        if (y != null && y >= -30 && y <= height + 30) {
          const isUp = direction === "UP";

          const color = isUp ? COLORS.up : COLORS.down;

          const gradient = isUp
            ? "linear-gradient(90deg, rgba(7,155,97,0.05), #16d889)"
            : "linear-gradient(90deg, rgba(201,45,67,0.05), #ff5264)";

          const arrow = isUp ? "↗" : "↘";

          html += `
            <div
              class="trade-preview-line ${isUp ? "preview-up" : "preview-down"}"
              style="
                top: ${y}px;
                background: ${gradient};
                box-shadow: 0 0 10px ${color}55;
              "
            ></div>

            <div
              class="trade-preview-arrow ${isUp ? "arrow-up" : "arrow-down"}"
              style="
                top: ${y - 30}px;
                color: ${color};
                border-color: ${color};
              "
            >
              ${arrow}
            </div>

            <div
              class="trade-preview-info"
              style="
                top: ${Math.max(8, y - 54)}px;
                border-color: ${color}99;
              "
            >
              <div class="preview-info-top">
                <span style="color:${color}">
                  ${isUp ? "▲" : "▼"} ${direction}
                </span>
                <strong>₹${Number(amountRef.current || 0).toFixed(2)}</strong>
              </div>

              <div class="preview-info-bottom">
                Expiry ${expiryRef.current}s
              </div>
            </div>

            <div
              class="trade-price-label ${isUp ? "price-up" : "price-down"}"
              style="
                top: ${y}px;
                background: ${color};
              "
            >
              <span>${formatPrice(livePrice)}</span>
              <b>${direction}</b>
            </div>
          `;
        }
      }

      /*
       * ----------------------------------------------------------
       * ACTUAL OPEN TRADES
       * ----------------------------------------------------------
       */
      const normalizedTrades = tradesRef.current
        .filter((trade) => {
          return (
            trade.result === "OPEN" && (!symbol || trade.symbol === symbol)
          );
        })
        .map((trade) => {
          const entryTime = toUnixSeconds(
            trade.entryTime ?? trade.openedAt ?? trade.createdAt,
          );

          const expiryTime = toUnixSeconds(trade.expiryAt);

          return {
            ...trade,
            entryTime,
            expiryTime,
            entryPrice: Number(trade.entryPrice),
            amount: Number(trade.amount),
          };
        })
        .filter(
          (trade) => trade.entryTime && Number.isFinite(trade.entryPrice),
        );

      normalizedTrades.forEach((trade) => {
        const isUp = trade.direction === "UP";

        const color = isUp ? COLORS.up : COLORS.down;

        const x1 = getX(trade.entryTime);
        const y = getY(trade.entryPrice);

        if (x1 == null || y == null) return;

        /*
         * If expiry is outside the visible chart,
         * continue the line to the visible right edge.
         */
        const expiryX = getX(trade.expiryTime);

        const x2 = expiryX == null ? width - 18 : Math.max(x1 + 35, expiryX);

        const lineWidth = Math.max(25, x2 - x1);

        const countdown = formatCountdown(trade.expiryAt, nowRef.current);

        /*
         * Keep the amount badge inside the visible chart.
         */
        const badgeLeft = Math.max(8, x1 - 72);

        /*
         * Countdown appears close to the expiry point,
         * but is clamped so it doesn't leave the chart.
         */
        const countdownLeft = Math.min(Math.max(x1 + 10, x2 - 42), width - 90);

        html += `
          <div
            class="open-trade-line ${isUp ? "trade-line-up" : "trade-line-down"}"
            style="
              left: ${x1}px;
              top: ${y}px;
              width: ${lineWidth}px;
              background: linear-gradient(
                90deg,
                ${isUp ? COLORS.upDark : COLORS.downDark},
                ${color}
              );
              box-shadow: 0 0 8px ${color}55;
            "
          ></div>

          <div
            class="trade-entry-dot"
            style="
              left: ${x1}px;
              top: ${y}px;
              background: ${color};
              box-shadow:
                0 0 0 2px ${COLORS.deepBg},
                0 0 0 4px ${color}88,
                0 0 14px ${color}99;
            "
          ></div>

          <div
            class="trade-amount-badge"
            style="
              left: ${badgeLeft}px;
              top: ${y - 19}px;
              background: ${COLORS.gold};
              color: ${COLORS.deepBg};
            "
          >
            <span>₹${Number(trade.amount || 0).toFixed(0)}</span>
          </div>

          <div
            class="trade-direction-arrow ${isUp ? "direction-up" : "direction-down"}"
            style="
              left: ${x1 - 7}px;
              top: ${y - 40}px;
              color: ${color};
              border-color: ${color};
            "
          >
            ${isUp ? "↗" : "↘"}
          </div>

          <div
            class="trade-direction-label"
            style="
              left: ${x1}px;
              top: ${y + 17}px;
              color: ${color};
            "
          >
            ${trade.direction}
          </div>

          <div
            class="trade-countdown"
            style="
              left: ${countdownLeft}px;
              top: ${y - 48}px;
              border-color: ${color};
            "
          >
            <span>${countdown}</span>
          </div>

          <div
            class="trade-entry-price"
            style="
              left: ${Math.min(x1 + 12, width - 150)}px;
              top: ${y + 30}px;
              color: ${color};
            "
          >
            ${formatPrice(trade.entryPrice)}
          </div>
        `;
      });

      overlay.innerHTML = html;
    };

    renderOverlaysRef.current();
  }, [hoverDirection, expiry, amount, trades, currentPrice, now, symbol]);

  /*
   * ============================================================
   * 4. CROSSHAIR TOOLTIP POSITION
   * ============================================================
   */
  useEffect(() => {
    const tooltip = crosshairTooltipRef.current;

    if (!tooltip || !crosshairData) {
      if (tooltip) tooltip.style.display = "none";
      return;
    }

    const container = chartContainerRef.current;

    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const tooltipWidth = 190;
    const tooltipHeight = 130;

    let left = crosshairData.x + 15;
    let top = crosshairData.y + 15;

    if (left + tooltipWidth > width) {
      left = crosshairData.x - tooltipWidth - 15;
    }

    if (top + tooltipHeight > height) {
      top = crosshairData.y - tooltipHeight - 15;
    }

    tooltip.style.display = "block";
    tooltip.style.left = `${Math.max(8, left)}px`;
    tooltip.style.top = `${Math.max(8, top)}px`;
  }, [crosshairData]);

  return (
    <div className="candle-chart-shell" style={{ height }}>
      {/* Lightweight Charts canvas is mounted here */}
      <div ref={chartContainerRef} className="candle-chart-container" />

      {/* HTML overlay above the canvas */}
      <div ref={overlayRef} className="candle-chart-overlay" />

      {/* Custom OHLC tooltip */}
      <div
        ref={crosshairTooltipRef}
        className="ohlc-tooltip"
        style={{ display: "none" }}
      >
        {crosshairData && (
          <>
            <div className="ohlc-tooltip-header">
              <strong>{symbol}</strong>
              <span>{formatTime(crosshairData.time)}</span>
            </div>

            <div className="ohlc-divider" />

            <div className="ohlc-row">
              <span>Open</span>
              <b>{formatPrice(crosshairData.open)}</b>
            </div>

            <div className="ohlc-row">
              <span>High</span>
              <b className="ohlc-high">{formatPrice(crosshairData.high)}</b>
            </div>

            <div className="ohlc-row">
              <span>Low</span>
              <b className="ohlc-low">{formatPrice(crosshairData.low)}</b>
            </div>

            <div className="ohlc-row">
              <span>Close</span>
              <b>{formatPrice(crosshairData.close)}</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CandleChart;
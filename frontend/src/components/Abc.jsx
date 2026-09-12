import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  BarSeries,
  LineSeries,
  AreaSeries,
} from "lightweight-charts";

export default function Abc() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [chartType, setChartType] = useState("candlestick");
  const [timeframe, setTimeframe] = useState("1m");

  /*
   * Demo OHLC data.
   *
   * We generate 1-minute candles and then aggregate them
   * when the user selects a larger timeframe.
   */
  const generateDemoData = () => {
    const data = [];

    let price = 100;

    // ~6 hours of 1-minute data
    const startTime = Math.floor(Date.now() / 1000 / 60) * 60 - 360 * 60;

    for (let i = 0; i < 360; i++) {
      const time = startTime + i * 60;

      const open = price;

      const movement = (Math.random() - 0.48) * 2;

      const close = Math.max(1, open + movement);

      const high = Math.max(open, close) + Math.random() * 1.2;

      const low = Math.min(open, close) - Math.random() * 1.2;

      data.push({
        time,
        open,
        high,
        low,
        close,
      });

      price = close;
    }

    return data;
  };

  const demoDataRef = useRef(generateDemoData());

  /*
   * Convert timeframe into seconds.
   */
  const timeframeToSeconds = {
    "5s": 5,
    "10s": 10,
    "30s": 30,
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "30m": 1800,
    "1h": 3600,
  };

  /*
   * Aggregate OHLC candles.
   *
   * Example:
   *
   * 1m data:
   * 10:00
   * 10:01
   * 10:02
   * 10:03
   * 10:04
   *
   * becomes one 5m candle.
   */
  const aggregateData = (data, intervalSeconds) => {
    if (intervalSeconds <= 60) {
      return data;
    }

    const grouped = new Map();

    data.forEach((candle) => {
      const bucket =
        Math.floor(candle.time / intervalSeconds) * intervalSeconds;

      if (!grouped.has(bucket)) {
        grouped.set(bucket, {
          time: bucket,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
      } else {
        const existing = grouped.get(bucket);

        existing.high = Math.max(existing.high, candle.high);

        existing.low = Math.min(existing.low, candle.low);

        existing.close = candle.close;
      }
    });

    return Array.from(grouped.values());
  };

  /*
   * Convert OHLC data to close-price data
   * for Line / Area charts.
   */
  const closePriceData = (data) =>
    data.map((candle) => ({
      time: candle.time,
      value: candle.close,
    }));

  /*
   * Create chart only once.
   */
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 520,

      layout: {
        background: {
          color: "#0f172a",
        },
        textColor: "#94a3b8",
      },

      grid: {
        vertLines: {
          color: "#1e293b",
        },
        horzLines: {
          color: "#1e293b",
        },
      },

      crosshair: {
        mode: 1,
      },

      rightPriceScale: {
        borderColor: "#334155",
      },

      timeScale: {
        borderColor: "#334155",
        timeVisible: true,
        secondsVisible: true,
      },
    });

    chartRef.current = chart;

    /*
     * Responsive chart width.
     */
    const resizeObserver = new ResizeObserver(() => {
      if (!chartContainerRef.current) return;

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  /*
   * Recreate only the SERIES when chart type or timeframe changes.
   */
  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) return;

    // Remove existing series safely
    const previousSeries = seriesRef.current;

    if (previousSeries) {
      try {
        chart.removeSeries(previousSeries);
      } catch (error) {
        console.warn("Could not remove previous series:", error);
      }

      seriesRef.current = null;
    }

    const interval = timeframeToSeconds[timeframe];

    const data = aggregateData(demoDataRef.current, interval);

    let newSeries = null;

    if (chartType === "candlestick") {
      newSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });

      newSeries.setData(data);
    }

    if (chartType === "bar") {
      newSeries = chart.addSeries(BarSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
      });

      newSeries.setData(data);
    }

    if (chartType === "line") {
      newSeries = chart.addSeries(LineSeries, {
        color: "#38bdf8",
        lineWidth: 2,
      });

      newSeries.setData(
        data.map((candle) => ({
          time: candle.time,
          value: candle.close,
        })),
      );
    }

    if (chartType === "area") {
      newSeries = chart.addSeries(AreaSeries, {
        lineColor: "#38bdf8",
        topColor: "rgba(56, 189, 248, 0.35)",
        bottomColor: "rgba(56, 189, 248, 0.02)",
        lineWidth: 2,
      });

      newSeries.setData(
        data.map((candle) => ({
          time: candle.time,
          value: candle.close,
        })),
      );
    }

    if (!newSeries) return;

    seriesRef.current = newSeries;

    chart.timeScale().fitContent();
  }, [chartType, timeframe]);

  const chartTypes = [
    {
      id: "candlestick",
      label: "Candles",
    },
    {
      id: "bar",
      label: "Bars",
    },
    {
      id: "line",
      label: "Line",
    },
    {
      id: "area",
      label: "Mountain",
    },
  ];

  const timeframes = ["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h"];

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
      {/* ================= TOOLBAR ================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900 px-3 py-3">
        {/* Chart Types */}
        <div className="flex items-center gap-1">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id)}
              className={`
                rounded-md px-3 py-1.5 text-sm font-medium
                transition-colors
                ${
                  chartType === type.id
                    ? "bg-sky-500 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="mx-2 hidden h-6 w-px bg-slate-700 sm:block" />

        {/* Timeframes */}
        <div className="flex flex-wrap items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`
                rounded-md px-2.5 py-1.5 text-xs font-medium
                transition-colors
                ${
                  timeframe === tf
                    ? "bg-slate-700 text-white"
                    : "text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                }
              `}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CHART HEADER ================= */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">DEMO / USD</span>

            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {timeframe}
            </span>
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {chartTypes.find((type) => type.id === chartType)?.label}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-green-400">117.42</div>

          <div className="text-xs text-green-500">+2.31%</div>
        </div>
      </div>

      {/* ================= CHART ================= */}
      <div ref={chartContainerRef} className="w-full" />

      {/* ================= FOOTER ================= */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-4 py-2">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>
            Type: <span className="text-slate-300">{chartType}</span>
          </span>

          <span>
            Interval: <span className="text-slate-300">{timeframe}</span>
          </span>
        </div>

        <span className="text-xs text-slate-600">Demo data</span>
      </div>
    </div>
  );
}

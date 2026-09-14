import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, BarSeries, LineSeries, AreaSeries } from "lightweight-charts";

export default function LiveChart() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

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

  // create chart
  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,

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

    const data = demoDataRef.current;

    let newSeries = null;

    newSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    newSeries.setData(data);

    if (!newSeries) return;

    seriesRef.current = newSeries;

    chart.timeScale();
  }, []);

  return (
    <>
      <div ref={chartContainerRef} className="w-120 h-120" />
    </>
  );
}

import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

const CandleChart = ({ candles = [] }) => {
  const containerRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,

      layout: {
        background: {
          color: "#0d1324",
        },
        textColor: "#93a4c7",
      },

      grid: {
        vertLines: {
          color: "#17213a",
        },
        horzLines: {
          color: "#17213a",
        },
      },

      rightPriceScale: {
        borderColor: "#24304b",
      },

      timeScale: {
        borderColor: "#24304b",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    seriesRef.current = series;

    const resize = () => {
      if (!containerRef.current) return;

      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };

    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;

    const data = [...candles]
      .sort((a, b) => a.time - b.time)
      .map((candle) => ({
        time: candle.time,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
      }));

    seriesRef.current.setData(data);
  }, [candles]);

  return <div ref={containerRef} className="chart" />;
};

export default CandleChart;

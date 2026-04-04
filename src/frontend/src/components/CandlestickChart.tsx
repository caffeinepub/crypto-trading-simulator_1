import { useCallback, useMemo, useRef, useState } from "react";
import type { OHLCData } from "../types/trading";

interface CandlestickChartProps {
  data: OHLCData[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  candle: OHLCData | null;
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    candle: null,
  });

  const visibleData = useMemo(() => data.slice(-30), [data]);

  // Chart dimensions and margins
  const MARGIN = { top: 10, right: 70, bottom: 28, left: 8 };
  const HEIGHT = 260;

  // Compute price domain
  const prices = visibleData.flatMap((d) => [d.low, d.high]);
  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);
  const padding = (rawMax - rawMin) * 0.06;
  const yMin = rawMin - padding;
  const yMax = rawMax + padding;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const chartWidth = rect.width - MARGIN.left - MARGIN.right;
      const mouseX = e.clientX - rect.left - MARGIN.left;
      const idx = Math.round((mouseX / chartWidth) * (visibleData.length - 1));
      const clampedIdx = Math.max(0, Math.min(visibleData.length - 1, idx));
      const candle = visibleData[clampedIdx];
      if (candle) {
        setTooltip({
          visible: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          candle,
        });
      }
    },
    [visibleData],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  return (
    <div style={{ width: "100%", height: HEIGHT, position: "relative" }}>
      <svg
        role="img"
        aria-label="Candlestick price chart"
        ref={svgRef}
        width="100%"
        height={HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "crosshair" }}
      >
        <CandleChartInner
          data={visibleData}
          yMin={yMin}
          yMax={yMax}
          margin={MARGIN}
          height={HEIGHT}
        />
      </svg>

      {/* Tooltip */}
      {tooltip.visible && tooltip.candle && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 12,
            top: tooltip.y - 60,
            pointerEvents: "none",
            zIndex: 20,
            background: "oklch(0.19 0.016 240)",
            border: "1px solid oklch(0.28 0.02 240)",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 11,
            fontFamily: "monospace",
            minWidth: 120,
          }}
        >
          <div
            style={{
              color: "oklch(0.85 0.01 240)",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {tooltip.candle.time}
          </div>
          {[
            { label: "O", value: tooltip.candle.open },
            { label: "H", value: tooltip.candle.high },
            { label: "L", value: tooltip.candle.low },
            { label: "C", value: tooltip.candle.close },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ color: "oklch(0.55 0.02 240)" }}>{label}:</span>
              <span
                style={{
                  color:
                    label === "O" || label === "C"
                      ? tooltip.candle!.close >= tooltip.candle!.open
                        ? "#35D07F"
                        : "#E05A5A"
                      : "oklch(0.85 0.01 240)",
                }}
              >
                {value >= 1000
                  ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : `$${value.toFixed(4)}`}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ color: "oklch(0.55 0.02 240)" }}>Vol:</span>
            <span style={{ color: "oklch(0.65 0.02 240)" }}>
              {tooltip.candle.volume}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function CandleChartInner({
  data,
  yMin,
  yMax,
  margin,
  height,
}: {
  data: OHLCData[];
  yMin: number;
  yMax: number;
  margin: { top: number; right: number; bottom: number; left: number };
  height: number;
}) {
  // We use a foreign object trick with a percent-based approach.
  // Instead, use SVG with a viewBox approach via a wrapper that expands.
  // For responsive width, render as a % SVG element using preserveAspectRatio.
  // We'll use a fixed internal width of 600.
  const INNER_W = 600;
  const INNER_H = height - margin.top - margin.bottom;
  const n = data.length;

  const scaleY = (v: number) =>
    margin.top + INNER_H - ((v - yMin) / (yMax - yMin)) * INNER_H;
  const scaleX = (i: number) =>
    margin.left + (i / (n - 1)) * (INNER_W - margin.left - margin.right);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const steps = 5;
    return Array.from({ length: steps }, (_, i) => {
      const val = yMin + (i / (steps - 1)) * (yMax - yMin);
      return val;
    });
  }, [yMin, yMax]);

  // X-axis labels (show every ~5th)
  const xLabels = useMemo(() => {
    const interval = Math.max(1, Math.floor(n / 6));
    return data
      .map((d, i) => ({ label: d.time, i }))
      .filter((_, i) => i % interval === 0 || i === n - 1);
  }, [data, n]);

  const candleWidth = Math.max(
    3,
    Math.min(12, ((INNER_W - margin.left - margin.right) / n) * 0.6),
  );

  return (
    <svg
      role="img"
      aria-label="Candlestick chart inner"
      viewBox={`0 0 ${INNER_W} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
    >
      {/* Grid lines */}
      {yTicks.map((v) => (
        <line
          key={v}
          x1={margin.left}
          x2={INNER_W - margin.right}
          y1={scaleY(v)}
          y2={scaleY(v)}
          stroke="oklch(0.28 0.02 240 / 0.4)"
          strokeDasharray="3 3"
          strokeWidth={0.8}
        />
      ))}

      {/* Y axis labels */}
      {yTicks.map((v) => (
        <text
          key={v}
          x={INNER_W - margin.right + 4}
          y={scaleY(v) + 3}
          fill="oklch(0.62 0.025 240)"
          fontSize={9}
          fontFamily="monospace"
        >
          {v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`}
        </text>
      ))}

      {/* X axis labels */}
      {xLabels.map(({ label, i }) => (
        <text
          key={i}
          x={scaleX(i)}
          y={height - 6}
          fill="oklch(0.62 0.025 240)"
          fontSize={8}
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}

      {/* MA line */}
      <polyline
        points={data.map((d, i) => `${scaleX(i)},${scaleY(d.close)}`).join(" ")}
        fill="none"
        stroke="oklch(0.82 0.18 168)"
        strokeWidth={1.5}
        opacity={0.35}
        strokeLinejoin="round"
      />

      {/* Candlesticks */}
      {data.map((d, i) => {
        const isGreen = d.close >= d.open;
        const color = isGreen ? "#35D07F" : "#E05A5A";
        const cx = scaleX(i);
        const bodyTop = scaleY(Math.max(d.open, d.close));
        const bodyBottom = scaleY(Math.min(d.open, d.close));
        const bodyHeight = Math.max(1.5, bodyBottom - bodyTop);
        const wickTop = scaleY(d.high);
        const wickBottom = scaleY(d.low);

        return (
          <g key={d.time}>
            {/* Upper wick */}
            <line
              x1={cx}
              y1={wickTop}
              x2={cx}
              y2={bodyTop}
              stroke={color}
              strokeWidth={1.2}
            />
            {/* Body */}
            <rect
              x={cx - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              opacity={0.9}
              rx={0.8}
            />
            {/* Lower wick */}
            <line
              x1={cx}
              y1={bodyBottom}
              x2={cx}
              y2={wickBottom}
              stroke={color}
              strokeWidth={1.2}
            />
          </g>
        );
      })}
    </svg>
  );
}

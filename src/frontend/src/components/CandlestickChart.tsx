import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OHLCData } from "../types/trading";

interface CandlestickChartProps {
  data: OHLCData[];
}

interface CandleBarShape {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  open?: number;
  close?: number;
  value?: [number, number];
}

function CandleBar(props: CandleBarShape) {
  const { x = 0, width = 0, open = 0, close = 0, value } = props;
  if (!value) return null;

  const isGreen = close >= open;
  const color = isGreen ? "#35D07F" : "#E05A5A";

  const yMin = value[0];
  const yMax = value[1];
  const barHeight = Math.abs(yMax - yMin);
  const barY = Math.min(yMax, yMin);
  const cx = x + width / 2;

  return (
    <g>
      <rect
        x={x + width * 0.15}
        y={barY}
        width={width * 0.7}
        height={Math.max(barHeight, 1)}
        fill={color}
        opacity={0.9}
        rx={1}
      />
      <line
        x1={cx}
        y1={barY}
        x2={cx}
        y2={barY + barHeight}
        stroke={color}
        strokeWidth={1}
        opacity={0.6}
      />
    </g>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: OHLCData }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isGreen = d.close >= d.open;
  return (
    <div
      className="rounded-lg p-3 text-xs font-mono space-y-1"
      style={{
        background: "oklch(0.19 0.016 240)",
        border: "1px solid oklch(0.28 0.02 240)",
      }}
    >
      <div className="font-semibold text-foreground mb-1">{label}</div>
      <div>
        O:{" "}
        <span style={{ color: isGreen ? "#35D07F" : "#E05A5A" }}>
          ${d.open.toFixed(2)}
        </span>
      </div>
      <div>
        H: <span className="text-foreground">${d.high.toFixed(2)}</span>
      </div>
      <div>
        L: <span className="text-foreground">${d.low.toFixed(2)}</span>
      </div>
      <div>
        C:{" "}
        <span style={{ color: isGreen ? "#35D07F" : "#E05A5A" }}>
          ${d.close.toFixed(2)}
        </span>
      </div>
      <div>
        Vol: <span className="text-muted-foreground">{d.volume}</span>
      </div>
    </div>
  );
};

export function CandlestickChart({ data }: CandlestickChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)] as [
          number,
          number,
        ],
        isGreen: d.close >= d.open,
      })),
    [data],
  );

  const prices = data.flatMap((d) => [d.low, d.high]);
  const yMin = Math.min(...prices) * 0.998;
  const yMax = Math.max(...prices) * 1.002;

  const visibleData = chartData.slice(-30);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart
        data={visibleData}
        margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.28 0.02 240 / 0.5)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tick={{ fill: "oklch(0.62 0.025 240)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fill: "oklch(0.62 0.025 240)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`
          }
          width={65}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="bodyRange"
          shape={(props: CandleBarShape) => {
            const item = visibleData.find(
              (d) => d.time === (props as { time?: string }).time,
            );
            return (
              <CandleBar
                {...props}
                open={item?.open ?? 0}
                close={item?.close ?? 0}
              />
            );
          }}
        >
          {visibleData.map((entry) => (
            <Cell
              key={`cell-${entry.time}`}
              fill={entry.isGreen ? "#35D07F" : "#E05A5A"}
            />
          ))}
        </Bar>
        <Line
          type="monotone"
          dataKey="close"
          stroke="oklch(0.82 0.18 168)"
          dot={false}
          strokeWidth={1}
          opacity={0.4}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

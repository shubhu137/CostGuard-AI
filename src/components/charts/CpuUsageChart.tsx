"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

interface CpuUsageChartProps {
  data: number[];
  instanceName: string;
  instanceType: string;
  avgCpu: number;
  className?: string;
  compact?: boolean;
  color?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs border"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div className="font-semibold text-foreground mb-0.5">{label}</div>
      <div className="text-muted-foreground">
        CPU:{" "}
        <span
          className={cn(
            "font-bold",
            value < 10
              ? "text-red-400"
              : value < 20
              ? "text-orange-400"
              : value < 50
              ? "text-yellow-400"
              : "text-emerald-400"
          )}
        >
          {value?.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function CpuUsageChart({
  data,
  instanceName,
  instanceType,
  avgCpu,
  className,
  compact = false,
  color = "#6366f1",
}: CpuUsageChartProps) {
  const chartData = data.map((cpu, i) => ({
    day: DAYS[i] || `Day ${i + 1}`,
    cpu: parseFloat(cpu.toFixed(1)),
  }));

  const isUnderUtilized = avgCpu < 20;

  return (
    <div className={cn("w-full", className)}>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-foreground">
              {instanceName}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {instanceType} · 7-day CPU utilization
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg",
              isUnderUtilized
                ? "text-orange-400 bg-orange-400/10"
                : "text-emerald-400 bg-emerald-400/10"
            )}
          >
            ⌀ {avgCpu.toFixed(1)}% avg
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={compact ? 80 : 160}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: compact ? -30 : -10 }}>
          {!compact && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
          )}
          <XAxis
            dataKey="day"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          {!compact && (
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
          )}
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine
            y={20}
            stroke="rgba(239,68,68,0.4)"
            strokeDasharray="4 4"
            label={
              compact
                ? undefined
                : {
                    value: "20% threshold",
                    fill: "rgba(239,68,68,0.6)",
                    fontSize: 10,
                    position: "insideTopRight",
                  }
            }
          />
          <defs>
            <linearGradient id={`cpuGrad-${instanceName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="cpu"
            stroke={isUnderUtilized ? "#f97316" : color}
            strokeWidth={2}
            dot={{ fill: isUnderUtilized ? "#f97316" : color, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

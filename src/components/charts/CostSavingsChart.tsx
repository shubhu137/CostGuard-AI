"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface CostSavingsChartProps {
  data: Array<{ name: string; savings: number; type?: string }>;
  type?: "bar" | "area";
  className?: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs border"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div className="font-semibold text-foreground mb-0.5 max-w-[140px] truncate">
        {label}
      </div>
      <div className="text-emerald-400 font-bold">
        ${payload[0]?.value?.toFixed(0)}/mo potential savings
      </div>
    </div>
  );
}

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6"];

export function CostSavingsChart({ data, type = "bar", className }: CostSavingsChartProps) {
  if (type === "area") {
    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsGrad)" dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={40}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="savings" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- Before/After Cost Comparison Bar Chart ----

interface ComparisonBarProps {
  items: Array<{
    name: string;
    current: number;
    projected: number;
    instanceType: string;
    recommendedType: string;
  }>;
  className?: string;
}

function ComparisonTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs border space-y-1"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", border: "1px solid var(--glass-border)" }}
    >
      <div className="font-semibold text-foreground">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.fill }}>
          {p.name === "current" ? "Current" : "After Downsize"}: ${p.value?.toFixed(0)}/mo
        </div>
      ))}
      {payload.length === 2 && (
        <div className="text-emerald-400 font-semibold border-t border-border/30 pt-1">
          Save: ${(payload[0].value - payload[1].value).toFixed(0)}/mo
        </div>
      )}
    </div>
  );
}

export function ComparisonBarChart({ items, className }: ComparisonBarProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={items} margin={{ top: 4, right: 4, bottom: 20, left: -10 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            angle={-15}
            textAnchor="end"
            height={40}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<ComparisonTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Bar dataKey="current" name="current" fill="#6366f1" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
          <Bar dataKey="projected" name="projected" fill="#10b981" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 justify-center mt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-sm bg-indigo-500/70" />
          Current Cost
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/70" />
          After Rightsizing
        </div>
      </div>
    </div>
  );
}

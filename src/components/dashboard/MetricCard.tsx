"use client";

import { useEffect, useRef, useState } from "react";
import { cn, easeOutCubic, clamp } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "primary" | "success" | "danger" | "warning" | "info";
  animate?: boolean;
  delay?: number;
  flash?: boolean;   // true briefly when live data updates
  className?: string;
}

const colorMap = {
  primary: {
    icon: "bg-indigo-500/15 text-indigo-400",
    border: "hover:border-indigo-500/30",
    glow: "hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)]",
    gradient: "from-indigo-500/10 via-transparent to-transparent",
    ambientGlow: "rgba(99,102,241,0.08)",
  },
  success: {
    icon: "bg-emerald-500/15 text-emerald-400",
    border: "hover:border-emerald-500/30",
    glow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]",
    gradient: "from-emerald-500/10 via-transparent to-transparent",
    ambientGlow: "rgba(16,185,129,0.08)",
  },
  danger: {
    icon: "bg-red-500/15 text-red-400",
    border: "hover:border-red-500/30",
    glow: "hover:shadow-[0_20px_40px_rgba(239,68,68,0.15)]",
    gradient: "from-red-500/10 via-transparent to-transparent",
    ambientGlow: "rgba(239,68,68,0.08)",
  },
  warning: {
    icon: "bg-amber-500/15 text-amber-400",
    border: "hover:border-amber-500/30",
    glow: "hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)]",
    gradient: "from-amber-500/10 via-transparent to-transparent",
    ambientGlow: "rgba(245,158,11,0.08)",
  },
  info: {
    icon: "bg-cyan-500/15 text-cyan-400",
    border: "hover:border-cyan-500/30",
    glow: "hover:shadow-[0_20px_40px_rgba(6,182,212,0.15)]",
    gradient: "from-cyan-500/10 via-transparent to-transparent",
    ambientGlow: "rgba(6,182,212,0.08)",
  },
};

/** Animated counter — no Math.* */
function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const duration = 900;
    const startVal = prevRef.current;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      // clamp 0-1 without Math
      const rawProgress = elapsed / duration;
      const progress = rawProgress < 0 ? 0 : rawProgress > 1 ? 1 : rawProgress;
      // easeOutCubic without Math.pow
      const eased = easeOutCubic(progress);
      const current = startVal + (value - startVal) * eased;
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = value;
        setDisplay(value);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  // Format with K suffix — no Math
  const abs = display < 0 ? -display : display;
  const formatted =
    abs >= 1000
      ? `${(display / 1000).toFixed(1)}K`
      : display.toFixed(0);

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function MetricCard({
  title,
  value,
  prefix = "",
  suffix = "",
  subtitle,
  icon,
  trend,
  color = "primary",
  animate = true,
  delay = 0,
  flash = false,
  className,
}: MetricCardProps) {
  const [visible, setVisible] = useState(false);
  const colors = colorMap[color];
  const numericValue =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Absolute value without Math.abs
  const trendAbs = trend ? (trend.value < 0 ? -trend.value : trend.value) : 0;

  return (
    <div
      className={cn(
        "metric-card group transition-all duration-500 ease-out border",
        colors.border,
        colors.glow,
        animate
          ? visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
          : "opacity-100",
        flash
          ? "border-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          : "border-border/50",
        "transform transition-[opacity,transform,box-shadow,border-color] duration-500",
        className
      )}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${colors.ambientGlow}, transparent 60%)`,
        }}
      />
      {/* Flash overlay on update */}
      {flash && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
          style={{ background: "rgba(99,102,241,0.04)" }} />
      )}
      {/* Top gradient */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-24 rounded-t-2xl bg-gradient-to-b pointer-events-none",
          colors.gradient
        )}
      />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-200 group-hover:scale-110",
              colors.icon
            )}
          >
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trend.value >= 0 ? "text-red-400" : "text-emerald-400"
              )}
            >
              <span>{trend.value >= 0 ? "↑" : "↓"}</span>
              <span>{trendAbs}%</span>
            </div>
          )}
        </div>

        <div className="text-3xl font-bold text-foreground tracking-tight mb-1">
          {typeof value === "number" && animate ? (
            <AnimatedNumber value={numericValue} prefix={prefix} suffix={suffix} />
          ) : (
            <span>
              {prefix}{value}{suffix}
            </span>
          )}
        </div>

        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground/60 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

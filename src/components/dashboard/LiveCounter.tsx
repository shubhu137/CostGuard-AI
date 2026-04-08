"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp } from "lucide-react";
import { cn, easeOutCubic, clamp } from "@/lib/utils";

interface LiveCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  description?: string;
  color?: "green" | "blue" | "purple";
  className?: string;
}

export function LiveCounter({
  target,
  prefix = "$",
  suffix = "",
  label = "Total Cost Saved",
  description = "Estimated monthly savings",
  color = "green",
  className,
}: LiveCounterProps) {
  const [value, setValue] = useState(0);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const prevTargetRef = useRef(0);

  const colorStyles = {
    green: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
      gradientText: "from-emerald-400 to-cyan-400",
      icon: "bg-emerald-500/20 text-emerald-400",
      pulse: "bg-emerald-400",
      fillBg: "rgba(16,185,129,0.6)",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      glow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]",
      gradientText: "from-blue-400 to-indigo-400",
      icon: "bg-blue-500/20 text-blue-400",
      pulse: "bg-blue-400",
      fillBg: "rgba(59,130,246,0.6)",
    },
    purple: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      text: "text-violet-400",
      glow: "shadow-[0_0_40px_rgba(139,92,246,0.15)]",
      gradientText: "from-violet-400 to-purple-400",
      icon: "bg-violet-500/20 text-violet-400",
      pulse: "bg-violet-400",
      fillBg: "rgba(139,92,246,0.6)",
    },
  };

  const styles = colorStyles[color];

  // Animate from current value to new target — no Math.*
  useEffect(() => {
    if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);

    const startVal = prevTargetRef.current;
    const endVal = target;
    const startTime = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawT = elapsed / duration;
      // clamp without Math
      const t = rawT < 0 ? 0 : rawT > 1 ? 1 : rawT;
      const eased = easeOutCubic(t);
      setValue(startVal + (endVal - startVal) * eased);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevTargetRef.current = endVal;
        setValue(endVal);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [target]);

  // Pulse animation every 4 seconds (live feel)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsIncrementing(true);
      const t = setTimeout(() => setIsIncrementing(false), 600);
      return () => clearTimeout(t);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Format without Math
  const absValue = value < 0 ? -value : value;
  const formatted =
    absValue >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : value.toFixed(0);

  // Progress 0–100 without Math
  const progressPct =
    target > 0
      ? clamp((value / target) * 100, 0, 100)
      : 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 border transition-all duration-300",
        styles.bg,
        styles.border,
        styles.glow,
        className
      )}
    >
      {/* Background orb */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 -translate-y-12 translate-x-12 pointer-events-none blur-2xl"
        style={{ background: `radial-gradient(circle, ${styles.fillBg}, transparent)` }}
      />

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-transform duration-300",
            styles.icon,
            isIncrementing && "scale-110"
          )}
        >
          <TrendingUp className="w-6 h-6" />
        </div>

        <div className="flex-1">
          {/* Live pill */}
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", styles.pulse)} />
              <span className={cn("relative inline-flex rounded-full h-2 w-2", styles.pulse)} />
            </span>
            <span className={cn("text-xs font-semibold uppercase tracking-wide", styles.text)}>
              Live Counter
            </span>
          </div>

          {/* Value */}
          <div
            className={cn(
              "text-4xl font-black tracking-tighter bg-gradient-to-r bg-clip-text text-transparent transition-transform duration-200",
              styles.gradientText,
              isIncrementing && "scale-105"
            )}
          >
            {prefix}{formatted}{suffix}
          </div>

          <div className="text-sm font-semibold text-foreground mt-1">{label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>

          {/* Progress bar — no Math */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Recovery progress</span>
              <span className={cn("font-semibold", styles.text)}>
                {progressPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${styles.fillBg}, transparent)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

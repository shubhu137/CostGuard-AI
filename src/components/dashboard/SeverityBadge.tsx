"use client";

import { cn, getSeverityBg } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

const labelMap: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const dotColorMap: Record<string, string> = {
  critical: "bg-red-400",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-blue-400",
};

export function SeverityBadge({
  severity,
  size = "md",
  showDot = true,
  className,
}: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "severity-badge",
        getSeverityBg(severity),
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColorMap[severity] || "bg-gray-400"
          )}
        />
      )}
      {labelMap[severity] || severity}
    </span>
  );
}

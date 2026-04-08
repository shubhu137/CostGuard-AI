import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- No Math.* replacements ----

/** Floor via bitwise OR — no Math.floor */
export const floorInt = (x: number): number => x | 0;

/** Clamp without Math.min/max */
export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

/** Absolute value without Math.abs */
export const absVal = (x: number): number => (x < 0 ? -x : x);

/** Round without Math.round */
export const roundInt = (x: number): number => (x + 0.5) | 0;

/** Cubic ease-out — replaces Math.pow */
export const easeOutCubic = (t: number): number => {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  const v = 1 - clamped;
  return 1 - v * v * v;
};

// ---- Formatting ----

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDecimal(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Simple average — no Math */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}

// ---- Severity helpers ----

export function getSeverityColor(severity: string): string {
  if (severity === "critical") return "text-red-400";
  if (severity === "high") return "text-orange-400";
  if (severity === "medium") return "text-yellow-400";
  if (severity === "low") return "text-blue-400";
  return "text-gray-400";
}

export function getSeverityBg(severity: string): string {
  if (severity === "critical") return "bg-red-500/10 border-red-500/30 text-red-400";
  if (severity === "high") return "bg-orange-500/10 border-orange-500/30 text-orange-400";
  if (severity === "medium") return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
  if (severity === "low") return "bg-blue-500/10 border-blue-500/30 text-blue-400";
  return "bg-gray-500/10 border-gray-500/30 text-gray-400";
}

export function getSeverityGlow(severity: string): string {
  if (severity === "critical") return "shadow-glow-danger";
  if (severity === "high") return "shadow-[0_0_20px_rgba(249,115,22,0.2)]";
  if (severity === "medium") return "shadow-[0_0_20px_rgba(234,179,8,0.2)]";
  if (severity === "low") return "shadow-[0_0_20px_rgba(59,130,246,0.2)]";
  return "";
}

export function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffDays = floorInt(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = floorInt(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function sortBySeverity<T extends { severity: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]
  );
}

// ---- Math.* replacements ----
export const floorInt = (x: number): number => x | 0;

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

export const absVal = (x: number): number => (x < 0 ? -x : x);

export const roundInt = (x: number): number => (x + 0.5) | 0;

export const easeOutCubic = (t: number): number => {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  const v = 1 - clamped;
  return 1 - v * v * v;
};

export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
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

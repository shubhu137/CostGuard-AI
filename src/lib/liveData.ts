// =============================================
// CostGuard AI — Real-Time Live Data Engine
// NO Math.* functions used anywhere in this file
// =============================================

import { mockInstances, mockVolumes, mockSecurityGroups, VOLUME_COST_PER_GB, RISKY_PORTS } from "./mockData";

// ---- Custom math replacements (no Math.*) ----

/** Floor via bitwise OR */
export const floorInt = (x: number): number => x | 0;

/** Clamp to [0, 1] without Math.min/max */
export const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Absolute value without Math.abs */
export const absVal = (x: number): number => (x < 0 ? -x : x);

/** Min without Math.min */
export const minVal = (a: number, b: number): number => (a < b ? a : b);

/** Max without Math.max */
export const maxVal = (a: number, b: number): number => (a > b ? a : b);

/** Clamp value to [lo, hi] without Math */
export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

/** Cubic ease-out without Math.pow — 1 - (1-t)^3 */
export const easeOutCubic = (t: number): number => {
  const v = 1 - clamp01(t);
  return 1 - v * v * v;
};

/** Simple average — no Math */
export const calcAverage = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
};

/** Round without Math.round */
export const roundInt = (x: number): number => (x + 0.5) | 0;

// =============================================
// Time-Slot Engine (changes every 15 seconds)
// =============================================

/**
 * Returns the current time slot (0–31).
 * Changes every 15 seconds — NO Math, pure bitwise.
 */
export const getTimeSlot = (): number => floorInt(Date.now() / 15000) % 32;

/**
 * Seconds until next time slot (for UI countdown).
 */
export const getSecondsUntilNextSlot = (): number => {
  const nowMs = Date.now();
  const slotMs = 15000;
  const elapsed = nowMs % slotMs;
  return floorInt((slotMs - elapsed) / 1000);
};

// =============================================
// Pre-Built Lookup Tables (no Math.random)
// 32 slots × variation values
// =============================================

/**
 * CPU delta table: ±delta applied to each instance's base CPU readings.
 * 32 pre-defined values cycling through time slots.
 * Chosen so borderline instances (~18-22% avg) oscillate above and below the 20% threshold.
 */
const CPU_DELTA_TABLE: readonly number[] = [
  -3, -1, 2, -2, 1, 3, -1, 0,
   2, -3, 1, -2, 3, 0, -1, 2,
  -2,  3, 0, -1, 2, -3, 1, -2,
   0,  2, -1, 3, -3, 1, 0, -2,
];

/**
 * Per-instance fine-tune delta (so not all instances move identically).
 * One value per instance (8 instances).
 */
const INSTANCE_FINE_DELTAS: readonly number[] = [0, 2, -1, 1, -2, 0, 3, -1];

/**
 * Volume cost variance table: small ±$/mo fluctuations to simulate usage changes.
 */
const COST_VARIANCE_TABLE: readonly number[] = [
  0, 2, -1, 3, 1, -2, 0, 2,
 -3, 1,  2, -1, 0, 3, -2, 1,
  1, -1,  2,  0, -2, 3, 1, -1,
  2,  0, -2,  1,  3, -1, 0, 2,
];

/**
 * Volume attachment churn table: index mod 32 determines which volumes
 * temporarily "re-attach" (simulating infra changes).
 * 0 = detached (issue), 1 = attached (resolved for this slot).
 *
 * Layout: [slotIndex] → bitmask of which unattached volumes are "re-attached"
 * We have 6 unattached volumes (indices 0-5 in unattached array).
 * Bit 0 = vol 0, bit 1 = vol 1, etc.
 */
const VOLUME_REATTACH_TABLE: readonly number[] = [
  0b000000, 0b000001, 0b000000, 0b000010, 0b000000, 0b000001, 0b000000, 0b000000,
  0b000100, 0b000000, 0b000001, 0b000000, 0b000000, 0b000010, 0b000000, 0b000001,
  0b000000, 0b000000, 0b000100, 0b000001, 0b000000, 0b000000, 0b000010, 0b000000,
  0b000001, 0b000000, 0b000000, 0b000100, 0b000000, 0b000010, 0b000000, 0b000001,
];

/**
 * Security group "temporarily patched" table.
 * Some slots simulate a DevOps engineer having restricted a rule — then it reverts.
 * Bit mask of which issues are "temporarily fixed" per slot.
 */
const SEC_PATCH_TABLE: readonly number[] = [
  0b00000000, 0b00000001, 0b00000000, 0b00000000, 0b00000010, 0b00000000, 0b00000001, 0b00000000,
  0b00000000, 0b00000000, 0b00000001, 0b00000000, 0b00000100, 0b00000000, 0b00000000, 0b00000001,
  0b00000000, 0b00000010, 0b00000000, 0b00000001, 0b00000000, 0b00000000, 0b00000001, 0b00000000,
  0b00000100, 0b00000000, 0b00000001, 0b00000000, 0b00000000, 0b00000001, 0b00000000, 0b00000010,
];

// =============================================
// Live CPU Generator
// =============================================

export interface LiveInstance {
  id: string;
  name: string;
  type: string;
  region: string;
  os: string;
  state: string;
  cpuUsage: number[];   // 7-day live readings
  avgCpu: number;
  monthlyCost: number;
  launchTime: string;
  tags: Record<string, string>;
  slot: number;         // current time slot (for UI)
}

export function getLiveInstances(): LiveInstance[] {
  const slot = getTimeSlot();
  const delta = CPU_DELTA_TABLE[slot];

  return mockInstances.map((inst, idx) => {
    const fineDelta = INSTANCE_FINE_DELTAS[idx % INSTANCE_FINE_DELTAS.length];
    const totalDelta = delta + fineDelta;

    const liveCpu = inst.cpuUsage.map((base) => {
      const raw = base + totalDelta;
      return clamp(raw, 2, 95);
    });

    return {
      ...inst,
      cpuUsage: liveCpu,
      avgCpu: calcAverage(liveCpu),
      slot,
    };
  });
}

// =============================================
// Live Volume Generator
// =============================================

export interface LiveVolume {
  id: string;
  name: string;
  size: number;
  volumeType: string;
  region: string;
  state: "in-use" | "available";
  attachedTo: string | null;
  monthlyCost: number;
  createTime: string;
  tags: Record<string, string>;
  isTemporarilyAttached: boolean; // true = resolved this slot
}

export function getLiveVolumes(): LiveVolume[] {
  const slot = getTimeSlot();
  const costVariance = COST_VARIANCE_TABLE[slot];
  const reattachMask = VOLUME_REATTACH_TABLE[slot];

  // Identify unattached volumes (the ones we track)
  let unattachedIdx = 0;

  return mockVolumes.map((vol) => {
    if (vol.state === "in-use") {
      return { ...vol, isTemporarilyAttached: false };
    }

    // Unattached — determine if "re-attached" this slot
    const bit = 1 << unattachedIdx;
    const isTemporarilyAttached = (reattachMask & bit) !== 0;
    unattachedIdx++;

    const rawCost = vol.monthlyCost + costVariance;
    const liveCost = clamp(rawCost, 1, vol.monthlyCost * 2);

    return {
      ...vol,
      monthlyCost: liveCost,
      state: isTemporarilyAttached ? ("in-use" as const) : ("available" as const),
      isTemporarilyAttached,
    };
  });
}

// =============================================
// Live Security Groups Generator
// =============================================

export interface LiveSecurityGroup {
  id: string;
  name: string;
  region: string;
  vpcId: string;
  inboundRules: Array<{
    protocol: string;
    fromPort: number;
    toPort: number;
    cidr: string;
    description: string;
  }>;
  associatedInstances: string[];
  tags: Record<string, string>;
  isTemporarilyPatched: boolean; // true = rule restricted this slot
}

export function getLiveSecurityGroups(): LiveSecurityGroup[] {
  const slot = getTimeSlot();
  const patchMask = SEC_PATCH_TABLE[slot];

  // Flatten all risky rules with index
  let ruleGlobalIdx = 0;

  return mockSecurityGroups.map((sg) => {
    const riskyRules = sg.inboundRules.filter(
      (r) => r.cidr === "0.0.0.0/0" || r.cidr === "::/0"
    );
    let anyPatched = false;

    for (let i = 0; i < riskyRules.length; i++) {
      const bit = 1 << ruleGlobalIdx;
      if ((patchMask & bit) !== 0) {
        anyPatched = true;
      }
      ruleGlobalIdx++;
    }

    return {
      id: sg.id,
      name: sg.name,
      region: sg.region,
      vpcId: sg.vpcId,
      inboundRules: sg.inboundRules,
      associatedInstances: sg.associatedInstances,
      tags: sg.tags,
      isTemporarilyPatched: anyPatched,
    };
  });
}

// =============================================
// Snapshot metadata for UI
// =============================================

export interface ScanMeta {
  slot: number;
  scanTime: string;
  nextScanIn: number; // seconds
  scanId: string;     // unique per slot (no Math)
}

export function getScanMeta(): ScanMeta {
  const slot = getTimeSlot();
  const nextIn = getSecondsUntilNextSlot();
  const now = new Date();

  // Build scanId from slot + timestamp components (no Math)
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  const s = floorInt(now.getUTCSeconds() / 15) * 15; // quantized
  const scanId = `scan-${slot}-${h}${m < 10 ? "0" : ""}${m}${s < 10 ? "0" : ""}${s}`;

  return {
    slot,
    scanTime: now.toISOString(),
    nextScanIn: nextIn,
    scanId,
  };
}

import { mockInstances, mockVolumes, mockSecurityGroups, VOLUME_COST_PER_GB, RISKY_PORTS } from "./mockData";
import { floorInt, clamp, absVal } from "./utils";

export const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
export const calcAverage = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
};

export const getTimeSlot = (): number => floorInt(Date.now() / 15000) % 32;

export const getSecondsUntilNextSlot = (): number => {
  const nowMs = Date.now();
  const slotMs = 15000;
  const elapsed = nowMs % slotMs;
  return floorInt((slotMs - elapsed) / 1000);
};

const CPU_DELTA_TABLE: readonly number[] = [
  -3, -1, 2, -2, 1, 3, -1, 0, 2, -3, 1, -2, 3, 0, -1, 2,
  -2,  3, 0, -1, 2, -3, 1, -2, 0,  2, -1, 3, -3, 1, 0, -2,
];
const INSTANCE_FINE_DELTAS: readonly number[] = [0, 2, -1, 1, -2, 0, 3, -1];
const COST_VARIANCE_TABLE: readonly number[] = [
  0, 2, -1, 3, 1, -2, 0, 2, -3, 1,  2, -1, 0, 3, -2, 1,
  1, -1,  2,  0, -2, 3, 1, -1, 2,  0, -2,  1,  3, -1, 0, 2,
];
const VOLUME_REATTACH_TABLE: readonly number[] = [
  0b000000, 0b000001, 0b000000, 0b000010, 0b000000, 0b000001, 0b000000, 0b000000,
  0b000100, 0b000000, 0b000001, 0b000000, 0b000000, 0b000010, 0b000000, 0b000001,
  0b000000, 0b000000, 0b000100, 0b000001, 0b000000, 0b000000, 0b000010, 0b000000,
  0b000001, 0b000000, 0b000000, 0b000100, 0b000000, 0b000010, 0b000000, 0b000001,
];
const SEC_PATCH_TABLE: readonly number[] = [
  0b00000000, 0b00000001, 0b00000000, 0b00000000, 0b00000010, 0b00000000, 0b00000001, 0b00000000,
  0b00000000, 0b00000000, 0b00000001, 0b00000000, 0b00000100, 0b00000000, 0b00000000, 0b00000001,
  0b00000000, 0b00000010, 0b00000000, 0b00000001, 0b00000000, 0b00000000, 0b00000001, 0b00000000,
  0b00000100, 0b00000000, 0b00000001, 0b00000000, 0b00000000, 0b00000001, 0b00000000, 0b00000010,
];

export interface LiveInstance { id: string; name: string; type: string; region: string; os: string; state: string; cpuUsage: number[]; avgCpu: number; monthlyCost: number; launchTime: string; tags: Record<string, string>; slot: number; }

export function getLiveInstances(): LiveInstance[] {
  const slot = getTimeSlot();
  const delta = CPU_DELTA_TABLE[slot];
  return mockInstances.map((inst, idx) => {
    const fineDelta = INSTANCE_FINE_DELTAS[idx % INSTANCE_FINE_DELTAS.length];
    const totalDelta = delta + fineDelta;
    const liveCpu = inst.cpuUsage.map((base) => clamp(base + totalDelta, 2, 95));
    return { ...inst, cpuUsage: liveCpu, avgCpu: calcAverage(liveCpu), slot };
  });
}

export interface LiveVolume { id: string; name: string; size: number; volumeType: string; region: string; state: "in-use" | "available"; attachedTo: string | null; monthlyCost: number; createTime: string; tags: Record<string, string>; isTemporarilyAttached: boolean; }

export function getLiveVolumes(): LiveVolume[] {
  const slot = getTimeSlot();
  const costVariance = COST_VARIANCE_TABLE[slot];
  const reattachMask = VOLUME_REATTACH_TABLE[slot];
  let unattachedIdx = 0;

  return mockVolumes.map((vol) => {
    if (vol.state === "in-use") return { ...vol, isTemporarilyAttached: false };
    const bit = 1 << unattachedIdx++;
    const isTemporarilyAttached = (reattachMask & bit) !== 0;
    const liveCost = clamp(vol.monthlyCost + costVariance, 1, vol.monthlyCost * 2);
    return { ...vol, monthlyCost: liveCost, state: isTemporarilyAttached ? "in-use" : "available", isTemporarilyAttached };
  });
}

export interface LiveSecurityGroup { id: string; name: string; region: string; vpcId: string; inboundRules: any[]; associatedInstances: string[]; tags: Record<string, string>; isTemporarilyPatched: boolean; }

export function getLiveSecurityGroups(): LiveSecurityGroup[] {
  const slot = getTimeSlot();
  const patchMask = SEC_PATCH_TABLE[slot];
  let ruleGlobalIdx = 0;

  return mockSecurityGroups.map((sg) => {
    const riskyRules = sg.inboundRules.filter((r) => r.cidr === "0.0.0.0/0" || r.cidr === "::/0");
    let anyPatched = false;
    for (let i = 0; i < riskyRules.length; i++) {
      if ((patchMask & (1 << ruleGlobalIdx++)) !== 0) anyPatched = true;
    }
    return { ...sg, isTemporarilyPatched: anyPatched };
  });
}

export interface ScanMeta { slot: number; scanTime: string; nextScanIn: number; scanId: string; }

export function getScanMeta(): ScanMeta {
  const slot = getTimeSlot();
  const nextIn = getSecondsUntilNextSlot();
  const now = new Date();
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  const s = floorInt(now.getUTCSeconds() / 15) * 15;
  const scanId = `scan-${slot}-${h}${m < 10 ? "0" : ""}${m}${s < 10 ? "0" : ""}${s}`;
  return { slot, scanTime: now.toISOString(), nextScanIn: nextIn, scanId };
}

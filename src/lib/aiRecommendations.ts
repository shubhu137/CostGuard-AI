// =============================================
// CostGuard AI — AI-Style Recommendation Generator
// =============================================

interface AIContext {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  issue: string;
  metadata?: Record<string, unknown>;
}

const costExplanations = [
  (ctx: AIContext & { size?: number; days?: number; cost?: number }) =>
    `The ${ctx.resourceName} (${ctx.resourceId}) is an unattached ${ctx.size}GB ${ctx.resourceType} volume that has been sitting idle for ${ctx.days || "several"} days. At $${ctx.cost?.toFixed(2)}/month, this is pure waste — the data it contains is likely stale or already replicated elsewhere. Safely deleting or snapshotting this volume before deletion is the recommended action.`,

  (ctx: AIContext & { size?: number; days?: number; cost?: number }) =>
    `Orphaned storage detected: ${ctx.resourceName} (${ctx.resourceId}) is a ${ctx.size}GB volume with no attached instance. This volume is actively billed at approximately $${ctx.cost?.toFixed(2)} per month despite serving no active workload. Consider creating a final snapshot for archival before terminating to recover these unnecessary costs.`,

  (ctx: AIContext & { size?: number; days?: number; cost?: number }) =>
    `Cost Intelligence Alert: The storage volume ${ctx.resourceId} (${ctx.size}GB) has been detached from any instance and continues to accrue charges of ~$${ctx.cost?.toFixed(2)}/month. Based on its creation date and lack of recent attachment, CostGuard recommends immediate review and deletion after verifying no critical data resides within.`,
];

const securityExplanations = [
  (ctx: AIContext & { port?: number; portName?: string; cidr?: string }) =>
    `Critical exposure detected on ${ctx.resourceName} (${ctx.resourceId}): Port ${ctx.port} (${ctx.portName}) is openly accessible from the entire internet (${ctx.cidr}). This represents a significant attack surface — any malicious actor can attempt to exploit this service. Immediate restriction to known IP ranges or a VPN CIDR block is strongly recommended.`,

  (ctx: AIContext & { port?: number; portName?: string; cidr?: string }) =>
    `Security Intelligence: The rule in ${ctx.resourceName} allows unrestricted inbound access on port ${ctx.port} (${ctx.portName}) from ${ctx.cidr}. This is a high-confidence security risk that could lead to unauthorized access, data breaches, or system compromise. Replace with a specific company IP range or implement VPN-based access controls immediately.`,

  (ctx: AIContext & { port?: number; portName?: string; cidr?: string }) =>
    `The security group ${ctx.resourceId} has an overly permissive rule: port ${ctx.port} is exposed to the entire internet. This violates the principle of least privilege and creates an unacceptable risk posture. CostGuard AI recommends restricting access to your corporate VPN CIDR (e.g., 10.0.0.0/8) or a specific trusted IP range.`,
];

const usageExplanations = [
  (ctx: AIContext & { avgCpu?: number; currentType?: string; recommendedType?: string; currentCost?: number; projectedCost?: number }) =>
    `Efficiency opportunity identified for ${ctx.resourceName} (${ctx.resourceId}): This ${ctx.currentType} instance has averaged only ${ctx.avgCpu?.toFixed(1)}% CPU utilization over the past 7 days, indicating significant over-provisioning. Downsizing to a ${ctx.recommendedType} instance would save approximately $${((ctx.currentCost || 0) - (ctx.projectedCost || 0)).toFixed(0)}/month while maintaining full workload performance.`,

  (ctx: AIContext & { avgCpu?: number; currentType?: string; recommendedType?: string; currentCost?: number; projectedCost?: number }) =>
    `Rightsizing Alert: ${ctx.resourceName} (${ctx.currentType}) is running at a mere ${ctx.avgCpu?.toFixed(1)}% average CPU — well below the 20% efficiency threshold. This instance is paying for compute capacity it rarely uses. Migrating to a ${ctx.recommendedType} would reduce your monthly spend from $${ctx.currentCost?.toFixed(0)} to approximately $${ctx.projectedCost?.toFixed(0)}, a ${(((ctx.currentCost || 1) - (ctx.projectedCost || 0)) / (ctx.currentCost || 1) * 100).toFixed(0)}% savings.`,

  (ctx: AIContext & { avgCpu?: number; currentType?: string; recommendedType?: string; currentCost?: number; projectedCost?: number }) =>
    `Cloud Optimization: The ${ctx.resourceId} instance (${ctx.currentType}) shows a 7-day average CPU of ${ctx.avgCpu?.toFixed(1)}%, which falls significantly below optimal utilization. CostGuard AI's rightsizing engine recommends transitioning to a ${ctx.recommendedType} instance — this preserves your workload capacity while eliminating $${((ctx.currentCost || 0) - (ctx.projectedCost || 0)).toFixed(0)}/month in unnecessary infrastructure spend.`,
];

function pickExplanation<T>(explanations: ((ctx: T) => string)[], id: string): (ctx: T) => string {
  // Deterministic pick based on resource ID so same resource always gets same explanation
  const idx = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % explanations.length;
  return explanations[idx];
}

export function generateCostAIExplanation(
  resourceId: string,
  resourceName: string,
  volumeType: string,
  size: number,
  cost: number
): string {
  const fn = pickExplanation(costExplanations, resourceId);
  return fn({ resourceId, resourceName, resourceType: volumeType, issue: "unattached", size, cost });
}

export function generateSecurityAIExplanation(
  resourceId: string,
  resourceName: string,
  port: number,
  portName: string,
  cidr: string
): string {
  const fn = pickExplanation(securityExplanations, resourceId);
  return fn({ resourceId, resourceName, resourceType: "security_group", issue: "open_port", port, portName, cidr });
}

export function generateUsageAIExplanation(
  resourceId: string,
  resourceName: string,
  avgCpu: number,
  currentType: string,
  recommendedType: string,
  currentCost: number,
  projectedCost: number
): string {
  const fn = pickExplanation(usageExplanations, resourceId);
  return fn({ resourceId, resourceName, resourceType: "instance", issue: "low_cpu", avgCpu, currentType, recommendedType, currentCost, projectedCost });
}

export const TOP_RECOMMENDATIONS = [
  "Enable AWS Cost Anomaly Detection to receive alerts when spending patterns deviate unexpectedly.",
  "Implement resource tagging policies to ensure all cloud assets are properly attributed to teams and projects.",
  "Adopt Reserved Instances or Savings Plans for steady-state workloads with predictable usage patterns.",
  "Configure lifecycle policies for EBS snapshots and S3 objects to automatically archive or delete aged data.",
  "Enable VPC Flow Logs and GuardDuty for comprehensive network-level threat detection across all regions.",
  "Implement AWS Config rules to enforce security group best practices organization-wide.",
  "Use AWS Trusted Advisor weekly to continuously monitor cost, performance, and security recommendations.",
  "Consider migrating gp2 volumes to gp3 — same performance baseline at 20% lower cost.",
];

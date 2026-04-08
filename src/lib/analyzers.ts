import {
  getLiveInstances,
  getLiveVolumes,
  getLiveSecurityGroups,
  calcAverage,
  clamp,
  floorInt,
} from "./liveData";
import {
  generateCostAIExplanation,
  generateSecurityAIExplanation,
  generateUsageAIExplanation,
} from "./aiRecommendations";
import { VOLUME_COST_PER_GB, RISKY_PORTS } from "./mockData";
import { CostIssue, SecurityIssue, UsageIssue, Severity } from "@/types";

// =============================================
// Cost Analysis — Live unattached volumes
// =============================================

export function analyzeCosts(): CostIssue[] {
  const volumes = getLiveVolumes();
  const issues: CostIssue[] = [];

  for (const volume of volumes) {
    // Skip attached volumes (including temporarily re-attached ones)
    if (volume.state === "in-use") continue;

    const createdDate = new Date(volume.createTime);
    const now = new Date();
    const daysUnattached = floorInt(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let severity: Severity;
    if (volume.monthlyCost >= 100) severity = "critical";
    else if (volume.monthlyCost >= 50) severity = "high";
    else if (volume.monthlyCost >= 20) severity = "medium";
    else severity = "low";

    const costPerGB = VOLUME_COST_PER_GB[volume.volumeType] || 0.1;
    const snapshotCost = volume.size * costPerGB * 0.05;

    issues.push({
      id: `cost-${volume.id}`,
      type: "volume",
      resourceId: volume.id,
      resourceName: volume.name,
      issue: `Unattached ${volume.volumeType.toUpperCase()} volume — ${volume.size}GB idle for ${daysUnattached} days`,
      severity,
      recommendation: `Delete or snapshot (≈$${snapshotCost.toFixed(2)}/mo) before removing. Save $${volume.monthlyCost.toFixed(2)}/month.`,
      aiExplanation: generateCostAIExplanation(
        volume.id,
        volume.name,
        volume.volumeType,
        volume.size,
        volume.monthlyCost
      ),
      estimatedSavings: volume.monthlyCost,
      region: volume.region,
      volumeSize: volume.size,
      volumeType: volume.volumeType,
      wastePeriodDays: daysUnattached,
      metadata: {
        size: volume.size,
        volumeType: volume.volumeType,
        daysUnattached,
        costPerGB,
        createTime: volume.createTime,
        tags: volume.tags,
      },
      fixed: false,
    });
  }

  // Sort by savings descending
  return issues.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
}

// =============================================
// Security Analysis — Live risky rules
// =============================================

export function analyzeSecurity(): SecurityIssue[] {
  const sgs = getLiveSecurityGroups();
  const issues: SecurityIssue[] = [];

  for (const sg of sgs) {
    // Skip temporarily patched security groups
    if (sg.isTemporarilyPatched) continue;

    for (const rule of sg.inboundRules) {
      const isPublicCidr = rule.cidr === "0.0.0.0/0" || rule.cidr === "::/0";
      if (!isPublicCidr) continue;

      const portInfo = RISKY_PORTS[rule.fromPort];

      let severity: Severity;
      if ([22, 3389, 5432, 3306, 1433, 27017, 6379].includes(rule.fromPort)) {
        severity = "critical";
      } else if ([9200, 9090, 8080].includes(rule.fromPort)) {
        severity = "high";
      } else if ([3000, 8443].includes(rule.fromPort)) {
        severity = "medium";
      } else {
        severity = "low";
      }

      const suggestedCidr = "10.0.0.0/8";

      issues.push({
        id: `sec-${sg.id}-${rule.fromPort}`,
        type: "security_group",
        resourceId: sg.id,
        resourceName: sg.name,
        issue: `Port ${rule.fromPort}${portInfo ? ` (${portInfo.name})` : ""} open to ${rule.cidr}`,
        severity,
        recommendation: portInfo?.risk
          ? `${portInfo.risk}. Restrict to ${suggestedCidr}.`
          : `Restrict port ${rule.fromPort} to trusted CIDR blocks.`,
        aiExplanation: generateSecurityAIExplanation(
          sg.id,
          sg.name,
          rule.fromPort,
          portInfo?.name || `Port ${rule.fromPort}`,
          rule.cidr
        ),
        estimatedSavings: 0,
        region: sg.region,
        port: rule.fromPort,
        protocol: rule.protocol,
        cidr: rule.cidr,
        suggestedCidr,
        metadata: {
          vpcId: sg.vpcId,
          rule,
          associatedInstances: sg.associatedInstances,
          portInfo,
          tags: sg.tags,
        },
        fixed: false,
      });
    }
  }

  const order: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  return issues.sort((a, b) => order[b.severity] - order[a.severity]);
}

// =============================================
// Usage Analysis — Live under-utilized instances
// =============================================

const DOWNSIZE_MAP: Record<string, { to: string; costFactor: number }> = {
  "t3.xlarge":  { to: "t3.large",    costFactor: 0.5  },
  "t3.large":   { to: "t3.medium",   costFactor: 0.5  },
  "t3.medium":  { to: "t3.micro",    costFactor: 0.25 },
  "m5.2xlarge": { to: "m5.xlarge",   costFactor: 0.5  },
  "m5.4xlarge": { to: "m5.2xlarge",  costFactor: 0.5  },
  "c5.2xlarge": { to: "c5.xlarge",   costFactor: 0.5  },
  "c5.large":   { to: "c5.xlarge",   costFactor: 0.5  },
  "r5.large":   { to: "t3.large",    costFactor: 0.66 },
};

export function analyzeUsage(): UsageIssue[] {
  const instances = getLiveInstances();
  const issues: UsageIssue[] = [];

  for (const instance of instances) {
    const avgCpu = instance.avgCpu;

    // Only flag if LIVE average is under 20% threshold
    if (avgCpu >= 20) continue;

    const downsizeInfo = DOWNSIZE_MAP[instance.type];
    if (!downsizeInfo) continue;

    const projectedCost = instance.monthlyCost * downsizeInfo.costFactor;
    const savings = instance.monthlyCost - projectedCost;

    let severity: Severity;
    if (avgCpu < 10) severity = "critical";
    else if (avgCpu < 15) severity = "high";
    else severity = "medium";

    issues.push({
      id: `usage-${instance.id}`,
      type: "instance",
      resourceId: instance.id,
      resourceName: instance.name,
      issue: `${instance.type} running at ${avgCpu.toFixed(1)}% avg CPU — under-utilized`,
      severity,
      recommendation: `Downsize to ${downsizeInfo.to}. Save ~$${savings.toFixed(0)}/month.`,
      aiExplanation: generateUsageAIExplanation(
        instance.id,
        instance.name,
        avgCpu,
        instance.type,
        downsizeInfo.to,
        instance.monthlyCost,
        projectedCost
      ),
      estimatedSavings: savings,
      region: instance.region,
      currentInstanceType: instance.type,
      recommendedInstanceType: downsizeInfo.to,
      avgCpuPercent: avgCpu,
      cpuHistory: instance.cpuUsage,
      currentCost: instance.monthlyCost,
      projectedCost,
      metadata: {
        os: instance.os,
        launchTime: instance.launchTime,
        tags: instance.tags,
        cpuUsage: instance.cpuUsage,
      },
      fixed: false,
    });
  }

  return issues.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
}

// =============================================
// Combined Summary
// =============================================

export function buildSummary() {
  const costIssues = analyzeCosts();
  const securityIssues = analyzeSecurity();
  const usageIssues = analyzeUsage();
  const allIssues = [...costIssues, ...securityIssues, ...usageIssues];

  return {
    totalIssues: allIssues.length,
    criticalCount: allIssues.filter((i) => i.severity === "critical").length,
    highCount: allIssues.filter((i) => i.severity === "high").length,
    mediumCount: allIssues.filter((i) => i.severity === "medium").length,
    lowCount: allIssues.filter((i) => i.severity === "low").length,
    totalSavings:
      costIssues.reduce((s, i) => s + i.estimatedSavings, 0) +
      usageIssues.reduce((s, i) => s + i.estimatedSavings, 0),
    savingsByCategory: {
      cost: costIssues.reduce((s, i) => s + i.estimatedSavings, 0),
      usage: usageIssues.reduce((s, i) => s + i.estimatedSavings, 0),
      security: 0,
    },
    costIssues,
    securityIssues,
    usageIssues,
  };
}

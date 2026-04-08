import { getLiveInstances, getLiveVolumes, getLiveSecurityGroups } from "./liveData";
import { generateCostAIExplanation, generateSecurityAIExplanation, generateUsageAIExplanation, TOP_RECOMMENDATIONS } from "./aiRecommendations";
import { VOLUME_COST_PER_GB, RISKY_PORTS } from "./mockData";
import { CostIssue, SecurityIssue, UsageIssue, Severity } from "./types/index";

export function analyzeCosts(): CostIssue[] {
  const issues: CostIssue[] = [];
  for (const vol of getLiveVolumes()) {
    if (vol.state === "in-use") continue;
    const days = ((Date.now() - new Date(vol.createTime).getTime()) / 86400000) | 0;
    const cost = vol.monthlyCost;
    const sev: Severity = cost >= 100 ? "critical" : cost >= 50 ? "high" : cost >= 20 ? "medium" : "low";
    issues.push({
      id: `cost-${vol.id}`, type: "volume", resourceId: vol.id, resourceName: vol.name,
      issue: `Unattached ${vol.volumeType} idle`, severity: sev,
      recommendation: `Delete or snapshot. Save $${cost.toFixed(2)}/mo.`,
      aiExplanation: generateCostAIExplanation(vol.id, vol.name, vol.volumeType, vol.size, cost),
      estimatedSavings: cost, region: vol.region, volumeSize: vol.size, volumeType: vol.volumeType, wastePeriodDays: days,
      metadata: { size: vol.size, tags: vol.tags, daysUnattached: days, costPerGB: VOLUME_COST_PER_GB[vol.volumeType] }, fixed: false
    });
  }
  return issues.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
}

export function analyzeSecurity(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  for (const sg of getLiveSecurityGroups()) {
    if (sg.isTemporarilyPatched) continue;
    for (const rule of sg.inboundRules) {
      if (rule.cidr !== "0.0.0.0/0" && rule.cidr !== "::/0") continue;
      const portInfo = RISKY_PORTS[rule.fromPort];
      const p = rule.fromPort;
      const sev: Severity = [22,3389,5432,3306,1433,27017,6379].includes(p) ? "critical" : [9200,9090,8080].includes(p) ? "high" : [3000].includes(p) ? "medium" : "low";
      issues.push({
        id: `sec-${sg.id}-${p}`, type: "security_group", resourceId: sg.id, resourceName: sg.name,
        issue: `Port ${p} open to public`, severity: sev, recommendation: `Restrict to 10.0.0.0/8`,
        aiExplanation: generateSecurityAIExplanation(sg.id, sg.name, p, portInfo?.name || "Port", rule.cidr),
        estimatedSavings: 0, region: sg.region, port: p, protocol: rule.protocol, cidr: rule.cidr,
        metadata: { vpcId: sg.vpcId, tags: sg.tags }, fixed: false
      });
    }
  }
  return issues.sort((a, b) => (b.severity === "critical" ? 1 : 0) - (a.severity === "critical" ? 1 : 0));
}

export function analyzeUsage(): UsageIssue[] {
  const issues: UsageIssue[] = [];
  const DOWNSIZE: Record<string, any> = { "t3.xlarge": { to: "t3.large", f: 0.5 }, "c5.large": { to: "c5.xlarge", f: 0.5 }, "t3.medium": { to: "t3.micro", f: 0.25 }, "m5.2xlarge": { to: "m5.xlarge", f: 0.5 }, "m5.4xlarge": { to: "m5.2xlarge", f: 0.5 }, "c5.2xlarge": { to: "c5.xlarge", f: 0.5 }, "r5.large": { to: "t3.large", f: 0.66 }};
  for (const inst of getLiveInstances()) {
    if (inst.avgCpu >= 20 || !DOWNSIZE[inst.type]) continue;
    const d = DOWNSIZE[inst.type];
    const pCost = inst.monthlyCost * d.f;
    const sav = inst.monthlyCost - pCost;
    const sev: Severity = inst.avgCpu < 10 ? "critical" : inst.avgCpu < 15 ? "high" : "medium";
    issues.push({
      id: `usage-${inst.id}`, type: "instance", resourceId: inst.id, resourceName: inst.name,
      issue: `Underutilized CPU (${inst.avgCpu.toFixed(1)}%)`, severity: sev, recommendation: `Downsize to ${d.to}`,
      aiExplanation: generateUsageAIExplanation(inst.id, inst.name, inst.avgCpu, inst.type, d.to, inst.monthlyCost, pCost),
      estimatedSavings: sav, region: inst.region, currentInstanceType: inst.type, recommendedInstanceType: d.to, avgCpuPercent: inst.avgCpu, cpuHistory: inst.cpuUsage, currentCost: inst.monthlyCost, projectedCost: pCost, metadata: { tags: inst.tags }, fixed: false
    });
  }
  return issues.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
}

export function buildSummary() {
  const c = analyzeCosts(), s = analyzeSecurity(), u = analyzeUsage();
  const all = [...c, ...s, ...u];
  return {
    totalIssues: all.length, totalSavings: c.reduce((a, b) => a + b.estimatedSavings, 0) + u.reduce((a, b) => a + b.estimatedSavings, 0),
    criticalCount: all.filter(i => i.severity === "critical").length, highCount: all.filter(i => i.severity === "high").length,
    mediumCount: all.filter(i => i.severity === "medium").length, lowCount: all.filter(i => i.severity === "low").length,
    savingsByCategory: { cost: c.reduce((a, b) => a + b.estimatedSavings, 0), usage: u.reduce((a, b) => a + b.estimatedSavings, 0), security: 0 },
    costIssues: c, securityIssues: s, usageIssues: u, topRecommendations: TOP_RECOMMENDATIONS
  };
}

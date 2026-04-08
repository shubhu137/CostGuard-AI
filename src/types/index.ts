// =============================================
// CostGuard AI — Core TypeScript Interfaces
// =============================================

export type Severity = "low" | "medium" | "high" | "critical";

export type ResourceType = "volume" | "instance" | "security_group";

// ---- Cloud Resources ----

export interface Instance {
  id: string;
  name: string;
  type: string;
  region: string;
  os: string;
  state: "running" | "stopped";
  cpuUsage: number[]; // 7-day hourly averages
  monthlyCost: number;
  launchTime: string;
  tags: Record<string, string>;
}

export interface Volume {
  id: string;
  name: string;
  size: number; // GB
  volumeType: string;
  region: string;
  state: "in-use" | "available";
  attachedTo: string | null;
  iops: number;
  monthlyCost: number;
  createTime: string;
  tags: Record<string, string>;
}

export interface SecurityGroupRule {
  protocol: string;
  fromPort: number;
  toPort: number;
  cidr: string;
  description: string;
}

export interface SecurityGroup {
  id: string;
  name: string;
  description: string;
  region: string;
  vpcId: string;
  inboundRules: SecurityGroupRule[];
  associatedInstances: string[];
  tags: Record<string, string>;
}

// ---- Analysis Results ----

export interface Issue {
  id: string;
  type: ResourceType;
  resourceId: string;
  resourceName: string;
  issue: string;
  severity: Severity;
  recommendation: string;
  aiExplanation: string;
  estimatedSavings: number; // monthly $
  region: string;
  metadata: Record<string, unknown>;
  fixed?: boolean;
}

export interface CostIssue extends Issue {
  volumeSize?: number;
  volumeType?: string;
  wastePeriodDays?: number;
}

export interface SecurityIssue extends Issue {
  port?: number;
  protocol?: string;
  cidr?: string;
  suggestedCidr?: string;
}

export interface UsageIssue extends Issue {
  currentInstanceType?: string;
  recommendedInstanceType?: string;
  avgCpuPercent?: number;
  cpuHistory?: number[];
  currentCost?: number;
  projectedCost?: number;
}

// ---- API Responses ----

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  generatedAt: string;
  totalIssues: number;
  totalSavings: number;
}

export interface SummaryData {
  totalIssues: number;
  totalSavings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  costIssues: CostIssue[];
  securityIssues: SecurityIssue[];
  usageIssues: UsageIssue[];
  topRecommendations: string[];
  savingsByCategory: {
    cost: number;
    usage: number;
    security: number;
  };
}

// ---- UI State ----

export interface FilterState {
  severity: Severity | "all";
  resourceType: ResourceType | "all";
  region: string | "all";
  searchQuery: string;
}

export interface DashboardStats {
  totalIssues: number;
  totalSavings: number;
  securityRisks: number;
  fixedIssues: number;
}

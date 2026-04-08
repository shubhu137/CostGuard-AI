import { Instance, Volume, SecurityGroup } from "./types/index";

export const mockInstances: Instance[] = [
  { id: "i-0a1b2c3d4e5f6a7b8", name: "prod-api-server-01", type: "t3.xlarge", region: "us-east-1", os: "Amazon Linux 2", state: "running", cpuUsage: [12, 15, 8, 11, 9, 13, 10], monthlyCost: 134.40, launchTime: "2024-08-15T09:00:00Z", tags: { Environment: "prod", Team: "backend", Project: "api" } },
  { id: "i-0b2c3d4e5f6a7b8c9", name: "prod-worker-m5-01", type: "m5.2xlarge", region: "us-west-2", os: "Ubuntu 22.04", state: "running", cpuUsage: [18, 22, 15, 19, 17, 20, 16], monthlyCost: 278.20, launchTime: "2024-07-20T11:30:00Z", tags: { Environment: "prod", Team: "data", Project: "etl" } },
  { id: "i-0c3d4e5f6a7b8c9d0", name: "staging-app-c5", type: "c5.large", region: "eu-west-1", os: "Amazon Linux 2", state: "running", cpuUsage: [45, 52, 48, 55, 50, 47, 51], monthlyCost: 62.10, launchTime: "2024-09-01T08:00:00Z", tags: { Environment: "staging", Team: "frontend", Project: "web" } },
  { id: "i-0d4e5f6a7b8c9d0e1", name: "dev-test-t3-micro", type: "t3.medium", region: "ap-south-1", os: "Ubuntu 20.04", state: "running", cpuUsage: [5, 8, 6, 4, 7, 5, 6], monthlyCost: 30.37, launchTime: "2024-06-10T14:00:00Z", tags: { Environment: "dev", Team: "devops", Project: "testing" } },
  { id: "i-0e5f6a7b8c9d0e1f2", name: "analytics-m5-4xl", type: "m5.4xlarge", region: "us-east-1", os: "Red Hat Enterprise Linux", state: "running", cpuUsage: [14, 16, 12, 15, 13, 17, 14], monthlyCost: 556.40, launchTime: "2024-05-01T10:00:00Z", tags: { Environment: "prod", Team: "analytics", Project: "bi" } },
  { id: "i-0f6a7b8c9d0e1f2a3", name: "cache-r5-large", type: "r5.large", region: "us-west-1", os: "Amazon Linux 2", state: "running", cpuUsage: [65, 70, 68, 72, 66, 69, 71], monthlyCost: 91.80, launchTime: "2024-09-15T07:00:00Z", tags: { Environment: "prod", Team: "infra", Project: "cache" } },
  { id: "i-0a1b3c4d5e6f7a8b9", name: "batch-eu-central", type: "t3.large", region: "eu-central-1", os: "Ubuntu 22.04", state: "running", cpuUsage: [22, 19, 25, 21, 18, 23, 20], monthlyCost: 60.74, launchTime: "2024-08-20T13:00:00Z", tags: { Environment: "prod", Team: "batch", Project: "scheduler" } },
  { id: "i-0b2c4d5e6f7a8b9c0", name: "ml-inference-c5-2xl", type: "c5.2xlarge", region: "ap-southeast-1", os: "Deep Learning AMI", state: "running", cpuUsage: [9, 11, 8, 10, 12, 9, 10], monthlyCost: 248.20, launchTime: "2024-07-01T09:00:00Z", tags: { Environment: "prod", Team: "ml", Project: "inference" } },
];

export const mockVolumes: Volume[] = [
  { id: "vol-01a2b3c4d5e6f7a89", name: "old-backup-volume-500gb", size: 500, volumeType: "gp2", region: "us-east-1", state: "available", attachedTo: null, iops: 1500, monthlyCost: 50.00, createTime: "2024-01-15T10:00:00Z", tags: { Purpose: "backup", Team: "infra" } },
  { id: "vol-02b3c4d5e6f7a8b90", name: "prod-api-data", size: 200, volumeType: "gp3", region: "us-east-1", state: "in-use", attachedTo: "i-0a1b2c3d4e5f6a7b8", iops: 3000, monthlyCost: 16.00, createTime: "2024-08-15T09:00:00Z", tags: { Environment: "prod", Team: "backend" } },
  { id: "vol-03c4d5e6f7a8b9c01", name: "archive-logs-1tb", size: 1000, volumeType: "gp3", region: "us-west-2", state: "available", attachedTo: null, iops: 3000, monthlyCost: 80.00, createTime: "2023-12-01T08:00:00Z", tags: { Purpose: "logs", Team: "devops" } },
  { id: "vol-04d5e6f7a8b9c0d12", name: "staging-c5-root", size: 100, volumeType: "gp2", region: "eu-west-1", state: "in-use", attachedTo: "i-0c3d4e5f6a7b8c9d0", iops: 300, monthlyCost: 10.00, createTime: "2024-09-01T08:00:00Z", tags: { Environment: "staging" } },
  { id: "vol-05e6f7a8b9c0d1e23", name: "dev-scratch-250gb", size: 250, volumeType: "gp2", region: "ap-south-1", state: "available", attachedTo: null, iops: 750, monthlyCost: 25.00, createTime: "2024-03-10T12:00:00Z", tags: { Purpose: "scratch", Team: "dev" } },
  { id: "vol-06f7a8b9c0d1e2f34", name: "dev-test-root", size: 50, volumeType: "gp2", region: "ap-south-1", state: "in-use", attachedTo: "i-0d4e5f6a7b8c9d0e1", iops: 150, monthlyCost: 5.00, createTime: "2024-06-10T14:00:00Z", tags: { Environment: "dev" } },
  { id: "vol-07a8b9c0d1e2f3a45", name: "io1-db-snapshot-2tb", size: 2000, volumeType: "io1", region: "us-east-1", state: "available", attachedTo: null, iops: 10000, monthlyCost: 220.00, createTime: "2023-09-01T06:00:00Z", tags: { Purpose: "db-snapshot", Team: "dba" } },
  { id: "vol-08b9c0d1e2f3a4b56", name: "prod-worker-data", size: 300, volumeType: "gp3", region: "us-west-2", state: "in-use", attachedTo: "i-0b2c3d4e5f6a7b8c9", iops: 3000, monthlyCost: 24.00, createTime: "2024-07-20T11:30:00Z", tags: { Environment: "prod" } },
  { id: "vol-09c0d1e2f3a4b5c67", name: "old-staging-400gb", size: 400, volumeType: "gp2", region: "eu-west-1", state: "available", attachedTo: null, iops: 1200, monthlyCost: 40.00, createTime: "2024-02-20T10:00:00Z", tags: { Purpose: "staging-data", Team: "qa" } },
  { id: "vol-10d1e2f3a4b5c6d78", name: "cache-r5-storage", size: 150, volumeType: "gp2", region: "us-west-1", state: "in-use", attachedTo: "i-0f6a7b8c9d0e1f2a3", iops: 450, monthlyCost: 15.00, createTime: "2024-09-15T07:00:00Z", tags: { Environment: "prod" } },
  { id: "vol-11e2f3a4b5c6d7e89", name: "temp-test-80gb", size: 80, volumeType: "gp2", region: "us-east-1", state: "available", attachedTo: null, iops: 240, monthlyCost: 8.00, createTime: "2024-10-01T09:00:00Z", tags: { Purpose: "temp", Team: "devops" } },
  { id: "vol-12f3a4b5c6d7e8f90", name: "analytics-root-600gb", size: 600, volumeType: "gp3", region: "us-east-1", state: "in-use", attachedTo: "i-0e5f6a7b8c9d0e1f2", iops: 3000, monthlyCost: 48.00, createTime: "2024-05-01T10:00:00Z", tags: { Environment: "prod" } },
];

export const mockSecurityGroups: SecurityGroup[] = [
  { id: "sg-01a2b3c4d5e6f7a89", name: "default", description: "Default VPC security group", region: "us-east-1", vpcId: "vpc-0a1b2c3d4e5f6a7b8", inboundRules: [{ protocol: "tcp", fromPort: 22, toPort: 22, cidr: "0.0.0.0/0", description: "SSH from anywhere" }], associatedInstances: ["i-0a1b2c3d4e5f6a7b8", "i-0e5f6a7b8c9d0e1f2"], tags: { Name: "default" } },
  { id: "sg-02b3c4d5e6f7a8b90", name: "web-servers", description: "Web server security group", region: "us-west-2", vpcId: "vpc-0b2c3d4e5f6a7b8c9", inboundRules: [{ protocol: "tcp", fromPort: 80, toPort: 80, cidr: "0.0.0.0/0", description: "HTTP from anywhere" }, { protocol: "tcp", fromPort: 443, toPort: 443, cidr: "0.0.0.0/0", description: "HTTPS from anywhere" }], associatedInstances: ["i-0b2c3d4e5f6a7b8c9"], tags: { Name: "web-servers", Environment: "prod" } },
  { id: "sg-03c4d5e6f7a8b9c01", name: "admin-access", description: "Admin RDP and management access", region: "us-west-2", vpcId: "vpc-0b2c3d4e5f6a7b8c9", inboundRules: [{ protocol: "tcp", fromPort: 3389, toPort: 3389, cidr: "0.0.0.0/0", description: "RDP from anywhere" }, { protocol: "tcp", fromPort: 22, toPort: 22, cidr: "0.0.0.0/0", description: "SSH from anywhere" }], associatedInstances: [], tags: { Name: "admin-access", Team: "devops" } },
  { id: "sg-04d5e6f7a8b9c0d12", name: "database-sg", description: "Database access security group", region: "eu-west-1", vpcId: "vpc-0c3d4e5f6a7b8c9d0", inboundRules: [{ protocol: "tcp", fromPort: 5432, toPort: 5432, cidr: "0.0.0.0/0", description: "PostgreSQL from anywhere" }, { protocol: "tcp", fromPort: 3306, toPort: 3306, cidr: "0.0.0.0/0", description: "MySQL from anywhere" }], associatedInstances: ["i-0c3d4e5f6a7b8c9d0"], tags: { Name: "database-sg", Team: "dba" } },
  { id: "sg-05e6f7a8b9c0d1e23", name: "api-gateway", description: "API Gateway security group", region: "ap-south-1", vpcId: "vpc-0d4e5f6a7b8c9d0e1", inboundRules: [{ protocol: "tcp", fromPort: 443, toPort: 443, cidr: "0.0.0.0/0", description: "HTTPS from anywhere" }, { protocol: "tcp", fromPort: 8080, toPort: 8080, cidr: "0.0.0.0/0", description: "Internal API from anywhere" }], associatedInstances: ["i-0d4e5f6a7b8c9d0e1"], tags: { Name: "api-gateway", Environment: "prod" } },
  { id: "sg-06f7a8b9c0d1e2f34", name: "internal-tools", description: "Internal tooling access", region: "eu-central-1", vpcId: "vpc-0e5f6a7b8c9d0e1f2", inboundRules: [{ protocol: "tcp", fromPort: 9090, toPort: 9090, cidr: "0.0.0.0/0", description: "Prometheus from anywhere" }, { protocol: "tcp", fromPort: 3000, toPort: 3000, cidr: "0.0.0.0/0", description: "Grafana from anywhere" }, { protocol: "tcp", fromPort: 22, toPort: 22, cidr: "10.0.0.0/8", description: "SSH from internal" }], associatedInstances: ["i-0a1b3c4d5e6f7a8b9"], tags: { Name: "internal-tools", Team: "monitoring" } },
];

export const VOLUME_COST_PER_GB: Record<string, number> = { gp2: 0.1, gp3: 0.08, io1: 0.125 };

export const RISKY_PORTS: Record<number, { name: string; risk: string }> = {
  22: { name: "SSH", risk: "Remote shell access" },
  3389: { name: "RDP", risk: "Windows Remote Desktop" },
  5432: { name: "PostgreSQL", risk: "Database port exposed" },
  3306: { name: "MySQL/MariaDB", risk: "Database port exposed" },
  1433: { name: "MSSQL", risk: "SQL Server exposed" },
  27017: { name: "MongoDB", risk: "NoSQL DB exposed" },
  6379: { name: "Redis", risk: "In-memory database exposed" },
  9200: { name: "Elasticsearch", risk: "Search engine exposed" },
  8080: { name: "HTTP Alt", risk: "Alt HTTP port" },
  9090: { name: "Prometheus", risk: "Metrics exposed" },
  3000: { name: "Dev Server", risk: "Dev server exposed" },
};

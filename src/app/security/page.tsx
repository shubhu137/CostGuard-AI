"use client";

import { useState, useMemo } from "react";
import { Shield, AlertTriangle, Lock, Globe, CheckCircle, Server, Network, Radio } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IssueCard } from "@/components/dashboard/IssueCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { sortBySeverity, cn } from "@/lib/utils";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import type { SecurityIssue } from "@/types";

const RISKY_PORT_MAP: Record<number, string> = { 22:"SSH",3389:"RDP",5432:"PostgreSQL",3306:"MySQL",27017:"MongoDB",6379:"Redis",9200:"Elasticsearch",8080:"Admin HTTP",9090:"Prometheus",3000:"Grafana",80:"HTTP",443:"HTTPS" };

function PortBadge({ port }: { port: number }) {
  const isUltra = [22,3389,5432,3306].includes(port);
  const isRisky = [27017,6379,9200,8080,9090,3000].includes(port);
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border",
      isUltra ? "bg-red-500/10 border-red-500/30 text-red-400"
      : isRisky ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
      : "bg-muted/30 border-border/50 text-muted-foreground")}>
      :{port}{RISKY_PORT_MAP[port] && <span className="font-normal opacity-70">{RISKY_PORT_MAP[port]}</span>}
    </span>
  );
}

function CidrBadge({ cidr, type }: { cidr: string; type: "danger" | "safe" }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border",
      type === "danger" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400")}>
      {type === "danger" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
      {cidr}
    </span>
  );
}

function SecurityDetail({ issue }: { issue: SecurityIssue }) {
  return (
    <div className="mt-2 p-4 rounded-xl border border-border/30 space-y-3" style={{ background:"var(--glass-bg)" }}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Current (Risky)</div>
          <div className="flex flex-col gap-1.5">
            <PortBadge port={issue.port || 0} />
            <CidrBadge cidr={issue.cidr || "0.0.0.0/0"} type="danger" />
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Recommended</div>
          <div className="flex flex-col gap-1.5">
            <PortBadge port={issue.port || 0} />
            <CidrBadge cidr={issue.suggestedCidr || "10.0.0.0/8"} type="safe" />
          </div>
        </div>
      </div>
      <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-border/20">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Network className="w-3 h-3" /> VPC: <code className="font-mono ml-1">{(issue.metadata?.vpcId as string) || "—"}</code>
        </span>
        {((issue.metadata?.associatedInstances as string[]) || []).length > 0 && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Server className="w-3 h-3" /> {(issue.metadata?.associatedInstances as string[]).length} instance(s) affected
          </span>
        )}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const { data: issues = [], loading, meta, isUpdating } =
    useRealtimeData<SecurityIssue[]>("/api/security", 15000);

  const [severityFilter, setSeverityFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fixedIds, setFixedIds] = useState<Set<string>>(new Set());

  const safeIssues = issues || [];
  const regions = useMemo(() => [...new Set(safeIssues.map((i) => i.region))], [safeIssues]);

  const filtered = useMemo(() => {
    let result = safeIssues.filter((i) => !fixedIds.has(i.id));
    if (severityFilter !== "all") result = result.filter((i) => i.severity === severityFilter);
    if (regionFilter !== "all") result = result.filter((i) => i.region === regionFilter);
    if (searchQuery) result = result.filter((i) =>
      [i.resourceName, i.resourceId, i.region].some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return sortBySeverity(result);
  }, [safeIssues, fixedIds, severityFilter, regionFilter, searchQuery]);

  const criticalCount = safeIssues.filter((i) => i.severity === "critical").length;
  const publicPortsCount = safeIssues.filter((i) => i.cidr === "0.0.0.0/0").length;
  const riskyPortsCount = safeIssues.filter((i) => [22,3389,5432,3306].includes(i.port || 0)).length;

  // Risk score: no Math — pure arithmetic
  const riskScore = criticalCount * 20 + (safeIssues.length - criticalCount) * 8;
  const boundedRisk = riskScore > 100 ? 100 : riskScore;

  const handleFix = (id: string) => setFixedIds((p) => new Set([...p, id]));
  const handleFixAll = () => setFixedIds(new Set(filtered.map((i) => i.id)));

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Security Analyzer
            {isUpdating && <span className="text-xs text-primary animate-pulse font-semibold flex items-center gap-1"><Radio className="w-3 h-3" />Live</span>}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detecting overly permissive security group rules and exposed ports
            {meta && <span className="ml-2 text-[10px] font-mono text-muted-foreground/40">· Slot {meta.slot}</span>}
          </p>
        </div>

        {/* Risk Score */}
        <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-red-500/20" style={{ background:"rgba(239,68,68,0.06)" }}>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Risk Score</div>
            <div className={`text-3xl font-black ${isUpdating ? "animate-pulse" : ""} text-red-400`}>{boundedRisk}</div>
            <div className="text-[10px] text-red-400/70">/100</div>
          </div>
          <div>
            <div className="w-24 h-2 rounded-full bg-muted/30 overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-1000"
                style={{ width: `${boundedRisk}%` }} />
            </div>
            <div className="text-xs font-semibold text-red-400">
              {boundedRisk >= 70 ? "HIGH RISK" : boundedRisk >= 40 ? "MEDIUM RISK" : "LOW RISK"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Security Issues" value={safeIssues.length} icon={<Shield className="w-5 h-5" />} color="danger" subtitle="Across all regions" flash={isUpdating} />
        <MetricCard title="Critical Exposures" value={criticalCount} icon={<AlertTriangle className="w-5 h-5" />} color="danger" subtitle="Immediate action needed" flash={isUpdating} />
        <MetricCard title="Ports Open to Internet" value={publicPortsCount} icon={<Globe className="w-5 h-5" />} color="warning" subtitle="0.0.0.0/0 rules" flash={isUpdating} />
        <MetricCard title="Risky Service Ports" value={riskyPortsCount} icon={<Lock className="w-5 h-5" />} color="warning" subtitle="SSH, RDP, DB ports" flash={isUpdating} />
      </div>

      {/* Port exposure map */}
      <div className="chart-container">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-red-400" />
          Live Public Exposure Map — Ports Open to 0.0.0.0/0
          {isUpdating && <span className="ml-auto text-[10px] text-primary animate-pulse">● Updating</span>}
        </h3>
        <div className="flex flex-wrap gap-2">
          {safeIssues.map((issue) => (
            <div key={issue.id} className="flex flex-col items-center gap-1">
              <PortBadge port={issue.port || 0} />
              <SeverityBadge severity={issue.severity} size="sm" showDot={false} />
            </div>
          ))}
          {safeIssues.length === 0 && !loading && (
            <span className="text-sm text-emerald-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" />All rules secured this scan cycle</span>
          )}
        </div>
      </div>

      <FilterBar
        severityFilter={severityFilter} setSeverityFilter={setSeverityFilter}
        regionFilter={regionFilter} setRegionFilter={setRegionFilter}
        regions={regions} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        totalCount={safeIssues.length} filteredCount={filtered.length}
        onFixAll={handleFixAll} fixAllLabel="Restrict All Rules"
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl border border-border/50 bg-muted/20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
          <div className="text-lg font-semibold mb-2">No vulnerabilities found</div>
          <div className="text-sm text-muted-foreground">All clear this scan cycle — next update in ~15s.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((issue, i) => (
            <div key={issue.id} className="space-y-2">
              <IssueCard issue={issue} actionLabel="Fix" onFix={handleFix} showSavings={false} delay={i * 50} />
              {!fixedIds.has(issue.id) && <SecurityDetail issue={issue} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

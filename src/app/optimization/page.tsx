"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Cpu, DollarSign, Zap, CheckCircle, ArrowRight, BarChart3, Radio } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IssueCard } from "@/components/dashboard/IssueCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { LiveCounter } from "@/components/dashboard/LiveCounter";
import { CpuUsageChart } from "@/components/charts/CpuUsageChart";
import { ComparisonBarChart } from "@/components/charts/CostSavingsChart";
import { formatCurrency, sortBySeverity, average, cn } from "@/lib/utils";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import type { UsageIssue } from "@/types";

function InstanceDetail({ issue }: { issue: UsageIssue }) {
  const avgCpu = issue.avgCpuPercent || 0;
  const savings = (issue.currentCost || 0) - (issue.projectedCost || 0);
  // Savings percent without Math
  const savingsPct = issue.currentCost ? ((savings / issue.currentCost) * 100) | 0 : 0;
  // progress width — clamp without Math
  const cpuWidth = avgCpu < 0 ? 0 : avgCpu > 100 ? 100 : avgCpu;

  return (
    <div className="mt-2 p-4 rounded-xl border border-border/30 space-y-4" style={{ background:"var(--glass-bg)" }}>
      {/* Downsize arrow */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono font-semibold text-orange-400">{issue.currentInstanceType}</div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-semibold text-emerald-400">{issue.recommendedInstanceType}</div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Save</span>
          <span className="text-sm font-bold text-emerald-400">{formatCurrency(savings)}/mo</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">-{savingsPct}%</span>
        </div>
      </div>

      {/* Live CPU gauge */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Live Avg CPU (7-day)</span>
          <span className={cn("font-bold", avgCpu < 10 ? "text-red-400" : avgCpu < 20 ? "text-orange-400" : "text-yellow-400")}>
            {avgCpu.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${cpuWidth}%`,
              background: avgCpu < 10 ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,#f97316,#eab308)",
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mt-1">
          <span>0%</span>
          <span className="text-red-400/60">▲ 20% threshold</span>
          <span>100%</span>
        </div>
      </div>

      {/* CPU sparkline */}
      <CpuUsageChart data={issue.cpuHistory || []} instanceName={issue.resourceName} instanceType={issue.currentInstanceType || ""} avgCpu={avgCpu} compact />

      {/* Cost comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Current</div>
          <div className="text-lg font-bold text-red-400 mt-0.5">{formatCurrency(issue.currentCost || 0)}</div>
          <div className="text-[10px] text-muted-foreground">/month</div>
        </div>
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">After Downsize</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{formatCurrency(issue.projectedCost || 0)}</div>
          <div className="text-[10px] text-muted-foreground">/month</div>
        </div>
      </div>
    </div>
  );
}

export default function OptimizationPage() {
  const { data: issues = [], loading, meta, isUpdating } =
    useRealtimeData<UsageIssue[]>("/api/usage", 15000);

  const [severityFilter, setSeverityFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fixedIds, setFixedIds] = useState<Set<string>>(new Set());

  const safeIssues = issues || [];
  const regions = useMemo(() => Array.from(new Set(safeIssues.map((i) => i.region))), [safeIssues]);

  const filtered = useMemo(() => {
    let result = safeIssues.filter((i) => !fixedIds.has(i.id));
    if (severityFilter !== "all") result = result.filter((i) => i.severity === severityFilter);
    if (regionFilter !== "all") result = result.filter((i) => i.region === regionFilter);
    if (searchQuery) result = result.filter((i) =>
      [i.resourceName, i.resourceId, i.currentInstanceType||"", i.region].some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return sortBySeverity(result);
  }, [safeIssues, fixedIds, severityFilter, regionFilter, searchQuery]);

  const totalSavings = safeIssues.reduce((s, i) => s + i.estimatedSavings, 0);
  const fixedSavings = safeIssues.filter((i) => fixedIds.has(i.id)).reduce((s, i) => s + i.estimatedSavings, 0);
  const avgCpuAll = average(safeIssues.map((i) => i.avgCpuPercent || 0));

  const handleOptimize = (id: string) => setFixedIds((p) => new Set([...p, id]));
  const handleFixAll = () => setFixedIds(new Set(filtered.map((i) => i.id)));

  const comparisonData = safeIssues.map((i) => ({
    name: i.resourceName.length > 12 ? i.resourceName.slice(0, 12) + "…" : i.resourceName,
    current: i.currentCost || 0,
    projected: i.projectedCost || 0,
    instanceType: i.currentInstanceType || "",
    recommendedType: i.recommendedInstanceType || "",
  }));

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            Optimization Insights
            {isUpdating && <span className="text-xs text-primary animate-pulse font-semibold flex items-center gap-1"><Radio className="w-3 h-3" />Live</span>}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            CPU utilization analysis and instance rightsizing recommendations
            {meta && <span className="ml-2 text-[10px] font-mono text-muted-foreground/40">· Slot {meta.slot}</span>}
          </p>
        </div>
        {fixedIds.size > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            {fixedIds.size} optimized · {formatCurrency(fixedSavings)}/mo saved
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Under-Utilized Instances" value={safeIssues.length} icon={<Cpu className="w-5 h-5" />} color="warning" subtitle="CPU avg < 20%" flash={isUpdating} />
        <MetricCard title="Monthly Savings Available" value={totalSavings} prefix="$" icon={<DollarSign className="w-5 h-5" />} color="success" subtitle="Via rightsizing" flash={isUpdating} />
        <MetricCard title="Avg CPU (Flagged)" value={`${avgCpuAll.toFixed(1)}%`} icon={<Zap className="w-5 h-5" />} color="warning" subtitle="Live average" flash={isUpdating} />
        <MetricCard title="Annual Savings" value={totalSavings * 12} prefix="$" icon={<TrendingUp className="w-5 h-5" />} color="primary" subtitle="If all optimized" flash={isUpdating} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Before vs After (Live)</h3>
            {isUpdating && <span className="ml-auto text-[10px] text-primary animate-pulse">● Updating</span>}
          </div>
          {!loading && comparisonData.length > 0 ? <ComparisonBarChart items={comparisonData} /> : <div className="h-56 animate-pulse rounded-xl bg-muted/30" />}
        </div>
        <div className="flex flex-col gap-4">
          <LiveCounter target={totalSavings} prefix="$" label="Monthly Rightsizing Savings" description={`${safeIssues.length} instances eligible · updates every 15s`} color="blue" />
          <LiveCounter target={totalSavings * 12} prefix="$" label="Annual Infrastructure Recovery" description="Live projection — refreshes with each scan" color="purple" />
        </div>
      </div>

      <FilterBar
        severityFilter={severityFilter} setSeverityFilter={setSeverityFilter}
        regionFilter={regionFilter} setRegionFilter={setRegionFilter}
        regions={regions} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        totalCount={safeIssues.length} filteredCount={filtered.length}
        onFixAll={handleFixAll} fixAllLabel="Optimize All Instances"
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{Array(5).fill(0).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl border border-border/50 bg-muted/20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
          <div className="text-lg font-semibold mb-2">All optimized!</div>
          <div className="text-sm text-muted-foreground">Next scan may reveal new instances crossing the threshold.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((issue, i) => (
            <div key={issue.id} className="space-y-2">
              <IssueCard issue={issue} actionLabel="Optimize" onOptimize={handleOptimize} delay={i * 50} />
              {!fixedIds.has(issue.id) && <InstanceDetail issue={issue} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

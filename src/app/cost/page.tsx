"use client";

import { useState, useMemo } from "react";
import { HardDrive, DollarSign, Trash2, TrendingDown, CheckCircle, BarChart3, Radio } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IssueCard } from "@/components/dashboard/IssueCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { CostSavingsChart } from "@/components/charts/CostSavingsChart";
import { formatCurrency, sortBySeverity } from "@/lib/utils";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import type { CostIssue } from "@/types";

function VolumeDetail({ issue }: { issue: CostIssue }) {
  const meta = issue.metadata as { size?: number; volumeType?: string; daysUnattached?: number; iops?: number };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/30">
      {[
        { label: "Size", value: `${meta.size} GB` },
        { label: "Type", value: meta.volumeType?.toUpperCase() || "—" },
        { label: "Days Idle", value: `${meta.daysUnattached}d` },
        { label: "IOPS", value: meta.iops?.toLocaleString() || "—" },
      ].map((d) => (
        <div key={d.label} className="p-2 rounded-lg bg-muted/20 border border-border/30 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{d.label}</div>
          <div className="text-xs font-semibold text-foreground mt-0.5">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function CostPage() {
  const { data: issues = [], loading, meta, isUpdating, refresh } =
    useRealtimeData<CostIssue[]>("/api/cost", 15000);

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

  const totalSavings = safeIssues.reduce((s, i) => s + i.estimatedSavings, 0);
  const fixedSavings = safeIssues.filter((i) => fixedIds.has(i.id)).reduce((s, i) => s + i.estimatedSavings, 0);
  const handleDelete = (id: string) => setFixedIds((p) => new Set([...p, id]));
  const handleFixAll = () => setFixedIds(new Set(filtered.map((i) => i.id)));

  const chartData = safeIssues.slice(0, 8).map((i) => ({
    name: i.resourceName.length > 14 ? i.resourceName.slice(0, 14) + "…" : i.resourceName,
    savings: i.estimatedSavings,
  }));

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-orange-400" />
            Cost Analysis
            {isUpdating && <span className="text-xs text-primary animate-pulse font-semibold flex items-center gap-1"><Radio className="w-3 h-3" />Live</span>}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Identifying idle EBS volumes and unattached storage resources
            {meta && <span className="ml-2 text-[10px] font-mono text-muted-foreground/40">· Slot {meta.slot}</span>}
          </p>
        </div>
        {fixedIds.size > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            {fixedIds.size} deleted · {formatCurrency(fixedSavings)}/mo recovered
          </div>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Unattached Volumes" value={safeIssues.length} icon={<HardDrive className="w-5 h-5" />} color="warning" subtitle="Idle EBS volumes" flash={isUpdating} />
        <MetricCard title="Monthly Waste" value={totalSavings} prefix="$" icon={<DollarSign className="w-5 h-5" />} color="danger" subtitle="Recoverable cost" flash={isUpdating} />
        <MetricCard title="Deleted This Session" value={fixedIds.size} icon={<Trash2 className="w-5 h-5" />} color="success" subtitle="Resources cleaned" />
        <MetricCard title="Annual Savings" value={totalSavings * 12} prefix="$" icon={<TrendingDown className="w-5 h-5" />} color="primary" subtitle="If all resolved" flash={isUpdating} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Monthly Waste by Volume</h3>
            {isUpdating && <span className="ml-auto text-[10px] text-primary animate-pulse">● Updating</span>}
          </div>
          {!loading && chartData.length > 0 ? <CostSavingsChart data={chartData} type="bar" /> : <div className="h-48 animate-pulse rounded-xl bg-muted/30" />}
        </div>
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold">Savings Trend</h3>
          </div>
          {!loading && chartData.length > 0 ? <CostSavingsChart data={chartData} type="area" /> : <div className="h-48 animate-pulse rounded-xl bg-muted/30" />}
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        severityFilter={severityFilter} setSeverityFilter={setSeverityFilter}
        regionFilter={regionFilter} setRegionFilter={setRegionFilter}
        regions={regions} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        totalCount={safeIssues.length} filteredCount={filtered.length}
        onFixAll={handleFixAll} fixAllLabel="Delete All Idle Volumes"
      />

      {/* Issues */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl border border-border/50 bg-muted/20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
          <div className="text-lg font-semibold mb-2">All clear!</div>
          <div className="text-sm text-muted-foreground">No cost issues match your filters — next scan in ~15s.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((issue, i) => (
            <div key={issue.id} className="space-y-2">
              <IssueCard issue={issue} actionLabel="Delete" onDelete={handleDelete} delay={i * 50} />
              {!fixedIds.has(issue.id) && <VolumeDetail issue={issue} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

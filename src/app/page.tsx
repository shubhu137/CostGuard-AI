"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle, DollarSign, Shield, TrendingUp,
  Zap, CheckCircle, ArrowRight, RefreshCw, BarChart3, Radio,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IssueCard } from "@/components/dashboard/IssueCard";
import { LiveCounter } from "@/components/dashboard/LiveCounter";
import { CpuUsageChart } from "@/components/charts/CpuUsageChart";
import { CostSavingsChart } from "@/components/charts/CostSavingsChart";
import { formatCurrency } from "@/lib/utils";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import type { Issue, SummaryData } from "@/types";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="metric-card border border-border/50 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-muted/50 mb-4" />
      <div className="h-8 w-24 rounded-lg bg-muted/50 mb-2" />
      <div className="h-4 w-32 rounded-lg bg-muted/30" />
    </div>
  );
}

export default function DashboardPage() {
  const {
    data: summary,
    loading,
    meta,
    refreshCount,
    refresh,
    isUpdating,
  } = useRealtimeData<SummaryData & { scanId: string; slot: number; nextScanIn: number }>("/api/summary", 15000);

  const [fixedCount, setFixedCount] = useState(0);
  const [fixingAll, setFixingAll] = useState(false);
  // Track previous issue count to show delta
  const [prevIssueCount, setPrevIssueCount] = useState<number | null>(null);
  const [issueDelta, setIssueDelta] = useState(0);

  useEffect(() => {
    if (summary && prevIssueCount !== null) {
      setIssueDelta(summary.totalIssues - prevIssueCount);
    }
    if (summary) setPrevIssueCount(summary.totalIssues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary?.totalIssues]);

  const handleFixAll = async () => {
    setFixingAll(true);
    await new Promise((r) => setTimeout(r, 1500));
    setFixingAll(false);
    setFixedCount(summary?.totalIssues || 0);
  };

  const topIssues: Issue[] = summary
    ? [
        ...summary.costIssues.slice(0, 2),
        ...summary.securityIssues.slice(0, 2),
        ...summary.usageIssues.slice(0, 2),
      ]
    : [];

  const savingsChartData = (summary?.costIssues || []).slice(0, 6).map((i) => ({
    name: i.resourceName.slice(0, 12),
    savings: i.estimatedSavings,
  }));

  const worstCpuIssue = summary?.usageIssues[0];

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">

      {/* ---- Hero Banner ---- */}
      <div
        className={`relative overflow-hidden rounded-2xl p-8 border transition-all duration-500 ${isUpdating ? "border-primary/40 shadow-[0_0_30px_rgba(99,102,241,0.15)]" : "border-indigo-500/20"}`}
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(6,182,212,0.06) 100%)",
        }}
      >
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                </span>
                Real-time Scanning
              </span>
              <span className="text-xs text-muted-foreground">3 regions · AWS</span>
              {meta && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 bg-muted/20 px-2 py-0.5 rounded-md">
                  <Radio className="w-2.5 h-2.5" />
                  Slot {meta.slot} · {meta.scanId}
                </span>
              )}
            </div>

            {/* Issue change indicator */}
            {issueDelta !== 0 && !loading && (
              <div className={`inline-flex items-center gap-1 text-xs font-semibold mb-2 px-2 py-0.5 rounded-lg ${issueDelta > 0 ? "text-red-400 bg-red-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                {issueDelta > 0 ? `↑ ${issueDelta} new issues detected` : `↓ ${-issueDelta} issues resolved`}
              </div>
            )}

            <h2 className="text-2xl font-bold text-foreground mb-1">
              Infrastructure Health Report
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg">
              CostGuard AI has analyzed your cloud environment and found{" "}
              <span className="font-semibold text-foreground">
                {loading ? "…" : summary?.totalIssues} issues
              </span>{" "}
              with an estimated{" "}
              <span className="font-semibold text-emerald-400">
                {loading ? "…" : formatCurrency(summary?.totalSavings || 0)}/mo
              </span>{" "}
              in recoverable costs.
              {refreshCount > 1 && (
                <span className="text-muted-foreground/50 ml-2 text-xs">
                  (scan #{refreshCount})
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button onClick={handleFixAll} disabled={fixingAll || loading} className="btn-primary flex items-center gap-2">
              {fixingAll ? <><RefreshCw className="w-4 h-4 animate-spin" />Fixing…</> : <><Zap className="w-4 h-4" />Fix All Issues</>}
            </button>
            <button onClick={refresh} title="Manual refresh" className="btn-ghost flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
            </button>
            <Link href="/cost" className="btn-ghost flex items-center gap-2">
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {!loading && summary && (
          <div className="relative mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: "Critical", count: summary.criticalCount, color: "bg-red-500", textColor: "text-red-400" },
                { label: "High", count: summary.highCount, color: "bg-orange-500", textColor: "text-orange-400" },
                { label: "Medium", count: summary.mediumCount, color: "bg-yellow-500", textColor: "text-yellow-400" },
                { label: "Low", count: summary.lowCount, color: "bg-blue-500", textColor: "text-blue-400" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}:</span>
                  <span className={`text-xs font-bold ${s.textColor}`}>{s.count}</span>
                </div>
              ))}
              {fixedCount > 0 && (
                <span className="ml-auto text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {fixedCount} resolved this session
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---- Metric Cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <MetricCard title="Total Issues" value={summary?.totalIssues || 0} icon={<AlertTriangle className="w-5 h-5" />} color="warning" subtitle={`${summary?.criticalCount} critical`} flash={isUpdating} delay={0} />
            <MetricCard title="Monthly Cost Waste" value={summary?.savingsByCategory.cost || 0} prefix="$" icon={<DollarSign className="w-5 h-5" />} color="danger" subtitle="Unattached volumes" flash={isUpdating} delay={100} />
            <MetricCard title="Security Risks" value={summary?.securityIssues.length || 0} icon={<Shield className="w-5 h-5" />} color="danger" subtitle="Open to internet" flash={isUpdating} delay={200} />
            <MetricCard title="Optimization Savings" value={summary?.savingsByCategory.usage || 0} prefix="$" icon={<TrendingUp className="w-5 h-5" />} color="success" subtitle="Via rightsizing" flash={isUpdating} delay={300} />
          </>
        )}
      </div>

      {/* ---- Live Counter + Chart ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiveCounter
          target={summary?.totalSavings || 0}
          prefix="$"
          label="Total Recoverable Monthly Savings"
          description={`Across ${summary?.totalIssues || 0} identified issues`}
          color="green"
        />
        <div className="lg:col-span-2 chart-container">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Cost Waste by Volume</h3>
            {isUpdating && <span className="ml-auto text-[10px] text-primary animate-pulse font-semibold">● Updating</span>}
          </div>
          {!loading && savingsChartData.length > 0
            ? <CostSavingsChart data={savingsChartData} type="bar" />
            : <div className="h-48 animate-pulse rounded-xl bg-muted/30" />
          }
        </div>
      </div>

      {/* ---- CPU Chart + Recommendations ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-foreground">Most Under-Utilized Instance (Live 7-day)</h3>
            {isUpdating && <span className="ml-auto text-[10px] text-orange-400 animate-pulse font-semibold">● Live</span>}
          </div>
          {worstCpuIssue
            ? <CpuUsageChart data={worstCpuIssue.cpuHistory || []} instanceName={worstCpuIssue.resourceName} instanceType={worstCpuIssue.currentInstanceType || ""} avgCpu={worstCpuIssue.avgCpuPercent || 0} />
            : loading
              ? <div className="h-40 animate-pulse rounded-xl bg-muted/30" />
              : <div className="flex items-center justify-center h-40 text-sm text-muted-foreground"><CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />No under-utilized instances this scan</div>
          }
        </div>

        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {(summary?.topRecommendations || []).slice(0, 4).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/30 hover:border-primary/20 transition-colors" style={{ background: "var(--glass-bg)" }}>
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec}</p>
              </div>
            ))}
            {loading && Array(4).fill(0).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/30" />)}
          </div>
        </div>
      </div>

      {/* ---- Top Issues ---- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Top Priority Issues
            {isUpdating && <span className="text-[10px] text-primary animate-pulse font-semibold">● Live data</span>}
          </h3>
          <Link href="/cost" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading
          ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl border border-border/50 bg-muted/20" />)}</div>
          : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {topIssues.map((issue, i) => (
                <IssueCard key={issue.id} issue={issue} actionLabel={issue.type === "volume" ? "Delete" : issue.type === "instance" ? "Optimize" : "Fix"} delay={i * 60} />
              ))}
            </div>
        }
      </div>
    </div>
  );
}

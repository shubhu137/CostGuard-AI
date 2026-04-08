"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Info,
  CheckCircle,
} from "lucide-react";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";
import { SeverityBadge } from "./SeverityBadge";
import type { Issue } from "@/types";

interface IssueCardProps {
  issue: Issue;
  onFix?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOptimize?: (id: string) => void;
  actionLabel?: "Fix" | "Delete" | "Optimize";
  showSavings?: boolean;
  delay?: number;
}

const typeIcons = {
  volume: Trash2,
  security_group: ShieldCheck,
  instance: Zap,
};

const typeLabels = {
  volume: "EBS Volume",
  security_group: "Security Group",
  instance: "EC2 Instance",
};

const typeColors = {
  volume: "text-orange-400 bg-orange-400/10",
  security_group: "text-red-400 bg-red-400/10",
  instance: "text-blue-400 bg-blue-400/10",
};

export function IssueCard({
  issue,
  onFix,
  onDelete,
  onOptimize,
  actionLabel = "Fix",
  showSavings = true,
  delay = 0,
}: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isFixed, setIsFixed] = useState(issue.fixed || false);
  const [isAnimating, setIsAnimating] = useState(false);

  const TypeIcon = typeIcons[issue.type] || Info;

  const handleAction = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsFixed(true);
      setIsAnimating(false);
      if (actionLabel === "Delete") onDelete?.(issue.id);
      else if (actionLabel === "Optimize") onOptimize?.(issue.id);
      else onFix?.(issue.id);
    }, 600);
  };

  if (isFixed) {
    return (
      <div className="issue-card border border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-emerald-400">
              Issue Resolved
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {issue.resourceName} · {issue.resourceId}
            </div>
          </div>
          {showSavings && issue.estimatedSavings > 0 && (
            <div className="text-sm font-bold text-emerald-400 shrink-0">
              +{formatCurrency(issue.estimatedSavings)}/mo saved
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "issue-card border border-border/50 transition-all duration-300",
        isAnimating && "scale-[0.98] opacity-50"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
            typeColors[issue.type]
          )}
        >
          <TypeIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center flex-wrap gap-2">
              <SeverityBadge severity={issue.severity} />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/50">
                {typeLabels[issue.type]}
              </span>
            </div>

            {showSavings && issue.estimatedSavings > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(issue.estimatedSavings)}
                  <span className="text-xs font-medium text-muted-foreground">/mo</span>
                </span>
              </div>
            )}
          </div>

          {/* Resource info */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-foreground truncate">
              {issue.resourceName}
            </span>
            <code className="text-[11px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-md truncate">
              {issue.resourceId}
            </code>
          </div>

          {/* Issue description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {issue.issue}
          </p>

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground/70 mb-3">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {issue.region}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {timeAgo((issue.metadata?.createTime as string) || new Date().toISOString())}
            </span>
          </div>

          {/* Expandable AI Explanation */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary/70 hover:text-primary transition-colors mb-2"
          >
            <Info className="w-3.5 h-3.5" />
            {expanded ? "Hide" : "View"} AI Analysis
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {expanded && (
            <div
              className="mb-3 p-3 rounded-xl text-xs leading-relaxed text-muted-foreground border border-border/50"
              style={{ background: "var(--glass-bg)" }}
            >
              <div className="flex items-center gap-1.5 font-semibold text-primary mb-2 text-[11px] uppercase tracking-wide">
                <Zap className="w-3 h-3" />
                CostGuard AI Analysis
              </div>
              {issue.aiExplanation}

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="font-semibold text-foreground/80 mb-1 text-[11px] uppercase tracking-wide">
                  Recommendation
                </div>
                <p className="text-muted-foreground">{issue.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
        <button
          onClick={handleAction}
          disabled={isAnimating}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
            actionLabel === "Delete"
              ? "btn-danger text-xs py-1.5"
              : actionLabel === "Optimize"
              ? "btn-success text-xs py-1.5"
              : "btn-primary text-xs py-1.5",
            isAnimating && "opacity-50 cursor-not-allowed"
          )}
        >
          {actionLabel === "Delete" ? (
            <Trash2 className="w-3.5 h-3.5" />
          ) : actionLabel === "Optimize" ? (
            <Zap className="w-3.5 h-3.5" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5" />
          )}
          {isAnimating ? "Processing..." : actionLabel}
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium btn-ghost"
        >
          Details
        </button>
      </div>
    </div>
  );
}

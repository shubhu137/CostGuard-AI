"use client";

import { cn } from "@/lib/utils";

interface FilterBarProps {
  severityFilter: string;
  setSeverityFilter: (v: string) => void;
  regionFilter?: string;
  setRegionFilter?: (v: string) => void;
  regions?: string[];
  searchQuery?: string;
  setSearchQuery?: (v: string) => void;
  totalCount: number;
  filteredCount: number;
  onFixAll?: () => void;
  fixAllLabel?: string;
  className?: string;
}

const severities = [
  { value: "all", label: "All", color: "text-muted-foreground" },
  { value: "critical", label: "Critical", color: "text-red-400" },
  { value: "high", label: "High", color: "text-orange-400" },
  { value: "medium", label: "Medium", color: "text-yellow-400" },
  { value: "low", label: "Low", color: "text-blue-400" },
];

export function FilterBar({
  severityFilter,
  setSeverityFilter,
  regionFilter,
  setRegionFilter,
  regions = [],
  searchQuery,
  setSearchQuery,
  totalCount,
  filteredCount,
  onFixAll,
  fixAllLabel = "Fix All Issues",
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl border border-border/50",
        className
      )}
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
    >
      {/* Severity filters */}
      <div className="flex items-center gap-1 flex-wrap">
        {severities.map((s) => (
          <button
            key={s.value}
            onClick={() => setSeverityFilter(s.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border",
              severityFilter === s.value
                ? "bg-primary/15 border-primary/30 text-primary"
                : "bg-transparent border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Region filter */}
      {regions.length > 0 && setRegionFilter && (
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border/50 bg-muted/30 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="all">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      )}

      {/* Search */}
      {setSearchQuery && (
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border/50 bg-muted/30 text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
        />
      )}

      {/* Count indicator */}
      <div className="text-xs text-muted-foreground ml-auto shrink-0">
        Showing{" "}
        <span className="font-semibold text-foreground">{filteredCount}</span>{" "}
        of{" "}
        <span className="font-semibold text-foreground">{totalCount}</span>{" "}
        issues
      </div>

      {/* Fix all button */}
      {onFixAll && (
        <button
          onClick={onFixAll}
          className="btn-primary shrink-0"
        >
          ⚡ {fixAllLabel}
        </button>
      )}
    </div>
  );
}

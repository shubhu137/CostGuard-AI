"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, RefreshCw, Bell, Search, Sparkles, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInterval } from "@/hooks/useInterval";
import { getSecondsUntilNextSlot } from "@/lib/liveData";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle: "Cloud infrastructure overview & real-time insights",
  },
  "/cost": {
    title: "Cost Analysis",
    subtitle: "Detecting idle resources and billing waste",
  },
  "/security": {
    title: "Security Analyzer",
    subtitle: "Identifying risky exposure in your security groups",
  },
  "/optimization": {
    title: "Optimization Insights",
    subtitle: "CPU utilization analysis & rightsizing recommendations",
  },
};

export function TopBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [scanPulse, setScanPulse] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Update countdown every second — no Math
  useInterval(() => {
    const secs = getSecondsUntilNextSlot();
    setCountdown(secs);
    if (secs === 15 || secs === 0) {
      setScanPulse(true);
      const t = setTimeout(() => setScanPulse(false), 1000);
      return () => clearTimeout(t);
    }
  }, 1000);

  const page = pageTitles[pathname] || pageTitles["/"];

  // Progress bar fill % — no Math
  const progressPct = ((15 - countdown) / 15) * 100;
  const progressFill = progressPct < 0 ? 0 : progressPct > 100 ? 100 : progressPct;

  return (
    <header
      className="relative flex flex-col border-b border-border/50 shrink-0"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Live scan progress bar (bottom of topbar) */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/20">
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progressFill}%`,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
          }}
        />
      </div>

      <div className="flex items-center justify-between px-8 py-4">
        {/* Page title */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              {page.title}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-2.5 h-2.5" />
                AI-Powered
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{page.subtitle}</p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search resources..."
              className={cn(
                "pl-9 pr-4 py-2 text-sm rounded-xl border border-border/50 bg-muted/30",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                "transition-all duration-200 w-48 focus:w-64"
              )}
            />
          </div>

          {/* Live scan countdown */}
          <div
            className={cn(
              "hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all duration-300",
              scanPulse
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/30 border-border/50 text-muted-foreground"
            )}
          >
            <Radio
              className={cn("w-3.5 h-3.5", scanPulse && "animate-pulse text-primary")}
            />
            <span className="font-medium">
              {countdown === 0 ? "Scanning…" : `Next scan in ${countdown}s`}
            </span>
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                countdown <= 3 ? "bg-primary animate-pulse" : "bg-emerald-400"
              )}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() => window.location.reload()}
            title="Force refresh"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            title="Notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-background" />
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle theme"
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

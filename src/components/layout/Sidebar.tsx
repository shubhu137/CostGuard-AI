"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  Shield,
  TrendingUp,
  Zap,
  ChevronRight,
  Activity,
  Settings,
  Bell,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview & insights",
  },
  {
    label: "Cost Analysis",
    href: "/cost",
    icon: DollarSign,
    description: "Unattached volumes",
    badge: "6",
    badgeColor: "bg-orange-500/20 text-orange-400",
  },
  {
    label: "Security",
    href: "/security",
    icon: Shield,
    description: "Risky rules & ports",
    badge: "9",
    badgeColor: "bg-red-500/20 text-red-400",
  },
  {
    label: "Optimization",
    href: "/optimization",
    icon: TrendingUp,
    description: "CPU & rightsizing",
    badge: "5",
    badgeColor: "bg-yellow-500/20 text-yellow-400",
  },
];

const bottomNavItems = [
  { label: "Alerts", href: "#", icon: Bell },
  { label: "Settings", href: "#", icon: Settings },
  { label: "Help", href: "#", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="relative flex flex-col h-full w-64 border-r border-border/50 shrink-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(228,35%,5%) 0%, hsl(228,30%,7%) 100%)",
      }}
    >
      {/* Ambient glow top */}
      <div
        className="absolute top-0 left-0 right-0 h-64 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.4), transparent 60%)",
        }}
      />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
            }}
          />
          <Zap className="relative w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight">
            CostGuard AI
          </div>
          <div className="text-[10px] text-white/40 font-medium tracking-widest uppercase mt-0.5">
            Cloud Auditor
          </div>
        </div>
      </div>

      {/* Live status badge */}
      <div className="relative px-4 pt-4">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-emerald-400"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="font-medium">Scan active · 3 regions</span>
          <Activity className="w-3 h-3 ml-auto" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">
          Analyzers
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-item group", isActive ? "active" : "text-white/50 hover:text-white/80")}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/15"
                    : "bg-white/5 group-hover:bg-white/10"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-none">
                  {item.label}
                </div>
                <div
                  className={cn(
                    "text-[11px] mt-0.5 truncate transition-colors",
                    isActive ? "text-white/50" : "text-white/25 group-hover:text-white/40"
                  )}
                >
                  {item.description}
                </div>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
              )}
            </Link>
          );
        })}

        {/* Bottom nav section */}
        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mt-6 mb-2">
          Account
        </div>

        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="sidebar-item w-full text-white/40 hover:text-white/70"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="relative p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            CG
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white/80 truncate">
              Admin User
            </div>
            <div className="text-[10px] text-white/30 truncate">
              admin@costguard.ai
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-white/25 shrink-0" />
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  GripHorizontal,
  AlertTriangle,
  Plus,
  Activity,
  Shield,
  ChevronDown,
} from "lucide-react";
import { ArbiterMark } from "@/components/arbiter-mark";
import { dashboardAgents, disputes } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefixes: string[];
  badge?: string;
  live?: boolean;
};

const navOperator: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, matchPrefixes: ["/dashboard"] },
  {
    href: "/dashboard/agents",
    label: "Agents",
    icon: GripHorizontal,
    badge: String(dashboardAgents.length),
    matchPrefixes: ["/dashboard/agents", "/dashboard/agent"],
  },
  {
    href: "/dashboard/disputes",
    label: "Disputes",
    icon: AlertTriangle,
    badge: String(disputes.filter((dispute) => dispute.status === "open").length),
    matchPrefixes: ["/dashboard/disputes"],
  },
  {
    href: "/dashboard/register",
    label: "Register agent",
    icon: Plus,
    matchPrefixes: ["/dashboard/register"],
  },
];

const navNetwork: NavItem[] = [
  {
    href: "/dashboard/feed",
    label: "Execution feed",
    icon: Activity,
    live: true,
    matchPrefixes: ["/dashboard/feed"],
  },
  {
    href: "/dashboard/keeper",
    label: "Keeper console",
    icon: Shield,
    matchPrefixes: ["/dashboard/keeper"],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = item.href === "/dashboard"
      ? pathname === item.href
      : item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 text-sm transition-colors",
          active
            ? "bg-surface-alt text-foreground"
            : "text-muted-foreground hover:bg-surface-alt hover:text-foreground"
        )}
      >
        {active && <span className="absolute left-0 top-0 h-full w-[2px] bg-accent" />}
        <Icon className="h-3.5 w-3.5" />
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {item.badge}
          </span>
        )}
        {item.live && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" />
        )}
      </Link>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 flex w-[220px] flex-col border-r border-hairline bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-hairline px-4">
        <ArbiterMark size={20} />
        <span className="font-mono text-sm tracking-wide">arbiter</span>
        <span className="ml-auto font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
          v1.0
        </span>
      </div>

      <div className="px-4 pt-6 pb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        Operator
      </div>
      <nav className="px-2 flex flex-col gap-0.5">{navOperator.map(renderItem)}</nav>

      <div className="px-4 pt-6 pb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        Network
      </div>
      <nav className="px-2 flex flex-col gap-0.5">{navNetwork.map(renderItem)}</nav>

      <div className="flex-1" />

      <button
        type="button"
        className="flex items-center gap-2 border-t border-hairline px-4 py-3 text-left transition-colors hover:bg-surface-alt"
      >
        <span className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-700 to-amber-900" />
        <span className="flex min-w-0 flex-col items-start">
          <span className="truncate text-xs font-medium">operator.eth</span>
          <span className="truncate font-mono text-[10px] text-muted-foreground">
            0xa2b...7ef3
          </span>
        </span>
        <ChevronDown className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
      </button>
    </aside>
  );
}

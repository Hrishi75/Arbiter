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
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const navOperator = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/agents", label: "Agents", icon: GripHorizontal, badge: "4" },
  { href: "/dashboard/disputes", label: "Disputes", icon: AlertTriangle, badge: "1" },
  { href: "/dashboard/register", label: "Register agent", icon: Plus },
];

const navNetwork = [
  { href: "/dashboard/feed", label: "Execution feed", icon: Activity, live: true },
  { href: "/dashboard/keeper", label: "Keeper console", icon: Shield },
];

export function SidebarNav() {
  const pathname = usePathname();

  const renderItem = (item: (typeof navOperator)[number] & { live?: boolean }) => {
    const Icon = item.icon;
    const active = pathname === item.href;
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
      <Link href="/" className="flex h-16 items-center gap-3 border-b border-hairline px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-strong bg-background/80 text-foreground shadow-[0_8px_24px_rgba(20,18,16,0.08)]">
          <BrandLogo size={24} />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-sm tracking-[0.18em] text-foreground">ARBITER</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Operator Console
          </div>
        </div>
      </Link>

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

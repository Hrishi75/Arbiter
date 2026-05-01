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
  Settings,
  ChevronDown,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
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
    badge: "4",
    matchPrefixes: ["/dashboard/agents", "/dashboard/agent"],
  },
  {
    href: "/dashboard/disputes",
    label: "Disputes",
    icon: AlertTriangle,
    badge: "1",
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

const navAccount: NavItem[] = [
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    matchPrefixes: ["/dashboard/settings"],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const accountActive = navAccount.some((item) =>
    item.matchPrefixes.some((prefix) => pathname.startsWith(prefix))
  );
  const [accountOpen, setAccountOpen] = React.useState(accountActive);

  React.useEffect(() => {
    if (accountActive) {
      setAccountOpen(true);
    }
  }, [accountActive]);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active =
      item.href === "/dashboard"
        ? pathname === item.href
        : item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "relative flex items-center gap-2 rounded-2xl border border-transparent px-3 py-2 text-sm transition-all",
          active
            ? "border-hairline-strong bg-background/80 text-foreground shadow-[0_12px_28px_rgba(20,18,16,0.06)] dark:shadow-[0_12px_24px_rgba(0,0,0,0.22)]"
            : "text-muted-foreground hover:border-hairline hover:bg-background/55 hover:text-foreground"
        )}
      >
        {active && (
          <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-[2px] rounded-full bg-accent" />
        )}
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
    <aside className="fixed inset-y-0 left-0 flex w-[240px] flex-col border-r border-hairline bg-sidebar/88 backdrop-blur-xl">
      <div className="border-b border-hairline p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-[22px] border border-hairline bg-background/72 px-3 py-3 shadow-[0_14px_36px_rgba(20,18,16,0.08)] transition-colors hover:bg-background dark:shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-hairline bg-background/90">
            <BrandLogo size={28} />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-xs tracking-[0.18em] text-foreground">ARBITER</div>
            <div className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Operator dashboard
            </div>
          </div>
          <span className="ml-auto rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            v1.0
          </span>
        </Link>
      </div>

      <div className="px-4 pt-5 pb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        Operator
      </div>
      <nav className="px-3 flex flex-col gap-1">{navOperator.map(renderItem)}</nav>

      <div className="px-4 pt-6 pb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        Network
      </div>
      <nav className="px-3 flex flex-col gap-1">{navNetwork.map(renderItem)}</nav>

      <div className="mt-auto border-t border-hairline p-3">
        {accountOpen ? (
          <div className="mb-3">
            <div className="px-1 pb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Account
            </div>
            <nav className="flex flex-col gap-1">{navAccount.map(renderItem)}</nav>
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((open) => !open)}
          className="flex w-full items-center gap-3 rounded-[22px] border border-hairline bg-background/68 px-4 py-3 text-left shadow-[0_12px_24px_rgba(20,18,16,0.05)] transition-colors hover:bg-background dark:shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
        >
          <span className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-700 to-amber-900 shadow-inner" />
          <span className="flex min-w-0 flex-col items-start">
            <span className="truncate text-xs font-medium">operator.eth</span>
            <span className="truncate font-mono text-[10px] text-muted-foreground">
              0xa2b...7ef3
            </span>
          </span>
          <ChevronDown
            className={cn(
              "ml-auto h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform",
              accountOpen && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
}

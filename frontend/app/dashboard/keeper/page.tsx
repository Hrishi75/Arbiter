"use client";

import Link from "next/link";
import { Activity, Shield, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Sparkline } from "@/components/dashboard/sparkline";
import { StatusChip } from "@/components/dashboard/status-chip";
import { cn } from "@/lib/utils";
import { useDisputes } from "@/lib/hooks/useDisputes";
import { disputeId, formatEth, remainingWindow, shortenHex } from "@/lib/dashboard-data";

const stats = [
  { label: "Uptime", value: "—", delta: "needs indexer", tone: "muted" as const },
  { label: "Reports filed", value: "—", delta: "needs indexer", tone: "muted" as const },
  { label: "Rewards", value: "—", delta: "needs indexer", tone: "muted" as const },
];

const components = [
  { label: "Watcher", description: "Listens for SlashVerifier.ReportCreated events." },
  { label: "Executor", description: "Submits executeSlash after dispute window elapses." },
  { label: "Biller", description: "Calls generateBill / autoSettleFromBond on schedule." },
];

export default function KeeperConsolePage() {
  const { data: disputes = [] } = useDisputes();
  const queue = disputes.filter((d) => d.status === "open");

  return (
    <>
      <Topbar
        title="Keeper console"
        subtitle="permissionless automation"
        cta={{ href: "/dashboard/disputes?status=open", label: "Open disputes" }}
      />
      <main className="px-7 py-6">
        <div className="grid grid-cols-3 border border-hairline bg-card">
          {stats.map((stat, i) => (
            <div key={stat.label} className={cn("p-5", i < stats.length - 1 && "border-r border-hairline")}>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium tracking-tight">{stat.value}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{stat.delta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="border border-hairline bg-card">
            <header className="border-b border-hairline px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Open queue</h2>
              <span className="font-mono text-[10px] text-muted-foreground">{queue.length} pending</span>
            </header>
            {queue.length === 0 ? (
              <div className="px-5 py-8 text-sm text-muted-foreground">No open disputes.</div>
            ) : (
              queue.map((d, i) => (
                <Link
                  key={d.reportId}
                  href={`/dashboard/agent/${encodeURIComponent(d.agent)}`}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 hover:bg-muted/30",
                    i < queue.length - 1 && "border-b border-hairline"
                  )}
                >
                  <Activity className="h-3.5 w-3.5 text-warn" />
                  <span className="font-mono text-xs text-muted-foreground">{disputeId(d.reportId)}</span>
                  <span className="font-mono text-xs">{shortenHex(d.agent)}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {remainingWindow(d.deadline)} · {formatEth(d.amountWei, 4)} ETH
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))
            )}
          </div>

          <div className="border border-hairline bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-sm font-medium">Components</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {components.map((c) => (
                <li key={c.label} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <StatusChip tone="muted">{c.label}</StatusChip>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 -mx-1 text-muted-foreground/40">
              <Sparkline values={[]} width={240} height={60} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

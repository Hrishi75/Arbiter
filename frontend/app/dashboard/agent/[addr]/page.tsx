"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardSearchForm } from "@/components/dashboard/search-form";
import { StatusChip } from "@/components/dashboard/status-chip";
import { cn } from "@/lib/utils";
import { useAgents } from "@/lib/hooks/useAgents";
import { useFeedEvents } from "@/lib/hooks/useFeedEvents";
import { findAgent, formatEth, getAgentFeedEvents, shortenHex } from "@/lib/dashboard-data";

const toneClass = {
  ok: "text-ok",
  bad: "text-bad",
  muted: "text-muted-foreground",
} as const;

export default function AgentDetailPage() {
  const params = useParams<{ addr: string }>();
  const { data: agents = [], isLoading } = useAgents();
  const { data: events = [] } = useFeedEvents();

  if (isLoading) {
    return <main className="px-7 py-12 text-sm text-muted-foreground">Loading agent…</main>;
  }

  const agent = findAgent(agents, params.addr);
  if (!agent) {
    notFound();
  }

  const executions = getAgentFeedEvents(events, agent.account);
  const ageDays = Math.max(0, Math.floor((Date.now() / 1000 - agent.registeredAt) / 86400));

  const stats = [
    { label: "Bond posted", value: `${formatEth(agent.bondWei, 4)} ETH`, delta: "live", tone: "muted" as const },
    { label: "Status", value: agent.active ? "active" : "inactive", delta: agent.active ? "ok" : "deactivated", tone: agent.active ? "ok" : "muted" },
    { label: "Registered", value: `${ageDays}d ago`, delta: new Date(agent.registeredAt * 1000).toISOString().slice(0, 10), tone: "muted" as const },
    { label: "Events", value: String(executions.length), delta: "all-time", tone: "muted" as const },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline bg-background px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-mono text-xs text-muted-foreground">
              <Link href="/dashboard/agents" className="hover:text-foreground">
                Agents
              </Link>
              <span className="mx-1.5">›</span>
              <span className="text-foreground">{shortenHex(agent.account)}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <h1 className="text-2xl font-medium tracking-tight">{agent.metadataURI || shortenHex(agent.account)}</h1>
              <span className="font-mono text-xs text-muted-foreground">
                {shortenHex(agent.account)} · owner {shortenHex(agent.owner)}
              </span>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <DashboardSearchForm action="/dashboard/feed" widthClassName="w-[260px]" />
            <Button size="sm" className="text-xs" asChild>
              <Link href={`/dashboard/feed?q=${encodeURIComponent(agent.account)}`}>
                View feed
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-7 py-6">
        <div className="grid grid-cols-4 border border-hairline bg-card">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn("p-5", i < stats.length - 1 && "border-r border-hairline")}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium tracking-tight">{stat.value}</span>
                <span className={cn("font-mono text-[10px]", toneClass[stat.tone])}>{stat.delta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 border border-hairline bg-card">
          <header className="border-b border-hairline px-5 py-3">
            <h2 className="text-sm font-medium">Recent events</h2>
          </header>
          <ul>
            {executions.length === 0 ? (
              <li className="px-5 py-8 text-sm text-muted-foreground">
                No on-chain events for this agent yet.
              </li>
            ) : (
              executions.map((execution, i) => (
                <li
                  key={`${execution.txHash}-${i}`}
                  className={cn(
                    "grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 px-5 py-3.5",
                    i < executions.length - 1 && "border-b border-hairline"
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    #{execution.blockNumber.toString()}
                  </span>
                  <StatusChip tone="muted">{execution.kind}</StatusChip>
                  <span className="font-mono text-xs">
                    {execution.amountWei !== undefined ? `${formatEth(execution.amountWei, 4)} ETH` : "—"}
                  </span>
                  <Link
                    href={`/dashboard/feed?q=${encodeURIComponent(execution.txHash)}`}
                    className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    {shortenHex(execution.txHash)}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </>
  );
}

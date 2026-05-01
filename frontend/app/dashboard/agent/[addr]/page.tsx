import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardSearchForm } from "@/components/dashboard/search-form";
import { Sparkline } from "@/components/dashboard/sparkline";
import { StatusChip } from "@/components/dashboard/status-chip";
import { cn } from "@/lib/utils";
import {
  bondedTrend,
  findAgent,
  getAgentExecutions,
  shortenHex,
} from "@/lib/dashboard-data";

const toneClass = {
  ok: "text-ok",
  bad: "text-bad",
  muted: "text-muted-foreground",
} as const;

export default function AgentDetailPage({ params }: { params: { addr: string } }) {
  const agent = findAgent(params.addr);

  if (!agent) {
    notFound();
  }

  const executions = getAgentExecutions(agent.address);
  const repTrend = bondedTrend.map((value, index) =>
    Number((agent.reputation - 0.09 + index * 0.015 + value * 0.001).toFixed(2))
  );
  const stats = [
    {
      label: "Bond posted",
      value: `${agent.bondEth.toFixed(2)} ETH`,
      delta: `score ${agent.score}`,
      tone: "muted" as const,
    },
    {
      label: "Reputation",
      value: agent.reputation.toFixed(2),
      delta: `${agent.delta24h} 24h`,
      tone: agent.status.tone === "bad" ? "bad" : "ok",
    },
    {
      label: "Executions",
      value: agent.totalExecutions.toLocaleString(),
      delta: `${agent.exec24h} · 24h`,
      tone: "muted" as const,
    },
    {
      label: "Slash history",
      value: agent.status.tone === "bad" ? "1" : "0",
      delta: agent.status.tone === "bad" ? "watchlist" : "clean",
      tone: agent.status.tone === "bad" ? "bad" : "muted",
    },
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
              <span className="text-foreground">{agent.name}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <h1 className="text-2xl font-medium tracking-tight">{agent.name}</h1>
              <span className="font-mono text-xs text-muted-foreground">
                {shortenHex(agent.address)} · deployed {agent.deployedDaysAgo}d ago
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <DashboardSearchForm action="/dashboard/feed" widthClassName="w-[260px]" />
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <Link href={`/dashboard/register?agent=${encodeURIComponent(agent.name)}`}>
                Top up bond
              </Link>
            </Button>
            <Button size="sm" className="text-xs" asChild>
              <Link href={`/dashboard/feed?q=${encodeURIComponent(agent.address)}`}>
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
                <span className={cn("font-mono text-[10px]", toneClass[stat.tone])}>
                  {stat.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="border border-hairline bg-card">
            <ul>
              {executions.map((execution, i) => (
                <li
                  key={execution.id}
                  className={cn(
                    "grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-4 px-5 py-3.5",
                    i < executions.length - 1 && "border-b border-hairline"
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {execution.ts}
                  </span>
                  <span className="bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {execution.type}
                  </span>
                  <span className="font-mono text-xs">
                    {execution.pair} · {execution.size}
                  </span>
                  <StatusChip tone={execution.status === "attested" ? "ok" : "warn"}>
                    {execution.status}
                  </StatusChip>
                  {execution.txHash ? (
                    <Link
                      href={`/dashboard/feed?q=${encodeURIComponent(execution.txHash)}`}
                      className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                      {shortenHex(execution.txHash)}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">-</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <div className="border border-hairline bg-card p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium tracking-tight">
                  {agent.reputation.toFixed(2)}
                </span>
                <span className="font-mono text-[10px] text-ok">{agent.delta24h}</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                score {agent.score} · status {agent.status.label}
              </div>

              <div className="mt-4 -mx-1 text-ok">
                <Sparkline values={repTrend} width={240} height={50} />
              </div>

              <dl className="mt-4 flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <dt className="text-muted-foreground">Uniswap v4 hook fee</dt>
                  <dd className="text-foreground">{agent.feeBand}</dd>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <dt className="text-muted-foreground">Priority in keeper routing</dt>
                  <dd className="text-foreground">{agent.keeperPriority}</dd>
                </div>
              </dl>
            </div>

            <div className="border border-hairline bg-card p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium tracking-tight">
                  {agent.bondEth.toFixed(2)} ETH
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Locked until unbond + 7d
              </div>

              <div className="relative mt-5 h-1.5 w-full bg-foreground">
                <span
                  className="absolute -top-1 h-3.5 w-[2px] bg-accent"
                  style={{
                    left: `${Math.min(90, Math.max(20, (0.3 / agent.bondEth) * 100))}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>minimum 0.30</span>
                <span className="text-accent">min threshold</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/dashboard/topbar";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { AgentsTable } from "@/components/dashboard/agents-table";
import { BondedCard } from "@/components/dashboard/bonded-card";
import { DisputeAlert } from "@/components/dashboard/dispute-alert";
import { useAgents } from "@/lib/hooks/useAgents";
import { useDisputes } from "@/lib/hooks/useDisputes";
import { useDashboardStats } from "@/lib/hooks/useDashboardStats";
import { filterAgents, formatEth, readSearchParam } from "@/lib/dashboard-data";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const query = readSearchParam(searchParams.get("q"));

  const { data: allAgents = [] } = useAgents();
  const { data: disputes = [] } = useDisputes();
  const stats = useDashboardStats();

  const agents = filterAgents(allAgents, query);
  const featuredDispute = disputes.find((d) => d.status === "open") ?? null;

  return (
    <>
      <Topbar
        title="Dashboard"
        cta={{ href: "/dashboard/register", label: "+ Register agent" }}
        search={{ action: "/dashboard", value: query }}
      />
      <main className="px-7 py-6">
        <StatStrip
          stats={[
            {
              label: "Active agents",
              value: String(stats.activeAgents),
              delta: `of ${stats.totalAgents}`,
              tone: "muted",
            },
            {
              label: "Total bonded",
              value: `${formatEth(stats.totalBondedWei, 2)} ETH`,
              delta: "—",
              tone: "muted",
            },
            {
              label: "Executions · 24h",
              value: stats.totalExecutions24h?.toLocaleString() ?? "—",
              delta: "needs indexer",
              tone: "muted",
            },
            {
              label: "Disputes open",
              value: String(stats.openDisputes),
              delta: featuredDispute ? "review pending" : "all clear",
              tone: stats.openDisputes ? "bad" : "muted",
            },
          ]}
        />
        {query ? (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Showing {agents.length} of {allAgents.length} agents for &quot;{query}&quot;
          </p>
        ) : null}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <AgentsTable
            agents={agents}
            subtitle="Live from chain. Refreshes every 12s."
          />
          <div className="flex flex-col gap-5">
            <BondedCard
              totalBonded={Number(formatEth(stats.totalBondedWei, 4))}
              delta="—"
              values={[]}
              days={[]}
            />
            <DisputeAlert dispute={featuredDispute} />
          </div>
        </div>
      </main>
    </>
  );
}

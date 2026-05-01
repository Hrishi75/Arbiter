import { Topbar } from "@/components/dashboard/topbar";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { AgentsTable } from "@/components/dashboard/agents-table";
import { BondedCard } from "@/components/dashboard/bonded-card";
import { DisputeAlert } from "@/components/dashboard/dispute-alert";
import {
  bondedTrend,
  dashboardAgents,
  disputes,
  filterAgents,
  getDashboardStats,
  readSearchParam,
  sparklineDays,
} from "@/lib/dashboard-data";

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const query = readSearchParam(searchParams?.q);
  const agents = filterAgents(query);
  const stats = getDashboardStats(agents);
  const featuredDispute = disputes.find((dispute) => dispute.status === "open") ?? null;

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="operator.eth · Mainnet"
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
              value: `${stats.totalBonded.toFixed(2)} ETH`,
              delta: "+0.50 24h",
              tone: "ok",
            },
            {
              label: "Executions · 24h",
              value: stats.totalExecutions24h.toLocaleString(),
              delta: "+8.1%",
              tone: "ok",
            },
            {
              label: "Disputes open",
              value: String(stats.openDisputes),
              delta: featuredDispute?.remainingWindow ?? "all clear",
              tone: stats.openDisputes ? "bad" : "muted",
            },
          ]}
        />
        {query ? (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Showing {agents.length} of {dashboardAgents.length} agents for "{query}"
          </p>
        ) : null}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <AgentsTable
            agents={agents}
            subtitle="Search filters the table while keeping every dashboard route in sync."
          />
          <div className="flex flex-col gap-5">
            <BondedCard
              totalBonded={stats.totalBonded}
              delta="+0.50"
              values={bondedTrend}
              days={sparklineDays}
            />
            <DisputeAlert dispute={featuredDispute} />
          </div>
        </div>
      </main>
    </>
  );
}

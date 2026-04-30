import { Topbar } from "@/components/dashboard/topbar";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { AgentsTable } from "@/components/dashboard/agents-table";
import { BondedCard } from "@/components/dashboard/bonded-card";
import { DisputeAlert } from "@/components/dashboard/dispute-alert";

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="operator.eth · Mainnet" />
      <main className="px-7 py-6">
        <StatStrip />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <AgentsTable />
          <div className="flex flex-col gap-5">
            <BondedCard />
            <DisputeAlert />
          </div>
        </div>
      </main>
    </>
  );
}

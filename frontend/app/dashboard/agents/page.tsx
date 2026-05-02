"use client";

import { useSearchParams } from "next/navigation";
import { AgentsTable } from "@/components/dashboard/agents-table";
import { Topbar } from "@/components/dashboard/topbar";
import { useAgents } from "@/lib/hooks/useAgents";
import { filterAgents, readSearchParam } from "@/lib/dashboard-data";

export default function AgentsPage() {
  const searchParams = useSearchParams();
  const query = readSearchParam(searchParams.get("q"));

  const { data: allAgents = [], isLoading } = useAgents();
  const agents = filterAgents(allAgents, query);

  return (
    <>
      <Topbar
        title="Agents"
        subtitle={`${allAgents.length} registered`}
        cta={{ href: "/dashboard/register", label: "+ Register agent" }}
        search={{ action: "/dashboard/agents", value: query }}
      />
      <main className="px-7 py-6">
        <AgentsTable
          agents={agents}
          title="Registered agents"
          subtitle={
            isLoading
              ? "Loading from chain…"
              : query
                ? `Filtered for "${query}".`
                : "Live from AgentRegistry events."
          }
          emptyMessage={
            isLoading ? "Loading…" : "No agents registered yet — try the register flow."
          }
        />
      </main>
    </>
  );
}

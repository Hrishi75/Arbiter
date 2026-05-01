import { AgentsTable } from "@/components/dashboard/agents-table";
import { Topbar } from "@/components/dashboard/topbar";
import { dashboardAgents, filterAgents, readSearchParam } from "@/lib/dashboard-data";

export default function AgentsPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const query = readSearchParam(searchParams?.q);
  const agents = filterAgents(query);

  return (
    <>
      <Topbar
        title="Agents"
        subtitle={`${dashboardAgents.length} registered operators`}
        cta={{ href: "/dashboard/register", label: "+ Register agent" }}
        search={{ action: "/dashboard/agents", value: query }}
      />

      <main className="px-7 py-6">
        <AgentsTable
          agents={agents}
          title="Registered agents"
          subtitle={
            query
              ? `Filtered results for "${query}".`
              : "Every dashboard route now resolves to a real agent detail page."
          }
          emptyMessage="No registered agents match this search."
        />
      </main>
    </>
  );
}

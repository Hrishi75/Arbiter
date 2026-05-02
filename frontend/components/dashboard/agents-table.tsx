import Link from "next/link";
import { StatusChip } from "@/components/dashboard/status-chip";
import { type Agent, formatEth, shortenHex } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const COLS = "grid-cols-[1.6fr_1fr_1fr_0.8fr]";

interface AgentsTableProps {
  agents: Agent[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export function AgentsTable({
  agents,
  title = "Agents",
  subtitle,
  emptyMessage = "No agents registered yet.",
}: AgentsTableProps) {
  const activeCount = agents.filter((a) => a.active).length;

  return (
    <div className="border border-hairline bg-card">
      <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <div>
          <h2 className="text-sm font-medium">{title}</h2>
          {subtitle ? (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-muted px-2 py-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            {activeCount} active
          </span>
          <Link
            href="/dashboard/agents"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
      </header>

      <div className={cn("grid border-b border-hairline bg-muted/40 px-5 py-2.5", COLS)}>
        {["Agent", "Bond", "Owner", ""].map((h) => (
          <div
            key={h}
            className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground"
          >
            {h}
          </div>
        ))}
      </div>

      {agents.length ? (
        agents.map((agent, i) => (
          <Link
            key={agent.account}
            href={`/dashboard/agent/${encodeURIComponent(agent.account)}`}
            className={cn(
              "grid items-center px-5 py-3.5 transition-colors hover:bg-muted/30",
              COLS,
              i < agents.length - 1 && "border-b border-hairline"
            )}
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{agent.metadataURI || shortenHex(agent.account)}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {shortenHex(agent.account)}
              </span>
            </div>
            <div className="font-mono text-xs">{formatEth(agent.bondWei, 2)} ETH</div>
            <div className="font-mono text-xs text-muted-foreground">
              {shortenHex(agent.owner)}
            </div>
            <div className="flex justify-end">
              <StatusChip tone={agent.active ? "ok" : "muted"}>
                {agent.active ? "active" : "inactive"}
              </StatusChip>
            </div>
          </Link>
        ))
      ) : (
        <div className="px-5 py-8 text-sm text-muted-foreground">{emptyMessage}</div>
      )}
    </div>
  );
}

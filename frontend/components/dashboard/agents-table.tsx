import Link from "next/link";
import { ReputationBar } from "@/components/dashboard/reputation-bar";
import { StatusChip } from "@/components/dashboard/status-chip";
import { type AgentRecord, shortenHex } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const COLS = "grid-cols-[1.4fr_1fr_0.9fr_0.5fr_0.7fr_0.5fr]";

const deltaToneClass: Record<AgentRecord["status"]["tone"], string> = {
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-muted-foreground",
};

interface AgentsTableProps {
  agents: AgentRecord[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export function AgentsTable({
  agents,
  title = "Agents",
  subtitle,
  emptyMessage = "No agents match the current search.",
}: AgentsTableProps) {
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
            {agents.filter((agent) => agent.status.tone === "ok").length} active
          </span>
          <Link
            href="/dashboard/agents"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
      </header>

      <div
        className={cn(
          "grid border-b border-hairline bg-muted/40 px-5 py-2.5",
          COLS
        )}
      >
        {["Agent", "Bond", "Reputation", "24h", "Total exec", ""].map((h) => (
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
            key={agent.address}
            href={`/dashboard/agent/${encodeURIComponent(agent.address)}`}
            className={cn(
              "grid items-center px-5 py-3.5 transition-colors hover:bg-muted/30",
              COLS,
              i < agents.length - 1 && "border-b border-hairline"
            )}
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{agent.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {shortenHex(agent.address)}
              </span>
            </div>
            <div className="font-mono text-xs">{agent.bondEth.toFixed(2)} ETH</div>
            <div className="flex items-center gap-2.5">
              <ReputationBar score={agent.reputation} tone={agent.status.tone} />
              <span className="font-mono text-xs">{agent.reputation.toFixed(2)}</span>
            </div>
            <div className={cn("font-mono text-xs", deltaToneClass[agent.status.tone])}>
              {agent.delta24h}
            </div>
            <div className="font-mono text-xs">
              {agent.totalExecutions.toLocaleString()}
            </div>
            <div className="flex justify-end">
              <StatusChip tone={agent.status.tone}>
                <span className="text-[10px]">{agent.status.mark}</span>
                {agent.status.label}
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

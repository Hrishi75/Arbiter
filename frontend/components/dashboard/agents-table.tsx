import Link from "next/link";
import { ReputationBar } from "@/components/dashboard/reputation-bar";
import { StatusChip } from "@/components/dashboard/status-chip";
import { cn } from "@/lib/utils";

type AgentTone = "ok" | "warn" | "bad";

interface AgentRow {
  name: string;
  addr: string;
  bond: string;
  rep: number;
  exec: number;
  delta: string;
  tone: AgentTone;
  status: { tone: AgentTone; label: string; mark: string };
}

const agents: AgentRow[] = [
  {
    name: "trader-07",
    addr: "0x9c1...a48f",
    bond: "2.00",
    rep: 0.91,
    exec: 847,
    delta: "+12",
    tone: "ok",
    status: { tone: "ok", label: "active", mark: "●" },
  },
  {
    name: "market-maker",
    addr: "0xa2b...7ef3",
    bond: "5.00",
    rep: 0.87,
    exec: 2418,
    delta: "+48",
    tone: "ok",
    status: { tone: "ok", label: "active", mark: "●" },
  },
  {
    name: "arbitrage-02",
    addr: "0x3f6...bd81",
    bond: "1.00",
    rep: 0.62,
    exec: 312,
    delta: "+2",
    tone: "warn",
    status: { tone: "warn", label: "low rep", mark: "△" },
  },
  {
    name: "hedger",
    addr: "0x7b4...bd4a",
    bond: "0.50",
    rep: 0.41,
    exec: 188,
    delta: "—",
    tone: "bad",
    status: { tone: "bad", label: "disputed", mark: "!" },
  },
];

const COLS = "grid-cols-[1.4fr_1fr_0.9fr_0.5fr_0.7fr_0.5fr]";

const deltaToneClass: Record<AgentTone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-muted-foreground",
};

export function AgentsTable() {
  return (
    <div className="border border-hairline bg-card">
      <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <h2 className="text-sm font-medium">Agents</h2>
        <div className="flex items-center gap-3">
          <span className="bg-muted px-2 py-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            4 active
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

      {agents.map((a, i) => (
        <Link
          key={a.name}
          href={`/dashboard/agent/${encodeURIComponent(a.addr)}`}
          className={cn(
            "grid items-center px-5 py-3.5 transition-colors hover:bg-muted/30",
            COLS,
            i < agents.length - 1 && "border-b border-hairline"
          )}
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">{a.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {a.addr}
            </span>
          </div>
          <div className="font-mono text-xs">{a.bond} ETH</div>
          <div className="flex items-center gap-2.5">
            <ReputationBar score={a.rep} tone={a.tone} />
            <span className="font-mono text-xs">{a.rep.toFixed(2)}</span>
          </div>
          <div className={cn("font-mono text-xs", deltaToneClass[a.tone])}>
            {a.delta}
          </div>
          <div className="font-mono text-xs">{a.exec.toLocaleString()}</div>
          <div className="flex justify-end">
            <StatusChip tone={a.status.tone}>
              <span className="text-[10px]">{a.status.mark}</span>
              {a.status.label}
            </StatusChip>
          </div>
        </Link>
      ))}
    </div>
  );
}

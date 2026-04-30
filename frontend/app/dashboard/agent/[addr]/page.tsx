import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/dashboard/sparkline";
import { StatusChip } from "@/components/dashboard/status-chip";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Bond posted", value: "5.00 ETH", delta: "= $17,800", tone: "muted" },
  { label: "Reputation", value: "0.87", delta: "+0.04 30d", tone: "ok" },
  { label: "Executions", value: "2,418", delta: "48 · 24h", tone: "muted" },
  { label: "Slash history", value: "0", delta: "clean", tone: "muted" },
] as const;

const executions = [
  { ts: "14:02:11", type: "swap", desc: "USDC → ETH · 12,000", status: "attested", hash: "0x9c1...a48f" },
  { ts: "14:01:58", type: "swap", desc: "ETH → USDT · 3.2", status: "attested", hash: "0xa2...7ef3" },
  { ts: "14:01:42", type: "pool", desc: "add v4 liq · 5 ETH", status: "attested", hash: "0x3f6...bd81" },
  { ts: "14:00:09", type: "swap", desc: "WBTC → USDC · 0.1", status: "pending", hash: null },
  { ts: "13:58:44", type: "swap", desc: "USDC → ETH · 8,500", status: "attested", hash: "0x7b4...bd4a" },
  { ts: "13:54:02", type: "swap", desc: "ETH → USDC · 1.0", status: "attested", hash: "0x4d3...3a01" },
] as const;

const repTrend = [0.78, 0.80, 0.82, 0.81, 0.83, 0.85, 0.87];

const toneClass = {
  ok: "text-ok",
  bad: "text-bad",
  muted: "text-muted-foreground",
} as const;

export default function AgentDetailPage({ params }: { params: { addr: string } }) {
  // params.addr would resolve the agent in B6 (wagmi); use mock for now.
  void params;

  return (
    <>
      {/* Custom header — has breadcrumb, title, address+age, search, two action buttons */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-background px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-mono text-xs text-muted-foreground">
              <Link href="/dashboard/agents" className="hover:text-foreground">
                Agents
              </Link>
              <span className="mx-1.5">›</span>
              <span className="text-foreground">market-maker</span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <h1 className="text-2xl font-medium tracking-tight">market-maker</h1>
              <span className="font-mono text-xs text-muted-foreground">
                0xa2b...7ef3 · deployed 14d ago
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search agents, tx, attestations"
                className="w-[260px] border border-hairline bg-card py-1.5 pl-9 pr-12 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Top up bond
            </Button>
            <Button size="sm" className="text-xs">
              Pause agent
            </Button>
          </div>
        </div>
      </header>

      <main className="px-7 py-6">
        {/* Stat strip */}
        <div className="grid grid-cols-4 border border-hairline bg-card">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn("p-5", i < stats.length - 1 && "border-r border-hairline")}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium tracking-tight">{s.value}</span>
                <span className={cn("font-mono text-[10px]", toneClass[s.tone])}>
                  {s.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Two-column grid */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          {/* Recent executions */}
          <div className="border border-hairline bg-card">
            <ul>
              {executions.map((e, i) => (
                <li
                  key={e.ts}
                  className={cn(
                    "grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-4 px-5 py-3.5",
                    i < executions.length - 1 && "border-b border-hairline"
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {e.ts}
                  </span>
                  <span className="bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {e.type}
                  </span>
                  <span className="font-mono text-xs">{e.desc}</span>
                  <StatusChip tone={e.status === "attested" ? "ok" : "warn"}>
                    {e.status}
                  </StatusChip>
                  {e.hash ? (
                    <Link
                      href="#"
                      className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                      {e.hash}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">—</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Side: Reputation + Bond locked */}
          <div className="flex flex-col gap-5">
            {/* Reputation card */}
            <div className="border border-hairline bg-card p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium tracking-tight">0.87</span>
                <span className="font-mono text-[10px] text-ok">+0.04</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                rank 12 / 847
              </div>

              <div className="mt-4 -mx-1 text-ok">
                <Sparkline values={[...repTrend]} width={240} height={50} />
              </div>

              <dl className="mt-4 flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <dt className="text-muted-foreground">Uniswap v4 hook fee</dt>
                  <dd className="text-foreground">-3 bp</dd>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <dt className="text-muted-foreground">Priority in keeper routing</dt>
                  <dd className="text-foreground">high</dd>
                </div>
              </dl>
            </div>

            {/* Bond locked card */}
            <div className="border border-hairline bg-card p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium tracking-tight">5.00 ETH</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Locked until unbond + 7d
              </div>

              <div className="mt-5 relative h-1.5 w-full bg-foreground">
                {/* Min threshold marker at 60% (3.00 / 5.00) */}
                <span
                  className="absolute -top-1 h-3.5 w-[2px] bg-accent"
                  style={{ left: "60%" }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>minimum 3.00</span>
                <span className="text-accent">min threshold</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

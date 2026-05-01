import Link from "next/link";
import { Search, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AttStatus = "attested" | "pending" | "failed";

interface FeedEvent {
  ts: string;
  agent: string;
  type: "swap" | "pool" | "call";
  pair: string;
  size: string;
  rep: number;
  hash: string | null;
  status: AttStatus;
}

const events: FeedEvent[] = [
  { ts: "14:02:11.042", agent: "trader-07", type: "swap", pair: "USDC/ETH", size: "12,000", rep: 0.91, hash: "0x9c1...a48f", status: "attested" },
  { ts: "14:02:10.871", agent: "market-maker", type: "swap", pair: "ETH/USDT", size: "3.20", rep: 0.87, hash: "0xa2b...7ef3", status: "attested" },
  { ts: "14:02:09.503", agent: "arbitrage-02", type: "pool", pair: "v4.add", size: "5.00", rep: 0.62, hash: "0x3f6...bd81", status: "attested" },
  { ts: "14:02:08.991", agent: "hedger", type: "swap", pair: "WBTC/USDC", size: "0.10", rep: 0.41, hash: null, status: "pending" },
  { ts: "14:02:07.110", agent: "trader-07", type: "swap", pair: "USDC/ETH", size: "8,500", rep: 0.91, hash: "0x7b4...bd4a", status: "attested" },
  { ts: "14:02:05.832", agent: "market-maker", type: "swap", pair: "ETH/USDC", size: "1.00", rep: 0.87, hash: "0x4d3...3a01", status: "attested" },
  { ts: "14:02:04.221", agent: "node-09", type: "call", pair: "oracle.read", size: "—", rep: 0.78, hash: "0x1c3...982f", status: "attested" },
  { ts: "14:02:02.441", agent: "arbitrage-02", type: "swap", pair: "USDT/DAI", size: "22,000", rep: 0.62, hash: "0x9b2...7f20", status: "attested" },
  { ts: "14:02:01.009", agent: "hedger", type: "swap", pair: "ETH/USDT", size: "0.50", rep: 0.41, hash: null, status: "failed" },
  { ts: "14:01:59.772", agent: "trader-07", type: "swap", pair: "USDC/WBTC", size: "4,200", rep: 0.91, hash: "0x2a1...8b1c", status: "attested" },
];

const repTone = (rep: number): "ok" | "warn" | "bad" =>
  rep >= 0.75 ? "ok" : rep >= 0.5 ? "warn" : "bad";

const repClass = { ok: "text-ok", warn: "text-warn", bad: "text-bad" } as const;

const COLS =
  "grid-cols-[160px_140px_70px_140px_minmax(0,1fr)_70px_minmax(0,1fr)_24px]";

function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 border border-hairline-strong px-3 py-1.5 font-mono text-xs transition-colors hover:bg-surface-alt"
    >
      {children}
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}

export default function FeedPage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-hairline bg-background px-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-medium tracking-tight">Execution feed</h1>
          <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" />
            live · attesting to EAS
          </span>
        </div>

        <div className="flex items-center gap-2">
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
            Filters
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Export
          </Button>
        </div>
      </header>

      <main className="px-7 py-6">
        {/* Filter bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip>All 4 agents</FilterChip>
            <FilterChip>All types</FilterChip>
            <FilterChip>Rep ≥ 0</FilterChip>
            <FilterChip>Last 1h</FilterChip>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            10,842 events · 14.2/s
          </div>
        </div>

        {/* Table */}
        <div className="border border-hairline bg-card">
          <div
            className={cn(
              "grid items-center border-b border-hairline px-5 py-2.5",
              COLS
            )}
          >
            {["TS", "AGENT", "TYPE", "PAIR", "SIZE", "REP", "ATT", ""].map((h, i) => (
              <div
                key={`${h}-${i}`}
                className={cn(
                  "font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground",
                  h === "SIZE" && "text-right"
                )}
              >
                {h}
              </div>
            ))}
          </div>

          {events.map((e, i) => {
            const tone = repTone(e.rep);
            return (
              <div
                key={`${e.ts}-${i}`}
                className={cn(
                  "grid items-center px-5 py-3 transition-colors hover:bg-muted/30",
                  COLS,
                  i < events.length - 1 && "border-b border-hairline"
                )}
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {e.ts}
                </span>
                <span className="font-mono text-xs">{e.agent}</span>
                <span className="bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground w-fit">
                  {e.type}
                </span>
                <span className="font-mono text-xs">{e.pair}</span>
                <span className="text-right font-mono text-xs tabular-nums">
                  {e.size}
                </span>
                <span className={cn("font-mono text-xs", repClass[tone])}>
                  {e.rep.toFixed(2)}
                </span>
                {e.hash ? (
                  <Link
                    href="#"
                    className="flex items-center gap-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    {e.hash}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">
                    {e.status === "failed" ? "!" : "—"}
                  </span>
                )}
                <span className="flex justify-end">
                  {e.status === "attested" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                  )}
                  {e.status === "pending" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                  )}
                  {e.status === "failed" && (
                    <span className="font-mono text-xs text-bad">!</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

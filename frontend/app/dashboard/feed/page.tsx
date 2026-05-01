import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";
import {
  filterFeedEvents,
  readSearchParam,
  shortenHex,
} from "@/lib/dashboard-data";

const repTone = (rep: number): "ok" | "warn" | "bad" =>
  rep >= 0.75 ? "ok" : rep >= 0.5 ? "warn" : "bad";

const repClass = { ok: "text-ok", warn: "text-warn", bad: "text-bad" } as const;

const COLS =
  "grid-cols-[160px_140px_70px_140px_minmax(0,1fr)_70px_minmax(0,1fr)_24px]";

function FilterChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 border border-hairline-strong px-3 py-1.5 font-mono text-xs transition-colors hover:bg-surface-alt">
      {children}
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </span>
  );
}

export default function FeedPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[]; type?: string | string[]; status?: string | string[] };
}) {
  const query = readSearchParam(searchParams?.q);
  const type = readSearchParam(searchParams?.type);
  const status = readSearchParam(searchParams?.status);
  const events = filterFeedEvents(query, { type, status });

  return (
    <>
      <Topbar
        title="Execution feed"
        subtitle="live · attesting to EAS"
        search={{ action: "/dashboard/feed", value: query, params: { type, status } }}
      />

      <main className="px-7 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/feed">
              <FilterChip>All activity</FilterChip>
            </Link>
            <Link href="/dashboard/feed?type=swap">
              <FilterChip>Swap only</FilterChip>
            </Link>
            <Link href="/dashboard/feed?type=pool">
              <FilterChip>Pool only</FilterChip>
            </Link>
            <Link href="/dashboard/feed?status=pending">
              <FilterChip>Pending only</FilterChip>
            </Link>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {events.length} events visible
          </div>
        </div>

        <div className="border border-hairline bg-card">
          <div
            className={cn(
              "grid items-center border-b border-hairline px-5 py-2.5",
              COLS
            )}
          >
            {["TS", "AGENT", "TYPE", "PAIR", "SIZE", "REP", "ATT", ""].map((header, i) => (
              <div
                key={`${header}-${i}`}
                className={cn(
                  "font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground",
                  header === "SIZE" && "text-right"
                )}
              >
                {header}
              </div>
            ))}
          </div>

          {events.length ? (
            events.map((event, i) => {
              const tone = repTone(event.reputation);
              return (
                <div
                  key={event.id}
                  className={cn(
                    "grid items-center px-5 py-3 transition-colors hover:bg-muted/30",
                    COLS,
                    i < events.length - 1 && "border-b border-hairline"
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {event.ts}
                  </span>
                  <Link
                    href={`/dashboard/agent/${encodeURIComponent(event.agentAddress)}`}
                    className="font-mono text-xs hover:text-foreground"
                  >
                    {event.agentName}
                  </Link>
                  <span className="w-fit bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {event.type}
                  </span>
                  <span className="font-mono text-xs">{event.pair}</span>
                  <span className="text-right font-mono text-xs tabular-nums">
                    {event.size}
                  </span>
                  <span className={cn("font-mono text-xs", repClass[tone])}>
                    {event.reputation.toFixed(2)}
                  </span>
                  {event.txHash ? (
                    <Link
                      href={`/dashboard/feed?q=${encodeURIComponent(event.txHash)}`}
                      className="truncate font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                      {shortenHex(event.txHash)}
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      {event.status === "failed" ? "!" : "-"}
                    </span>
                  )}
                  <span className="flex justify-end">
                    {event.status === "attested" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                    )}
                    {event.status === "pending" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                    )}
                    {event.status === "failed" && (
                      <span className="font-mono text-xs text-bad">!</span>
                    )}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              No feed events match the current filters.
            </div>
          )}
        </div>
      </main>
    </>
  );
}

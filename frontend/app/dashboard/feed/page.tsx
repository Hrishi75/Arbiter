"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";
import { useFeedEvents } from "@/lib/hooks/useFeedEvents";
import {
  type FeedEvent,
  filterFeedEvents,
  formatEth,
  readSearchParam,
  shortenHex,
} from "@/lib/dashboard-data";

const COLS = "grid-cols-[120px_180px_140px_minmax(0,1fr)_180px]";

const kindLabel: Record<FeedEvent["kind"], string> = {
  agent_registered: "register",
  staked: "stake",
  report_created: "report",
  slash_executed: "slash",
};

const kindTone: Record<FeedEvent["kind"], string> = {
  agent_registered: "text-ok",
  staked: "text-foreground",
  report_created: "text-warn",
  slash_executed: "text-bad",
};

function FilterChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 border border-hairline-strong px-3 py-1.5 font-mono text-xs transition-colors hover:bg-surface-alt">
      {children}
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </span>
  );
}

export default function FeedPage() {
  const searchParams = useSearchParams();
  const query = readSearchParam(searchParams.get("q"));
  const kind = readSearchParam(searchParams.get("kind"));

  const { data: allEvents = [] } = useFeedEvents();
  const events = filterFeedEvents(allEvents, query, { kind });

  return (
    <>
      <Topbar
        title="Execution feed"
        subtitle="live · contract events"
        search={{ action: "/dashboard/feed", value: query, params: { kind } }}
      />
      <main className="px-7 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/feed">
              <FilterChip>All activity</FilterChip>
            </Link>
            <Link href="/dashboard/feed?kind=agent_registered">
              <FilterChip>Registered</FilterChip>
            </Link>
            <Link href="/dashboard/feed?kind=staked">
              <FilterChip>Staked</FilterChip>
            </Link>
            <Link href="/dashboard/feed?kind=report_created">
              <FilterChip>Reports</FilterChip>
            </Link>
            <Link href="/dashboard/feed?kind=slash_executed">
              <FilterChip>Slashes</FilterChip>
            </Link>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {events.length} events visible
          </div>
        </div>

        <div className="border border-hairline bg-card">
          <div className={cn("grid items-center border-b border-hairline px-5 py-2.5", COLS)}>
            {["BLOCK", "AGENT", "TYPE", "DETAIL", "TX"].map((h) => (
              <div
                key={h}
                className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground"
              >
                {h}
              </div>
            ))}
          </div>

          {events.length ? (
            events.map((event, i) => (
              <div
                key={`${event.txHash}-${i}`}
                className={cn(
                  "grid items-center px-5 py-3 transition-colors hover:bg-muted/30",
                  COLS,
                  i < events.length - 1 && "border-b border-hairline"
                )}
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  #{event.blockNumber.toString()}
                </span>
                <Link
                  href={`/dashboard/agent/${encodeURIComponent(event.agent)}`}
                  className="font-mono text-xs hover:text-foreground"
                >
                  {shortenHex(event.agent)}
                </Link>
                <span className={cn("w-fit bg-muted px-2 py-0.5 font-mono text-[10px] uppercase", kindTone[event.kind])}>
                  {kindLabel[event.kind]}
                </span>
                <span className="font-mono text-xs">
                  {event.amountWei !== undefined ? `${formatEth(event.amountWei, 4)} ETH` : "—"}
                  {event.reportId !== undefined ? ` · report #${event.reportId}` : ""}
                </span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {shortenHex(event.txHash)}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              No feed events yet — register an agent or file a report to see activity.
            </div>
          )}
        </div>
      </main>
    </>
  );
}

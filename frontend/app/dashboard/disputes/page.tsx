"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDisputes } from "@/lib/hooks/useDisputes";
import {
  type DisputeStatus,
  disputeId,
  filterDisputes,
  formatEth,
  readSearchParam,
  remainingWindow,
  shortenHex,
} from "@/lib/dashboard-data";

const statusTone: Record<DisputeStatus, "ok" | "warn" | "bad" | "muted"> = {
  open: "warn",
  disputed: "bad",
  executed: "muted",
};

const statusFilters = [
  { href: "/dashboard/disputes", label: "All", value: "all" },
  { href: "/dashboard/disputes?status=open", label: "Open", value: "open" },
  { href: "/dashboard/disputes?status=disputed", label: "Disputed", value: "disputed" },
  { href: "/dashboard/disputes?status=executed", label: "Executed", value: "executed" },
];

export default function DisputesPage() {
  const searchParams = useSearchParams();
  const query = readSearchParam(searchParams.get("q"));
  const status = readSearchParam(searchParams.get("status"));

  const { data: allDisputes = [] } = useDisputes();
  const disputes = filterDisputes(allDisputes, query, { status });

  return (
    <>
      <Topbar
        title="Disputes"
        subtitle={`${disputes.length} cases in queue`}
        search={{ action: "/dashboard/disputes", value: query, params: { status } }}
      />
      <main className="px-7 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => {
            const active = (status || "all") === filter.value;
            return (
              <Link
                key={filter.value}
                href={filter.href}
                className={cn(
                  "border px-3 py-1.5 font-mono text-xs transition-colors",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-hairline-strong hover:bg-surface-alt"
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <div className="border border-hairline bg-card">
          {disputes.length ? (
            disputes.map((d, index) => (
              <div
                key={d.reportId}
                className={cn(
                  "flex items-start justify-between gap-5 px-5 py-4",
                  index < disputes.length - 1 && "border-b border-hairline"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {disputeId(d.reportId)}
                    </span>
                    <StatusChip tone={statusTone[d.status]}>{d.status}</StatusChip>
                  </div>
                  <h2 className="mt-2 text-sm font-medium">
                    {shortenHex(d.agent)} · {d.reason}
                  </h2>
                  <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                    Evidence: {d.evidenceURI || "—"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[10px] text-muted-foreground">
                    <span>reporter {shortenHex(d.reporter)}</span>
                    <span>window {remainingWindow(d.deadline)}</span>
                    <span>amount {formatEth(d.amountWei, 4)} ETH</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" asChild className="text-xs">
                    <Link href={`/dashboard/agent/${encodeURIComponent(d.agent)}`}>
                      Open agent
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 px-5 py-8 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              No disputes match the current filters.
            </div>
          )}
        </div>
      </main>
    </>
  );
}

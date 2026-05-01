import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  filterDisputes,
  readSearchParam,
  shortenHex,
} from "@/lib/dashboard-data";

const severityTone = {
  high: "bad",
  medium: "warn",
} as const;

const severityFilters = [
  { href: "/dashboard/disputes", label: "All severities", value: "all" },
  { href: "/dashboard/disputes?severity=high", label: "High only", value: "high" },
  { href: "/dashboard/disputes?severity=medium", label: "Medium only", value: "medium" },
];

export default function DisputesPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[]; severity?: string | string[] };
}) {
  const query = readSearchParam(searchParams?.q);
  const severity = readSearchParam(searchParams?.severity);
  const filteredDisputes = filterDisputes(query, { severity });

  return (
    <>
      <Topbar
        title="Disputes"
        subtitle={`${filteredDisputes.length} cases in queue`}
        search={{ action: "/dashboard/disputes", value: query, params: { severity } }}
      />

      <main className="px-7 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {severityFilters.map((filter) => {
            const active = (severity || "all") === filter.value;
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
          {filteredDisputes.length ? (
            filteredDisputes.map((dispute, index) => (
              <div
                key={dispute.id}
                className={cn(
                  "flex items-start justify-between gap-5 px-5 py-4",
                  index < filteredDisputes.length - 1 && "border-b border-hairline"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {dispute.id}
                    </span>
                    <StatusChip tone={severityTone[dispute.severity]}>
                      {dispute.severity}
                    </StatusChip>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {dispute.status}
                    </span>
                  </div>
                  <h2 className="mt-2 text-sm font-medium">
                    {dispute.agentName} · {dispute.reason}
                  </h2>
                  <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                    {dispute.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[10px] text-muted-foreground">
                    <span>{shortenHex(dispute.agentAddress)}</span>
                    <span>window {dispute.remainingWindow}</span>
                    <span>reward +{dispute.rewardEth.toFixed(2)} ETH</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href={`/dashboard/feed?q=${encodeURIComponent(dispute.executionRef)}`}>
                      Inspect event
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="text-xs">
                    <Link
                      href={`/dashboard/agent/${encodeURIComponent(dispute.agentAddress)}`}
                    >
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

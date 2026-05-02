import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { type Dispute, disputeId, formatEth, remainingWindow, shortenHex } from "@/lib/dashboard-data";

export function DisputeAlert({ dispute }: { dispute: Dispute | null }) {
  if (!dispute) {
    return (
      <div className="border border-hairline bg-card px-5 py-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ok">
          No open disputes
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          All registered agents are currently inside policy.
        </p>
      </div>
    );
  }

  return (
    <Link
      href="/dashboard/disputes"
      className="block border border-l-[3px] border-hairline border-l-accent bg-card px-5 py-4 transition-colors hover:bg-secondary/40"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-accent" />
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
          Dispute open
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {remainingWindow(dispute.deadline)}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-medium">
        {shortenHex(dispute.agent)} · {disputeId(dispute.reportId)}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {dispute.reason} · {formatEth(dispute.amountWei, 4)} ETH at risk
      </p>
    </Link>
  );
}

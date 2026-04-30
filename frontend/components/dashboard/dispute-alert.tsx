import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function DisputeAlert() {
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
          47h 12m
        </span>
      </div>
      <h3 className="mt-2 text-sm font-medium">
        hedger · execution 0x3f6...bd81
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Keeper reported slippage beyond declared tolerance. Respond or auto-slash.
      </p>
    </Link>
  );
}

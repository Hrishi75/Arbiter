import Link from "next/link";
import { Topbar } from "@/components/dashboard/topbar";
import { Sparkline } from "@/components/dashboard/sparkline";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { disputes, rewardTrend, sparklineDays } from "@/lib/dashboard-data";

type Tone = "ok" | "warn" | "bad" | "muted";

const stats = [
  { label: "Uptime · 30d", value: "99.98%", delta: "1,293 blk missed", tone: "muted" as const },
  { label: "Reports filed", value: "412", delta: "+8 · 24h", tone: "ok" as const },
  { label: "Reports accepted", value: "396", delta: "96.1% rate", tone: "ok" as const },
  { label: "Rewards · 30d", value: "2.14 ETH", delta: "= $7,490", tone: "muted" as const },
  { label: "Keeper rank", value: "#12", delta: "of 847", tone: "muted" as const },
];

const components = [
  { name: "EAS signer", status: "operational", tone: "ok" as Tone },
  { name: "RPC endpoint", status: "142ms avg", tone: "ok" as Tone },
  { name: "KeeperHub relay", status: "operational", tone: "ok" as Tone },
  { name: "Slashing bot", status: "standby", tone: "warn" as Tone },
];

const toneBg: Record<Tone, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  bad: "bg-bad",
  muted: "bg-muted-foreground",
};

const toneText: Record<Tone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
  muted: "text-muted-foreground",
};

const DISPUTE_COLS =
  "grid-cols-[110px_minmax(0,1fr)_60px_minmax(0,1fr)_100px_auto]";

export default function KeeperConsolePage() {
  return (
    <>
      <Topbar
        title="Keeper console"
        subtitle="keeper-7x · operational"
        cta={{ href: "/dashboard/disputes?severity=high", label: "Open disputes" }}
      />

      <main className="px-7 py-6">
        <div className="grid grid-cols-5 border border-hairline bg-card">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn("p-5", i < stats.length - 1 && "border-r border-hairline")}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-2 text-2xl font-medium tracking-tight">
                {stat.value}
              </div>
              <div className={cn("mt-1 font-mono text-[10px]", toneText[stat.tone])}>
                {stat.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="border border-hairline bg-card">
            <ul>
              {disputes.map((dispute, i) => (
                <li
                  key={dispute.id}
                  className={cn(
                    "grid items-center px-5 py-4",
                    DISPUTE_COLS,
                    i < disputes.length - 1 && "border-b border-hairline"
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {dispute.id}
                  </span>
                  <span className="font-mono text-xs">
                    <span className="text-foreground">{dispute.agentName}</span>
                    <span className="mx-1.5 text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{dispute.reason}</span>
                  </span>
                  <StatusChip tone={dispute.severity === "high" ? "bad" : "warn"}>
                    {dispute.severity.toUpperCase()}
                  </StatusChip>
                  <span className="font-mono text-xs text-muted-foreground">
                    window {dispute.remainingWindow}
                  </span>
                  <span className="font-mono text-xs text-ok">
                    +{dispute.rewardEth.toFixed(2)} ETH
                  </span>
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <Link
                      href={`/dashboard/agent/${encodeURIComponent(dispute.agentAddress)}`}
                    >
                      Resolve
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <div className="border border-hairline bg-card p-5">
              <ul className="flex flex-col gap-3">
                {components.map((component) => (
                  <li
                    key={component.name}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", toneBg[component.tone])}
                      />
                      <span className="text-sm">{component.name}</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {component.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-hairline bg-card p-5">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Rewards · 7d
              </div>
              <div className="-mx-1 mt-3 text-accent">
                <Sparkline values={rewardTrend} width={240} height={60} />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
                {sparklineDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

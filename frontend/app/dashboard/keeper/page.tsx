import { Topbar } from "@/components/dashboard/topbar";
import { Sparkline } from "@/components/dashboard/sparkline";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "bad" | "muted";

const stats = [
  { label: "Uptime · 30d", value: "99.98%", delta: "1,293 blk missed", tone: "muted" as const },
  { label: "Reports filed", value: "412", delta: "+8 · 24h", tone: "ok" as const },
  { label: "Reports accepted", value: "396", delta: "96.1% rate", tone: "ok" as const },
  { label: "Rewards · 30d", value: "2.14 ETH", delta: "= $7,490", tone: "muted" as const },
  { label: "Keeper rank", value: "#12", delta: "of 847", tone: "muted" as const },
];

const disputes = [
  { id: "DSP-0094", agent: "hedger", reason: "slippage", severity: "HIGH", window: "47h 12m", reward: "+0.05 ETH" },
  { id: "DSP-0093", agent: "node-12", reason: "timeout", severity: "HIGH", window: "22h 04m", reward: "+0.03 ETH" },
  { id: "DSP-0092", agent: "trader-11", reason: "oracle", severity: "MED", window: "08h 41m", reward: "+0.02 ETH" },
  { id: "DSP-0091", agent: "hedger-03", reason: "slippage", severity: "MED", window: "03h 12m", reward: "+0.04 ETH" },
];

const components = [
  { name: "EAS signer", status: "operational", tone: "ok" as Tone },
  { name: "RPC endpoint", status: "142ms avg", tone: "ok" as Tone },
  { name: "KeeperHub relay", status: "operational", tone: "ok" as Tone },
  { name: "Slashing bot", status: "standby", tone: "warn" as Tone },
];

const rewardTrend = [0.18, 0.22, 0.16, 0.21, 0.28, 0.31, 0.34];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
        cta={{ href: "#", label: "Claim next" }}
      />

      <main className="px-7 py-6">
        {/* Stat strip — 5 cells */}
        <div className="grid grid-cols-5 border border-hairline bg-card">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "p-5",
                i < stats.length - 1 && "border-r border-hairline"
              )}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-2 text-2xl font-medium tracking-tight">
                {s.value}
              </div>
              <div
                className={cn(
                  "mt-1 font-mono text-[10px]",
                  toneText[s.tone]
                )}
              >
                {s.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Two-column grid */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          {/* Dispute resolution queue */}
          <div className="border border-hairline bg-card">
            <ul>
              {disputes.map((d, i) => (
                <li
                  key={d.id}
                  className={cn(
                    "grid items-center px-5 py-4",
                    DISPUTE_COLS,
                    i < disputes.length - 1 && "border-b border-hairline"
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {d.id}
                  </span>
                  <span className="font-mono text-xs">
                    <span className="text-foreground">{d.agent}</span>
                    <span className="mx-1.5 text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{d.reason}</span>
                  </span>
                  <StatusChip tone={d.severity === "HIGH" ? "bad" : "warn"}>
                    {d.severity}
                  </StatusChip>
                  <span className="font-mono text-xs text-muted-foreground">
                    window {d.window}
                  </span>
                  <span className="font-mono text-xs text-ok">{d.reward}</span>
                  <Button variant="outline" size="sm" className="text-xs">
                    Resolve
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Side: System status + Rewards chart */}
          <div className="flex flex-col gap-5">
            {/* System status */}
            <div className="border border-hairline bg-card p-5">
              <ul className="flex flex-col gap-3">
                {components.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", toneBg[c.tone])}
                      />
                      <span className="text-sm">{c.name}</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rewards chart */}
            <div className="border border-hairline bg-card p-5">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Rewards · 7d
              </div>
              <div className="-mx-1 mt-3 text-accent">
                <Sparkline values={rewardTrend} width={240} height={60} />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
                {days.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

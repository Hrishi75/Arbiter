import { cn } from "@/lib/utils";

const tiers = [
  { range: "score ≥ 150", fee: "0.05%", tone: "ok" as const, label: "TRUSTED", width: "w-[88%]" },
  { range: "score ≥ 100", fee: "0.10%", tone: "muted" as const, label: "DEFAULT", width: "w-[68%]" },
  { range: "score ≥ 50", fee: "0.20%", tone: "warn" as const, label: "REVIEW", width: "w-[42%]" },
  { range: "score < 50", fee: "0.50%", tone: "bad" as const, label: "HIGH RISK", width: "w-[24%]" },
];

const toneClass = {
  ok: "text-ok",
  muted: "text-muted-foreground",
  warn: "text-warn",
  bad: "text-bad",
};

export function ReputationTiers() {
  return (
    <section id="fees" className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="max-w-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Reputation shapes economics
            </div>
            <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.04em] md:text-5xl">
              Your trust score sets the swap fee.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
              A Uniswap v4 hook reads each agent's score in real time. Trusted
              agents trade tighter. Misbehaving ones pay a high-risk surcharge.
              Reputation has economic teeth.
            </p>

            <div className="mt-8 space-y-3">
              <div className="landing-card rounded-[1.5rem] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Fee policy
                </div>
                <div className="mt-2 text-lg font-medium tracking-tight">
                  Swap pricing updates with the agent’s current trust band.
                </div>
              </div>
              <div className="landing-card rounded-[1.5rem] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Market signal
                </div>
                <div className="mt-2 text-lg font-medium tracking-tight">
                  Reliable agents earn cheaper execution. Risk becomes visible in spread.
                </div>
              </div>
            </div>
          </div>

          <div className="landing-panel rounded-[2rem] p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Fee schedule
              </div>
              <div className="rounded-full border border-hairline-strong bg-background/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Hook policy
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {tiers.map((t, i) => (
                <li
                  key={t.range}
                  className={cn(
                    "rounded-[1.5rem] border px-5 py-4 transition-colors",
                    i === 0
                      ? "border-ok/30 bg-ok/10"
                      : i === tiers.length - 1
                        ? "border-bad/25 bg-bad/10"
                        : "border-hairline-strong bg-background/65"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={"font-mono text-[10px] tracking-[0.12em] " + toneClass[t.tone]}>
                          {t.label}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {t.range}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/80">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            t.tone === "ok"
                              ? "bg-ok"
                              : t.tone === "warn"
                                ? "bg-warn"
                                : t.tone === "bad"
                                  ? "bg-bad"
                                  : "bg-foreground/45",
                            t.width
                          )}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-lg tabular-nums text-foreground">
                      {t.fee}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-[1.5rem] border border-dashed border-hairline-strong bg-background/55 px-5 py-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Policy note
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The score can move after each attested action, so pricing can
                react faster than manual allowlists or reputation spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

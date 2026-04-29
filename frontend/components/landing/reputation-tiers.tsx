const tiers = [
  { range: "score ≥ 150", fee: "0.05%", tone: "ok" as const, label: "TRUSTED" },
  { range: "score ≥ 100", fee: "0.10%", tone: "muted" as const, label: "DEFAULT" },
  { range: "score ≥ 50", fee: "0.20%", tone: "warn" as const, label: "REVIEW" },
  { range: "score < 50", fee: "0.50%", tone: "bad" as const, label: "HIGH RISK" },
];

const toneClass = {
  ok: "text-ok",
  muted: "text-muted-foreground",
  warn: "text-warn",
  bad: "text-bad",
};

export function ReputationTiers() {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Reputation shapes economics
            </div>
            <h2 className="mb-5 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Your trust score sets the swap fee.
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              A Uniswap v4 hook reads each agent's score in real time. Trusted
              agents trade tighter. Misbehaving ones pay a high-risk surcharge.
              Reputation has economic teeth.
            </p>
          </div>

          <div className="border border-hairline bg-card">
            <div className="border-b border-hairline px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Fee schedule
            </div>
            <ul>
              {tiers.map((t, i) => (
                <li
                  key={t.range}
                  className={
                    "flex items-center justify-between px-5 py-4" +
                    (i < tiers.length - 1 ? " border-b border-hairline" : "")
                  }
                >
                  <div className="flex items-center gap-4">
                    <span className={"font-mono text-[10px] tracking-[0.12em] " + toneClass[t.tone]}>
                      {t.label}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {t.range}
                    </span>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-foreground">
                    {t.fee}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

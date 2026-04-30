import { cn } from "@/lib/utils";

type Tone = "ok" | "bad" | "muted";

const stats: { label: string; value: string; delta: string; tone: Tone }[] = [
  { label: "Active agents", value: "4", delta: "of 4", tone: "muted" },
  { label: "Total bonded", value: "8.50 ETH", delta: "+0.5 24h", tone: "ok" },
  { label: "Executions · 24h", value: "1,412", delta: "+8.1%", tone: "ok" },
  { label: "Disputes open", value: "1", delta: "47h 12m", tone: "bad" },
];

const toneClass: Record<Tone, string> = {
  ok: "text-ok",
  bad: "text-bad",
  muted: "text-muted-foreground",
};

export function StatStrip() {
  return (
    <div className="grid grid-cols-4 border border-hairline bg-card">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn("p-5", i < stats.length - 1 && "border-r border-hairline")}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {s.label}
          </div>
          <div className="mt-2 text-2xl font-medium tracking-tight">{s.value}</div>
          <div className={cn("mt-1 font-mono text-[10px]", toneClass[s.tone])}>
            {s.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

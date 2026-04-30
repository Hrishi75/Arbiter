import { cn } from "@/lib/utils";

interface ReputationBarProps {
  /** 0..1 normalized score */
  score: number;
  tone?: "ok" | "warn" | "bad";
  className?: string;
}

export function ReputationBar({ score, tone, className }: ReputationBarProps) {
  const t = tone ?? (score >= 0.75 ? "ok" : score >= 0.5 ? "warn" : "bad");
  const fill = { ok: "bg-ok", warn: "bg-warn", bad: "bg-bad" }[t];
  const width = Math.max(0, Math.min(1, score)) * 100;

  return (
    <div className={cn("h-1 w-12 bg-secondary", className)}>
      <div className={cn("h-full", fill)} style={{ width: `${width}%` }} />
    </div>
  );
}

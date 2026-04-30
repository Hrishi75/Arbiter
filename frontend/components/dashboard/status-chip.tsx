import { cn } from "@/lib/utils";

interface StatusChipProps {
  tone: "ok" | "warn" | "bad" | "muted" | "accent";
  className?: string;
  children: React.ReactNode;
}

const toneClass: Record<StatusChipProps["tone"], string> = {
  ok: "text-ok bg-ok/10",
  warn: "text-warn bg-warn/10",
  bad: "text-bad bg-bad/10",
  muted: "text-muted-foreground bg-muted",
  accent: "text-accent bg-accent/10",
};

export function StatusChip({ tone, className, children }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] tracking-[0.04em]",
        toneClass[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

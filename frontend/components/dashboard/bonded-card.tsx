import { Sparkline } from "@/components/dashboard/sparkline";

interface BondedCardProps {
  totalBonded: number;
  delta: string;
  values: number[];
  days: string[];
}

export function BondedCard({
  totalBonded,
  delta,
  values,
  days,
}: BondedCardProps) {
  return (
    <div className="border border-hairline bg-card p-5">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Total bonded · 7d
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-medium tracking-tight">
          {totalBonded.toFixed(2)} ETH
        </span>
        <span className="font-mono text-[10px] text-ok">{delta}</span>
      </div>
      <div className="-mx-1 mt-3 text-foreground">
        <Sparkline values={values} width={240} height={60} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}

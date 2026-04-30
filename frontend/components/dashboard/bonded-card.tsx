import { Sparkline } from "@/components/dashboard/sparkline";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const values = [7.5, 7.8, 8.0, 8.0, 8.2, 8.0, 8.5];

export function BondedCard() {
  return (
    <div className="border border-hairline bg-card p-5">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Total bonded · 7d
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-medium tracking-tight">8.50 ETH</span>
        <span className="font-mono text-[10px] text-ok">+0.50</span>
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

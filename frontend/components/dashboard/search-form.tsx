import Link from "next/link";
import { Search } from "lucide-react";

interface DashboardSearchFormProps {
  action: string;
  defaultValue?: string;
  placeholder?: string;
  widthClassName?: string;
  params?: Record<string, string | undefined>;
}

export function DashboardSearchForm({
  action,
  defaultValue,
  placeholder = "Search agents, tx, attestations",
  widthClassName = "w-[280px]",
  params,
}: DashboardSearchFormProps) {
  return (
    <div className="flex items-center gap-2">
      <form action={action} className="relative">
        {Object.entries(params ?? {}).map(([key, value]) =>
          value ? <input key={key} type="hidden" name={key} value={value} /> : null
        )}
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`${widthClassName} border border-hairline bg-card py-1.5 pl-9 pr-14 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring`}
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
          Enter
        </kbd>
      </form>

      {defaultValue ? (
        <Link
          href={action}
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear
        </Link>
      ) : null}
    </div>
  );
}

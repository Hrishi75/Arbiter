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
  widthClassName = "w-[280px] max-w-full",
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
          className={`${widthClassName} h-10 rounded-full border border-hairline-strong bg-background/80 py-1.5 pl-10 pr-14 text-sm shadow-[0_10px_24px_rgba(20,18,16,0.06)] backdrop-blur-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 dark:shadow-[0_12px_28px_rgba(0,0,0,0.22)]`}
        />
        <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:block">
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

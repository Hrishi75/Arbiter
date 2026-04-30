import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  subtitle?: string;
  cta?: {
    href: string;
    label: string;
  };
}

export function Topbar({
  title,
  subtitle,
  cta = { href: "/dashboard/register", label: "+ Register agent" },
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-hairline bg-background px-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-medium tracking-tight">{title}</h1>
        {subtitle && (
          <span className="font-mono text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search agents, tx, attestations"
            className="w-[280px] border border-hairline bg-card py-1.5 pl-9 pr-12 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <Button asChild size="sm" className="text-xs font-medium">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>
    </header>
  );
}

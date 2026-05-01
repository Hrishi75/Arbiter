import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardSearchForm } from "@/components/dashboard/search-form";

interface TopbarProps {
  title: string;
  subtitle?: string;
  cta?: { href: string; label: string };
  search?: {
    action: string;
    value?: string;
    placeholder?: string;
    params?: Record<string, string | undefined>;
  };
}

export function Topbar({ title, subtitle, cta, search }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-hairline bg-background px-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-medium tracking-tight">{title}</h1>
        {subtitle && (
          <span className="font-mono text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {search ? (
          <DashboardSearchForm
            action={search.action}
            defaultValue={search.value}
            placeholder={search.placeholder}
            params={search.params}
          />
        ) : null}

        {cta && (
          <Button asChild size="sm" className="text-xs font-medium">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

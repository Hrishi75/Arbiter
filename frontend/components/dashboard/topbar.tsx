import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardSearchForm } from "@/components/dashboard/search-form";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/78 backdrop-blur-xl">
      <div className="flex min-h-16 flex-col gap-3 px-6 py-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Operator console
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-lg font-medium tracking-tight">{title}</h1>
            {subtitle && (
              <span className="font-mono text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          {search ? (
            <DashboardSearchForm
              action={search.action}
              defaultValue={search.value}
              placeholder={search.placeholder}
              params={search.params}
            />
          ) : null}

          <ThemeToggle />

          {cta && (
            <Button
              asChild
              size="sm"
              className="rounded-full bg-accent px-4 text-xs font-medium text-accent-foreground shadow-[0_12px_24px_rgba(201,100,66,0.22)] hover:bg-accent/90"
            >
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

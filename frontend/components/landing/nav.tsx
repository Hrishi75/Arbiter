import Link from "next/link";
import { ArrowUpRight, GitBranch } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-hairline bg-background/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="#top" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-strong bg-background/80 text-foreground shadow-[0_8px_24px_rgba(20,18,16,0.08)]">
            <BrandLogo size={24} />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-sm tracking-[0.18em] text-foreground">ARBITER</div>
            <div className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              On-chain accountability for agents
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="#protocol" className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
            Protocol
          </Link>
          <Link href="#fees" className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
            Fees
          </Link>
          <a
            href="https://github.com/Hrishi75/Arbiter/tree/main/contracts"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Contracts
          </a>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com/Hrishi75/Arbiter"
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "landing-button-outline hidden font-mono text-[11px] uppercase tracking-[0.16em] md:inline-flex"
            )}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Repo
          </a>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "sm" }),
              "landing-button rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-[11px] uppercase tracking-[0.16em]"
            )}
          >
            Get Started
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

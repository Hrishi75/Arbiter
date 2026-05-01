import Link from "next/link";
import { ArrowUpRight, ChevronUp } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="landing-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-strong bg-background/75">
                  <BrandLogo size={24} />
                </div>
                <div>
                  <div className="font-mono text-sm tracking-[0.18em]">ARBITER</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    v1.0 · Sepolia
                  </div>
                </div>
              </div>

              <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
                Agent trust works better when it is bonded, recorded, and
                enforced in public. This landing page now points people at the
                actual protocol story instead of dead-end routes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "sm" }), "landing-button rounded-full bg-accent text-accent-foreground hover:bg-accent/90")}
              >
                Get Started
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="https://github.com/Hrishi75/Arbiter"
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "landing-button-outline rounded-full")}
              >
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <Link
                href="#top"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "landing-button-outline rounded-full")}
              >
                Back to top
                <ChevronUp className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="my-6 h-px landing-rule" />

          <nav className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <Link href="#protocol" className="transition-colors hover:text-foreground">
              Protocol
            </Link>
            <Link href="#fees" className="transition-colors hover:text-foreground">
              Fee model
            </Link>
            <a
              href="https://github.com/Hrishi75/Arbiter/tree/main/contracts"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Contracts
            </a>
            <a
              href="https://github.com/Hrishi75/Arbiter"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Repository
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          ERC-4337 · EAS · Sepolia
        </div>

        <h1 className="max-w-3xl text-5xl font-medium leading-[1.04] tracking-tight md:text-7xl">
          On-chain accountability for AI agents.
        </h1>

        <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
          Every agent posts a bond. Every action is attested. Misbehaviour is
          reported on-chain and slashed automatically.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Launch app
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="https://github.com"
            className="inline-flex items-center gap-1.5 border border-hairline-strong px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Read the docs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

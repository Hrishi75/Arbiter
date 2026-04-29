import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <Button asChild size="lg">
            <Link href="/dashboard">
              Launch app
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="https://github.com">
              Read the docs
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

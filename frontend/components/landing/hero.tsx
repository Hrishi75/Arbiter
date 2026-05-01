import Link from "next/link";
import { ArrowRight, ArrowUpRight, Scale, ScrollText, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const proofPoints = [
  {
    label: "Bonded identity",
    value: "0.1 ETH minimum",
    body: "Operators stake before the agent can act.",
  },
  {
    label: "Action trail",
    value: "EAS for every op",
    body: "Each execution writes a tamper-resistant record.",
  },
  {
    label: "Enforcement",
    value: "48h dispute window",
    body: "Bad behavior can be reported and slashed on-chain.",
  },
];

const liveSignals = [
  {
    icon: ShieldCheck,
    label: "Registry status",
    value: "Bonded and active",
  },
  {
    icon: ScrollText,
    label: "Latest attestation",
    value: "Policy execution recorded",
  },
  {
    icon: Scale,
    label: "Slash policy",
    value: "Automatic if dispute expires",
  },
];

export function Hero() {
  return (
    <section className="relative border-b border-hairline">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-14 md:grid-cols-[minmax(0,1.15fr)_24rem] md:pb-24 md:pt-24">
        <div className="relative">
          <div className="inline-flex items-center gap-3 rounded-full landing-chip px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_6px_rgba(201,100,66,0.16)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              ERC-4337 · EAS · Uniswap v4 · Sepolia
            </span>
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-medium leading-[0.98] tracking-[-0.045em] md:text-7xl">
            Give AI agents a balance sheet, an audit trail, and real economic consequences.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Arbiter turns agent trust into something verifiable. Each operator
            posts a bond, every execution is attested, and slash conditions stay
            transparent from the first call to the final dispute window.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "landing-button rounded-full bg-accent px-5 text-accent-foreground hover:bg-accent/90"
              )}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#protocol"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "landing-button-outline rounded-full px-5"
              )}
            >
              Explore protocol
            </Link>
            <a
              href="https://github.com/Hrishi75/Arbiter"
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "landing-button-outline rounded-full px-5"
              )}
            >
              View repository
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {proofPoints.map((point) => (
              <div key={point.label} className="landing-card rounded-3xl p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {point.label}
                </div>
                <div className="mt-4 text-lg font-medium tracking-tight">{point.value}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="landing-panel rounded-[2rem] p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Live policy shape
                </div>
                <div className="mt-2 text-2xl font-medium tracking-tight">
                  Agent accountability loop
                </div>
              </div>
              <div className="rounded-full border border-hairline-strong bg-background/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Ready
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-hairline-strong bg-background/70 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Agent score
                  </div>
                  <div className="mt-2 text-4xl font-medium tracking-[-0.04em]">142</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Swap band
                  </div>
                  <div className="mt-2 text-lg font-medium text-ok">Trusted lane</div>
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[71%] rounded-full bg-[linear-gradient(90deg,hsl(var(--ok)),hsl(var(--accent)))]" />
              </div>

              <div className="mt-6 space-y-3">
                {liveSignals.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-2xl border border-hairline bg-background/80 px-4 py-3"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-foreground">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-hairline-strong bg-background/60 px-3 py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Bond
                </div>
                <div className="mt-2 text-sm font-medium">Locked</div>
              </div>
              <div className="rounded-2xl border border-hairline-strong bg-background/60 px-3 py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Attest
                </div>
                <div className="mt-2 text-sm font-medium">Write log</div>
              </div>
              <div className="rounded-2xl border border-hairline-strong bg-background/60 px-3 py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Slash
                </div>
                <div className="mt-2 text-sm font-medium">Enforce</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

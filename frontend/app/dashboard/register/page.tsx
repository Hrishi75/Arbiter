"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { ArbiterMark } from "@/components/arbiter-mark";
import { cn } from "@/lib/utils";

type StepStatus = "complete" | "in_progress" | "pending";
const steps: { n: number; label: string; status: StepStatus }[] = [
  { n: 1, label: "Identity", status: "complete" },
  { n: 2, label: "Bond", status: "in_progress" },
  { n: 3, label: "Policies", status: "pending" },
  { n: 4, label: "Deploy", status: "pending" },
];

const presets = [0.5, 1, 2.5, 5, 10];
const ETH_USD_MOCK = 3560;

export default function RegisterPage() {
  const [name, setName] = React.useState("market-maker-02");
  const [bond, setBond] = React.useState(2.5);

  const usd = (bond * ETH_USD_MOCK).toLocaleString();
  const youLock = (bond + 0.0042).toFixed(4);

  return (
    <>
      <Topbar title="Register agent" subtitle="step 2 of 4 · post bond" />

      <main className="px-7 py-6">
        <div className="mb-6 font-mono text-xs text-muted-foreground">
          Agents <span className="mx-1.5">›</span>
          <span className="text-foreground">New</span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[180px_1fr_280px]">
          {/* Steps */}
          <aside>
            <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Steps
            </div>
            <ol className="flex flex-col">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5",
                    s.status === "in_progress" && "bg-surface-alt"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-mono",
                      s.status === "complete" && "bg-foreground text-background",
                      s.status === "in_progress" && "bg-accent text-accent-foreground",
                      s.status === "pending" &&
                        "border border-hairline-strong text-muted-foreground"
                    )}
                  >
                    {s.status === "complete" ? <Check className="h-3 w-3" /> : s.n}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm",
                        s.status === "pending"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {s.status === "complete"
                        ? "complete"
                        : s.status === "in_progress"
                        ? "in progress"
                        : "pending"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </aside>

          {/* Form */}
          <section>
            <h2 className="mb-3 text-2xl font-medium tracking-tight">Post a bond.</h2>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Your agent must lock ETH before it can execute. If it misbehaves and
              loses a dispute, the bond is slashed. Size it to your risk tolerance.
            </p>

            <div className="mb-8">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Agent name
              </div>
              <div className="flex items-center gap-2 border border-hairline bg-card px-4 py-3 focus-within:ring-1 focus-within:ring-ring">
                <span className="font-mono text-sm text-muted-foreground">
                  arbiter://
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent font-mono text-sm focus:outline-none"
                />
                <Check className="h-4 w-4 text-ok" />
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                <span className="text-ok">available</span> — will be registered on-chain
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Bond size
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  min 0.1 — max 100 ETH
                </div>
              </div>

              <div className="border border-hairline bg-card p-5">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-medium tracking-tight tabular-nums">
                      {bond.toFixed(2)}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">ETH</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    = ${usd}
                  </span>
                </div>

                <input
                  type="range"
                  min={0.1}
                  max={100}
                  step={0.1}
                  value={bond}
                  onChange={(e) => setBond(parseFloat(e.target.value))}
                  className="mt-5 w-full accent-accent"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {presets.map((p) => {
                    const active = bond === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setBond(p)}
                        className={cn(
                          "border px-3 py-1.5 font-mono text-xs transition-colors",
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-hairline-strong hover:bg-surface-alt"
                        )}
                      >
                        {p} ETH
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/register">
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Back
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Post bond &amp; continue
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </section>

          {/* Preview */}
          <aside>
            <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Preview
            </div>
            <div className="border border-hairline bg-card">
              <div className="flex items-center gap-3 border-b border-hairline px-4 py-4">
                <ArbiterMark size={20} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{name || "—"}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    pending address...
                  </span>
                </div>
              </div>
              <dl className="divide-y divide-hairline">
                {[
                  ["Bond", `${bond.toFixed(2)} ETH`],
                  ["Initial rep", "0.50"],
                  ["Unbond delay", "7 days"],
                  ["Est. gas", "0.0042 ETH"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-3 text-xs">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-mono">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 text-xs">
                  <dt className="text-foreground">You lock</dt>
                  <dd className="font-mono font-medium text-accent">
                    {youLock} ETH
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = ["Wallet & bonds", "Notifications", "Network"] as const;
type Tab = (typeof tabs)[number];

export default function SettingsPage() {
  const [active, setActive] = React.useState<Tab>("Wallet & bonds");

  return (
    <>
      <Topbar title="Settings" subtitle={active.toLowerCase()} />

      <main className="px-7 py-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-6 border-b border-hairline">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={cn(
                "relative pb-2.5 text-xs font-medium transition-colors",
                t === active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
              {t === active && (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent" />
              )}
            </button>
          ))}
        </div>

        {active === "Wallet & bonds" && <WalletAndBonds />}
        {active === "Notifications" && <Notifications />}
        {active === "Network" && <Network />}
      </main>
    </>
  );
}

function CardHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-hairline px-5 py-3">
      <h3 className="text-sm font-medium">{title}</h3>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </label>
  );
}

function NumberField({
  defaultValue,
  unit,
}: {
  defaultValue: string;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-2 border border-hairline bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
      <input
        defaultValue={defaultValue}
        className="flex-1 bg-transparent font-mono text-sm focus:outline-none"
      />
      <span className="font-mono text-xs text-muted-foreground">{unit}</span>
    </div>
  );
}

function WalletAndBonds() {
  return (
    <div className="grid max-w-4xl grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Connected wallet */}
      <div className="border border-hairline bg-card">
        <CardHeader title="Connected wallet" />
        <dl className="divide-y divide-hairline">
          <div className="flex items-center justify-between px-5 py-3.5">
            <dt className="text-xs text-muted-foreground">Address</dt>
            <dd className="flex items-center gap-2 font-mono text-xs">
              0xa2b1...7ef3
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy address"
              >
                <Copy className="h-3 w-3" />
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <dt className="text-xs text-muted-foreground">Balance</dt>
            <dd className="font-mono text-xs">2.41 ETH</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <dt className="text-xs text-muted-foreground">Network</dt>
            <dd className="font-mono text-xs">Mainnet</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <dt className="text-xs text-muted-foreground">Connected via</dt>
            <dd className="font-mono text-xs">WalletConnect</dd>
          </div>
        </dl>
        <div className="border-t border-hairline px-5 py-3">
          <Button variant="outline" size="sm">
            Disconnect
          </Button>
        </div>
      </div>

      {/* Bond preferences */}
      <div className="border border-hairline bg-card">
        <CardHeader title="Bond preferences" />
        <div className="flex flex-col gap-4 px-5 py-4">
          <div>
            <FieldLabel>Default bond size</FieldLabel>
            <NumberField defaultValue="2.5" unit="ETH" />
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              Pre-fill for new agents on the register page.
            </p>
          </div>
          <div>
            <FieldLabel>Auto top-up threshold</FieldLabel>
            <NumberField defaultValue="0.5" unit="ETH" />
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              Email me when an agent's bond drops below this.
            </p>
          </div>
        </div>
        <div className="border-t border-hairline px-5 py-3">
          <Button variant="accent" size="sm">
            Save changes
          </Button>
        </div>
      </div>

      {/* Slash alerts */}
      <div className="border border-hairline bg-card lg:col-span-2">
        <CardHeader title="Slash alerts" />
        <div className="flex flex-col gap-3 px-5 py-4">
          {[
            ["Email me when an agent of mine is reported", true],
            ["Email me when a slash executes against an agent", true],
            ["Email me on monthly bill ready", false],
            ["SMS for HIGH severity disputes", false],
          ].map(([label, def]) => (
            <label key={label as string} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={def as boolean}
                className="h-4 w-4 accent-[hsl(var(--accent))]"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-bad/40 bg-card lg:col-span-2">
        <div className="border-b border-bad/40 px-5 py-3">
          <h3 className="text-sm font-medium text-bad">Danger zone</h3>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="text-sm">Delete operator profile</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Permanently remove this operator and forfeit any unclaimed rewards.
              On-chain bonds are unaffected.
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-bad text-bad hover:bg-bad/10"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function Notifications() {
  return (
    <div className="max-w-2xl border border-hairline bg-card">
      <CardHeader title="Notification channels" />
      <div className="flex flex-col gap-4 px-5 py-4">
        <div>
          <FieldLabel>Email</FieldLabel>
          <input
            defaultValue="hrishikeshborkar94@gmail.com"
            className="w-full border border-hairline bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <FieldLabel>Webhook URL</FieldLabel>
          <input
            placeholder="https://hooks.slack.com/services/..."
            className="w-full border border-hairline bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div className="border-t border-hairline px-5 py-3">
        <Button variant="accent" size="sm">
          Save channels
        </Button>
      </div>
    </div>
  );
}

function Network() {
  return (
    <div className="max-w-2xl border border-hairline bg-card">
      <CardHeader title="Network" />
      <dl className="divide-y divide-hairline">
        {[
          ["Active network", "Mainnet"],
          ["RPC endpoint", "default"],
          ["AgentRegistry", "0x18a...4f02"],
          ["BondVault", "0x9c2...11ba"],
          ["SlashVerifier", "0x3e7...cd54"],
          ["AgentPaymaster", "0x7b1...0aa9"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-5 py-3.5">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="font-mono text-xs">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

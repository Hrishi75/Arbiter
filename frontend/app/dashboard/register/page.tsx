"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi";
import { keccak256, parseEther, stringToBytes, type Address, type Hash } from "viem";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { ArbiterMark } from "@/components/arbiter-mark";
import { useContracts } from "@/lib/hooks/useContracts";
import { ABIS } from "@/lib/abi-imports";
import { shortenHex } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type Phase = "idle" | "predicting" | "creating" | "staking" | "done" | "error";
type StepStatus = "complete" | "in_progress" | "pending";
type StepKey = "identity" | "account" | "bond" | "live";

const presets = [0.5, 1, 2.5, 5, 10];

const steps: { n: number; key: StepKey; label: string }[] = [
  { n: 1, key: "identity", label: "Identity" },
  { n: 2, key: "account", label: "Account" },
  { n: 3, key: "bond", label: "Bond" },
  { n: 4, key: "live", label: "Live" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { address: owner, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = useContracts();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [name, setName] = React.useState("");
  const [bond, setBond] = React.useState(2.5);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [predicted, setPredicted] = React.useState<Address | null>(null);
  const [createHash, setCreateHash] = React.useState<Hash | null>(null);
  const [stakeHash, setStakeHash] = React.useState<Hash | null>(null);

  const ready = isConnected && !!contracts && !!publicClient && !!owner;
  const busy = phase === "predicting" || phase === "creating" || phase === "staking";
  const canSubmit = ready && !busy && phase !== "done" && name.trim().length > 0;

  function stepStatus(step: StepKey): StepStatus {
    switch (step) {
      case "identity":
        return name.trim().length > 0 ? "complete" : "pending";
      case "account":
        if (phase === "creating") return "in_progress";
        if (phase === "staking" || phase === "done") return "complete";
        return "pending";
      case "bond":
        if (phase === "staking") return "in_progress";
        if (phase === "done") return "complete";
        return "pending";
      case "live":
        return phase === "done" ? "complete" : "pending";
    }
  }

  async function handleSubmit() {
    if (!canSubmit || !owner || !contracts || !publicClient) return;
    setError(null);
    setPhase("predicting");
    setCreateHash(null);
    setStakeHash(null);

    try {
      const salt = keccak256(stringToBytes(name.trim()));
      const modelHash = keccak256(stringToBytes(`${name.trim()}:${bond}`));
      const metadataURI = "";

      const account = (await publicClient.readContract({
        address: contracts.agentAccountFactory,
        abi: ABIS.agentAccountFactory,
        functionName: "getAddress",
        args: [owner, salt],
      })) as Address;
      setPredicted(account);

      const code = await publicClient.getCode({ address: account });
      if (!code || code === "0x") {
        setPhase("creating");
        const hash = await writeContractAsync({
          address: contracts.agentAccountFactory,
          abi: ABIS.agentAccountFactory,
          functionName: "createAccount",
          args: [owner, salt, modelHash, metadataURI],
        });
        setCreateHash(hash);
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setPhase("staking");
      const sHash = await writeContractAsync({
        address: contracts.bondVault,
        abi: ABIS.bondVault,
        functionName: "stake",
        args: [account],
        value: parseEther(bond.toString()),
      });
      setStakeHash(sHash);
      await publicClient.waitForTransactionReceipt({ hash: sHash });

      setPhase("done");
      setTimeout(() => router.push(`/dashboard/agent/${account}`), 1200);
    } catch (e) {
      console.error(e);
      const msg =
        (e as { shortMessage?: string; message?: string })?.shortMessage ??
        (e as { message?: string })?.message ??
        "Transaction failed";
      setError(msg);
      setPhase("error");
    }
  }

  const submitLabel =
    phase === "predicting"
      ? "Predicting…"
      : phase === "creating"
        ? "Deploying account…"
        : phase === "staking"
          ? "Posting bond…"
          : phase === "done"
            ? "Live ✓"
            : phase === "error"
              ? "Retry"
              : "Post bond & continue";

  return (
    <>
      <Topbar title="Register agent" subtitle="post bond" />
      <main className="px-7 py-6">
        <div className="mb-6 font-mono text-xs text-muted-foreground">
          Agents <span className="mx-1.5">›</span>
          <span className="text-foreground">New</span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[180px_1fr_280px]">
          <aside>
            <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Steps
            </div>
            <ol className="flex flex-col">
              {steps.map((step) => {
                const status = stepStatus(step.key);
                return (
                  <li
                    key={step.n}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5",
                      status === "in_progress" && "bg-surface-alt"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-mono",
                        status === "complete" && "bg-foreground text-background",
                        status === "in_progress" && "bg-accent text-accent-foreground",
                        status === "pending" &&
                          "border border-hairline-strong text-muted-foreground"
                      )}
                    >
                      {status === "complete" ? <Check className="h-3 w-3" /> : step.n}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          "text-sm",
                          status === "pending" ? "text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {status === "complete"
                          ? "complete"
                          : status === "in_progress"
                            ? "in progress"
                            : "pending"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section>
            <h2 className="mb-3 text-2xl font-medium tracking-tight">Post a bond.</h2>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Your agent must lock ETH before it can execute. If it misbehaves and loses a
              dispute, the bond is slashed. Size it to your risk tolerance.
            </p>

            <div className="mb-8">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Agent name
              </div>
              <div className="flex items-center gap-2 border border-hairline bg-card px-4 py-3 focus-within:ring-1 focus-within:ring-ring">
                <span className="font-mono text-sm text-muted-foreground">arbiter://</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy || phase === "done"}
                  placeholder="my-agent"
                  className="flex-1 bg-transparent font-mono text-sm focus:outline-none disabled:opacity-60"
                />
                {name.trim().length > 0 && <Check className="h-4 w-4 text-ok" />}
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                Used to derive the CREATE2 salt — deterministic across redeploys.
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Bond size
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  min 0.1 - max 100 ETH
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
                </div>

                <input
                  type="range"
                  min={0.1}
                  max={100}
                  step={0.1}
                  value={bond}
                  onChange={(e) => setBond(parseFloat(e.target.value))}
                  disabled={busy || phase === "done"}
                  className="mt-5 w-full accent-accent"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {presets.map((preset) => {
                    const active = bond === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBond(preset)}
                        disabled={busy || phase === "done"}
                        className={cn(
                          "border px-3 py-1.5 font-mono text-xs transition-colors disabled:opacity-60",
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-hairline-strong hover:bg-surface-alt"
                        )}
                      >
                        {preset} ETH
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 border border-bad/40 bg-bad/5 px-4 py-3 font-mono text-xs text-bad">
                {error}
              </div>
            )}
            {!ready && (
              <div className="mt-5 border border-hairline bg-card px-4 py-3 font-mono text-xs text-muted-foreground">
                {!isConnected
                  ? "Connect a wallet to post a bond."
                  : !contracts
                    ? `No contracts deployed on chain ${chainId}. Switch to Anvil (31337) or Sepolia.`
                    : "Initializing…"}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/agents">
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Back
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {submitLabel}
                {phase !== "done" && <ChevronRight className="ml-1 h-3.5 w-3.5" />}
              </Button>
            </div>
          </section>

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
                    {predicted ? shortenHex(predicted) : "pending address…"}
                  </span>
                </div>
              </div>
              <dl className="divide-y divide-hairline">
                <Row k="Bond" v={`${bond.toFixed(2)} ETH`} />
                <Row k="Owner" v={owner ? shortenHex(owner) : "—"} />
                <Row k="Network" v={contracts ? `chain ${chainId}` : "—"} />
                <Row
                  k="Status"
                  v={
                    phase === "done"
                      ? "live ✓"
                      : phase === "error"
                        ? "error"
                        : busy
                          ? phase
                          : "ready"
                  }
                />
                {createHash && <Row k="create tx" v={shortenHex(createHash)} />}
                {stakeHash && <Row k="stake tx" v={shortenHex(stakeHash)} />}
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 px-4 py-3 text-xs">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="truncate font-mono">{v}</dd>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useChainId } from "wagmi";
import { type Address } from "viem";
import { useContracts } from "./useContracts";
import { ABIS } from "@/lib/abi-imports";

export type DisputeStatus = "open" | "disputed" | "executed";

export interface Dispute {
  reportId: number;
  agent: Address;
  reporter: Address;
  amountWei: bigint;
  reason: string;
  evidenceURI: string;
  createdAt: number;
  disputed: boolean;
  executed: boolean;
  status: DisputeStatus;
  deadline: number;
}

type ReportTuple = {
  agent: Address;
  reporter: Address;
  amount: bigint;
  reason: string;
  evidenceURI: string;
  createdAt: bigint;
  disputed: boolean;
  executed: boolean;
};

const DISPUTE_WINDOW_SECONDS = 48 * 60 * 60;

export function useDisputes() {
  const client = usePublicClient();
  const chainId = useChainId();
  const contracts = useContracts();

  return useQuery<Dispute[]>({
    queryKey: ["disputes", chainId],
    enabled: !!client && !!contracts,
    refetchInterval: 12_000,
    queryFn: async () => {
      if (!client || !contracts) return [];

      const count = (await client.readContract({
        address: contracts.slashVerifier,
        abi: ABIS.slashVerifier,
        functionName: "reportsCount",
      })) as bigint;

      if (count === 0n) return [];

      const calls = Array.from({ length: Number(count) }, (_, i) => ({
        address: contracts.slashVerifier,
        abi: ABIS.slashVerifier,
        functionName: "getReport",
        args: [BigInt(i)],
      }));

      const results = await client.multicall({ contracts: calls, allowFailure: true });

      return results.flatMap<Dispute>((r, i) => {
        if (r.status !== "success") return [];
        const x = r.result as unknown as ReportTuple;
        const createdAt = Number(x.createdAt);
        const status: DisputeStatus = x.executed
          ? "executed"
          : x.disputed
            ? "disputed"
            : "open";
        return [
          {
            reportId: i,
            agent: x.agent,
            reporter: x.reporter,
            amountWei: x.amount,
            reason: x.reason,
            evidenceURI: x.evidenceURI,
            createdAt,
            disputed: x.disputed,
            executed: x.executed,
            status,
            deadline: createdAt + DISPUTE_WINDOW_SECONDS,
          },
        ];
      });
    },
  });
}

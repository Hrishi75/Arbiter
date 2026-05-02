"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useChainId } from "wagmi";
import { parseAbiItem, type Address } from "viem";
import { useContracts } from "./useContracts";
import { ABIS } from "@/lib/abi-imports";

const AgentRegisteredEvent = parseAbiItem(
  "event AgentRegistered(address indexed account, address indexed owner, bytes32 modelHash, string metadataURI)"
);

export interface Agent {
  account: Address;
  owner: Address;
  modelHash: `0x${string}`;
  metadataURI: string;
  registeredAt: number;
  active: boolean;
  bondWei: bigint;
}

type AgentTuple = {
  owner: Address;
  modelHash: `0x${string}`;
  metadataURI: string;
  registeredAt: bigint;
  active: boolean;
};

export function useAgents() {
  const client = usePublicClient();
  const chainId = useChainId();
  const contracts = useContracts();

  return useQuery<Agent[]>({
    queryKey: ["agents", chainId],
    enabled: !!client && !!contracts,
    refetchInterval: 12_000,
    queryFn: async () => {
      if (!client || !contracts) return [];

      const logs = await client.getLogs({
        address: contracts.agentRegistry,
        event: AgentRegisteredEvent,
        fromBlock: 0n,
        toBlock: "latest",
      });
      if (logs.length === 0) return [];

      const calls = logs.flatMap((log) => [
        {
          address: contracts.agentRegistry,
          abi: ABIS.agentRegistry,
          functionName: "getAgent",
          args: [log.args.account!],
        },
        {
          address: contracts.bondVault,
          abi: ABIS.bondVault,
          functionName: "getBond",
          args: [log.args.account!],
        },
      ]);

      const results = await client.multicall({ contracts: calls, allowFailure: true });

      const agents: Agent[] = [];
      logs.forEach((log, idx) => {
        const a = results[idx * 2];
        const b = results[idx * 2 + 1];
        if (a.status !== "success" || b.status !== "success") return;
        const t = a.result as unknown as AgentTuple;
        agents.push({
          account: log.args.account!,
          owner: t.owner,
          modelHash: t.modelHash,
          metadataURI: t.metadataURI,
          registeredAt: Number(t.registeredAt),
          active: t.active,
          bondWei: b.result as bigint,
        });
      });
      return agents;
    },
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useChainId } from "wagmi";
import { parseAbiItem, type Address } from "viem";
import { useContracts } from "./useContracts";

export type FeedEventKind =
  | "agent_registered"
  | "staked"
  | "report_created"
  | "slash_executed";

export interface FeedEvent {
  kind: FeedEventKind;
  blockNumber: bigint;
  txHash: `0x${string}`;
  agent: Address;
  amountWei?: bigint;
  reportId?: number;
}

const EV_AGENT_REGISTERED = parseAbiItem(
  "event AgentRegistered(address indexed account, address indexed owner, bytes32 modelHash, string metadataURI)"
);
const EV_STAKED = parseAbiItem(
  "event Staked(address indexed agent, address indexed from, uint256 amount)"
);
const EV_REPORT = parseAbiItem(
  "event ReportCreated(uint256 indexed reportId, address indexed agent, address indexed reporter, uint256 amount, string reason, string evidenceURI)"
);
const EV_SLASH = parseAbiItem(
  "event SlashExecuted(uint256 indexed reportId, address indexed agent, uint256 amount)"
);

export function useFeedEvents() {
  const client = usePublicClient();
  const chainId = useChainId();
  const contracts = useContracts();

  return useQuery<FeedEvent[]>({
    queryKey: ["feed", chainId],
    enabled: !!client && !!contracts,
    refetchInterval: 12_000,
    queryFn: async () => {
      if (!client || !contracts) return [];

      const [registered, staked, reports, slashes] = await Promise.all([
        client.getLogs({ address: contracts.agentRegistry, event: EV_AGENT_REGISTERED, fromBlock: 0n }),
        client.getLogs({ address: contracts.bondVault, event: EV_STAKED, fromBlock: 0n }),
        client.getLogs({ address: contracts.slashVerifier, event: EV_REPORT, fromBlock: 0n }),
        client.getLogs({ address: contracts.slashVerifier, event: EV_SLASH, fromBlock: 0n }),
      ]);

      const events: FeedEvent[] = [
        ...registered.map((l) => ({
          kind: "agent_registered" as const,
          blockNumber: l.blockNumber!,
          txHash: l.transactionHash!,
          agent: l.args.account!,
        })),
        ...staked.map((l) => ({
          kind: "staked" as const,
          blockNumber: l.blockNumber!,
          txHash: l.transactionHash!,
          agent: l.args.agent!,
          amountWei: l.args.amount!,
        })),
        ...reports.map((l) => ({
          kind: "report_created" as const,
          blockNumber: l.blockNumber!,
          txHash: l.transactionHash!,
          agent: l.args.agent!,
          reportId: Number(l.args.reportId!),
          amountWei: l.args.amount!,
        })),
        ...slashes.map((l) => ({
          kind: "slash_executed" as const,
          blockNumber: l.blockNumber!,
          txHash: l.transactionHash!,
          agent: l.args.agent!,
          reportId: Number(l.args.reportId!),
          amountWei: l.args.amount!,
        })),
      ];

      return events.sort((a, b) =>
        b.blockNumber > a.blockNumber ? 1 : b.blockNumber < a.blockNumber ? -1 : 0
      );
    },
  });
}

import type { Abi } from "viem";
import agentRegistryAbi from "@/lib/abis/AgentRegistry.json";
import agentAccountFactoryAbi from "@/lib/abis/AgentAccountFactory.json";
import bondVaultAbi from "@/lib/abis/BondVault.json";
import slashVerifierAbi from "@/lib/abis/SlashVerifier.json";
import agentPaymasterAbi from "@/lib/abis/AgentPaymaster.json";
import reputationHookAbi from "@/lib/abis/ReputationHook.json";

export const ABIS = {
  agentRegistry: agentRegistryAbi as Abi,
  agentAccountFactory: agentAccountFactoryAbi as Abi,
  bondVault: bondVaultAbi as Abi,
  slashVerifier: slashVerifierAbi as Abi,
  agentPaymaster: agentPaymasterAbi as Abi,
  reputationHook: reputationHookAbi as Abi,
} as const;

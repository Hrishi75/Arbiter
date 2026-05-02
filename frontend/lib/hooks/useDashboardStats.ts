"use client";

import { useAgents } from "./useAgents";
import { useDisputes } from "./useDisputes";

export interface DashboardStats {
  activeAgents: number;
  totalAgents: number;
  totalBondedWei: bigint;
  openDisputes: number;
  totalExecutions24h: number | null;
}

export function useDashboardStats(): DashboardStats {
  const { data: agents = [] } = useAgents();
  const { data: disputes = [] } = useDisputes();

  return {
    activeAgents: agents.filter((a) => a.active).length,
    totalAgents: agents.length,
    totalBondedWei: agents.reduce((sum, a) => sum + a.bondWei, 0n),
    openDisputes: disputes.filter((d) => d.status === "open").length,
    totalExecutions24h: null,
  };
}

"use client";

import { useChainId } from "wagmi";
import { getContracts } from "@/lib/contracts";

export function useContracts() {
  const chainId = useChainId();
  return getContracts(chainId);
}

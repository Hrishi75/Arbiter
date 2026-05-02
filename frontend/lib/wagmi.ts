import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { defineChain, http } from "viem";

export const anvil = defineChain({
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
});

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "";

export const wagmiConfig = getDefaultConfig({
  appName: "Arbiter",
  projectId,
  chains: [anvil, sepolia],
  transports: {
    [anvil.id]: http("http://localhost:8545"),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC),
  },
  ssr: true,
});

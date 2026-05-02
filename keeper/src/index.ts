import "dotenv/config";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseAbi,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

function required(key: string): string {
  const v = process.env[key];
  if (!v) {
    console.error(`[keeper] missing env var: ${key}`);
    process.exit(1);
  }
  return v;
}

const RPC_URL = required("RPC_URL");
const KEEPER_PRIVATE_KEY = required("KEEPER_PRIVATE_KEY") as `0x${string}`;
const AGENT_REGISTRY = required("AGENT_REGISTRY") as Address;
const SLASH_VERIFIER = required("SLASH_VERIFIER") as Address;
const AGENT_PAYMASTER = required("AGENT_PAYMASTER") as Address;
const POLL_INTERVAL_MS = Number.parseInt(process.env.POLL_INTERVAL_MS ?? "60000", 10);
const CHAIN_ID = Number.parseInt(process.env.CHAIN_ID ?? "31337", 10);
const CHAIN_NAME = process.env.CHAIN_NAME ?? "Anvil";

const chain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const slashAbi = parseAbi([
  "function reportsCount() view returns (uint256)",
  "function SLASH_DELAY() view returns (uint256)",
  "function getReport(uint256) view returns ((address agent, address reporter, uint256 amount, string reason, string evidenceURI, uint64 createdAt, bool disputed, bool executed))",
  "function executeSlash(uint256 reportId)",
]);

const paymasterAbi = parseAbi([
  "function unbilledGasCost(address) view returns (uint256)",
  "function billOf(address) view returns (uint256)",
  "function lastBillAt(address) view returns (uint256)",
  "function generateBill(address agent)",
  "function autoSettleFromBond(address agent)",
]);

const registeredEvent = parseAbi([
  "event AgentRegistered(address indexed account, address indexed owner, bytes32 modelHash, string metadataURI)",
])[0];

const account = privateKeyToAccount(KEEPER_PRIVATE_KEY);
const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
const walletClient = createWalletClient({ account, chain, transport: http(RPC_URL) });

const BILL_CYCLE_SECONDS = 30n * 24n * 60n * 60n;
const GRACE_SECONDS = 7n * 24n * 60n * 60n;

console.log(
  `[keeper] starting · account=${account.address} · rpc=${RPC_URL} · poll=${POLL_INTERVAL_MS}ms`
);

async function tickSlashes(): Promise<void> {
  const count = await publicClient.readContract({
    address: SLASH_VERIFIER,
    abi: slashAbi,
    functionName: "reportsCount",
  });
  if (count === 0n) return;

  const slashDelay = await publicClient.readContract({
    address: SLASH_VERIFIER,
    abi: slashAbi,
    functionName: "SLASH_DELAY",
  });
  const block = await publicClient.getBlock();

  for (let i = 0n; i < count; i++) {
    try {
      const r = await publicClient.readContract({
        address: SLASH_VERIFIER,
        abi: slashAbi,
        functionName: "getReport",
        args: [i],
      });
      if (r.executed || r.disputed) continue;
      if (block.timestamp < BigInt(r.createdAt) + slashDelay) continue;

      console.log(`[keeper] executeSlash(${i}) · agent=${r.agent}`);
      const hash = await walletClient.writeContract({
        address: SLASH_VERIFIER,
        abi: slashAbi,
        functionName: "executeSlash",
        args: [i],
      });
      console.log(`[keeper]   tx=${hash}`);
    } catch (e) {
      console.error(`[keeper] executeSlash(${i}) failed:`, (e as Error).message);
    }
  }
}

async function listAgents(): Promise<Address[]> {
  const logs = await publicClient.getLogs({
    address: AGENT_REGISTRY,
    event: registeredEvent,
    fromBlock: 0n,
  });
  const seen = new Set<Address>();
  for (const l of logs) if (l.args.account) seen.add(l.args.account);
  return Array.from(seen);
}

async function tickBilling(): Promise<void> {
  const agents = await listAgents();
  if (agents.length === 0) return;
  const block = await publicClient.getBlock();

  for (const agent of agents) {
    try {
      const [unbilled, lastBill, bill] = await Promise.all([
        publicClient.readContract({
          address: AGENT_PAYMASTER,
          abi: paymasterAbi,
          functionName: "unbilledGasCost",
          args: [agent],
        }),
        publicClient.readContract({
          address: AGENT_PAYMASTER,
          abi: paymasterAbi,
          functionName: "lastBillAt",
          args: [agent],
        }),
        publicClient.readContract({
          address: AGENT_PAYMASTER,
          abi: paymasterAbi,
          functionName: "billOf",
          args: [agent],
        }),
      ]);

      if (unbilled > 0n && block.timestamp >= lastBill + BILL_CYCLE_SECONDS) {
        console.log(`[keeper] generateBill(${agent})`);
        const hash = await walletClient.writeContract({
          address: AGENT_PAYMASTER,
          abi: paymasterAbi,
          functionName: "generateBill",
          args: [agent],
        });
        console.log(`[keeper]   tx=${hash}`);
      }

      if (bill > 0n && block.timestamp >= lastBill + GRACE_SECONDS) {
        console.log(`[keeper] autoSettleFromBond(${agent})`);
        const hash = await walletClient.writeContract({
          address: AGENT_PAYMASTER,
          abi: paymasterAbi,
          functionName: "autoSettleFromBond",
          args: [agent],
        });
        console.log(`[keeper]   tx=${hash}`);
      }
    } catch (e) {
      console.error(`[keeper] billing(${agent}) failed:`, (e as Error).message);
    }
  }
}

async function tick(): Promise<void> {
  try {
    await tickSlashes();
    await tickBilling();
  } catch (e) {
    console.error("[keeper] tick error:", (e as Error).message);
  }
}

await tick();
setInterval(() => {
  void tick();
}, POLL_INTERVAL_MS);

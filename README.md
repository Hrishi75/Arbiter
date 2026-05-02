# Arbiter

> On-chain accountability for AI agents. Every agent posts a bond. Every action is attested. Misbehaviour is slashed automatically.

Arbiter is a permissionless protocol that lets autonomous agents prove they're trustworthy by putting capital at risk. An agent can't act on-chain until it has registered an ERC-4337 smart account, posted an ETH bond, and accepted that any of its actions can be challenged. If a challenge succeeds, the bond is slashed. The whole loop — registration, bonding, attestation, dispute, slash, billing — runs without a privileged operator.

This repo contains the contracts, an operator dashboard, and a minimal off-chain keeper that closes the slash/bill loop.

---

## Why this exists

Today, when an AI agent runs on-chain, there's no way to hold it accountable beyond "the user trusted it." If it front-runs you, drains a treasury, or executes outside its mandate, your only recourse is governance, social pressure, or the courts. Arbiter offers a third option: bond-backed agents whose misbehaviour is slashable on-chain by anyone.

The design decisions:

- **Bonded by default.** No agent can execute without locked collateral.
- **Permissionless reporting.** Any address can file a slash report. A 48-hour dispute window protects against bad-faith reports.
- **Attested actions.** Each on-chain action can carry an [EAS](https://attest.org) attestation, building a portable reputation.
- **Permissionless keeping.** No single operator finalizes slashes or generates bills — anyone can run the keeper. The protocol still works if every keeper goes offline (just slower).
- **ERC-4337 native.** Agents are smart accounts. They can be sponsored, paused, or upgraded without changing identity.

---

## How it works

```
                ┌────────────────────────────┐
                │  AgentRegistry             │  who is an agent (record + active flag)
                │  AgentAccountFactory       │  CREATE2 deployer for ERC-4337 accounts
                │  AgentAccount              │  the agent's smart account
                │  BondVault                 │  collateral, slashing, debits
                │  SlashVerifier             │  reports + 48h dispute window
                │  AgentPaymaster            │  gas accrual, monthly billing, grace settlement
                │  ReputationHook            │  EAS-backed reputation (attestation schema)
                └─────────────┬──────────────┘
                              │ events + view reads + state-changing txs
              ┌───────────────┴───────────────┐
              │                               │
   ┌──────────▼──────────┐         ┌──────────▼─────────┐
   │ frontend (Next.js)  │         │ keeper (Node)      │
   │ Operator dashboard  │         │ Polls every 60s    │
   │ • register an agent │         │ • executeSlash     │
   │ • view bonds, feed  │         │ • generateBill     │
   │ • file disputes     │         │ • autoSettleFromBond│
   │ wagmi + viem + RK   │         │ viem + dotenv      │
   └─────────────────────┘         └────────────────────┘
```

### The 8 contracts

| Contract | Purpose |
|---|---|
| **AgentRegistry** | On-chain identity. Maps agent account → owner, model hash, metadata URI, registration timestamp, active flag. Only the factory may register; agents may deactivate themselves. |
| **AgentAccountFactory** | CREATE2 deployer that produces an `AgentAccount` *and* registers it in one call. Idempotent — re-deploying the same `(owner, salt)` returns the existing account. |
| **AgentAccount** | The agent's ERC-4337 smart account. Owns its bond, signs UserOperations, and is the subject of attestations. |
| **BondVault** | Holds ETH collateral per agent. Supports `stake`, `requestUnstake` (with delay), `withdrawBond`, `slash` (verifier-only), and `debitBond` (paymaster-only). |
| **SlashVerifier** | Anyone calls `report(agent, amount, reason, evidenceURI)` to start a 48h window. The agent's owner can `dispute(reportId)`. After 48h with no dispute, anyone calls `executeSlash(reportId)` to drain bond → treasury. |
| **AgentPaymaster** | Subsidises agent gas. Tracks `unbilledGasCost` continuously, generates a bill every 30 days, and (after a 7-day grace period) auto-settles unpaid bills directly from the agent's bond. |
| **ReputationHook** | Pinned EAS schema UID for action attestations. Every keeper-witnessed action can be attested against this schema, building a portable reputation graph. |
| **ArbiterSwapHook** | Uniswap v4 `beforeSwap` hook that gates swaps on agent reputation. *Out of scope for the v1 demo* — Sepolia doesn't yet have a Uniswap v4 PoolManager, so it isn't deployed in the local flow. |

### The keeper

Three on-chain functions are permissionless and need to be triggered on a schedule. The keeper is a thin Node service that polls every 60s and fires whichever job is ripe:

1. **`SlashVerifier.executeSlash(reportId)`** — when `block.timestamp ≥ createdAt + 48h && !disputed && !executed`.
2. **`AgentPaymaster.generateBill(agent)`** — when `unbilledGasCost(agent) > 0 && now ≥ lastBillAt(agent) + 30d`.
3. **`AgentPaymaster.autoSettleFromBond(agent)`** — when `billOf(agent) > 0 && now ≥ lastBillAt(agent) + 7d`.

It's idempotent: a failing tx is logged and the loop continues. Replace it with Gelato / Chainlink Automation in production — the on-chain interface is unchanged.

---

## Quickstart (local Anvil)

You'll need five terminals open. Order matters: each step depends on the previous one being live.

### Prerequisites

- [Foundry](https://book.getfoundry.sh) (`forge`, `cast`, `anvil`)
- Node 20+
- A WalletConnect project ID — free, from [cloud.reown.com](https://cloud.reown.com). RainbowKit needs it.
- MetaMask (or any browser wallet)

### 1. Start Anvil — terminal 1

```bash
anvil
```

Listens on `http://localhost:8545`, chain id `31337`, with 10 funded accounts (each holding 10000 ETH).

### 2. Deploy contracts — terminal 2

```bash
cd contracts
cp .env.example .env             # if you don't already have one

# 2a. EntryPoint (one-off; not in the foundry scripts)
forge create lib/account-abstraction/contracts/core/EntryPoint.sol:EntryPoint \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
# → paste the deployed address into contracts/.env as ENTRYPOINT_ADDRESS

# 2b. Core protocol
forge script script/00_DeployEAS.s.sol      --rpc-url http://localhost:8545 --broadcast
forge script script/01_DeployCore.s.sol     --rpc-url http://localhost:8545 --broadcast
forge script script/03_RegisterSchema.s.sol --rpc-url http://localhost:8545 --broadcast
```

After each script, copy the printed addresses into `contracts/.env` (`AGENT_REGISTRY`, `BOND_VAULT`, `SLASH_VERIFIER`, `AGENT_ACCOUNT_FACTORY`, `AGENT_PAYMASTER`, `REPUTATION_HOOK`, `EAS_ADDRESS`, `EAS_SCHEMA_REGISTRY`).

> Skip `script/02_DeployHook.s.sol` — it requires `POOL_MANAGER_ADDRESS` for Uniswap v4 and isn't part of the v1 demo.

### 3. Export ABIs and addresses to the frontend

```bash
bash scripts/export-abis.sh
```

This regenerates:
- `frontend/lib/abis/*.json` — six ABIs (`AgentRegistry`, `AgentAccountFactory`, `BondVault`, `SlashVerifier`, `AgentPaymaster`, `ReputationHook`)
- `frontend/lib/contracts.ts` — addresses keyed by chain id, plus a `getContracts(chainId)` helper

Re-run this script every time you redeploy.

### 4. Run the frontend — terminal 3

```bash
cd frontend
cp .env.local.example .env.local      # then paste your WalletConnect project id into NEXT_PUBLIC_WC_PROJECT_ID
npm install
npm run dev
```

Open http://localhost:3000/dashboard.

### 5. Connect a wallet

In MetaMask:
1. **Add a custom network** — name `Anvil`, RPC `http://localhost:8545`, chain id `31337`, currency symbol `ETH`.
2. **Import an account** — use the deterministic Anvil deployer key `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (10000 ETH on a fresh node).
3. In the dashboard, click the chip in the bottom-left of the sidebar → **Connect** → MetaMask.

The chip flips to your truncated address + `Anvil`. Sidebar badges are hidden because no agent exists yet.

### 6. Register an agent

Click **+ Register agent** → name it (e.g. `alpha-01`) → pick a bond size (e.g. `2.5 ETH`) → **Post bond & continue**. MetaMask prompts twice:

1. `AgentAccountFactory.createAccount(owner, salt, modelHash, metadataURI)` — deploys the CREATE2 agent account and registers it.
2. `BondVault.stake(account)` with `value = 2.5 ETH`.

The button cycles `Deploying account… → Posting bond… → Live ✓` and you're redirected to the new agent's detail page. Sidebar **Agents** badge shows `1`. Dashboard `Total bonded` is now `2.50 ETH`.

### 7. File a slash report — terminal 4

```bash
export AGENT=0x<your agent account address>      # from /dashboard/agents
export SLASH_VERIFIER=$(grep '^SLASH_VERIFIER=' contracts/.env | cut -d= -f2)

cast send $SLASH_VERIFIER 'report(address,uint256,string,string)' \
  $AGENT 1000000000000000000 "test reason" "ipfs://evidence" \
  --rpc-url http://localhost:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

`/dashboard/disputes` now shows 1 open dispute. Sidebar **Disputes** badge shows `1`.

### 8. Advance Anvil past the 48h dispute window

```bash
cast rpc anvil_increaseTime 172801 --rpc-url http://localhost:8545
cast rpc anvil_mine             --rpc-url http://localhost:8545
```

### 9. Run the keeper — terminal 5

```bash
cd keeper
cp .env.example .env       # already pre-filled with Anvil defaults; double-check addresses match contracts/.env
npm install
npm start
```

Within ~60s the keeper logs:

```
[keeper] starting · account=0x7099... · rpc=http://localhost:8545 · poll=60000ms
[keeper] executeSlash(0) · agent=0x...
[keeper]   tx=0x...
```

Refresh `/dashboard/disputes` — the report flips from `open` to `executed`, the agent's bond is debited, and the sidebar Disputes badge clears. Demo complete.

---

## Sepolia deploy (when you're ready)

1. In `contracts/.env`: set `SEPOLIA_RPC` to a real Infura/Alchemy URL, `PRIVATE_KEY` to a key with Sepolia ETH, and `ETHERSCAN_API_KEY`. Pre-fill `EAS_ADDRESS=0xC2679fBD37d54388Ce493F1DB75320D236e1815e` so script 00 records-only.
2. Re-run the three `forge script` commands with `--rpc-url sepolia --verify`.
3. `bash scripts/export-abis.sh` — picks up the new addresses for chain `11155111`.
4. In `frontend/.env.local`: set `NEXT_PUBLIC_SEPOLIA_RPC`. Redeploy the frontend.
5. In `keeper/.env`: set `RPC_URL`, `CHAIN_ID=11155111`, the new addresses, and a `KEEPER_PRIVATE_KEY` funded with Sepolia ETH.

---

## Project layout

```
contracts/                Foundry project
  src/                    AgentRegistry, BondVault, SlashVerifier, AgentPaymaster, …
  script/                 00_DeployEAS, 01_DeployCore, 02_DeployHook, 03_RegisterSchema
  test/                   Forge tests (LifecycleTest, BillingTest, SlashTest, HookTest)
  lib/                    submodules: account-abstraction, openzeppelin, eas, v4-core, v4-periphery
  .env.example            RPC + addresses + protocol config

frontend/                 Next.js 14 App Router
  app/dashboard/          Pages: home, agents, disputes, feed, register, settings, keeper, agent/[addr]
  components/             Shared UI (sidebar-nav, topbar, agents-table, dispute-alert, …)
  components/providers/   Web3Provider (wagmi + RainbowKit + React Query)
  lib/
    abis/                 Generated by scripts/export-abis.sh
    contracts.ts          Generated address book keyed by chainId
    abi-imports.ts        Typed ABI hub
    wagmi.ts              Chains + connectors
    hooks/                useAgents, useDisputes, useFeedEvents, useDashboardStats, useContracts
    dashboard-data.ts     Filter helpers + display utilities (formatEth, shortenHex, …)
  .env.local.example      NEXT_PUBLIC_WC_PROJECT_ID, NEXT_PUBLIC_SEPOLIA_RPC

keeper/                   Minimal Node service
  src/index.ts            Polls every 60s; fires the three permissionless jobs
  README.md               Job spec, ABI fragments, integration patterns
  .env.example

scripts/
  export-abis.sh          forge build → frontend/lib/abis + frontend/lib/contracts.ts

exports/svg/              Brand assets
```

---

## Tech stack

- **Solidity** 0.8.28, EVM Cancun
- **Foundry** for build/test/deploy
- **OpenZeppelin** access control utilities
- **EAS** (Ethereum Attestation Service) for reputation
- **ERC-4337** EntryPoint v0.6.0 for agent accounts
- **Next.js** 14 (App Router), React 18, TailwindCSS, shadcn/ui
- **wagmi** 2.x + **viem** 2.x for Ethereum reads/writes
- **RainbowKit** 2.x for wallet UX
- **TanStack Query** for hook caching/refetch
- **Node 20+** for the keeper, run via `tsx` (no build step)

---

## Out of scope (v2)

- Uniswap v4 hook deployment (`02_DeployHook.s.sol`) — needs a PoolManager that isn't on Sepolia yet.
- Indexer for 24h execution deltas, sparkline trends, fee bands. The dashboard shows `—` for these today.
- IPFS upload pipeline for agent metadata (currently the frontend submits `metadataURI=""`).
- USD pricing on the register page.
- Gelato / Chainlink Automation integration for the keeper.
- Notification email/webhook delivery in Settings.

---

## Troubleshooting

- **Frontend connects but every read returns empty.** Anvil was restarted since the last deploy — the addresses in `contracts/.env` no longer have bytecode. Redeploy via Step 2 and re-run `scripts/export-abis.sh`.
- **MetaMask shows "wrong network".** Switch to Anvil (chain id `31337`) — the wagmi config doesn't auto-prompt.
- **Register button stuck on "Deploying account…".** Check the browser console — almost always a contract revert from a stale address. Redeploy and re-export.
- **Keeper logs `missing env var: …`.** Edit `keeper/.env`.
- **Keeper logs `InsufficientBond` on `autoSettleFromBond`.** Expected — the contract reverts when the bond can't cover the bill. The fallback (per [`keeper/README.md`](keeper/README.md)) is to file a slash report against the agent for failure-to-pay.
- **`forge create` says `compilation skipped`** but no address is printed. Check that the EntryPoint compiles; sometimes a fresh clone needs `forge install` to pull the `account-abstraction` submodule first.

---

## License

MIT — see [LICENSE](LICENSE).

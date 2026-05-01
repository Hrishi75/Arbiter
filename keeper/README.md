# Arbiter keeper jobs

Arbiter has **three** permissionless functions that need to be triggered on a
schedule. Each one is callable by anyone, has no special auth, and is designed
to be driven by an automation network (Gelato, Chainlink Automation, KeeperHub)
or a plain cron job calling `cast send`.

This doc lists the three jobs, their trigger conditions, ABI fragments, and
selectors so you can register them with whatever automation provider you use.

---

## 1. Execute slash

Finalize an uncontested slash report after the 48 h dispute window.

**Target.** `SlashVerifier.executeSlash(uint256 reportId)`

**Watch event.** `ReportCreated(uint256 indexed reportId, ...)` on `SlashVerifier`.

**Trigger condition** — for every `ReportCreated(reportId)`:

```text
let report = SlashVerifier.getReport(reportId)
fire when:
  block.timestamp >= report.createdAt + 48 hours
  AND !report.disputed
  AND !report.executed
```

**ABI fragment.**

```json
{
  "type": "function",
  "name": "executeSlash",
  "inputs": [{ "name": "reportId", "type": "uint256" }],
  "outputs": [],
  "stateMutability": "nonpayable"
}
```

```json
{
  "type": "event",
  "name": "ReportCreated",
  "inputs": [
    { "name": "reportId",     "type": "uint256", "indexed": true  },
    { "name": "agent",        "type": "address", "indexed": true  },
    { "name": "reporter",     "type": "address", "indexed": true  },
    { "name": "amount",       "type": "uint256", "indexed": false },
    { "name": "reason",       "type": "string",  "indexed": false },
    { "name": "evidenceURI",  "type": "string",  "indexed": false }
  ]
}
```

**4-byte selector.** Compute with `cast sig "executeSlash(uint256)"`.

**Manual test (Anvil or Sepolia).**

```bash
cast send $SLASH_VERIFIER 'executeSlash(uint256)' 0 \
  --rpc-url $RPC --private-key $KEEPER_PRIVATE_KEY
```

---

## 2. Generate monthly bill

Roll an agent's accrued gas into an outstanding bill once the 30-day cycle elapses.

**Target.** `AgentPaymaster.generateBill(address agent)`

**Watch.** `paymaster.lastBillAt(agent) + 30 days <= block.timestamp` for any agent with `paymaster.unbilledGasCost(agent) > 0`.

**Trigger condition.**

```text
for each registered agent:
  if paymaster.unbilledGasCost(agent) > 0
     AND block.timestamp >= paymaster.lastBillAt(agent) + 30 days:
    fire generateBill(agent)
```

**ABI fragment.**

```json
{
  "type": "function",
  "name": "generateBill",
  "inputs": [{ "name": "agent", "type": "address" }],
  "outputs": [],
  "stateMutability": "nonpayable"
}
```

**Manual test.**

```bash
cast send $AGENT_PAYMASTER 'generateBill(address)' $AGENT_ADDR \
  --rpc-url $RPC --private-key $KEEPER_PRIVATE_KEY
```

---

## 3. Auto-settle unpaid bills from bond

After the 7-day grace period without payment, pull the bill out of the agent's bond.

**Target.** `AgentPaymaster.autoSettleFromBond(address agent)`

**Trigger condition.**

```text
for each agent with paymaster.billOf(agent) > 0:
  if block.timestamp >= paymaster.lastBillAt(agent) + 7 days:
    fire autoSettleFromBond(agent)
```

**ABI fragment.**

```json
{
  "type": "function",
  "name": "autoSettleFromBond",
  "inputs": [{ "name": "agent", "type": "address" }],
  "outputs": [],
  "stateMutability": "nonpayable"
}
```

**Manual test.**

```bash
cast send $AGENT_PAYMASTER 'autoSettleFromBond(address)' $AGENT_ADDR \
  --rpc-url $RPC --private-key $KEEPER_PRIVATE_KEY
```

If the agent's bond can't cover the bill, this reverts with `InsufficientBond`
— in that case, file a slash report against the agent for failure-to-pay
(`SlashVerifier.report(agent, amountOwed, "unpaid bill", evidenceURI)`).

---

## Provider integration patterns

The functions above have no special auth: any caller works. Pick whichever
automation network suits your stack.

### Gelato Web3 Functions

Write a JS resolver that returns `canExec` + `execData` for each job. The
resolver runs every block; when it returns `canExec=true`, Gelato submits the
tx. Sample shape:

```ts
Web3Function.onRun(async ({ multiChainProvider }) => {
  const verifier = new Contract(SLASH_VERIFIER, abi, provider);
  const reportCount = await verifier.reportsCount();
  // iterate, find first executable, return { canExec: true, callData }
});
```

### Chainlink Automation (custom logic upkeep)

Implement an on-chain `checkUpkeep(bytes calldata) returns (bool, bytes)` view
function in a small `ArbiterUpkeep.sol` helper that scans the three conditions
and returns the next executable call, then `performUpkeep(bytes)` that decodes
and dispatches to the right target.

### KeeperHub / cron

Run a Node script on a 5-minute timer (`*/5 * * * *`) that checks the three
conditions for known agents and submits with `cast send` or ethers.

### Indexer-driven

Subscribe to `ReportCreated` (and equivalent events) via a lightweight indexer
(Ponder, Subgraph). Schedule the right deferred job per event id. Cleanest if
you already have an indexer in your stack.

---

## Selector reference

Compute these once and store with your job registration:

```bash
cast sig "executeSlash(uint256)"
cast sig "generateBill(address)"
cast sig "autoSettleFromBond(address)"
```

## Required addresses

| Variable | Source |
|----------|--------|
| `$SLASH_VERIFIER` | `01_DeployCore.s.sol` output |
| `$AGENT_PAYMASTER` | `01_DeployCore.s.sol` output |
| `$RPC` | Sepolia / mainnet RPC URL |
| `$KEEPER_PRIVATE_KEY` | Keeper EOA — only needs gas; doesn't need any role |

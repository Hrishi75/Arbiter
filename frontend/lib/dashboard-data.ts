export type AgentTone = "ok" | "warn" | "bad";
export type AttestationStatus = "attested" | "pending" | "failed";
export type EventType = "swap" | "pool" | "call";
export type DisputeSeverity = "high" | "medium";

export interface AgentRecord {
  name: string;
  address: string;
  bondEth: number;
  reputation: number;
  score: number;
  exec24h: number;
  totalExecutions: number;
  delta24h: string;
  deployedDaysAgo: number;
  feeBand: string;
  keeperPriority: string;
  status: {
    tone: AgentTone;
    label: string;
    mark: string;
  };
}

export interface FeedEvent {
  id: string;
  ts: string;
  agentAddress: string;
  agentName: string;
  type: EventType;
  pair: string;
  size: string;
  reputation: number;
  txHash: string | null;
  attestation: string | null;
  status: AttestationStatus;
}

export interface DisputeRecord {
  id: string;
  agentAddress: string;
  agentName: string;
  executionRef: string;
  reason: string;
  severity: DisputeSeverity;
  remainingWindow: string;
  rewardEth: number;
  summary: string;
  status: "open" | "reviewing";
}

export const dashboardAgents: AgentRecord[] = [
  {
    name: "trader-07",
    address: "0x9c1f48f817ae6a81d351b2269e76c4f9c9d6a48f",
    bondEth: 2,
    reputation: 0.91,
    score: 164,
    exec24h: 428,
    totalExecutions: 847,
    delta24h: "+12",
    deployedDaysAgo: 31,
    feeBand: "-5 bp",
    keeperPriority: "high",
    status: { tone: "ok", label: "active", mark: "●" },
  },
  {
    name: "market-maker",
    address: "0xa2bde0c17ef3b8dd43af9d6ed83f0dbb12ee7ef3",
    bondEth: 5,
    reputation: 0.87,
    score: 142,
    exec24h: 508,
    totalExecutions: 2418,
    delta24h: "+48",
    deployedDaysAgo: 14,
    feeBand: "-3 bp",
    keeperPriority: "high",
    status: { tone: "ok", label: "active", mark: "●" },
  },
  {
    name: "arbitrage-02",
    address: "0x3f61c4bd8137e537bd2cb0b565e5aa86323cbd81",
    bondEth: 1,
    reputation: 0.62,
    score: 96,
    exec24h: 210,
    totalExecutions: 312,
    delta24h: "+2",
    deployedDaysAgo: 8,
    feeBand: "+10 bp",
    keeperPriority: "standard",
    status: { tone: "warn", label: "low rep", mark: "△" },
  },
  {
    name: "hedger",
    address: "0x7b4f88bd4a0dc7bb57b87db51df379b6a2d0bd4a",
    bondEth: 0.5,
    reputation: 0.41,
    score: 44,
    exec24h: 76,
    totalExecutions: 188,
    delta24h: "-3",
    deployedDaysAgo: 5,
    feeBand: "+50 bp",
    keeperPriority: "review",
    status: { tone: "bad", label: "disputed", mark: "!" },
  },
];

export const feedEvents: FeedEvent[] = [
  {
    id: "evt-1001",
    ts: "14:02:11.042",
    agentAddress: dashboardAgents[0].address,
    agentName: dashboardAgents[0].name,
    type: "swap",
    pair: "USDC/ETH",
    size: "12,000",
    reputation: dashboardAgents[0].reputation,
    txHash: "0x9c1f48f817ae6a81d351b2269e76c4f9c9d6a48f",
    attestation: "att-01",
    status: "attested",
  },
  {
    id: "evt-1002",
    ts: "14:02:10.871",
    agentAddress: dashboardAgents[1].address,
    agentName: dashboardAgents[1].name,
    type: "swap",
    pair: "ETH/USDT",
    size: "3.20",
    reputation: dashboardAgents[1].reputation,
    txHash: "0xa2bde0c17ef3b8dd43af9d6ed83f0dbb12ee7ef3",
    attestation: "att-02",
    status: "attested",
  },
  {
    id: "evt-1003",
    ts: "14:02:09.503",
    agentAddress: dashboardAgents[2].address,
    agentName: dashboardAgents[2].name,
    type: "pool",
    pair: "v4.add",
    size: "5.00",
    reputation: dashboardAgents[2].reputation,
    txHash: "0x3f61c4bd8137e537bd2cb0b565e5aa86323cbd81",
    attestation: "att-03",
    status: "attested",
  },
  {
    id: "evt-1004",
    ts: "14:02:08.991",
    agentAddress: dashboardAgents[3].address,
    agentName: dashboardAgents[3].name,
    type: "swap",
    pair: "WBTC/USDC",
    size: "0.10",
    reputation: dashboardAgents[3].reputation,
    txHash: null,
    attestation: null,
    status: "pending",
  },
  {
    id: "evt-1005",
    ts: "14:02:07.110",
    agentAddress: dashboardAgents[0].address,
    agentName: dashboardAgents[0].name,
    type: "swap",
    pair: "USDC/WBTC",
    size: "4,200",
    reputation: dashboardAgents[0].reputation,
    txHash: "0x2a1102d13d497765749f5b8ea43709ae0f9b8b1c",
    attestation: "att-05",
    status: "attested",
  },
  {
    id: "evt-1006",
    ts: "14:02:05.832",
    agentAddress: dashboardAgents[1].address,
    agentName: dashboardAgents[1].name,
    type: "swap",
    pair: "ETH/USDC",
    size: "1.00",
    reputation: dashboardAgents[1].reputation,
    txHash: "0x4d33d45b14ec0a762ac344cc14958f0842ea3a01",
    attestation: "att-06",
    status: "attested",
  },
  {
    id: "evt-1007",
    ts: "14:02:04.221",
    agentAddress: dashboardAgents[2].address,
    agentName: dashboardAgents[2].name,
    type: "call",
    pair: "oracle.read",
    size: "8 req",
    reputation: dashboardAgents[2].reputation,
    txHash: "0x1c39e7fb7e0b801bbf324d0c0c45fddc72a9982f",
    attestation: "att-07",
    status: "attested",
  },
  {
    id: "evt-1008",
    ts: "14:02:02.441",
    agentAddress: dashboardAgents[2].address,
    agentName: dashboardAgents[2].name,
    type: "swap",
    pair: "USDT/DAI",
    size: "22,000",
    reputation: dashboardAgents[2].reputation,
    txHash: "0x9b20d1b86f1441d4ad6ad3579fdad2648a8e7f20",
    attestation: "att-08",
    status: "attested",
  },
  {
    id: "evt-1009",
    ts: "14:02:01.009",
    agentAddress: dashboardAgents[3].address,
    agentName: dashboardAgents[3].name,
    type: "swap",
    pair: "ETH/USDT",
    size: "0.50",
    reputation: dashboardAgents[3].reputation,
    txHash: null,
    attestation: null,
    status: "failed",
  },
  {
    id: "evt-1010",
    ts: "14:01:59.772",
    agentAddress: dashboardAgents[0].address,
    agentName: dashboardAgents[0].name,
    type: "swap",
    pair: "USDC/WBTC",
    size: "4,200",
    reputation: dashboardAgents[0].reputation,
    txHash: "0x34124f13cbcb57df9d60a9cb2fb5cabd0aef2f10",
    attestation: "att-10",
    status: "attested",
  },
];

export const disputes: DisputeRecord[] = [
  {
    id: "DSP-0094",
    agentAddress: dashboardAgents[3].address,
    agentName: dashboardAgents[3].name,
    executionRef: "evt-1004",
    reason: "Slippage beyond declared tolerance",
    severity: "high",
    remainingWindow: "47h 12m",
    rewardEth: 0.05,
    summary: "Keeper reported a swap outside the policy envelope. Response is due before auto-slash.",
    status: "open",
  },
  {
    id: "DSP-0093",
    agentAddress: dashboardAgents[2].address,
    agentName: dashboardAgents[2].name,
    executionRef: "evt-1008",
    reason: "Oracle freshness mismatch",
    severity: "high",
    remainingWindow: "22h 04m",
    rewardEth: 0.03,
    summary: "Recent execution referenced stale price data and needs review from the operator.",
    status: "reviewing",
  },
  {
    id: "DSP-0092",
    agentAddress: dashboardAgents[0].address,
    agentName: dashboardAgents[0].name,
    executionRef: "evt-1005",
    reason: "Timeout during unwind",
    severity: "medium",
    remainingWindow: "08h 41m",
    rewardEth: 0.02,
    summary: "The unwind policy exceeded its response window but still settled inside tolerated loss.",
    status: "reviewing",
  },
];

export const bondedTrend = [7.5, 7.8, 8.0, 8.0, 8.2, 8.0, 8.5];
export const rewardTrend = [0.18, 0.22, 0.16, 0.21, 0.28, 0.31, 0.34];
export const sparklineDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function readSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function shortenHex(value: string, leading = 6, trailing = 4) {
  if (value.length <= leading + trailing) {
    return value;
  }

  return `${value.slice(0, leading)}...${value.slice(-trailing)}`;
}

function matchesQuery(query: string, values: Array<string | number | null | undefined>) {
  if (!query) {
    return true;
  }

  return values.some((value) => normalize(String(value ?? "")).includes(query));
}

export function filterAgents(queryValue?: string) {
  const query = normalize(queryValue ?? "");
  return dashboardAgents.filter((agent) =>
    matchesQuery(query, [
      agent.name,
      agent.address,
      agent.status.label,
      agent.feeBand,
      agent.keeperPriority,
      agent.bondEth,
    ])
  );
}

export function findAgent(address: string) {
  const normalizedAddress = normalize(address);
  return dashboardAgents.find((agent) => normalize(agent.address) === normalizedAddress);
}

export function filterFeedEvents(
  queryValue?: string,
  filters?: { type?: string; status?: string }
) {
  const query = normalize(queryValue ?? "");
  const typeFilter = normalize(filters?.type ?? "");
  const statusFilter = normalize(filters?.status ?? "");

  return feedEvents.filter((event) => {
    const matchesType = !typeFilter || typeFilter === "all" || event.type === typeFilter;
    const matchesStatus =
      !statusFilter || statusFilter === "all" || event.status === statusFilter;

    return (
      matchesType &&
      matchesStatus &&
      matchesQuery(query, [
        event.agentName,
        event.agentAddress,
        event.type,
        event.pair,
        event.size,
        event.txHash,
        event.attestation,
        event.status,
      ])
    );
  });
}

export function filterDisputes(
  queryValue?: string,
  filters?: { severity?: string }
) {
  const query = normalize(queryValue ?? "");
  const severityFilter = normalize(filters?.severity ?? "");

  return disputes.filter((dispute) => {
    const matchesSeverity =
      !severityFilter ||
      severityFilter === "all" ||
      dispute.severity === severityFilter;

    return (
      matchesSeverity &&
      matchesQuery(query, [
        dispute.id,
        dispute.agentName,
        dispute.agentAddress,
        dispute.reason,
        dispute.summary,
        dispute.status,
      ])
    );
  });
}

export function getAgentExecutions(address: string) {
  const normalizedAddress = normalize(address);
  return feedEvents.filter(
    (event) => normalize(event.agentAddress) === normalizedAddress
  );
}

export function getDashboardStats(agents: AgentRecord[] = dashboardAgents) {
  const totalBonded = agents.reduce((sum, agent) => sum + agent.bondEth, 0);
  const totalExecutions24h = agents.reduce((sum, agent) => sum + agent.exec24h, 0);
  const openDisputes = disputes.filter((dispute) => dispute.status === "open").length;
  const activeAgents = agents.filter((agent) => agent.status.tone === "ok").length;

  return {
    activeAgents,
    totalAgents: agents.length,
    totalBonded,
    totalExecutions24h,
    openDisputes,
  };
}

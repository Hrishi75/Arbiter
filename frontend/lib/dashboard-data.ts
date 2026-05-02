import { formatEther } from "viem";
import type { Agent } from "@/lib/hooks/useAgents";
import type { Dispute, DisputeStatus } from "@/lib/hooks/useDisputes";
import type { FeedEvent, FeedEventKind } from "@/lib/hooks/useFeedEvents";

export type { Agent, Dispute, DisputeStatus, FeedEvent, FeedEventKind };

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function readSearchParam(value?: string | string[] | null) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function shortenHex(value: string, leading = 6, trailing = 4) {
  if (!value) return "";
  if (value.length <= leading + trailing) return value;
  return `${value.slice(0, leading)}...${value.slice(-trailing)}`;
}

export function formatEth(wei: bigint, fractionDigits = 4): string {
  return Number(formatEther(wei)).toFixed(fractionDigits);
}

function matches(query: string, values: Array<string | number | null | undefined>) {
  if (!query) return true;
  return values.some((v) => normalize(String(v ?? "")).includes(query));
}

export function filterAgents(agents: Agent[], queryValue?: string): Agent[] {
  const query = normalize(queryValue ?? "");
  if (!query) return agents;
  return agents.filter((a) =>
    matches(query, [a.account, a.owner, a.metadataURI, a.active ? "active" : "inactive"])
  );
}

export function findAgent(agents: Agent[], address: string): Agent | undefined {
  const target = normalize(address);
  return agents.find((a) => normalize(a.account) === target);
}

export function filterDisputes(
  disputes: Dispute[],
  queryValue?: string,
  filters?: { status?: string }
): Dispute[] {
  const query = normalize(queryValue ?? "");
  const status = normalize(filters?.status ?? "");
  return disputes.filter((d) => {
    const statusOk = !status || status === "all" || d.status === status;
    return (
      statusOk &&
      matches(query, [d.agent, d.reporter, d.reason, d.evidenceURI, d.status, `dsp-${d.reportId}`])
    );
  });
}

export function filterFeedEvents(
  events: FeedEvent[],
  queryValue?: string,
  filters?: { kind?: string }
): FeedEvent[] {
  const query = normalize(queryValue ?? "");
  const kind = normalize(filters?.kind ?? "");
  return events.filter((e) => {
    const kindOk = !kind || kind === "all" || e.kind === kind;
    return kindOk && matches(query, [e.kind, e.agent, e.txHash, e.reportId?.toString()]);
  });
}

export function getAgentFeedEvents(events: FeedEvent[], address: string): FeedEvent[] {
  const target = normalize(address);
  return events.filter((e) => normalize(e.agent) === target);
}

export function disputeId(reportId: number): string {
  return `DSP-${String(reportId).padStart(4, "0")}`;
}

export function remainingWindow(deadlineSec: number, nowSec = Math.floor(Date.now() / 1000)): string {
  const left = deadlineSec - nowSec;
  if (left <= 0) return "expired";
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  return `${h}h ${m}m`;
}

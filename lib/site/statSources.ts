import { cache } from "react";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import type { Bilingual } from "@/lib/content/types";
import { formatStat, type StatFormat, type StatSourceOption } from "./statFormat";

/**
 * Figures the platform counts for itself. Aggregates only — never a name, a
 * message or an address — because they are shown on public pages.
 */
export type StatSource = {
  key: string;
  label: Bilingual;
  format: StatFormat;
  count: () => Promise<number>;
};

const ka = (ka: string, en: string): Bilingual => ({ ka, en });

/** Midnight UTC today — the boundary for the "today" counters. */
function startOfToday(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const STAT_SOURCES: StatSource[] = [
  {
    key: "businesses",
    label: ka("ბიზნესების რაოდენობა", "Businesses registered"),
    format: "number",
    count: () => prisma.business.count(),
  },
  {
    key: "users",
    label: ka("მომხმარებლების რაოდენობა", "Users registered"),
    format: "number",
    count: () => prisma.user.count(),
  },
  {
    key: "conversations",
    label: ka("საუბრები ჯამში", "Conversations handled"),
    format: "number",
    count: () => prisma.conversation.count(),
  },
  {
    key: "conversationsToday",
    label: ka("აქტიური საუბრები დღეს", "Conversations today"),
    format: "number",
    count: () => prisma.conversation.count({ where: { createdAt: { gte: startOfToday() } } }),
  },
  {
    key: "messages",
    label: ka("შეტყობინებები ჯამში", "Messages exchanged"),
    format: "number",
    count: () => prisma.message.count(),
  },
  {
    key: "messagesToday",
    label: ka("შეტყობინებები დღეს", "Messages today"),
    format: "number",
    count: () => prisma.message.count({ where: { createdAt: { gte: startOfToday() } } }),
  },
  {
    key: "aiMessages",
    label: ka("AI-ს გაცემული პასუხები", "Answers sent by AI"),
    format: "number",
    count: () => prisma.message.count({ where: { sender: "AI" } }),
  },
  {
    key: "orders",
    label: ka("შეკვეთების რაოდენობა", "Orders placed"),
    format: "number",
    count: () => prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
  },
  {
    key: "revenue",
    label: ka("გაყიდვების ჯამი", "Total sales value"),
    format: "money",
    count: async () => {
      const agg = await prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      });
      return agg._sum.total ?? 0;
    },
  },
  {
    key: "leads",
    label: ka("შეგროვებული ლიდები", "Leads collected"),
    format: "number",
    count: () => prisma.lead.count(),
  },
  {
    key: "products",
    label: ka("პროდუქტები სისტემაში", "Products in the system"),
    format: "number",
    count: () => prisma.product.count(),
  },
  {
    key: "channels",
    label: ka("დაკავშირებული არხები", "Channels connected"),
    format: "number",
    count: () => prisma.channel.count({ where: { connected: true } }),
  },
];

export function findStatSource(key: string): StatSource | undefined {
  return STAT_SOURCES.find((s) => s.key === key);
}

/** Keys an admin may save. */
export const STAT_SOURCE_KEYS: string[] = STAT_SOURCES.map((s) => s.key);

/** Counts one source; null (and logged) when the query fails. */
export async function countStat(source: StatSource): Promise<number | null> {
  try {
    return await source.count();
  } catch (err) {
    log.error("live stat could not be counted", err, { source: source.key });
    return null;
  }
}

/** Every counter with its current value, for the admin pickers. Cached per request. */
export const statSourceOptions = cache(async (): Promise<StatSourceOption[]> => {
  return Promise.all(
    STAT_SOURCES.map(async (s) => {
      const n = await countStat(s);
      return {
        key: s.key,
        label: s.label,
        format: s.format,
        value: n === null ? "—" : formatStat(n, s.format),
      };
    }),
  );
});

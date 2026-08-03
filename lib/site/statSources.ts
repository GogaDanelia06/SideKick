import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import type { Bilingual } from "@/lib/content/types";
import { formatStat, type StatFormat, type StatSourceOption } from "./statFormat";

/**
 * The figures the platform can count for itself.
 *
 * Anything listed here should never be typed by hand: a typed number is a claim
 * that stops being true the moment the next customer signs up. Adding a source
 * costs one entry — a label for the admin and a query.
 *
 * `count` returns the raw figure and nothing else. Formatting is a separate,
 * named step because the browser has to redo it on every frame while the number
 * climbs, and it cannot be handed a server function to do that with.
 *
 * Deliberately aggregate-only. These read counts and sums across all tenants,
 * never a name, a message or an address, so a public page can never leak one
 * business's data to another's visitors.
 */
export type StatSource = {
  key: string;
  label: Bilingual;
  format: StatFormat;
  /** The raw figure, unformatted. */
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

/** Keys an admin may save — anything else is rejected rather than stored. */
export const STAT_SOURCE_KEYS: string[] = STAT_SOURCES.map((s) => s.key);

/**
 * Counts one source, or `null` when the query fails.
 *
 * A counter that breaks must not take a page down with it: the caller falls
 * back to whatever it was showing before, and the failure is logged instead.
 */
export async function countStat(source: StatSource): Promise<number | null> {
  try {
    return await source.count();
  } catch (err) {
    log.error("live stat could not be counted", err, { source: source.key });
    return null;
  }
}

/**
 * Every counter with its value right now — what the admin picks from.
 *
 * Showing the current figure beside each choice is the point: it is how an
 * admin tells "users registered" from "businesses registered" without having to
 * publish one and go look at the site.
 */
export async function statSourceOptions(): Promise<StatSourceOption[]> {
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
}

import { prisma } from "@/lib/db";
import type { Bilingual } from "@/lib/content/types";

/**
 * The figures the platform can count for itself.
 *
 * Anything listed here should never be typed by hand: a typed number is a claim
 * that stops being true the moment the next customer signs up. Adding a source
 * costs one entry — a label for the admin and a query.
 *
 * Deliberately aggregate-only. These read counts and sums across all tenants,
 * never a name, a message or an address, so a public page can never leak one
 * business's data to another's visitors.
 */
export type StatSource = {
  key: string;
  label: Bilingual;
  /** Returns the figure ready to display, formatting included. */
  compute: () => Promise<string>;
};

const ka = (ka: string, en: string): Bilingual => ({ ka, en });

const nf = new Intl.NumberFormat("en-US");

/** Big money reads better shortened: 2,400,000 → 2.4M. */
function money(total: number): string {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1).replace(/\.0$/, "")}M₾`;
  if (total >= 1_000) return `${Math.round(total / 1_000)}K₾`;
  return `${nf.format(total)}₾`;
}

export const STAT_SOURCES: StatSource[] = [
  {
    key: "businesses",
    label: ka("ბიზნესების რაოდენობა", "Businesses registered"),
    compute: async () => nf.format(await prisma.business.count()),
  },
  {
    key: "users",
    label: ka("მომხმარებლების რაოდენობა", "Users registered"),
    compute: async () => nf.format(await prisma.user.count()),
  },
  {
    key: "conversations",
    label: ka("საუბრები ჯამში", "Conversations handled"),
    compute: async () => nf.format(await prisma.conversation.count()),
  },
  {
    key: "messages",
    label: ka("შეტყობინებები ჯამში", "Messages exchanged"),
    compute: async () => nf.format(await prisma.message.count()),
  },
  {
    key: "aiMessages",
    label: ka("AI-ს გაცემული პასუხები", "Answers sent by AI"),
    compute: async () => nf.format(await prisma.message.count({ where: { sender: "AI" } })),
  },
  {
    key: "orders",
    label: ka("შეკვეთების რაოდენობა", "Orders placed"),
    compute: async () =>
      nf.format(await prisma.order.count({ where: { status: { not: "CANCELLED" } } })),
  },
  {
    key: "revenue",
    label: ka("გაყიდვების ჯამი", "Total sales value"),
    compute: async () => {
      const agg = await prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      });
      return money(agg._sum.total ?? 0);
    },
  },
  {
    key: "leads",
    label: ka("შეგროვებული ლიდები", "Leads collected"),
    compute: async () => nf.format(await prisma.lead.count()),
  },
  {
    key: "products",
    label: ka("პროდუქტები სისტემაში", "Products in the system"),
    compute: async () => nf.format(await prisma.product.count()),
  },
  {
    key: "channels",
    label: ka("დაკავშირებული არხები", "Channels connected"),
    compute: async () => nf.format(await prisma.channel.count({ where: { connected: true } })),
  },
];

export function findStatSource(key: string): StatSource | undefined {
  return STAT_SOURCES.find((s) => s.key === key);
}

/** Keys an admin may save — anything else is rejected rather than stored. */
export const STAT_SOURCE_KEYS: string[] = STAT_SOURCES.map((s) => s.key);

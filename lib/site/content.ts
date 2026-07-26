import { prisma } from "@/lib/db";
import type { Bilingual } from "@/lib/content/types";
import { PLAN_SUPPORT, type Package } from "@/lib/content/packages";
import type { FaqItem } from "@/lib/content/faq";
import { SITE } from "@/lib/seo/site";

export type SiteStatView = { value: string; label: Bilingual };

export async function getSiteStats(): Promise<SiteStatView[]> {
  const rows = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ value: r.value, label: { ka: r.labelKa, en: r.labelEn } }));
}

function cap(n: number, unlimited: Bilingual, ka: (v: string) => string, en: (v: string) => string): Bilingual {
  if (n < 0) return unlimited;
  const v = n.toLocaleString("en-US");
  return { ka: ka(v), en: en(v) };
}

function planFeatures(p: {
  key: string;
  msgLimit: number;
  channelCap: number;
  userCap: number;
  productCap: number;
}): Bilingual[] {
  return [
    cap(
      p.msgLimit,
      { ka: "შეუზღუდავი შეტყობინება", en: "Unlimited messages" },
      (v) => `${v} შეტყობინება / თვე`,
      (v) => `${v} messages / month`,
    ),
    cap(
      p.channelCap,
      { ka: "ყველა არხი", en: "All channels" },
      (v) => `${v} არხი`,
      (v) => `${v} channel${p.channelCap === 1 ? "" : "s"}`,
    ),
    cap(
      p.userCap,
      { ka: "შეუზღუდავი მომხმარებელი", en: "Unlimited users" },
      (v) => `${v} მომხმარებელი`,
      (v) => `${v} user${p.userCap === 1 ? "" : "s"}`,
    ),
    cap(
      p.productCap,
      { ka: "შეუზღუდავი პროდუქტი", en: "Unlimited products" },
      (v) => `${v} პროდუქტი`,
      (v) => `${v} products`,
    ),
    PLAN_SUPPORT[p.key] ?? { ka: "მხარდაჭერა", en: "Support" },
  ];
}

export async function getPlans(): Promise<Package[]> {
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });
  return plans.map((p) => ({
    name: { ka: p.name, en: p.nameEn || p.name },
    price: p.price,
    featured: p.featured,
    features: planFeatures(p),
  }));
}

export async function getSiteFaq(): Promise<FaqItem[]> {
  const rows = await prisma.siteFaq.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({
    question: { ka: r.questionKa, en: r.questionEn },
    answer: { ka: r.answerKa, en: r.answerEn },
  }));
}

export const SEO_KEYS = { title: "seo_title", description: "seo_description" } as const;

export type SeoSettings = { title: string; description: string };

export async function getSeoSettings(): Promise<SeoSettings> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [SEO_KEYS.title, SEO_KEYS.description] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.valueKa.trim()]));
  return {
    title: map.get(SEO_KEYS.title) || SITE.title,
    description: map.get(SEO_KEYS.description) || SITE.description,
  };
}

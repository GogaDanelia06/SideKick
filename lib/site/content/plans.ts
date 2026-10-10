import { prisma } from "@/lib/db";
import type { Bilingual } from "@/lib/content/types";
import { PLAN_SUPPORT, type Package } from "@/lib/content/packages";

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
  return plans.map((p) => {
    const extras: Bilingual[] = p.extrasKa
      .map((ka, i) => ({ ka: ka.trim(), en: (p.extrasEn[i] ?? ka).trim() }))
      .filter((b) => b.ka);

    return {
      name: { ka: p.name, en: p.nameEn || p.name },
      price: p.price,
      price3m: p.price3m,
      price12m: p.price12m,
      featured: p.featured,
      features: [...planFeatures(p), ...extras],
    };
  });
}

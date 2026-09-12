import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import { PLAN_SUPPORT, type Package } from "@/lib/content/packages";
import type { Bilingual } from "@/lib/content/types";

type Caps = { key: string; msgLimit: number; channelCap: number; userCap: number; productCap: number };

/** The "unlimited" line for a -1 cap, otherwise the formatted number in both languages. */
function capLine(n: number, unlimited: Bilingual, ka: (v: string) => string, en: (v: string) => string): Bilingual {
  if (n < 0) return unlimited;
  const v = n.toLocaleString("en-US");
  return { ka: ka(v), en: en(v) };
}

function planFeatures(p: Caps): Bilingual[] {
  return [
    capLine(
      p.msgLimit,
      { ka: "შეუზღუდავი შეტყობინება", en: "Unlimited messages" },
      (v) => `${v} შეტყობინება / თვე`,
      (v) => `${v} messages / month`,
    ),
    capLine(
      p.channelCap,
      { ka: "ყველა არხი", en: "All channels" },
      (v) => `${v} არხი`,
      (v) => `${v} channel${p.channelCap === 1 ? "" : "s"}`,
    ),
    capLine(
      p.userCap,
      { ka: "შეუზღუდავი მომხმარებელი", en: "Unlimited users" },
      (v) => `${v} მომხმარებელი`,
      (v) => `${v} user${p.userCap === 1 ? "" : "s"}`,
    ),
    capLine(
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
    // Admin-written bullets follow the derived ones; English pairs with Georgian by index.
    const extras = p.extrasKa
      .map((ka, i) => ({ ka: ka.trim(), en: (p.extrasEn[i] ?? ka).trim() }))
      .filter((line) => line.ka);

    return {
      name: bilingual(p.name, p.nameEn),
      price: p.price,
      price3m: p.price3m,
      price12m: p.price12m,
      featured: p.featured,
      features: [...planFeatures(p), ...extras],
    };
  });
}

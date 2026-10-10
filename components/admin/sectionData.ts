import type { HeroSlide, HeroSlideStat, LegalSection, Plan, SiteFaq, SiteStat } from "@prisma/client";
import type { StatSourceOption } from "@/lib/site/statFormat";
import type { TextGroup } from "@/lib/site/textKeys";
import type { BoxItem } from "./boxes/BoxFields";
import type { SeoValues } from "./seo/seoForm";

export type SectionData =
  | {
      kind: "carousel";
      slides: (HeroSlide & { stats: HeroSlideStat[] })[];
      intervalSeconds: number;
      sources: StatSourceOption[];
    }
  | { kind: "stats"; stats: SiteStat[]; sources: StatSourceOption[] }
  | { kind: "text"; group: TextGroup; values: Record<string, { ka: string; en: string }> }
  | { kind: "boxes"; boxKind: "benefit" | "service"; items: BoxItem[] }
  | { kind: "plans"; plans: Plan[] }
  | { kind: "faq"; faqs: SiteFaq[] }
  | {
      kind: "legal";
      doc: string;
      sections: LegalSection[];
      title: { ka: string; en: string };
      defaultTitle: string;
    }
  | {
      kind: "seo";
      path: string;
      values: SeoValues;
      defaults: { title: string; description: string; siteUrl: string };
    };

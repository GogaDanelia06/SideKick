"use client";

import { useState } from "react";
import type { HeroSlide, HeroSlideStat, LegalSection, Plan, SiteFaq, SiteStat } from "@prisma/client";
import { IconExternalLink } from "@tabler/icons-react";
import { findAdminPage } from "@/lib/admin/pages";
import { SectionLayout, SectionRail } from "./ui/SectionRail";
import type { TextGroup } from "@/lib/site/textKeys";
import { useLanguage } from "@/lib/i18n/useLanguage";

import { HeroEditor } from "./hero/HeroEditor";
import { StatsEditor } from "./stats/StatsEditor";
import type { StatSourceOption } from "@/lib/site/statFormat";
import { TextGroupEditor } from "./content/TextGroupEditor";
import { BoxesEditor, type BoxItem } from "./boxes/BoxesEditor";
import { PlansEditor } from "./plans/PlansEditor";
import { FaqEditor } from "./faq/FaqEditor";
import { LegalEditor } from "./legal/LegalEditor";
import { SeoEditor, type SeoValues } from "./seo/SeoEditor";

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

function Section({ data }: { data: SectionData }) {
  switch (data.kind) {
    case "carousel":
      return (
        <HeroEditor
          slides={data.slides}
          intervalSeconds={data.intervalSeconds}
          sources={data.sources}
        />
      );
    case "stats":
      return <StatsEditor stats={data.stats} sources={data.sources} />;
    case "text":
      return <TextGroupEditor group={data.group} values={data.values} />;
    case "boxes":
      return <BoxesEditor kind={data.boxKind} items={data.items} />;
    case "plans":
      return <PlansEditor plans={data.plans} />;
    case "faq":
      return <FaqEditor faqs={data.faqs} />;
    case "legal":
      return (
        <LegalEditor
          doc={data.doc}
          sections={data.sections}
          title={data.title}
          defaultTitle={data.defaultTitle}
        />
      );
    case "seo":
      return <SeoEditor path={data.path} values={data.values} defaults={data.defaults} />;
  }
}

/**
 * One admin page: its sections in a left rail, the selected section's editor
 * beside it. Mirrors the AI-assistant screen in the tenant dashboard, so the
 * two areas of the product feel like the same product.
 */
export function PageEditor({
  slug,
  data,
}: {
  slug: string;
  data: Record<string, SectionData>;
}) {
  const { t } = useLanguage();
  // Looked up here rather than passed in: the registry carries icon components,
  // and functions can't cross the server/client boundary as props.
  const page = findAdminPage(slug);
  const [active, setActive] = useState(page?.sections[0]?.key ?? "");

  if (!page) return null;
  const current = data[active];

  return (
    <>
      <div className="mb-6 flex max-w-[1370px] flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold">{t(page.label)}</h1>
          <p className="mt-1 text-sm text-muted">
            {t({ ka: "აირჩიე სექცია და დაარედაქტირე.", en: "Pick a section and edit it." })}
          </p>
        </div>
        <a
          href={page.route}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border px-3 text-[13px] font-medium text-muted hover:text-ink"
        >
          <IconExternalLink size={15} />
          {t({ ka: "გვერდის ნახვა", en: "View page" })}
        </a>
      </div>

      {/* Single-section pages don't need a rail to choose from. */}
      {page.sections.length === 1 ? (
        current ? <div className="max-w-[1100px]"><Section data={current} /></div> : null
      ) : (
        <SectionLayout
          rail={<SectionRail items={page.sections} active={active} onSelect={setActive} />}
        >
          {current ? <Section data={current} /> : null}
        </SectionLayout>
      )}
    </>
  );
}

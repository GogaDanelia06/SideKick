"use client";

import { useState } from "react";
import clsx from "clsx";
import type { HeroSlide, HeroSlideStat, LegalSection, Plan, SiteFaq, SiteStat } from "@prisma/client";
import { IconChevronRight, IconExternalLink } from "@tabler/icons-react";
import { findAdminPage } from "@/lib/admin/pages";
import type { TextGroup } from "@/lib/site/textKeys";
import { useLanguage } from "@/lib/i18n/useLanguage";

import { HeroEditor } from "./hero/HeroEditor";
import { StatsEditor } from "./stats/StatsEditor";
import { TextGroupEditor } from "./content/TextGroupEditor";
import { BoxesEditor, type BoxItem } from "./boxes/BoxesEditor";
import { PlansEditor } from "./plans/PlansEditor";
import { FaqEditor } from "./faq/FaqEditor";
import { LegalEditor } from "./legal/LegalEditor";
import { SeoEditor } from "./seo/SeoEditor";

export type SectionData =
  | { kind: "carousel"; slides: (HeroSlide & { stats: HeroSlideStat[] })[]; intervalSeconds: number }
  | { kind: "stats"; stats: SiteStat[] }
  | { kind: "text"; group: TextGroup; values: Record<string, { ka: string; en: string }> }
  | { kind: "boxes"; boxKind: "benefit" | "service"; items: BoxItem[] }
  | { kind: "plans"; plans: Plan[] }
  | { kind: "faq"; faqs: SiteFaq[] }
  | { kind: "legal"; doc: string; sections: LegalSection[] }
  | { kind: "seo"; title: string; description: string };

function Section({ data }: { data: SectionData }) {
  switch (data.kind) {
    case "carousel":
      return <HeroEditor slides={data.slides} intervalSeconds={data.intervalSeconds} />;
    case "stats":
      return <StatsEditor stats={data.stats} />;
    case "text":
      return <TextGroupEditor group={data.group} values={data.values} />;
    case "boxes":
      return <BoxesEditor kind={data.boxKind} items={data.items} />;
    case "plans":
      return <PlansEditor plans={data.plans} />;
    case "faq":
      return <FaqEditor faqs={data.faqs} />;
    case "legal":
      return <LegalEditor doc={data.doc} sections={data.sections} />;
    case "seo":
      return <SeoEditor title={data.title} description={data.description} />;
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
        current ? <Section data={current} /> : null
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
          <div className="rounded-lg border border-border bg-card p-3 lg:sticky lg:top-4">
            <div className="px-2 pb-2 text-[11px] uppercase tracking-wide text-faint">
              {t({ ka: "სექციები", en: "Sections" })}
            </div>
            <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {page.sections.map((s) => {
                const on = active === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActive(s.key)}
                    aria-current={on ? "page" : undefined}
                    className={clsx(
                      "flex shrink-0 items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-[13px] transition-colors",
                      on
                        ? "bg-green-surface font-semibold text-green"
                        : "text-muted hover:bg-soft hover:text-ink",
                    )}
                  >
                    <s.icon size={17} className="shrink-0" />
                    <span className="flex-1 whitespace-nowrap lg:whitespace-normal">
                      {t(s.label)}
                    </span>
                    {on ? (
                      <IconChevronRight size={15} className="hidden shrink-0 lg:block" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="min-w-0">{current ? <Section data={current} /> : null}</div>
        </div>
      )}
    </>
  );
}

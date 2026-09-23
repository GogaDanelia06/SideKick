"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import type { LegalDoc } from "@/lib/content/legal";
import { LEGAL_REVIEW_NOTICE } from "@/lib/content/legal";
import { draftedBlocks, type LegalSectionView } from "@/lib/content/legalBlocks";
import { longDate } from "@/lib/content/longDate";
import { LegalBlocks } from "./LegalBlocks";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const PLACEHOLDER = /【[^】]*】/;

/** `sections` and `title` override the drafted copy when the admin has edited
 *  this document; without them the page falls back to lib/content/legal.ts. */
export function LegalView({
  doc,
  sections,
  title,
}: {
  doc: LegalDoc;
  sections?: LegalSectionView[];
  title?: Text;
}) {
  const { t, locale } = useLanguage();

  // The admin panel's sections when it has any, and the drafted copy until then.
  const list: LegalSectionView[] =
    sections && sections.length > 0
      ? sections
      : doc.sections.map((s) => ({ heading: s.heading, blocks: draftedBlocks(s) }));

  const isDraftVisible = process.env.NODE_ENV !== "production";
  const unfilled =
    isDraftVisible &&
    list.some((s) =>
      s.blocks.some((block) =>
        (block.kind === "list" ? block.items : [block.text]).some(
          (b) => PLACEHOLDER.test(b.ka) || PLACEHOLDER.test(b.en),
        ),
      ),
    );

  return (
    <section className="pb-20 pt-8">
      <Container>
        <div className="mx-auto max-w-[760px]">
          <h1 className="text-3xl font-semibold leading-snug tracking-[-0.01em]">
            {t(title ?? doc.title)}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t("legal.view.lastUpdated")}:{" "}
            {longDate(doc.updated, locale)}
          </p>

          {isDraftVisible ? (
            <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-amber bg-amber-surface px-4 py-3 text-[13px] text-amber">
              <IconAlertTriangle size={18} className="mt-px shrink-0" />
              <div>
                <div className="font-semibold">
                  {t("legal.view.visibleInDevelopmentOnly")}
                </div>
                <p className="mt-0.5">{t(LEGAL_REVIEW_NOTICE)}</p>
                {unfilled ? (
                  <p className="mt-1">
                    {t("legal.view.thisDocumentStillContains")}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-8">
            {list.map((s, i) => (
              <section key={i}>
                <h2 className="mb-3 text-lg font-semibold">{t(s.heading)}</h2>

                <LegalBlocks blocks={s.blocks} />
              </section>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import type { LegalDoc } from "@/lib/content/legal";
import { LEGAL_REVIEW_NOTICE } from "@/lib/content/legal";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const PLACEHOLDER = /【[^】]*】/;

/** `sections` and `title` override the drafted copy when the admin has edited
 *  this document; without them the page falls back to lib/content/legal.ts. */
export function LegalView({
  doc,
  sections,
  title,
}: {
  doc: LegalDoc;
  sections?: LegalDoc["sections"];
  title?: Bilingual;
}) {
  const { t, locale } = useLanguage();

  const list = sections && sections.length > 0 ? sections : doc.sections;

  const isDraftVisible = process.env.NODE_ENV !== "production";
  const unfilled =
    isDraftVisible &&
    list.some((s) =>
      [...(s.paragraphs ?? []), ...(s.bullets ?? [])].some(
        (b) => PLACEHOLDER.test(b.ka) || PLACEHOLDER.test(b.en),
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
            {t({ ka: "ბოლო განახლება", en: "Last updated" })}:{" "}
            {new Date(doc.updated).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {isDraftVisible ? (
            <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-amber bg-amber-surface px-4 py-3 text-[13px] text-amber">
              <IconAlertTriangle size={18} className="mt-px shrink-0" />
              <div>
                <div className="font-semibold">
                  {t({ ka: "მხოლოდ დეველოპმენტში ჩანს", en: "Visible in development only" })}
                </div>
                <p className="mt-0.5">{t(LEGAL_REVIEW_NOTICE)}</p>
                {unfilled ? (
                  <p className="mt-1">
                    {t({
                      ka: "დოკუმენტში დარჩა 【】-ში ჩასმული ადგილები, რომლებიც უნდა შეივსოს გამოქვეყნებამდე.",
                      en: "This document still contains 【】 placeholders that must be filled in before publishing.",
                    })}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-8">
            {list.map((s, i) => (
              <section key={i}>
                <h2 className="mb-3 text-lg font-semibold">{t(s.heading)}</h2>

                {s.paragraphs?.map((p, j) => (
                  <p key={j} className="mb-3 leading-relaxed text-muted last:mb-0">
                    {t(p)}
                  </p>
                ))}

                {s.bullets ? (
                  <ul className="mt-2 flex flex-col gap-2">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2.5 leading-relaxed text-muted">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{t(b)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

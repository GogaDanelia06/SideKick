"use client";

import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { STORY } from "@/lib/content/home";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

/** Admin-editable via `story_title` / `story_body`; falls back to the shipped
 *  copy when unset. The body splits on blank lines into paragraphs. */
export function Story({ title, body }: { title?: Bilingual; body?: Bilingual }) {
  const { t } = useLanguage();

  const heading = title ?? STORY.heading;
  const paragraphs = body
    ? t(body)
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : STORY.paragraphs.map((p) => t(p));

  return (
    <section className="pb-16 pt-8">
      <Container>
        <Card className="rounded-lg p-6 text-center sm:p-10">
          <h2 className="mb-4 text-3xl font-semibold leading-snug tracking-[-0.01em]">
            {t(heading)}
          </h2>
          {paragraphs.map((p, i) => (
            <p key={i} className={clsx("text-base leading-[1.8] text-muted", i > 0 && "mt-3")}>
              {p}
            </p>
          ))}
        </Card>
      </Container>
    </section>
  );
}

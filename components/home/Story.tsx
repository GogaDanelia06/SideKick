"use client";

import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { STORY } from "@/lib/content/home";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Founders' story card. */
export function Story() {
  const { t } = useLanguage();

  return (
    <section className="pb-16 pt-8">
      <Container>
        <Card className="rounded-lg p-6 text-center sm:p-10">
          <h2 className="mb-4 text-3xl font-semibold leading-snug tracking-[-0.01em]">
            {t(STORY.heading)}
          </h2>
          {STORY.paragraphs.map((p, i) => (
            <p
              key={i}
              className={clsx("text-base leading-[1.8] text-muted", i > 0 && "mt-3")}
            >
              {t(p)}
            </p>
          ))}
        </Card>
      </Container>
    </section>
  );
}

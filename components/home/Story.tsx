"use client";

import Link from "next/link";
import clsx from "clsx";
import { IconArrowRight } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { STORY } from "@/lib/content/home";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

/** Landing story block: the whole card links to /about; title and body fall back to built-in copy. */
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
        <Link
          href={ROUTES.about}
          className="group block w-full rounded-md border border-border bg-card p-6 text-center transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:p-10"
        >
          <h2 className="mb-4 text-3xl font-semibold leading-snug tracking-[-0.01em]">
            {t(heading)}
          </h2>

          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={clsx(
                "text-justify text-base leading-[1.8] text-muted",
                i > 0 && "mt-3",
              )}
            >
              {p}
            </p>
          ))}

          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {t({ ka: "ჩვენ შესახებ", en: "About us" })}
            <IconArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      </Container>
    </section>
  );
}

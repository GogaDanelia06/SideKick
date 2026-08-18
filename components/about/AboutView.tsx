"use client";

import Link from "next/link";
import { IconPhoto } from "@tabler/icons-react";

import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { ABOUT } from "@/lib/content/about";
import type { Bilingual } from "@/lib/content/types";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ROUTES } from "@/lib/routes";

const TRY_FREE = {
  ka: "სცადე უფასოდ",
  en: "Try for free",
} as const;

export function AboutView({
  title,
  body,
  imageUrl,
}: {
  title?: Bilingual;
  body?: Bilingual;
  imageUrl?: string | null;
}) {
  const { t } = useLanguage();

  const paragraphs = body
    ? t(body)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : null;

  return (
    <section className="pb-16 pt-[60px]">
      <Container className="max-w-[920px]">
        {/* Left, not centred, and one line rather than two.
            The break was hard-coded into the copy, which meant the eyebrow sat
            centred over a two-line heading and lined up with neither of its
            edges. Ranged left they share a margin, and the heading is set small
            enough to hold on a single line at desktop width — where a stacked
            title was reading as two separate thoughts. */}
        <div className="mb-9">
          <Badge>{t(ABOUT.badge)}</Badge>
          <h1 className="mt-3 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[34px] md:leading-[1.15]">
            {title ? t(title) : `${t(ABOUT.title[0])} ${t(ABOUT.title[1])}`}
          </h1>
        </div>

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={t(ABOUT.photoCaption)}
            className="mb-9 h-[300px] w-full rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="mb-9 grid h-[300px] place-items-center rounded-lg border border-border text-muted [background-image:linear-gradient(135deg,var(--card),var(--card2))]">
            <div className="text-center">
              <IconPhoto size={40} />
              <div className="mt-2 text-[13px]">{t(ABOUT.photoCaption)}</div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-[18px] text-base leading-[1.85] text-muted">
          {paragraphs
            ? paragraphs.map((p, i) => <p key={i}>{p}</p>)
            : ABOUT.paragraphs.map((p, i) => (
                <p key={i}>
                  {p.strong ? (
                    <b className="font-semibold text-ink">{t(p.strong)} </b>
                  ) : null}
                  {t(p.text)}
                </p>
              ))}
        </div>

        <div className="mt-8">
          <Link
            href={ROUTES.try}
            className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-white transition hover:opacity-90"
          >
            {t(TRY_FREE)}
          </Link>
        </div>
      </Container>
    </section>
  );
}

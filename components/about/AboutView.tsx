"use client";

import { IconPhoto, IconUsers } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { ABOUT } from "@/lib/content/about";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

/**
 * The About page. Every piece of copy here can be replaced from the admin
 * panel; when it hasn't been, the drafted text in lib/content/about.ts shows
 * instead — so the page is never blank and never needs a deploy to change.
 */
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

  // Paragraphs are separated by a blank line, the same convention the legal
  // sections use, so an admin only has to learn it once.
  const paragraphs = body
    ? t(body)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : null;

  return (
    <section className="pb-16 pt-[60px]">
      <Container className="max-w-[920px]">
        <div className="mb-9 text-center">
          <Badge icon={IconUsers}>{t(ABOUT.badge)}</Badge>
          <h1 className="mt-3.5 text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[40px]">
            {title ? (
              t(title)
            ) : (
              <>
                {t(ABOUT.title[0])}
                <br />
                {t(ABOUT.title[1])}
              </>
            )}
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
                  {p.strong ? <b className="font-semibold text-ink">{t(p.strong)} </b> : null}
                  {t(p.text)}
                </p>
              ))}
        </div>
      </Container>
    </section>
  );
}

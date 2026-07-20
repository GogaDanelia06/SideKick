"use client";

import { IconPhoto, IconUsers } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { ABOUT } from "@/lib/content/about";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function AboutView() {
  const { t } = useLanguage();

  return (
    <section className="pb-16 pt-[60px]">
      <Container className="max-w-[920px]">
        <div className="mb-9 text-center">
          <Badge icon={IconUsers}>{t(ABOUT.badge)}</Badge>
          <h1 className="mt-3.5 text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[40px]">
            {t(ABOUT.title[0])}
            <br />
            {t(ABOUT.title[1])}
          </h1>
        </div>

        <div className="mb-9 grid h-[300px] place-items-center rounded-lg border border-border text-muted [background-image:linear-gradient(135deg,var(--card),var(--card2))]">
          <div className="text-center">
            <IconPhoto size={40} />
            <div className="mt-2 text-[13px]">{t(ABOUT.photoCaption)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-[18px] text-base leading-[1.85] text-muted">
          {ABOUT.paragraphs.map((p, i) => (
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

"use client";

import { IconArrowRight, IconGift } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ACTIONS } from "@/lib/content/common";
import { CTA_BANNER } from "@/lib/content/home";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";
import { track } from "@/lib/analytics/track";

export type CtaContent = {
  badge?: Bilingual;
  title?: Bilingual;
  text?: Bilingual;
  button?: Bilingual;
  url?: string;
};

/**
 * Admin-editable via the `cta_*` keys; every field independently falls back to
 * the shipped copy, so a half-filled form still renders correctly.
 *
 * The button defaults to /start, which decides where to send the visitor based
 * on whether they are signed in — see app/start/page.tsx. An admin can point it
 * anywhere else by filling `cta_url`.
 */
export function CtaBanner({ content = {} }: { content?: CtaContent }) {
  const { t } = useLanguage();

  return (
    <section className="pb-16">
      <Container>
        <div className="rounded-lg border border-blue-ring bg-card px-6 py-8 text-center sm:px-10">
          <div className="mb-4 text-left">
            <Badge icon={IconGift}>{t(content.badge ?? CTA_BANNER.badge)}</Badge>
          </div>
          <h2 className="mb-3 text-3xl font-semibold leading-snug tracking-[-0.01em]">
            {t(content.title ?? CTA_BANNER.title)}
          </h2>
          <p className="mx-auto mb-6 max-w-[620px] text-muted">
            {t(content.text ?? CTA_BANNER.text)}
          </p>
          <Button href={content.url || ROUTES.start} onClick={() => track("dashboard_button_click")}>
            <IconArrowRight size={18} />
            {t(content.button ?? ACTIONS.learnMore)}
          </Button>
        </div>
      </Container>
    </section>
  );
}

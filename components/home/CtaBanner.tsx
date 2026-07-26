"use client";

import { IconArrowRight, IconGift } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ACTIONS } from "@/lib/content/common";
import { CTA_BANNER } from "@/lib/content/home";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section className="pb-16">
      <Container>
        <div className="rounded-lg border border-blue-ring bg-card px-6 py-8 text-center sm:px-10">
          <div className="mb-4 text-left">
            <Badge icon={IconGift}>{t(CTA_BANNER.badge)}</Badge>
          </div>
          <h2 className="mb-3 text-3xl font-semibold leading-snug tracking-[-0.01em]">
            {t(CTA_BANNER.title)}
          </h2>
          <p className="mx-auto mb-6 max-w-[620px] text-muted">{t(CTA_BANNER.text)}</p>
          <Button href={ROUTES.pricing}>
            <IconArrowRight size={18} />
            {t(ACTIONS.learnMore)}
          </Button>
        </div>
      </Container>
    </section>
  );
}

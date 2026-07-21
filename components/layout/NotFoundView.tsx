"use client";

import { IconArrowLeft, IconMessage } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { NOT_FOUND } from "@/lib/content/notFound";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Branded 404 body — bilingual, with a way back into the site. */
export function NotFoundView() {
  const { t } = useLanguage();

  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-[620px] text-center">
          <div className="mb-3 font-mono text-[64px] font-semibold leading-none text-blue sm:text-[88px]">
            {NOT_FOUND.code}
          </div>
          <h1 className="mb-3 text-3xl font-semibold leading-snug tracking-[-0.01em]">
            {t(NOT_FOUND.title)}
          </h1>
          <p className="mx-auto mb-8 max-w-[520px] text-muted">{t(NOT_FOUND.text)}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href={ROUTES.home}>
              <IconArrowLeft size={18} />
              {t(NOT_FOUND.home)}
            </Button>
            <Button href={ROUTES.contact} variant="outline">
              <IconMessage size={18} />
              {t(NOT_FOUND.contact)}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

"use client";

import { useEffect } from "react";
import { IconAlertTriangle, IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ERROR_PAGE } from "@/lib/content/errorPage";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error("[error-boundary]", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-[620px] text-center">
          <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full border border-amber bg-amber-surface text-amber">
            <IconAlertTriangle size={26} />
          </span>

          <h1 className="mb-3 text-3xl font-semibold leading-snug tracking-[-0.01em]">
            {t(ERROR_PAGE.title)}
          </h1>
          <p className="mx-auto mb-8 max-w-[520px] text-muted">{t(ERROR_PAGE.text)}</p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-[18px] text-sm font-medium text-white hover:bg-primary-hover"
            >
              <IconRefresh size={18} />
              {t(ERROR_PAGE.retry)}
            </button>
            <Button href={ROUTES.home} variant="outline">
              <IconArrowLeft size={18} />
              {t(ERROR_PAGE.home)}
            </Button>
          </div>

          {error.digest ? (
            <p className="mt-8 text-xs text-faint">
              {t(ERROR_PAGE.idLabel)}: <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

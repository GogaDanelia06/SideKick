"use client";

import type { ReactNode } from "react";
import { IconRocket } from "@tabler/icons-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_FRAME } from "./mocks/registry";
import { ACTIONS } from "@/lib/content/common";
import type { HeroSlide as Slide } from "@/lib/content/hero";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ROUTES } from "@/lib/routes";

export function HeroSlide({
  slide,
  mock,
}: {
  slide: Slide;
  mock: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="grid h-full animate-[fadeUp_0.4s_ease] items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
      <div className="max-h-[390px] overflow-y-auto">
        {slide.badge && (
          <Badge>
            {t(slide.badge.text)}
          </Badge>
        )}

        <h1 className="my-[18px] text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[46px]">
          {t(slide.title.pre)}{" "}
          <em className="not-italic text-green">
            {t(slide.title.em)}
          </em>

          {slide.title.post && (
            <>
              <br />
              {t(slide.title.post)}
            </>
          )}
        </h1>

        <p className="max-w-[520px] text-[17px] text-muted">
          {t(slide.sub)}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={ROUTES.try}>
            <IconRocket size={18} />
            {t(ACTIONS.tryFree)}
          </Button>

          <Button href={ROUTES.pricing} variant="outline">
            {t(ACTIONS.learnMore)}
          </Button>
        </div>
      </div>

      <div className="flex h-[300px] items-center justify-center overflow-hidden md:h-[360px]">
        <div className={MOCK_FRAME}>
          {mock}
        </div>
      </div>
    </div>
  );
}
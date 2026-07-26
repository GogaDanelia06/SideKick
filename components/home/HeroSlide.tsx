"use client";

import type { ReactNode } from "react";
import { IconRocket } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ACTIONS } from "@/lib/content/common";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { HeroSlide as Slide } from "@/lib/content/hero";

export function HeroSlide({ slide, mock }: { slide: Slide; mock: ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="grid animate-[fadeUp_0.4s_ease] items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
      <div>
        {slide.badge ? <Badge icon={slide.badge.icon}>{t(slide.badge.text)}</Badge> : null}
        <h1 className="my-[18px] text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[46px]">
          {t(slide.title.pre)}{" "}
          <em className="not-italic text-green">{t(slide.title.em)}</em>
          {slide.title.post ? (
            <>
              <br />
              {t(slide.title.post)}
            </>
          ) : null}
        </h1>
        <p className="max-w-[520px] text-[17px] text-muted">{t(slide.sub)}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={ROUTES.register}>
            <IconRocket size={18} />
            {t(ACTIONS.tryFree)}
          </Button>
          <Button href={ROUTES.pricing} variant="outline">
            {t(ACTIONS.learnMore)}
          </Button>
        </div>
      </div>
      <div>{mock}</div>
    </div>
  );
}

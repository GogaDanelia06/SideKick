"use client";

import { IconArrowRight, IconRocket } from "@tabler/icons-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ACTIONS } from "@/lib/content/common";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { HeroSlideView } from "@/lib/site/content";

import { HeroTitle } from "./HeroTitle";
import { SlidePanel } from "./SlidePanel";

export function DbHeroSlide({ slide }: { slide: HeroSlideView }) {
  const { t } = useLanguage();

  return (
    <div className="grid h-full animate-[fadeUp_0.4s_ease] items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
      <div className="md:max-h-[390px] md:overflow-y-auto">
        {slide.badge && <Badge>{t(slide.badge)}</Badge>}

        <HeroTitle text={t(slide.title)} />

        <p className="max-w-[520px] whitespace-pre-line text-[17px] text-muted">{t(slide.text)}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={ROUTES.try}>
            <IconRocket size={18} />
            {t(ACTIONS.tryFree)}
          </Button>

          <Button href={slide.ctaUrl} variant="outline">
            <IconArrowRight size={18} />
            {slide.ctaLabel ? t(slide.ctaLabel) : t(ACTIONS.learnMore)}
          </Button>
        </div>
      </div>

      <SlidePanel slide={slide} />
    </div>
  );
}

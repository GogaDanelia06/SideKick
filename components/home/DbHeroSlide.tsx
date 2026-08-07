"use client";

import {
  IconArrowRight,
  IconRocket,
  IconSparkles,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ACTIONS } from "@/lib/content/common";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { HeroSlideView } from "@/lib/site/content";

import { AnimatedStat } from "./AnimatedStat";
import { MOCKS, mockKey } from "./mocks/registry";

const FRAME =
  "flex h-[300px] w-full items-center justify-center overflow-hidden " +
  "rounded-lg border border-border bg-card md:h-[360px]";

function Title({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);

  return (
    <h1 className="my-[18px] text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[46px]">
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className="not-italic text-green">
            {part.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </h1>
  );
}

function Panel({ slide }: { slide: HeroSlideView }) {
  if (slide.mediaUrl) {
    return (
      <div className={FRAME}>
        {slide.mediaType === "video" ? (
          <video
            src={slide.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <img
            src={slide.mediaUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        )}
      </div>
    );
  }

  const key = mockKey(slide.mock);

  if (key) {
    const Mock = MOCKS[key];

    return (
      <div className={FRAME}>
        <div className="w-full">
          <Mock />
        </div>
      </div>
    );
  }

  if (slide.stats.length > 0) {
    return (
      <div className={`${FRAME} p-5`}>
        <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3">
          {slide.stats.map((stat, i) => (
            <AnimatedStat key={i} stat={stat} />
          ))}
        </div>
      </div>
    );
  }

  return <div className={FRAME} />;
}

export function DbHeroSlide({ slide }: { slide: HeroSlideView }) {
  const { t } = useLanguage();

  return (
    <div className="grid h-full animate-[fadeUp_0.4s_ease] items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
      <div className="max-h-[390px] overflow-y-auto">
        {slide.badge && (
          <Badge icon={IconSparkles}>{t(slide.badge)}</Badge>
        )}

        <Title text={t(slide.title)} />

        <p className="max-w-[520px] whitespace-pre-line text-[17px] text-muted">
          {t(slide.text)}
        </p>

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

      <Panel slide={slide} />
    </div>
  );
}
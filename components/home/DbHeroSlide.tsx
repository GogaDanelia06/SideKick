"use client";

import {
  IconArrowRight,
  IconRocket,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ACTIONS } from "@/lib/content/common";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { HeroSlideView } from "@/lib/site/content";

import { AnimatedStat } from "./AnimatedStat";
import { MOCKS, MOCK_FRAME, mockKey } from "./mocks/registry";

const SHELL = "flex w-full items-center justify-center rounded-lg border border-border bg-card";

/**
 * For an uploaded photo or video.
 *
 * Keeps a fixed height so an unusually tall upload cannot push the rest of the
 * page down the screen. Nothing is lost to it: `object-contain` on the media
 * scales the whole picture to fit rather than cropping to fill.
 */
const MEDIA_FRAME = `${SHELL} h-[260px] overflow-hidden sm:h-[300px] md:h-[360px]`;

/**
 * For the built-in animations and the figure grid.
 *
 * A floor rather than a fixed height. These used to share the media frame, and
 * on a phone that meant a mock wanting 429px was given 300 and the remainder
 * was cut off — the bottom of the chat simply missing, with nothing to say so.
 * They are drawn at whatever size they need; the height only stops a short one
 * looking thin.
 */
const CONTENT_FRAME = `${SHELL} min-h-[260px] md:h-[360px] md:overflow-hidden`;

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
      <div className={MEDIA_FRAME}>
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
      <div className={CONTENT_FRAME}>
        <div className={MOCK_FRAME}>
          <Mock />
        </div>
      </div>
    );
  }

  if (slide.stats.length > 0) {
    return (
      <div className={`${CONTENT_FRAME} p-5`}>
        <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3">
          {slide.stats.map((stat, i) => (
            <AnimatedStat key={i} stat={stat} />
          ))}
        </div>
      </div>
    );
  }

  return <div className={CONTENT_FRAME} />;
}

export function DbHeroSlide({ slide }: { slide: HeroSlideView }) {
  const { t } = useLanguage();

  return (
    <div className="grid h-full animate-[fadeUp_0.4s_ease] items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
      {/* Capped only from `md` up, where the two columns sit side by side and a
          long slide would otherwise stretch the panel next to it. On a phone
          they are stacked and nothing is holding the other to a height, so the
          cap earns nothing and costs a scrollbar inside the headline. */}
      <div className="md:max-h-[390px] md:overflow-y-auto">
        {slide.badge && (
          <Badge>{t(slide.badge)}</Badge>
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
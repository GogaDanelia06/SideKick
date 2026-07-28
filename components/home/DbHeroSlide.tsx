"use client";

import { IconArrowRight, IconRocket, IconSparkles } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ACTIONS } from "@/lib/content/common";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AnimatedStat } from "./AnimatedStat";
import type { HeroSlideView } from "@/lib/site/content";

/**
 * Renders the title with `*…*` highlighted in the brand green, so an admin can
 * keep the two-tone headline of the original design from a plain text field.
 */
function Title({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <h1 className="my-[18px] text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[46px]">
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? (
          <em key={i} className="not-italic text-green">
            {p.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </h1>
  );
}

/** The right-hand panel: uploaded media, or the slide's animated figures. */
function Panel({ slide }: { slide: HeroSlideView }) {
  if (slide.mediaUrl) {
    return slide.mediaType === "video" ? (
      <video
        src={slide.mediaUrl}
        autoPlay
        muted
        loop
        playsInline
        className="w-full rounded-lg border border-border"
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slide.mediaUrl}
        alt=""
        className="w-full rounded-lg border border-border object-cover"
      />
    );
  }

  if (slide.stats.length > 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {slide.stats.map((s, i) => (
            <AnimatedStat key={i} stat={s} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function DbHeroSlide({ slide }: { slide: HeroSlideView }) {
  const { t } = useLanguage();

  return (
    <div className="grid animate-[fadeUp_0.4s_ease] items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
      <div>
        {slide.badge ? <Badge icon={IconSparkles}>{t(slide.badge)}</Badge> : null}
        <Title text={t(slide.title)} />
        <p className="max-w-[520px] whitespace-pre-line text-[17px] text-muted">{t(slide.text)}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={ROUTES.register}>
            <IconRocket size={18} />
            {t(ACTIONS.tryFree)}
          </Button>
          <Button href={slide.ctaUrl} variant="outline">
            <IconArrowRight size={18} />
            {slide.ctaLabel ? t(slide.ctaLabel) : t(ACTIONS.learnMore)}
          </Button>
        </div>
      </div>
      <div>
        <Panel slide={slide} />
      </div>
    </div>
  );
}

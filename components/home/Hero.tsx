"use client";

import clsx from "clsx";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { Container } from "@/components/ui/Container";
import { HERO_INTERVAL_MS, HERO_SLIDES } from "@/lib/content/hero";
import type { HeroSlideView, SiteStatView } from "@/lib/site/content";
import { useCarousel } from "@/hooks/useCarousel";

import { DbHeroSlide } from "./DbHeroSlide";
import { HeroDots } from "./HeroDots";
import { HeroSlide } from "./HeroSlide";
import { Stats } from "./Stats";
import { MOCKS } from "./mocks/registry";

function Arrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? IconChevronLeft : IconChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className={clsx(
        "absolute top-1/2 z-[3] hidden size-11 -translate-y-1/2",
        "place-items-center rounded-full border-2 border-input bg-card",
        "text-ink shadow-[0_4px_14px_rgba(0,0,0,0.25)] xl:grid",
        side === "left" ? "-left-16" : "-right-16",
      )}
    >
      <Icon size={22} />
    </button>
  );
}

export function Hero({
  stats,
  slides = [],
  intervalMs,
}: {
  stats: SiteStatView[];
  slides?: HeroSlideView[];
  intervalMs?: number;
}) {
  const useDb = slides.length > 0;
  const count = useDb ? slides.length : HERO_SLIDES.length;
  const carousel = useCarousel(count, intervalMs ?? HERO_INTERVAL_MS);
  const shipped = HERO_SLIDES[carousel.index];
  const Mock = shipped ? MOCKS[shipped.mock] : MOCKS.chat;

  return (
    <section className="pb-9 pt-[60px]">
      <Container>
        <div className="relative">
          {count > 1 && (
            <>
              <Arrow side="left" onClick={carousel.prev} />
              <Arrow side="right" onClick={carousel.next} />
            </>
          )}

          <div className="h-[620px] md:h-[430px]">
            {useDb ? (
              <DbHeroSlide slide={slides[carousel.index]!} />
            ) : (
              <HeroSlide slide={shipped} mock={<Mock />} />
            )}
          </div>
        </div>

        <Stats stats={stats} />

        <HeroDots
          count={count}
          index={carousel.index}
          onSelect={carousel.goTo}
        />
      </Container>
    </section>
  );
}
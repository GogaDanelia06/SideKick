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

function Stepper({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? IconChevronLeft : IconChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className={clsx(
        "grid size-9 shrink-0 place-items-center rounded-full",
        "border border-input bg-card text-ink xl:hidden",
      )}
    >
      <Icon size={18} />
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

          {/* A floor, not a ceiling. As a fixed height this squeezed the grid
              into exactly 620px on a phone — the panel was handed 300px for
              429px of content and the rest was cut off. `min-h` still stops the
              page jumping as slides of different lengths come and go, which is
              what the fixed height was for, while letting a tall slide finish. */}
          <div className="min-h-[620px] md:min-h-[430px]">
            {useDb ? (
              <DbHeroSlide slide={slides[carousel.index]!} />
            ) : (
              <HeroSlide slide={shipped} mock={<Mock />} />
            )}
          </div>
        </div>

        {/* Directly under the slides, above the figures.
            These used to sit below the stats strip, which put an unrelated row
            of numbers between a control and the thing it controls — a reader
            has no reason to connect an arrow to a carousel that ended two
            blocks earlier. */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {count > 1 && <Stepper side="left" onClick={carousel.prev} />}
          <HeroDots count={count} index={carousel.index} onSelect={carousel.goTo} />
          {count > 1 && <Stepper side="right" onClick={carousel.next} />}
        </div>

        <Stats stats={stats} />
      </Container>
    </section>
  );
}
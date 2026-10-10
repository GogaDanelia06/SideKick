"use client";

import clsx from "clsx";

import { Container } from "@/components/ui/Container";
import { HERO_INTERVAL_MS, HERO_SLIDES } from "@/lib/content/hero";
import type { HeroSlideView, SiteStatView } from "@/lib/site/content";
import { SLIDE_MS, useCarousel } from "@/hooks/useCarousel";

import { DbHeroSlide } from "./DbHeroSlide";
import { Arrow, Stepper } from "./HeroArrows";
import { HeroDots } from "./HeroDots";
import { HeroSlide } from "./HeroSlide";
import { Stats } from "./Stats";
import { MOCKS } from "./mocks/registry";

function ShippedSlide({ index }: { index: number }) {
  const slide = HERO_SLIDES[index]!;
  const Mock = MOCKS[slide.mock];

  return <HeroSlide slide={slide} mock={<Mock />} />;
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

  const track = carousel.looped
    ? [count - 1, ...Array.from({ length: count }, (_, i) => i), 0]
    : [0];

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

          <div className="min-h-[620px] overflow-hidden md:min-h-[430px]">
            <div
              className={clsx(
                "flex motion-reduce:transition-none",
                carousel.snapping ? "transition-none" : "transition-transform ease-out",
              )}
              style={{
                transform: `translateX(-${carousel.position * 100}%)`,
                transitionDuration: `${SLIDE_MS}ms`,
              }}
              onTransitionEnd={carousel.settle}
            >
              {track.map((slideIndex, slot) => (
                <div
                  key={slot}
                  className="w-full shrink-0"
                  {...(slot === carousel.position ? {} : { inert: true })}
                >
                  {useDb ? <DbHeroSlide slide={slides[slideIndex]!} /> : <ShippedSlide index={slideIndex} />}
                </div>
              ))}
            </div>
          </div>
        </div>

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

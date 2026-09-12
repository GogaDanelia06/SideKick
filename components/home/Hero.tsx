"use client";

import clsx from "clsx";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { Container } from "@/components/ui/Container";
import { HERO_INTERVAL_MS, HERO_SLIDES } from "@/lib/content/hero";
import type { HeroSlideView, SiteStatView } from "@/lib/site/content";
import { SLIDE_MS, useCarousel } from "@/hooks/useCarousel";

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

/** A built-in slide, used when the database has none. */
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

  /** Track order with the last slide cloned in front and the first behind, for seamless looping. */
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

          {/* Slides render side by side and the track moves; min-height is a floor so tall slides are not clipped. */}
          <div className="min-h-[620px] overflow-hidden md:min-h-[430px]">
            <div
              className={clsx(
                "flex motion-reduce:transition-none",
                carousel.snapping ? "transition-none" : "transition-transform ease-out",
              )}
              style={{
                transform: `translateX(-${carousel.position * 100}%)`,
                // Shares SLIDE_MS with the hook's settle timeout.
                transitionDuration: `${SLIDE_MS}ms`,
              }}
              onTransitionEnd={carousel.settle}
            >
              {track.map((slideIndex, slot) => (
                <div
                  key={slot}
                  className="w-full shrink-0"
                  // Off-screen slides and clones leave the tab order and the accessibility tree.
                  {...(slot === carousel.position ? {} : { inert: true })}
                >
                  {useDb ? (
                    <DbHeroSlide slide={slides[slideIndex]!} />
                  ) : (
                    <ShippedSlide index={slideIndex} />
                  )}
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
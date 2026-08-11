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

/**
 * One of the slides that ship in the code, for when the database has none.
 *
 * Split out only so the mock can be looked up and used as a component without a
 * function call in the middle of the markup.
 */
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

  /**
   * Which slide sits in each slot of the track.
   *
   * The last slide is copied to the front and the first to the back, so that
   * running off either end continues in the direction the visitor asked for
   * instead of rewinding across everything between. The hook puts the track
   * back on the real slide afterwards, silently.
   */
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

          {/* Every slide is on the page at once, side by side, and the strip is
              slid along. Rendering only the current one made a change a swap —
              the old slide vanished and the new one faded in where it stood —
              and no amount of easing on a replacement reads as movement. Here
              one genuinely travels out as the next travels in.

              A floor, not a ceiling. As a fixed height this squeezed the grid
              into exactly 620px on a phone — the panel was handed 300px for
              429px of content and the rest was cut off. */}
          <div className="min-h-[620px] overflow-hidden md:min-h-[430px]">
            <div
              className={clsx(
                "flex motion-reduce:transition-none",
                // Off while the track is being put back on the real slide after
                // a copy, so that reposition is instant and invisible.
                carousel.snapping ? "transition-none" : "transition-transform ease-out",
              )}
              style={{
                transform: `translateX(-${carousel.position * 100}%)`,
                // From the hook rather than a `duration-*` class, so the CSS and
                // the timeout that settles the track share one number.
                transitionDuration: `${SLIDE_MS}ms`,
              }}
              onTransitionEnd={carousel.settle}
            >
              {track.map((slideIndex, slot) => (
                <div
                  key={slot}
                  className="w-full shrink-0"
                  // Every slide is on the page, including the two copies and
                  // whatever is parked off-screen, and a button nobody can see
                  // is still one the keyboard will stop at. `inert` takes them
                  // out of the tab order and hides them from screen readers.
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
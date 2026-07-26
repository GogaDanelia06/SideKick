"use client";

import type { ComponentType } from "react";
import clsx from "clsx";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { HeroSlide } from "./HeroSlide";
import { HeroDots } from "./HeroDots";
import { Stats } from "./Stats";
import { ChatMock } from "./mocks/ChatMock";
import { DashboardMock } from "./mocks/DashboardMock";
import { TesterMock } from "./mocks/TesterMock";
import { HERO_INTERVAL_MS, HERO_SLIDES, type HeroMock } from "@/lib/content/hero";
import type { SiteStatView } from "@/lib/site/content";
import { useCarousel } from "@/hooks/useCarousel";

const MOCKS: Record<HeroMock, ComponentType> = {
  chat: ChatMock,
  dashboard: DashboardMock,
  tester: TesterMock,
};

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? IconChevronLeft : IconChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className={clsx(
        "absolute top-1/2 z-[3] hidden size-11 -translate-y-1/2 place-items-center rounded-full border-2 border-input bg-card text-ink shadow-[0_4px_14px_rgba(0,0,0,0.25)] xl:grid",
        side === "left" ? "-left-16" : "-right-16",
      )}
    >
      <Icon size={22} />
    </button>
  );
}

export function Hero({ stats }: { stats: SiteStatView[] }) {
  const { index, goTo, next, prev } = useCarousel(HERO_SLIDES.length, HERO_INTERVAL_MS);
  const slide = HERO_SLIDES[index];
  const Mock = MOCKS[slide.mock];

  return (
    <section className="pb-9 pt-[60px]">
      <Container>
        <div className="relative">
          <Arrow side="left" onClick={prev} />
          <Arrow side="right" onClick={next} />
          <HeroSlide slide={slide} mock={<Mock />} />
        </div>
        <Stats stats={stats} />
        <HeroDots count={HERO_SLIDES.length} index={index} onSelect={goTo} />
      </Container>
    </section>
  );
}

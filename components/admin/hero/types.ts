import type { HeroSlide, HeroSlideStat } from "@prisma/client";

export type SlideWithStats = HeroSlide & { stats: HeroSlideStat[] };

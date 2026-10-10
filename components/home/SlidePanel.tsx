import type { HeroSlideView } from "@/lib/site/content";

import { AnimatedStat } from "./AnimatedStat";
import { MOCKS, MOCK_FRAME, mockKey } from "./mocks/registry";

const SHELL = "flex w-full items-center justify-center rounded-lg border border-border bg-card";

const MEDIA_FRAME = `${SHELL} h-[260px] overflow-hidden sm:h-[300px] md:h-[360px]`;

const CONTENT_FRAME = `${SHELL} min-h-[260px] md:h-[360px] md:overflow-hidden`;

export function SlidePanel({ slide }: { slide: HeroSlideView }) {
  if (slide.mediaUrl) {
    return (
      <div className={MEDIA_FRAME}>
        {slide.mediaType === "video" ? (
          <video src={slide.mediaUrl} autoPlay muted loop playsInline className="h-full w-full object-contain" />
        ) : (
          <img src={slide.mediaUrl} alt="" className="h-full w-full object-contain" />
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

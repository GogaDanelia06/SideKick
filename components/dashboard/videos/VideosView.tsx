"use client";

import type { Video } from "@prisma/client";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function VideosView({ videos }: { videos: Video[] }) {
  const { t } = useLanguage();

  if (videos.length === 0) {
    return (
      <Panel className="px-6 py-12 text-center text-sm text-muted">
        {t({ ka: "ვიდეოები ჯერ არ არის", en: "No tutorials yet" })}
      </Panel>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v) => (
        <a
          key={v.id}
          href={v.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-[14px] border border-border bg-surface transition-colors hover:border-ai"
        >
          <div className="grid aspect-video place-items-center bg-soft">
            <span className="grid size-12 place-items-center rounded-full bg-ai text-white transition-transform group-hover:scale-110">
              <IconPlayerPlayFilled size={22} />
            </span>
          </div>
          <div className="p-4">
            <div className="text-sm font-medium">{v.title}</div>
            <div className="mt-1 text-xs text-muted">
              {t({ ka: "ნახე YouTube-ზე", en: "Watch on YouTube" })}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

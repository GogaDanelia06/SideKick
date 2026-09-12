"use client";

import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import type { TutorialView } from "@/lib/dashboard/tutorials";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function VideosView({ tutorials }: { tutorials: TutorialView[] }) {
  const { t } = useLanguage();

  if (tutorials.length === 0) {
    return (
      <Panel className="px-6 py-12 text-center text-sm text-muted">
        {t({ ka: "ვიდეო ინსტრუქციები ჯერ არ არის", en: "No tutorials yet" })}
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        {t({
          ka: "ხელსაწყოს გამოყენების ვიდეო სახელმძღვანელოები.",
          en: "Video guides for using the platform.",
        })}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((v) => (
          <a
            key={v.id}
            href={v.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface transition-colors hover:border-ai"
          >
            <div className="relative grid aspect-video place-items-center overflow-hidden bg-soft">
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <span className="relative grid size-12 place-items-center rounded-full bg-ai text-white transition-transform group-hover:scale-110">
                <IconPlayerPlayFilled size={22} />
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="text-sm font-medium">{t(v.title)}</div>
              {t(v.description) ? (
                <p className="mt-1 line-clamp-2 text-xs text-muted">{t(v.description)}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                {v.category ? (
                  <span className="rounded-full border border-border bg-soft px-2 py-0.5">
                    {t(v.category)}
                  </span>
                ) : null}
                <span>{t({ ka: "ნახე YouTube-ზე", en: "Watch on YouTube" })}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

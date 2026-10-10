"use client";

import { IconTrash, IconVideo } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function MediaPreview({ url, isVideo, onClear }: { url: string; isVideo: boolean; onClear: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="mb-2 flex items-center gap-3 rounded-[8px] border border-border bg-soft p-2">
      {isVideo ? (
        <span className="grid size-14 shrink-0 place-items-center rounded-[6px] bg-canvas text-muted">
          <IconVideo size={22} />
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-14 shrink-0 rounded-[6px] object-cover" />
      )}
      <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{url}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={t("admin.mediaField.remove")}
        className="grid size-8 shrink-0 place-items-center rounded-[7px] border border-border text-red hover:border-red"
      >
        <IconTrash size={15} />
      </button>
    </div>
  );
}

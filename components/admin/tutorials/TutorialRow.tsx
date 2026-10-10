"use client";

import type { Tutorial } from "@prisma/client";
import { RowTools, type RowLabels } from "@/components/admin/ui/RowTools";
import { youtubeThumbnail } from "@/lib/dashboard/youtube";

const TOOLS: RowLabels = {
  up: "admin.tutorials.editor.moveUp",
  down: "admin.tutorials.editor.moveDown",
  toggle: "admin.tutorials.editor.togglePublish",
  edit: "admin.tutorials.editor.edit",
  remove: "admin.tutorials.editor.delete",
};

export function TutorialRow({
  video,
  first,
  last,
  pending,
  onMove,
  onToggle,
  onEdit,
  onRemove,
}: {
  video: Tutorial;
  first: boolean;
  last: boolean;
  pending: boolean;
  onMove: (direction: "up" | "down") => void;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const thumb = youtubeThumbnail(video.youtubeUrl);

  return (
    <div className="flex items-start gap-3">
      <span className="hidden h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-[6px] bg-soft sm:grid">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="size-full object-cover" loading="lazy" />
        ) : null}
      </span>

      <div className="min-w-0 flex-1">
        <div className={video.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
          {video.titleKa}
        </div>
        {video.descKa ? (
          <div className="mt-0.5 truncate text-[13px] text-muted">{video.descKa}</div>
        ) : null}
        <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-[11px] text-faint hover:text-ink">
          {video.youtubeUrl}
        </a>
      </div>

      <RowTools
        first={first}
        last={last}
        pending={pending}
        published={video.published}
        labels={TOOLS}
        onMove={onMove}
        onToggle={onToggle}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    </div>
  );
}

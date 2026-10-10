"use client";

import type { ChannelType } from "@prisma/client";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { CHANNEL_NAMES } from "@/lib/dashboard/channels";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { BRANDS } from "./guideConfig";

export function GuideHeader({
  type,
  published,
  pending,
  onToggle,
}: {
  type: ChannelType;
  published: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  const { Icon: Brand, color } = BRANDS[type];

  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-soft" style={{ color }}>
        <Brand size={20} />
      </span>
      <span className="flex-1 font-semibold">{CHANNEL_NAMES[type]}</span>

      <button
        type="button"
        disabled={pending}
        onClick={onToggle}
        aria-label={t("admin.tutorials.channelGuidesEditor.togglePublish")}
        className="grid size-8 shrink-0 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40"
      >
        {published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
      </button>
    </div>
  );
}

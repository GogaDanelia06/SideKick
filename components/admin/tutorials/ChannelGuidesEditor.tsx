"use client";

import type { ChannelGuide } from "@prisma/client";
import { CHANNEL_TYPES } from "@/lib/dashboard/channels";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { GuideForm } from "./GuideForm";

export function ChannelGuidesEditor({ guides }: { guides: ChannelGuide[] }) {
  const { t } = useLanguage();
  const byType = new Map(guides.map((g) => [g.type, g]));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-faint">{t("admin.tutorials.channelGuidesEditor.theseAppearNextTo")}</p>

      {CHANNEL_TYPES.map((type) => (
        <GuideForm key={type} type={type} guide={byType.get(type)} />
      ))}
    </div>
  );
}

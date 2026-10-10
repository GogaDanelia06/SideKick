"use client";

import type { ChannelType } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";

const START: Partial<Record<ChannelType, string>> = {
  FACEBOOK: "/api/channels/facebook/start",
  INSTAGRAM: "/api/channels/instagram/start",
};

export function ConnectButton({ type, relink = false }: { type: ChannelType; relink?: boolean }) {
  const { t } = useLanguage();
  const href = START[type];

  if (relink && !href) return null;

  if (!href) {
    return (
      <button
        type="button"
        disabled
        title={t("dashboard.channels.connectMeta.noSignInFlow")}
        className="h-9 cursor-not-allowed rounded-[8px] border border-border px-4 text-sm font-medium text-muted opacity-60"
      >
        {t("dashboard.channels.connectMeta.connect")}
      </button>
    );
  }

  if (relink) {
    return (
      <a
        href={href}
        title={t("dashboard.channels.connectMeta.walksThroughMetaS")}
        className="inline-flex h-9 items-center rounded-[8px] border border-border px-3 text-[13px] font-medium text-muted hover:text-ink"
      >
        {t("dashboard.channels.connectMeta.reconnect")}
      </a>
    );
  }

  return (
    <a href={href} className="inline-flex h-9 items-center rounded-[8px] bg-primary px-4 text-sm font-medium text-white">
      {t("dashboard.channels.connectMeta.connect")}
    </a>
  );
}

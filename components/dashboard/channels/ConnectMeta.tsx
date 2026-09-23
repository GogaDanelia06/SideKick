"use client";

import { useSearchParams } from "next/navigation";
import type { ChannelType } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

/** Per-channel connect links: Facebook Login and Instagram Login are separate full-page OAuth flows. */
const START: Partial<Record<ChannelType, string>> = {
  FACEBOOK: "/api/channels/facebook/start",
  INSTAGRAM: "/api/channels/instagram/start",
};

const RESULTS: Record<string, { tone: "ok" | "bad"; text: Text }> = {
  connected: { tone: "ok", text: "dashboard.channels.connectMeta.connected" },
  connected_no_ig: {
    tone: "ok",
    text: "dashboard.channels.connectMeta.text",
  },
  unconfigured_ig: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text2",
  },
  long_lived: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text3",
  },
  no_account: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text4",
  },
  not_subscribed: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text5",
  },
  cancelled: { tone: "bad", text: "dashboard.channels.connectMeta.connectionCancelled" },
  forbidden: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text6",
  },
  limit: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text7",
  },
  already_linked: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text8",
  },
  no_page: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text9",
  },
  many_pages: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text10",
  },
  bad_state: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text11",
  },
  signed_out: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text12",
  },
  unconfigured: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text13",
  },
  exchange: {
    tone: "bad",
    text: "dashboard.channels.connectMeta.text14",
  },
  failed: { tone: "bad", text: "dashboard.channels.connectMeta.thatDidNotWork" },
};

/** Shown once, under the row whose connection was last attempted. */
export function ConnectResult({ type }: { type: ChannelType }) {
  const { t } = useLanguage();
  const params = useSearchParams();
  const result = RESULTS[params.get("connect") ?? ""];
  if (!result || params.get("channel") !== type) return null;

  return (
    <p className={`w-full text-[13px] ${result.tone === "ok" ? "text-green" : "text-red"}`}>
      {t(result.text)}
    </p>
  );
}

export function ConnectButton({ type, relink = false }: { type: ChannelType; relink?: boolean }) {
  const { t } = useLanguage();
  const href = START[type];

  if (relink && !href) return null;

  // No OAuth flow for this channel yet: show a disabled button.
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
    <a
      href={href}
      className="inline-flex h-9 items-center rounded-[8px] bg-primary px-4 text-sm font-medium text-white"
    >
      {t("dashboard.channels.connectMeta.connect")}
    </a>
  );
}

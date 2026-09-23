"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";

/** Three states: connected, switched on but never authorised, or off. */
export function ChannelStatus({ connected, linked }: { connected: boolean; linked: boolean }) {
  const { t } = useLanguage();

  const [tone, label] = !connected
    ? (["bg-soft text-muted", "dashboard.channels.status.disconnected"] as const)
    : linked
      ? (["bg-green-surface text-green", "dashboard.channels.status.connected"] as const)
      : (["bg-amber-surface text-amber", "dashboard.channels.status.needsAuthorising"] as const);

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{t(label)}</span>
  );
}

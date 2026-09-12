"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";

/** Three states: connected, switched on but never authorised, or off. */
export function ChannelStatus({ connected, linked }: { connected: boolean; linked: boolean }) {
  const { t } = useLanguage();

  const [tone, label] = !connected
    ? ["bg-soft text-muted", { ka: "გათიშულია", en: "Disconnected" }]
    : linked
      ? ["bg-green-surface text-green", { ka: "დაკავშირებულია", en: "Connected" }]
      : ["bg-amber-surface text-amber", { ka: "ავტორიზაცია საჭიროა", en: "Needs authorising" }];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{t(label)}</span>
  );
}

"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";

/**
 * The badge on a channel row.
 *
 * Three states, not two, and the third is the whole reason this exists. A
 * channel can be switched on while holding no credential at all — that is the
 * state every business is provisioned in — and the badge used to read
 * "Connected" for it, in green, indistinguishable from a channel that was
 * genuinely answering customers.
 *
 * It cost days. Instagram messages were being dropped for want of an account
 * id, and the one screen anybody checks said everything was fine. Naming the
 * state is the fix: "switched on, but never authorised" is a sentence a
 * merchant can act on, and it points at the button sitting next to it.
 */
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

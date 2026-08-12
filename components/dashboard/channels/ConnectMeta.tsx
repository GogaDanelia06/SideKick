"use client";

import { useSearchParams } from "next/navigation";
import type { ChannelType } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

/**
 * The per-channel "connect" control.
 *
 * One button per row rather than one for both, because Facebook and Instagram
 * turned out to be two separate authorisations here: Messenger runs on Facebook
 * Login with a Page token, while this Instagram account runs on **Instagram
 * Login**, which has its own app credentials and its own token. A single button
 * would promise something neither grant delivers.
 *
 * A plain link, not a fetch — the flow is a full-page redirect out to Meta and
 * back, and an XHR cannot carry someone through a consent screen.
 */
const START: Partial<Record<ChannelType, string>> = {
  FACEBOOK: "/api/channels/instagram/start",
};

const RESULTS: Record<string, { tone: "ok" | "bad"; text: Bilingual }> = {
  connected: { tone: "ok", text: { ka: "დაკავშირდა.", en: "Connected." } },
  connected_no_ig: {
    tone: "ok",
    text: {
      ka: "Facebook დაკავშირდა. Instagram ცალკე უნდა დაუკავშირდეს.",
      en: "Facebook connected. Instagram connects separately.",
    },
  },
  cancelled: { tone: "bad", text: { ka: "დაკავშირება შეწყდა.", en: "Connection cancelled." } },
  no_page: {
    tone: "bad",
    text: {
      ka: "გვერდი არ მოგვცემია. თანხმობის ეკრანზე აირჩიე ის გვერდი, რომელიც გინდა.",
      en: "No Page was granted. Pick the Page you want on Meta's consent screen.",
    },
  },
  many_pages: {
    tone: "bad",
    text: {
      ka: "ერთზე მეტი გვერდი მოგვეცი. თავიდან სცადე და მხოლოდ ერთი აირჩიე.",
      en: "More than one Page was granted. Try again and pick just one.",
    },
  },
  bad_state: {
    tone: "bad",
    text: {
      ka: "მოთხოვნა ვერ დადასტურდა. დაიწყე თავიდან.",
      en: "That request could not be verified. Please start again.",
    },
  },
  signed_out: {
    tone: "bad",
    text: { ka: "სესია ამოიწურა. შედი და სცადე თავიდან.", en: "Your session expired. Sign in again." },
  },
  unconfigured: {
    tone: "bad",
    text: { ka: "META_APP_ID არ არის მითითებული.", en: "META_APP_ID is not set." },
  },
  exchange: {
    tone: "bad",
    text: { ka: "Meta-მ კოდი არ მიიღო. სცადე თავიდან.", en: "Meta rejected the code. Try again." },
  },
  failed: { tone: "bad", text: { ka: "ვერ მოხერხდა.", en: "That did not work." } },
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

export function ConnectButton({ type }: { type: ChannelType }) {
  const { t } = useLanguage();
  const href = START[type];

  // No authorisation flow for this channel yet. Shown rather than hidden so the
  // row does not look broken, and disabled rather than dead-linked so nobody is
  // sent to a consent screen that cannot complete.
  if (!href) {
    return (
      <button
        type="button"
        disabled
        title={t({
          ka: "ავტორიზაცია ჯერ არ არის გამართული ამ არხისთვის",
          en: "No sign-in flow is set up for this channel yet",
        })}
        className="h-9 cursor-not-allowed rounded-[8px] border border-border px-4 text-sm font-medium text-muted opacity-60"
      >
        {t({ ka: "დაკავშირება", en: "Connect" })}
      </button>
    );
  }

  return (
    <a
      href={href}
      className="inline-flex h-9 items-center rounded-[8px] bg-primary px-4 text-sm font-medium text-white"
    >
      {t({ ka: "დაკავშირება", en: "Connect" })}
    </a>
  );
}

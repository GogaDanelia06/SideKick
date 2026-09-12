"use client";

import { useSearchParams } from "next/navigation";
import type { ChannelType } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

/** Per-channel connect links: Facebook Login and Instagram Login are separate full-page OAuth flows. */
const START: Partial<Record<ChannelType, string>> = {
  FACEBOOK: "/api/channels/facebook/start",
  INSTAGRAM: "/api/channels/instagram/start",
};

const RESULTS: Record<string, { tone: "ok" | "bad"; text: Bilingual }> = {
  connected: { tone: "ok", text: { ka: "დაკავშირდა.", en: "Connected." } },
  connected_no_ig: {
    tone: "ok",
    text: {
      ka: "Facebook დაკავშირდა. ამ გვერდს Instagram მიბმული არ აქვს — Instagram ცალკე დააკავშირე.",
      en: "Facebook connected. This Page has no Instagram account linked — connect Instagram separately.",
    },
  },
  unconfigured_ig: {
    tone: "bad",
    text: { ka: "INSTAGRAM_APP_ID არ არის მითითებული.", en: "INSTAGRAM_APP_ID is not set." },
  },
  long_lived: {
    tone: "bad",
    text: {
      ka: "Instagram-მა გრძელვადიანი ტოკენი არ გასცა. სცადე თავიდან.",
      en: "Instagram would not issue a long-lived token. Try again.",
    },
  },
  no_account: {
    tone: "bad",
    text: {
      ka: "Instagram-ის ანგარიში ვერ წავიკითხეთ. დარწმუნდი, რომ ანგარიში პროფესიულია.",
      en: "Could not read the Instagram account. Check that it is a professional account.",
    },
  },
  not_subscribed: {
    tone: "bad",
    text: {
      ka: "ანგარიში დაუკავშირდა, მაგრამ Meta-მ მესიჯებზე გამოწერა არ დაუშვა. სცადე თავიდან.",
      en: "The account linked, but Meta refused the messages subscription. Try again.",
    },
  },
  cancelled: { tone: "bad", text: { ka: "დაკავშირება შეწყდა.", en: "Connection cancelled." } },
  forbidden: {
    tone: "bad",
    text: {
      ka: "არხების მართვის უფლება არ გაქვს. მიმართე ბიზნესის მფლობელს.",
      en: "You do not have permission to manage channels. Ask the business owner.",
    },
  },
  limit: {
    tone: "bad",
    text: {
      ka: "შენი გეგმა მეტ არხს არ უშვებს. ჯერ სხვა გამორთე ან გეგმა შეცვალე.",
      en: "Your plan does not allow another channel. Turn one off first, or change the plan.",
    },
  },
  already_linked: {
    tone: "bad",
    text: {
      ka: "ეს ანგარიში სხვა ბიზნესზეა უკვე მიბმული.",
      en: "That account is already linked to another business.",
    },
  },
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

  if (relink) {
    return (
      <a
        href={href}
        title={t({
          ka: "ხელახლა გაატარებს Meta-ს თანხმობის ეკრანზე და ახალ ტოკენს აიღებს",
          en: "Walks through Meta's consent screen again and takes a fresh token",
        })}
        className="inline-flex h-9 items-center rounded-[8px] border border-border px-3 text-[13px] font-medium text-muted hover:text-ink"
      >
        {t({ ka: "ხელახლა დაკავშირება", en: "Reconnect" })}
      </a>
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

"use client";

import { useSearchParams } from "next/navigation";
import { IconBrandFacebook } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

/**
 * Starts the Meta grant, and reports how the last one went.
 *
 * One button for both surfaces because one grant covers both: Instagram
 * messaging runs on the Messenger Platform, so the credential that comes back
 * is the Page Access Token either way. Asking twice would be asking for the
 * same thing twice.
 *
 * A plain link rather than a fetch — the flow is a full-page redirect out to
 * Facebook and back, and an XHR cannot carry someone through a consent screen.
 */
const RESULTS: Record<string, { tone: "ok" | "bad"; text: Bilingual }> = {
  connected: {
    tone: "ok",
    text: { ka: "დაკავშირდა — Facebook და Instagram.", en: "Connected — Facebook and Instagram." },
  },
  connected_no_ig: {
    tone: "ok",
    text: {
      ka: "Facebook დაკავშირდა. Instagram ვერ მოიძებნა — ანგარიში professional უნდა იყოს და გვერდს მიბმული.",
      en: "Facebook connected. No Instagram found — the account must be professional and linked to the Page.",
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
      ka: "დაკავშირების მოთხოვნა ვერ დადასტურდა. დაიწყე თავიდან.",
      en: "That connection request could not be verified. Please start again.",
    },
  },
  signed_out: {
    tone: "bad",
    text: { ka: "სესია ამოიწურა. შედი და სცადე თავიდან.", en: "Your session expired. Sign in and try again." },
  },
  unconfigured: {
    tone: "bad",
    text: { ka: "META_APP_ID არ არის მითითებული.", en: "META_APP_ID is not set." },
  },
  exchange: {
    tone: "bad",
    text: { ka: "Meta-მ კოდი არ მიიღო. სცადე თავიდან.", en: "Meta rejected the code. Please try again." },
  },
  failed: {
    tone: "bad",
    text: { ka: "დაკავშირება ვერ მოხერხდა.", en: "The connection could not be completed." },
  },
};

export function ConnectMeta() {
  const { t } = useLanguage();
  const result = RESULTS[useSearchParams().get("connect") ?? ""];

  return (
    <div className="flex flex-col gap-2">
      <a
        href="/api/channels/instagram/start"
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm bg-[#1877f2] px-4 text-sm font-medium text-white"
      >
        <IconBrandFacebook size={18} />
        {t({ ka: "დააკავშირე Facebook და Instagram", en: "Connect Facebook and Instagram" })}
      </a>

      {result ? (
        <p className={`text-[13px] ${result.tone === "ok" ? "text-green" : "text-red"}`}>
          {t(result.text)}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import clsx from "clsx";
import { IconSend } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { REPLY_NOTICE } from "./constants";
import type { Notice } from "./useChatReply";

export function ReplyBar({
  notice,
  draft,
  sending,
  onChange,
  onSubmit,
}: {
  notice: Notice | null;
  draft: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const { t } = useLanguage();

  return (
    <>
      {notice ? (
        <p
          className={clsx(
            "border-t px-3 py-2 text-[12px]",
            notice.tone === "warn"
              ? "border-amber bg-amber-surface text-amber"
              : "border-red bg-red-surface text-red",
          )}
        >
          {t(REPLY_NOTICE[notice.key])}
        </p>
      ) : null}

      <form
        className="flex items-center gap-2.5 border-t border-border2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <input
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          disabled={sending}
          placeholder={t("dashboard.conversations.chatDetail.writeAReply")}
          className="min-w-0 flex-1 rounded-[6px] border border-border bg-canvas px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue disabled:opacity-60 placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-[6px] bg-primary px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSend size={16} /> {t("dashboard.conversations.chatDetail.send")}
        </button>
      </form>
    </>
  );
}

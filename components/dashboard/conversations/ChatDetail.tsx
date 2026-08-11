"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import {
  IconArrowLeft,
  IconMessage2,
  IconRobot,
  IconSend,
  IconShoppingCart,
  IconUserPlus,
} from "@tabler/icons-react";
import { Switch } from "@/components/dashboard/ui/Switch";
import { sendOperatorReply, setConversationAi } from "@/lib/dashboard/actions";
import { CHANNEL_META } from "@/lib/dashboard/channelMeta";
import type { ConversationDetail } from "@/lib/dashboard/queries";
import type { Bilingual } from "@/lib/content/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

const MARK = "inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-3 text-xs font-medium";

/**
 * What to say when a reply is saved but does not reach the customer.
 *
 * Kept apart from the failures because the outcome is different: the message is
 * in the thread either way, and only some of these are worth trying again.
 */
const REPLY_NOTICE: Record<string, Bilingual> = {
  window_closed: {
    ka: "პასუხი შენახულია, მაგრამ Messenger-მა არ მიიღო: კლიენტს 24 საათია არ მოუწერია. ხელახლა ცდა ვერ უშველის — დაელოდე, სანამ თვითონ დაგიკავშირდება.",
    en: "Saved, but Messenger would not take it: the customer has not written for 24 hours. Trying again cannot help — wait until they message you.",
  },
  failed: {
    ka: "პასუხი შენახულია, მაგრამ გაგზავნა ვერ მოხერხდა. სცადე ხელახლა.",
    en: "Saved, but sending failed. Try again.",
  },
  not_delivered: {
    ka: "პასუხი შენახულია. კლიენტთან არ გაგზავნილა — ეს არხი ჯერ არ არის ბოლომდე მიერთებული.",
    en: "Saved. Not sent to the customer — this channel is not fully connected yet.",
  },
  forbidden: { ka: "ამის უფლება არ გაქვს.", en: "You do not have permission for this." },
  not_found: { ka: "მიმოწერა ვერ მოიძებნა.", en: "Conversation not found." },
  error: { ka: "ვერ შესრულდა. სცადე ხელახლა.", en: "Something went wrong. Try again." },
};

export function ChatDetail({
  chat,
  onBack,
  onSent,
}: {
  chat: ConversationDetail | null;
  onBack: () => void;
  /** Hands the stored reply back so the thread shows it without a refetch. */
  onSent: (message: ConversationDetail["messages"][number]) => void;
}) {
  const { t } = useLanguage();
  const [, start] = useTransition();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ key: string; tone: "warn" | "error" } | null>(null);

  async function reply() {
    const text = draft.trim();
    if (!text || !chat) return;

    setSending(true);
    setNotice(null);
    try {
      const res = await sendOperatorReply(chat.id, text);

      if (!res.ok) {
        setNotice({ key: res.error in REPLY_NOTICE ? res.error : "error", tone: "error" });
        return;
      }

      // Cleared on success even when delivery fell short: the message is in the
      // thread, and leaving it in the box invites sending it a second time.
      setDraft("");
      onSent(res.message);

      if (res.delivery === "WINDOW_CLOSED") setNotice({ key: "window_closed", tone: "warn" });
      else if (res.delivery === "FAILED") setNotice({ key: "failed", tone: "error" });
      else if (res.delivery === null) setNotice({ key: "not_delivered", tone: "warn" });
    } catch {
      setNotice({ key: "error", tone: "error" });
    } finally {
      setSending(false);
    }
  }

  if (!chat) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 rounded-[14px] border border-border bg-surface p-8 text-center">
        <IconMessage2 size={28} className="text-faint" />
        <p className="text-sm font-medium">
          {t({ ka: "აირჩიე მიმოწერა", en: "Select a conversation" })}
        </p>
        <p className="max-w-[320px] text-xs text-muted">
          {t({
            ka: "როგორც კი Facebook / Instagram / WhatsApp დაუკავშირდება, კლიენტების შეტყობინებები აქ ავტომატურად გამოჩნდება.",
            en: "Once Facebook / Instagram / WhatsApp is connected, customer messages appear here automatically.",
          })}
        </p>
      </div>
    );
  }

  const m = chat.channelType ? CHANNEL_META[chat.channelType] : null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border2 p-3">
        <button type="button" onClick={onBack} aria-label="Back" className="text-muted lg:hidden">
          <IconArrowLeft size={20} />
        </button>
        <span className="grid size-9 place-items-center rounded-full border border-border bg-soft font-semibold text-muted">
          {chat.initials}
        </span>
        <div className="mr-auto">
          <div className="font-semibold">{chat.name}</div>
          <div className="flex items-center gap-1 text-xs text-muted">
            {m ? <m.icon size={13} style={{ color: m.color }} /> : null}
            {chat.status === "NEW"
              ? t({ ka: "ახალი", en: "New" })
              : chat.status === "DONE"
                ? t({ ka: "დასრულებული", en: "Done" })
                : t({ ka: "მიმდინარე", en: "Ongoing" })}
          </div>
        </div>

        <span className={clsx(MARK, chat.hasLead ? "border-green bg-green-surface text-green" : "border-border text-muted")}>
          <IconUserPlus size={15} /> {t({ ka: "ლიდი", en: "Lead" })}
        </span>
        <span className={clsx(MARK, chat.hasOrder ? "border-blue bg-blue-surface text-blue" : "border-border text-muted")}>
          <IconShoppingCart size={15} /> {t({ ka: "შეკვეთა", en: "Order" })}
        </span>

        <span className={clsx("flex items-center gap-2 rounded-[6px] border border-border px-2.5 py-1.5 text-xs font-medium", chat.aiEnabled ? "bg-ai-surface" : "bg-soft")}>
          <IconRobot size={15} className="text-ai" /> AI
          <Switch
            on={chat.aiEnabled}
            onToggle={() => start(() => setConversationAi(chat.id, !chat.aiEnabled))}
            tone="ai"
            ariaLabel="AI"
          />
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-soft p-4">
        {chat.messages.length === 0 ? (
          <p className="m-auto text-sm text-muted">
            {t({ ka: "შეტყობინებები არ არის", en: "No messages" })}
          </p>
        ) : (
          chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "max-w-[80%] rounded-[13px] px-3.5 py-2.5 text-[13px] leading-relaxed sm:max-w-[70%]",
                msg.sender === "CUSTOMER" && "self-start rounded-tl-[4px] border border-border bg-surface",
                msg.sender === "AI" && "ml-auto self-end rounded-tr-[4px] border border-ai bg-ai-surface",
                msg.sender === "OPERATOR" && "ml-auto self-end rounded-tr-[4px] bg-primary text-white",
              )}
            >
              {msg.sender === "AI" ? (
                <span className="mb-1 block text-[10px] font-semibold text-ai">
                  ✦ {t({ ka: "AI პასუხი", en: "AI reply" })}
                </span>
              ) : null}
              {msg.sender === "OPERATOR" ? (
                <span className="mb-1 block text-[10px] font-semibold opacity-80">
                  {t({ ka: "ადმინი (ხელით)", en: "Admin (manual)" })}
                </span>
              ) : null}
              {msg.text}
            </div>
          ))
        )}
      </div>

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
          reply();
        }}
      >
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setNotice(null);
          }}
          disabled={sending}
          placeholder={t({ ka: "დაწერე პასუხი…", en: "Write a reply…" })}
          className="min-w-0 flex-1 rounded-[6px] border border-border bg-canvas px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue disabled:opacity-60 placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-[6px] bg-primary px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSend size={16} /> {t({ ka: "გაგზავნა", en: "Send" })}
        </button>
      </form>
    </div>
  );
}

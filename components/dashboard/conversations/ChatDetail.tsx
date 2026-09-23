"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import {
  IconArrowLeft,
  IconMessage2,
  IconRobot,
  IconRotateClockwise,
  IconSend,
  IconShoppingCart,
  IconUserPlus,
} from "@tabler/icons-react";
import { Switch } from "@/components/dashboard/ui/Switch";
import {
  createLeadFromConversation,
  sendOperatorReply,
  setConversationAi,
} from "@/lib/dashboard/actions";
import { handBackToAi } from "@/lib/dashboard/actions/conversations";
import { CHANNEL_META } from "@/lib/dashboard/channelMeta";
import type { ConversationDetail } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const MARK = "inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-3 text-xs font-medium";

/** Shown when a reply is saved but not delivered. */
const REPLY_NOTICE: Record<string, Text> = {
  window_closed: "dashboard.conversations.chatDetail.savedButMessengerWould",
  failed: "dashboard.conversations.chatDetail.savedButSendingFailed",
  not_delivered: "dashboard.conversations.chatDetail.savedNotSentTo",
  forbidden: "dashboard.conversations.chatDetail.youDoNotHave",
  not_found: "dashboard.conversations.chatDetail.conversationNotFound",
  error: "dashboard.conversations.chatDetail.somethingWentWrongTry",
};

export function ChatDetail({
  chat,
  loading = false,
  onBack,
  onSent,
  onLead,
  onAiChange,
  onReleased,
}: {
  chat: ConversationDetail | null;
  /** The header is drawn from the list row while the messages are on their way. */
  loading?: boolean;
  onBack: () => void;
  /** Hands the stored reply back so the thread shows it without a refetch. */
  onSent: (message: ConversationDetail["messages"][number]) => void;
  /** Marks this chat as having a lead, once one has been made. */
  onLead: () => void;
  /** Mirrors the AI switch into the parent's cache — see ConversationsView. */
  onAiChange?: (aiEnabled: boolean) => void;
  /** Same, for handing a paused conversation back to the bot. */
  onReleased?: () => void;
}) {
  const { t } = useLanguage();
  const [, start] = useTransition();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ key: string; tone: "warn" | "error" } | null>(null);
  const [makingLead, setMakingLead] = useState(false);
  const [releasing, setReleasing] = useState(false);

  /** Keeps the thread scrolled to the newest message, including replies arriving while it is open. */
  const thread = useRef<HTMLDivElement>(null);
  const count = chat?.messages.length ?? 0;

  useEffect(() => {
    const el = thread.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat?.id, count]);

  async function makeLead() {
    if (!chat || chat.hasLead) return;
    setMakingLead(true);
    setNotice(null);
    try {
      const res = await createLeadFromConversation(chat.id);
      if (!res.ok) setNotice({ key: res.error in REPLY_NOTICE ? res.error : "error", tone: "error" });
      else onLead();
    } catch {
      setNotice({ key: "error", tone: "error" });
    } finally {
      setMakingLead(false);
    }
  }

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

      // Cleared even when delivery failed: the message is saved, and resending would duplicate it.
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
          {t("dashboard.conversations.chatDetail.selectAConversation")}
        </p>
        <p className="max-w-[320px] text-xs text-muted">
          {t("dashboard.conversations.chatDetail.onceFacebookInstagramWhatsapp")}
        </p>
      </div>
    );
  }

  const m = chat.channelType ? CHANNEL_META[chat.channelType] : null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border2 p-3">
        <button type="button" onClick={onBack} aria-label={t("common.back")} className="text-muted lg:hidden">
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
              ? t("dashboard.conversations.chatDetail.new")
              : chat.status === "DONE"
                ? t("dashboard.conversations.chatDetail.done")
                : t("dashboard.conversations.chatDetail.ongoing")}
          </div>
        </div>

        {chat.handedOver ? (
          <button
            type="button"
            disabled={releasing}
            onClick={() => {
              setReleasing(true);
              start(async () => {
                const res = await handBackToAi(chat.id);
                if (res.ok) onReleased?.();
                setReleasing(false);
              });
            }}
            title={t("dashboard.conversations.chatDetail.theAiAskedFor")}
            className={clsx(MARK, "border-red bg-red-surface text-red disabled:opacity-60")}
          >
            <IconRotateClockwise size={15} />
            {releasing
              ? t("dashboard.conversations.chatDetail.handingBack")
              : t("dashboard.conversations.chatDetail.giveBackToAi")}
          </button>
        ) : null}

        <button
          type="button"
          disabled={chat.hasLead || makingLead}
          onClick={() => void makeLead()}
          title={t(
            chat.hasLead
              ? "dashboard.conversations.chatDetail.thisConversationAlreadyHas"
              : "dashboard.conversations.chatDetail.createALeadFrom",
          )}
          className={clsx(
            MARK,
            chat.hasLead
              ? "cursor-default border-green bg-green-surface text-green"
              : "border-border text-muted hover:border-green hover:text-green disabled:opacity-60",
          )}
        >
          <IconUserPlus size={15} /> {t("dashboard.conversations.chatDetail.lead")}
        </button>
        <span
          title={t("dashboard.conversations.chatDetail.ordersAreCreatedFrom")}
          className={clsx(MARK, chat.hasOrder ? "border-blue bg-blue-surface text-blue" : "border-border text-muted")}
        >
          <IconShoppingCart size={15} /> {t("dashboard.conversations.chatDetail.order")}
        </span>

        <span className={clsx("flex items-center gap-2 rounded-[6px] border border-border px-2.5 py-1.5 text-xs font-medium", chat.aiEnabled ? "bg-ai-surface" : "bg-soft")}>
          <IconRobot size={15} className="text-ai" /> AI
          <Switch
            on={chat.aiEnabled}
            onToggle={() => {
              const next = !chat.aiEnabled;
              // Optimistic: the header renders from the parent's cache.
              onAiChange?.(next);
              start(() => setConversationAi(chat.id, next));
            }}
            tone="ai"
            ariaLabel="AI"
          />
        </span>
      </div>

      <div ref={thread} className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-soft p-4">
        {loading ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            <span className="skeleton h-9 w-[55%] rounded-[13px]" />
            <span className="skeleton ml-auto h-9 w-[45%] rounded-[13px]" />
            <span className="skeleton h-12 w-[65%] rounded-[13px]" />
          </div>
        ) : chat.messages.length === 0 ? (
          <p className="m-auto text-sm text-muted">
            {t("dashboard.conversations.chatDetail.noMessages")}
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
                  ✦ {t("dashboard.conversations.chatDetail.aiReply")}
                </span>
              ) : null}
              {msg.sender === "OPERATOR" ? (
                <span className="mb-1 block text-[10px] font-semibold opacity-80">
                  {t("dashboard.conversations.chatDetail.adminManual")}
                </span>
              ) : null}
              {msg.text}
              <span
                className={clsx(
                  "mt-1 block text-right text-[10px] tabular-nums",
                  msg.sender === "OPERATOR" ? "opacity-70" : "text-faint",
                )}
              >
                {msg.timeLabel}
              </span>
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
    </div>
  );
}

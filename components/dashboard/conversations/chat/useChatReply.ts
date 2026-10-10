import { useState } from "react";
import { sendOperatorReply } from "@/lib/dashboard/actions/conversations";
import { createLeadFromConversation } from "@/lib/dashboard/actions/leads";
import type { ConversationDetail } from "@/lib/dashboard/queries";
import { REPLY_NOTICE } from "./constants";

export type Notice = { key: string; tone: "warn" | "error" };
export type ChatMessage = ConversationDetail["messages"][number];

const failure = (error: string): Notice => ({ key: error in REPLY_NOTICE ? error : "error", tone: "error" });

export function useChatReply(
  chat: ConversationDetail | null,
  onSent: (message: ChatMessage) => void,
  onLead: () => void,
) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [makingLead, setMakingLead] = useState(false);

  async function makeLead() {
    if (!chat || chat.hasLead) return;
    setMakingLead(true);
    setNotice(null);
    try {
      const res = await createLeadFromConversation(chat.id);
      if (!res.ok) setNotice(failure(res.error));
      else onLead();
    } catch {
      setNotice(failure("error"));
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
        setNotice(failure(res.error));
        return;
      }

      setDraft("");
      onSent(res.message);

      if (res.delivery === "WINDOW_CLOSED") setNotice({ key: "window_closed", tone: "warn" });
      else if (res.delivery === "FAILED") setNotice({ key: "failed", tone: "error" });
      else if (res.delivery === null) setNotice({ key: "not_delivered", tone: "warn" });
    } catch {
      setNotice(failure("error"));
    } finally {
      setSending(false);
    }
  }

  return {
    draft,
    sending,
    notice,
    makingLead,
    makeLead,
    reply,
    changeDraft: (value: string) => {
      setDraft(value);
      setNotice(null);
    },
  };
}

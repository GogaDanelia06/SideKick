import { useState, useTransition } from "react";
import { useToast } from "@/components/dashboard/ui/Toast";
import { promptFailureText } from "@/components/dashboard/ai/sections/promptFailure";
import { applyPromptCorrection, proposePromptCorrection } from "@/lib/dashboard/actions/promptCorrection";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const BASE = "dashboard.conversations.correction";

export function useCorrectionDialog(conversationId: string, messageIds: string[], onSaved: () => void) {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<Text | null>(null);
  const [proposal, setProposal] = useState<{ saved: string; prompt: string } | null>(null);

  function preview() {
    setError(null);
    start(async () => {
      const res = await proposePromptCorrection(conversationId, messageIds, note).catch(() => null);
      if (!res) return setError(`${BASE}.failed`);
      if (res.ok) return setProposal({ saved: res.saved, prompt: res.prompt });
      setError(res.error === "forbidden" ? "dashboard.conversations.chatDetail.youDoNotHave" : promptFailureText(res));
    });
  }

  function save() {
    if (!proposal) return;
    setError(null);
    start(async () => {
      const res = await applyPromptCorrection(proposal.prompt).catch(() => ({ ok: false }));
      if (!res.ok) return setError(`${BASE}.failed`);
      notify(t(`${BASE}.saved`));
      onSaved();
    });
  }

  return {
    note,
    changeNote: (value: string) => {
      setNote(value);
      setProposal(null);
    },
    pending,
    error,
    proposal,
    preview,
    save,
  };
}

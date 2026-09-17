"use client";

import { useState } from "react";
import { IconFlask, IconSend, IconTrash } from "@tabler/icons-react";
import { testAiReply } from "@/lib/dashboard/actions/assistant";
import { answerTester, askTester, clearTesterChat, useTesterChat } from "@/lib/dashboard/testerChat";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AiModuleNotice, INPUT } from "../parts";
import { TesterTranscript } from "./TesterTranscript";

const NO_ANSWER = {
  ka: "AI სერვისმა ვერ უპასუხა. სცადე ხელახლა.",
  en: "The AI service did not answer. Try again.",
};

/** Tries the current prompt against the real AI service. The chat stays until logout. */
export function TesterSection({ aiReady, loginId }: { aiReady: boolean; loginId: string }) {
  const { t } = useLanguage();
  const { turns, waiting, loaded } = useTesterChat(loginId);
  const [draft, setDraft] = useState("");
  const [failed, setFailed] = useState(false);

  async function send() {
    const text = draft.trim();
    const thread = text ? askTester(loginId, text) : null;
    if (!thread) return;

    setFailed(false);
    setDraft("");
    const res = await testAiReply(text, thread).catch(() => null);
    const answer = res?.ok ? { from: "ai" as const, text: res.reply, handoff: res.handoff } : null;
    // Recorded even if this screen was left meanwhile; a failure is only shown if the chat is still this one.
    if (answerTester(thread, answer) && !answer) setFailed(true);
  }

  function clear() {
    clearTesterChat();
    setFailed(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-ai-surface text-ai">
          <IconFlask size={18} />
        </span>
        <div className="flex-1">
          <h2 className="text-[15px] font-semibold">{t({ ka: "ტესტერი", en: "Tester" })}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className={`size-1.5 rounded-full ${aiReady ? "bg-green" : "bg-faint"}`} />
            {t({ ka: "გატესტე მიმდინარე პრომპტი", en: "Test your current prompt" })}
          </p>
        </div>
        {turns.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border border-border px-3 text-[12px] text-muted transition-colors hover:text-ink"
          >
            <IconTrash size={14} />
            {t({ ka: "ჩატის გასუფთავება", en: "Clear chat" })}
          </button>
        ) : null}
      </div>

      {!aiReady ? (
        <AiModuleNotice
          text={{
            ka: "ტესტერს AI სერვისი სჭირდება, რომელიც ჯერ არ არის დაკავშირებული.",
            en: "The tester needs the AI service, which is not connected yet.",
          }}
        />
      ) : null}

      <div className="flex h-[380px] flex-col overflow-hidden rounded-[10px] border border-border bg-canvas">
        <TesterTranscript turns={turns} waiting={waiting} loaded={loaded} />

        {failed ? <p className="px-4 pb-2 text-[13px] text-red">{t(NO_ANSWER)}</p> : null}

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
            disabled={!aiReady}
            placeholder={t({ ka: "დაწერე შეტყობინება…", en: "Type a message…" })}
            className={INPUT}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!aiReady || waiting || !draft.trim()}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconSend size={16} />
            {t({ ka: "გაგზავნა", en: "Send" })}
          </button>
        </div>
      </div>
    </div>
  );
}

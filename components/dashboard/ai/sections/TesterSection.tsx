"use client";

import { useState } from "react";
import { IconFlask, IconSend, IconTrash } from "@tabler/icons-react";
import { testAiReply } from "@/lib/dashboard/actions/assistant";
import { answerTester, askTester, clearTesterChat, useTesterChat } from "@/lib/dashboard/testerChat";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AiModuleNotice, INPUT } from "../parts";
import { TesterTranscript } from "./TesterTranscript";

const NO_ANSWER = "dashboard.ai.testerSection.theAiServiceDid";

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
    <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
      <div className="flex items-start gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-ai-surface text-ai">
          <IconFlask size={18} />
        </span>
        <div className="flex-1">
          <h2 className="text-[15px] font-semibold">{t("dashboard.ai.testerSection.tester")}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className={`size-1.5 rounded-full ${aiReady ? "bg-green" : "bg-faint"}`} />
            {t("dashboard.ai.testerSection.testYourCurrentPrompt")}
          </p>
        </div>
        {turns.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border border-border px-3 text-[12px] text-muted transition-colors hover:text-ink"
          >
            <IconTrash size={14} />
            {t("dashboard.ai.testerSection.clearChat")}
          </button>
        ) : null}
      </div>

      {!aiReady ? (
        <AiModuleNotice
          text={"dashboard.ai.testerSection.text"}
        />
      ) : null}

      <div className="flex h-[60vh] min-h-[340px] flex-col overflow-hidden rounded-[10px] border border-border bg-canvas lg:h-auto lg:min-h-0 lg:flex-1">
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
            placeholder={t("dashboard.ai.testerSection.typeAMessage")}
            className={INPUT}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!aiReady || waiting || !draft.trim()}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconSend size={16} />
            {t("dashboard.ai.testerSection.send")}
          </button>
        </div>
      </div>
    </div>
  );
}

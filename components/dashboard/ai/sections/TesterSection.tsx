"use client";

import { useState, useTransition } from "react";
import { IconFlask, IconSend, IconSparkles } from "@tabler/icons-react";
import { testAiReply } from "@/lib/dashboard/aiActions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AiModuleNotice, INPUT } from "../parts";

type Turn = { from: "you" | "ai"; text: string; handoff?: boolean };

/**
 * A rehearsal of the current prompt, with nobody's customer on the other end.
 *
 * Real now, where it used to be two hardcoded lines pretending to be an answer.
 * A canned demo is worse than none once the module works: it shows the merchant
 * a reply their prompt never produced, so the one screen meant for checking the
 * assistant is the one screen that cannot be trusted.
 *
 * Nothing here is stored — see `testAiReply`.
 */
export function TesterSection({ aiReady }: { aiReady: boolean }) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send() {
    const text = draft.trim();
    if (!text || pending) return;

    setError(null);
    setDraft("");
    setTurns((t) => [...t, { from: "you", text }]);

    start(async () => {
      const res = await testAiReply(text);
      if (res.ok) {
        setTurns((t) => [...t, { from: "ai", text: res.reply, handoff: res.handoff }]);
      } else {
        setError(
          t({
            ka: "AI სერვისმა ვერ უპასუხა. სცადე ხელახლა.",
            en: "The AI service did not answer. Try again.",
          }),
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-ai-surface text-ai">
          <IconFlask size={18} />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold">{t({ ka: "ტესტერი", en: "Tester" })}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className={`size-1.5 rounded-full ${aiReady ? "bg-green" : "bg-faint"}`} />
            {t({ ka: "გატესტე მიმდინარე პრომპტი", en: "Test your current prompt" })}
          </p>
        </div>
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
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {turns.length === 0 ? (
            <p className="pt-8 text-center text-[13px] text-muted">
              {t({
                ka: "დაწერე რამე, როგორც კლიენტი დაწერდა — და ნახე, როგორ უპასუხებს.",
                en: "Write something a customer might, and see how it answers.",
              })}
            </p>
          ) : null}

          {turns.map((turn, i) =>
            turn.from === "you" ? (
              <div key={i} className="flex">
                <span className="max-w-[80%] rounded-[10px] rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px]">
                  {turn.text}
                </span>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <span className="max-w-[80%] whitespace-pre-wrap rounded-[10px] rounded-tr-sm border border-ai bg-ai-surface px-3.5 py-2.5 text-[13px] text-ai">
                  <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold opacity-80">
                    <IconSparkles size={12} />
                    AI
                    {turn.handoff
                      ? ` · ${t({ ka: "ითხოვს ადამიანს", en: "asks for a person" })}`
                      : ""}
                  </span>
                  {turn.text}
                </span>
              </div>
            ),
          )}

          {pending ? (
            <div className="flex justify-end">
              <span className="rounded-[10px] border border-ai bg-ai-surface px-3.5 py-2.5 text-[13px] text-ai opacity-70">
                {t({ ka: "წერს…", en: "Typing…" })}
              </span>
            </div>
          ) : null}
        </div>

        {error ? <p className="px-4 pb-2 text-[13px] text-red">{error}</p> : null}

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={!aiReady}
            placeholder={t({ ka: "დაწერე შეტყობინება…", en: "Type a message…" })}
            className={INPUT}
          />
          <button
            type="button"
            onClick={send}
            disabled={!aiReady || pending || !draft.trim()}
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

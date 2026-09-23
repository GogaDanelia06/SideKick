"use client";

import { useEffect, useRef } from "react";
import { IconSparkles } from "@tabler/icons-react";
import type { TesterTurn } from "@/lib/dashboard/testerChat";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** The tester's messages, kept scrolled to the newest one. */
export function TesterTranscript({
  turns,
  waiting,
  loaded,
}: {
  turns: TesterTurn[];
  waiting: boolean;
  loaded: boolean;
}) {
  const { t } = useLanguage();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, waiting]);

  return (
    <div ref={box} className="flex-1 space-y-3 overflow-y-auto p-4">
      {loaded && turns.length === 0 ? (
        <p className="pt-8 text-center text-[13px] text-muted">
          {t("dashboard.ai.testerTranscript.writeSomethingACustomer")}
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
                {turn.handoff ? ` · ${t("dashboard.ai.testerTranscript.asksForAPerson")}` : ""}
              </span>
              {turn.text}
            </span>
          </div>
        ),
      )}

      {waiting ? (
        <div className="flex justify-end">
          <span className="rounded-[10px] border border-ai bg-ai-surface px-3.5 py-2.5 text-[13px] text-ai opacity-70">
            {t("dashboard.ai.testerTranscript.typing")}
          </span>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useContext, useState, useTransition } from "react";
import { IconArrowBackUp, IconSparkles, IconWand } from "@tabler/icons-react";
import { generateAiPrompt, refineAiPrompt } from "@/lib/dashboard/actions/assistant";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SectionSaveContext } from "../sectionSaveContext";
import { RefinePanel } from "./RefinePanel";

type Props = {
  ready: boolean;
  /** What the box holds now, kept so an AI rewrite can be taken back. */
  current: string;
  onPrompt: (prompt: string) => void;
};

const BTN = "inline-flex h-10 items-center gap-2 rounded-[8px] px-4 text-[13px] font-medium";

/**
 * Generate and refine buttons. Nothing they bring back is saved: the text lands in the box
 * like something the merchant typed, and only Save keeps it. The AI service rewrites the
 * prompt that is saved, not the one in the box, so a rewrite waits until the box is saved.
 * The text a result replaced stays one click away.
 */
export function PromptAiActions({ ready, current, onPrompt }: Props) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [refining, setRefining] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const { dirty, saving } = useContext(SectionSaveContext);
  const blocked = !ready || pending || saving;

  const offline = t("dashboard.ai.promptAiActions.requiresTheAiModule");
  const failed = t("dashboard.ai.promptAiActions.theAiServiceDid");

  function run(work: () => Promise<{ ok: boolean; prompt?: string }>) {
    setError(null);
    const before = current;
    start(async () => {
      const res = await work();
      if (res.ok && res.prompt) {
        onPrompt(res.prompt);
        setPrevious(before);
        setRefining(false);
        setInstructions("");
      } else {
        setError(failed);
      }
    });
  }

  /** The replaced text goes back in the box as an edit: Save keeps it, Cancel drops it again. */
  function undo() {
    if (previous === null) return;
    onPrompt(previous);
    setPrevious(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={blocked}
          title={ready ? undefined : offline}
          onClick={() => run(generateAiPrompt)}
          className={`${BTN} border border-ai text-ai disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <IconSparkles size={16} />
          {t("dashboard.ai.promptAiActions.generatePrompt")}
        </button>

        <button
          type="button"
          disabled={blocked}
          title={ready ? undefined : offline}
          onClick={() => setRefining((v) => !v)}
          className={`${BTN} border border-border text-muted disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <IconWand size={16} />
          {t("dashboard.ai.promptAiActions.refineWithAi")}
        </button>
      </div>

      {refining ? (
        <RefinePanel
          instructions={instructions}
          onInstructions={setInstructions}
          blocked={blocked}
          dirty={dirty}
          pending={pending}
          onRewrite={() => run(() => refineAiPrompt(instructions))}
        />
      ) : null}

      {pending && !refining ? <p className="text-[13px] text-muted">{t("dashboard.ai.promptAiActions.working")}</p> : null}
      {previous !== null && !pending ? (
        <button type="button" onClick={undo} className="inline-flex items-center gap-1.5 self-start text-[13px] text-muted hover:text-ink">
          <IconArrowBackUp size={15} />
          {t("dashboard.ai.promptAiActions.undo")}
        </button>
      ) : null}
      {error ? <p className="text-[13px] text-red">{error}</p> : null}
    </div>
  );
}

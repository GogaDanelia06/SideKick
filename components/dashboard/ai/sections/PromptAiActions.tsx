"use client";

import { useState, useTransition } from "react";
import { IconSparkles, IconWand } from "@tabler/icons-react";
import { generateAiPrompt, refineAiPrompt } from "@/lib/dashboard/aiActions";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Props = {
  ready: boolean;
  onPrompt: (prompt: string) => void;
};

const BTN = "inline-flex h-10 items-center gap-2 rounded-[8px] px-4 text-[13px] font-medium";

/**
 * The two buttons that ask the AI service for a prompt.
 *
 * The result is handed upward rather than saved and forgotten: it lands in the
 * textarea, where the merchant reads it and decides. A generated prompt written
 * straight into the live config would change how the assistant talks to their
 * customers before anyone had seen a word of it.
 */
export function PromptAiActions({ ready, onPrompt }: Props) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [refining, setRefining] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);

  const offline = t({ ka: "საჭიროებს AI მოდულს", en: "Requires the AI module" });
  const failed = t({
    ka: "AI სერვისმა ვერ უპასუხა. სცადე ხელახლა.",
    en: "The AI service did not answer. Try again.",
  });

  function run(work: () => Promise<{ ok: boolean; prompt?: string }>) {
    setError(null);
    start(async () => {
      const res = await work();
      if (res.ok && res.prompt) {
        onPrompt(res.prompt);
        setRefining(false);
        setInstructions("");
      } else {
        setError(failed);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!ready || pending}
          title={ready ? undefined : offline}
          onClick={() => run(generateAiPrompt)}
          className={`${BTN} border border-ai text-ai disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <IconSparkles size={16} />
          {t({ ka: "დააგენერირე პრომპტი", en: "Generate prompt" })}
        </button>

        <button
          type="button"
          disabled={!ready || pending}
          title={ready ? undefined : offline}
          onClick={() => setRefining((v) => !v)}
          className={`${BTN} border border-border text-muted disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <IconWand size={16} />
          {t({ ka: "დაარედაქტირე AI-ით", en: "Refine with AI" })}
        </button>
      </div>

      {refining ? (
        <div className="flex flex-col gap-2">
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={t({
              ka: "მაგ: უფრო მოკლედ პასუხობდეს და ფასი ყოველთვის დაასახელოს",
              en: "e.g. answer more briefly and always state the price",
            })}
            className="w-full rounded-[8px] border border-border bg-transparent p-2.5 text-[13px]"
          />
          <button
            type="button"
            disabled={pending || !instructions.trim()}
            onClick={() => run(() => refineAiPrompt(instructions))}
            className={`${BTN} self-start bg-primary text-white disabled:opacity-60`}
          >
            {pending
              ? t({ ka: "მუშავდება…", en: "Working…" })
              : t({ ka: "გადააკეთე", en: "Rewrite" })}
          </button>
        </div>
      ) : null}

      {pending && !refining ? (
        <p className="text-[13px] text-muted">{t({ ka: "მუშავდება…", en: "Working…" })}</p>
      ) : null}
      {error ? <p className="text-[13px] text-red">{error}</p> : null}
    </div>
  );
}

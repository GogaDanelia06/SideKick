"use client";

import { useState } from "react";
import type { AiConfig } from "@prisma/client";
import { IconBrandYoutube, IconFileText } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PromptAiActions } from "./PromptAiActions";
import { PromptBox, type PromptView } from "./PromptBox";
import { SectionForm } from "../SectionForm";

export function PromptSection({ config, aiReady }: { config: AiConfig | null; aiReady: boolean }) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState(config?.prompt ?? "");
  // A prompt that exists is read formatted; an empty one is there to be written.
  const [view, setView] = useState<PromptView>(prompt.trim() ? "preview" : "edit");

  return (
    <SectionForm
      section="prompt"
      icon={IconFileText}
      title={"dashboard.ai.promptSection.promptInstructions"}
      right={
        <div className="flex shrink-0 gap-2">

          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-red px-3 text-xs text-red hover:brightness-110"
          >
            <IconBrandYoutube size={14} />
            {t("dashboard.ai.promptSection.video")}
          </button>
        </div>
      }
      extraActions={
        // What the AI writes, and what an undo brings back, is shown formatted.
        <PromptAiActions ready={aiReady} current={prompt} onPrompt={(text) => { setPrompt(text); setView("preview"); }} />
      }
    >
      <PromptBox
        value={prompt}
        onChange={setPrompt}
        view={view}
        onView={setView}
        placeholder={t("dashboard.ai.promptSection.youAreCompanyS")}
      />
    </SectionForm>
  );
}

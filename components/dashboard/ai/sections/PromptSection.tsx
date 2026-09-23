"use client";

import { useState } from "react";
import type { AiConfig } from "@prisma/client";
import { IconBrandYoutube, IconFileText } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PromptAiActions } from "./PromptAiActions";
import { AREA } from "../parts";
import { SectionForm } from "../SectionForm";

export function PromptSection({ config, aiReady }: { config: AiConfig | null; aiReady: boolean }) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState(config?.prompt ?? "");

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
      extraActions={<PromptAiActions ready={aiReady} onPrompt={setPrompt} />}
    >
      <textarea
        name="prompt"
        rows={10}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t("dashboard.ai.promptSection.youAreCompanyS")}
        className={AREA}
      />
    </SectionForm>
  );
}

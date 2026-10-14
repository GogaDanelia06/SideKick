"use client";

import { useState } from "react";
import clsx from "clsx";
import type { AiConfig } from "@prisma/client";
import { IconBrandYoutube, IconFileText } from "@tabler/icons-react";
import { MarkdownView } from "@/components/ui/markdown/MarkdownView";
import { isSectioned } from "@/lib/ai/promptFormat";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { OldFormatNotice } from "./OldFormatNotice";
import { PromptAiActions } from "./PromptAiActions";
import { PromptChanges } from "./PromptChanges";
import { PromptViewSwitch, type PromptView } from "./PromptViewSwitch";
import { AREA } from "../fields";
import { SectionForm } from "../SectionForm";

export function PromptSection({ config, aiReady }: { config: AiConfig | null; aiReady: boolean }) {
  const { t } = useLanguage();
  const saved = config?.prompt ?? "";
  const [prompt, setPrompt] = useState(saved);
  const [view, setView] = useState<PromptView>("edit");

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
        <>
          <PromptAiActions ready={aiReady} current={prompt} onPrompt={setPrompt} />
          <PromptChanges saved={saved} current={prompt} />
        </>
      }
    >
      {saved.trim() && !isSectioned(saved) ? <OldFormatNotice /> : null}

      <div className="flex flex-col gap-2">
        <PromptViewSwitch view={view} onView={setView} />
        <textarea
          name="prompt"
          rows={10}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t("dashboard.ai.promptSection.youAreCompanyS")}
          className={clsx(AREA, view === "preview" && "hidden")}
        />
        {view === "preview" ? (
          <div className="max-h-[520px] min-h-[220px] overflow-auto rounded-[8px] border border-input bg-canvas p-4">
            {prompt.trim() ? (
              <MarkdownView source={prompt} />
            ) : (
              <p className="text-[13px] text-faint">{t("dashboard.ai.promptSection.previewEmpty")}</p>
            )}
          </div>
        ) : null}
      </div>
    </SectionForm>
  );
}

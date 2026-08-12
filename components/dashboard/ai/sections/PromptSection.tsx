"use client";

import { useState } from "react";
import type { AiConfig } from "@prisma/client";
import { IconBrandYoutube, IconFileText } from "@tabler/icons-react";
import { saveAiPrompt } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PromptAiActions } from "./PromptAiActions";
import { AREA, SectionForm } from "../parts";

export function PromptSection({ config, aiReady }: { config: AiConfig | null; aiReady: boolean }) {
  const { t } = useLanguage();
  // Controlled from here so a generated prompt lands in the box the merchant is
  // already looking at, instead of appearing only after a reload.
  const [prompt, setPrompt] = useState(config?.prompt ?? "");

  return (
    <SectionForm
      icon={IconFileText}
      title={{ ka: "პრომპტი / ინსტრუქციები", en: "Prompt / instructions" }}
      action={saveAiPrompt}
      right={
        <div className="flex shrink-0 gap-2">

          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-red px-3 text-xs text-red hover:brightness-110"
          >
            <IconBrandYoutube size={14} />
            {t({ ka: "ვიდეო", en: "Video" })}
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
        placeholder={t({
          ka: "შენ ხარ [კომპანიის] ვირტუალური ასისტენტი…",
          en: "You are [company]'s virtual assistant…",
        })}
        className={AREA}
      />
    </SectionForm>
  );
}

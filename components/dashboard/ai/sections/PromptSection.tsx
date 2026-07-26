"use client";

import type { AiConfig } from "@prisma/client";
import { IconBrandYoutube, IconFileText, IconInfoCircle, IconSparkles, IconWand } from "@tabler/icons-react";
import { saveAiPrompt } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AREA, AiModuleNotice, SectionForm } from "../parts";

export function PromptSection({ config }: { config: AiConfig | null }) {
  const { t } = useLanguage();
  const needsModule = t({ ka: "საჭიროებს AI მოდულს", en: "Requires the AI module" });

  return (
    <SectionForm
      icon={IconFileText}
      title={{ ka: "პრომპტი / ინსტრუქციები", en: "Prompt / instructions" }}
      action={saveAiPrompt}
      right={
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-border px-3 text-xs text-muted hover:border-blue hover:text-ink"
          >
            <IconInfoCircle size={14} />
            {t({ ka: "ინსტრუქცია", en: "Guide" })}
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-red px-3 text-xs text-red hover:brightness-110"
          >
            <IconBrandYoutube size={14} />
            {t({ ka: "ვიდეო", en: "Video" })}
          </button>
        </div>
      }
      extraActions={
        <>
          <button
            type="button"
            disabled
            title={needsModule}
            className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-[8px] border border-ai px-4 text-[13px] font-medium text-ai opacity-60"
          >
            <IconSparkles size={16} />
            {t({ ka: "დააგენერირე პრომპტი", en: "Generate prompt" })}
          </button>
          <button
            type="button"
            disabled
            title={needsModule}
            className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-[8px] border border-border px-4 text-[13px] font-medium text-muted opacity-60"
          >
            <IconWand size={16} />
            {t({ ka: "დაარედაქტირე AI-ით", en: "Refine with AI" })}
          </button>
        </>
      }
    >
      <textarea
        name="prompt"
        rows={10}
        defaultValue={config?.prompt ?? ""}
        placeholder={t({
          ka: "შენ ხარ [კომპანიის] ვირტუალური ასისტენტი…",
          en: "You are [company]'s virtual assistant…",
        })}
        className={AREA}
      />

      <AiModuleNotice
        text={{
          ka: "პრომპტის შენახვა მუშაობს. „დააგენერირე“ და „დაარედაქტირე AI-ით“ საჭიროებს AI მოდულს, რომელიც ცალკე ეტაპია.",
          en: "Saving the prompt works. “Generate” and “Refine with AI” require the AI module, which is a separate stage.",
        }}
      />
    </SectionForm>
  );
}

"use client";

import { useOptimistic, useTransition } from "react";
import type { AiConfig } from "@prisma/client";
import { IconLanguage, IconX } from "@tabler/icons-react";
import { useToast } from "@/components/dashboard/ui/Toast";
import type { Bilingual } from "@/lib/content/types";
import { setAiLanguages, type LanguagesError } from "@/lib/dashboard/actions/aiConfig";
import {
  DEFAULT_AI_LANGUAGE,
  LANGUAGE_FLAGS,
  MAX_AI_LANGUAGES,
  SUGGESTED_LANGUAGES,
} from "@/lib/dashboard/aiLanguages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SectionHead } from "../parts";
import { FORBIDDEN, SAVE_ERROR } from "../saveMessages";
import { LanguagePicker, SuggestedLanguages } from "./LanguageControls";

const ERRORS: Record<LanguagesError, Bilingual> = {
  forbidden: FORBIDDEN,
  empty: { ka: "ერთი ენა მაინც საჭიროა", en: "At least one language is required" },
  too_many: { ka: `მაქსიმუმ ${MAX_AI_LANGUAGES} ენა`, en: `At most ${MAX_AI_LANGUAGES} languages` },
};

export function LanguagesSection({ config }: { config: AiConfig | null }) {
  const { t } = useLanguage();
  const notify = useToast();
  const [, startTransition] = useTransition();
  const [languages, showLanguages] = useOptimistic(config?.languages ?? [DEFAULT_AI_LANGUAGE]);
  const full = languages.length >= MAX_AI_LANGUAGES;

  // Shown at once; the list falls back to the saved one if the server refuses.
  function save(next: string[], done: Bilingual) {
    startTransition(async () => {
      showLanguages(next);
      try {
        const result = await setAiLanguages(next);
        if (result.ok) notify(t(done));
        else notify(t(ERRORS[result.error]), "error");
      } catch {
        notify(t(SAVE_ERROR), "error");
      }
    });
  }

  function add(value: string): boolean {
    const name = value.trim();
    if (!name || full || languages.includes(name)) return false;
    save([...languages, name], { ka: `${name} დაემატა`, en: `${name} added` });
    return true;
  }

  function remove(name: string) {
    save(languages.filter((l) => l !== name), { ka: `${name} წაიშალა`, en: `${name} removed` });
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        icon={IconLanguage}
        title={{ ka: "ენები", en: "Languages" }}
        hint={{ ka: "რომელ ენებზე უპასუხოს ბოტმა", en: "Which languages the bot replies in" }}
      />

      <div className="flex flex-wrap items-center gap-2">
        {languages.map((l) => (
          <span
            key={l}
            className="inline-flex items-center gap-2 rounded-[8px] border border-primary bg-green-surface px-3 py-2 text-[13px] font-medium text-green"
          >
            {LANGUAGE_FLAGS[l] ? <span aria-hidden>{LANGUAGE_FLAGS[l]}</span> : null}
            {l}
            <button
              type="button"
              disabled={languages.length === 1}
              onClick={() => remove(l)}
              aria-label={t({ ka: "წაშლა", en: "Remove" })}
              title={languages.length === 1 ? t(ERRORS.empty) : undefined}
              className="text-green/70 hover:text-green disabled:opacity-40"
            >
              <IconX size={14} />
            </button>
          </span>
        ))}
        <LanguagePicker disabled={full} disabledHint={t(ERRORS.too_many)} onAdd={add} />
      </div>

      {full ? null : (
        <SuggestedLanguages items={SUGGESTED_LANGUAGES.filter((s) => !languages.includes(s))} onAdd={add} />
      )}
    </div>
  );
}

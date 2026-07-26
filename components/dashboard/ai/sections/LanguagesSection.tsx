"use client";

import { useState, useTransition } from "react";
import type { AiConfig } from "@prisma/client";
import { IconCheck, IconLanguage, IconPlus, IconX } from "@tabler/icons-react";
import { setAiLanguages } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT, SectionHead } from "../parts";

const FLAG: Record<string, string> = {
  "ქართული": "🇬🇪",
  English: "🇬🇧",
  "Русский": "🇷🇺",
  "Türkçe": "🇹🇷",
  Deutsch: "🇩🇪",
};
const SUGGESTED = ["ქართული", "English", "Русский", "Türkçe"];

export function LanguagesSection({ config }: { config: AiConfig | null }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [langs, setLangs] = useState<string[]>(config?.languages ?? ["ქართული"]);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  function commit(next: string[]) {
    setLangs(next);
    setSaved(false);
    start(async () => {
      await setAiLanguages(next);
      setSaved(true);
    });
  }

  function add(value: string) {
    const v = value.trim();
    if (!v || langs.includes(v)) return;
    commit([...langs, v]);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        icon={IconLanguage}
        title={{ ka: "ენები", en: "Languages" }}
        hint={{ ka: "რომელ ენებზე უპასუხოს ბოტმა", en: "Which languages the bot replies in" }}
      />

      <div className="flex flex-wrap items-center gap-2">
        {langs.map((l) => (
          <span
            key={l}
            className="inline-flex items-center gap-2 rounded-[8px] border border-primary bg-green-surface px-3 py-2 text-[13px] font-medium text-green"
          >
            {FLAG[l] ? <span aria-hidden>{FLAG[l]}</span> : null}
            {l}
            <button
              type="button"
              disabled={pending || langs.length === 1}
              onClick={() => commit(langs.filter((x) => x !== l))}
              aria-label={t({ ka: "წაშლა", en: "Remove" })}
              title={
                langs.length === 1
                  ? t({ ka: "ერთი ენა მაინც საჭიროა", en: "At least one language is required" })
                  : undefined
              }
              className="text-green/70 hover:text-green disabled:opacity-40"
            >
              <IconX size={14} />
            </button>
          </span>
        ))}

        {adding ? (
          <span className="inline-flex items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); add(draft); }
                if (e.key === "Escape") { setAdding(false); setDraft(""); }
              }}
              placeholder={t({ ka: "ენის სახელი", en: "Language name" })}
              className={`${INPUT} h-9 max-w-[180px]`}
            />
            <button
              type="button"
              disabled={pending || !draft.trim()}
              onClick={() => add(draft)}
              className="inline-flex h-9 items-center rounded-[8px] bg-primary px-3 text-[13px] font-medium text-white disabled:opacity-60"
            >
              {t({ ka: "დამატება", en: "Add" })}
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-2 text-[13px] text-muted hover:border-blue hover:text-ink"
          >
            <IconPlus size={15} />
            {t({ ka: "ენის დამატება", en: "Add language" })}
          </button>
        )}

        {saved && !pending ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-green">
            <IconCheck size={16} /> {t({ ka: "შენახულია", en: "Saved" })}
          </span>
        ) : null}
      </div>

      {SUGGESTED.some((s) => !langs.includes(s)) ? (
        <div className="border-t border-border2 pt-4">
          <div className="mb-2 text-xs text-muted">{t({ ka: "შემოთავაზებული", en: "Suggested" })}</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.filter((s) => !langs.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => add(s)}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-1.5 text-[13px] text-muted hover:border-blue hover:text-ink disabled:opacity-60"
              >
                <IconPlus size={14} />
                {FLAG[s]} {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

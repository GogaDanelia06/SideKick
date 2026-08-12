"use client";

import { useState } from "react";
import clsx from "clsx";
import type { AiConfig, Business } from "@prisma/client";
import {
  IconBuildingStore,
  IconChevronRight,
  IconExternalLink,
  IconFileText,
  IconFlask,
  IconLanguage,
  IconListCheck,
  IconSquareRoundedLetterA,
} from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual, IconType } from "@/lib/content/types";
import { BusinessSection } from "./sections/BusinessSection";
import { CharacterSection } from "./sections/CharacterSection";
import { RulesSection } from "./sections/RulesSection";
import { PromptSection } from "./sections/PromptSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { TesterSection } from "./sections/TesterSection";

type Key = "business" | "character" | "rules" | "prompt" | "languages" | "tester";

const NAV: { key: Key; label: Bilingual; icon: IconType }[] = [
  { key: "business", label: { ka: "ბიზნესის ინფორმაცია", en: "Business info" }, icon: IconBuildingStore },
  { key: "character", label: { ka: "ხასიათი", en: "Character" }, icon: IconSquareRoundedLetterA },
  { key: "rules", label: { ka: "ქცევის წესები", en: "Behaviour rules" }, icon: IconListCheck },
  { key: "prompt", label: { ka: "პრომპტი / ინსტრუქციები", en: "Prompt / instructions" }, icon: IconFileText },
  { key: "languages", label: { ka: "ენები", en: "Languages" }, icon: IconLanguage },
];

export function AiView({
  config,
  business,
  aiReady,
}: {
  aiReady: boolean;
  config: AiConfig | null;
  business: Business | null;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Key>("business");
  const testing = tab === "tester";

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
      <Panel className="flex flex-col p-3 lg:sticky lg:top-4 lg:h-[calc(100vh-7rem)] lg:min-h-[520px]">
        <div className="px-2 pb-2 text-[11px] uppercase tracking-wide text-faint">
          {t({ ka: "კონფიგურაცია", en: "Configuration" })}
        </div>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((n) => {
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => setTab(n.key)}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex shrink-0 items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-[13px] transition-colors",
                  active
                    ? "bg-green-surface font-semibold text-green"
                    : "text-muted hover:bg-soft hover:text-ink",
                )}
              >
                <n.icon size={17} className="shrink-0" />
                <span className="flex-1 whitespace-nowrap lg:whitespace-normal">{t(n.label)}</span>
                {active ? <IconChevronRight size={15} className="hidden shrink-0 lg:block" /> : null}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border2 pt-3">
          <button
            type="button"
            onClick={() => setTab("tester")}
            aria-current={testing ? "page" : undefined}
            className={clsx(
              "flex w-full items-center gap-2.5 rounded-[8px] border px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
              testing
                ? "border-ai bg-ai text-white"
                : "border-ai bg-ai-surface text-ai hover:brightness-110",
            )}
          >
            <IconFlask size={17} className="shrink-0" />
            <span className="flex-1">{t({ ka: "ტესტერი", en: "Tester" })}</span>
            {testing ? (
              <IconChevronRight size={15} className="shrink-0" />
            ) : (
              <IconExternalLink size={14} className="shrink-0" />
            )}
          </button>
          <p className="mt-2 px-1 text-[11px] leading-snug text-faint">
            {t({
              ka: "დააჭირე „ტესტერი“ პრომპტის ცვლად გასატესტად",
              en: "Open the tester to try your current prompt",
            })}
          </p>
        </div>
      </Panel>

      <Panel className="p-5">
        {tab === "business" && <BusinessSection business={business} />}
        {tab === "character" && <CharacterSection config={config} />}
        {tab === "rules" && <RulesSection config={config} />}
        {tab === "prompt" && <PromptSection config={config} aiReady={aiReady} />}
        {tab === "languages" && <LanguagesSection config={config} />}
        {tab === "tester" && <TesterSection />}
      </Panel>
    </div>
  );
}

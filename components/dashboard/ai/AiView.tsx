"use client";

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
import { useUrlTab } from "@/hooks/useUrlTab";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { IconType } from "@/lib/content/types";
import type { SectionOwner } from "@/lib/dashboard/sectionSave/request";
import { AiSections, type AiTab } from "./AiSections";
import type { Text } from "@/lib/i18n/messages";


const NAV: { key: AiTab; label: Text; icon: IconType }[] = [
  { key: "business", label: "dashboard.ai.view.businessInfo", icon: IconBuildingStore },
  { key: "character", label: "dashboard.ai.view.character", icon: IconSquareRoundedLetterA },
  { key: "rules", label: "dashboard.ai.view.behaviourRules", icon: IconListCheck },
  { key: "prompt", label: "dashboard.ai.view.promptInstructions", icon: IconFileText },
  { key: "languages", label: "dashboard.ai.view.languages", icon: IconLanguage },
];

const TABS: AiTab[] = [...NAV.map((n) => n.key), "tester"];

/** The sidebar always fills the screen; the tester panel matches it so the chat reaches the bottom. */
const FULL_HEIGHT = "lg:h-[calc(100vh-7rem)] lg:min-h-[520px]";

type Props = { config: AiConfig | null; business: Business | null; aiReady: boolean; loginId: string; owner: SectionOwner };

export function AiView({ config, business, aiReady, loginId, owner }: Props) {
  const { t } = useLanguage();
  const [tab, setTab] = useUrlTab("tab", TABS, "business");
  const testing = tab === "tester";

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
      <Panel className={clsx("flex flex-col p-3 lg:sticky lg:top-4", FULL_HEIGHT)}>
        <div className="px-2 pb-2 text-[11px] uppercase tracking-wide text-faint">
          {t("dashboard.ai.view.configuration")}
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
                ? "border-ai bg-ai text-on-ai"
                : "border-ai bg-ai-surface text-ai hover:brightness-110",
            )}
          >
            <IconFlask size={17} className="shrink-0" />
            <span className="flex-1">{t("dashboard.ai.view.tester")}</span>
            {testing ? (
              <IconChevronRight size={15} className="shrink-0" />
            ) : (
              <IconExternalLink size={14} className="shrink-0" />
            )}
          </button>
          <p className="mt-2 px-1 text-[11px] leading-snug text-faint">
            {t("dashboard.ai.view.openTheTesterTo")}
          </p>
        </div>
      </Panel>

      <Panel className={clsx("p-5", testing && clsx("lg:flex lg:flex-col", FULL_HEIGHT))}>
        <AiSections tab={tab} config={config} business={business} aiReady={aiReady} loginId={loginId} owner={owner} />
      </Panel>
    </div>
  );
}

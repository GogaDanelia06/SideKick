"use client";

import { Activity, type ReactNode } from "react";
import type { AiConfig, Business } from "@prisma/client";
import type { AutosaveOwner } from "@/lib/dashboard/autosave/request";
import { AutosaveOwnerContext } from "./autosaveOwner";
import { BusinessSection } from "./sections/BusinessSection";
import { CharacterSection } from "./sections/CharacterSection";
import { RulesSection } from "./sections/RulesSection";
import { PromptSection } from "./sections/PromptSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { TesterSection } from "./sections/TesterSection";

export type AiTab = "business" | "character" | "rules" | "prompt" | "languages" | "tester";

type Props = {
  tab: AiTab;
  config: AiConfig | null;
  business: Business | null;
  aiReady: boolean;
  loginId: string;
  owner: AutosaveOwner;
};

/** Keeps a form mounted while hidden; hiding it runs its effects' cleanup, which saves it. */
function Kept({ show, children }: { show: boolean; children: ReactNode }) {
  // `hidden` too: the React canary in Next 16.2 left the first section added after hydration visible.
  return (
    <Activity mode={show ? "visible" : "hidden"}>
      <div hidden={!show}>{children}</div>
    </Activity>
  );
}

/**
 * The open section. The four forms stay mounted while hidden (Activity), so what was
 * typed survives switching sections, and hiding one is what saves it (useSectionAutosave).
 * Languages save on every click, and the tester has nothing to save.
 */
export function AiSections({ tab, config, business, aiReady, loginId, owner }: Props) {
  return (
    <AutosaveOwnerContext.Provider value={owner}>
      <Kept show={tab === "business"}>
        <BusinessSection business={business} />
      </Kept>
      <Kept show={tab === "character"}>
        <CharacterSection config={config} />
      </Kept>
      <Kept show={tab === "rules"}>
        <RulesSection config={config} />
      </Kept>
      <Kept show={tab === "prompt"}>
        <PromptSection config={config} aiReady={aiReady} />
      </Kept>
      {tab === "languages" && <LanguagesSection config={config} />}
      {tab === "tester" && <TesterSection aiReady={aiReady} loginId={loginId} />}
    </AutosaveOwnerContext.Provider>
  );
}

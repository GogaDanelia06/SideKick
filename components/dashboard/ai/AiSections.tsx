"use client";

import { Activity, type ReactNode } from "react";
import type { AiConfig, Business } from "@prisma/client";
import type { SectionOwner } from "@/lib/dashboard/sectionSave/request";
import { SectionOwnerContext } from "./sectionOwner";
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
  owner: SectionOwner;
};

function Kept({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <Activity mode={show ? "visible" : "hidden"}>
      <div hidden={!show}>{children}</div>
    </Activity>
  );
}

export function AiSections({ tab, config, business, aiReady, loginId, owner }: Props) {
  return (
    <SectionOwnerContext.Provider value={owner}>
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
        <PromptSection key={config?.prompt ? "saved" : "empty"} config={config} aiReady={aiReady} />
      </Kept>
      {tab === "languages" && <LanguagesSection config={config} />}
      {tab === "tester" && <TesterSection aiReady={aiReady} loginId={loginId} />}
    </SectionOwnerContext.Provider>
  );
}

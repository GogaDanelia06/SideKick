"use client";

import type { AiConfig } from "@prisma/client";
import { IconSquareRoundedLetterA } from "@tabler/icons-react";
import { AI_ADDRESS_FORMS, AI_DEFAULTS, AI_EMOJI_LEVELS, AI_LENGTHS, AI_STYLES } from "@/lib/ai/settings";
import { ChipChoice } from "../parts";
import { SectionForm } from "../SectionForm";

export function CharacterSection({ config }: { config: AiConfig | null }) {
  return (
    <SectionForm
      section="character"
      icon={IconSquareRoundedLetterA}
      title={"dashboard.ai.characterSection.character"}
    >
      <div className="grid gap-5">
        <ChipChoice
          name="style"
          label={"dashboard.ai.characterSection.communicationStyle"}
          options={AI_STYLES}
          value={config?.style ?? AI_DEFAULTS.style}
        />
        <ChipChoice
          name="length"
          label={"dashboard.ai.characterSection.responseLength"}
          options={AI_LENGTHS}
          value={config?.length ?? AI_DEFAULTS.length}
        />
        <ChipChoice
          name="emoji"
          label={"dashboard.ai.characterSection.emoji"}
          options={AI_EMOJI_LEVELS}
          value={config?.emoji ?? AI_DEFAULTS.emoji}
        />
        <ChipChoice
          name="addressForm"
          label={"dashboard.ai.characterSection.formOfAddress"}
          options={AI_ADDRESS_FORMS}
          value={config?.addressForm ?? AI_DEFAULTS.addressForm}
        />
      </div>
    </SectionForm>
  );
}

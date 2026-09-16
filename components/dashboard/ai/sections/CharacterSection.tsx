"use client";

import type { AiConfig } from "@prisma/client";
import { IconSquareRoundedLetterA } from "@tabler/icons-react";
import { saveAiCharacter } from "@/lib/dashboard/actions/aiConfig";
import { AI_ADDRESS_FORMS, AI_DEFAULTS, AI_EMOJI_LEVELS, AI_LENGTHS, AI_STYLES } from "@/lib/ai/settings";
import { ChipChoice, SectionForm } from "../parts";

export function CharacterSection({ config }: { config: AiConfig | null }) {
  return (
    <SectionForm
      icon={IconSquareRoundedLetterA}
      title={{ ka: "ხასიათი", en: "Character" }}
      action={saveAiCharacter}
    >
      <div className="grid gap-5">
        <ChipChoice
          name="style"
          label={{ ka: "კომუნიკაციის სტილი", en: "Communication style" }}
          options={AI_STYLES}
          value={config?.style ?? AI_DEFAULTS.style}
        />
        <ChipChoice
          name="length"
          label={{ ka: "პასუხის სიგრძე", en: "Response length" }}
          options={AI_LENGTHS}
          value={config?.length ?? AI_DEFAULTS.length}
        />
        <ChipChoice
          name="emoji"
          label={{ ka: "ემოჯები", en: "Emoji" }}
          options={AI_EMOJI_LEVELS}
          value={config?.emoji ?? AI_DEFAULTS.emoji}
        />
        <ChipChoice
          name="addressForm"
          label={{ ka: "მიმართვის ფორმა", en: "Form of address" }}
          options={AI_ADDRESS_FORMS}
          value={config?.addressForm ?? AI_DEFAULTS.addressForm}
        />
      </div>
    </SectionForm>
  );
}

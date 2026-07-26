"use client";

import type { AiConfig } from "@prisma/client";
import { IconSquareRoundedLetterA } from "@tabler/icons-react";
import { saveAiCharacter } from "@/lib/dashboard/actions";
import { ChipChoice, SectionForm } from "../parts";

const STYLE = ["მეგობრული", "პროფესიონალური", "ოფიციალური", "გაყიდვებზე ორიენტირებული", "კონსულტანტის სტილი"];
const LENGTH = ["მოკლე", "საშუალო", "დეტალური"];
const EMOJI = ["არასოდეს", "ზომიერად", "ხშირად"];
const ADDR = ["ფორმალური", "ფამილიარული"];

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
          options={STYLE}
          value={config?.style ?? null}
        />
        <ChipChoice
          name="length"
          label={{ ka: "პასუხის სიგრძე", en: "Response length" }}
          options={LENGTH}
          value={config?.length ?? null}
        />
        <ChipChoice
          name="emoji"
          label={{ ka: "ემოჯები", en: "Emoji" }}
          options={EMOJI}
          value={config?.emoji ?? null}
        />
        <ChipChoice
          name="addressForm"
          label={{ ka: "მიმართვის ფორმა", en: "Form of address" }}
          options={ADDR}
          value={config?.addressForm ?? null}
        />
      </div>
    </SectionForm>
  );
}

"use client";

import type { ReactNode } from "react";
import { IconRestore } from "@tabler/icons-react";
import type { Bilingual, IconType } from "@/lib/content/types";
import type { SectionKey } from "@/lib/dashboard/sectionSave/request";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SectionHead } from "./parts";
import { RESTORED } from "./saveMessages";
import { SaveBar } from "./SaveBar";
import { useSectionSave } from "./useSectionSave";

/** A section of the AI page: it is saved by its own Save button, and by nothing else. */
export function SectionForm({
  section,
  icon,
  title,
  hint,
  right,
  extraActions,
  children,
}: {
  section: SectionKey;
  icon: IconType;
  title: Bilingual;
  hint?: Bilingual;
  right?: ReactNode;
  extraActions?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const { formRef, restored, dirty, saving, save, cancel } = useSectionSave(section, title);

  return (
    <form
      ref={formRef}
      // Nothing is posted: Enter in a field saves the section, like the button.
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      className="flex flex-col gap-5"
    >
      <SectionHead icon={icon} title={title} hint={hint} right={right} />

      {restored ? (
        <p role="status" className="flex items-start gap-2 rounded-[10px] border border-blue bg-blue-surface px-3.5 py-2.5 text-[13px] text-blue">
          <IconRestore size={16} className="mt-px shrink-0" />
          {t(RESTORED)}
        </p>
      ) : null}

      {children}

      {extraActions}
      <SaveBar dirty={dirty} saving={saving} onCancel={cancel} />
    </form>
  );
}

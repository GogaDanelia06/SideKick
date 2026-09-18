"use client";

import type { ReactNode } from "react";
import { IconCloudCheck, IconRestore } from "@tabler/icons-react";
import type { Bilingual, IconType } from "@/lib/content/types";
import type { AutosaveSection } from "@/lib/dashboard/autosave/request";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SectionHead } from "./parts";
import { AUTOSAVE_HINT, RESTORED } from "./saveMessages";
import { useSectionAutosave } from "./useSectionAutosave";

/** A section of the AI page. It has no save button: it saves itself when the user leaves it. */
export function SectionForm({
  section,
  icon,
  title,
  hint,
  right,
  extraActions,
  children,
}: {
  section: AutosaveSection;
  icon: IconType;
  title: Bilingual;
  hint?: Bilingual;
  right?: ReactNode;
  extraActions?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const { formRef, restored } = useSectionAutosave(section, title);

  return (
    // Enter in a field must not submit: a plain form would put every field into the URL.
    <form ref={formRef} onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
      <SectionHead icon={icon} title={title} hint={hint} right={right} />

      {restored ? (
        <p role="status" className="flex items-start gap-2 rounded-[10px] border border-blue bg-blue-surface px-3.5 py-2.5 text-[13px] text-blue">
          <IconRestore size={16} className="mt-px shrink-0" />
          {t(RESTORED)}
        </p>
      ) : null}

      {children}

      {extraActions}
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <IconCloudCheck size={15} className="shrink-0" />
        {t(AUTOSAVE_HINT)}
      </p>
    </form>
  );
}

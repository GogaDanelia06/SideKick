"use client";

import type { LegalSection } from "@prisma/client";
import {
  createLegalSection,
  updateLegalSection,
  deleteLegalSection,
  moveLegalSection,
  toggleLegalPublished,
} from "@/lib/admin/actions/legal";
import { AddForm, EditForm } from "@/components/admin/ui/EditorForms";
import { EditorBar, ItemCard } from "@/components/admin/ui/EditorParts";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useListEditor } from "@/components/admin/ui/useListEditor";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { LegalTitleForm } from "./LegalTitleForm";
import { SectionFields } from "./SectionFields";
import { SectionRow } from "./SectionRow";

const ERRORS: Record<string, Text> = {
  heading_required: "admin.legal.editor.headingIsRequiredIn",
  unknown_doc: "admin.legal.editor.unknownDocument",
  not_found: "admin.legal.editor.notFound",
};

export function LegalEditor({
  doc,
  sections,
  title,
  defaultTitle,
}: {
  doc: string;
  sections: LegalSection[];
  title: { ka: string; en: string };
  defaultTitle: string;
}) {
  const { t } = useLanguage();
  const editor = useListEditor(sections, deleteLegalSection);

  return (
    <div className="flex flex-col gap-4">
      <LegalTitleForm doc={doc} title={title} defaultTitle={defaultTitle} run={editor.run} pending={editor.pending} />

      <EditorBar
        count={sections.length}
        noun="admin.legal.editor.sections"
        adding={editor.adding}
        addLabel="admin.legal.editor.addSection"
        closeLabel="admin.legal.editor.close"
        onToggle={editor.toggleAdding}
      />

      {editor.error ? <ErrorBanner>{t(ERRORS[editor.error] ?? "admin.legal.editor.somethingWentWrong")}</ErrorBanner> : null}

      {editor.adding ? (
        <AddForm
          create={(fd) => createLegalSection(doc, fd)}
          run={editor.run}
          onDone={editor.closeAdding}
          pending={editor.pending}
          label="admin.legal.editor.add"
        >
          <SectionFields />
        </AddForm>
      ) : null}

      {editor.visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-4 py-3 text-[13px] text-muted">
          {t("admin.legal.editor.noSectionsYet")}
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {editor.visible.map((s, i) => (
          <ItemCard key={s.id}>
            {editor.editing === s.id ? (
              <EditForm
                update={(fd) => updateLegalSection(s.id, fd)}
                run={editor.run}
                onDone={editor.finishEditing}
                onCancel={editor.cancelEditing}
                pending={editor.pending}
                labels={{ cancel: "admin.legal.editor.cancel", save: "admin.legal.editor.save" }}
              >
                <SectionFields initial={s} />
              </EditForm>
            ) : (
              <SectionRow
                section={s}
                index={i}
                first={i === 0}
                last={i === sections.length - 1}
                busy={editor.pending}
                onMove={(where) => editor.run(() => moveLegalSection(s.id, where))}
                onPublish={() => editor.run(() => toggleLegalPublished(s.id, !s.published))}
                onEdit={() => editor.startEditing(s.id)}
                onRemove={() => editor.remove(s.id)}
              />
            )}
          </ItemCard>
        ))}
      </div>
    </div>
  );
}

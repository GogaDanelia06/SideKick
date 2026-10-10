"use client";

import type { SiteFaq } from "@prisma/client";
import { createFaq, updateFaq, deleteFaq, moveFaq, toggleFaqPublished } from "@/lib/admin/actions/faq";
import { AddForm, EditForm } from "@/components/admin/ui/EditorForms";
import { EditorBar, EmptyState, ItemCard } from "@/components/admin/ui/EditorParts";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { RowTools, type RowLabels } from "@/components/admin/ui/RowTools";
import { useListEditor } from "@/components/admin/ui/useListEditor";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { FaqFields } from "./FaqFields";

const ERRORS: Record<string, Text> = {
  all_fields_required: "admin.faq.editor.fillInAllFour",
  not_found: "admin.faq.editor.notFound",
};

const TOOLS: RowLabels = {
  up: "admin.faq.editor.moveUp",
  down: "admin.faq.editor.moveDown",
  toggle: "admin.faq.editor.togglePublish",
  edit: "admin.faq.editor.edit",
  remove: "admin.faq.editor.delete",
};

export function FaqEditor({ faqs }: { faqs: SiteFaq[] }) {
  const { t } = useLanguage();
  const editor = useListEditor(faqs, deleteFaq);

  return (
    <div className="flex flex-col gap-4">
      <EditorBar
        count={faqs.length}
        noun="admin.faq.editor.questions"
        adding={editor.adding}
        addLabel="admin.faq.editor.addQuestion"
        closeLabel="admin.faq.editor.close"
        onToggle={editor.toggleAdding}
      />

      {editor.error ? <ErrorBanner>{t(ERRORS[editor.error] ?? "admin.faq.editor.somethingWentWrong")}</ErrorBanner> : null}

      {editor.adding ? (
        <AddForm create={createFaq} run={editor.run} onDone={editor.closeAdding} pending={editor.pending} label="admin.faq.editor.add">
          <FaqFields />
        </AddForm>
      ) : null}

      {faqs.length === 0 && !editor.adding ? <EmptyState>{t("admin.faq.editor.noQuestionsYet")}</EmptyState> : null}

      <div className="flex flex-col gap-2.5">
        {editor.visible.map((f, i) => (
          <ItemCard key={f.id}>
            {editor.editing === f.id ? (
              <EditForm
                update={(fd) => updateFaq(f.id, fd)}
                run={editor.run}
                onDone={editor.finishEditing}
                onCancel={editor.cancelEditing}
                pending={editor.pending}
                labels={{ cancel: "admin.faq.editor.cancel", save: "admin.faq.editor.save" }}
              >
                <FaqFields initial={f} />
              </EditForm>
            ) : (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className={f.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
                    {f.questionKa}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-muted">{f.answerKa}</div>
                </div>
                <RowTools
                  first={i === 0}
                  last={i === faqs.length - 1}
                  pending={editor.pending}
                  published={f.published}
                  labels={TOOLS}
                  onMove={(direction) => editor.run(() => moveFaq(f.id, direction))}
                  onToggle={() => editor.run(() => toggleFaqPublished(f.id, !f.published))}
                  onEdit={() => editor.startEditing(f.id)}
                  onRemove={() => editor.remove(f.id)}
                />
              </div>
            )}
          </ItemCard>
        ))}
      </div>
    </div>
  );
}

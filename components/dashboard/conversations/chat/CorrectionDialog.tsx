"use client";

import { IconLoader2, IconSparkles, IconX } from "@tabler/icons-react";
import { PromptDiffPanel } from "@/components/dashboard/ai/sections/PromptDiffPanel";
import { WorkingIndicator } from "@/components/dashboard/ui/WorkingIndicator";
import { diffText, hasChanges } from "@/lib/diff";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useCorrectionDialog } from "./useCorrectionDialog";

const BTN = "inline-flex h-10 items-center justify-center gap-1.5 rounded-[8px] px-4 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-50";

export function CorrectionDialog({
  conversationId,
  messageIds,
  onClose,
  onSaved,
}: {
  conversationId: string;
  messageIds: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const d = useCorrectionDialog(conversationId, messageIds, onSaved);
  const changed = d.proposal ? hasChanges(diffText(d.proposal.saved, d.proposal.prompt, { skipBlankLines: true })) : false;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="correction-title"
        className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[14px] border border-border bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="correction-title" className="text-[15px] font-semibold">{t("dashboard.conversations.correction.title")}</h2>
            <p className="mt-1 text-xs text-muted">
              {t("dashboard.conversations.correction.describe", { count: messageIds.length })}
            </p>
          </div>
          <button type="button" disabled={d.pending} onClick={onClose} aria-label={t("dashboard.conversations.correction.close")} className="grid size-8 shrink-0 place-items-center rounded-[6px] border border-border text-muted disabled:opacity-40">
            <IconX size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-auto p-5">
          <textarea
            rows={4}
            value={d.note}
            onChange={(e) => d.changeNote(e.target.value)}
            disabled={d.pending}
            placeholder={t("dashboard.conversations.correction.placeholder")}
            className="w-full rounded-[8px] border border-input bg-canvas p-3 text-sm outline-none placeholder:text-faint focus:border-blue disabled:opacity-60"
          />
          <button type="button" disabled={d.pending || !d.note.trim()} onClick={d.preview} className={`${BTN} border border-ai text-ai`}>
            {d.pending ? <IconLoader2 size={16} className="animate-spin" /> : <IconSparkles size={16} />}
            {t("dashboard.conversations.correction.preview")}
          </button>
          {d.pending ? <WorkingIndicator hint="dashboard.conversations.correction.working" /> : null}
          {d.error ? <p className="text-[13px] text-red">{t(d.error)}</p> : null}
          {d.proposal && changed ? <PromptDiffPanel saved={d.proposal.saved} current={d.proposal.prompt} context={0} /> : null}
          {d.proposal && !changed ? <p className="text-[13px] text-amber">{t("dashboard.conversations.correction.noChange")}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border2 px-5 py-3">
          <button type="button" disabled={d.pending} onClick={onClose} className={`${BTN} border border-border text-muted`}>
            {t("dashboard.conversations.correction.close")}
          </button>
          <button type="button" disabled={d.pending || !changed} onClick={d.save} className={`${BTN} bg-primary text-white`}>
            {t("dashboard.conversations.correction.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

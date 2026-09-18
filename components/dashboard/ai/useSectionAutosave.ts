"use client";

import { useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/Toast";
import type { Bilingual } from "@/lib/content/types";
import { dropDraft, readDraft, writeDraft } from "@/lib/dashboard/autosave/drafts";
import { applyFields, changedFields, readFields, toEntries, type Fields } from "@/lib/dashboard/autosave/fields";
import { autosaveStopped, onFlush } from "@/lib/dashboard/autosave/flush";
import type { AutosaveSection } from "@/lib/dashboard/autosave/request";
import { sendSave, type SaveOutcome } from "@/lib/dashboard/autosave/send";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AutosaveOwnerContext } from "./autosaveOwner";
import { SAVED, SAVE_OUTCOME } from "./saveMessages";

/**
 * Saves a section's form when the user leaves it: for another section or page, another
 * browser tab, a closing tab, a business switch or a logout. Nothing is sent while
 * they type, and nothing at all when no field changed.
 */
export function useSectionAutosave(section: AutosaveSection, title: Bilingual) {
  const owner = useContext(AutosaveOwnerContext);
  const userId = owner?.userId;
  const businessId = owner?.businessId;
  const formRef = useRef<HTMLFormElement>(null);
  /** The form as the server has it, as far as this page knows. */
  const saved = useRef<Fields | null>(null);
  const [restored, setRestored] = useState(false);
  const { t } = useLanguage();
  const notify = useToast();
  const router = useRouter();

  const report = useEffectEvent((outcome: SaveOutcome, refresh: boolean) => {
    if (!outcome.ok) return notify(t(SAVE_OUTCOME[outcome.error]), "error");
    // Fresh server data everywhere, so going back to this page never shows the old values.
    if (refresh) router.refresh();
    notify(`${t(SAVED)}: ${t(title)}`);
  });

  useEffect(() => {
    const form = formRef.current;
    if (!form || !userId || !businessId) return;
    const place = { userId, businessId, section };

    // Once per mount; an Activity that is hidden and shown again keeps what was typed.
    if (saved.current === null) {
      saved.current = readFields(form);
      const draft = readDraft(place);
      if (draft && changedFields(saved.current, { ...saved.current, ...draft.fields })) {
        applyFields(form, draft.fields);
        setRestored(true);
      } else if (draft) {
        dropDraft(place);
      }
    }

    function save(refresh: boolean): Promise<void> {
      const before = saved.current;
      const now = readFields(form!);
      const changed = before && !autosaveStopped() ? changedFields(before, now) : null;
      if (!before || !changed) return Promise.resolve();

      const draftId = writeDraft(place, changed);
      saved.current = now;
      return sendSave({ ...place, entries: toEntries(now) }).then((outcome) => {
        // A permission refusal would only come back again: said once, not retried or kept.
        const retry = !outcome.ok && outcome.error !== "forbidden";
        if (!retry) dropDraft(place, draftId);
        else if (saved.current === now) saved.current = before;
        report(outcome, refresh);
      });
    }

    const onHidden = () => void (document.visibilityState === "hidden" && save(true));
    const onPageHide = () => void save(false);
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onPageHide);
    // A business switch or logout reloads the page right after, so no refresh then.
    const unregister = onFlush(() => save(false));

    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onPageHide);
      unregister();
      // Leaving: the section was hidden for another one, or the page is going away.
      void save(true);
    };
  }, [userId, businessId, section]);

  return { formRef, restored };
}

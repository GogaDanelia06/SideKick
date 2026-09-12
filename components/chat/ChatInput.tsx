"use client";

import { useRef, useState } from "react";
import { IconPaperclip, IconSend } from "@tabler/icons-react";
import { ACCEPT_ATTRIBUTE, type AttachmentError } from "@/lib/chat/attachment";
import { CHAT } from "@/lib/content/chat";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ERRORS: Record<AttachmentError, keyof typeof CHAT> = {
  bad_type: "badType",
  too_large: "tooLarge",
};

export function ChatInput({
  placeholder,
  onSend,
  onFile,
}: {
  placeholder: string;
  onSend: (text: string) => void;
  /** Omit to hide the attach button entirely. */
  onFile?: (file: File) => AttachmentError | null;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<AttachmentError | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    onSend(draft);
    setDraft("");
  };

  function pick(file: File | undefined) {
    // Reset, so picking the same file again still fires a change event.
    if (fileRef.current) fileRef.current.value = "";
    if (!file || !onFile) return;
    setError(onFile(file));
  }

  return (
    <div className="border-t border-border p-3">
      <div className="flex gap-2">
        {onFile ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT_ATTRIBUTE}
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
            <button
              type="button"
              aria-label={t(CHAT.attach)}
              title={t(CHAT.attach)}
              onClick={() => fileRef.current?.click()}
              className="grid w-10 shrink-0 place-items-center rounded-sm border border-input text-muted transition-colors hover:border-blue hover:text-ink"
            >
              <IconPaperclip size={18} />
            </button>
          </>
        ) : null}

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-sm border border-input bg-bg px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-blue"
        />

        <button
          type="button"
          aria-label={t(CHAT.send)}
          onClick={submit}
          className="grid w-11 shrink-0 place-items-center rounded-sm bg-primary text-white"
        >
          <IconSend size={18} />
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-[12px] text-red">
          {t(CHAT[ERRORS[error]] as { ka: string; en: string })}
        </p>
      ) : null}
    </div>
  );
}

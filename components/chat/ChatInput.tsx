"use client";

import { useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { CHAT } from "@/lib/content/chat";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Text input + send button. Enter (without shift) submits. */
export function ChatInput({
  placeholder,
  onSend,
}: {
  placeholder: string;
  onSend: (text: string) => void;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState("");

  const submit = () => {
    onSend(draft);
    setDraft("");
  };

  return (
    <div className="flex gap-2 border-t border-border p-3">
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
  );
}

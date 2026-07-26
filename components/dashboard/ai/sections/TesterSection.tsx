"use client";

import { useState } from "react";
import { IconFlask, IconSend, IconSparkles } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AiModuleNotice, INPUT } from "../parts";

export function TesterSection() {
  const { t } = useLanguage();
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-ai-surface text-ai">
          <IconFlask size={18} />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold">{t({ ka: "ტესტერი", en: "Tester" })}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-green" />
            {t({ ka: "გატესტე მიმდინარე პრომპტი", en: "Test your current prompt" })}
          </p>
        </div>
      </div>

      <AiModuleNotice
        text={{
          ka: "ქვემოთ ნაჩვენებია სატესტო მაგალითი. ცოცხალი პასუხების გენერაცია საჭიროებს AI მოდულს — ინტერფეისი მზადაა და ჩაირთვება მოდულის დამატებისთანავე.",
          en: "The exchange below is a sample. Generating live replies requires the AI module — the interface is ready and switches on as soon as that module is added.",
        }}
      />

      <div className="flex h-[380px] flex-col overflow-hidden rounded-[10px] border border-border bg-canvas">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="flex">
            <span className="max-w-[80%] rounded-[10px] rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px]">
              {t({ ka: "გამარჯობა, მუშაობთ კვირას?", en: "Hi, are you open on Sunday?" })}
            </span>
          </div>

          <div className="flex justify-end">
            <span className="max-w-[80%] rounded-[10px] rounded-tr-sm border border-ai bg-ai-surface px-3.5 py-2.5 text-[13px] text-ai">
              <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold opacity-80">
                <IconSparkles size={12} />
                AI ({t({ ka: "სატესტო", en: "sample" })})
              </span>
              {t({
                ka: "დიახ! კვირას ვმუშაობთ 11:00–18:00. რით შემიძლია დაგეხმაროთ? 😊",
                en: "Yes! On Sunday we're open 11:00–18:00. How can I help? 😊",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t({ ka: "დაწერე შეტყობინება…", en: "Type a message…" })}
            className={INPUT}
          />
          <button
            type="button"
            disabled
            title={t({ ka: "საჭიროებს AI მოდულს", en: "Requires the AI module" })}
            className="inline-flex h-10 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white opacity-50"
          >
            <IconSend size={16} />
            {t({ ka: "გაგზავნა", en: "Send" })}
          </button>
        </div>
      </div>

    </div>
  );
}

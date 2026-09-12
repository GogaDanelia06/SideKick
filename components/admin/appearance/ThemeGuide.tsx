"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const STEPS: Bilingual[] = [
  {
    ka: "აირჩიე რომელ თემას ასწორებ — მუქს თუ ღიას. ეკრანიც მაშინვე გადაირთვება, რომ ის ხედავდე რასაც ცვლი.",
    en: "Pick which theme you are editing — dark or light. The screen switches with it, so you are looking at what you change.",
  },
  {
    ka: "აიღე მზა პალიტრა ან შეცვალე ცალკეული ფერი. ცვლილება მაშინვე ჩანს — ეს გვერდიც იმ ფერებშია.",
    en: "Take a ready-made palette, or change single colours. You see it immediately — this page wears them too.",
  },
  {
    ka: "მარჯვნივ ნახავ, როგორ გამოიყურება საიტი და დაშბორდი. მოგწონს — შეინახე. არა — დააჭირე გაუქმებას.",
    en: "On the right you see how the site and the dashboard look. Happy with it — save. Not happy — Discard.",
  },
];

export function ThemeGuide() {
  const { t } = useLanguage();

  return (
    <ol className="mb-5 grid gap-2.5 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
      {STEPS.map((step, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-soft text-[11px] font-semibold text-ink">
            {i + 1}
          </span>
          <span className="text-[12px] leading-snug text-muted">{t(step)}</span>
        </li>
      ))}
    </ol>
  );
}

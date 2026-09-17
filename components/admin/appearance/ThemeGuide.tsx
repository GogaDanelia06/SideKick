"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const STEPS: Bilingual[] = [
  {
    ka: "ყველ ფერს ორი მნიშვნელობა აქვს — მუქი და ღია თემისთვის. რომელიც შეცვლი, ეკრანიც ის თემაზე გადაირთვება, რომ შედეგი ნახავ.",
    en: "Every colour has two values: one for the dark theme and one for the light theme. Change either, and the screen switches to that theme so you see the result.",
  },
  {
    ka: "მიიტანე მაუსი ფერზე — მარჯვნივ მოინიშნება, სად გამოიყენება. მზა პალიტრა ორივე თემას ერთდროულად ცვლის.",
    en: "Point at a colour to see where it is used on the right. A ready-made palette sets both themes at once.",
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
          <span className="text-[13px] leading-snug text-muted">{t(step)}</span>
        </li>
      ))}
    </ol>
  );
}

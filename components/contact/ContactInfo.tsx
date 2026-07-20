"use client";

import { Card } from "@/components/ui/Card";
import { CONTACT_INFO } from "@/lib/content/contact";
import { SOCIALS, SOCIAL_LABEL } from "@/lib/content/social";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Left column of the contact page: reachable channels. */
export function ContactInfo() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3.5">
      {CONTACT_INFO.map((item) => (
        <Card key={item.value} className="flex items-center gap-3.5 p-5">
          <div className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-blue-surface text-blue">
            <item.icon size={21} />
          </div>
          <div>
            <div className="text-[12px] text-muted">{t(item.label)}</div>
            <a href={item.href} className="font-mono text-[15px] font-medium">
              {item.value}
            </a>
          </div>
        </Card>
      ))}
      <Card className="p-5">
        <div className="mb-3 text-[12px] text-muted">{t(SOCIAL_LABEL)}</div>
        <div className="flex gap-2.5">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="grid size-[38px] place-items-center rounded-sm border border-border text-muted hover:text-ink"
            >
              <s.icon size={18} />
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

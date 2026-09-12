"use client";

import { Card } from "@/components/ui/Card";
import { CONTACT_INFO } from "@/lib/content/contact";
import { SOCIALS, SOCIAL_LABEL } from "@/lib/content/social";
import { useLanguage } from "@/lib/i18n/useLanguage";

const SOCIAL_HOVER: Record<string, string> = {
  Facebook: "hover:border-[#1877F2] hover:text-[#1877F2]",
  Instagram: "hover:border-[#E4405F] hover:text-[#E4405F]",
  WhatsApp: "hover:border-[#25D366] hover:text-[#25D366]",
  LinkedIn: "hover:border-[#0A66C2] hover:text-[#0A66C2]",
};

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

        <div className="grid grid-cols-2 gap-2.5">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-[38px] items-center justify-center gap-2 rounded-sm border border-border px-3 text-[13px] font-medium text-muted transition-colors duration-200 ${
                SOCIAL_HOVER[social.label] ?? "hover:text-ink"
              }`}
            >
              <social.icon size={18} />
              {social.label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
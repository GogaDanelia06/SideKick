"use client";

import { IconMail, IconPhone } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import type { ContactDetails, ContactLink } from "@/lib/content/contactDetails";
import { CONTACT_LABELS } from "@/lib/content/contact";
import { SOCIAL_LABEL, SOCIAL_NETWORKS } from "@/lib/content/social";
import type { Bilingual, IconType } from "@/lib/content/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

function InfoCard({ icon: Icon, label, link }: { icon: IconType; label: Bilingual; link: ContactLink }) {
  const { t } = useLanguage();
  return (
    <Card className="flex items-center gap-3.5 p-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-blue-surface text-blue">
        <Icon size={21} />
      </div>
      <div>
        <div className="text-[12px] text-muted">{t(label)}</div>
        <a href={link.href} className="font-mono text-[15px] font-medium">
          {link.value}
        </a>
      </div>
    </Card>
  );
}

export function ContactInfo({ contact }: { contact: ContactDetails }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3.5">
      {contact.email ? <InfoCard icon={IconMail} label={CONTACT_LABELS.email} link={contact.email} /> : null}
      {contact.phone ? <InfoCard icon={IconPhone} label={CONTACT_LABELS.phone} link={contact.phone} /> : null}

      {contact.socials.length > 0 ? (
        <Card className="p-5">
          <div className="mb-3 text-[12px] text-muted">{t(SOCIAL_LABEL)}</div>
          <div className="grid grid-cols-2 gap-2.5">
            {contact.socials.map(({ network, href }) => {
              const { label, icon: Icon, hover } = SOCIAL_NETWORKS[network];
              return (
                <a
                  key={network}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-[38px] items-center justify-center gap-2 rounded-sm border border-border px-3 text-[13px] font-medium text-muted transition-colors duration-200 ${hover}`}
                >
                  <Icon size={18} />
                  {label}
                </a>
              );
            })}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

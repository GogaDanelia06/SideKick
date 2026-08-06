"use client";

import { IconHelpCircle } from "@tabler/icons-react";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

import { FAQ_HEADING, type FaqItem } from "@/lib/content/faq";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function Faq({ faqs }: { faqs: FaqItem[] }) {
  const { t } = useLanguage();

  if (faqs.length === 0) return null;

  return (
    <section className="pb-16">
      <Container className="max-w-[820px]">
        <SectionHeading
          badge={FAQ_HEADING.badge}
          badgeIcon={IconHelpCircle}
          title={FAQ_HEADING.title}
          sub={FAQ_HEADING.sub}
        />

        <div className="mt-6 flex flex-col gap-3">
          {faqs.map((item, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-5">
                <h3 className="font-semibold">
                  {t(item.question)}
                </h3>
              </div>

              <div className="border-t border-border px-5 pb-5 pt-4 text-sm leading-[1.7] text-muted">
                {t(item.answer)}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
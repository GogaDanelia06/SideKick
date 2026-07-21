"use client";

import { useState } from "react";
import clsx from "clsx";
import { IconChevronDown, IconHelpCircle } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ_HEADING, FAQS } from "@/lib/content/faq";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Accordion of common questions. Answers stay rendered (hidden when collapsed)
 *  so they're in the HTML for search engines, matching the FAQPage JSON-LD. */
export function Faq() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(0);

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
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Card key={i} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <span className="flex-1 font-semibold">{t(item.question)}</span>
                  <IconChevronDown
                    size={20}
                    className={clsx(
                      "shrink-0 text-muted transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={clsx(
                    "border-t border-border px-5 pb-5 pt-4 text-sm leading-[1.7] text-muted",
                    !isOpen && "hidden",
                  )}
                >
                  {t(item.answer)}
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

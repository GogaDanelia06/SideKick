"use client";

import { IconStack2 } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BENEFITS } from "@/lib/content/benefits";
import { BENEFITS_HEADING } from "@/lib/content/home";
import { resolveIcon } from "@/lib/content/icons";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { BoxView } from "@/lib/site/content";

/** Admin-editable boxes; falls back to the shipped set when the table is empty
 *  (e.g. before the production seed has run). */
export function Benefits({ boxes }: { boxes?: BoxView[] }) {
  const { t } = useLanguage();

  const items: BoxView[] =
    boxes && boxes.length > 0
      ? boxes
      : BENEFITS.map((b) => ({ icon: "", title: b.title, body: b.desc }));

  return (
    <section className="pb-16">
      <Container>
        <SectionHeading
          badge={BENEFITS_HEADING.badge}
          badgeIcon={IconStack2}
          title={BENEFITS_HEADING.title}
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            // Fallback entries carry no icon name; use the shipped component.
            const Ico = item.icon ? resolveIcon(item.icon) : BENEFITS[i]?.icon ?? resolveIcon(null);
            return (
              <Card key={i} className="p-[22px]">
                <div className="mb-3.5 grid size-[42px] place-items-center rounded-[10px] bg-blue-surface text-blue">
                  <Ico size={21} />
                </div>
                <h3 className="mb-1.5 text-lg font-semibold">{t(item.title)}</h3>
                <p className="text-sm text-muted">{t(item.body)}</p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

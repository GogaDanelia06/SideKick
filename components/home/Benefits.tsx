"use client";

import { IconStack2 } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BENEFITS } from "@/lib/content/benefits";
import { BENEFITS_HEADING } from "@/lib/content/home";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** "What Sidekick does" — six-card benefits grid. */
export function Benefits() {
  const { t } = useLanguage();

  return (
    <section className="pb-16">
      <Container>
        <SectionHeading
          badge={BENEFITS_HEADING.badge}
          badgeIcon={IconStack2}
          title={BENEFITS_HEADING.title}
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, i) => (
            <Card key={i} className="p-[22px]">
              <div className="mb-3.5 grid size-[42px] place-items-center rounded-[10px] bg-blue-surface text-blue">
                <benefit.icon size={21} />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold">{t(benefit.title)}</h3>
              <p className="text-sm text-muted">{t(benefit.desc)}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

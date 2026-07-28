"use client";

import { IconStack2 } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "./ServiceCard";
import { SERVICES, SERVICES_HEADING } from "@/lib/content/services";
import type { BoxView } from "@/lib/site/content";

/** Admin-editable boxes; falls back to the shipped set when the table is empty. */
export function Services({ boxes }: { boxes?: BoxView[] }) {
  const useDb = Boolean(boxes && boxes.length > 0);

  return (
    <section className="pb-6 pt-[60px]">
      <Container>
        <div className="mb-9">
          <SectionHeading
            badge={SERVICES_HEADING.badge}
            badgeIcon={IconStack2}
            title={SERVICES_HEADING.title}
            size="xl"
            as="h1"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {useDb
            ? boxes!.map((b, i) => (
                <ServiceCard key={i} title={b.title} body={b.body} iconName={b.icon} />
              ))
            : SERVICES.map((s, i) => (
                <ServiceCard key={i} title={s.title} body={s.desc} icon={s.icon} />
              ))}
        </div>
      </Container>
    </section>
  );
}

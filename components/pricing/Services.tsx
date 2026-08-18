"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "./ServiceCard";
import { SERVICES, SERVICES_HEADING } from "@/lib/content/services";
import type { BoxView } from "@/lib/site/content";
import type { Bilingual } from "@/lib/content/types";

/** Admin-editable heading and boxes; each falls back to the shipped copy when
 *  the admin hasn't set it. The title here is the page's H1. */
export function Services({
  boxes,
  badge,
  title,
  sub,
}: {
  boxes?: BoxView[];
  badge?: Bilingual;
  title?: Bilingual;
  sub?: Bilingual;
}) {
  const useDb = Boolean(boxes && boxes.length > 0);

  return (
    <section className="pb-6 pt-[60px]">
      <Container>
        <div className="mb-9">
          <SectionHeading
            badge={badge ?? SERVICES_HEADING.badge}
            title={title ?? SERVICES_HEADING.title}
            sub={sub ?? SERVICES_HEADING.sub}
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

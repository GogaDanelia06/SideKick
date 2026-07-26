"use client";

import { IconStack2 } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "./ServiceCard";
import { SERVICES, SERVICES_HEADING } from "@/lib/content/services";

export function Services() {
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
          {SERVICES.map((service, i) => (
            <ServiceCard key={i} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}

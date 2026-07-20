"use client";

import { IconMail } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactInfo } from "./ContactInfo";
import { ContactChat } from "./ContactChat";
import { CONTACT_HEADING } from "@/lib/content/contact";

export function ContactView() {
  return (
    <section className="pb-16 pt-[60px]">
      <Container className="max-w-[960px]">
        <div className="mb-10 text-center">
          <SectionHeading
            badge={CONTACT_HEADING.badge}
            badgeIcon={IconMail}
            title={CONTACT_HEADING.title}
            sub={CONTACT_HEADING.sub}
            size="xl"
            as="h1"
          />
        </div>
        <div className="grid gap-5 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <ContactInfo />
          <ContactChat />
        </div>
      </Container>
    </section>
  );
}

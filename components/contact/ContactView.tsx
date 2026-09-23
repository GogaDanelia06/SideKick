"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactInfo } from "./ContactInfo";
import { ContactChat } from "./ContactChat";
import { CONTACT_HEADING } from "@/lib/content/contact";
import type { Text } from "@/lib/i18n/messages";

/** The heading is the page's H1 and is admin-editable; each part falls back to
 *  the shipped copy when it hasn't been set. */
export function ContactView({
  badge,
  title,
  sub,
}: {
  badge?: Text;
  title?: Text;
  sub?: Text;
}) {
  return (
    <section className="pb-16 pt-[60px]">
      <Container className="max-w-[960px]">
        <div className="mb-10 text-center">
          <SectionHeading
            badge={badge ?? CONTACT_HEADING.badge}
            title={title ?? CONTACT_HEADING.title}
            sub={sub ?? CONTACT_HEADING.sub}
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

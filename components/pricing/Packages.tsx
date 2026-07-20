"use client";

import { IconGift, IconTag } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageCard } from "./PackageCard";
import { PACKAGES, PACKAGES_HEADING } from "@/lib/content/packages";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Three-tier pricing table (second pricing-page section). */
export function Packages() {
  const { t } = useLanguage();

  return (
    <section className="pb-16 pt-10">
      <Container>
        <div className="mb-9 text-center">
          <SectionHeading badge={PACKAGES_HEADING.badge} badgeIcon={IconTag} title={PACKAGES_HEADING.title} />
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[15px] text-muted">
            <IconGift size={16} className="text-green" />
            {t(PACKAGES_HEADING.note)}
          </p>
        </div>
        <div className="grid items-start gap-5 md:grid-cols-3">
          {PACKAGES.map((pkg, i) => (
            <PackageCard key={i} pkg={pkg} />
          ))}
        </div>
      </Container>
    </section>
  );
}

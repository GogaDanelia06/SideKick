"use client";

import { useState } from "react";
import { IconGift } from "@tabler/icons-react";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageCard } from "./PackageCard";
import { PeriodSwitch } from "./PeriodSwitch";
import {
  BILLING_PERIODS,
  FREE_PERIOD,
  PACKAGES_HEADING,
  type Package,
} from "@/lib/content/packages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

export function Packages({
  packages,
  free,
}: {
  packages: Package[];
  free?: {
    badge?: Bilingual;
    title?: Bilingual;
    text?: Bilingual;
  };
}) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState(BILLING_PERIODS[0]);

  return (
    <section id="pricing" className="scroll-mt-24 pb-16 pt-8">
      <Container>
        <SectionHeading
          badge={PACKAGES_HEADING.badge}
          title={PACKAGES_HEADING.title}
        />

        <div className="mb-8 flex justify-center">
          <PeriodSwitch value={period} onChange={setPeriod} />
        </div>

        <div className="grid items-start gap-5 md:grid-cols-3">
          {packages.map((pkg, i) => (
            <PackageCard
              key={i}
              pkg={pkg}
              period={period}
              freeBadge={free?.badge ? t(free.badge) : undefined}
            />
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-green bg-card px-6 py-5 text-center sm:px-10">
          <div className="mb-2 flex items-center justify-center gap-2 text-[15px] font-semibold text-green">
            <IconGift size={18} />
            {t(free?.title ?? FREE_PERIOD.bannerTitle)}
          </div>

          <p className="mx-auto max-w-[680px] text-sm leading-relaxed text-muted">
            {t(free?.text ?? FREE_PERIOD.bannerText)}
          </p>
        </div>
      </Container>
    </section>
  );
}
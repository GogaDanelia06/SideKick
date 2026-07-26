"use client";

import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Crumb } from "@/lib/content/breadcrumbs";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { t } = useLanguage();

  return (
    <Container>
      <nav aria-label="Breadcrumb" className="pt-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="font-medium text-ink">
                    {t(item.label)}
                  </span>
                ) : (
                  <Link href={item.href} className="transition-colors hover:text-ink">
                    {t(item.label)}
                  </Link>
                )}
                {!last ? <IconChevronRight size={14} className="text-muted" /> : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </Container>
  );
}

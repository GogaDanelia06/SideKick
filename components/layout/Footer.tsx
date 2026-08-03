"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { FOOTER } from "@/lib/content/footer";
import { track } from "@/lib/analytics/track";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-6 border-t border-border bg-sidebar pb-7 pt-[52px]">
      <Container>
        <div className="mb-9 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="mb-3" />
            <p className="max-w-[280px] text-sm text-muted">{t(FOOTER.tagline)}</p>
            <p className="mt-2 text-sm text-muted">{t(FOOTER.company)}</p>
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            {FOOTER.contact.map((c) => (
              <a key={c.value} href={c.href} className="hover:text-ink">
                {t(c.label)} : {c.value}
              </a>
            ))}
          </div>
          <div className="md:text-right">
            <h4 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.04em] text-muted">
              {t(FOOTER.linksHeading)}
            </h4>
            {FOOTER.links.map((l) => (
              <Link
                key={l.href + t(l.label)}
                href={l.href}
                onClick={() =>
                  track("footer_link_click", {
                    // The Georgian label, so the report reads the same as the site.
                    link_name: l.label.ka,
                    link_url: l.href,
                    link_type: l.href.startsWith("http") ? "external" : "internal",
                  })
                }
                className="mb-2.5 block text-sm text-muted hover:text-ink"
              >
                {t(l.label)}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-border pt-[22px] text-center text-[13px] text-muted">
          {t(FOOTER.copyright)}
        </div>
      </Container>
    </footer>
  );
}

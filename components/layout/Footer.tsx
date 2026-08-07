"use client";

import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

import { track } from "@/lib/analytics/track";
import { FOOTER } from "@/lib/content/footer";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ROUTES } from "@/lib/routes";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-6 border-t border-border bg-sidebar pb-7 pt-[52px]">
      <Container>
        <div className="mb-9 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="mb-3" />

            <p className="max-w-[280px] text-sm text-muted">
              {t(FOOTER.tagline)}
            </p>

            <p className="mt-2 text-sm text-muted">
              {t(FOOTER.company)}
            </p>
          </div>

          <div>
<Link
  href={ROUTES.about}
  className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.04em] text-muted hover:text-ink"
>
  {t(FOOTER.linksHeading)}
</Link>

            {FOOTER.links.map((link) => (
              <Link
                key={link.href + t(link.label)}
                href={link.href}
                onClick={() =>
                  track("footer_link_click", {
                    link_name: link.label.ka,
                    link_url: link.href,
                    link_type: link.href.startsWith("http")
                      ? "external"
                      : "internal",
                  })
                }
                className="mb-2.5 block text-sm text-muted hover:text-ink"
              >
                {t(link.label)}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 text-sm text-muted md:items-end md:text-right">
            {FOOTER.contact.map((contact) => (
              <a
                key={contact.value}
                href={contact.href}
                className="hover:text-ink"
              >
                {t(contact.label)} : {contact.value}
              </a>
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
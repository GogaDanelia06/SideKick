"use client";

import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { FOOTER } from "@/lib/content/footer";
import { track } from "@/lib/analytics/track";
import { useLanguage } from "@/lib/i18n/useLanguage";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-5">
      <span className="inline-block border-b-2 border-primary pb-2 text-base font-semibold text-ink">
        {children}
      </span>
    </h4>
  );
}

export function Footer() {
  const { t } = useLanguage();

  const trackLink = (label: string, href: string) =>
    track("footer_link_click", {
      link_name: label,
      link_url: href,
      link_type: href.startsWith("http") ? "external" : "internal",
    });

  return (
    <footer className="mt-6 border-t border-border bg-sidebar pb-7 pt-14">
      <Container>
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="mb-4" />
            <p className="max-w-[280px] text-sm leading-7 text-muted">
              {t(FOOTER.tagline)}
            </p>
            <p className="mt-3 text-sm text-muted">{t(FOOTER.company)}</p>
          </div>

          <div>
            <FooterHeading>{t(FOOTER.aboutHeading)}</FooterHeading>
            {FOOTER.aboutLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => trackLink(link.label.ka, link.href)}
                className="mb-3 block text-sm text-muted transition hover:text-ink"
              >
                {t(link.label)}
              </Link>
            ))}
          </div>

          <div>
            <FooterHeading>{t(FOOTER.infoHeading)}</FooterHeading>
            {FOOTER.infoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => trackLink(link.label.ka, link.href)}
                className="mb-3 block text-sm text-muted transition hover:text-ink"
              >
                {t(link.label)}
              </Link>
            ))}
          </div>

          <div>
            <FooterHeading>{t(FOOTER.contactHeading)}</FooterHeading>
            <div className="flex flex-col gap-3 text-sm text-muted">
              {FOOTER.contact.map((item) => (
                <a
                  key={item.value}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="transition hover:text-ink"
                >
                  {t(item.label)} : {item.value}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center text-[13px] text-muted">
          {t(FOOTER.copyright)}
        </div>
      </Container>
    </footer>
  );
}
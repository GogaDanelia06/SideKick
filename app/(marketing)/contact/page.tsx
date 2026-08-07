import { ContactView } from "@/components/contact/ContactView";
import { Faq } from "@/components/contact/Faq";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";
import { getSiteFaq, getSiteTexts } from "@/lib/site/content";

export const generateMetadata = seoFor({
  title: "კონტაქტი",
  description:
    "დაგვიკავშირდი — Sidekick-ის გუნდი მზადაა გიპასუხოს კითხვებზე და დაგეხმაროს პლატფორმის დაწყებაში.",
  path: "/contact",
});

export const dynamic = "force-dynamic";

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: { ka: "კონტაქტი", en: "Contact" }, href: "/contact#faq" },
];

export default async function ContactPage() {
  const [faqs, texts] = await Promise.all([
    getSiteFaq(),
    getSiteTexts(["contact_badge", "contact_h1", "contact_sub"]),
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.label.ka, path: c.href })))} />
      {faqs.length > 0 ? (
        <JsonLd
          data={faqSchema(faqs.map((f) => ({ question: f.question.ka, answer: f.answer.ka })))}
        />
      ) : null}
      <JsonLd
        data={webPageSchema({
          type: "ContactPage",
          name: "კონტაქტი | Sidekick",
          description:
            "დაგვიკავშირდი — Sidekick-ის გუნდი მზადაა გიპასუხოს კითხვებზე და დაგეხმაროს პლატფორმის დაწყებაში.",
          path: "/contact",
        })}
      />
      <Breadcrumbs items={crumbs} />
      <ContactView
        badge={texts.contact_badge}
        title={texts.contact_h1}
        sub={texts.contact_sub}
      />
      <Faq faqs={faqs} />
    </>
  );
}

import { ContactView } from "@/components/contact/ContactView";
import { Faq } from "@/components/contact/Faq";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { FAQS } from "@/lib/content/faq";

export const metadata = pageMetadata({
  title: "კონტაქტი",
  description:
    "დაგვიკავშირდი — Sidekick-ის გუნდი მზადაა გიპასუხოს კითხვებზე და დაგეხმაროს პლატფორმის დაწყებაში.",
  path: "/contact",
});

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: { ka: "კონტაქტი", en: "Contact" }, href: "/contact" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.label.ka, path: c.href })))} />
      <JsonLd
        data={faqSchema(FAQS.map((f) => ({ question: f.question.ka, answer: f.answer.ka })))}
      />
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
      <ContactView />
      <Faq />
    </>
  );
}

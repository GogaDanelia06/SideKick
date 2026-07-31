import { AboutView } from "@/components/about/AboutView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";

export const generateMetadata = seoFor({
  title: "ჩვენ შესახებ",
  description:
    "გაიგე მეტი Sidekick-ის შესახებ — AI პლატფორმა, რომელიც ბიზნესებს ეხმარება მომხმარებლების 24/7 მომსახურებასა და გაყიდვების ზრდაში.",
  path: "/about",
});

// The SEO fields are admin-editable, so metadata is read per request.
export const dynamic = "force-dynamic";

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: { ka: "ჩვენ შესახებ", en: "About us" }, href: "/about" },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.label.ka, path: c.href })))} />
      <JsonLd
        data={webPageSchema({
          type: "AboutPage",
          name: "ჩვენ შესახებ | Sidekick",
          description:
            "გაიგე მეტი Sidekick-ის შესახებ — AI პლატფორმა, რომელიც ბიზნესებს ეხმარება მომხმარებლების 24/7 მომსახურებასა და გაყიდვების ზრდაში.",
          path: "/about",
        })}
      />
      <Breadcrumbs items={crumbs} />
      <AboutView />
    </>
  );
}

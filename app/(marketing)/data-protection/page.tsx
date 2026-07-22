import { LegalView } from "@/components/legal/LegalView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { DATA_PROTECTION } from "@/lib/content/legal";

export const metadata = pageMetadata({
  title: DATA_PROTECTION.title.ka,
  description: DATA_PROTECTION.description.ka,
  path: "/data-protection",
});

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: { ka: "პერსონალურ მონაცემთა დაცვა", en: "Personal Data Protection" }, href: "/data-protection" },
];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.label.ka, path: c.href })))} />
      <JsonLd
        data={webPageSchema({
          name: `${DATA_PROTECTION.title.ka} | Sidekick`,
          description: DATA_PROTECTION.description.ka,
          path: "/data-protection",
        })}
      />
      <Breadcrumbs items={crumbs} />
      <LegalView doc={DATA_PROTECTION} />
    </>
  );
}

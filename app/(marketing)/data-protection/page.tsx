import { LegalView } from "@/components/legal/LegalView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";
import { getLegalSections, getLegalTitle } from "@/lib/site/content";
import { DATA_PROTECTION } from "@/lib/content/legal";

export const generateMetadata = seoFor({
  title: DATA_PROTECTION.title.ka,
  description: DATA_PROTECTION.description.ka,
  path: "/data-protection",
});

// Sections are admin-editable and read per request.
export const dynamic = "force-dynamic";

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: { ka: "პერსონალურ მონაცემთა დაცვა", en: "Personal Data Protection" }, href: "/data-protection" },
];


export default async function Page() {
  const [sections, title] = await Promise.all([
    getLegalSections("data-protection"),
    getLegalTitle("data-protection"),
  ]);
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
      <LegalView doc={DATA_PROTECTION} sections={sections} title={title ?? undefined} />
    </>
  );
}

import { LegalView } from "@/components/legal/LegalView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getLegalSections } from "@/lib/site/content";
import { TERMS } from "@/lib/content/legal";

export const metadata = pageMetadata({
  title: TERMS.title.ka,
  description: TERMS.description.ka,
  path: "/terms",
});

// Sections are admin-editable and read per request.
export const dynamic = "force-dynamic";

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: { ka: "წესები და პირობები", en: "Terms and Conditions" }, href: "/terms" },
];


export default async function Page() {
  const sections = await getLegalSections("terms");
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.label.ka, path: c.href })))} />
      <JsonLd
        data={webPageSchema({
          name: `${TERMS.title.ka} | Sidekick`,
          description: TERMS.description.ka,
          path: "/terms",
        })}
      />
      <Breadcrumbs items={crumbs} />
      <LegalView doc={TERMS} sections={sections} />
    </>
  );
}

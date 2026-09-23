import { LegalView } from "@/components/legal/LegalView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";
import { getLegalSections, getLegalTitle } from "@/lib/site/content";
import { DATA_PROTECTION } from "@/lib/content/legal";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { textIn } from "@/lib/i18n/messages";

export const generateMetadata = seoFor({
  title: DATA_PROTECTION.title.ka,
  description: DATA_PROTECTION.description.ka,
  path: "/data-protection",
});

// Cached: admin saves revalidate this path; the timer catches edits made outside the panel.
export const revalidate = 3600;

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: "dataProtection.personalDataProtection", href: "/data-protection" },
];


export default async function Page() {
  const [sections, title] = await Promise.all([
    getLegalSections("data-protection"),
    getLegalTitle("data-protection"),
  ]);
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: textIn(DEFAULT_LOCALE, c.label), path: c.href })))} />
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

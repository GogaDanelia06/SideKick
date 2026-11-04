import { LegalView } from "@/components/legal/LegalView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";
import { getLegalSections, getLegalTitle } from "@/lib/site/content";
import { DATA_DELETION } from "@/lib/content/legal";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { textIn } from "@/lib/i18n/messages";

export const generateMetadata = seoFor({
  title: DATA_DELETION.title.ka,
  description: DATA_DELETION.description.ka,
  path: "/data-deletion",
});

export const revalidate = 3600;

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: "dataDeletion.dataDeletion", href: "/data-deletion" },
];

export default async function Page() {
  const [sections, title] = await Promise.all([
    getLegalSections("data-deletion"),
    getLegalTitle("data-deletion"),
  ]);
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: textIn(DEFAULT_LOCALE, c.label), path: c.href })))} />
      <JsonLd
        data={webPageSchema({
          name: `${DATA_DELETION.title.ka} | Sidekick`,
          description: DATA_DELETION.description.ka,
          path: "/data-deletion",
        })}
      />
      <Breadcrumbs items={crumbs} />
      <LegalView doc={DATA_DELETION} sections={sections} title={title ?? undefined} />
    </>
  );
}

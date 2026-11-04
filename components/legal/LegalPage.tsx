import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import type { LegalDoc } from "@/lib/content/legal";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { textIn, type Text } from "@/lib/i18n/messages";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";
import { getLegalSections, getLegalTitle } from "@/lib/site/content";
import { LegalView } from "./LegalView";

const pathOf = (doc: LegalDoc) => `/${doc.slug}`;

export const legalMetadata = (doc: LegalDoc) =>
  seoFor({ title: doc.title.ka, description: doc.description.ka, path: pathOf(doc) });

export async function LegalPage({ doc, crumb }: { doc: LegalDoc; crumb: Text }) {
  const path = pathOf(doc);
  const crumbs: Crumb[] = [HOME_CRUMB, { label: crumb, href: path }];
  const [sections, title] = await Promise.all([
    getLegalSections(doc.slug),
    getLegalTitle(doc.slug),
  ]);
  const trail = crumbs.map((c) => ({ name: textIn(DEFAULT_LOCALE, c.label), path: c.href }));

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />
      <JsonLd
        data={webPageSchema({
          name: `${doc.title.ka} | Sidekick`,
          description: doc.description.ka,
          path,
        })}
      />
      <Breadcrumbs items={crumbs} />
      <LegalView doc={doc} sections={sections} title={title ?? undefined} />
    </>
  );
}

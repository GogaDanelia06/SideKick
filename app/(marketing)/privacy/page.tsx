import { LegalView } from "@/components/legal/LegalView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";
import { getLegalSections, getLegalTitle } from "@/lib/site/content";
import { PRIVACY } from "@/lib/content/legal";

export const generateMetadata = seoFor({
  title: PRIVACY.title.ka,
  description: PRIVACY.description.ka,
  path: "/privacy",
});

// Served from the CDN, not rendered for every visit. Saving this page's content
// or SEO in the admin panel revalidates the path, so an edit shows on the next
// load; the hour only catches rows changed outside the panel.
export const revalidate = 3600;

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: { ka: "კონფიდენციალურობის პოლიტიკა", en: "Privacy Policy" }, href: "/privacy" },
];


export default async function Page() {
  const [sections, title] = await Promise.all([
    getLegalSections("privacy"),
    getLegalTitle("privacy"),
  ]);
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.label.ka, path: c.href })))} />
      <JsonLd
        data={webPageSchema({
          name: `${PRIVACY.title.ka} | Sidekick`,
          description: PRIVACY.description.ka,
          path: "/privacy",
        })}
      />
      <Breadcrumbs items={crumbs} />
      <LegalView doc={PRIVACY} sections={sections} title={title ?? undefined} />
    </>
  );
}

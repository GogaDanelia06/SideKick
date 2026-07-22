import { LegalView } from "@/components/legal/LegalView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PRIVACY } from "@/lib/content/legal";

export const metadata = pageMetadata({
  title: PRIVACY.title.ka,
  description: PRIVACY.description.ka,
  path: "/privacy",
});

const crumbs: Crumb[] = [
  HOME_CRUMB,
  { label: { ka: "კონფიდენციალურობის პოლიტიკა", en: "Privacy Policy" }, href: "/privacy" },
];

export default function Page() {
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
      <LegalView doc={PRIVACY} />
    </>
  );
}

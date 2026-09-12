import { Services } from "@/components/pricing/Services";
import { Packages } from "@/components/pricing/Packages";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, softwareAppSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";
import { getPlans, getServiceBoxes, getSiteTexts } from "@/lib/site/content";

export const generateMetadata = seoFor({
  title: "ფასები",
  description:
    "Sidekick-ის ფასები და პაკეტები — ბეისიქი, სტანდარტი, პრემიუმი. 30 დღე უფასო პერიოდი ყველა პაკეტზე. აირჩიე შენს ბიზნესზე მორგებული გეგმა.",
  path: "/pricing",
});

// Cached: admin saves revalidate this path; the timer catches edits made outside the panel.
export const revalidate = 3600;

const crumbs: Crumb[] = [HOME_CRUMB, { label: { ka: "ფასები", en: "Pricing" }, href: "/pricing" }];

export default async function PricingPage() {
  const [packages, serviceBoxes, texts] = await Promise.all([
    getPlans(),
    getServiceBoxes(),
    getSiteTexts([
      "free_badge",
      "free_title",
      "free_text",
      "pricing_badge",
      "pricing_h1",
      "pricing_sub",
    ]),
  ]);
  const prices = packages.map((p) => p.price);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.label.ka, path: c.href })))} />
      {prices.length > 0 ? (
        <JsonLd
          data={softwareAppSchema({
            lowPrice: String(Math.min(...prices)),
            highPrice: String(Math.max(...prices)),
            priceCurrency: "GEL",
          })}
        />
      ) : null}
      <JsonLd
        data={webPageSchema({
          name: "ფასები | Sidekick",
          description:
            "Sidekick-ის ფასები და პაკეტები — ბეისიქი, სტანდარტი, პრემიუმი. 30 დღე უფასო პერიოდი ყველა პაკეტზე.",
          path: "/pricing",
        })}
      />
      <Breadcrumbs items={crumbs} />
      <Services
        boxes={serviceBoxes}
        badge={texts.pricing_badge}
        title={texts.pricing_h1}
        sub={texts.pricing_sub}
      />
      <Packages
        packages={packages}
        free={{ badge: texts.free_badge, title: texts.free_title, text: texts.free_text }}
      />
    </>
  );
}

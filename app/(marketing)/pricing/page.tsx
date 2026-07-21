import { Services } from "@/components/pricing/Services";
import { Packages } from "@/components/pricing/Packages";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HOME_CRUMB, type Crumb } from "@/lib/content/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, softwareAppSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PACKAGES } from "@/lib/content/packages";

export const metadata = pageMetadata({
  title: "ფასები",
  description:
    "Sidekick-ის ფასები და პაკეტები — ბეისიქი, სტანდარტი, პრემიუმი. პირველი თვე ყველა პაკეტზე უფასოა. აირჩიე შენს ბიზნესზე მორგებული გეგმა.",
  path: "/pricing",
});

const crumbs: Crumb[] = [HOME_CRUMB, { label: { ka: "ფასები", en: "Pricing" }, href: "/pricing" }];

export default function PricingPage() {
  const prices = PACKAGES.map((p) => Number(p.price));

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.label.ka, path: c.href })))} />
      <JsonLd
        data={softwareAppSchema({
          lowPrice: String(Math.min(...prices)),
          highPrice: String(Math.max(...prices)),
          priceCurrency: "GEL",
        })}
      />
      <Breadcrumbs items={crumbs} />
      <Services />
      <Packages />
    </>
  );
}

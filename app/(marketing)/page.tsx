import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { Benefits } from "@/components/home/Benefits";
import { CtaBanner } from "@/components/home/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";
import { getSiteStats, getSeoSettings } from "@/lib/site/content";

export async function generateMetadata() {
  const { title, description } = await getSeoSettings();
  return pageMetadata({ path: "/", absoluteTitle: title, description });
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = await getSiteStats();

  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: SITE.title,
          description: SITE.description,
          path: "/",
        })}
      />
      <Hero stats={stats} />
      <Story />
      <Benefits />
      <CtaBanner />
    </>
  );
}

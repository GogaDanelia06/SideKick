import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { Benefits } from "@/components/home/Benefits";
import { CtaBanner } from "@/components/home/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";
import {
  getSiteStats,
  getSeoSettings,
  getSiteTexts,
  getBenefits,
  getHeroSlides,
  getHeroIntervalMs,
} from "@/lib/site/content";

export async function generateMetadata() {
  const { title, description } = await getSeoSettings();
  return pageMetadata({ path: "/", absoluteTitle: title, description });
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stats, benefits, heroSlides, heroIntervalMs, texts] = await Promise.all([
    getSiteStats(),
    getBenefits(),
    getHeroSlides(),
    getHeroIntervalMs(),
    getSiteTexts([
      "story_title",
      "story_body",
      "cta_badge",
      "cta_title",
      "cta_text",
      "cta_button",
      "cta_url",
    ]),
  ]);

  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: SITE.title,
          description: SITE.description,
          path: "/",
        })}
      />
      <Hero stats={stats} slides={heroSlides} intervalMs={heroIntervalMs} />
      <Story title={texts.story_title} body={texts.story_body} />
      <Benefits boxes={benefits} />
      <CtaBanner
        content={{
          badge: texts.cta_badge,
          title: texts.cta_title,
          text: texts.cta_text,
          button: texts.cta_button,
          url: texts.cta_url?.ka,
        }}
      />
    </>
  );
}

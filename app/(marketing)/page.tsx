import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { Benefits } from "@/components/home/Benefits";
import { CtaBanner } from "@/components/home/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { softwareAppSchema, webPageSchema } from "@/lib/seo/jsonld";
import { seoFor } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";
import {
  getSiteStats,
  getSiteTexts,
  getBenefits,
  getHeroSlides,
  getHeroIntervalMs,
  getPlans,
} from "@/lib/site/content";

export const generateMetadata = seoFor({ path: "/" });

// Served from the CDN and rebuilt in the background, not rendered for every
// visit. Admin saves that touch this page call revalidatePath("/"), so an edit
// shows on the next load. The minute is for the live figures, which change
// without anyone saving anything — and the browser polls those on top.
export const revalidate = 60;

export default async function HomePage() {
  const [stats, benefits, heroSlides, heroIntervalMs, plans, texts] = await Promise.all([
    getSiteStats(),
    getBenefits(),
    getHeroSlides(),
    getHeroIntervalMs(),
    getPlans(),
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

  const prices = plans.map((p) => p.price);

  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: SITE.title,
          description: SITE.description,
          path: "/",
        })}
      />
      {/* The product itself, priced. Repeated from /pricing because the landing
          page is what search results point at, and the price range is what
          earns the rich result. Skipped when no plan is published. */}
      {prices.length > 0 ? (
        <JsonLd
          data={softwareAppSchema({
            lowPrice: String(Math.min(...prices)),
            highPrice: String(Math.max(...prices)),
            priceCurrency: "GEL",
          })}
        />
      ) : null}
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

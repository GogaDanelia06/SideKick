import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { Benefits } from "@/components/home/Benefits";
import { CtaBanner } from "@/components/home/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";

export const metadata = pageMetadata({ path: "/" });

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: SITE.title,
          description: SITE.description,
          path: "/",
        })}
      />
      <Hero />
      <Story />
      <Benefits />
      <CtaBanner />
    </>
  );
}

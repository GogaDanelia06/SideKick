import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { Benefits } from "@/components/home/Benefits";
import { CtaBanner } from "@/components/home/CtaBanner";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ path: "/" });

export default function HomePage() {
  return (
    <>
      <Hero />
      <Story />
      <Benefits />
      <CtaBanner />
    </>
  );
}

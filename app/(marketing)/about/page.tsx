import type { Metadata } from "next";
import { AboutView } from "@/components/about/AboutView";

export const metadata: Metadata = { title: "ჩვენ შესახებ" };

export default function AboutPage() {
  return <AboutView />;
}

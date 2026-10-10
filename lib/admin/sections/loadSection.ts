import type { AdminSection } from "@/lib/admin/pages";
import type { SectionData } from "@/components/admin/sectionData";
import { loadFaq, loadPlans } from "./catalog";
import { loadBoxes, loadCarousel, loadStats, loadText } from "./content";
import { loadLegal, loadSeo } from "./documents";

export async function loadSection(section: AdminSection, route: string): Promise<SectionData | undefined> {
  switch (section.kind) {
    case "carousel":
      return loadCarousel();
    case "stats":
      return loadStats();
    case "text":
      return loadText(section);
    case "boxes":
      return loadBoxes(section);
    case "plans":
      return loadPlans();
    case "faq":
      return loadFaq();
    case "legal":
      return loadLegal(section);
    case "seo":
      return loadSeo(section, route);
  }
}

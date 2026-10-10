import type { Icon } from "@tabler/icons-react";
import type { Text } from "@/lib/i18n/messages";

export type SectionKind =
  | "carousel"
  | "stats"
  | "text"
  | "boxes"
  | "plans"
  | "faq"
  | "legal"
  | "seo";

export type AdminSection = {
  key: string;
  label: Text;
  icon: Icon;
  kind: SectionKind;
  textGroup?: string;
  boxKind?: "benefit" | "service";
  legalDoc?: string;
  seoPath?: string;
};

export type AdminPage = {
  slug: string;
  label: Text;
  icon: Icon;
  route: string;
  sections: AdminSection[];
};

export function sectionRoute(page: AdminPage, section: AdminSection | undefined): string {
  if (section?.kind === "legal" && section.legalDoc) return `/${section.legalDoc}`;
  return section?.seoPath ?? page.route;
}

export const ka = (ka: string, en: string): Text => ({ ka, en });

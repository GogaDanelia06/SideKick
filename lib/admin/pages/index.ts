import type { AdminPage } from "./types";
import { LANDING_PAGE } from "./landing";
import { PRICING_PAGE } from "./pricing";
import { ABOUT_PAGE } from "./about";
import { CONTACT_PAGE } from "./contact";
import { REGISTRATION_PAGE } from "./registration";
import { LEGAL_PAGE } from "./legal";

export const ADMIN_PAGES: AdminPage[] = [LANDING_PAGE, PRICING_PAGE, ABOUT_PAGE, CONTACT_PAGE, REGISTRATION_PAGE, LEGAL_PAGE];

export function findAdminPage(slug: string): AdminPage | undefined {
  return ADMIN_PAGES.find((p) => p.slug === slug);
}

export { sectionRoute, type AdminPage, type AdminSection, type SectionKind } from "./types";

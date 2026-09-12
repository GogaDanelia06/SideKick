import { revalidatePath, updateTag } from "next/cache";
import type { BoxKind } from "@/lib/admin/forms/content";
import { ADMIN } from "@/lib/admin/routes";
import { DASH } from "@/lib/dashboard/routes";
import { THEME_TAG } from "@/lib/site/theme/cached";

/** The public pages that registry text groups appear on. */
const TEXT_PAGES = ["/", "/pricing", "/contact", "/about", "/register", "/terms", "/privacy", "/data-protection"];

/** Every page-section editor (/admin/page/landing, /admin/page/pricing, …). */
function pageEditors() {
  revalidatePath("/admin/page/[slug]", "page");
}

export function revalidateStats() {
  pageEditors();
  revalidatePath("/");
}

export function revalidatePlans() {
  pageEditors();
  revalidatePath("/pricing");
  // The landing page quotes the price range in its structured data.
  revalidatePath("/");
}

export function revalidateFaq() {
  pageEditors();
  revalidatePath("/contact");
}

export function revalidateTexts() {
  pageEditors();
  for (const path of TEXT_PAGES) revalidatePath(path);
}

export function revalidateHero() {
  pageEditors();
  revalidatePath("/");
}

export function revalidateBoxes(kind: BoxKind) {
  pageEditors();
  revalidatePath(kind === "benefit" ? "/" : "/pricing");
}

export function revalidateLegal(doc: string) {
  pageEditors();
  revalidatePath(`/${doc}`);
}

export function revalidateSeo(path: string) {
  pageEditors();
  revalidatePath(ADMIN.home);
  revalidatePath(path);
}

export function revalidateTutorials() {
  revalidatePath(ADMIN.tutorials);
  revalidatePath(DASH.videos);
  revalidatePath(DASH.channels);
}

export function revalidateBusinesses() {
  revalidatePath(ADMIN.businesses);
}

export function revalidateTheme() {
  // Expire the cached theme first, or the refreshed pages would render the old one.
  updateTag(THEME_TAG);
  revalidatePath("/", "layout");
}

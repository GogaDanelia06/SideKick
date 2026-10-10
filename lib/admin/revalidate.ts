import { revalidatePath, updateTag } from "next/cache";
import type { BoxKind } from "@/lib/admin/forms/content";
import { ADMIN } from "@/lib/admin/routes";
import { DASH } from "@/lib/dashboard/routes";
import { THEME_TAG } from "@/lib/site/theme/cached";

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
  revalidatePath("/");
}

export function revalidateFaq() {
  pageEditors();
  revalidatePath("/contact");
}

export function revalidateTexts() {
  pageEditors();
  revalidatePath("/", "layout");
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
  updateTag(THEME_TAG);
  revalidatePath("/", "layout");
}

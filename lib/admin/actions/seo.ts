"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { field, safeUrl } from "@/lib/admin/forms/fields";
import { ADMIN_PAGES } from "@/lib/admin/pages";
import { revalidateSeo } from "@/lib/admin/revalidate";
import { fail, type AdminResult } from "./shared";

/** Paths with an SEO section in the admin registry; no other path can be written. */
function seoPaths(): string[] {
  return ADMIN_PAGES.flatMap((page) =>
    page.sections.filter((s) => s.kind === "seo").map((s) => s.seoPath ?? page.route),
  );
}

export async function updateSeo(path: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  if (!seoPaths().includes(path)) return fail("unknown_page");

  // A site-relative path or an http(s) URL; a bad canonical would de-index the page.
  const canonical = field(fd, "canonical");
  if (canonical && safeUrl(canonical, "") !== canonical) return fail("bad_canonical");

  const data = {
    title: field(fd, "title"),
    description: field(fd, "description"),
    canonical,
    indexable: field(fd, "indexable") !== "0",
    ogTitle: field(fd, "ogTitle"),
    ogDescription: field(fd, "ogDescription"),
    ogImageUrl: safeUrl(field(fd, "ogImageUrl"), ""),
  };
  await prisma.pageSeo.upsert({ where: { path }, create: { path, ...data }, update: data });

  revalidateSeo(path);
  return { ok: true };
}

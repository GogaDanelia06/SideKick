import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ADMIN_PAGES, findAdminPage, type AdminSection } from "@/lib/admin/pages";
import { findGroup, findLegalDoc, legalTitleKey } from "@/lib/site/textKeys";
import { statSourceOptions } from "@/lib/site/statSources";
import { getHeroIntervalMs } from "@/lib/site/content";
import { SITE } from "@/lib/seo/site";
import { PageEditor, type SectionData } from "@/components/admin/PageEditor";

export function generateStaticParams() {
  return ADMIN_PAGES.map((p) => ({ slug: p.slug }));
}

/**
 * Loads one section's data.
 *
 * Returns undefined when a section's configuration no longer resolves — a text
 * group dropped from the registry, say — so the page renders without it rather
 * than failing whole.
 */
async function loadSection(
  section: AdminSection,
  route: string,
): Promise<SectionData | undefined> {
  switch (section.kind) {
    case "carousel": {
      const [slides, intervalMs, sources] = await Promise.all([
        prisma.heroSlide.findMany({
          orderBy: { order: "asc" },
          include: { stats: { orderBy: { order: "asc" } } },
        }),
        getHeroIntervalMs(),
        statSourceOptions(),
      ]);
      return {
        kind: "carousel",
        slides,
        intervalSeconds: Math.round(intervalMs / 1000),
        sources,
      };
    }

    case "stats": {
      // Only the key, label and current value cross into the client; the
      // query functions stay on the server.
      const [stats, sources] = await Promise.all([
        prisma.siteStat.findMany({ orderBy: { order: "asc" } }),
        statSourceOptions(),
      ]);
      return { kind: "stats", stats, sources };
    }

    case "text": {
      const group = findGroup(section.textGroup!);
      if (!group) return undefined;
      const rows = await prisma.siteSetting.findMany({
        where: { key: { in: group.fields.map((f) => f.key) } },
      });
      return {
        kind: "text",
        group,
        values: Object.fromEntries(rows.map((r) => [r.key, { ka: r.valueKa, en: r.valueEn }])),
      };
    }

    case "boxes": {
      const items =
        section.boxKind === "benefit"
          ? (await prisma.benefit.findMany({ orderBy: { order: "asc" } })).map((b) => ({
              id: b.id,
              order: b.order,
              published: b.published,
              icon: b.icon,
              titleKa: b.titleKa,
              titleEn: b.titleEn,
              bodyKa: b.descKa,
              bodyEn: b.descEn,
            }))
          : (await prisma.serviceBox.findMany({ orderBy: { order: "asc" } })).map((s) => ({
              id: s.id,
              order: s.order,
              published: s.published,
              icon: s.icon,
              titleKa: s.titleKa,
              titleEn: s.titleEn,
              bodyKa: s.bodyKa,
              bodyEn: s.bodyEn,
            }));
      return { kind: "boxes", boxKind: section.boxKind!, items };
    }

    case "plans": {
      return {
        kind: "plans",
        plans: await prisma.plan.findMany({ orderBy: { price: "asc" } }),
      };
    }

    case "faq": {
      return {
        kind: "faq",
        faqs: await prisma.siteFaq.findMany({ orderBy: { order: "asc" } }),
      };
    }

    case "legal": {
      const doc = section.legalDoc!;
      const [rows, titleRow] = await Promise.all([
        prisma.legalSection.findMany({ where: { doc }, orderBy: { order: "asc" } }),
        prisma.siteSetting.findUnique({ where: { key: legalTitleKey(doc) } }),
      ]);
      return {
        kind: "legal",
        doc,
        sections: rows,
        title: { ka: titleRow?.valueKa ?? "", en: titleRow?.valueEn ?? "" },
        defaultTitle: findLegalDoc(doc)?.title.ka ?? "",
      };
    }

    case "seo": {
      // Legal drives three public pages from one screen, hence seoPath.
      const seoPath = section.seoPath ?? route;
      const row = await prisma.pageSeo.findUnique({ where: { path: seoPath } });
      return {
        kind: "seo",
        path: seoPath,
        values: {
          title: row?.title ?? "",
          description: row?.description ?? "",
          canonical: row?.canonical ?? "",
          indexable: row?.indexable ?? true,
          ogTitle: row?.ogTitle ?? "",
          ogDescription: row?.ogDescription ?? "",
          ogImageUrl: row?.ogImageUrl ?? "",
        },
        defaults: {
          title: SITE.title,
          description: SITE.description,
          siteUrl: SITE.url,
        },
      };
    }
  }
}

/**
 * One admin page, with every section fetched at once.
 *
 * These used to load in a `for` loop that awaited each section in turn, so six
 * sections cost six round trips to Frankfurt end to end — 1182ms measured
 * against production, against 190ms for the same queries issued together.
 * Nothing here depends on anything else, so it all goes in flight at once.
 */
export default async function AdminPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = findAdminPage(slug);
  if (!page) notFound();

  const loaded = await Promise.all(
    page.sections.map(async (s) => [s.key, await loadSection(s, page.route)] as const),
  );

  const data: Record<string, SectionData> = {};
  for (const [key, section] of loaded) if (section) data[key] = section;

  return <PageEditor slug={page.slug} data={data} />;
}

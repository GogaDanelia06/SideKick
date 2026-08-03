import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ADMIN_PAGES, findAdminPage } from "@/lib/admin/pages";
import { findGroup, findLegalDoc, legalTitleKey } from "@/lib/site/textKeys";
import { statSourceOptions } from "@/lib/site/statSources";
import { getHeroIntervalMs } from "@/lib/site/content";
import { SITE } from "@/lib/seo/site";
import { PageEditor, type SectionData } from "@/components/admin/PageEditor";

export function generateStaticParams() {
  return ADMIN_PAGES.map((p) => ({ slug: p.slug }));
}

/**
 * Loads the data for every section of one admin page in a single pass, so the
 * second column can switch between sections instantly without another round
 * trip. Each page holds at most a handful of sections, so this stays cheap.
 */
export default async function AdminPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = findAdminPage(slug);
  if (!page) notFound();

  const data: Record<string, SectionData> = {};

  for (const section of page.sections) {
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
        data[section.key] = {
          kind: "carousel",
          slides,
          intervalSeconds: Math.round(intervalMs / 1000),
          sources,
        };
        break;
      }

      case "stats": {
        // Only the key, label and current value cross into the client; the
        // query functions stay on the server.
        const [stats, sources] = await Promise.all([
          prisma.siteStat.findMany({ orderBy: { order: "asc" } }),
          statSourceOptions(),
        ]);
        data[section.key] = { kind: "stats", stats, sources };
        break;
      }

      case "text": {
        const group = findGroup(section.textGroup!);
        if (!group) break;
        const rows = await prisma.siteSetting.findMany({
          where: { key: { in: group.fields.map((f) => f.key) } },
        });
        data[section.key] = {
          kind: "text",
          group,
          values: Object.fromEntries(rows.map((r) => [r.key, { ka: r.valueKa, en: r.valueEn }])),
        };
        break;
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
        data[section.key] = { kind: "boxes", boxKind: section.boxKind!, items };
        break;
      }

      case "plans": {
        data[section.key] = {
          kind: "plans",
          plans: await prisma.plan.findMany({ orderBy: { price: "asc" } }),
        };
        break;
      }

      case "faq": {
        data[section.key] = {
          kind: "faq",
          faqs: await prisma.siteFaq.findMany({ orderBy: { order: "asc" } }),
        };
        break;
      }

      case "legal": {
        const doc = section.legalDoc!;
        const [rows, titleRow] = await Promise.all([
          prisma.legalSection.findMany({ where: { doc }, orderBy: { order: "asc" } }),
          prisma.siteSetting.findUnique({ where: { key: legalTitleKey(doc) } }),
        ]);
        data[section.key] = {
          kind: "legal",
          doc,
          sections: rows,
          title: { ka: titleRow?.valueKa ?? "", en: titleRow?.valueEn ?? "" },
          defaultTitle: findLegalDoc(doc)?.title.ka ?? "",
        };
        break;
      }

      case "seo": {
        // Legal drives three public pages from one screen, hence seoPath.
        const seoPath = section.seoPath ?? page.route;
        const row = await prisma.pageSeo.findUnique({ where: { path: seoPath } });
        data[section.key] = {
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
        break;
      }
    }
  }

  return <PageEditor slug={page.slug} data={data} />;
}

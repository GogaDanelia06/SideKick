import { prisma } from "@/lib/db";
import type { AdminSection } from "@/lib/admin/pages";
import { textIn } from "@/lib/i18n/messages";
import { SITE } from "@/lib/seo/site";
import { findLegalDoc, legalTitleKey } from "@/lib/site/textKeys";
import type { SectionData } from "@/components/admin/sectionData";

const legalTitle = (doc: string) => {
  const drafted = findLegalDoc(doc);
  return drafted ? textIn("ka", drafted.title) : "";
};

export async function loadLegal(section: AdminSection): Promise<SectionData> {
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
    defaultTitle: legalTitle(doc),
  };
}

export async function loadSeo(section: AdminSection, route: string): Promise<SectionData> {
  const path = section.seoPath ?? route;
  const row = await prisma.pageSeo.findUnique({ where: { path } });
  return {
    kind: "seo",
    path,
    values: {
      title: row?.title ?? "",
      description: row?.description ?? "",
      canonical: row?.canonical ?? "",
      indexable: row?.indexable ?? true,
      ogTitle: row?.ogTitle ?? "",
      ogDescription: row?.ogDescription ?? "",
      ogImageUrl: row?.ogImageUrl ?? "",
    },
    defaults: { title: SITE.title, description: SITE.description, siteUrl: SITE.url },
  };
}

import { prisma } from "@/lib/db";

export type PageSeoOverrides = {
  title: string;
  description: string;
  canonical: string;
  indexable: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
};

const NO_OVERRIDES: PageSeoOverrides = {
  title: "",
  description: "",
  canonical: "",
  indexable: true,
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
};

export async function getPageSeo(path: string): Promise<PageSeoOverrides> {
  const row = await prisma.pageSeo.findUnique({ where: { path } });
  if (!row) return NO_OVERRIDES;
  return {
    title: row.title.trim(),
    description: row.description.trim(),
    canonical: row.canonical.trim(),
    indexable: row.indexable,
    ogTitle: row.ogTitle.trim(),
    ogDescription: row.ogDescription.trim(),
    ogImageUrl: row.ogImageUrl.trim(),
  };
}

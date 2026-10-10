import { notFound } from "next/navigation";
import { ADMIN_PAGES, findAdminPage } from "@/lib/admin/pages";
import { loadSection } from "@/lib/admin/sections/loadSection";
import { PageEditor } from "@/components/admin/PageEditor";
import type { SectionData } from "@/components/admin/sectionData";

export function generateStaticParams() {
  return ADMIN_PAGES.map((p) => ({ slug: p.slug }));
}

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

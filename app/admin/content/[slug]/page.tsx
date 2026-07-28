import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { findGroup, TEXT_GROUPS } from "@/lib/site/textKeys";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { TextGroupEditor } from "@/components/admin/content/TextGroupEditor";

export function generateStaticParams() {
  return TEXT_GROUPS.map((g) => ({ slug: g.slug }));
}

export default async function ContentGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = findGroup(slug);
  if (!group) notFound();

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: group.fields.map((f) => f.key) } },
  });
  const values = Object.fromEntries(
    rows.map((r) => [r.key, { ka: r.valueKa, en: r.valueEn }]),
  );

  return (
    <>
      <AdminHeading title={group.title} subtitle={group.description} />
      <TextGroupEditor group={group} values={values} />
    </>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { findLegalDoc, LEGAL_DOCS } from "@/lib/site/textKeys";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { LegalEditor } from "@/components/admin/legal/LegalEditor";

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ doc: d.doc }));
}

export default async function AdminLegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const meta = findLegalDoc(doc);
  if (!meta) notFound();

  const sections = await prisma.legalSection.findMany({
    where: { doc },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <AdminHeading
        title={meta.title}
        subtitle={{
          ka: `სექციები ჩანს გვერდზე ${meta.route}. თითოეულს აქვს სათაური, ტექსტი და სურვილისამებრ ჩამონათვალი.`,
          en: `Sections appear on ${meta.route}. Each has a heading, body text and an optional bullet list.`,
        }}
      />
      <LegalEditor doc={doc} sections={sections} />
    </>
  );
}

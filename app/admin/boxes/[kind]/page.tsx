import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { BoxesEditor, type BoxItem } from "@/components/admin/boxes/BoxesEditor";

const KINDS = {
  benefit: {
    title: { ka: "სერვისის უპირატესობები", en: "Service benefits" },
    subtitle: {
      ka: "მთავარი გვერდის ბოქსები. თანმიმდევრობა და აიკონი აქედან იმართება.",
      en: "The landing-page boxes. Order and icon are managed here.",
    },
  },
  service: {
    title: { ka: "სერვისების სექცია", en: "Services section" },
    subtitle: {
      ka: "ფასების გვერდის ბოქსები. დაწკაპუნებით იშლება სრული აღწერა.",
      en: "The pricing-page boxes. Clicking one expands its full description.",
    },
  },
} as const;

export function generateStaticParams() {
  return Object.keys(KINDS).map((kind) => ({ kind }));
}

export default async function BoxesPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (kind !== "benefit" && kind !== "service") notFound();

  // The two tables differ only in the name of the body column; normalise here
  // so the editor works against one shape.
  const items: BoxItem[] =
    kind === "benefit"
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

  const meta = KINDS[kind];
  return (
    <>
      <AdminHeading title={meta.title} subtitle={meta.subtitle} />
      <BoxesEditor kind={kind} items={items} />
    </>
  );
}

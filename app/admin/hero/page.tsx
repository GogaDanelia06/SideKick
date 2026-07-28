import { prisma } from "@/lib/db";
import { getHeroIntervalMs } from "@/lib/site/content";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { HeroEditor } from "@/components/admin/hero/HeroEditor";

export default async function AdminHeroPage() {
  const [slides, intervalMs] = await Promise.all([
    prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
      include: { stats: { orderBy: { order: "asc" } } },
    }),
    getHeroIntervalMs(),
  ]);

  return (
    <>
      <AdminHeading
        title={{ ka: "მთავარი კარუსელი", en: "Homepage carousel" }}
        subtitle={{
          ka: "სლაიდები, მედია, ღილაკები და ანიმირებული ციფრები. ცარიელი სია — მთავარ გვერდზე ჩაშენებული კარუსელი დარჩება.",
          en: "Slides, media, buttons and animated figures. An empty list keeps the built-in carousel on the landing page.",
        }}
      />
      <HeroEditor slides={slides} intervalSeconds={Math.round(intervalMs / 1000)} />
    </>
  );
}

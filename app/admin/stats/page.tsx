import { prisma } from "@/lib/db";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { StatsEditor } from "@/components/admin/stats/StatsEditor";

export default async function AdminStatsPage() {
  const stats = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminHeading
        title={{ ka: "სტატისტიკა", en: "Homepage stats" }}
        subtitle={{
          ka: "მთავარ გვერდზე ჰერო-ბანერის ქვეშ გამოჩენილი ციფრები. ცარიელი სია — სექცია საიტზე არ ჩანს.",
          en: "The figures shown under the hero on the homepage. An empty list hides the section on the site.",
        }}
      />
      <StatsEditor stats={stats} />
    </>
  );
}

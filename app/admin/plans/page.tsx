import { prisma } from "@/lib/db";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { PlansEditor } from "@/components/admin/plans/PlansEditor";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });

  return (
    <>
      <AdminHeading
        title={{ ka: "პაკეტები", en: "Plans" }}
        subtitle={{
          ka: "ფასები და ლიმიტები. ეს ერთადერთი წყაროა — იცვლება ფასების გვერდზეც და ბილინგშიც. ლიმიტი -1 ნიშნავს „შეუზღუდავს“.",
          en: "Prices and limits. This is the single source — it drives the pricing page and billing alike. A limit of -1 means “unlimited”.",
        }}
      />
      <PlansEditor plans={plans} />
    </>
  );
}

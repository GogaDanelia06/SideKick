import { requireAdmin } from "@/lib/auth/admin";
import { getBusinessesForAdmin, getPlansForAdmin } from "@/lib/admin/businesses";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { BusinessPlans } from "@/components/admin/businesses/BusinessPlans";

export default async function AdminBusinessesPage() {
  await requireAdmin();

  const [businesses, plans] = await Promise.all([getBusinessesForAdmin(), getPlansForAdmin()]);

  return (
    <>
      <AdminHeading
        title={{ ka: "ბიზნესები და გეგმები", en: "Businesses & plans" }}
        subtitle={{
          ka: "სანამ ბანკები არ დაუკავშირდება, გეგმა აქ ხელით ენიშნება. ცვლილება მაშინვე მოქმედებს.",
          en: "Until the banks are connected, plans are assigned here by hand. Changes take effect immediately.",
        }}
      />
      <BusinessPlans businesses={businesses} plans={plans} />
    </>
  );
}

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
        title={"admin.businesses.businessesPlans"}
        subtitle={"admin.businesses.subtitle"}
      />
      <BusinessPlans businesses={businesses} plans={plans} />
    </>
  );
}

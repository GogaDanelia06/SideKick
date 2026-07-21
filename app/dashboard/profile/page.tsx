import { requireContext } from "@/lib/session";
import { getProfile } from "@/lib/dashboard/queries";
import { ProfileView } from "@/components/dashboard/profile/ProfileView";

export default async function ProfilePage() {
  const ctx = await requireContext();
  const { user, business } = await getProfile(ctx.userId, ctx.businessId);
  return <ProfileView user={user} business={business} />;
}

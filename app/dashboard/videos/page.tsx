import { requireContext } from "@/lib/session";
import { getVideos } from "@/lib/dashboard/queries";
import { VideosView } from "@/components/dashboard/videos/VideosView";

export default async function VideosPage() {
  const ctx = await requireContext();
  const videos = await getVideos(ctx.businessId);
  return <VideosView videos={videos} />;
}

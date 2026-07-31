import { requireContext } from "@/lib/session";
import { getTutorials } from "@/lib/dashboard/tutorials";
import { VideosView } from "@/components/dashboard/videos/VideosView";

export default async function VideosPage() {
  await requireContext();
  return <VideosView tutorials={await getTutorials()} />;
}

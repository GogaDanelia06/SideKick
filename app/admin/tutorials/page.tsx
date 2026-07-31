import { prisma } from "@/lib/db";
import { TutorialsAdmin } from "@/components/admin/tutorials/TutorialsAdmin";

export default async function AdminTutorialsPage() {
  const [tutorials, guides] = await Promise.all([
    prisma.tutorial.findMany({ orderBy: { order: "asc" } }),
    prisma.channelGuide.findMany(),
  ]);

  return <TutorialsAdmin tutorials={tutorials} guides={guides} />;
}

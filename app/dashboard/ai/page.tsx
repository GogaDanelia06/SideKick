import { redirect } from "next/navigation";
import { getContext } from "@/lib/session";
import { getAiConfig } from "@/lib/dashboard/queries";
import { AiView } from "@/components/dashboard/ai/AiView";

export default async function AiPage() {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  const { config, faqs } = await getAiConfig(ctx.businessId);
  return <AiView config={config} faqs={faqs} />;
}

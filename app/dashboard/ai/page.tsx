import { requireContext } from "@/lib/session";
import { getAiConfig } from "@/lib/dashboard/queries";
import { AiView } from "@/components/dashboard/ai/AiView";
import { aiConfigured } from "@/lib/ai/client";

export default async function AiPage() {
  const ctx = await requireContext();
  const { config, business } = await getAiConfig(ctx.businessId);
  return <AiView config={config} business={business} aiReady={aiConfigured()} />;
}

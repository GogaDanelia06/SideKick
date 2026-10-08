import { currentLoginId, requireContext } from "@/lib/session";
import { getAiConfig } from "@/lib/dashboard/queries";
import { AiView } from "@/components/dashboard/ai/AiView";
import { aiConfigured } from "@/lib/ai/client";

/**
 * This page's actions wait on the AI service for up to 45 seconds (lib/ai/call.ts). A
 * function with a shorter limit would be cut off first, silently — and 60 is the most
 * every Vercel plan allows, so this is safe whatever the project's default is.
 */
export const maxDuration = 60;

export default async function AiPage() {
  const ctx = await requireContext();
  const [{ config, business }, loginId] = await Promise.all([getAiConfig(ctx.businessId), currentLoginId()]);
  return (
    <AiView
      config={config}
      business={business}
      aiReady={aiConfigured()}
      loginId={loginId}
      owner={{ userId: ctx.userId, businessId: ctx.businessId }}
    />
  );
}

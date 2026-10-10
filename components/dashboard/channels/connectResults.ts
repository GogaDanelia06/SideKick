import type { Text } from "@/lib/i18n/messages";

export const RESULTS: Record<string, { tone: "ok" | "bad"; text: Text }> = {
  connected: { tone: "ok", text: "dashboard.channels.connectMeta.connected" },
  connected_no_ig: { tone: "ok", text: "dashboard.channels.connectMeta.text" },
  unconfigured_ig: { tone: "bad", text: "dashboard.channels.connectMeta.text2" },
  long_lived: { tone: "bad", text: "dashboard.channels.connectMeta.text3" },
  no_account: { tone: "bad", text: "dashboard.channels.connectMeta.text4" },
  not_subscribed: { tone: "bad", text: "dashboard.channels.connectMeta.text5" },
  cancelled: { tone: "bad", text: "dashboard.channels.connectMeta.connectionCancelled" },
  forbidden: { tone: "bad", text: "dashboard.channels.connectMeta.text6" },
  limit: { tone: "bad", text: "dashboard.channels.connectMeta.text7" },
  already_linked: { tone: "bad", text: "dashboard.channels.connectMeta.text8" },
  no_page: { tone: "bad", text: "dashboard.channels.connectMeta.text9" },
  many_pages: { tone: "bad", text: "dashboard.channels.connectMeta.text10" },
  bad_state: { tone: "bad", text: "dashboard.channels.connectMeta.text11" },
  signed_out: { tone: "bad", text: "dashboard.channels.connectMeta.text12" },
  unconfigured: { tone: "bad", text: "dashboard.channels.connectMeta.text13" },
  exchange: { tone: "bad", text: "dashboard.channels.connectMeta.text14" },
  failed: { tone: "bad", text: "dashboard.channels.connectMeta.thatDidNotWork" },
};

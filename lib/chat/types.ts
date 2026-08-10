export type ChatRole = "ai" | "user";

/**
 * A photo or video the visitor attached.
 *
 * `url` is an object URL, not an uploaded address: the file never leaves the
 * browser. See `hooks/useChat.ts` for why, and for where it gets revoked.
 */
export type ChatAttachment = {
  kind: "image" | "video";
  url: string;
  /** Shown beside the preview, and read out as the image's alt text. */
  name: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  attachment?: ChatAttachment;
};

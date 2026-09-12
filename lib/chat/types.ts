export type ChatRole = "ai" | "user";

/** A visitor's attachment; `url` is a local object URL and the file never leaves the browser. */
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

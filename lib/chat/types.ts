export type ChatRole = "ai" | "user";

export type ChatAttachment = {
  kind: "image" | "video";
  url: string;
  name: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  attachment?: ChatAttachment;
};

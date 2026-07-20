export type ChatRole = "ai" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

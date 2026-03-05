export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export interface ConversationMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: number;
}

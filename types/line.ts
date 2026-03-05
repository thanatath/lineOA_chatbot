import type { WebhookEvent, Message, TextMessage } from "@line/bot-sdk";

export type { WebhookEvent, Message, TextMessage };

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

export interface UserChannel {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  messages: ConversationMessage[];
  lastMessageAt: number;
  unreadCount: number;
}

export interface AdminSettings {
  autoResponseEnabled: boolean;
  systemPrompt: string;
}

export interface LineConfig {
  channelAccessToken: string;
  channelSecret: string;
}

export interface WebhookRequestBody {
  destination: string;
  events: WebhookEvent[];
}

export interface BroadcastRequest {
  message: string;
}

export interface BroadcastResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  sentCount?: number;
}

export interface SSEEvent {
  type: "new_message" | "new_channel" | "settings_update";
  data: unknown;
}

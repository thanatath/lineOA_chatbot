import type { WebhookEvent, Message, TextMessage } from "@line/bot-sdk";

export type { WebhookEvent, Message, TextMessage };

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  status?: "sending" | "sent" | "error";
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


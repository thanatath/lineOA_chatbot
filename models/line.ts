import type { WebhookEvent } from "@line/bot-sdk";

export type { WebhookEvent, Message, TextMessage } from "@line/bot-sdk";

export interface LineConfig {
  channelAccessToken: string;
  channelSecret: string;
}

export interface WebhookRequestBody {
  destination: string;
  events: WebhookEvent[];
}

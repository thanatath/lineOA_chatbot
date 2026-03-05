import type { ConversationMessage } from "./chat";

export interface UserChannel {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  messages: ConversationMessage[];
  lastMessageAt: number;
  unreadCount: number;
}

export interface ChannelSummary {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
  messageCount: number;
}

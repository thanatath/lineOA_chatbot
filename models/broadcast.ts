export interface BroadcastRequest {
  message: string;
}

export interface BroadcastResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  sentCount?: number;
}

export interface BroadcastLog {
  id: string;
  text: string;
  status: "sending" | "sent" | "error";
  timestamp: number;
  error?: string;
}

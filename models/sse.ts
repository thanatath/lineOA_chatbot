export interface SSEEvent {
  type: "new_message" | "new_channel" | "settings_update";
  data: unknown;
}

export interface SSEHandlers {
  onNewMessage?: (data: {
    userId: string;
    message: { id: string; text: string; sender: string; timestamp: number };
  }) => void;
  onNewChannel?: (data: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    lastMessageAt: number;
    unreadCount: number;
    lastMessage: string;
  }) => void;
  onSettingsUpdate?: (data: { autoResponseEnabled: boolean; systemPrompt: string }) => void;
}

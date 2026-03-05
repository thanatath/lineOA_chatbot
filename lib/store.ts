import type { UserChannel, ConversationMessage, AdminSettings } from "@/models";

const DEFAULT_SYSTEM_PROMPT =
  "คุณคือ TIFA AI เพื่อนช่วยคุยสำหรับผู้ใช้งานและคอยตอบคำถามแก้เหงาเชิงสร้างสรรค์";

class Store {
  private channels: Map<string, UserChannel> = new Map();
  private settings: AdminSettings = {
    autoResponseEnabled: true,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
  };
  private sseClients: Set<(event: string, data: string) => void> = new Set();
  private updateVersion = 0;

  getChannels(): UserChannel[] {
    return Array.from(this.channels.values()).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }

  getChannel(userId: string): UserChannel | undefined {
    return this.channels.get(userId);
  }

  addMessage(
    userId: string,
    displayName: string,
    pictureUrl: string | undefined,
    message: ConversationMessage
  ): UserChannel {
    let channel = this.channels.get(userId);

    if (!channel) {
      channel = {
        userId,
        displayName,
        pictureUrl,
        messages: [],
        lastMessageAt: message.timestamp,
        unreadCount: 0,
      };
      this.channels.set(userId, channel);
      this.broadcast("new_channel", JSON.stringify(this.serializeChannel(channel)));
    }

    channel.messages.push(message);
    channel.lastMessageAt = message.timestamp;
    if (message.sender === "user") {
      channel.unreadCount++;
    }

    this.updateVersion++;
    this.broadcast(
      "new_message",
      JSON.stringify({
        userId,
        message,
        updateVersion: this.updateVersion,
      })
    );

    return channel;
  }

  markRead(userId: string): void {
    const channel = this.channels.get(userId);
    if (channel) {
      channel.unreadCount = 0;
    }
  }

  getSettings(): AdminSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<AdminSettings>): AdminSettings {
    this.settings = { ...this.settings, ...updates };
    this.broadcast("settings_update", JSON.stringify(this.settings));
    return { ...this.settings };
  }

  getUpdateVersion(): number {
    return this.updateVersion;
  }

  addSSEClient(callback: (event: string, data: string) => void): () => void {
    this.sseClients.add(callback);
    return () => {
      this.sseClients.delete(callback);
    };
  }

  private broadcast(event: string, data: string): void {
    for (const client of this.sseClients) {
      try {
        client(event, data);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  private serializeChannel(channel: UserChannel) {
    return {
      userId: channel.userId,
      displayName: channel.displayName,
      pictureUrl: channel.pictureUrl,
      lastMessageAt: channel.lastMessageAt,
      unreadCount: channel.unreadCount,
      lastMessage: channel.messages[channel.messages.length - 1]?.text || "",
    };
  }
}

const globalForStore = globalThis as unknown as { __store?: Store };
export const store = globalForStore.__store ?? (globalForStore.__store = new Store());

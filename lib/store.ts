import type { UserChannel, ConversationMessage, AdminSettings } from "@/models";
import { BOT_MESSAGES } from "@/constants/messages";
import { getDb, ensureSchema } from "./db";

class Store {
  private sseClients: Set<(event: string, data: string) => void> = new Set();
  private updateVersion = 0;

  private async db() {
    await ensureSchema();
    return getDb();
  }

  async getChannels(): Promise<UserChannel[]> {
    const sql = await this.db();

    const rows = await sql`
      SELECT c.user_id, c.display_name, c.picture_url, c.last_message_at, c.unread_count
      FROM channels c
      ORDER BY c.last_message_at DESC
    `;

    const channels: UserChannel[] = [];
    for (const row of rows) {
      const messages = await sql`
        SELECT id, text, sender, "timestamp"
        FROM messages
        WHERE channel_user_id = ${row.user_id}
        ORDER BY "timestamp" ASC
      `;

      channels.push({
        userId: row.user_id,
        displayName: row.display_name,
        pictureUrl: row.picture_url || undefined,
        messages: messages.map((m) => ({
          id: m.id,
          text: m.text,
          sender: m.sender as "user" | "bot",
          timestamp: Number(m.timestamp),
        })),
        lastMessageAt: Number(row.last_message_at),
        unreadCount: row.unread_count,
      });
    }

    return channels;
  }

  async getChannel(userId: string): Promise<UserChannel | undefined> {
    const sql = await this.db();

    const rows = await sql`
      SELECT user_id, display_name, picture_url, last_message_at, unread_count
      FROM channels
      WHERE user_id = ${userId}
    `;

    if (rows.length === 0) return undefined;

    const row = rows[0];
    const messages = await sql`
      SELECT id, text, sender, "timestamp"
      FROM messages
      WHERE channel_user_id = ${userId}
      ORDER BY "timestamp" ASC
    `;

    return {
      userId: row.user_id,
      displayName: row.display_name,
      pictureUrl: row.picture_url || undefined,
      messages: messages.map((m) => ({
        id: m.id,
        text: m.text,
        sender: m.sender as "user" | "bot",
        timestamp: Number(m.timestamp),
      })),
      lastMessageAt: Number(row.last_message_at),
      unreadCount: row.unread_count,
    };
  }

  async addMessage(
    userId: string,
    displayName: string,
    pictureUrl: string | undefined,
    message: ConversationMessage
  ): Promise<UserChannel> {
    const sql = await this.db();

    const existing = await sql`
      SELECT user_id FROM channels WHERE user_id = ${userId}
    `;

    let isNewChannel = false;

    if (existing.length === 0) {
      await sql`
        INSERT INTO channels (user_id, display_name, picture_url, last_message_at, unread_count)
        VALUES (${userId}, ${displayName}, ${pictureUrl ?? null}, ${message.timestamp}, 0)
      `;
      isNewChannel = true;
    }

    await sql`
      INSERT INTO messages (id, channel_user_id, text, sender, "timestamp")
      VALUES (${message.id}, ${userId}, ${message.text}, ${message.sender}, ${message.timestamp})
    `;

    if (message.sender === "user") {
      await sql`
        UPDATE channels
        SET last_message_at = ${message.timestamp},
            unread_count = unread_count + 1,
            display_name = ${displayName},
            picture_url = ${pictureUrl ?? null}
        WHERE user_id = ${userId}
      `;
    } else {
      await sql`
        UPDATE channels
        SET last_message_at = ${message.timestamp},
            display_name = ${displayName},
            picture_url = ${pictureUrl ?? null}
        WHERE user_id = ${userId}
      `;
    }

    this.updateVersion++;

    const channel = (await this.getChannel(userId))!;

    if (isNewChannel) {
      this.broadcast("new_channel", JSON.stringify(this.serializeChannel(channel)));
    }

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

  async markRead(userId: string): Promise<void> {
    const sql = await this.db();
    await sql`
      UPDATE channels SET unread_count = 0 WHERE user_id = ${userId}
    `;
  }

  async getSettings(): Promise<AdminSettings> {
    const sql = await this.db();
    const rows = await sql`
      SELECT auto_response_enabled, system_prompt FROM settings WHERE id = 1
    `;

    if (rows.length === 0) {
      return {
        autoResponseEnabled: true,
        systemPrompt: BOT_MESSAGES.DEFAULT_SYSTEM_PROMPT,
      };
    }

    return {
      autoResponseEnabled: rows[0].auto_response_enabled,
      systemPrompt: rows[0].system_prompt || BOT_MESSAGES.DEFAULT_SYSTEM_PROMPT,
    };
  }

  async updateSettings(updates: Partial<AdminSettings>): Promise<AdminSettings> {
    const sql = await this.db();
    const current = await this.getSettings();
    const merged = { ...current, ...updates };

    await sql`
      UPDATE settings
      SET auto_response_enabled = ${merged.autoResponseEnabled},
          system_prompt = ${merged.systemPrompt}
      WHERE id = 1
    `;

    this.broadcast("settings_update", JSON.stringify(merged));
    return merged;
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
      messageCount: channel.messages.length,
    };
  }
}

const globalForStore = globalThis as unknown as { __store?: Store };
export const store = globalForStore.__store ?? (globalForStore.__store = new Store());

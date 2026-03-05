import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const channels = await store.getChannels();

  const summaries = channels.map((ch) => ({
    userId: ch.userId,
    displayName: ch.displayName,
    pictureUrl: ch.pictureUrl,
    lastMessage: ch.messages[ch.messages.length - 1]?.text || "",
    lastMessageAt: ch.lastMessageAt,
    unreadCount: ch.unreadCount,
    messageCount: ch.messages.length,
  }));

  return NextResponse.json(summaries);
}

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const channel = store.getChannel(userId);

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  store.markRead(userId);

  return NextResponse.json({
    userId: channel.userId,
    displayName: channel.displayName,
    pictureUrl: channel.pictureUrl,
    messages: channel.messages,
    lastMessageAt: channel.lastMessageAt,
  });
}

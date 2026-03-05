import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { API_ERRORS } from "@/constants/messages";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const channel = await store.getChannel(userId);

  if (!channel) {
    return NextResponse.json({ error: API_ERRORS.CHANNEL_NOT_FOUND }, { status: 404 });
  }

  await store.markRead(userId);

  return NextResponse.json({
    userId: channel.userId,
    displayName: channel.displayName,
    pictureUrl: channel.pictureUrl,
    messages: channel.messages,
    lastMessageAt: channel.lastMessageAt,
  });
}

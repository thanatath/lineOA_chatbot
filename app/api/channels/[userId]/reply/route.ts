import { NextRequest, NextResponse } from "next/server";
import { Client } from "@line/bot-sdk";
import { store } from "@/lib/store";
import type { ConversationMessage } from "@/models";

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { message } = body as { message: string };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const channel = store.getChannel(userId);
    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    await client.pushMessage(userId, {
      type: "text",
      text: message.trim(),
    });

    const botMsg: ConversationMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: message.trim(),
      sender: "bot",
      timestamp: Date.now(),
    };

    store.addMessage(userId, channel.displayName, channel.pictureUrl, botMsg);

    return NextResponse.json({ success: true, message: botMsg });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

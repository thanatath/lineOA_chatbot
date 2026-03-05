import { NextRequest, NextResponse, after } from "next/server";
import { Client, WebhookEvent, TextMessage, MessageEvent } from "@line/bot-sdk";
import { store } from "@/lib/store";
import { generateLLMResponse } from "@/lib/llm";
import type { ConversationMessage } from "@/types/line";

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

async function getUserProfile(userId: string) {
  try {
    const profile = await client.getProfile(userId);
    return { displayName: profile.displayName, pictureUrl: profile.pictureUrl };
  } catch {
    return { displayName: `User ${userId.slice(-6)}`, pictureUrl: undefined };
  }
}

async function processEvents(events: WebhookEvent[]) {
  try {
    await Promise.all(
      events.map(async (event: WebhookEvent) => {
        if (event.type !== "message" || event.message.type !== "text") return;

        const messageEvent = event as MessageEvent;
        const textMessage = messageEvent.message as TextMessage;
        const userId = messageEvent.source.userId;

        if (!userId) return;

        const profile = await getUserProfile(userId);

        const userMsg: ConversationMessage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text: textMessage.text,
          sender: "user",
          timestamp: Date.now(),
        };

        store.addMessage(userId, profile.displayName, profile.pictureUrl, userMsg);

        const settings = store.getSettings();
        if (!settings.autoResponseEnabled) return;

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "ขอน้อง TIFA คิดก่อนนะคะ รอซักประเดี๋ยวเดียวค่ะ",
        });

        try {
          const channel = store.getChannel(userId);
          const history = channel?.messages || [userMsg];
          const replyText = await generateLLMResponse(history);

          await client.pushMessage(userId, { type: "text", text: replyText });

          const botMsg: ConversationMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text: replyText,
            sender: "bot",
            timestamp: Date.now(),
          };

          store.addMessage(userId, profile.displayName, profile.pictureUrl, botMsg);
        } catch (llmError) {
          console.error("LLM response error:", llmError);

          const fallbackText = "ขออภัยค่ะ ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งนะคะ";
          await client.pushMessage(userId, { type: "text", text: fallbackText });

          const errorMsg: ConversationMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text: fallbackText,
            sender: "bot",
            timestamp: Date.now(),
          };

          store.addMessage(userId, profile.displayName, profile.pictureUrl, errorMsg);
        }
      })
    );
  } catch (err) {
    console.error("Background processing error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    const events: WebhookEvent[] = JSON.parse(body).events;

    after(processEvents(events));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "LINE Webhook endpoint" });
}

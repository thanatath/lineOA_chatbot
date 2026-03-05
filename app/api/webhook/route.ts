import { NextRequest, NextResponse } from "next/server";
import { Client, WebhookEvent, TextMessage, MessageEvent } from "@line/bot-sdk";

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    // Verify webhook signature
    const events: WebhookEvent[] = JSON.parse(body).events;

    // Process each event
    await Promise.all(
      events.map(async (event: WebhookEvent) => {
        if (event.type === "message" && event.message.type === "text") {
          const messageEvent = event as MessageEvent;
          const textMessage = messageEvent.message as TextMessage;

          // Echo back the message
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `You said: ${textMessage.text}`,
          });
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "LINE Webhook endpoint" });
}

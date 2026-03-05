import { NextRequest, NextResponse } from "next/server";
import { Client } from "@line/bot-sdk";
import { API_ERRORS } from "@/constants/messages";
import type { BroadcastRequest, BroadcastResponse } from "@/models";

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: BroadcastRequest = await req.json();
    const { message } = body;

    // Validate message
    if (!message || message.trim() === "") {
      return NextResponse.json(
        { success: false, error: API_ERRORS.MESSAGE_REQUIRED } as BroadcastResponse,
        { status: 400 }
      );
    }

    // Validate LINE credentials
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, error: API_ERRORS.LINE_TOKEN_NOT_CONFIGURED } as BroadcastResponse,
        { status: 500 }
      );
    }

    // Broadcast message to all followers
    const result = await client.broadcast({
      type: "text",
      text: message.trim(),
    });

    console.log("Broadcast sent successfully:", result);

    return NextResponse.json({
      success: true,
      messageId: Date.now().toString(),
    } as BroadcastResponse);
  } catch (error: unknown) {
    console.error("Broadcast error:", error);

    const err = error as { statusCode?: number; message?: string };

    if (err.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: API_ERRORS.INVALID_LINE_CREDENTIALS } as BroadcastResponse,
        { status: 401 }
      );
    }

    if (err.statusCode === 429) {
      return NextResponse.json(
        {
          success: false,
          error: API_ERRORS.RATE_LIMIT_EXCEEDED,
        } as BroadcastResponse,
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || API_ERRORS.BROADCAST_FAILED,
      } as BroadcastResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "LINE Broadcast API endpoint",
    usage: "POST with { message: 'your message' }",
  });
}

import { NextRequest, NextResponse } from "next/server";
import { Client } from "@line/bot-sdk";
import type { BroadcastRequest, BroadcastResponse } from "@/types/line";

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
        { success: false, error: "Message is required" } as BroadcastResponse,
        { status: 400 }
      );
    }

    // Validate LINE credentials
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, error: "LINE Channel Access Token not configured" } as BroadcastResponse,
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

  } catch (error: any) {
    console.error("Broadcast error:", error);
    
    // Handle specific LINE API errors
    if (error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: "Invalid LINE credentials" } as BroadcastResponse,
        { status: 401 }
      );
    }

    if (error.statusCode === 429) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." } as BroadcastResponse,
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to broadcast message" } as BroadcastResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "LINE Broadcast API endpoint",
    usage: "POST with { message: 'your message' }"
  });
}


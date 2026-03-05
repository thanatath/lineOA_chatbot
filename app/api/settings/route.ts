import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { API_ERRORS } from "@/constants/messages";
import type { AdminSettings } from "@/models";

export async function GET() {
  return NextResponse.json(store.getSettings());
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AdminSettings>;

    const allowed: (keyof AdminSettings)[] = ["autoResponseEnabled", "systemPrompt"];

    const updates: Partial<AdminSettings> = {};
    for (const key of allowed) {
      if (key in body) {
        (updates as Record<string, unknown>)[key] = body[key];
      }
    }

    const settings = store.updateSettings(updates);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: API_ERRORS.FAILED_TO_UPDATE_SETTINGS }, { status: 500 });
  }
}

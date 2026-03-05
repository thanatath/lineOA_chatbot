import type { ConversationMessage } from "@/models";
import { BOT_MESSAGES, API_ERRORS } from "@/constants/messages";
import { store } from "./store";

export async function generateLLMResponse(
  conversationHistory: ConversationMessage[]
): Promise<string> {
  const settings = store.getSettings();

  const host = process.env.LLM_API_HOST;
  const token = process.env.LLM_API_TOKEN;
  const model = process.env.LLM_MODEL;

  if (!host || !model) {
    throw new Error(API_ERRORS.LLM_CONFIG_INCOMPLETE);
  }

  const messages = [
    { role: "system" as const, content: settings.systemPrompt },
    ...conversationHistory.slice(-20).map((msg) => ({
      role: (msg.sender === "user" ? "user" : "assistant") as "user" | "assistant",
      content: msg.text,
    })),
  ];

  const url = host;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "http-referer": "https://kilocode.ai", // use kilo code user agent for free llm provider
    "user-agent": "Kilo-Code/4.121.0",
    "x-kilocode-version": "4.121.0",
    "x-stainless-arch": "x64",
    "x-stainless-lang": "js",
    "x-stainless-os": "Windows",
    "x-stainless-package-version": "5.12.2",
    "x-stainless-retry-count": "0",
    "x-stainless-runtime": "node",
    "x-stainless-runtime-version": "v22.20.0",
    "x-title": "Kilo Code",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || BOT_MESSAGES.LLM_FALLBACK;
}

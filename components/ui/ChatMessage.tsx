"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types/line";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-[#06c755] text-white rounded-br-sm"
            : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
        )}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
        <div
          className={cn(
            "text-xs mt-1 flex items-center gap-1",
            isUser ? "text-white/70 justify-end" : "text-gray-500"
          )}
        >
          <span>
            {message.timestamp.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isUser && message.status === "sending" && (
            <span className="inline-block w-1 h-1 bg-white/70 rounded-full animate-pulse" />
          )}
          {isUser && message.status === "sent" && (
            <span className="text-white/70">✓</span>
          )}
          {isUser && message.status === "error" && (
            <span className="text-red-200">!</span>
          )}
        </div>
      </div>
    </div>
  );
}


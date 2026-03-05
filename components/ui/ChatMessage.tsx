"use client";

import { cn } from "@/lib/utils";
import { LineIcon } from "@/components/ui/icons";
import type { ChatMessage as ChatMessageType } from "@/models";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";

  return (
    <div className={cn("flex w-full animate-message-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent flex items-center justify-center mr-2 mt-auto mb-6">
          <LineIcon className="w-5 h-5 text-white" />
        </div>
      )}

      <div className="max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-accent text-white rounded-br-sm"
              : "bg-white text-foreground rounded-bl-sm border border-border"
          )}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
        </div>
        <div
          className={cn(
            "text-[11px] mt-1 px-1 flex items-center gap-1",
            isUser ? "text-muted justify-end" : "text-muted"
          )}
        >
          <span>
            {message.timestamp.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isUser && message.status === "sending" && (
            <span className="w-1.5 h-1.5 rounded-full bg-muted-light animate-pulse-dot" />
          )}
          {isUser && message.status === "sent" && (
            <svg
              className="w-3.5 h-3.5 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
          {isUser && message.status === "error" && (
            <svg
              className="w-3.5 h-3.5 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

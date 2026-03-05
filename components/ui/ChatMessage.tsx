"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types/line";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";

  return (
    <div className={cn("flex w-full animate-message-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent flex items-center justify-center mr-2 mt-auto mb-6">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
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

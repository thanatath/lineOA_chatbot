"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChatInput } from "@/components/ui/ChatInput";
import type { ConversationMessage } from "@/types/line";

interface ChatPanelProps {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  messages: ConversationMessage[];
  onSendReply: (userId: string, message: string) => Promise<void>;
}

export function ChatPanel({
  userId,
  displayName,
  pictureUrl,
  messages,
  onSendReply,
}: ChatPanelProps) {
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    setSending(true);
    try {
      await onSendReply(userId, text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 flex items-center gap-3 bg-accent px-5 py-3 shadow-sm">
        {pictureUrl ? (
          <Image
            src={pictureUrl}
            alt={displayName}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">{displayName}</h2>
          <p className="text-xs text-white/60 truncate">{userId}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-surface-alt px-4 py-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sending} placeholder={`ตอบกลับ ${displayName}...`} />
    </div>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.sender === "user";
  const time = new Date(message.timestamp).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex w-full animate-message-in", isUser ? "justify-start" : "justify-end")}>
      <div className="max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm",
            isUser
              ? "bg-white text-foreground rounded-bl-sm border border-border"
              : "bg-accent text-white rounded-br-sm"
          )}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
        </div>
        <div
          className={cn("text-[10px] mt-0.5 px-1", isUser ? "text-muted" : "text-muted text-right")}
        >
          {isUser ? "ผู้ใช้" : "TIFA"} · {time}
        </div>
      </div>
    </div>
  );
}

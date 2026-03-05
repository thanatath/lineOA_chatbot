"use client";

import { useState } from "react";
import { ChatHeader } from "@/components/ui/ChatHeader";
import { ChatContainer } from "@/components/ui/ChatContainer";
import { ChatMessage } from "@/components/ui/ChatMessage";
import { ChatInput } from "@/components/ui/ChatInput";
import type { ChatMessage as ChatMessageType } from "@/types/line";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "1",
      text: "LINE Broadcast System is ready.\n\nType a message and press Enter to broadcast to all followers of your LINE Official Account.",
      sender: "bot",
      timestamp: new Date(),
      status: "sent",
    },
  ]);

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg))
        );

        const confirmMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          text: `Broadcast sent successfully.\n\n"${text}"`,
          sender: "bot",
          timestamp: new Date(),
          status: "sent",
        };

        setMessages((prev) => [...prev, confirmMessage]);
      } else {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg))
        );

        const errorMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          text: `Failed to broadcast: ${data.error || "Unknown error"}`,
          sender: "bot",
          timestamp: new Date(),
          status: "sent",
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Broadcast error:", error);

      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg))
      );

      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: "Network error. Please check your connection and try again.",
        sender: "bot",
        timestamp: new Date(),
        status: "sent",
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg h-full max-h-[700px] flex flex-col rounded-2xl bg-surface overflow-hidden shadow-card">
        <ChatHeader title="LINE Broadcast" subtitle="Send to all followers" online={true} />

        <ChatContainer>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </ChatContainer>

        <ChatInput onSend={handleSendMessage} placeholder="Write a broadcast message..." />
      </div>
    </div>
  );
}

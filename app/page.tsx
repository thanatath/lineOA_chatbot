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
      text: "📢 LINE Broadcast System Ready!\n\nType your message and press Enter to broadcast to ALL followers of your LINE Official Account.\n\nMake sure you've configured your LINE credentials in .env.local",
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
      // Call broadcast API to send message to all LINE followers
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (data.success) {
        // Update message status to sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
          )
        );

        // Add confirmation message
        const confirmMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          text: `✅ Broadcast sent successfully to all LINE followers!\n\nMessage: "${text}"`,
          sender: "bot",
          timestamp: new Date(),
          status: "sent",
        };

        setMessages((prev) => [...prev, confirmMessage]);
      } else {
        // Update message status to error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: "error" } : msg
          )
        );

        // Add error message
        const errorMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          text: `❌ Failed to broadcast message: ${data.error || "Unknown error"}`,
          sender: "bot",
          timestamp: new Date(),
          status: "sent",
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Broadcast error:", error);

      // Update message status to error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "error" } : msg
        )
      );

      // Add error message
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: "❌ Network error. Please check your connection and try again.",
        sender: "bot",
        timestamp: new Date(),
        status: "sent",
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <ChatHeader
        title="LINE Broadcast System"
        subtitle="Send messages to all followers"
        online={true}
      />

      <ChatContainer>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </ChatContainer>

      <ChatInput onSend={handleSendMessage} placeholder="Type message to broadcast to all followers..." />
    </div>
  );
}

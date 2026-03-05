"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "w-full resize-none rounded-full border border-gray-300 px-4 py-3 pr-12",
              "focus:outline-none focus:ring-2 focus:ring-[#06c755] focus:border-transparent",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              "placeholder:text-gray-400 text-sm",
              "max-h-32 overflow-y-auto"
            )}
            style={{
              minHeight: "48px",
              height: "auto",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            message.trim() && !disabled
              ? "bg-[#06c755] hover:bg-[#05b04d] text-white shadow-md hover:shadow-lg"
              : "bg-gray-200 text-gray-400"
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}


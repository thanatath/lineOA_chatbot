"use client";

import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [message]);

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

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className="flex-shrink-0 bg-surface border-t border-border px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl bg-surface-alt px-4 py-3",
              "text-sm text-foreground placeholder:text-muted-light",
              "border border-border",
              "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-150"
            )}
            style={{ minHeight: "48px" }}
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
            "transition-all duration-200",
            canSend
              ? "bg-accent text-white hover:bg-accent-dark active:scale-95 shadow-md"
              : "bg-border text-muted-light cursor-not-allowed"
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

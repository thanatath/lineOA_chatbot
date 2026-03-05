"use client";

import { LineIcon } from "@/components/ui/icons";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  online?: boolean;
}

export function ChatHeader({
  title = "LINE Broadcast",
  subtitle = "Send to all followers",
  online = true,
}: ChatHeaderProps) {
  return (
    <header className="flex-shrink-0 flex items-center gap-3 bg-accent px-5 py-4">
      <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm">
        <LineIcon className="w-6 h-6 text-white" />
        {online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-white ring-2 ring-accent" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-white leading-tight">{title}</h1>
        <p className="text-sm text-white/75 flex items-center gap-1.5 mt-0.5">
          {online && (
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse-dot" />
          )}
          {subtitle}
        </p>
      </div>
    </header>
  );
}

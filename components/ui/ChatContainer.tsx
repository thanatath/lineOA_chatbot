"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ChatContainerProps {
  children: ReactNode;
}

export function ChatContainer({ children }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [children]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-surface-alt px-4 py-5">
      <div className="space-y-4">{children}</div>
      <div ref={bottomRef} />
    </div>
  );
}

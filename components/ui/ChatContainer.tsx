"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ChatContainerProps {
  children: ReactNode;
}

export function ChatContainer({ children }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-gray-50 p-4 scroll-smooth"
    >
      {children}
    </div>
  );
}


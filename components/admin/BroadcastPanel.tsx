"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatInput } from "@/components/ui/ChatInput";
import type { BroadcastLog } from "@/models";

export function BroadcastPanel() {
  const [logs, setLogs] = useState<BroadcastLog[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleBroadcast = async (text: string) => {
    const entry: BroadcastLog = {
      id: Date.now().toString(),
      text,
      status: "sending",
      timestamp: Date.now(),
    };

    setLogs((prev) => [...prev, entry]);

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      setLogs((prev) =>
        prev.map((l) =>
          l.id === entry.id
            ? { ...l, status: data.success ? "sent" : "error", error: data.error }
            : l
        )
      );
    } catch {
      setLogs((prev) =>
        prev.map((l) => (l.id === entry.id ? { ...l, status: "error", error: "Network error" } : l))
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 flex items-center gap-3 bg-accent px-5 py-3 shadow-sm">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white">Broadcast</h2>
          <p className="text-xs text-white/60">ส่งข้อความถึงผู้ติดตามทั้งหมด</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-surface-alt px-4 py-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
                />
              </svg>
            </div>
            <p className="text-sm text-muted">
              พิมพ์ข้อความด้านล่างเพื่อ Broadcast ถึงผู้ติดตามทั้งหมด
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex justify-end animate-message-in">
                <div className="max-w-[80%]">
                  <div
                    className={cn(
                      "rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm",
                      log.status === "error"
                        ? "bg-danger/10 border border-danger/30 text-foreground"
                        : "bg-accent text-white"
                    )}
                  >
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {log.text}
                    </p>
                  </div>
                  <div className="text-[10px] mt-0.5 px-1 text-right flex items-center justify-end gap-1">
                    <span className="text-muted">
                      {new Date(log.timestamp).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {log.status === "sending" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-light animate-pulse-dot" />
                    )}
                    {log.status === "sent" && (
                      <svg
                        className="w-3.5 h-3.5 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                    {log.status === "error" && (
                      <span className="text-danger text-[10px]">{log.error || "Error"}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleBroadcast} placeholder="เขียนข้อความ Broadcast..." />
    </div>
  );
}

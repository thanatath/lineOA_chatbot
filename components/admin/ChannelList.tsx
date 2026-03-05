"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ChannelSummary {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
  messageCount: number;
}

interface ChannelListProps {
  channels: ChannelSummary[];
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
}

export function ChannelList({ channels, selectedUserId, onSelect }: ChannelListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">แชทผู้ใช้งาน</h2>
        <p className="text-xs text-muted mt-0.5">{channels.length} ช่องแชท</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-muted-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted">ยังไม่มีแชท</p>
            <p className="text-xs text-muted-light mt-1">ข้อความจากผู้ใช้จะแสดงที่นี่</p>
          </div>
        ) : (
          channels.map((channel) => (
            <button
              key={channel.userId}
              onClick={() => onSelect(channel.userId)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100",
                "hover:bg-surface-alt",
                selectedUserId === channel.userId && "bg-accent-light border-r-2 border-accent"
              )}
            >
              <div className="relative flex-shrink-0">
                {channel.pictureUrl ? (
                  <Image
                    src={channel.pictureUrl}
                    alt={channel.displayName}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-accent">
                      {channel.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {channel.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-medium flex items-center justify-center">
                    {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">
                    {channel.displayName}
                  </span>
                  <span className="text-[10px] text-muted-light flex-shrink-0 ml-2">
                    {formatTime(channel.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-muted truncate mt-0.5">{channel.lastMessage}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "ตอนนี้";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} นาที`;
  if (diff < 86400000) {
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

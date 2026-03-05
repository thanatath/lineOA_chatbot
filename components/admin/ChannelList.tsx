"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChatBubbleIcon } from "@/components/ui/icons";
import { ChannelSkeleton } from "@/components/ui/skeletons";
import type { ChannelSummary } from "@/models";

interface ChannelListProps {
  channels: ChannelSummary[];
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
  loading?: boolean;
}

export function ChannelList({ channels, selectedUserId, onSelect, loading }: ChannelListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">แชทผู้ใช้งาน</h2>
        {loading ? (
          <div className="h-3 w-16 skeleton mt-1" />
        ) : (
          <p className="text-xs text-muted mt-0.5">{channels.length} ช่องแชท</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <ChannelSkeleton key={i} />
            ))}
          </div>
        ) : channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mb-3">
              <ChatBubbleIcon className="w-6 h-6 text-muted-light" />
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

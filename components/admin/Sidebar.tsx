"use client";

import { cn } from "@/lib/utils";
import { LineIcon, GearIcon, BroadcastIcon } from "@/components/ui/icons";
import { ChannelList } from "@/components/admin/ChannelList";
import type { AdminSettings, ChannelSummary } from "@/models";

interface SidebarProps {
  settings: AdminSettings;
  channels: ChannelSummary[];
  selectedUserId: string | null;
  showBroadcast: boolean;
  loadingChannels: boolean;
  onSelectChannel: (userId: string) => void;
  onOpenSettings: () => void;
  onOpenBroadcast: () => void;
}

export function Sidebar({
  settings,
  channels,
  selectedUserId,
  showBroadcast,
  loadingChannels,
  onSelectChannel,
  onOpenSettings,
  onOpenBroadcast,
}: SidebarProps) {
  return (
    <>
      {/* Brand header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-accent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <LineIcon className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">TIFA Admin</h1>
            <p className="text-[10px] text-white/60">LINE Chat Manager</p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors relative"
        >
          <GearIcon className="w-4.5 h-4.5 text-white" />
          {settings.autoResponseEnabled && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-accent animate-pulse-dot" />
          )}
        </button>
      </div>

      {/* AI status bar */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs border-b border-border transition-colors",
          settings.autoResponseEnabled ? "bg-accent-light text-accent" : "bg-surface-alt text-muted"
        )}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            settings.autoResponseEnabled ? "bg-accent animate-pulse-dot" : "bg-muted-light"
          )}
        />
        {settings.autoResponseEnabled ? "AI ตอบกลับอัตโนมัติ: เปิด" : "AI ตอบกลับอัตโนมัติ: ปิด"}
      </div>

      {/* Broadcast button */}
      <button
        onClick={onOpenBroadcast}
        className={cn(
          "flex-shrink-0 flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 border-b border-border",
          "hover:bg-surface-alt",
          showBroadcast && "bg-accent-light border-r-2 border-r-accent"
        )}
      >
        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
          <BroadcastIcon className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">Broadcast</span>
          <p className="text-xs text-muted mt-0.5">ส่งข้อความถึงทุกคน</p>
        </div>
      </button>

      <ChannelList
        channels={channels}
        selectedUserId={selectedUserId}
        onSelect={onSelectChannel}
        loading={loadingChannels}
      />
    </>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { ChannelList, type ChannelSummary } from "@/components/admin/ChannelList";
import { ChatPanel } from "@/components/admin/ChatPanel";
import { BroadcastPanel } from "@/components/admin/BroadcastPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { useSSE } from "@/hooks/useSSE";
import { cn } from "@/lib/utils";
import type { AdminSettings, ConversationMessage } from "@/types/line";

export default function AdminDashboard() {
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    autoResponseEnabled: false,
    systemPrompt: "",
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<{
    displayName: string;
    pictureUrl?: string;
  }>({
    displayName: "",
  });

  // Fetch initial data
  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then(setChannels)
      .catch(console.error);
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  // SSE real-time updates
  useSSE({
    onNewMessage: (data) => {
      setChannels((prev) => {
        const idx = prev.findIndex((c) => c.userId === data.userId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: data.message.text,
          lastMessageAt: data.message.timestamp,
          unreadCount:
            data.userId === selectedUserId
              ? 0
              : updated[idx].unreadCount + (data.message.sender === "user" ? 1 : 0),
          messageCount: updated[idx].messageCount + 1,
        };
        return updated.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      });

      if (data.userId === selectedUserId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message as ConversationMessage];
        });
      }
    },
    onNewChannel: (data) => {
      setChannels((prev) => {
        if (prev.some((c) => c.userId === data.userId)) return prev;
        return [
          {
            userId: data.userId,
            displayName: data.displayName,
            pictureUrl: data.pictureUrl,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt,
            unreadCount: data.unreadCount,
            messageCount: 1,
          },
          ...prev,
        ];
      });
    },
    onSettingsUpdate: (data) => {
      setSettings((prev) => ({ ...prev, ...data }));
    },
  });

  const handleSelectChannel = useCallback(async (userId: string) => {
    setSelectedUserId(userId);
    setShowBroadcast(false);
    setSidebarOpen(false);
    try {
      const res = await fetch(`/api/channels/${userId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setSelectedProfile({ displayName: data.displayName, pictureUrl: data.pictureUrl });
      setChannels((prev) => prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c)));
    } catch (err) {
      console.error("Failed to load channel:", err);
    }
  }, []);

  const handleSendReply = useCallback(async (userId: string, message: string) => {
    const res = await fetch(`/api/channels/${userId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Failed to send reply");
  }, []);

  const handleUpdateSettings = useCallback(async (updates: Partial<AdminSettings>) => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    const data = await res.json();
    setSettings(data);
  }, []);

  const totalUnread = channels.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="h-screen w-screen flex bg-background">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-40 md:hidden w-10 h-10 rounded-xl bg-surface shadow-card flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 text-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
        {!sidebarOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-medium flex items-center justify-center">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 bg-surface border-r border-border flex flex-col transition-all duration-200",
          "fixed md:static inset-y-0 left-0 z-30",
          "w-80",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-accent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight">TIFA Admin</h1>
              <p className="text-[10px] text-white/60">LINE Chat Manager</p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors relative"
          >
            <svg
              className="w-4.5 h-4.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            {settings.autoResponseEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-accent animate-pulse-dot" />
            )}
          </button>
        </div>

        {/* AI status bar */}
        <div
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs border-b border-border transition-colors",
            settings.autoResponseEnabled
              ? "bg-accent-light text-accent"
              : "bg-surface-alt text-muted"
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
          onClick={() => {
            setShowBroadcast(true);
            setSelectedUserId(null);
            setSidebarOpen(false);
          }}
          className={cn(
            "flex-shrink-0 flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 border-b border-border",
            "hover:bg-surface-alt",
            showBroadcast && "bg-accent-light border-r-2 border-r-accent"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-accent"
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
            <span className="text-sm font-medium text-foreground">Broadcast</span>
            <p className="text-xs text-muted mt-0.5">ส่งข้อความถึงทุกคน</p>
          </div>
        </button>

        <ChannelList
          channels={channels}
          selectedUserId={selectedUserId}
          onSelect={handleSelectChannel}
        />
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {showBroadcast ? (
          <BroadcastPanel />
        ) : selectedUserId ? (
          <ChatPanel
            userId={selectedUserId}
            displayName={selectedProfile.displayName}
            pictureUrl={selectedProfile.pictureUrl}
            messages={messages}
            onSendReply={handleSendReply}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-surface-alt text-center px-8">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">TIFA Admin Dashboard</h2>
            <p className="text-sm text-muted max-w-sm">
              เลือกแชทจากรายการด้านซ้ายเพื่อดูและตอบกลับข้อความผู้ใช้
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-muted">
                <span className="w-2 h-2 rounded-full bg-accent" />
                {channels.length} ช่องแชท
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-muted hover:border-accent hover:text-accent transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                ตั้งค่า AI
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Settings modal */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

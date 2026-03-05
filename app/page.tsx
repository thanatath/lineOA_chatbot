"use client";

import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { ChatPanel } from "@/components/admin/ChatPanel";
import { BroadcastPanel } from "@/components/admin/BroadcastPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { WelcomePanel } from "@/components/admin/WelcomePanel";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";
import { useSSE } from "@/hooks/useSSE";
import { cn } from "@/lib/utils";
import { API_ERRORS } from "@/constants/messages";
import type { AdminSettings, ConversationMessage, ChannelSummary } from "@/models";

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
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{
    displayName: string;
    pictureUrl?: string;
  }>({
    displayName: "",
  });

  useEffect(() => {
    setLoadingChannels(true);
    Promise.all([
      fetch("/api/channels")
        .then((r) => r.json())
        .then(setChannels),
      fetch("/api/settings")
        .then((r) => r.json())
        .then(setSettings),
    ])
      .catch(console.error)
      .finally(() => setLoadingChannels(false));
  }, []);

  useSSE({
    onNewMessage: (data) => {
      setChannels((prev) => {
        const idx = prev.findIndex((c) => c.userId === data.userId);
        if (idx === -1) {
          fetch("/api/channels")
            .then((r) => r.json())
            .then(setChannels)
            .catch(console.error);
          return prev;
        }
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
            messageCount: data.messageCount ?? 1,
          },
          ...prev,
        ];
      });
    },
    onSettingsUpdate: (data) => {
      setSettings((prev) => ({ ...prev, ...data }));
    },
    onConnected: () => {
      fetch("/api/channels")
        .then((r) => r.json())
        .then(setChannels)
        .catch(console.error);
      fetch("/api/settings")
        .then((r) => r.json())
        .then(setSettings)
        .catch(console.error);
    },
  });

  const handleSelectChannel = useCallback(async (userId: string) => {
    setSelectedUserId(userId);
    setShowBroadcast(false);
    setSidebarOpen(false);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/channels/${userId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setSelectedProfile({ displayName: data.displayName, pictureUrl: data.pictureUrl });
      setChannels((prev) => prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c)));
    } catch (err) {
      console.error("Failed to load channel:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const handleSendReply = useCallback(async (userId: string, message: string) => {
    const res = await fetch(`/api/channels/${userId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(API_ERRORS.FAILED_TO_SEND_REPLY);
    const data = await res.json();
    if (data.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message as ConversationMessage];
      });
      setChannels((prev) => {
        const idx = prev.findIndex((c) => c.userId === userId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: data.message.text,
          lastMessageAt: data.message.timestamp,
          messageCount: updated[idx].messageCount + 1,
        };
        return updated.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      });
    }
  }, []);

  const handleUpdateSettings = useCallback(async (updates: Partial<AdminSettings>) => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(API_ERRORS.FAILED_TO_UPDATE_SETTINGS);
    const data = await res.json();
    setSettings(data);
  }, []);

  const handleOpenBroadcast = useCallback(() => {
    setShowBroadcast(true);
    setSelectedUserId(null);
    setSidebarOpen(false);
  }, []);

  const totalUnread = channels.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="h-screen w-screen flex bg-background">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-40 md:hidden w-10 h-10 rounded-xl bg-surface shadow-card flex items-center justify-center"
      >
        {sidebarOpen ? (
          <CloseIcon className="w-5 h-5 text-foreground" />
        ) : (
          <MenuIcon className="w-5 h-5 text-foreground" />
        )}
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
        <Sidebar
          settings={settings}
          channels={channels}
          selectedUserId={selectedUserId}
          showBroadcast={showBroadcast}
          loadingChannels={loadingChannels}
          onSelectChannel={handleSelectChannel}
          onOpenSettings={() => setShowSettings(true)}
          onOpenBroadcast={handleOpenBroadcast}
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
            loading={loadingMessages}
          />
        ) : (
          <WelcomePanel
            channelCount={channels.length}
            onOpenSettings={() => setShowSettings(true)}
          />
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

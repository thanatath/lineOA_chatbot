"use client";

import { LineIcon, GearIcon } from "@/components/ui/icons";

interface WelcomePanelProps {
  channelCount: number;
  onOpenSettings: () => void;
}

export function WelcomePanel({ channelCount, onOpenSettings }: WelcomePanelProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface-alt text-center px-8">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5">
        <LineIcon className="w-10 h-10 text-accent" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">TIFA Admin Dashboard</h2>
      <p className="text-sm text-muted max-w-sm">
        เลือกแชทจากรายการด้านซ้ายเพื่อดูและตอบกลับข้อความผู้ใช้
      </p>
      <div className="flex items-center gap-4 mt-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-muted">
          <span className="w-2 h-2 rounded-full bg-accent" />
          {channelCount} ช่องแชท
        </div>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-muted hover:border-accent hover:text-accent transition-colors"
        >
          <GearIcon className="w-3.5 h-3.5" />
          ตั้งค่า AI
        </button>
      </div>
    </div>
  );
}

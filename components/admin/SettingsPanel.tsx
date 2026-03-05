"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { AdminSettings } from "@/types/line";

interface SettingsPanelProps {
  settings: AdminSettings;
  onUpdate: (updates: Partial<AdminSettings>) => Promise<void>;
  onClose: () => void;
}

export function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onUpdate({
        autoResponseEnabled: localSettings.autoResponseEnabled,
        systemPrompt: localSettings.systemPrompt,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [localSettings, onUpdate]);

  const handleToggle = async () => {
    const next = !localSettings.autoResponseEnabled;
    setLocalSettings((s) => ({ ...s, autoResponseEnabled: next }));
    setSaving(true);
    try {
      await onUpdate({ autoResponseEnabled: next });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-xl overflow-hidden animate-message-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">ตั้งค่า AI Response</h2>
            <p className="text-xs text-muted mt-0.5">ตั้งค่าระบบตอบกลับอัตโนมัติ</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-alt transition-colors"
          >
            <svg
              className="w-5 h-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Auto-response toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">ตอบกลับอัตโนมัติ</label>
              <p className="text-xs text-muted mt-0.5">เมื่อเปิด AI จะตอบกลับผู้ใช้อัตโนมัติ</p>
            </div>
            <button
              onClick={handleToggle}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors duration-200",
                localSettings.autoResponseEnabled ? "bg-accent" : "bg-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200",
                  localSettings.autoResponseEnabled && "translate-x-5"
                )}
              />
            </button>
          </div>

          {/* System prompt */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              System Prompt
            </label>
            <textarea
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings((s) => ({ ...s, systemPrompt: e.target.value }))}
              rows={4}
              className={cn(
                "w-full rounded-xl bg-surface-alt px-4 py-3 text-sm text-foreground",
                "border border-border resize-none",
                "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
                "transition-colors duration-150"
              )}
            />
          </div>

          <p className="text-[11px] text-muted">
            LLM Host, Model และ Token ตั้งค่าผ่านไฟล์{" "}
            <code className="px-1 py-0.5 rounded bg-surface-alt text-[10px]">.env</code>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-surface-alt/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-lg"
          >
            ปิด
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              saved
                ? "bg-accent text-white"
                : "bg-accent text-white hover:bg-accent-dark active:scale-[0.97]",
              saving && "opacity-70 cursor-wait"
            )}
          >
            {saving ? "กำลังบันทึก..." : saved ? "บันทึกแล้ว ✓" : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

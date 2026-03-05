export const BOT_MESSAGES = {
  THINKING: "ขอน้อง TIFA คิดก่อนนะคะ รอซักประเดี๋ยวเดียวค่ะ",
  ERROR_FALLBACK: "ขออภัยค่ะ ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งนะคะ",
  LLM_FALLBACK: "ขออภัย ไม่สามารถสร้างคำตอบได้",
  DEFAULT_SYSTEM_PROMPT:
    "คุณคือ TIFA AI เพื่อนช่วยคุยสำหรับผู้ใช้งานและคอยตอบคำถามแก้เหงาเชิงสร้างสรรค์",
} as const;

export const API_ERRORS = {
  NO_SIGNATURE: "No signature",
  INTERNAL_SERVER_ERROR: "Internal server error",
  MESSAGE_REQUIRED: "Message is required",
  CHANNEL_NOT_FOUND: "Channel not found",
  FAILED_TO_SEND_REPLY: "Failed to send reply",
  FAILED_TO_UPDATE_SETTINGS: "Failed to update settings",
  LINE_TOKEN_NOT_CONFIGURED: "LINE Channel Access Token not configured",
  INVALID_LINE_CREDENTIALS: "Invalid LINE credentials",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded. Please try again later.",
  BROADCAST_FAILED: "Failed to broadcast message",
  LLM_CONFIG_INCOMPLETE: "LLM configuration incomplete: missing host or model",
} as const;

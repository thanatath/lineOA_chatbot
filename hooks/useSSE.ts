"use client";

import { useEffect, useRef } from "react";
import type { SSEHandlers } from "@/models";

export function useSSE(handlers: SSEHandlers) {
  const handlersRef = useRef(handlers);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const connect = (): EventSource => {
      const es = new EventSource("/api/events");

      es.addEventListener("new_message", (e) => {
        try {
          const data = JSON.parse(e.data);
          handlersRef.current.onNewMessage?.(data);
        } catch {
          /* ignore parse errors */
        }
      });

      es.addEventListener("new_channel", (e) => {
        try {
          const data = JSON.parse(e.data);
          handlersRef.current.onNewChannel?.(data);
        } catch {
          /* ignore parse errors */
        }
      });

      es.addEventListener("settings_update", (e) => {
        try {
          const data = JSON.parse(e.data);
          handlersRef.current.onSettingsUpdate?.(data);
        } catch {
          /* ignore parse errors */
        }
      });

      es.onerror = () => {
        es.close();
        reconnectTimeoutRef.current = setTimeout(() => {
          const newEs = connect();
          esRef.current = newEs;
        }, 3000);
      };

      return es;
    };

    const esRef = { current: connect() };

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      esRef.current.close();
    };
  }, []);
}

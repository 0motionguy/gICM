/**
 * WebSocket Hook for Real-time Events
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDashboardStore } from "./store";

const WS_URL = process.env.NEXT_PUBLIC_HUB_WS_URL || "ws://localhost:3100/ws";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setConnected, addEvent } = useDashboardStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onclose = () => {
        setConnected(false);

        // Attempt reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (e) => {
        console.error("[WS] Error:", e);
      };

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.id && event.timestamp) {
            addEvent(event);
          }
        } catch (err) {
          // Ignore non-JSON messages
        }
      };

      wsRef.current = ws;
    } catch (e) {
      console.error("[WS] Connection error:", e);
      setConnected(false);
    }
  }, [setConnected, addEvent]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}

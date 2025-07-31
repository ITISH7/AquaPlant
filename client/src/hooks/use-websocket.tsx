import { useState, useEffect, useRef } from "react";
import { type SystemStatus, type WateringProgress } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface NotificationData {
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export function useWebSocket() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [wateringProgress, setWateringProgress] = useState<WateringProgress | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const connect = () => {
    try {
      // For Replit deployment, always use the current host
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log("Connecting to WebSocket:", wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setConnectionStatus("connected");
        // Request initial status
        sendMessage({ type: "get_status" });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case "system_status":
              setSystemStatus(message.data);
              break;
            case "watering_progress":
              setWateringProgress(message.data);
              break;
            case "notification":
              const notification = message.data as NotificationData;
              toast({
                title: notification.title,
                description: notification.message,
                variant: notification.type === "error" ? "destructive" : "default",
              });
              break;
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      wsRef.current.onclose = () => {
        setConnectionStatus("disconnected");
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      wsRef.current.onerror = () => {
        setConnectionStatus("disconnected");
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setConnectionStatus("disconnected");
      setTimeout(connect, 3000);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const startWatering = () => {
    sendMessage({ type: "start_watering" });
  };

  const stopWatering = () => {
    sendMessage({ type: "stop_watering" });
  };

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    systemStatus,
    wateringProgress,
    connectionStatus,
    startWatering,
    stopWatering,
  };
}

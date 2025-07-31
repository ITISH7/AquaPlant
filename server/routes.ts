import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertScheduleSchema, type SystemStatus, type WateringProgress } from "@shared/schema";
import * as cron from "node-cron";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const scheduleData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Invalid schedule data" });
    }
  });

  app.put("/api/schedules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const scheduleData = insertScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateSchedule(id, scheduleData);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Invalid schedule data" });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSchedule(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });

  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getWateringLogs(20);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Move WebSocket creation before the test endpoint
  const httpServer = createServer(app);
  
  // WebSocket Server with additional configuration for Replit
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    perMessageDeflate: false,
    clientTracking: true
  });

  // WebSocket test endpoint (now wss is defined)
  app.get("/api/ws-test", (req, res) => {
    res.json({
      message: "WebSocket server is configured",
      path: "/ws",
      clients: wss.clients.size,
      readyState: "ready"
    });
  });



  // Log WebSocket connections for debugging
  wss.on('connection', (ws, req) => {
    console.log(`Client connected from ${req.socket.remoteAddress}`);
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // System state
  let currentMoisture = 68;
  let temperature = 24;
  let humidity = 65;
  let lightLevel = "High";
  let isWatering = false;
  let wateringStartTime: Date | null = null;
  let currentWateringLogId: string | null = null;

  // Broadcast to all connected clients
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Send system status
  function broadcastSystemStatus() {
    const status: SystemStatus = {
      moistureLevel: currentMoisture,
      temperature,
      humidity,
      lightLevel,
      isWatering,
      pumpStatus: isWatering ? "running" : "idle",
      connectionStatus: "connected"
    };
    broadcast({ type: "system_status", data: status });
  }

  // Send watering progress
  function broadcastWateringProgress() {
    if (isWatering && wateringStartTime) {
      const timeElapsed = Math.floor((Date.now() - wateringStartTime.getTime()) / 1000);
      const progress: WateringProgress = {
        isActive: isWatering,
        progress: Math.min(100, (timeElapsed / 60) * 100), // Assume 60 seconds max
        timeElapsed,
        currentMoisture
      };
      broadcast({ type: "watering_progress", data: progress });
    }
  }

  // Start watering
  async function startWatering(type: "manual" | "scheduled" = "manual") {
    if (isWatering) return;

    isWatering = true;
    wateringStartTime = new Date();
    
    // Create watering log
    const log = await storage.createWateringLog({
      type,
      startTime: wateringStartTime,
      startMoisture: currentMoisture,
      endTime: null,
      endMoisture: null,
      status: "running",
      duration: null
    });
    currentWateringLogId = log.id;

    broadcastSystemStatus();
    broadcast({ type: "notification", data: { title: "Watering started", message: `${type} watering session began`, type: "info" } });

    // Simulate watering process
    const wateringInterval = setInterval(async () => {
      if (!isWatering) {
        clearInterval(wateringInterval);
        return;
      }

      // Increase moisture level
      currentMoisture = Math.min(100, currentMoisture + 1);
      broadcastSystemStatus();
      broadcastWateringProgress();

      // Auto-stop when moisture reaches 100%
      if (currentMoisture >= 100) {
        await stopWatering(true);
        clearInterval(wateringInterval);
      }
    }, 1000);
  }

  // Stop watering
  async function stopWatering(completed: boolean = false) {
    if (!isWatering || !currentWateringLogId || !wateringStartTime) return;

    isWatering = false;
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - wateringStartTime.getTime()) / 1000);

    // Update watering log
    await storage.updateWateringLog(currentWateringLogId, {
      endTime,
      endMoisture: currentMoisture,
      status: completed ? "completed" : "stopped",
      duration
    });

    wateringStartTime = null;
    currentWateringLogId = null;

    broadcastSystemStatus();
    
    const message = completed ? 
      `Watering completed! Moisture level reached ${currentMoisture}%` :
      `Watering stopped. Moisture level: ${currentMoisture}%`;
    
    broadcast({ 
      type: "notification", 
      data: { 
        title: completed ? "Watering completed!" : "Watering stopped", 
        message,
        type: completed ? "success" : "info"
      }
    });
  }

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send initial system status
    broadcastSystemStatus();

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'start_watering':
            await startWatering("manual");
            break;
          case 'stop_watering':
            await stopWatering(false);
            break;
          case 'get_status':
            broadcastSystemStatus();
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Simulate sensor readings
  setInterval(async () => {
    // Simulate natural moisture decrease when not watering
    if (!isWatering && currentMoisture > 0) {
      currentMoisture = Math.max(0, currentMoisture - 0.1);
    }

    // Simulate environmental changes
    temperature = 22 + Math.random() * 6; // 22-28°C
    humidity = 55 + Math.random() * 20; // 55-75%
    
    // Create sensor reading
    await storage.createSensorReading({
      moistureLevel: Math.round(currentMoisture),
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      lightLevel: lightLevel
    });

    broadcastSystemStatus();
  }, 5000); // Every 5 seconds

  // Scheduled watering with cron
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const schedules = await storage.getSchedules();
    const activeSchedules = schedules.filter(s => s.active && s.time === currentTime);
    
    if (activeSchedules.length > 0 && !isWatering) {
      await startWatering("scheduled");
    }
  });

  return httpServer;
}

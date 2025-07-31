import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wateringSchedules = pgTable("watering_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  time: text("time").notNull(), // Format: "HH:MM"
  frequency: text("frequency").notNull().default("daily"),
  duration: integer("duration").notNull().default(30), // seconds
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const wateringLogs = pgTable("watering_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "manual" | "scheduled"
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  startMoisture: integer("start_moisture").notNull(),
  endMoisture: integer("end_moisture"),
  status: text("status").notNull().default("running"), // "running" | "completed" | "stopped"
  duration: integer("duration"), // seconds
});

export const sensorReadings = pgTable("sensor_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moistureLevel: integer("moisture_level").notNull(),
  temperature: integer("temperature").notNull(), // Celsius
  humidity: integer("humidity").notNull(), // Percentage
  lightLevel: text("light_level").notNull(), // "low" | "medium" | "high"
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const insertScheduleSchema = createInsertSchema(wateringSchedules).omit({
  id: true,
  createdAt: true,
});

export const insertLogSchema = createInsertSchema(wateringLogs).omit({
  id: true,
});

export const insertSensorReadingSchema = createInsertSchema(sensorReadings).omit({
  id: true,
  timestamp: true,
});

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof wateringSchedules.$inferSelect;

export type InsertLog = z.infer<typeof insertLogSchema>;
export type WateringLog = typeof wateringLogs.$inferSelect;

export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;
export type SensorReading = typeof sensorReadings.$inferSelect;

// WebSocket message types
export interface SystemStatus {
  moistureLevel: number;
  temperature: number;
  humidity: number;
  lightLevel: string;
  isWatering: boolean;
  pumpStatus: string;
  connectionStatus: string;
}

export interface WateringProgress {
  isActive: boolean;
  progress: number;
  timeElapsed: number;
  currentMoisture: number;
}

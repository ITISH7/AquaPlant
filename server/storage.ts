import { type Schedule, type InsertSchedule, type WateringLog, type InsertLog, type SensorReading, type InsertSensorReading } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Schedules
  getSchedules(): Promise<Schedule[]>;
  getSchedule(id: string): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: string, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: string): Promise<boolean>;

  // Watering logs
  getWateringLogs(limit?: number): Promise<WateringLog[]>;
  createWateringLog(log: InsertLog): Promise<WateringLog>;
  updateWateringLog(id: string, log: Partial<InsertLog>): Promise<WateringLog | undefined>;

  // Sensor readings
  getLatestSensorReading(): Promise<SensorReading | undefined>;
  createSensorReading(reading: InsertSensorReading): Promise<SensorReading>;
  getSensorReadings(limit?: number): Promise<SensorReading[]>;
}

export class MemStorage implements IStorage {
  private schedules: Map<string, Schedule>;
  private wateringLogs: Map<string, WateringLog>;
  private sensorReadings: Map<string, SensorReading>;

  constructor() {
    this.schedules = new Map();
    this.wateringLogs = new Map();
    this.sensorReadings = new Map();

    // Add default schedules
    this.createSchedule({ time: "07:00", frequency: "daily", duration: 30, active: true });
    this.createSchedule({ time: "08:00", frequency: "daily", duration: 25, active: true });
    this.createSchedule({ time: "18:00", frequency: "daily", duration: 20, active: false });
  }

  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).sort((a, b) => a.time.localeCompare(b.time));
  }

  async getSchedule(id: string): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = randomUUID();
    const schedule: Schedule = {
      ...insertSchedule,
      id,
      createdAt: new Date(),
    };
    this.schedules.set(id, schedule);
    return schedule;
  }

  async updateSchedule(id: string, updateData: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const existing = this.schedules.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.schedules.set(id, updated);
    return updated;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return this.schedules.delete(id);
  }

  async getWateringLogs(limit: number = 10): Promise<WateringLog[]> {
    return Array.from(this.wateringLogs.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  async createWateringLog(insertLog: InsertLog): Promise<WateringLog> {
    const id = randomUUID();
    const log: WateringLog = {
      ...insertLog,
      id,
    };
    this.wateringLogs.set(id, log);
    return log;
  }

  async updateWateringLog(id: string, updateData: Partial<InsertLog>): Promise<WateringLog | undefined> {
    const existing = this.wateringLogs.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.wateringLogs.set(id, updated);
    return updated;
  }

  async getLatestSensorReading(): Promise<SensorReading | undefined> {
    const readings = Array.from(this.sensorReadings.values());
    if (readings.length === 0) return undefined;
    
    return readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  async createSensorReading(insertReading: InsertSensorReading): Promise<SensorReading> {
    const id = randomUUID();
    const reading: SensorReading = {
      ...insertReading,
      id,
      timestamp: new Date(),
    };
    this.sensorReadings.set(id, reading);
    return reading;
  }

  async getSensorReadings(limit: number = 100): Promise<SensorReading[]> {
    return Array.from(this.sensorReadings.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();

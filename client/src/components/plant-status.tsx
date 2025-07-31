import { Thermometer, Eye, Sun } from "lucide-react";
import { type SystemStatus } from "@shared/schema";

interface PlantStatusProps {
  systemStatus: SystemStatus | null;
}

export default function PlantStatus({ systemStatus }: PlantStatusProps) {
  const getLightLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return "text-accent bg-accent bg-opacity-10";
      case "medium": return "text-secondary bg-secondary bg-opacity-10";
      case "low": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (!systemStatus) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plant Status</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="w-16 h-4 bg-gray-200 rounded" />
              </div>
              <div className="w-12 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Plant Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
              <Thermometer size={16} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-700">Temperature</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {systemStatus.temperature}°C
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
              <Eye size={16} className="text-secondary" />
            </div>
            <span className="text-sm font-medium text-gray-700">Humidity</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {systemStatus.humidity}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getLightLevelColor(systemStatus.lightLevel)}`}>
              <Sun size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">Light Level</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 capitalize">
            {systemStatus.lightLevel}
          </span>
        </div>
      </div>
    </div>
  );
}

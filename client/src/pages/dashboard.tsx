import { Sprout, Settings } from "lucide-react";
import MoistureMonitor from "@/components/moisture-monitor";
import ManualControl from "@/components/manual-control";
import ScheduleManager from "@/components/schedule-manager";
import ActivityLog from "@/components/activity-log";
import PlantStatus from "@/components/plant-status";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Dashboard() {
  const { systemStatus, connectionStatus } = useWebSocket();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sprout className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Smart Plant Care</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-primary pulse-animation' : 'bg-gray-400'}`}></div>
                <span className="capitalize">{connectionStatus}</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            <MoistureMonitor 
              moistureLevel={systemStatus?.moistureLevel || 0}
            />
            <ManualControl 
              isWatering={systemStatus?.isWatering || false}
              pumpStatus={systemStatus?.pumpStatus || "idle"}
            />
            <ActivityLog />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <PlantStatus systemStatus={systemStatus} />
            <ScheduleManager />
          </div>
        </div>
      </div>
    </div>
  );
}

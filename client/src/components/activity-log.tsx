import { useQuery } from "@tanstack/react-query";
import { type WateringLog } from "@shared/schema";
import { Droplet, Calendar, AlertCircle } from "lucide-react";

export default function ActivityLog() {
  const { data: logs = [], isLoading } = useQuery<WateringLog[]>({
    queryKey: ['/api/logs'],
  });

  const getActivityIcon = (type: string, status: string) => {
    if (type === "scheduled") return <Calendar size={8} className="text-secondary" />;
    if (status === "completed") return <Droplet size={8} className="text-primary" />;
    return <AlertCircle size={8} className="text-accent" />;
  };

  const getActivityColor = (type: string, status: string) => {
    if (type === "scheduled" && status === "completed") return "bg-green-50";
    if (type === "manual") return "bg-blue-50";
    if (status === "stopped") return "bg-yellow-50";
    return "bg-gray-50";
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getMoistureChange = (log: WateringLog) => {
    if (log.endMoisture === null) return "In progress";
    const change = log.endMoisture - log.startMoisture;
    return `${log.startMoisture}% → ${log.endMoisture}% (+${change}%)`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-300 rounded" />
                <div className="w-1/2 h-3 bg-gray-300 rounded" />
                <div className="w-1/4 h-3 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">
          No watering activity yet
        </p>
      ) : (
        <div className="space-y-4">
          {logs.map((log: WateringLog) => (
            <div 
              key={log.id} 
              className={`flex items-start space-x-3 p-3 rounded-lg ${getActivityColor(log.type, log.status)}`}
            >
              <div className="w-2 h-2 rounded-full mt-2 flex items-center justify-center">
                {getActivityIcon(log.type, log.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {log.status === "completed" 
                    ? `${log.type === "scheduled" ? "Scheduled" : "Manual"} watering completed`
                    : log.status === "running"
                    ? `${log.type === "scheduled" ? "Scheduled" : "Manual"} watering in progress`
                    : `${log.type === "scheduled" ? "Scheduled" : "Manual"} watering stopped`
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {getMoistureChange(log)}
                  {log.duration && ` • Duration: ${formatDuration(log.duration)}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(log.startTime.toString())}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Droplet } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

interface ManualControlProps {
  isWatering: boolean;
  pumpStatus: string;
}

export default function ManualControl({ isWatering, pumpStatus }: ManualControlProps) {
  const { wateringProgress, startWatering, stopWatering } = useWebSocket();

  const handleToggleWatering = () => {
    if (isWatering) {
      stopWatering();
    } else {
      startWatering();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Watering</h2>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-medium text-gray-900">Water Pump</h3>
          <p className="text-sm text-gray-600">Click to start manual watering</p>
        </div>
        <button 
          onClick={handleToggleWatering}
          className={`relative inline-flex h-12 w-24 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            isWatering ? 'bg-primary hover:bg-primary/90' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <span className="sr-only">Toggle watering</span>
          <span 
            className={`pointer-events-none inline-block h-10 w-10 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              isWatering ? 'translate-x-12' : 'translate-x-0'
            }`}
          >
            <Droplet 
              size={16} 
              className={isWatering ? 'text-primary' : 'text-gray-400'} 
            />
          </span>
        </button>
      </div>

      {/* Watering Progress */}
      {wateringProgress?.isActive && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Watering in progress...</span>
            <span className="text-sm text-gray-600">
              Time: {formatTime(wateringProgress.timeElapsed)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-1000" 
              style={{ width: `${wateringProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Watering Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            isWatering ? 'bg-primary pulse-animation' : 'bg-gray-400'
          }`} />
          <span className={`text-sm ${
            isWatering ? 'text-primary font-medium' : 'text-gray-600'
          }`}>
            {isWatering ? 'Pump is running' : 'Pump is idle'}
          </span>
        </div>
      </div>
    </div>
  );
}

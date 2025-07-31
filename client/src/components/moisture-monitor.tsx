interface MoistureMonitorProps {
  moistureLevel: number;
}

export default function MoistureMonitor({ moistureLevel }: MoistureMonitorProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Soil Moisture Level</h2>
        <span className="text-2xl font-bold text-primary">{moistureLevel}%</span>
      </div>
      
      {/* Moisture Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Dry</span>
          <span>Perfect</span>
          <span>Wet</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
          <div className="bg-gradient-to-r from-red-400 via-yellow-400 via-primary to-blue-400 h-full rounded-full relative">
            <div 
              className="absolute inset-0 bg-white bg-opacity-60 rounded-full transition-all duration-1000" 
              style={{ 
                width: `${100 - moistureLevel}%`, 
                marginLeft: `${moistureLevel}%` 
              }}
            />
          </div>
          {/* Moisture Level Indicator */}
          <div 
            className="absolute top-0 h-full w-1 bg-gray-800 shadow-lg transition-all duration-1000" 
            style={{ 
              left: `${moistureLevel}%`, 
              transform: 'translateX(-50%)' 
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
              {moistureLevel}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

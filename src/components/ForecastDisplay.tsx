import { format, parseISO, addDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { 
  fetchTideData,
  type TideData, 
  type TidePrediction 
} from '../utils/tidesApi';

interface WeatherForecast {
  date: string;
  period: string;
  winds: string;
  seas: string;
  waveDetail?: string;
  thunderstorms?: string;
  visibility?: string;
}

interface ForecastDisplayProps {
  forecasts: WeatherForecast[];
  selectedZone: string;
  latitude: number;
  longitude: number;
  zoneCode: string;
}

export default function ForecastDisplay({ forecasts, selectedZone, latitude, longitude, zoneCode }: ForecastDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Zone Info Header */}
      <div className="border-b border-terminal-border pb-2 mb-4">
        <div className="text-terminal-accent">
          Marine Zone: <span className="text-terminal-text">{selectedZone}</span>
        </div>
        <div className="text-terminal-muted text-sm">
          Updated: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} EST
        </div>
      </div>

      {/* Test Basic Forecast Display */}
      <div className="space-y-4">
        {forecasts.length > 0 ? (
          forecasts.map((forecast, index) => (
            <div key={`${forecast.period}-${index}`} className="bg-terminal-bg-alt p-4 rounded-lg border border-terminal-fg/20">
              <h3 className="text-terminal-accent font-semibold text-lg mb-2">
                ▶ {forecast.period}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {forecast.winds && (
                  <div>
                    <span className="text-terminal-accent font-semibold">Winds: </span>
                    <span>{forecast.winds}</span>
                  </div>
                )}
                
                {forecast.seas && (
                  <div>
                    <span className="text-terminal-accent font-semibold">Seas: </span>
                    <span>{forecast.seas}</span>
                  </div>
                )}
                
                {forecast.waveDetail && (
                  <div>
                    <span className="text-terminal-accent font-semibold">Wave Detail: </span>
                    <span>{forecast.waveDetail}</span>
                  </div>
                )}
                
                {forecast.visibility && (
                  <div>
                    <span className="text-terminal-accent font-semibold">Visibility: </span>
                    <span>{forecast.visibility}</span>
                  </div>
                )}
                
                {forecast.thunderstorms && (
                  <div>
                    <span className="text-terminal-accent font-semibold">Thunderstorms: </span>
                    <span className="text-red-400 font-semibold">
                      ⛈️ {forecast.thunderstorms}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-terminal-muted">
            No forecast data available. Please select a marine zone.
          </div>
        )}
      </div>
    </div>
  );
}
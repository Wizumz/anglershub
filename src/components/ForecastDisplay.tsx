import { format } from 'date-fns';

interface WeatherForecast {
  date: string;
  period: string; // Morning/Evening/etc
  winds: string;
  seas: string;
  waveDetail?: string;
  thunderstorms?: string;
  visibility?: string;
  description: string;
}

interface ForecastDisplayProps {
  forecasts: WeatherForecast[];
  selectedZone: string;
}

export default function ForecastDisplay({ forecasts, selectedZone }: ForecastDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Zone Info Header */}
      <div className="border-b border-terminal-border pb-2 mb-4">
        <div className="text-terminal-accent">
          Marine Zone: <span className="text-terminal-text">{selectedZone}</span>
        </div>
        <div className="text-terminal-muted text-sm">
          Updated: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC
        </div>
      </div>

      {/* Forecast Periods */}
      <div className="space-y-4">
        {forecasts.map((forecast, index) => (
          <div key={index} className="border border-terminal-border rounded p-4 bg-terminal-bg">
            <h3 className="text-terminal-accent font-semibold mb-3 text-lg">
              <span className="text-terminal-success">▶</span> {forecast.period}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Weather Description */}
              <div className="space-y-2">
                <div className="text-terminal-warning font-semibold">Weather:</div>
                <div className="text-terminal-text">{forecast.description}</div>
              </div>

              {/* Marine Conditions */}
              <div className="space-y-3">
                <div>
                  <span className="text-terminal-accent font-semibold">Winds:</span>{' '}
                  <span className="text-terminal-text">{forecast.winds}</span>
                </div>
                
                <div>
                  <span className="text-terminal-accent font-semibold">Seas:</span>{' '}
                  <span className="text-terminal-text">{forecast.seas}</span>
                </div>
                
                {forecast.waveDetail && (
                  <div>
                    <span className="text-terminal-accent font-semibold">Wave Detail:</span>{' '}
                    <span className="text-terminal-text">{forecast.waveDetail}</span>
                  </div>
                )}
                
                {forecast.visibility && (
                  <div>
                    <span className="text-terminal-accent font-semibold">Visibility:</span>{' '}
                    <span className="text-terminal-text">{forecast.visibility}</span>
                  </div>
                )}
                
                {forecast.thunderstorms && (
                  <div>
                    <span className="text-terminal-warning font-semibold">Thunderstorms:</span>{' '}
                    <span className="text-terminal-warning">{forecast.thunderstorms}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
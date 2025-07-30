import { format } from 'date-fns';

interface WeatherForecast {
  date: string;
  period: string;
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
  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('sunny') || desc.includes('clear')) return '☀️';
    if (desc.includes('partly cloudy') || desc.includes('partly')) return '⛅';
    if (desc.includes('cloudy') || desc.includes('overcast')) return '☁️';
    if (desc.includes('rain') || desc.includes('showers')) return '🌧️';
    if (desc.includes('thunderstorm') || desc.includes('storm')) return '⛈️';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('wind')) return '💨';
    return '🌤️'; // default partly sunny
  };

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
          <div key={`${forecast.period}-${index}`} className="bg-terminal-bg-alt p-4 rounded-lg border border-terminal-fg/20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-terminal-accent font-semibold text-lg">
                ▶ {forecast.period}
              </h3>
            </div>
            
            {/* Inline Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {forecast.description && (
                <div>
                  <span className="text-terminal-accent font-semibold">Weather: </span>
                  <span className="inline-flex items-center gap-1">
                    {getWeatherIcon(forecast.description)} {forecast.description}
                  </span>
                </div>
              )}
              
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
                  <span className="text-red-400 font-semibold inline-flex items-center gap-1">
                    ⛈️ {forecast.thunderstorms}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Source Attribution */}
      <div className="mt-6 pt-4 border-t border-terminal-fg/20">
        <h4 className="text-terminal-accent font-medium mb-3">Marine Forecast Data Source</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-terminal-muted">
          <div className="space-y-1">
            <div><span className="text-terminal-accent font-semibold">Source:</span> NOAA National Weather Service</div>
            <div><span className="text-terminal-accent font-semibold">Zone:</span> {selectedZone}</div>
            <div><span className="text-terminal-accent font-semibold">Official URL:</span> <a 
              href={`https://forecast.weather.gov/shmrn.php?mz=${selectedZone.toLowerCase()}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-terminal-success hover:underline"
            >
              NOAA Marine Forecast
            </a></div>
          </div>
          <div className="space-y-1">
            <div><span className="text-terminal-accent font-semibold">Update Frequency:</span> Multiple times daily</div>
            <div><span className="text-terminal-accent font-semibold">Coverage:</span> US Coastal Waters</div>
            <div><span className="text-terminal-accent font-semibold">Authority:</span> National Weather Service</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-terminal-muted">
          <span className="text-terminal-warning">⚠️ Official Source:</span> This data is sourced directly from NOAA's National Weather Service marine forecasting system. 
          For the most current conditions and any watches/warnings, always check the official NOAA marine forecast link above.
        </div>
      </div>
    </div>
  );
}
import { format } from 'date-fns';

interface WeatherForecast {
  date: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  description: string;
  detailedForecast: string;
}

interface ForecastDisplayProps {
  forecasts: WeatherForecast[];
  selectedZone: string;
}

export default function ForecastDisplay({ forecasts, selectedZone }: ForecastDisplayProps) {
  const getWindDirectionArrow = (direction: string) => {
    const directions: { [key: string]: string } = {
      'N': '↑', 'NE': '↗', 'E': '→', 'SE': '↘',
      'S': '↓', 'SW': '↙', 'W': '←', 'NW': '↖',
      'VARIABLE': '○'
    };
    return directions[direction.toUpperCase()] || '○';
  };

  const getConditionIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return '☀';
    if (desc.includes('cloud')) return '☁';
    if (desc.includes('rain')) return '🌧';
    if (desc.includes('storm')) return '⛈';
    if (desc.includes('fog')) return '🌫';
    return '○';
  };

  // Group forecasts by day
  const forecastsByDay = forecasts.reduce((acc, forecast) => {
    const date = format(new Date(forecast.date), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(forecast);
    return acc;
  }, {} as Record<string, WeatherForecast[]>);

  return (
    <div className="space-y-4">
      {/* Zone Info Header */}
      <div className="border-b border-terminal-border pb-2 mb-4">
        <div className="text-terminal-accent">
          Marine Zone: <span className="text-terminal-fg">{selectedZone}</span>
        </div>
        <div className="text-terminal-muted text-sm">
          Updated: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC
        </div>
      </div>

      {/* Daily Forecasts */}
      {Object.entries(forecastsByDay).map(([date, dayForecasts]) => (
        <div key={date} className="border border-terminal-border rounded p-4 bg-terminal-bg">
          <h3 className="text-terminal-accent font-semibold mb-3">
            <span className="text-terminal-success">▶</span> {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayForecasts.map((forecast, index) => (
              <div key={index} className="border border-terminal-border rounded p-3 bg-terminal-bg-alt">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-terminal-accent font-semibold">
                    {format(new Date(forecast.date), 'HH:mm')}
                  </div>
                  <div className="text-lg">
                    {getConditionIcon(forecast.description)}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-terminal-muted">Temp:</span>{' '}
                      <span className="text-terminal-success">{Math.round(forecast.temperature)}°F</span>
                    </div>
                    <div>
                      <span className="text-terminal-muted">Waves:</span>{' '}
                      <span className="text-terminal-warning">{forecast.waveHeight.toFixed(1)}ft</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-terminal-muted">Wind:</span>{' '}
                      <span className="text-terminal-accent">{Math.round(forecast.windSpeed)} mph</span>
                    </div>
                    <div>
                      <span className="text-terminal-muted">Dir:</span>{' '}
                      <span className="text-terminal-fg">
                        {getWindDirectionArrow(forecast.windDirection)} {forecast.windDirection}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-terminal-border">
                    <div className="text-terminal-muted">Conditions:</div>
                    <div className="text-terminal-fg">{forecast.description}</div>
                  </div>
                  
                  {forecast.detailedForecast && (
                    <div className="pt-2 border-t border-terminal-border">
                      <div className="text-terminal-muted">Details:</div>
                      <div className="text-terminal-fg text-xs leading-relaxed">
                        {forecast.detailedForecast}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary Stats */}
      <div className="border border-terminal-border rounded p-4 bg-terminal-bg-alt">
        <h3 className="text-terminal-accent font-semibold mb-3">
          <span className="text-terminal-success">▶</span> FORECAST SUMMARY
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-terminal-muted">Avg Temp</div>
            <div className="text-terminal-success text-lg">
              {Math.round(forecasts.reduce((sum, f) => sum + f.temperature, 0) / forecasts.length)}°F
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-terminal-muted">Max Wind</div>
            <div className="text-terminal-accent text-lg">
              {Math.round(Math.max(...forecasts.map(f => f.windSpeed)))} mph
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-terminal-muted">Max Waves</div>
            <div className="text-terminal-warning text-lg">
              {Math.max(...forecasts.map(f => f.waveHeight)).toFixed(1)} ft
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-terminal-muted">Periods</div>
            <div className="text-terminal-fg text-lg">
              {forecasts.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
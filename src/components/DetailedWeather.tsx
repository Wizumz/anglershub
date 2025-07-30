import React, { useState, useEffect } from 'react';

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    pressure_msl: number;
    weather_code: number;
    is_day: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    pressure_msl: number[];
    weather_code: number[];
    is_day: number[];
  };
}

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

interface DetailedWeatherProps {
  latitude: number;
  longitude: number;
  selectedZone: string;
  forecasts: WeatherForecast[];
}

const getWeatherDescription = (code: number): string => {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return weatherCodes[code] || 'Unknown';
};

const getWeatherIcon = (code: number, isDay: boolean): string => {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 3) return isDay ? '⛅' : '🌙';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95 && code <= 99) return '⛈️';
  return isDay ? '🌤️' : '🌙';
};

const getPressureTrend = (currentPressure: number, previousPressure: number): string => {
  const diff = currentPressure - previousPressure;
  if (diff > 1.0) return 'Rising';
  if (diff < -1.0) return 'Falling';
  return 'Steady';
};

const DetailedWeather: React.FC<DetailedWeatherProps> = ({ latitude, longitude, selectedZone, forecasts }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get unique forecast dates from NOAA data
  const getForecastDates = () => {
    const dates = new Set<string>();
    forecasts.forEach(forecast => {
      const date = new Date(forecast.date).toISOString().split('T')[0];
      dates.add(date);
    });
    return Array.from(dates).sort();
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Request up to 7 days to cover all NOAA forecast periods
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,is_day&timezone=auto&forecast_days=7`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Weather API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
        <h2 className="text-terminal-accent mb-4 font-semibold">
          <span className="text-terminal-success">$</span> DETAILED WEATHER
        </h2>
        <div className="text-terminal-accent">
          <span className="animate-pulse">Loading weather data...</span>
          <span className="cursor animate-blink"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-terminal-error bg-terminal-bg-alt p-4 rounded">
        <h2 className="text-terminal-accent mb-4 font-semibold">
          <span className="text-terminal-success">$</span> DETAILED WEATHER
        </h2>
        <div className="text-terminal-error">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const formatTime = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get weather data for a specific date
  const getWeatherForDate = (dateStr: string) => {
    const dailyIndex = weatherData.daily.time.findIndex(date => date === dateStr);
    if (dailyIndex === -1) return null;

    // Get morning (9 AM) and afternoon (3 PM) hourly data for this date
    const morningIndex = weatherData.hourly.time.findIndex(time => {
      const hour = new Date(time).getHours();
      return hour === 9 && time.startsWith(dateStr);
    });
    
    const afternoonIndex = weatherData.hourly.time.findIndex(time => {
      const hour = new Date(time).getHours();
      return hour === 15 && time.startsWith(dateStr);
    });

    // Get pressure trend for today (current vs 3 hours ago)
    const today = new Date().toISOString().split('T')[0];
    const pressureTrend = (dateStr === today && weatherData.hourly.pressure_msl.length > 3) 
      ? getPressureTrend(
          weatherData.current.pressure_msl,
          weatherData.hourly.pressure_msl[Math.max(0, weatherData.hourly.pressure_msl.length - 4)]
        )
      : 'N/A';

    return {
      dailyIndex,
      morningIndex,
      afternoonIndex,
      pressureTrend,
      isToday: dateStr === today
    };
  };

  // Get NOAA forecast periods for a specific date
  const getNoaaPeriodsForDate = (dateStr: string) => {
    return forecasts.filter(forecast => {
      const forecastDate = new Date(forecast.date).toISOString().split('T')[0];
      return forecastDate === dateStr;
    });
  };

  const forecastDates = getForecastDates();

  return (
    <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
      <h2 className="text-terminal-accent mb-4 font-semibold">
        <span className="text-terminal-success">$</span> DETAILED WEATHER FORECAST
      </h2>
      
      <div className="space-y-6">
        {forecastDates.map((dateStr, index) => {
          const weatherInfo = getWeatherForDate(dateStr);
          const noaaPeriods = getNoaaPeriodsForDate(dateStr);
          
          if (!weatherInfo) return null;

          const { dailyIndex, morningIndex, afternoonIndex, pressureTrend, isToday } = weatherInfo;

          return (
            <div key={dateStr} className="border border-terminal-fg/20 rounded-lg p-4 bg-terminal-bg">
              {/* Date Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-terminal-accent font-semibold text-lg">
                  📅 {formatDate(dateStr)} {isToday && <span className="text-terminal-success">(Today)</span>}
                </h3>
                <div className="text-terminal-muted text-sm">
                  NOAA Periods: {noaaPeriods.map(p => p.period).join(', ')}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weather Conditions */}
                <div className="space-y-4">
                  <h4 className="text-terminal-accent font-medium border-b border-terminal-fg/20 pb-1">
                    Weather Conditions
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    {morningIndex >= 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-terminal-accent font-semibold w-20">Morning:</span>
                        <span className="text-xl">
                          {getWeatherIcon(weatherData.hourly.weather_code[morningIndex], weatherData.hourly.is_day[morningIndex] === 1)}
                        </span>
                        <span>{getWeatherDescription(weatherData.hourly.weather_code[morningIndex])}</span>
                      </div>
                    )}
                    
                    {afternoonIndex >= 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-terminal-accent font-semibold w-20">Afternoon:</span>
                        <span className="text-xl">
                          {getWeatherIcon(weatherData.hourly.weather_code[afternoonIndex], weatherData.hourly.is_day[afternoonIndex] === 1)}
                        </span>
                        <span>{getWeatherDescription(weatherData.hourly.weather_code[afternoonIndex])}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-terminal-accent font-semibold w-20">Overall:</span>
                      <span className="text-xl">
                        {getWeatherIcon(weatherData.daily.weather_code[dailyIndex], true)}
                      </span>
                      <span>{getWeatherDescription(weatherData.daily.weather_code[dailyIndex])}</span>
                    </div>
                  </div>
                </div>

                {/* Temperature & Environmental */}
                <div className="space-y-4">
                  <h4 className="text-terminal-accent font-medium border-b border-terminal-fg/20 pb-1">
                    Temperature & Environment
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-terminal-accent font-semibold">High: </span>
                      <span className="text-red-400">
                        {Math.round(weatherData.daily.temperature_2m_max[dailyIndex])}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-terminal-accent font-semibold">Low: </span>
                      <span className="text-blue-400">
                        {Math.round(weatherData.daily.temperature_2m_min[dailyIndex])}°C
                      </span>
                    </div>
                    
                    {isToday && (
                      <>
                        <div>
                          <span className="text-terminal-accent font-semibold">Humidity: </span>
                          <span>{weatherData.current.relative_humidity_2m}%</span>
                        </div>
                        <div>
                          <span className="text-terminal-accent font-semibold">Pressure: </span>
                          <span>{Math.round(weatherData.current.pressure_msl)} hPa</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-terminal-accent font-semibold">Pressure Trend: </span>
                          <span className={`${pressureTrend === 'Rising' ? 'text-green-400' : pressureTrend === 'Falling' ? 'text-red-400' : 'text-blue-400'}`}>
                            {pressureTrend}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Sun Times */}
                <div className="space-y-4">
                  <h4 className="text-terminal-accent font-medium border-b border-terminal-fg/20 pb-1">
                    Sun Times
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="text-terminal-accent font-semibold">Sunrise: </span>
                      <span className="text-yellow-400">
                        {formatTime(weatherData.daily.sunrise[dailyIndex])}
                      </span>
                    </div>
                    <div>
                      <span className="text-terminal-accent font-semibold">Sunset: </span>
                      <span className="text-orange-400">
                        {formatTime(weatherData.daily.sunset[dailyIndex])}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Source Attribution */}
      <div className="mt-6 pt-4 border-t border-terminal-fg/20">
        <h4 className="text-terminal-accent font-medium mb-3">Data Sources & Attribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-terminal-muted">
          <div className="space-y-2">
            <div>
              <span className="text-terminal-accent font-semibold">Marine Forecast Data:</span>
              <div>• Source: NOAA National Weather Service</div>
              <div>• Zone: {selectedZone}</div>
              <div>• URL: <a 
                href={`https://forecast.weather.gov/shmrn.php?mz=${selectedZone.toLowerCase()}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-terminal-success hover:underline"
              >
                NOAA Marine Forecast
              </a></div>
              <div>• Updated: Live from NOAA servers</div>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-terminal-accent font-semibold">Weather Data:</span>
              <div>• Source: Open-Meteo Weather API</div>
              <div>• Location: {latitude.toFixed(3)}°N, {Math.abs(longitude).toFixed(3)}°W</div>
              <div>• URL: <a 
                href="https://open-meteo.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-terminal-success hover:underline"
              >
                Open-Meteo.com
              </a></div>
              <div>• Model: ECMWF, GFS, ICON</div>
              <div>• Resolution: 0.25° (~25km)</div>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-terminal-muted">
          <span className="text-terminal-warning">⚠️ Note:</span> Weather data is provided for informational purposes. 
          Always consult official NOAA marine forecasts and local conditions before making maritime decisions.
        </div>
      </div>
    </div>
  );
};

export default DetailedWeather;
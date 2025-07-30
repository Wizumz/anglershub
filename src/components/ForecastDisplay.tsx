import { format, parseISO, addDays } from 'date-fns';
import { useState, useEffect } from 'react';

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

interface ForecastDisplayProps {
  forecasts: WeatherForecast[];
  selectedZone: string;
  latitude: number;
  longitude: number;
}

export default function ForecastDisplay({ forecasts, selectedZone, latitude, longitude }: ForecastDisplayProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!latitude || !longitude) return;
      
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,is_day&timezone=America/New_York&forecast_days=7&temperature_unit=fahrenheit`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]);

  // Convert Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius: number): number => {
    return Math.round((celsius * 9/5) + 32);
  };

  // Format time in EST
  const formatTimeEST = (dateTimeStr: string): string => {
    return new Date(dateTimeStr).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  };

  // Get weather description from code
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

  // Get weather icon from code
  const getWeatherIconFromCode = (code: number, isDay: boolean): string => {
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

  // Calculate forecast date based on period
  const calculateForecastDate = (period: string, baseDate: Date): string => {
    const periodLower = period.toLowerCase();
    let targetDate = new Date(baseDate);
    
    if (periodLower.includes('tonight')) {
      // Tonight is today
      return targetDate.toISOString().split('T')[0];
    } else if (periodLower.includes('monday') || periodLower.includes('mon')) {
      targetDate = getNextWeekday(baseDate, 1);
    } else if (periodLower.includes('tuesday') || periodLower.includes('tue')) {
      targetDate = getNextWeekday(baseDate, 2);
    } else if (periodLower.includes('wednesday') || periodLower.includes('wed')) {
      targetDate = getNextWeekday(baseDate, 3);
    } else if (periodLower.includes('thursday') || periodLower.includes('thu')) {
      targetDate = getNextWeekday(baseDate, 4);
    } else if (periodLower.includes('friday') || periodLower.includes('fri')) {
      targetDate = getNextWeekday(baseDate, 5);
    } else if (periodLower.includes('saturday') || periodLower.includes('sat')) {
      targetDate = getNextWeekday(baseDate, 6);
    } else if (periodLower.includes('sunday') || periodLower.includes('sun')) {
      targetDate = getNextWeekday(baseDate, 0);
    } else {
      // For periods like "This Afternoon", "Tomorrow", etc.
      if (periodLower.includes('tomorrow')) {
        targetDate = addDays(baseDate, 1);
      }
      // Add more logic as needed
    }
    
    return targetDate.toISOString().split('T')[0];
  };

  // Get next occurrence of a weekday (0 = Sunday, 1 = Monday, etc.)
  const getNextWeekday = (date: Date, targetDay: number): Date => {
    const currentDay = date.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Get next week's occurrence
    }
    return addDays(date, daysToAdd);
  };

  // Get weather for a specific date
  const getWeatherForDate = (dateStr: string) => {
    if (!weatherData) return null;
    
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

    return {
      dailyIndex,
      morningIndex,
      afternoonIndex,
      isToday: dateStr === new Date().toISOString().split('T')[0]
    };
  };

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

      {/* Forecast Periods */}
      <div className="space-y-4">
        {forecasts.map((forecast, index) => {
          const baseDate = new Date();
          const forecastDate = calculateForecastDate(forecast.period, baseDate);
          const weatherInfo = getWeatherForDate(forecastDate);
          
          return (
            <div key={`${forecast.period}-${index}`} className="bg-terminal-bg-alt p-4 rounded-lg border border-terminal-fg/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-terminal-accent font-semibold text-lg">
                  ▶ {forecast.period}
                </h3>
                <div className="text-terminal-muted text-sm">
                  {format(parseISO(forecastDate + 'T00:00:00'), 'MMM d, yyyy')}
                </div>
              </div>
              
              {/* Marine Forecast Details */}
              <div className="mb-4">
                <h4 className="text-terminal-accent font-medium mb-2 border-b border-terminal-fg/20 pb-1">
                  🌊 Marine Conditions
                </h4>
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

              {/* Detailed Weather Forecast for this Day */}
              {weatherInfo && weatherData && (
                <div>
                  <h4 className="text-terminal-accent font-medium mb-3 border-b border-terminal-fg/20 pb-1">
                    🌡️ Detailed Weather Forecast
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Weather Conditions */}
                    <div className="space-y-3">
                      <h5 className="text-terminal-accent text-sm font-medium">Conditions</h5>
                      <div className="space-y-2 text-sm">
                        {weatherInfo.morningIndex >= 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-terminal-accent font-semibold w-16">Morning:</span>
                            <span className="text-lg">
                              {getWeatherIconFromCode(weatherData.hourly.weather_code[weatherInfo.morningIndex], weatherData.hourly.is_day[weatherInfo.morningIndex] === 1)}
                            </span>
                            <span className="text-xs">
                              {getWeatherDescription(weatherData.hourly.weather_code[weatherInfo.morningIndex])}
                            </span>
                          </div>
                        )}
                        
                        {weatherInfo.afternoonIndex >= 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-terminal-accent font-semibold w-16">Afternoon:</span>
                            <span className="text-lg">
                              {getWeatherIconFromCode(weatherData.hourly.weather_code[weatherInfo.afternoonIndex], weatherData.hourly.is_day[weatherInfo.afternoonIndex] === 1)}
                            </span>
                            <span className="text-xs">
                              {getWeatherDescription(weatherData.hourly.weather_code[weatherInfo.afternoonIndex])}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-terminal-accent font-semibold w-16">Overall:</span>
                          <span className="text-lg">
                            {getWeatherIconFromCode(weatherData.daily.weather_code[weatherInfo.dailyIndex], true)}
                          </span>
                          <span className="text-xs">
                            {getWeatherDescription(weatherData.daily.weather_code[weatherInfo.dailyIndex])}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Temperature & Environment */}
                    <div className="space-y-3">
                      <h5 className="text-terminal-accent text-sm font-medium">Temperature</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-terminal-accent font-semibold">High:</span>
                          <span className="text-red-400 font-semibold">
                            {Math.round(weatherData.daily.temperature_2m_max[weatherInfo.dailyIndex])}°F
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-terminal-accent font-semibold">Low:</span>
                          <span className="text-blue-400 font-semibold">
                            {Math.round(weatherData.daily.temperature_2m_min[weatherInfo.dailyIndex])}°F
                          </span>
                        </div>
                        
                        {weatherInfo.isToday && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-terminal-accent font-semibold">Humidity:</span>
                              <span>{weatherData.current.relative_humidity_2m}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-terminal-accent font-semibold">Pressure:</span>
                              <span>{Math.round(weatherData.current.pressure_msl)} hPa</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Sun Times */}
                    <div className="space-y-3">
                      <h5 className="text-terminal-accent text-sm font-medium">Sun Times (EST)</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-terminal-accent font-semibold">Sunrise:</span>
                          <span className="text-yellow-400">
                            {formatTimeEST(weatherData.daily.sunrise[weatherInfo.dailyIndex])}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-terminal-accent font-semibold">Sunset:</span>
                          <span className="text-orange-400">
                            {formatTimeEST(weatherData.daily.sunset[weatherInfo.dailyIndex])}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading state for weather data */}
              {loading && (
                <div className="mt-4 text-terminal-accent text-sm">
                  <span className="animate-pulse">Loading detailed weather...</span>
                </div>
              )}
            </div>
          );
        })}
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
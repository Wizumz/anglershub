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

interface DetailedWeatherProps {
  latitude: number;
  longitude: number;
  selectedZone: string;
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

const DetailedWeather: React.FC<DetailedWeatherProps> = ({ latitude, longitude, selectedZone }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,is_day&timezone=auto&forecast_days=3`;
        
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

  // Get today's data
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayIndex = weatherData.daily.time.findIndex(date => date === todayStr);
  
  // Get morning and afternoon conditions
  const currentHour = today.getHours();
  const morningHour = 9; // 9 AM
  const afternoonHour = 15; // 3 PM
  
  const morningIndex = weatherData.hourly.time.findIndex(time => {
    const hour = new Date(time).getHours();
    return hour === morningHour && time.startsWith(todayStr);
  });
  
  const afternoonIndex = weatherData.hourly.time.findIndex(time => {
    const hour = new Date(time).getHours();
    return hour === afternoonHour && time.startsWith(todayStr);
  });

  // Get pressure trend (compare current with 3 hours ago)
  const pressureTrend = weatherData.hourly.pressure_msl.length > 3 
    ? getPressureTrend(
        weatherData.current.pressure_msl,
        weatherData.hourly.pressure_msl[Math.max(0, weatherData.hourly.pressure_msl.length - 4)]
      )
    : 'Steady';

  const formatTime = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
      <h2 className="text-terminal-accent mb-4 font-semibold">
        <span className="text-terminal-success">$</span> DETAILED WEATHER
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Conditions */}
        <div className="space-y-4">
          <h3 className="text-terminal-accent font-medium border-b border-terminal-fg/20 pb-1">Current Conditions</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-terminal-accent font-semibold">Temperature: </span>
              <span>{Math.round(weatherData.current.temperature_2m)}°C</span>
            </div>
            <div>
              <span className="text-terminal-accent font-semibold">Humidity: </span>
              <span>{weatherData.current.relative_humidity_2m}%</span>
            </div>
            <div>
              <span className="text-terminal-accent font-semibold">Pressure: </span>
              <span>{Math.round(weatherData.current.pressure_msl)} hPa</span>
            </div>
            <div>
              <span className="text-terminal-accent font-semibold">Trend: </span>
              <span className={`${pressureTrend === 'Rising' ? 'text-green-400' : pressureTrend === 'Falling' ? 'text-red-400' : 'text-blue-400'}`}>
                {pressureTrend}
              </span>
            </div>
          </div>
        </div>

        {/* Morning/Afternoon Forecast */}
        <div className="space-y-4">
          <h3 className="text-terminal-accent font-medium border-b border-terminal-fg/20 pb-1">Today's Forecast</h3>
          
          <div className="space-y-3">
            {morningIndex >= 0 && (
              <div className="flex items-center gap-3">
                <span className="text-terminal-accent font-semibold w-20">Morning:</span>
                <span className="text-xl">
                  {getWeatherIcon(weatherData.hourly.weather_code[morningIndex], weatherData.hourly.is_day[morningIndex] === 1)}
                </span>
                <span>{getWeatherDescription(weatherData.hourly.weather_code[morningIndex])}</span>
                <span className="text-terminal-muted">
                  {Math.round(weatherData.hourly.temperature_2m[morningIndex])}°C
                </span>
              </div>
            )}
            
            {afternoonIndex >= 0 && (
              <div className="flex items-center gap-3">
                <span className="text-terminal-accent font-semibold w-20">Afternoon:</span>
                <span className="text-xl">
                  {getWeatherIcon(weatherData.hourly.weather_code[afternoonIndex], weatherData.hourly.is_day[afternoonIndex] === 1)}
                </span>
                <span>{getWeatherDescription(weatherData.hourly.weather_code[afternoonIndex])}</span>
                <span className="text-terminal-muted">
                  {Math.round(weatherData.hourly.temperature_2m[afternoonIndex])}°C
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Temperature Range */}
        <div className="space-y-4">
          <h3 className="text-terminal-accent font-medium border-b border-terminal-fg/20 pb-1">Temperature</h3>
          
          {todayIndex >= 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-terminal-accent font-semibold">High: </span>
                <span className="text-red-400">
                  {Math.round(weatherData.daily.temperature_2m_max[todayIndex])}°C
                </span>
              </div>
              <div>
                <span className="text-terminal-accent font-semibold">Low: </span>
                <span className="text-blue-400">
                  {Math.round(weatherData.daily.temperature_2m_min[todayIndex])}°C
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sun Times */}
        <div className="space-y-4">
          <h3 className="text-terminal-accent font-medium border-b border-terminal-fg/20 pb-1">Sun Times</h3>
          
          {todayIndex >= 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-terminal-accent font-semibold">Sunrise: </span>
                <span className="text-yellow-400">
                  {formatTime(weatherData.daily.sunrise[todayIndex])}
                </span>
              </div>
              <div>
                <span className="text-terminal-accent font-semibold">Sunset: </span>
                <span className="text-orange-400">
                  {formatTime(weatherData.daily.sunset[todayIndex])}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-terminal-muted border-t border-terminal-fg/20 pt-2">
        Weather data from Open-Meteo • Zone: {selectedZone}
      </div>
    </div>
  );
};

export default DetailedWeather;
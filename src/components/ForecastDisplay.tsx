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
  description: string;
  summary?: {
    type: string;
    icon: string;
    text: string;
    color: string;
    bold: boolean;
  };
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
    moonrise: string[];
    moonset: string[];
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
  zoneCode: string;
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

export default function ForecastDisplay({ forecasts, selectedZone, latitude, longitude, zoneCode }: ForecastDisplayProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tideLoading, setTideLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [tideError, setTideError] = useState<string>('');

  // Fetch detailed weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!latitude || !longitude) return;
      
      setLoading(true);
      setError('');
      
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,moonrise,moonset&hourly=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,is_day&timezone=America/New_York&forecast_days=7&temperature_unit=fahrenheit`;
        
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

    fetchWeatherData();
  }, [latitude, longitude]);

  // Fetch tide data
  useEffect(() => {
    const fetchTidesData = async () => {
      if (!selectedZone || !latitude || !longitude) return;
      
      setTideLoading(true);
      setTideError('');
      
      try {
        const tides = await fetchTideData(selectedZone, latitude, longitude);
        setTideData(tides);
      } catch (err) {
        console.error('Error fetching tide data:', err);
        setTideError(err instanceof Error ? err.message : 'Failed to fetch tide data');
      } finally {
        setTideLoading(false);
      }
    };

    fetchTidesData();
  }, [selectedZone, latitude, longitude]);

  const formatTime = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  };

  const formatTideTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  };

  // Get weather data for a specific forecast period
  const getWeatherForPeriod = (forecast: WeatherForecast) => {
    if (!weatherData) return null;
    
    const forecastDate = new Date(forecast.date).toISOString().split('T')[0];
    const dailyIndex = weatherData.daily.time.findIndex(date => date === forecastDate);
    
    if (dailyIndex === -1) return null;

    return {
      dailyIndex,
      sunrise: weatherData.daily.sunrise[dailyIndex],
      sunset: weatherData.daily.sunset[dailyIndex],
      moonrise: weatherData.daily.moonrise[dailyIndex],
      moonset: weatherData.daily.moonset[dailyIndex],
      tempHigh: Math.round(weatherData.daily.temperature_2m_max[dailyIndex]),
      tempLow: Math.round(weatherData.daily.temperature_2m_min[dailyIndex]),
      weatherCode: weatherData.daily.weather_code[dailyIndex],
             isToday: forecastDate === new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
    };
  };

  // Get tides for a specific forecast period (same day)
  const getTidesForPeriod = (forecast: WeatherForecast) => {
    if (!tideData || !tideData.predictions) return [];
    
    const forecastDate = new Date(forecast.date).toISOString().split('T')[0];
    return tideData.predictions.filter(tide => {
      const tideDate = new Date(tide.time).toISOString().split('T')[0];
      return tideDate === forecastDate;
    }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
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

      {/* Individual Forecast Period Tiles */}
      <div className="space-y-4">
        {forecasts.length > 0 ? (
          forecasts.map((forecast, index) => {
            const weatherInfo = getWeatherForPeriod(forecast);
            const tidesForPeriod = getTidesForPeriod(forecast);

            return (
              <div key={`${forecast.period}-${index}`} className="bg-terminal-bg-alt p-4 rounded-lg border border-terminal-fg/20">
                <h3 className="text-terminal-accent font-semibold text-lg mb-4">
                  ▶ {forecast.period}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Marine Conditions (NOAA Data) */}
                  <div className="lg:col-span-2">
                    <h4 className="text-terminal-accent font-medium mb-3 border-b border-terminal-fg/20 pb-1">
                      Marine Conditions
                    </h4>
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
                        <div className="col-span-2">
                          <span className="text-terminal-accent font-semibold">Thunderstorms: </span>
                          <span className="text-red-400 font-semibold">
                            ⛈️ {forecast.thunderstorms}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weather Conditions */}
                  <div>
                    <h4 className="text-terminal-accent font-medium mb-3 border-b border-terminal-fg/20 pb-1">
                      Weather
                    </h4>
                    <div className="space-y-2 text-sm">
                      {weatherInfo ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {getWeatherIcon(weatherInfo.weatherCode, true)}
                            </span>
                            <span>{getWeatherDescription(weatherInfo.weatherCode)}</span>
                          </div>
                          <div>
                            <span className="text-terminal-accent font-semibold">High: </span>
                            <span className="text-red-400">{weatherInfo.tempHigh}°F</span>
                          </div>
                          <div>
                            <span className="text-terminal-accent font-semibold">Low: </span>
                            <span className="text-blue-400">{weatherInfo.tempLow}°F</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-terminal-muted text-sm">
                          {loading ? 'Loading...' : 'Weather data not available'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Combined Tide & Solunar */}
                  <div>
                    <h4 className="text-terminal-accent font-medium mb-3 border-b border-terminal-fg/20 pb-1">
                      Tides & Solunar
                    </h4>
                    <div className="space-y-2 text-sm">
                      {/* Tides */}
                      {tideLoading ? (
                        <div className="text-terminal-muted">Loading tides...</div>
                      ) : tidesForPeriod.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-terminal-accent font-semibold text-xs">Tides:</div>
                          {tidesForPeriod.slice(0, 4).map((tide, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className={`${tide.type === 'H' ? 'text-blue-400' : 'text-green-400'}`}>
                                {tide.type === 'H' ? '🌊 High' : '🏖️ Low'} {formatTideTime(tide.time)}
                              </span>
                              <span>{tide.value.toFixed(1)}ft</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-terminal-muted">No tide data</div>
                      )}

                      {/* Solunar */}
                      {weatherInfo ? (
                        <div className="space-y-1 mt-3">
                          <div className="text-terminal-accent font-semibold text-xs">Solunar:</div>
                          <div className="flex justify-between">
                            <span className="text-yellow-400">☀️ Rise</span>
                            <span>{formatTime(weatherInfo.sunrise)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-400">☀️ Set</span>
                            <span>{formatTime(weatherInfo.sunset)}</span>
                          </div>
                          {weatherInfo.moonrise && (
                            <div className="flex justify-between">
                              <span className="text-blue-300">🌙 Rise</span>
                              <span>{formatTime(weatherInfo.moonrise)}</span>
                            </div>
                          )}
                          {weatherInfo.moonset && (
                            <div className="flex justify-between">
                              <span className="text-purple-300">🌙 Set</span>
                              <span>{formatTime(weatherInfo.moonset)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-terminal-muted">No solunar data</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-terminal-muted">
            No forecast data available. Please select a marine zone.
          </div>
        )}
      </div>

      {/* Source Attribution */}
      <div className="mt-6 pt-4 border-t border-terminal-fg/20">
        <h4 className="text-terminal-accent font-medium mb-3">Data Sources & Attribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-terminal-muted">
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
          <div className="space-y-2">
            <div>
              <span className="text-terminal-accent font-semibold">Tide & Solunar Data:</span>
              {tideData && tideData.stationName ? (
                <>
                  <div>• Source: NOAA Tides & Currents</div>
                  <div>• Station: {tideData.stationName}</div>
                  <div>• ID: {tideData.stationId}</div>
                </>
              ) : (
                <>
                  <div>• Source: Open-Meteo Marine API</div>
                  <div>• Model: Global Ocean Tidal Models</div>
                </>
              )}
              <div>• Solunar: Open-Meteo Astronomy API</div>
              <div>• Timezone: America/New_York</div>
              <div>• Updated: Real-time predictions</div>
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
}
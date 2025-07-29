'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import WeatherChart from '@/components/WeatherChart';
import LocationSelector from '@/components/LocationSelector';
import DateSelector from '@/components/DateSelector';
import ForecastDisplay from '@/components/ForecastDisplay';

interface WeatherForecast {
  date: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  swellHeight: number;
  description: string;
  detailedForecast: string;
  marineForecast?: string; // Additional NOAA marine commentary
}

interface MarineZone {
  zone_code: string;
  location_name: string;
  synopsis_zone: string;
}

// Static marine zones data for GitHub Pages deployment
const MARINE_ZONES: MarineZone[] = [
  {
    zone_code: 'ANZ335',
    location_name: 'Boston Harbor and Massachusetts Bay',
    synopsis_zone: 'ANZ300'
  },
  {
    zone_code: 'ANZ338',
    location_name: 'Cape Cod Bay',
    synopsis_zone: 'ANZ300'
  },
  {
    zone_code: 'ANZ230',
    location_name: 'Long Island Sound',
    synopsis_zone: 'ANZ200'
  },
  {
    zone_code: 'AMZ350',
    location_name: 'Delaware Bay',
    synopsis_zone: 'AMZ300'
  },
  {
    zone_code: 'AMZ354',
    location_name: 'Chesapeake Bay',
    synopsis_zone: 'AMZ300'
  },
  {
    zone_code: 'GMZ876',
    location_name: 'Tampa Bay',
    synopsis_zone: 'GMZ800'
  },
  {
    zone_code: 'PMZ153',
    location_name: 'San Francisco Bay',
    synopsis_zone: 'PMZ100'
  },
  {
    zone_code: 'PMZ156',
    location_name: 'Monterey Bay',
    synopsis_zone: 'PMZ100'
  }
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [zones] = useState<MarineZone[]>(MARINE_ZONES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Set initial zone
  useEffect(() => {
    if (zones.length > 0) {
      setSelectedZone(zones[0].zone_code);
    }
  }, [zones]);

  const generateSampleForecast = useCallback((zoneCode: string, startDate?: string | null): WeatherForecast[] => {
    const baseDate = startDate ? new Date(startDate) : new Date();
    const forecasts: WeatherForecast[] = [];
    
    // Generate forecasts for 3 days (including selected date) every 4 hours
    // 3 days * 6 periods per day (every 4 hours) = 18 data points
    for (let i = 0; i < 18; i++) {
      const date = new Date(baseDate);
      const dayOffset = Math.floor(i / 6); // 6 periods per day
      const hourOffset = (i % 6) * 4; // Every 4 hours: 0, 4, 8, 12, 16, 20
      
      date.setDate(date.getDate() + dayOffset);
      date.setHours(hourOffset, 0, 0, 0);
      
      const period = hourOffset < 12 ? 'Morning' : 'Evening';
      const marineForecastOptions = [
        'Small craft advisory in effect',
        'Seas moderate with occasional higher swells',
        'Favorable conditions for boating',
        'Low pressure system approaching from the west',
        'High pressure ridge building',
        'Wind waves 2 to 4 feet with southerly swells'
      ];
      
      forecasts.push({
        date: date.toISOString(),
        temperature: 65 + Math.random() * 20,
        windSpeed: 8 + Math.random() * 15,
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        waveHeight: 1 + Math.random() * 4,
        swellHeight: 1 + Math.random() * 3,
        description: ['Partly Cloudy', 'Clear', 'Overcast', 'Light Rain'][Math.floor(Math.random() * 4)],
        detailedForecast: `${period} forecast with moderate seas.`,
        marineForecast: marineForecastOptions[Math.floor(Math.random() * marineForecastOptions.length)]
      });
    }
    
    return forecasts;
  }, []);

  const fetchForecast = useCallback(async () => {
    if (!selectedZone) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Try to fetch from NOAA API directly (this may fail due to CORS in browser)
      const noaaUrl = `https://api.weather.gov/zones/forecast/${selectedZone}/forecast`;
      
      const response = await fetch(noaaUrl, {
        headers: {
          'User-Agent': '(NOAA Marine Weather App, contact@example.com)'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Parse the forecast data
        const noaaForecasts: WeatherForecast[] = [];
        const periods = data.properties?.periods || [];

        for (let i = 0; i < Math.min(periods.length, 18); i++) {
          const period = periods[i];
          noaaForecasts.push({
            date: period.startTime,
            temperature: period.temperature || 70,
            windSpeed: extractWindSpeed(period.detailedForecast || ''),
            windDirection: extractWindDirection(period.detailedForecast || ''),
            waveHeight: extractWaveHeight(period.detailedForecast || ''),
            swellHeight: extractSwellHeight(period.detailedForecast || ''),
            description: period.shortForecast || '',
            detailedForecast: period.detailedForecast || '',
            marineForecast: extractMarineForecast(period.detailedForecast || '')
          });
        }

        setForecasts(noaaForecasts);
      } else {
        throw new Error('NOAA API not available');
      }
    } catch (error) {
      console.log('Using sample data due to CORS or API unavailability');
      
      // Use sample data for GitHub Pages deployment
      const sampleForecasts = generateSampleForecast(selectedZone, selectedDate);
      setForecasts(sampleForecasts);
      setError('Demo mode: Using sample data (NOAA API requires CORS proxy for browser access)');
    } finally {
      setLoading(false);
    }
  }, [selectedZone, selectedDate, generateSampleForecast]);

  // Helper functions for parsing NOAA data
  const extractWindSpeed = (text: string): number => {
    const windMatch = text.match(/winds?\s+(\d+)(?:-(\d+))?\s*(?:to\s*(\d+))?\s*(?:mph|knots|kts)/i);
    if (windMatch) {
      const speed1 = parseInt(windMatch[1]);
      const speed2 = windMatch[2] ? parseInt(windMatch[2]) : speed1;
      return Math.round((speed1 + speed2) / 2);
    }
    return 10; // default
  };

  const extractWindDirection = (text: string): string => {
    const dirMatch = text.match(/(north|south|east|west|northeast|northwest|southeast|southwest|variable)/i);
    return dirMatch ? dirMatch[1].toUpperCase() : 'VARIABLE';
  };

  const extractWaveHeight = (text: string): number => {
    const waveMatch = text.match(/waves?\s+(\d+)(?:-(\d+))?\s*(?:to\s*(\d+))?\s*(?:feet|ft)/i);
    if (waveMatch) {
      const height1 = parseInt(waveMatch[1]);
      const height2 = waveMatch[2] ? parseInt(waveMatch[2]) : height1;
      return Math.round((height1 + height2) / 2);
    }
    return 2; // default
  };

  const extractSwellHeight = (text: string): number => {
    const swellMatch = text.match(/swells?\s+(\d+)(?:-(\d+))?\s*(?:to\s*(\d+))?\s*(?:feet|ft)/i);
    if (swellMatch) {
      const height1 = parseInt(swellMatch[1]);
      const height2 = swellMatch[2] ? parseInt(swellMatch[2]) : height1;
      return Math.round((height1 + height2) / 2);
    }
    return 1; // default
  };

  const extractMarineForecast = (text: string): string | undefined => {
    const marineMatch = text.match(/marine forecast:\s*(.*)/i);
    return marineMatch ? marineMatch[1].trim() : undefined;
  };

  // Fetch forecast when zone or date changes
  useEffect(() => {
    if (selectedZone) {
      fetchForecast();
    }
  }, [selectedZone, fetchForecast]);

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-fg font-mono p-4">
      {/* Terminal Header */}
      <header className="border-b border-terminal-border pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-terminal-accent glitch" data-text="NOAA MARINE WEATHER">
            NOAA MARINE WEATHER
          </h1>
          <div className="text-terminal-muted text-sm">
            {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC
          </div>
        </div>
        <div className="mt-2 text-terminal-muted">
          <span className="text-terminal-success">{'>'}</span> Real-time marine forecasts and conditions
        </div>
      </header>

      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
          <h2 className="text-terminal-accent mb-3 font-semibold">
            <span className="text-terminal-success">$</span> SELECT LOCATION
          </h2>
          <LocationSelector
            zones={zones}
            selectedZone={selectedZone}
            onZoneChange={setSelectedZone}
          />
        </div>

        <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
          <h2 className="text-terminal-accent mb-3 font-semibold">
            <span className="text-terminal-success">$</span> SELECT DATE
          </h2>
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border border-terminal-error bg-terminal-bg-alt p-4 rounded mb-6">
          <div className="text-terminal-warning">
            <span className="font-bold">INFO:</span> {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded mb-6">
          <div className="text-terminal-accent">
            <span className="animate-pulse">Loading forecast data...</span>
            <span className="cursor animate-blink"></span>
          </div>
        </div>
      )}

      {/* Forecast Display */}
      {forecasts.length > 0 && !loading && (
        <div className="space-y-6">
          {/* Forecast Summary */}
          <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
            <h2 className="text-terminal-accent mb-4 font-semibold">
              <span className="text-terminal-success">$</span> FORECAST SUMMARY
            </h2>
            <ForecastDisplay forecasts={forecasts} selectedZone={selectedZone} />
          </div>

          {/* Chart Section */}
          <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
            <h2 className="text-terminal-accent mb-4 font-semibold">
              <span className="text-terminal-success">$</span> FORECAST VISUALIZATION
            </h2>
            <WeatherChart forecasts={forecasts} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-terminal-border text-terminal-muted text-center">
        <div>Data source: National Weather Service / NOAA</div>
        <div className="mt-1">
          <span className="text-terminal-success">{'>'}</span> Terminal interface v1.0 - GitHub Pages Demo
        </div>
      </footer>
    </div>
  );
}

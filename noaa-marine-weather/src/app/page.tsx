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
  description: string;
  detailedForecast: string;
}

interface MarineZone {
  zone_code: string;
  location_name: string;
  synopsis_zone: string;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [zones, setZones] = useState<MarineZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch marine zones on component mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch('/api/marine-zones');
        const data = await response.json();
        if (data.success) {
          setZones(data.zones);
          if (data.zones.length > 0) {
            setSelectedZone(data.zones[0].zone_code);
          }
        }
      } catch (err) {
        console.error('Failed to fetch zones:', err);
        setError('Failed to load marine zones');
      }
    };
    fetchZones();
  }, []);

  const fetchForecast = useCallback(async () => {
    if (!selectedZone) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/forecast?zone=${selectedZone}&date=${selectedDate}`);
      const data = await response.json();
      
      if (data.success) {
        setForecasts(data.forecasts);
      } else {
        setError(data.error || 'Failed to fetch forecast');
      }
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
      setError('Failed to load weather forecast');
    } finally {
      setLoading(false);
    }
  }, [selectedZone, selectedDate]);

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
          <div className="text-terminal-error">
            <span className="font-bold">ERROR:</span> {error}
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
          {/* Chart Section */}
          <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
            <h2 className="text-terminal-accent mb-4 font-semibold">
              <span className="text-terminal-success">$</span> FORECAST VISUALIZATION
            </h2>
            <WeatherChart forecasts={forecasts} />
          </div>

          {/* Detailed Forecast */}
          <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
            <h2 className="text-terminal-accent mb-4 font-semibold">
              <span className="text-terminal-success">$</span> DETAILED FORECAST
            </h2>
            <ForecastDisplay forecasts={forecasts} selectedZone={selectedZone} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-terminal-border text-terminal-muted text-center">
        <div>Data source: National Weather Service / NOAA</div>
        <div className="mt-1">
          <span className="text-terminal-success">{'>'}</span> Terminal interface v1.0
        </div>
      </footer>
    </div>
  );
}

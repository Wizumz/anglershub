'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { 
  fetchTideData, 
  calculateTidalCoefficient, 
  getTidalCoefficientDescription,
  type TideData, 
  type TidePrediction 
} from '../utils/tidesApi';

interface TidesDisplayProps {
  zoneCode: string;
  zoneName: string;
}

export default function TidesDisplay({ zoneCode, zoneName }: TidesDisplayProps) {
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!zoneCode) return;

    setLoading(true);
    setError(null);

    fetchTideData(zoneCode)
      .then((data) => {
        setTideData(data);
      })
      .catch((err) => {
        setError('Unable to load tide data');
        console.error('Tide data error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [zoneCode]);

  const formatTideTime = (timeStr: string): string => {
    try {
      const date = parseISO(timeStr);
      return format(date, 'h:mm a');
    } catch {
      return timeStr;
    }
  };

  const formatTideDate = (timeStr: string): string => {
    try {
      const date = parseISO(timeStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM d');
    } catch {
      return '';
    }
  };

  const groupTidesByDate = (predictions: TidePrediction[]) => {
    const grouped = predictions.reduce((acc, tide) => {
      const date = format(parseISO(tide.time), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(tide);
      return acc;
    }, {} as Record<string, TidePrediction[]>);

    return Object.entries(grouped).slice(0, 3); // Show next 3 days
  };

  const getTideIcon = (type: 'H' | 'L'): string => {
    return type === 'H' ? '🌊' : '🏖️';
  };

  const getTideLabel = (type: 'H' | 'L'): string => {
    return type === 'H' ? 'High' : 'Low';
  };

  const getTidalCoefficientColor = (coefficient: number): string => {
    if (coefficient >= 95) return 'text-red-400';
    if (coefficient >= 80) return 'text-orange-400';
    if (coefficient >= 65) return 'text-yellow-400';
    if (coefficient >= 45) return 'text-blue-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="bg-terminal-bg-alt border border-terminal-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">🌊</div>
          <h3 className="text-terminal-accent font-semibold">Tide Information</h3>
        </div>
        <div className="text-terminal-muted text-sm">Loading tide data...</div>
      </div>
    );
  }

  if (error || !tideData) {
    return (
      <div className="bg-terminal-bg-alt border border-terminal-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">🌊</div>
          <h3 className="text-terminal-accent font-semibold">Tide Information</h3>
        </div>
        <div className="text-terminal-muted text-sm">
          {error || 'No tide data available for this zone'}
        </div>
      </div>
    );
  }

  const tidalCoefficient = calculateTidalCoefficient(tideData.predictions);
  const coefficientDescription = getTidalCoefficientDescription(tidalCoefficient);
  const groupedTides = groupTidesByDate(tideData.predictions);

  return (
    <div className="bg-terminal-bg-alt border border-terminal-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-lg">🌊</div>
          <h3 className="text-terminal-accent font-semibold">Tide Information</h3>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${getTidalCoefficientColor(tidalCoefficient)}`}>
            {tidalCoefficient}
          </div>
          <div className="text-xs text-terminal-muted">
            {coefficientDescription}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groupedTides.map(([date, tides]) => (
          <div key={date} className="border-b border-terminal-fg/10 last:border-b-0 pb-3 last:pb-0">
            <div className="text-sm font-semibold text-terminal-accent mb-2">
              {formatTideDate(tides[0].time)}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {tides.map((tide, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getTideIcon(tide.type)}</span>
                    <div>
                      <div className="text-sm font-medium text-terminal-fg">
                        {getTideLabel(tide.type)} Tide
                      </div>
                      <div className="text-xs text-terminal-muted">
                        {formatTideTime(tide.time)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-terminal-success">
                      {tide.value.toFixed(1)}ft
                    </div>
                    <div className="text-xs text-terminal-muted">
                      MLLW
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-terminal-fg/10">
        <div className="text-xs text-terminal-muted">
          <div className="mb-1">
            <strong>Station:</strong> {tideData.stationName}
          </div>
          <div className="mb-1">
            <strong>Datum:</strong> {tideData.datum} (Mean Lower Low Water)
          </div>
          <div className="mb-1">
            <strong>Tidal Coefficient:</strong> Indicates tide strength (20-120 scale)
          </div>
          <div>
            <strong>Source:</strong> {tideData.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
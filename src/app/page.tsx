'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import LocationSelector from '../components/LocationSelector';
import ForecastDisplay from '../components/ForecastDisplay';

interface WeatherForecast {
  date: string;
  period: string; // Morning/Evening/etc
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

interface MarineZone {
  zone_code: string;
  location_name: string;
  synopsis_zone: string;
}

// Corrected marine zones data from NOAA
const MARINE_ZONES: MarineZone[] = [
  // New England / Boston Area
  {
    zone_code: 'ANZ230',
    location_name: 'Boston Harbor',
    synopsis_zone: 'ANZ200'
  },
  {
    zone_code: 'ANZ231',
    location_name: 'Cape Cod Bay',
    synopsis_zone: 'ANZ200'
  },
  {
    zone_code: 'ANZ233',
    location_name: 'Nantucket Sound',
    synopsis_zone: 'ANZ200'
  },
  {
    zone_code: 'ANZ251',
    location_name: 'Massachusetts Bay and Ipswich Bay',
    synopsis_zone: 'ANZ200'
  },
  // Long Island Sound / New York Area
  {
    zone_code: 'ANZ330',
    location_name: 'Long Island Sound East of New Haven CT/Port Jefferson NY',
    synopsis_zone: 'ANZ300'
  },
  {
    zone_code: 'ANZ335',
    location_name: 'Long Island Sound West of New Haven CT/Port Jefferson NY',
    synopsis_zone: 'ANZ300'
  },
  {
    zone_code: 'ANZ338',
    location_name: 'New York Harbor',
    synopsis_zone: 'ANZ300'
  },
  {
    zone_code: 'ANZ340',
    location_name: 'Peconic and Gardiners Bays',
    synopsis_zone: 'ANZ300'
  },
  // New Jersey / Delaware Area
  {
    zone_code: 'ANZ430',
    location_name: 'Delaware Bay waters north of East Point NJ to Slaughter Beach DE',
    synopsis_zone: 'ANZ400'
  },
  {
    zone_code: 'ANZ450',
    location_name: 'Coastal waters from Sandy Hook to Manasquan Inlet NJ out 20 nm',
    synopsis_zone: 'ANZ400'
  },
  // Chesapeake Bay / Virginia Area
  {
    zone_code: 'ANZ630',
    location_name: 'Chesapeake Bay from Smith Point to Windmill Point VA',
    synopsis_zone: 'ANZ600'
  },
  {
    zone_code: 'ANZ632',
    location_name: 'Chesapeake Bay from New Point Comfort to Little Creek VA',
    synopsis_zone: 'ANZ600'
  },
  // North Carolina Area
  {
    zone_code: 'ANZ130',
    location_name: 'Albemarle Sound',
    synopsis_zone: 'ANZ100'
  },
  {
    zone_code: 'ANZ135',
    location_name: 'Pamlico Sound',
    synopsis_zone: 'ANZ100'
  },
  // South Carolina / Georgia Area
  {
    zone_code: 'AMZ330',
    location_name: 'Charleston Harbor',
    synopsis_zone: 'AMZ300'
  },
  {
    zone_code: 'AMZ350',
    location_name: 'Coastal waters from South Santee River SC to Edisto Beach SC out 20 nm',
    synopsis_zone: 'AMZ300'
  },
  // Florida East Coast
  {
    zone_code: 'AMZ552',
    location_name: 'Volusia-Brevard County Line to Sebastian Inlet 0-20 nm',
    synopsis_zone: 'AMZ500'
  },
  {
    zone_code: 'AMZ650',
    location_name: 'Coastal waters from Jupiter Inlet to Deerfield Beach FL out 20 nm',
    synopsis_zone: 'AMZ101'
  }
];

export default function Home() {
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [zones] = useState<MarineZone[]>(MARINE_ZONES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [synopsis, setSynopsis] = useState<string>('');

  // Set initial zone
  useEffect(() => {
    if (zones.length > 0) {
      setSelectedZone(zones[0].zone_code);
    }
  }, [zones]);

  const generateSampleForecast = useCallback((zoneCode: string) => {
    const forecasts: WeatherForecast[] = [];
    const baseDate = new Date();
    
    // Generate realistic marine forecasts for 2-3 days
    const periods = [
      'Tonight', 'Tuesday', 'Tuesday Night', 'Wednesday', 'Wednesday Night', 'Thursday'
    ];
    
    const sampleWinds = [
      'N winds 10 to 15 kt',
      'NE winds 5 to 10 kt',
      'S winds 15 to 20 kt with gusts up to 25 kt',
      'SW winds 10 to 15 kt becoming W 15 to 20 kt',
      'Variable winds less than 5 kt',
      'NW winds 20 to 25 kt with gusts up to 30 kt'
    ];
    
    const sampleSeas = [
      '2 to 3 ft',
      '3 to 5 ft',
      '4 to 6 ft',
      '1 to 2 ft',
      '5 to 7 ft',
      '2 to 4 ft'
    ];
    
    const sampleWaveDetail = [
      'Dominant period 6 seconds',
      'E swell around 3 ft at 8 seconds',
      'Mixed swell 2 to 4 ft at 7 seconds',
      'Wind waves 2 to 3 ft',
      'S swell 3 to 5 ft at 9 seconds',
      'Choppy conditions near shore'
    ];
    
    const sampleDescriptions = [
      'Partly cloudy',
      'Mostly clear',
      'Overcast',
      'Rain showers likely',
      'Thunderstorms possible',
      'Fair weather'
    ];
    
    for (let i = 0; i < Math.min(periods.length, 6); i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + Math.floor(i / 2));
      
      forecasts.push({
        date: date.toISOString(),
        period: periods[i],
        winds: sampleWinds[i],
        seas: sampleSeas[i],
        waveDetail: sampleWaveDetail[i],
        thunderstorms: i === 4 ? 'Thunderstorms likely after 2 PM' : undefined,
        visibility: i < 3 ? 'Greater than 6 miles' : 'Reduced in rain showers',
        description: sampleDescriptions[i]
      });
    }
    
    return forecasts;
  }, []);

  const fetchForecast = useCallback(async () => {
    if (!selectedZone) return;
    
    setLoading(true);
    setError('');
    setSynopsis('');
    
    try {
      const selectedMarineZone = zones.find(zone => zone.zone_code === selectedZone);
      if (!selectedMarineZone) {
        throw new Error('Zone not found');
      }

      // Better Netlify detection
      const isNetlify = typeof window !== 'undefined' && (
        window.location.hostname.includes('netlify.app') || 
        window.location.hostname.includes('netlify.com') ||
        process.env.NETLIFY === 'true' ||
        // Check if we can access the API endpoint
        window.location.origin.includes('netlify')
      );

      console.log('Deployment info:', {
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
        isNetlify,
        nodeEnv: process.env.NODE_ENV,
        netlifyEnv: process.env.NETLIFY
      });

      if (isNetlify) {
        // Use real NOAA data via Netlify serverless function
        const apiUrl = `/api/marine-forecast?mz=${selectedZone}&syn=${selectedMarineZone.synopsis_zone}`;
        
        console.log('Fetching real NOAA data from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        console.log('API Response:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API Data received:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        console.log('Full API response:', data);
        console.log('Forecasts array:', data.forecasts);
        console.log('Forecasts length:', data.forecasts ? data.forecasts.length : 'undefined');
        
        if (data.forecasts && Array.isArray(data.forecasts)) {
          if (data.forecasts.length > 0) {
            setForecasts(data.forecasts);
            setSynopsis(data.synopsis || '');
            
            // Check if this is sample data due to NOAA blocking
            if (data.warning) {
              setError(`⚠️ ${data.warning} (${data.forecasts.length} periods shown)`);
            } else {
              setError(`✅ Live NOAA data loaded successfully (${data.forecasts.length} periods)`);
            }
          } else {
            // Still set empty forecasts but show debug info
            setForecasts([]);
            setSynopsis(data.synopsis || '');
            setError(`⚠️ API returned no forecast periods. Debug: HTML length ${data.debug?.htmlLength || 'unknown'}, Synopsis: "${data.synopsis || 'none'}". HTML Preview: "${data.debug?.htmlPreview?.substring(0, 200) || 'none'}"`);
          }
        } else {
          throw new Error(`Invalid API response format. Expected forecasts array, got: ${typeof data.forecasts}`);
        }
        
      } else {
        // Use sample data for local development or GitHub Pages
        console.log('Using sample data - not on Netlify');
        const marineUrl = `https://forecast.weather.gov/shmrn.php?mz=${selectedZone.toLowerCase()}&syn=${selectedMarineZone.synopsis_zone.toLowerCase()}`;
        setError(`Demo mode: Would fetch from ${marineUrl}. Deploy to Netlify for real data.`);
        
        const sampleForecasts = generateSampleForecast(selectedZone);
        setForecasts(sampleForecasts);
        
        const sampleSynopsis = `HIGH PRESSURE RIDGE OVER THE WATERS THROUGH TONIGHT. LOW PRESSURE SYSTEM APPROACHING FROM THE WEST TUESDAY INTO WEDNESDAY. SMALL CRAFT ADVISORY CONDITIONS EXPECTED TUESDAY AFTERNOON AND WEDNESDAY.`;
        setSynopsis(sampleSynopsis);
      }
      
    } catch (error) {
      console.error('Error fetching forecast:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error: ${errorMessage}. Using sample data.`);
      
      // Fall back to sample data
      const sampleForecasts = generateSampleForecast(selectedZone);
      setForecasts(sampleForecasts);
    } finally {
      setLoading(false);
    }
  }, [selectedZone, generateSampleForecast, zones]);

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

        <div className="bg-terminal-bg-alt p-4 rounded-lg border border-terminal-fg/20">
          <h2 className="text-terminal-accent mb-3 font-semibold">
            <span className="text-terminal-success">$</span> CURRENT FORECAST
          </h2>
          <div className="text-terminal-muted text-sm">
            Forecast is for today's date: {format(new Date(), 'yyyy-MM-dd')}
          </div>
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

      {/* Synopsis Section */}
      {synopsis && !loading && (
        <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded mb-6">
          <h2 className="text-terminal-accent mb-3 font-semibold">
            <span className="text-terminal-success">$</span> MARINE SYNOPSIS
          </h2>
          <div className="text-terminal-text text-sm leading-relaxed">
            {synopsis}
          </div>
        </div>
      )}

      {/* Detailed Forecast */}
      {forecasts.length > 0 && !loading && (
        <div className="border border-terminal-border bg-terminal-bg-alt p-4 rounded">
          <h2 className="text-terminal-accent mb-4 font-semibold">
            <span className="text-terminal-success">$</span> MARINE FORECAST
          </h2>
          <ForecastDisplay forecasts={forecasts} selectedZone={selectedZone} />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-terminal-fg/20 text-center text-sm text-terminal-muted">
        <div className="mb-3">
          Created by{' '}
          <a 
            href="https://www.instagram.com/wizumz/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-terminal-accent hover:text-terminal-success underline"
          >
            Wizumz
          </a>
          {' '}© 2025 -- consider supporting by{' '}
          <a 
            href="https://buymeacoffee.com/newenglandfishingreport" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-terminal-accent hover:text-terminal-success underline"
          >
            buying me a coffee
          </a>
        </div>
        <div className="text-xs text-terminal-muted/80">
          Seas are reported as significant wave height, which is the average of the highest third of the waves. Individual wave heights may be more than twice the significant wave height.
        </div>
      </footer>
    </div>
  );
}

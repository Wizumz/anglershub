import { NextRequest, NextResponse } from 'next/server';

interface WeatherForecast {
  date: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  description: string;
  detailedForecast: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zoneCode = searchParams.get('zone');
  const startDate = searchParams.get('date');

  if (!zoneCode) {
    return NextResponse.json(
      { success: false, error: 'Zone code is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch actual NOAA forecast data
    const noaaUrl = `https://api.weather.gov/zones/forecast/${zoneCode}/forecast`;
    
    const response = await fetch(noaaUrl, {
      headers: {
        'User-Agent': '(NOAA Marine Weather App, contact@example.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the forecast data
    const forecasts: WeatherForecast[] = [];
    const periods = data.properties?.periods || [];

    for (let i = 0; i < Math.min(periods.length, 8); i++) { // Get up to 4 days (8 periods)
      const period = periods[i];
      forecasts.push({
        date: period.startTime,
        temperature: period.temperature || 70,
        windSpeed: extractWindSpeed(period.detailedForecast || ''),
        windDirection: extractWindDirection(period.detailedForecast || ''),
        waveHeight: extractWaveHeight(period.detailedForecast || ''),
        description: period.shortForecast || '',
        detailedForecast: period.detailedForecast || ''
      });
    }

    return NextResponse.json({
      success: true,
      zone: zoneCode,
      forecasts,
      total: forecasts.length
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    
    // Return sample data if NOAA API fails
    const sampleForecasts: WeatherForecast[] = generateSampleForecast(zoneCode, startDate);
    
    return NextResponse.json({
      success: true,
      zone: zoneCode,
      forecasts: sampleForecasts,
      total: sampleForecasts.length,
      note: 'Sample data - NOAA API unavailable'
    });
  }
}

function extractWindSpeed(text: string): number {
  const windMatch = text.match(/winds?\s+(\d+)(?:-(\d+))?\s*(?:to\s*(\d+))?\s*(?:mph|knots|kts)/i);
  if (windMatch) {
    const speed1 = parseInt(windMatch[1]);
    const speed2 = windMatch[2] ? parseInt(windMatch[2]) : speed1;
    return Math.round((speed1 + speed2) / 2);
  }
  return 10; // default
}

function extractWindDirection(text: string): string {
  const dirMatch = text.match(/(north|south|east|west|northeast|northwest|southeast|southwest|variable)/i);
  return dirMatch ? dirMatch[1].toUpperCase() : 'VARIABLE';
}

function extractWaveHeight(text: string): number {
  const waveMatch = text.match(/waves?\s+(\d+)(?:-(\d+))?\s*(?:to\s*(\d+))?\s*(?:feet|ft)/i);
  if (waveMatch) {
    const height1 = parseInt(waveMatch[1]);
    const height2 = waveMatch[2] ? parseInt(waveMatch[2]) : height1;
    return Math.round((height1 + height2) / 2);
  }
  return 2; // default
}

function generateSampleForecast(zoneCode: string, startDate?: string | null): WeatherForecast[] {
  const baseDate = startDate ? new Date(startDate) : new Date();
  const forecasts: WeatherForecast[] = [];
  
  for (let i = 0; i < 8; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + Math.floor(i / 2));
    date.setHours(i % 2 === 0 ? 6 : 18, 0, 0, 0);
    
    forecasts.push({
      date: date.toISOString(),
      temperature: 65 + Math.random() * 20,
      windSpeed: 8 + Math.random() * 15,
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      waveHeight: 1 + Math.random() * 4,
      description: i % 2 === 0 ? 'Partly Cloudy' : 'Clear',
      detailedForecast: `Marine conditions for ${zoneCode}. ${i % 2 === 0 ? 'Morning' : 'Evening'} forecast with moderate seas.`
    });
  }
  
  return forecasts;
}
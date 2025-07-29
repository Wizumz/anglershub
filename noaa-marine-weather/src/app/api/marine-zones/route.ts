import { NextResponse } from 'next/server';

interface MarineZone {
  zone_code: string;
  location_name: string;
  synopsis_zone: string;
}

// Marine zone prefixes
const MARINE_PREFIXES = ['ANZ', 'AMZ', 'GMZ', 'PMZ', 'OZ', 'HZ'];

export async function GET() {
  try {
    // For now, we'll use a sample set of popular marine zones
    // In production, you would fetch from the actual NOAA data source
    const sampleZones: MarineZone[] = [
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

    return NextResponse.json({
      success: true,
      zones: sampleZones,
      total: sampleZones.length
    });
  } catch (error) {
    console.error('Error fetching marine zones:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marine zones' },
      { status: 500 }
    );
  }
}
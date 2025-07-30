interface TideStation {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

interface TidePrediction {
  time: string;
  value: number; // Height in feet relative to MLLW
  type: 'H' | 'L'; // High or Low tide
}

interface TideData {
  stationId: string;
  stationName: string;
  predictions: TidePrediction[];
  datum: string; // Usually MLLW (Mean Lower Low Water)
  units: string; // Usually "feet"
  timeZone: string;
  disclaimer: string;
}

// Map marine zones to nearest tide stations
const ZONE_TO_TIDE_STATION: Record<string, string> = {
  // Maine
  'ANZ230': '8418150', // Eastport, ME
  'ANZ231': '8413320', // Bar Harbor, ME
  'ANZ232': '8410140', // Cutler Farris Wharf, ME
  'ANZ233': '8411060', // Cutler Naval Computer, ME
  'ANZ234': '8447930', // Woods Hole, MA (Vineyard Sound)
  'ANZ235': '8413320', // Bar Harbor, ME
  'ANZ236': '8416092', // Winter Harbor, ME
  'ANZ250': '8418150', // Eastport, ME
  'ANZ251': '8413320', // Bar Harbor, ME
  'ANZ252': '8410140', // Cutler Farris Wharf, ME
  
  // New Hampshire/Massachusetts
  'ANZ330': '8423898', // Fort Point, NH
  'ANZ331': '8443970', // Boston, MA
  'ANZ332': '8447930', // Gloucester, MA
  'ANZ333': '8443970', // Boston, MA
  'ANZ334': '8447930', // Gloucester, MA
  'ANZ335': '8443970', // Boston, MA
  'ANZ336': '8447930', // Gloucester, MA
  
  // Cape Cod/Rhode Island
  'ANZ430': '8447930', // Gloucester, MA
  'ANZ431': '8447387', // Scituate, MA
  'ANZ432': '8447435', // Hingham, MA
  'ANZ433': '8447930', // Gloucester, MA
  'ANZ434': '8449130', // Nantucket Island, MA
  'ANZ435': '8447387', // Scituate, MA
  'ANZ436': '8447930', // Gloucester, MA
  'ANZ437': '8454000', // Providence, RI
  'ANZ438': '8452660', // Newport, RI
  'ANZ439': '8452660', // Newport, RI
  
  // Connecticut/New York
  'ANZ530': '8461490', // New London, CT
  'ANZ531': '8510560', // Montauk, NY
  'ANZ532': '8516945', // Kings Point, NY
  'ANZ533': '8518750', // The Battery, NY
  'ANZ534': '8516945', // Kings Point, NY
  'ANZ535': '8518750', // The Battery, NY
  'ANZ536': '8516945', // Kings Point, NY
  'ANZ537': '8518750', // The Battery, NY
  'ANZ538': '8516945', // Kings Point, NY
  
  // New Jersey/Delaware
  'ANZ630': '8531680', // Sandy Hook, NJ
  'ANZ631': '8534720', // Atlantic City, NJ
  'ANZ632': '8537121', // Cape Henlopen, DE
  'ANZ633': '8534720', // Atlantic City, NJ
  'ANZ634': '8537121', // Cape Henlopen, DE
  'ANZ635': '8531680', // Sandy Hook, NJ
  'ANZ636': '8534720', // Atlantic City, NJ
  'ANZ637': '8537121', // Cape Henlopen, DE
  
  // Maryland/Virginia
  'ANZ730': '8570283', // Ocean City Inlet, MD
  'ANZ731': '8571892', // Wachapreague, VA
  'ANZ732': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  'ANZ733': '8571892', // Wachapreague, VA
  'ANZ734': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  'ANZ735': '8570283', // Ocean City Inlet, MD
  'ANZ736': '8571892', // Wachapreague, VA
  'ANZ737': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  
  // North Carolina (Fixed duplicate codes)
  'ANZ350': '8652587', // Oregon Inlet Marina, NC (was ANZ150)
  'ANZ352': '8654467', // Hatteras, NC (was ANZ152)
  'ANZ354': '8656483', // Beaufort, NC (was ANZ154)
  'ANZ830': '8652587', // Oregon Inlet Marina, NC
  'ANZ831': '8654467', // Hatteras, NC
  'ANZ832': '8656483', // Beaufort, NC
  'ANZ833': '8658163', // Wrightsville Beach, NC
  'ANZ834': '8661070', // Southport, NC
  'ANZ835': '8652587', // Oregon Inlet Marina, NC
  'ANZ836': '8654467', // Hatteras, NC
  'ANZ837': '8656483', // Beaufort, NC
  'ANZ838': '8658163', // Wrightsville Beach, NC
  'ANZ839': '8661070', // Southport, NC
  
  // South Carolina/Georgia
  'ANZ930': '8665530', // Charleston, SC
  'ANZ931': '8670870', // Fort Pulaski, GA
  'ANZ932': '8677344', // Fernandina Beach, FL
  'ANZ933': '8665530', // Charleston, SC
  'ANZ934': '8670870', // Fort Pulaski, GA
  'ANZ935': '8677344', // Fernandina Beach, FL
  'ANZ936': '8665530', // Charleston, SC
  'ANZ937': '8670870', // Fort Pulaski, GA
  'ANZ938': '8677344', // Fernandina Beach, FL
  
  // Florida East Coast
  'ANZ1030': '8677344', // Fernandina Beach, FL
  'ANZ1031': '8720218', // Mayport, FL
  'ANZ1032': '8720587', // Trident Pier, FL
  'ANZ1033': '8721604', // Daytona Beach, FL
  'ANZ1034': '8722670', // Lake Worth Pier, FL
  'ANZ1035': '8723214', // Virginia Key, FL
  'ANZ1036': '8723970', // Vaca Key, FL
  'ANZ1037': '8724580', // Key West, FL
};



// Fetch tide data from Open-Meteo as fallback
const fetchMeteoTideData = async (latitude: number, longitude: number): Promise<TideData | null> => {
  try {
    const url = `https://api.open-meteo.com/v1/marine?` +
      `latitude=${latitude}&longitude=${longitude}&` +
      `hourly=sea_level_height_msl&` +
      `timezone=America/New_York&forecast_days=7`;

    console.log('Open-Meteo URL:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo Marine API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Open-Meteo response data:', data);
    
    if (!data.hourly?.sea_level_height_msl) {
      console.error('Open-Meteo response missing sea_level_height_msl:', data);
      throw new Error('No sea level data available from Open-Meteo');
    }

    // Convert sea level data to tide predictions
    const predictions: TidePrediction[] = [];
    const times = data.hourly.time;
    const levels = data.hourly.sea_level_height_msl;
    
    console.log('Sea level data points:', levels.length);
    console.log('First 10 levels:', levels.slice(0, 10));
    
    // Convert meters to feet and find high/low tides
    for (let i = 1; i < levels.length - 1; i++) {
      const prev = levels[i - 1];
      const curr = levels[i];
      const next = levels[i + 1];
      
      if (prev === null || curr === null || next === null) continue;
      
      // Find local maxima (high tide) and minima (low tide)
      if (curr > prev && curr > next && Math.abs(curr) > 0.05) { // High tide
        predictions.push({
          time: times[i],
          value: parseFloat((curr * 3.28084).toFixed(2)), // Convert m to ft
          type: 'H'
        });
      } else if (curr < prev && curr < next && Math.abs(curr) < 10) { // Low tide
        predictions.push({
          time: times[i],
          value: parseFloat((curr * 3.28084).toFixed(2)), // Convert m to ft
          type: 'L'
        });
      }
    }
    
    console.log('Found tide predictions:', predictions.length);
    console.log('Predictions:', predictions);

    return {
      stationId: 'meteo-fallback',
      stationName: `Open-Meteo Marine Data (${latitude.toFixed(2)}°N, ${Math.abs(longitude).toFixed(2)}°W)`,
      predictions,
      datum: 'MSL',
      units: 'feet',
      timeZone: 'America/New_York',
      disclaimer: 'Tide predictions from Open-Meteo Marine Weather API using global ocean models'
    };

  } catch (error) {
    console.error('Error fetching Open-Meteo tide data:', error);
    return null;
  }
};

export const fetchTideData = async (zoneCode: string, latitude?: number, longitude?: number): Promise<TideData | null> => {
  const stationId = ZONE_TO_TIDE_STATION[zoneCode];
  
  // Try NOAA first if station available
  if (stationId) {

  try {
    // Get predictions for next 7 days
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);
    
    const beginDate = today.toISOString().split('T')[0].replace(/-/g, '');
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
    
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
      `product=predictions&application=NOS.COOPS.TAC.WL&` +
      `begin_date=${beginDate}&end_date=${endDateStr}&` +
      `datum=MLLW&station=${stationId}&time_zone=lst_ldt&units=english&` +
      `interval=hilo&format=json`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NOAA Tides API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No tide predictions available');
    }

    const predictions: TidePrediction[] = data.predictions.map((pred: any) => ({
      time: pred.t,
      value: parseFloat(pred.v),
      type: pred.type === 'H' ? 'H' : 'L'
    }));

    // Get station metadata
    const metadataUrl = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json`;
    let stationName = `Station ${stationId}`;
    
    try {
      const metaResponse = await fetch(metadataUrl);
      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        stationName = metaData.stations[0]?.name || stationName;
      }
    } catch (error) {
      console.warn('Could not fetch station metadata:', error);
    }

    return {
      stationId,
      stationName,
      predictions,
      datum: 'MLLW',
      units: 'feet',
      timeZone: 'Local Standard Time / Local Daylight Time',
      disclaimer: 'Tide predictions from NOAA Center for Operational Oceanographic Products and Services'
    };

  } catch (error) {
    console.error('Error fetching NOAA tide data:', error);
    console.log(`NOAA failed for station ${stationId}, falling back to Open-Meteo...`);
    // Fall through to Open-Meteo fallback
  }
  }

  // Fallback to Open-Meteo if NOAA station not available or failed
  if (latitude !== undefined && longitude !== undefined) {
    console.log(`Using Open-Meteo fallback for zone ${zoneCode}`);
    return await fetchMeteoTideData(latitude, longitude);
  }

  console.warn(`No tide data available for zone ${zoneCode} - no NOAA station and no coordinates provided`);
  return null;
};

export type { TideData, TidePrediction, TideStation };
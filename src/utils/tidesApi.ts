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
  // Maine Coastal Waters
  'ANZ150': '8413320', // Bar Harbor, ME
  'ANZ151': '8410140', // Cutler Farris Wharf, ME  
  'ANZ152': '8411060', // Cutler Naval Computer, ME
  'ANZ153': '8416092', // Winter Harbor, ME
  'ANZ154': '8418150', // Eastport, ME
  
  // Maine/New Hampshire Border
  'ANZ230': '8443970', // Boston, MA (was incorrectly Portland, ME)
  'ANZ231': '8413320', // Bar Harbor, ME
  'ANZ232': '8447930', // Woods Hole, MA (Nantucket Sound)
  'ANZ233': '8447930', // Woods Hole, MA (Vineyard Sound)
  'ANZ234': '8447930', // Woods Hole, MA (Buzzards Bay)
  'ANZ235': '8452660', // Newport, RI (Rhode Island Sound)
  'ANZ236': '8454000', // Providence, RI (Narragansett Bay)
  'ANZ237': '8461490', // New London, CT (Block Island Sound)
  
  // Massachusetts Bay and Offshore
  'ANZ250': '8443970', // Boston, MA (Coastal waters east of Ipswich Bay)
  'ANZ251': '8443970', // Boston, MA (Massachusetts Bay and Ipswich Bay)
  'ANZ254': '8449130', // Nantucket Island, MA (Provincetown to Chatham to Nantucket)
  'ANZ255': '8449130', // Nantucket Island, MA (South of Martha's Vineyard and Nantucket)
  'ANZ256': '8461490', // New London, CT (Montauk to Martha's Vineyard)
  
  // Offshore Waters
  'ANZ270': '8443970', // Boston, MA (Ocean Waters from Merrimack River to Plymouth)
  'ANZ271': '8449130', // Nantucket Island, MA (Ocean Waters from Provincetown to Nantucket)
  
  // New Hampshire/Massachusetts
  'ANZ330': '8423898', // Fort Point, NH
  'ANZ331': '8443970', // Boston, MA
  'ANZ332': '8447930', // Gloucester, MA
  'ANZ333': '8443970', // Boston, MA
  'ANZ334': '8447930', // Gloucester, MA
  'ANZ335': '8461490', // New London, CT (was incorrectly Boston, MA)
  'ANZ336': '8447930', // Gloucester, MA
  'ANZ338': '8447930', // Gloucester, MA
  
  // Long Island Sound and Connecticut Waters
  'ANZ340': '8461490', // New London, CT
  'ANZ345': '8461490', // New London, CT
  'ANZ350': '8510560', // Montauk, NY (was NC, moved to correct location)
  'ANZ353': '8461490', // New London, CT
  'ANZ355': '8461490', // New London, CT
  
  // New York Waters  
  'ANZ370': '8516945', // Kings Point, NY
  'ANZ373': '8518750', // The Battery, NY
  'ANZ375': '8510560', // Montauk, NY
  
  // Delaware Bay and New Jersey (400 series)
  'ANZ400': '8537121', // Cape Henlopen, DE
  'ANZ401': '8537121', // Cape Henlopen, DE
  'ANZ430': '8531680', // Sandy Hook, NJ
  'ANZ431': '8534720', // Atlantic City, NJ
  'ANZ432': '8537121', // Cape Henlopen, DE
  'ANZ433': '8534720', // Atlantic City, NJ
  'ANZ434': '8537121', // Cape Henlopen, DE
  'ANZ435': '8531680', // Sandy Hook, NJ
  'ANZ436': '8534720', // Atlantic City, NJ
  'ANZ437': '8537121', // Cape Henlopen, DE
  'ANZ450': '8534720', // Atlantic City, NJ
  'ANZ451': '8537121', // Cape Henlopen, DE
  'ANZ452': '8570283', // Ocean City Inlet, MD
  'ANZ453': '8571892', // Wachapreague, VA
  'ANZ454': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  'ANZ455': '8571892', // Wachapreague, VA
  'ANZ456': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  
  // Chesapeake Bay and Virginia (600 series)
  'ANZ600': '8570283', // Ocean City Inlet, MD
  'ANZ630': '8571892', // Wachapreague, VA
  'ANZ631': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  'ANZ632': '8571892', // Wachapreague, VA
  'ANZ633': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  'ANZ634': '8570283', // Ocean City Inlet, MD
  'ANZ635': '8571892', // Wachapreague, VA
  'ANZ636': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  'ANZ650': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  'ANZ651': '8632200', // Kiptopeke, VA
  'ANZ652': '8638610', // Sewells Point, VA
  'ANZ653': '8637624', // Money Point, VA
  'ANZ654': '8638863', // Chesapeake Bay Bridge Tunnel, VA
  'ANZ655': '8632200', // Kiptopeke, VA
  'ANZ656': '8638610', // Sewells Point, VA
  
  // North Carolina (800 series) - Fixed previous incorrect mappings
  'ANZ800': '8652587', // Oregon Inlet Marina, NC
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
  'ANZ850': '8652587', // Oregon Inlet Marina, NC
  'ANZ851': '8654467', // Hatteras, NC
  'ANZ852': '8656483', // Beaufort, NC
  'ANZ853': '8658163', // Wrightsville Beach, NC
  'ANZ854': '8661070', // Southport, NC
  'ANZ855': '8652587', // Oregon Inlet Marina, NC
  'ANZ856': '8654467', // Hatteras, NC
  'ANZ857': '8656483', // Beaufort, NC
  'ANZ858': '8658163', // Wrightsville Beach, NC
  'ANZ859': '8661070', // Southport, NC
  
  // South Carolina/Georgia/Florida (AMZ zones)
  'AMZ230': '8665530', // Charleston, SC
  'AMZ250': '8665530', // Charleston, SC
  'AMZ254': '8670870', // Fort Pulaski, GA
  'AMZ330': '8670870', // Fort Pulaski, GA
  'AMZ350': '8677344', // Fernandina Beach, FL
  'AMZ352': '8720218', // Mayport, FL
  'AMZ354': '8721604', // Daytona Beach, FL
  'AMZ370': '8722670', // Lake Worth Pier, FL
  'AMZ372': '8723214', // Virginia Key, FL
  'AMZ430': '8723970', // Vaca Key, FL
  'AMZ450': '8724580', // Key West, FL
  'AMZ470': '8724580', // Key West, FL
  'AMZ550': '8724580', // Key West, FL
  'AMZ572': '8725110', // Naples, FL
  'AMZ574': '8726607', // Old Port Tampa, FL
  'AMZ610': '8726724', // Clearwater Beach, FL
  'AMZ630': '8727520', // Cedar Key, FL
  'AMZ650': '8728690', // Apalachicola, FL
  'AMZ670': '8729840', // Panama City, FL
  'AMZ672': '8731439', // Pensacola, FL
  'AMZ730': '8735180', // Dauphin Island, AL
  'AMZ750': '8740166', // Grand Isle, LA
  'AMZ752': '8761724', // Galveston, TX
  'AMZ772': '8775870', // Port Arthur, TX
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
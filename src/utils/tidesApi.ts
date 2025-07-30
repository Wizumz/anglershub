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
  'ANZ234': '8412369', // Frenchman Bay, ME
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
  
  // North Carolina
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

// Calculate tidal coefficient (strength of tide)
// Range typically 20-120, where 70+ is considered strong
const calculateTidalCoefficient = (predictions: TidePrediction[]): number => {
  if (predictions.length < 4) return 50; // Default if insufficient data
  
  // Get high and low tides for calculation
  const highs = predictions.filter(p => p.type === 'H').map(p => p.value);
  const lows = predictions.filter(p => p.type === 'L').map(p => p.value);
  
  if (highs.length === 0 || lows.length === 0) return 50;
  
  // Calculate average tidal range over the prediction period
  let totalRange = 0;
  let rangeCount = 0;
  
  // Group predictions by day and calculate daily ranges
  const predictionsByDay = predictions.reduce((acc, pred) => {
    const date = pred.time.split(' ')[0]; // Get date part
    if (!acc[date]) acc[date] = [];
    acc[date].push(pred);
    return acc;
  }, {} as Record<string, TidePrediction[]>);
  
  Object.values(predictionsByDay).forEach(dayPreds => {
    const dayHighs = dayPreds.filter(p => p.type === 'H').map(p => p.value);
    const dayLows = dayPreds.filter(p => p.type === 'L').map(p => p.value);
    
    if (dayHighs.length > 0 && dayLows.length > 0) {
      const dayMaxHigh = Math.max(...dayHighs);
      const dayMinLow = Math.min(...dayLows);
      totalRange += (dayMaxHigh - dayMinLow);
      rangeCount++;
    }
  });
  
  if (rangeCount === 0) return 50;
  
  const averageRange = totalRange / rangeCount;
  
  // More realistic coefficient calculation based on East Coast tidal ranges
  // Typical ranges: 2-3ft = weak, 4-6ft = moderate, 7-8ft = strong, 9+ft = very strong
  let coefficient;
  if (averageRange <= 2.5) {
    coefficient = 30 + (averageRange / 2.5) * 15; // 30-45
  } else if (averageRange <= 5.0) {
    coefficient = 45 + ((averageRange - 2.5) / 2.5) * 20; // 45-65
  } else if (averageRange <= 7.5) {
    coefficient = 65 + ((averageRange - 5.0) / 2.5) * 20; // 65-85
  } else {
    coefficient = 85 + Math.min(((averageRange - 7.5) / 2.5) * 25, 35); // 85-120
  }
  
  return Math.round(Math.min(120, Math.max(20, coefficient)));
};

// Get tidal coefficient description
const getTidalCoefficientDescription = (coefficient: number): string => {
  if (coefficient >= 95) return 'Very Strong Tides';
  if (coefficient >= 80) return 'Strong Tides';
  if (coefficient >= 65) return 'Moderate Tides';
  if (coefficient >= 45) return 'Weak Tides';
  return 'Very Weak Tides';
};

export const fetchTideData = async (zoneCode: string): Promise<TideData | null> => {
  const stationId = ZONE_TO_TIDE_STATION[zoneCode];
  if (!stationId) {
    console.warn(`No tide station found for zone ${zoneCode}`);
    return null;
  }

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
    console.error('Error fetching tide data:', error);
    return null;
  }
};

export { calculateTidalCoefficient, getTidalCoefficientDescription };
export type { TideData, TidePrediction, TideStation };
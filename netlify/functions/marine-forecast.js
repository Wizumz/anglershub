const https = require('https');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { mz, syn } = event.queryStringParameters || {};
    
    if (!mz) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing marine zone parameter (mz)' })
      };
    }

    // Construct NOAA marine forecast URL - ensure HTTPS
    const noaaUrl = `https://forecast.weather.gov/shmrn.php?mz=${mz.toLowerCase()}${syn ? `&syn=${syn.toLowerCase()}` : ''}`;
    
    console.log('Fetching from NOAA:', noaaUrl);

    // Fetch the marine forecast page
    let html;
    try {
      html = await fetchUrl(noaaUrl);
    } catch (fetchError) {
      console.error('Failed to fetch NOAA data:', fetchError);
      
      // If NOAA is blocking us, return sample data so the app still works
      const sampleForecasts = [
        {
          date: new Date().toISOString(),
          period: 'TONIGHT',
          winds: 'SW 5 to 10 kt',
          seas: '1 ft or less',
          waveDetail: '',
          thunderstorms: '',
          visibility: '',
          description: 'Clear',
          summary: {
            type: 'good',
            icon: '🌞',
            text: "Sun's Out, Sails Up!",
            color: 'green',
            bold: false
          }
        },
        {
          date: new Date().toISOString(),
          period: 'TOMORROW',
          winds: 'NE 15 to 18 kt',
          seas: '2 to 3 ft',
          waveDetail: '',
          thunderstorms: '',
          visibility: '',
          description: 'Partly cloudy',
          summary: {
            type: 'moderate',
            icon: '💨',
            text: 'Breezy but Doable, Sailor!',
            color: 'blue',
            bold: false
          }
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          zone: mz.toUpperCase(),
          synopsis: 'SAMPLE DATA - NOAA ACCESS CURRENTLY RESTRICTED',
          forecasts: sampleForecasts,
          sourceUrl: noaaUrl,
          timestamp: new Date().toISOString(),
          warning: 'NOAA is currently blocking automated requests. Showing sample data.',
          debug: {
            error: fetchError.message,
            htmlLength: 0,
            forecastCount: sampleForecasts.length
          }
        })
      };
    }
    
    console.log('HTML received, length:', html.length);
    console.log('HTML preview:', html.substring(0, 500));
    
    // Parse the marine forecast data
    const forecastData = parseMarineForecast(html);
    
    console.log('Parsed forecast data:', JSON.stringify(forecastData, null, 2));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        zone: mz.toUpperCase(),
        synopsis: forecastData.synopsis,
        forecasts: forecastData.forecasts,
        sourceUrl: noaaUrl,
        timestamp: new Date().toISOString(),
        debug: {
          htmlLength: html.length,
          forecastCount: forecastData.forecasts.length,
          htmlPreview: html.substring(0, 1000)
        }
      })
    };

  } catch (error) {
    console.error('Error fetching marine forecast:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch marine forecast',
        details: error.message 
      })
    };
  }
};

// Fetch URL using Node.js https module
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'curl/7.68.0',
        'Accept': '*/*'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log('Following redirect to:', res.headers.location);
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        console.error('HTTP Error:', res.statusCode, res.statusMessage);
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
      
    }).on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });
  });
}

// Parse NOAA marine forecast HTML
function parseMarineForecast(html) {
  const forecasts = [];
  let synopsis = '';

  try {
    console.log('Starting HTML parsing...');

    // Extract synopsis from the forecast content - it's usually at the top
    // Look for content before the first time stamp
    const timeStampPattern = /\d{1,2}:\d{2}\s+[AP]M\s+[A-Z]{3}/;
    const timeStampMatch = html.search(timeStampPattern);
    
    if (timeStampMatch > -1) {
      const beforeTimeStamp = html.substring(0, timeStampMatch);
      // Look for synopsis in the content before timestamp
      const synopsisMatch = beforeTimeStamp.match(/([A-Z][^<]*(?:HIGH PRESSURE|LOW PRESSURE|SMALL CRAFT|GALE|STORM|WIND|ADVISORY)[^<]*)/i);
      if (synopsisMatch) {
        synopsis = synopsisMatch[1].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
        console.log('Found synopsis:', synopsis.substring(0, 100));
      }
    }

    // Updated parsing for NOAA's actual structure
    // Look for the forecast content in the pre-formatted div
    const preFormatDiv = html.match(/<div[^>]*white-space:\s*pre-wrap[^>]*>(.*?)<\/div>/is);
    
    if (preFormatDiv) {
      const forecastContent = preFormatDiv[1];
      console.log('Found forecast content div');
      
      // Pattern for NOAA periods: <strong><font...>PERIOD</font></strong> followed by text
      // But skip the first match if it's just a timestamp/header
      const periodPattern = /<strong><font[^>]*>(.*?)<\/font><\/strong>\s*(.*?)(?=<strong><font|$)/gs;
      
      let match;
      let matchCount = 0;
      while ((match = periodPattern.exec(forecastContent)) !== null) {
        matchCount++;
        const rawPeriod = match[1].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
        const rawForecastText = match[2].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
        
        // Skip if this looks like a timestamp/header rather than a forecast period
        const isTimeStamp = /\d{1,2}:\d{2}\s+[AP]M/.test(rawPeriod);
        const isZoneHeader = /^[A-Z]{3}\d{3}/.test(rawPeriod);
        
        // ALWAYS skip the first match as it's consistently problematic
        if (matchCount === 1) {
          console.log(`Skipping first match (always problematic): ${rawPeriod}`);
          continue;
        }
        
        if (isTimeStamp || isZoneHeader) {
          console.log(`Skipping timestamp/header: ${rawPeriod}`);
          continue;
        }
        
        // Clean up the period name - should be like "TONIGHT", "WED", etc.
        const period = rawPeriod.replace(/^\s*&nbsp;\s*/, '').trim();
        
        if (period.length > 0 && rawForecastText.length > 0) {
          console.log(`Found forecast period: ${period} -> ${rawForecastText.substring(0, 100)}...`);
          
          // Parse forecast components more carefully
          const winds = extractWinds(rawForecastText);
          const seas = extractSeas(rawForecastText);
          const waveDetail = extractWaveDetail(rawForecastText);
          const thunderstorms = extractThunderstorms(rawForecastText);
          const visibility = extractVisibility(rawForecastText);
          
          // Extract just the weather conditions, not the full forecast
          const description = extractWeatherConditions(rawForecastText);
          
          // Generate summary using decision tree
          const summary = generateSummary(rawForecastText, winds, seas, waveDetail);

          forecasts.push({
            date: new Date().toISOString(),
            period,
            winds,
            seas,
            waveDetail,
            thunderstorms,
            visibility,
            description,
            summary
          });
        }
      }
    }

    // If no forecasts found with pre-formatted div, try fallback patterns
    if (forecasts.length === 0) {
      console.log('No forecasts found in pre-formatted div, trying fallback patterns...');
      
      // More comprehensive forecast extraction
      const forecastPatterns = [
        // Pattern 1: Strong font tags (NOAA format) - but skip timestamps
        /<strong><font[^>]*>([^<]*)<\/font><\/strong>\s*(.*?)(?=<strong>|$)/gs,
        // Pattern 2: Bold period headers
        /<b[^>]*>([^<]*(?:tonight|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)[^<]*)<\/b>\s*[:\-\s]*([^<]*(?:<br[^>]*>[^<]*)*)/gi
      ];

      let foundForecasts = false;
      
      for (let patternIndex = 0; patternIndex < forecastPatterns.length && !foundForecasts; patternIndex++) {
        const pattern = forecastPatterns[patternIndex];
        console.log(`Trying forecast pattern ${patternIndex + 1}...`);
        
        let match;
        while ((match = pattern.exec(html)) !== null) {
          const rawPeriod = match[1].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
          let forecastText = match[2].replace(/<br[^>]*>/gi, ' ').replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
          
          // Skip timestamps and zone headers
          const isTimeStamp = /\d{1,2}:\d{2}\s+[AP]M/.test(rawPeriod);
          const isZoneHeader = /^[A-Z]{3}\d{3}/.test(rawPeriod);
          
          if (isTimeStamp || isZoneHeader) {
            continue;
          }
          
          const period = rawPeriod.trim();
          
          if (period.length > 0 && forecastText.length > 0) {
            console.log(`Found forecast: ${period} -> ${forecastText.substring(0, 100)}...`);
            
            // Parse forecast components
            const winds = extractWinds(forecastText);
            const seas = extractSeas(forecastText);
            const waveDetail = extractWaveDetail(forecastText);
            const thunderstorms = extractThunderstorms(forecastText);
            const visibility = extractVisibility(forecastText);
            const description = extractWeatherConditions(forecastText);

            forecasts.push({
              date: new Date().toISOString(),
              period,
              winds,
              seas,
              waveDetail,
              thunderstorms,
              visibility,
              description
            });
            
            foundForecasts = true;
          }
        }
        
        // Reset regex for next pattern
        pattern.lastIndex = 0;
      }
    }

    console.log(`Parsing complete. Found ${forecasts.length} forecasts`);

  } catch (error) {
    console.error('Error parsing forecast:', error);
  }

  return { synopsis, forecasts };
}

// Helper functions to extract specific forecast components
function extractWinds(text) {
  // Enhanced NOAA format: capture full wind description including additional conditions
  // Examples: "SW winds 5 to 10 kt, BECOMING NW AFTER MIDNIGHT"
  //          "NE winds 5 to 10 kt, INCREASING TO 10 TO 15 KT IN THE AFTERNOON"
  //          "NE winds 10 to 15 kt. GUSTS UP TO 20 KT IN THE EVENING"
  
  // First try to match the main wind pattern and capture everything until a period or major break
  let windMatch = text.match(/([NSEW]{1,2})\s+winds?\s+([^.]*?(?:kt|knots?|mph|kts)[^.]*?)(?:\.|$|(?=\s+[A-Z][a-z]+\s+(?:around|1|2|3|4|5|6|7|8|9)))/i);
  
  if (windMatch) {
    let fullWindText = `${windMatch[1]} winds ${windMatch[2].trim()}`;
    
    // Clean up and ensure proper formatting
    fullWindText = fullWindText
      .replace(/\s+/g, ' ')           // normalize spaces
      .replace(/kt\s*,?\s*([A-Z])/g, 'kt, $1')  // ensure comma after kt before capitalized conditions
      .trim();
    
    return fullWindText;
  }
  
  // Fallback to simpler pattern if complex one fails
  windMatch = text.match(/([NSEW]{1,2})\s+winds?\s+([^.,]*(?:kt|knots?|mph|kts)[^.,]*)/i);
  return windMatch ? `${windMatch[1]} winds ${windMatch[2].trim()}` : '';
}

function extractSeas(text) {
  // Enhanced NOAA format: capture full sea/wave description including additional conditions
  // Examples: "Waves 1 foot or less"
  //          "WAVES AROUND 2 FT IN THE EVENING, THEN 1 FOOT OR LESS"
  //          "Seas 2 to 4 ft, BUILDING TO 4 TO 6 FT"
  
  // First try to match seas/waves pattern and capture everything until a period or major break
  let seasMatch = text.match(/(?:seas?|waves?)\s+([^.]*?(?:ft|feet|foot)[^.]*?)(?:\.|$|(?=\s+[A-Z][a-z]+\s+(?:around|1|2|3|4|5|6|7|8|9|[NSEW])))/i);
  
  if (seasMatch) {
    let fullSeasText = seasMatch[1].trim();
    
    // Clean up and ensure proper formatting
    fullSeasText = fullSeasText
      .replace(/\s+/g, ' ')           // normalize spaces
      .replace(/ft\s*,?\s*([A-Z])/g, 'ft, $1')  // ensure comma after ft before capitalized conditions
      .trim();
    
    return fullSeasText;
  }
  
  // Fallback to simpler pattern if complex one fails
  seasMatch = text.match(/seas?\s+([^.,]*(?:ft|feet|foot)[^.,]*)/i);
  
  // Fallback to "Waves" if "Seas" not found
  if (!seasMatch) {
    seasMatch = text.match(/waves?\s+([^.,]*(?:ft|feet|foot)[^.,]*)/i);
  }
  
  return seasMatch ? seasMatch[1].trim() : '';
}

function extractWaveDetail(text) {
  // NOAA format: "Wave Detail: E 2 ft at 3 seconds"
  const waveMatch = text.match(/wave\s+detail:\s*([^.,]*)/i);
  return waveMatch ? waveMatch[1].trim() : '';
}

function extractThunderstorms(text) {
  // NOAA format: "tstms" or "thunderstorms" 
  const stormMatch = text.match(/((?:thunderstorms?|tstms?)[^.,]*)/i);
  return stormMatch ? stormMatch[1].trim() : '';
}

function extractVisibility(text) {
  // NOAA format: "vsby 1 to 3 nm" or "Visibility 1 to 3 nm" - handle both cases
  let visMatch = text.match(/vsby\s+([^.,]*(?:nm|miles?)[^.,]*)/i);
  
  // Fallback to full "Visibility" word if "vsby" not found
  if (!visMatch) {
    visMatch = text.match(/visibility\s+([^.,]*(?:nm|miles?)[^.,]*)/i);
  }
  
  return visMatch ? visMatch[1].trim() : '';
}

function extractWeatherConditions(text) {
  // Extract specific weather conditions, not the full forecast text
  const conditions = [];
  
  // Look for specific weather patterns
  const weatherPatterns = [
    /(?:chance of |scattered |slight chance of )?(showers?|rain|tstms?|thunderstorms?)/gi,
    /(?:partly |mostly |becoming )?(?:cloudy|clear|overcast|sunny)/gi,
    /fog|mist|haze/gi,
    /(?:light |heavy )?(?:snow|sleet|freezing rain)/gi
  ];
  
  for (const pattern of weatherPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim();
        if (cleaned && !conditions.includes(cleaned.toLowerCase())) {
          conditions.push(cleaned);
        }
      });
    }
  }
  
  // If no specific weather found, return a general condition
  if (conditions.length === 0) {
    if (text.toLowerCase().includes('fair')) {
      return 'Fair weather';
    } else if (text.toLowerCase().includes('clear')) {
      return 'Clear';
    }
    return ''; // Return empty if no weather conditions found
  }
  
  return conditions.join(', ');
}

function generateSummary(forecastText, winds, seas, waveDetail) {
  const text = forecastText.toLowerCase();
  
  // Extract numeric values for comprehensive analysis
  const seasHeight = Math.max(extractNumericValue(seas), extractNumericValue(waveDetail));
  const windSpeed = extractWindSpeed(winds);
  
  // DANGEROUS CONDITIONS (RED) - Highest Priority
  // Wind speed > 20 kt OR seas > 3 ft OR weather includes rain, storms, or fog
  
  // Check for severe weather first (overrides all other conditions)
  if (text.includes('small craft') || text.includes('advisory') || text.includes('gale') || text.includes('storm warning')) {
    return selectRandomMessage('danger', 'advisory');
  }
  
  if (text.includes('tstms') || text.includes('thunderstorms') || text.includes('thunderstorm')) {
    return selectRandomMessage('danger', 'storm');
  }
  
  if (text.includes('rain') || text.includes('showers')) {
    return selectRandomMessage('danger', 'rain');
  }
  
  if (text.includes('fog') || text.includes('mist')) {
    return selectRandomMessage('danger', 'fog');
  }
  
  // Check numeric thresholds for dangerous conditions
  if (windSpeed > 20 || seasHeight > 3) {
    if (windSpeed > 20 && seasHeight > 3) {
      return selectRandomMessage('danger', 'both');
    } else if (windSpeed > 20) {
      return selectRandomMessage('danger', 'wind');
    } else {
      return selectRandomMessage('danger', 'seas');
    }
  }
  
  // MODERATE CONDITIONS (BLUE)
  // Wind speed 11–20 kt OR seas 2–3 ft OR weather is cloudy but not stormy
  if (windSpeed >= 11 && windSpeed <= 20) {
    return selectRandomMessage('moderate', 'windy');
  }
  
  if (seasHeight >= 2 && seasHeight <= 3) {
    return selectRandomMessage('moderate', 'choppy');
  }
  
  if (text.includes('cloudy') || text.includes('overcast') || text.includes('partly')) {
    return selectRandomMessage('moderate', 'cloudy');
  }
  
  // GOOD CONDITIONS (GREEN)
  // Wind speed <= 10 kt, seas <= 2 ft, weather is clear or partly cloudy
  return selectRandomMessage('good', 'perfect');
}

function selectRandomMessage(category, subtype) {
  const messages = {
    danger: {
      advisory: [
        { icon: '🚨', text: 'Red Alert: Seas Are Angry!', color: 'red', bold: true },
        { icon: '⚓', text: 'Rough Day, Keep it Tied!', color: 'red', bold: true },
        { icon: '🌪️', text: 'Gale Force, Anchor Down!', color: 'red', bold: true }
      ],
      storm: [
        { icon: '⚡', text: "Storm's Brewing, Stay Ashore!", color: 'red', bold: true },
        { icon: '🌀', text: "Hold Fast, It's a Wild Ride!", color: 'red', bold: true }
      ],
      rain: [
        { icon: '🌧️', text: 'Rain and Waves, Take a Break!', color: 'red', bold: true },
        { icon: '🌊', text: 'Churning Waters, Stay Safe!', color: 'red', bold: true }
      ],
      fog: [
        { icon: '🌫️', text: 'Fog and Fury, Best Stay Put!', color: 'red', bold: true }
      ],
      wind: [
        { icon: '💨', text: 'IS GONNA BLOW! Batten Down!', color: 'red', bold: true },
        { icon: '🌪️', text: 'Gale Force, Anchor Down!', color: 'red', bold: true }
      ],
      seas: [
        { icon: '🌊', text: 'LOTTA CHOP: Rough Seas Ahead!', color: 'red', bold: true },
        { icon: '🌊', text: 'Churning Waters, Stay Safe!', color: 'red', bold: true }
      ],
      both: [
        { icon: '🌀', text: "Hold Fast, It's a Wild Ride!", color: 'red', bold: true },
        { icon: '🚨', text: 'Red Alert: Seas Are Angry!', color: 'red', bold: true }
      ]
    },
    moderate: {
      windy: [
        { icon: '💨', text: 'Breezy but Doable, Sailor!', color: 'blue', bold: false },
        { icon: '🌬️', text: "Wind's Kicking, Hold Tight!", color: 'blue', bold: false },
        { icon: '🌀', text: 'Swirling Winds, Keep it Cool!', color: 'blue', bold: false },
        { icon: '🌪️', text: 'Bit Gusty, Trim Those Sails!', color: 'blue', bold: false },
        { icon: '🐳', text: 'Whale of a Breeze Out There!', color: 'blue', bold: false }
      ],
      choppy: [
        { icon: '🌊', text: 'Bit of a Chop, Stay Steady!', color: 'blue', bold: false },
        { icon: '⛵', text: 'Sails Up, Guts Up!', color: 'blue', bold: false },
        { icon: '⚓', text: 'Ride the Waves, Skipper!', color: 'blue', bold: false },
        { icon: '🚢', text: 'Steady as She Goes!', color: 'blue', bold: false }
      ],
      cloudy: [
        { icon: '🌥️', text: 'Clouds Above, Adventure Ahead!', color: 'blue', bold: false },
        { icon: '⛵', text: 'Sails Up, Guts Up!', color: 'blue', bold: false }
      ]
    },
    good: {
      perfect: [
        { icon: '⛵', text: "She's a Beaut, Captain!", color: 'green', bold: false },
        { icon: '🌞', text: "Sun's Out, Sails Up!", color: 'green', bold: false },
        { icon: '🐬', text: 'Dolphin-Approved Boating Day!', color: 'green', bold: false },
        { icon: '🌴', text: 'Smooth as a Tropical Breeze!', color: 'green', bold: false },
        { icon: '⚓', text: 'Drop Anchor, Enjoy the Calm!', color: 'green', bold: false },
        { icon: '🌊', text: 'Glass Seas, Full Speed!', color: 'green', bold: false },
        { icon: '😎', text: 'Perfect Day to Cruise!', color: 'green', bold: false },
        { icon: '🐠', text: "Fish Are Jumpin', Seas Are Flat!", color: 'green', bold: false },
        { icon: '🌤️', text: 'Clear Skies, Clear Vibes!', color: 'green', bold: false },
        { icon: '🚤', text: 'Prime Time for a Joyride!', color: 'green', bold: false }
      ]
    }
  };
  
  const categoryMessages = messages[category][subtype] || messages[category]['perfect'] || messages.good.perfect;
  const randomIndex = Math.floor(Math.random() * categoryMessages.length);
  const selected = categoryMessages[randomIndex];
  
  return {
    type: category,
    icon: selected.icon,
    text: selected.text,
    color: selected.color,
    bold: selected.bold
  };
}

// Helper functions for numeric extraction
function extractNumericValue(text) {
  if (!text) return 0;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function extractWindSpeed(winds) {
  if (!winds) return 0;
  // Look for highest number in wind description (handles "5 to 10 kt", "gusts up to 20 kt")
  const numbers = winds.match(/(\d+)/g);
  if (!numbers) return 0;
  return Math.max(...numbers.map(n => parseInt(n)));
}

function extractWavePeriod(waveDetail) {
  if (!waveDetail) return 0;
  // Look for "at X seconds" pattern
  const match = waveDetail.match(/at\s+(\d+(?:\.\d+)?)\s*(?:seconds?|s)/i);
  return match ? parseFloat(match[1]) : 0;
}
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
          description: 'SW winds 5 to 10 kt, becoming NW after midnight. Seas 1 ft or less.'
        },
        {
          date: new Date().toISOString(),
          period: 'TOMORROW',
          winds: 'NE around 5 kt',
          seas: '1 ft or less',
          waveDetail: '',
          thunderstorms: 'Slight chance of tstms in the afternoon',
          visibility: '',
          description: 'NE winds around 5 kt, becoming SE in the afternoon. Seas 1 ft or less. Slight chance of showers and tstms in the afternoon.'
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
  // NOAA format: "SW winds 5 to 10 kt" or "NE winds around 5 kt"
  const windMatch = text.match(/([NSEW]{1,2})\s+winds?\s+([^.,]*(?:kt|knots?|mph|kts)[^.,]*)/i);
  return windMatch ? `${windMatch[1]} ${windMatch[2].trim()}` : '';
}

function extractSeas(text) {
  // NOAA format: "Seas 1 ft or less" or "Seas around 2 ft"
  const seasMatch = text.match(/seas?\s+([^.,]*(?:ft|feet|foot)[^.,]*)/i);
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
  // NOAA format: "vsby 1 to 3 nm" or "Vsby 1 to 3 nm"
  const visMatch = text.match(/vsby\s+([^.,]*(?:nm|miles?)[^.,]*)/i);
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
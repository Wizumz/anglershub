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

    // Construct NOAA marine forecast URL
    const noaaUrl = `https://forecast.weather.gov/shmrn.php?mz=${mz.toLowerCase()}${syn ? `&syn=${syn.toLowerCase()}` : ''}`;
    
    console.log('Fetching from NOAA:', noaaUrl);

    // Fetch the marine forecast page
    const html = await fetchUrl(noaaUrl);
    
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
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
      
    }).on('error', (err) => {
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

    // Extract synopsis - try multiple patterns
    const synopsisPatterns = [
      /<div[^>]*synopsis[^>]*>(.*?)<\/div>/is,
      /<p[^>]*synopsis[^>]*>(.*?)<\/p>/is,
      /<td[^>]*synopsis[^>]*>(.*?)<\/td>/is,
      /SYNOPSIS[:\s]*(.*?)(?:<br|<p|$)/is
    ];

    for (const pattern of synopsisPatterns) {
      const match = html.match(pattern);
      if (match) {
        synopsis = match[1].replace(/<[^>]*>/g, '').trim();
        console.log('Found synopsis with pattern:', pattern.source);
        break;
      }
    }

    // Updated parsing for NOAA's actual structure
    // Look for the forecast content in the pre-formatted div
    const preFormatDiv = html.match(/<div[^>]*white-space:\s*pre-wrap[^>]*>(.*?)<\/div>/is);
    
    if (preFormatDiv) {
      const forecastContent = preFormatDiv[1];
      console.log('Found forecast content div');
      
      // Pattern for NOAA periods: <strong><font...>PERIOD</font></strong> followed by text
      const periodPattern = /<strong><font[^>]*>(.*?)<\/font><\/strong>\s*(.*?)(?=<strong><font|$)/gs;
      
      let match;
      while ((match = periodPattern.exec(forecastContent)) !== null) {
        const period = match[1].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
        const forecastText = match[2].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
        
        if (period.length > 0 && forecastText.length > 0) {
          console.log(`Found forecast: ${period} -> ${forecastText.substring(0, 100)}...`);
          
          // Parse forecast components
          const winds = extractWinds(forecastText);
          const seas = extractSeas(forecastText);
          const waveDetail = extractWaveDetail(forecastText);
          const thunderstorms = extractThunderstorms(forecastText);
          const visibility = extractVisibility(forecastText);
          const description = extractWeatherDescription(forecastText);

          forecasts.push({
            date: new Date().toISOString(),
            period,
            winds,
            seas,
            waveDetail,
            thunderstorms,
            visibility,
            description: description || forecastText.substring(0, 200)
          });
        }
      }
    }

    // If no forecasts found with pre-formatted div, try fallback patterns
    if (forecasts.length === 0) {
      console.log('No forecasts found in pre-formatted div, trying fallback patterns...');
      
      // More comprehensive forecast extraction
      const forecastPatterns = [
        // Pattern 1: Strong font tags (NOAA format)
        /<strong><font[^>]*>([^<]*)<\/font><\/strong>\s*(.*?)(?=<strong>|$)/gs,
        // Pattern 2: Bold period headers
        /<b[^>]*>([^<]*(?:tonight|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)[^<]*)<\/b>\s*[:\-\s]*([^<]*(?:<br[^>]*>[^<]*)*)/gi,
        // Pattern 3: Table-based structure
        /<td[^>]*>([^<]*(?:tonight|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^<]*)<\/td>\s*<td[^>]*>([^<]*)<\/td>/gi
      ];

      let foundForecasts = false;
      
      for (let patternIndex = 0; patternIndex < forecastPatterns.length && !foundForecasts; patternIndex++) {
        const pattern = forecastPatterns[patternIndex];
        console.log(`Trying forecast pattern ${patternIndex + 1}...`);
        
        let match;
        while ((match = pattern.exec(html)) !== null) {
          const period = match[1].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
          let forecastText = match[2].replace(/<br[^>]*>/gi, ' ').replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
          
          if (period.length > 0 && forecastText.length > 0) {
            console.log(`Found forecast: ${period} -> ${forecastText.substring(0, 100)}...`);
            
            // Parse forecast components
            const winds = extractWinds(forecastText);
            const seas = extractSeas(forecastText);
            const waveDetail = extractWaveDetail(forecastText);
            const thunderstorms = extractThunderstorms(forecastText);
            const visibility = extractVisibility(forecastText);
            const description = extractWeatherDescription(forecastText);

            forecasts.push({
              date: new Date().toISOString(),
              period,
              winds,
              seas,
              waveDetail,
              thunderstorms,
              visibility,
              description: description || forecastText.substring(0, 100) + '...'
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

function extractWeatherDescription(text) {
  // Look for weather conditions like "showers", "clear", etc.
  const weatherTerms = ['showers', 'clear', 'cloudy', 'overcast', 'rain', 'fog', 'mist', 'partly', 'scattered', 'chance'];
  for (const term of weatherTerms) {
    if (text.toLowerCase().includes(term)) {
      const match = text.match(new RegExp(`([^.,]*${term}[^.,]*)`, 'i'));
      if (match) {
        return match[1].trim();
      }
    }
  }
  return '';
}
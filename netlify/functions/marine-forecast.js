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

    // More comprehensive forecast extraction
    // Try different patterns for marine forecasts
    const forecastPatterns = [
      // Pattern 1: Bold period headers
      /<b[^>]*>([^<]*(?:tonight|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^<]*)<\/b>\s*[:\-\s]*([^<]*(?:<br[^>]*>[^<]*)*)/gi,
      // Pattern 2: Table-based structure
      /<td[^>]*>([^<]*(?:tonight|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^<]*)<\/td>\s*<td[^>]*>([^<]*)<\/td>/gi,
      // Pattern 3: Paragraph-based
      /<p[^>]*>([^<]*(?:tonight|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^<]*)[:\-\s]*([^<]*)<\/p>/gi
    ];

    let foundForecasts = false;
    
    for (let patternIndex = 0; patternIndex < forecastPatterns.length && !foundForecasts; patternIndex++) {
      const pattern = forecastPatterns[patternIndex];
      console.log(`Trying forecast pattern ${patternIndex + 1}...`);
      
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const period = match[1].trim();
        let forecastText = match[2].replace(/<br[^>]*>/gi, ' ').replace(/<[^>]*>/g, '').trim();
        
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

    // If no forecasts found, try a fallback approach
    if (forecasts.length === 0) {
      console.log('No forecasts found with standard patterns, trying fallback...');
      
      // Look for any text containing weather-related terms
      const weatherKeywords = ['wind', 'seas', 'wave', 'knot', 'mph', 'ft', 'visibility'];
      const lines = html.split(/\n|<br[^>]*>|<\/p>|<\/div>/);
      
      for (const line of lines) {
        const cleanLine = line.replace(/<[^>]*>/g, '').trim();
        const hasWeatherKeyword = weatherKeywords.some(keyword => 
          cleanLine.toLowerCase().includes(keyword)
        );
        
        if (hasWeatherKeyword && cleanLine.length > 20) {
          console.log('Found potential forecast line:', cleanLine.substring(0, 100));
          
          forecasts.push({
            date: new Date().toISOString(),
            period: 'Forecast Period',
            winds: extractWinds(cleanLine),
            seas: extractSeas(cleanLine),
            waveDetail: extractWaveDetail(cleanLine),
            thunderstorms: extractThunderstorms(cleanLine),
            visibility: extractVisibility(cleanLine),
            description: cleanLine.substring(0, 200)
          });
          
          if (forecasts.length >= 3) break; // Limit fallback results
        }
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
  const windMatch = text.match(/winds?\s+([^.]*(?:kt|knots?|mph|kts)[^.]*)/i);
  return windMatch ? windMatch[1].trim() : '';
}

function extractSeas(text) {
  const seasMatch = text.match(/seas?\s+([^.]*(?:ft|feet|foot)[^.]*)/i);
  return seasMatch ? seasMatch[1].trim() : '';
}

function extractWaveDetail(text) {
  const waveMatch = text.match(/(?:swell|waves?|period)\s+([^.]*(?:seconds?|ft|feet)[^.]*)/i);
  return waveMatch ? waveMatch[1].trim() : '';
}

function extractThunderstorms(text) {
  const stormMatch = text.match(/(thunderstorms?[^.]*)/i);
  return stormMatch ? stormMatch[1].trim() : '';
}

function extractVisibility(text) {
  const visMatch = text.match(/visibility\s+([^.]*(?:miles?|nm)[^.]*)/i);
  return visMatch ? visMatch[1].trim() : '';
}

function extractWeatherDescription(text) {
  const weatherTerms = ['sunny', 'clear', 'cloudy', 'overcast', 'rain', 'fog', 'mist', 'partly'];
  for (const term of weatherTerms) {
    if (text.toLowerCase().includes(term)) {
      const match = text.match(new RegExp(`([^.]*${term}[^.]*(?:cloud|weather|condition)?[^.]*)`, 'i'));
      if (match) {
        return match[1].trim();
      }
    }
  }
  return '';
}
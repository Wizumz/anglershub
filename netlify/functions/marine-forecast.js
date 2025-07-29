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
    
    // Parse the marine forecast data
    const forecastData = parseMarineForecast(html);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        zone: mz.toUpperCase(),
        synopsis: forecastData.synopsis,
        forecasts: forecastData.forecasts,
        sourceUrl: noaaUrl,
        timestamp: new Date().toISOString()
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
    // Extract synopsis (usually in a div with class 'synopsis' or similar)
    const synopsisMatch = html.match(/<div[^>]*synopsis[^>]*>(.*?)<\/div>/is);
    if (synopsisMatch) {
      synopsis = synopsisMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    // Extract forecast periods
    // NOAA marine forecasts typically have period headers followed by forecast text
    const periodRegex = /<b[^>]*>([^<]+(?:tonight|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^<]*)<\/b>\s*[:\-\s]*([^<]*(?:<br[^>]*>[^<]*)*)/gi;
    
    let match;
    while ((match = periodRegex.exec(html)) !== null) {
      const period = match[1].trim();
      let forecastText = match[2].replace(/<br[^>]*>/gi, ' ').replace(/<[^>]*>/g, '').trim();
      
      // Parse forecast components
      const winds = extractWinds(forecastText);
      const seas = extractSeas(forecastText);
      const waveDetail = extractWaveDetail(forecastText);
      const thunderstorms = extractThunderstorms(forecastText);
      const visibility = extractVisibility(forecastText);
      const description = extractWeatherDescription(forecastText);

      forecasts.push({
        date: new Date().toISOString(), // Could be improved with actual date parsing
        period,
        winds,
        seas,
        waveDetail,
        thunderstorms,
        visibility,
        description: description || forecastText.substring(0, 100) + '...'
      });
    }

  } catch (error) {
    console.error('Error parsing forecast:', error);
  }

  return { synopsis, forecasts };
}

// Helper functions to extract specific forecast components
function extractWinds(text) {
  const windMatch = text.match(/winds?\s+([^.]*(?:kt|knots|mph)[^.]*)/i);
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
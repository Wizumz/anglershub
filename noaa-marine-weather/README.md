# NOAA Marine Weather Terminal

A modern web application that displays NOAA Marine Weather forecasts with a retro terminal-style interface. Built with Next.js, TypeScript, and Chart.js.

![Terminal Style Interface](https://img.shields.io/badge/interface-terminal--style-green)
![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Chart.js](https://img.shields.io/badge/Chart.js-4.0-orange)

## Features

- 🌊 **Real-time Marine Forecasts**: Official NOAA weather data for marine zones
- 📊 **Interactive Charts**: Visualize temperature, wind speed, and wave height data
- 🖥️ **Terminal Interface**: Retro monospace styling with dark theme
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🗺️ **Zone Selection**: Choose from popular marine zones across the US
- 📅 **Date Selection**: View forecasts for today + next 6 days
- ⚡ **Fast Loading**: Optimized Next.js build with static generation

## Screenshot

The application features a dark terminal-style interface with:
- Green text on black background
- Monospace fonts (JetBrains Mono)
- High contrast colors for accessibility
- Glitch effects and terminal-style prompts
- Clean data visualization with Chart.js

## Marine Zones Included

The application includes popular marine zones such as:
- **ANZ335** - Boston Harbor and Massachusetts Bay
- **ANZ338** - Cape Cod Bay
- **ANZ230** - Long Island Sound
- **AMZ350** - Delaware Bay
- **AMZ354** - Chesapeake Bay
- **GMZ876** - Tampa Bay
- **PMZ153** - San Francisco Bay
- **PMZ156** - Monterey Bay

## Technology Stack

- **Frontend**: Next.js 15 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom terminal theme
- **Charts**: Chart.js with react-chartjs-2
- **Date Handling**: date-fns
- **Data Source**: NOAA Weather Service API

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd noaa-marine-weather
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build

```bash
npm run build
npm run start
```

## API Endpoints

### `/api/marine-zones`
Returns available marine zones for selection.

**Response:**
```json
{
  "success": true,
  "zones": [
    {
      "zone_code": "ANZ335",
      "location_name": "Boston Harbor and Massachusetts Bay",
      "synopsis_zone": "ANZ300"
    }
  ],
  "total": 8
}
```

### `/api/forecast?zone={ZONE_CODE}&date={DATE}`
Returns weather forecast for specified zone and date.

**Parameters:**
- `zone`: Marine zone code (e.g., ANZ335)
- `date`: Start date in YYYY-MM-DD format (optional)

**Response:**
```json
{
  "success": true,
  "zone": "ANZ335",
  "forecasts": [
    {
      "date": "2024-01-01T06:00:00.000Z",
      "temperature": 72,
      "windSpeed": 12,
      "windDirection": "SW",
      "waveHeight": 2.5,
      "description": "Partly Cloudy",
      "detailedForecast": "Marine conditions for ANZ335..."
    }
  ],
  "total": 8
}
```

## Data Processing

The application processes NOAA weather data by:

1. **Fetching Official Data**: Uses the NOAA Weather Service API
2. **Parsing Marine Forecasts**: Extracts wind, wave, and temperature data
3. **Text Analysis**: Uses regex to extract specific marine conditions
4. **Fallback Data**: Provides sample data if NOAA API is unavailable
5. **Caching**: Optimizes API calls for better performance

## Marine Zone Scraper

Included is a Python script (`marine_zones_scraper.py`) that can be used to fetch the complete list of marine zones from NOAA:

```python
python marine_zones_scraper.py
```

This script will:
- Download the latest NOAA marine zone data
- Parse zone codes and location names
- Output a CSV file with all marine zones
- Filter for marine-specific zone prefixes (ANZ, AMZ, GMZ, PMZ, OZ, HZ)

## Customization

### Terminal Theme Colors

Edit `tailwind.config.js` to customize the terminal color scheme:

```javascript
colors: {
  'terminal': {
    'bg': '#0a0a0a',        // Background
    'fg': '#00ff00',        // Primary text (green)
    'accent': '#00ffff',    // Accent color (cyan)
    'warning': '#ffff00',   // Warning color (yellow)
    'error': '#ff0000',     // Error color (red)
    'muted': '#808080',     // Muted text (gray)
    'border': '#333333'     // Border color
  }
}
```

### Adding More Marine Zones

To add more zones, update the `sampleZones` array in `/api/marine-zones/route.ts` or implement the full NOAA zones API integration.

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── forecast/route.ts      # Weather forecast API
│   │   └── marine-zones/route.ts  # Marine zones API
│   ├── globals.css                # Terminal styling
│   └── page.tsx                   # Main application
├── components/
│   ├── DateSelector.tsx           # Date selection component
│   ├── ForecastDisplay.tsx        # Detailed forecast display
│   ├── LocationSelector.tsx       # Zone selection component
│   └── WeatherChart.tsx          # Chart.js visualization
└── marine_zones_scraper.py        # Python zone scraper
```

### Environment Variables

No environment variables are required for basic functionality. For production, consider adding:

- `NOAA_API_KEY`: If NOAA requires API authentication
- `NEXT_PUBLIC_APP_URL`: For proper URL generation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Data Attribution

Weather data provided by the National Weather Service (NOAA). This application is not affiliated with NOAA and is for educational/personal use only.

## Future Enhancements

- 🌊 Tide data integration
- 🎣 Fishing conditions and recommendations
- 🚤 Boating safety alerts
- 📍 GPS location-based zone detection
- 💾 Favorite zones and offline caching
- 📧 Email/SMS forecast alerts
- 🌍 International marine weather support

---

Built with ❤️ for mariners and weather enthusiasts

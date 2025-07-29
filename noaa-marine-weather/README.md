# NOAA Marine Weather Terminal

A modern web application that displays NOAA Marine Weather forecasts with a retro terminal-style interface. Built with Next.js, TypeScript, and Chart.js.

![Terminal Style Interface](https://img.shields.io/badge/interface-terminal--style-green)
![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Chart.js](https://img.shields.io/badge/Chart.js-4.0-orange)

## 🚀 Live Demo

**[View Live Application on GitHub Pages](https://yourusername.github.io/noaa-marine-weather/)**

*Note: Replace 'yourusername' with your actual GitHub username after deployment*

## Features

- 🌊 **Real-time Marine Forecasts**: Official NOAA weather data for marine zones
- 📊 **Interactive Charts**: Visualize temperature, wind speed, and wave height data
- 🖥️ **Terminal Interface**: Retro monospace styling with dark theme
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🗺️ **Zone Selection**: Choose from popular marine zones across the US
- 📅 **Date Selection**: View forecasts for today + next 6 days
- ⚡ **Fast Loading**: Optimized Next.js build with static generation
- 🔄 **Auto-Deploy**: GitHub Actions automatically deploys to GitHub Pages

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
- **Deployment**: GitHub Pages with GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager
- Git for version control

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/noaa-marine-weather.git
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

## 🚀 Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Fork or Clone** this repository to your GitHub account

2. **Enable GitHub Pages** in your repository:
   - Go to Repository Settings → Pages
   - Source: "GitHub Actions"
   - The workflow will automatically deploy on push to main branch

3. **Update Repository Name** (if different):
   - Edit `next.config.ts` and update the `basePath` and `assetPrefix` to match your repository name
   - Update the demo link in this README

4. **Push Changes**:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

5. **Access Your Site**:
   - Your site will be available at: `https://yourusername.github.io/repository-name/`
   - Check the Actions tab for deployment status

### GitHub Actions Workflow

The deployment workflow (`.github/workflows/deploy.yml`) automatically:
- Builds the Next.js application for static export
- Uploads the build artifacts to GitHub Pages
- Deploys the site on every push to the main branch

## API Integration

### NOAA Weather Service API

The application attempts to fetch real-time data from the NOAA Weather Service API:
- **Endpoint**: `https://api.weather.gov/zones/forecast/{ZONE_CODE}/forecast`
- **Fallback**: Sample data is used when the API is unavailable or blocked by CORS
- **Note**: Browser CORS policies may prevent direct API access; consider using a proxy for production

### Data Processing

The application processes NOAA weather data by:

1. **Fetching Official Data**: Uses the NOAA Weather Service API
2. **Parsing Marine Forecasts**: Extracts wind, wave, and temperature data
3. **Text Analysis**: Uses regex to extract specific marine conditions
4. **Fallback Data**: Provides sample data if NOAA API is unavailable
5. **Client-Side Processing**: All data processing happens in the browser for GitHub Pages compatibility

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

To add more zones, update the `MARINE_ZONES` array in `src/app/page.tsx` or implement dynamic zone loading.

## Development

### Project Structure

```
src/
├── app/
│   ├── globals.css                # Terminal styling
│   ├── layout.tsx                 # App layout
│   └── page.tsx                   # Main application
├── components/
│   ├── DateSelector.tsx           # Date selection component
│   ├── ForecastDisplay.tsx        # Detailed forecast display
│   ├── LocationSelector.tsx       # Zone selection component
│   └── WeatherChart.tsx          # Chart.js visualization
├── .github/workflows/
│   └── deploy.yml                 # GitHub Pages deployment
├── out/                           # Static export output
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

## Troubleshooting

### Common Issues

1. **CORS Errors**: The NOAA API may be blocked by browser CORS policies. The app will automatically fall back to sample data.

2. **GitHub Pages 404**: Ensure the repository name in `next.config.ts` matches your actual repository name.

3. **Build Failures**: Check that all dependencies are properly installed and Node.js version is 18+.

4. **Styling Issues**: Verify that Tailwind CSS is properly configured and the custom color scheme is loaded.

## Future Enhancements

- 🌊 Tide data integration
- 🎣 Fishing conditions and recommendations
- 🚤 Boating safety alerts
- 📍 GPS location-based zone detection
- 💾 Favorite zones and offline caching
- 📧 Email/SMS forecast alerts
- 🌍 International marine weather support
- 🔐 CORS proxy for direct NOAA API access

---

Built with ❤️ for mariners and weather enthusiasts

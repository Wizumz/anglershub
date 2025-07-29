# 🚀 Deploy AnglersHub with Real NOAA Data

This guide shows how to deploy the marine weather app to **Netlify** with **real-time NOAA marine forecast data**.

## 🌊 Why Netlify?

- **Serverless Functions**: Handle CORS restrictions and fetch real NOAA data
- **Easy GitHub Integration**: Automatic deployments from your repository
- **Free Tier**: Perfect for personal marine weather apps
- **Global CDN**: Fast loading worldwide

## 📋 Quick Deploy Steps

### 1. **Prepare Your Repository**

Make sure your code includes:
- ✅ `netlify/functions/marine-forecast.js` - Serverless function
- ✅ `netlify.toml` - Netlify configuration
- ✅ Updated `src/app/page.tsx` - API integration

### 2. **Deploy to Netlify**

**Option A: One-Click Deploy**
1. Fork this repository to your GitHub account
2. Go to [netlify.com](https://netlify.com) and sign up/login
3. Click "New site from Git"
4. Connect your GitHub account
5. Select your forked repository
6. Build settings should auto-detect:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
7. Click "Deploy site"

**Option B: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from your project directory
netlify deploy --prod
```

### 3. **Configure Environment (Optional)**

For additional customization:
```bash
# In Netlify dashboard > Site settings > Environment variables
NOAA_API_TIMEOUT=10000
NODE_ENV=production
```

## 🔧 How Real Data Works

### **Serverless Function Flow**
1. **Frontend** requests: `/api/marine-forecast?mz=anz335&syn=anz300`
2. **Netlify Function** fetches: `https://forecast.weather.gov/shmrn.php?mz=anz335&syn=anz300`
3. **HTML Parsing** extracts: Synopsis, Winds, Seas, Weather conditions
4. **JSON Response** returns structured marine forecast data

### **Data Parsing Features**
- ✅ **Synopsis extraction** from NOAA marine pages
- ✅ **Wind conditions** (speed, direction, gusts)
- ✅ **Sea conditions** (wave height, period)
- ✅ **Weather descriptions** with icon matching
- ✅ **Thunderstorm alerts** in red
- ✅ **Visibility conditions**
- ✅ **Wave detail** (swell information)

## 🌐 Live Demo URLs

After deployment, your site will be available at:
- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: Configure in Netlify dashboard

## 🛠️ Local Development

To test locally with real data:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run local development with functions
netlify dev

# Your app will be available at http://localhost:8888
# Functions available at http://localhost:8888/api/marine-forecast
```

## 📊 API Endpoints

### **Get Marine Forecast**
```
GET /api/marine-forecast?mz=ANZ335&syn=ANZ300
```

**Parameters:**
- `mz` (required): Marine zone code (e.g., ANZ335, AMZ330)
- `syn` (optional): Synopsis zone code (e.g., ANZ300, AMZ300)

**Response:**
```json
{
  "zone": "ANZ335",
  "synopsis": "HIGH PRESSURE RIDGE OVER THE WATERS...",
  "forecasts": [
    {
      "period": "Tonight",
      "winds": "N winds 10 to 15 kt",
      "seas": "2 to 3 ft",
      "waveDetail": "Dominant period 6 seconds",
      "thunderstorms": "Thunderstorms likely after 2 PM",
      "visibility": "Greater than 6 miles",
      "description": "Partly cloudy"
    }
  ],
  "sourceUrl": "https://forecast.weather.gov/shmrn.php?mz=anz335&syn=anz300",
  "timestamp": "2024-01-29T18:30:00.000Z"
}
```

## 🔍 Troubleshooting

### **Functions Not Working**
- Check Netlify function logs in dashboard
- Verify `netlify.toml` configuration
- Ensure function file is in `netlify/functions/`

### **NOAA Data Issues**
- NOAA occasionally changes HTML structure
- Function includes error handling and fallbacks
- Check NOAA source URLs are still valid

### **Build Failures**
- Verify Node.js version (18+ recommended)
- Check package.json dependencies
- Review build logs in Netlify dashboard

## 🚀 Next Steps

1. **Custom Domain**: Add your own domain in Netlify
2. **Analytics**: Add visitor tracking
3. **Alerts**: Set up email notifications for marine warnings
4. **PWA**: Make it installable on mobile devices
5. **Caching**: Optimize API responses

## 💡 Cost Estimate

**Netlify Free Tier includes:**
- 100GB bandwidth/month
- 125,000 serverless function invocations/month
- This is plenty for personal marine weather usage!

---

🌊 **Happy sailing with real-time marine forecasts!** ⛵
# Facebook Ads Campaign Analyzer - Browser Extension

A powerful Chrome/Edge browser extension that automatically scrapes Facebook Ads Library data and visualizes campaign timelines with interactive analytics.

## Features

- 🤖 **Auto-Scroll & Scrape**: Automatically scrolls through Facebook Ads Library and extracts all ad data
- 📊 **Timeline Visualization**: Interactive Gantt-style chart showing campaign durations
- 🎯 **Top Ads Analysis**: View top 5 longest-running ads for each campaign URL
- 🔍 **Smart Filtering**: Sort by start date, duration, or ad count
- 🏢 **Domain Grouping**: Group campaigns by domain for better organization
- 📈 **Color-Coded Insights**: Visual indicators based on ad volume (1-4 ads → 100+ ads)
- 💾 **Ad Copy Extraction**: Full ad text captured for analysis

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the extension files** to a folder on your computer:
   ```
   fb-ads-analyzer/
   ├── manifest.json
   ├── content.js
   ├── injected.js
   ├── popup.html
   ├── popup.js
   ├── icon16.png
   ├── icon48.png
   └── icon128.png
   ```

2. **Create placeholder icons** (or use your own):
   - Create three PNG files: `icon16.png`, `icon48.png`, `icon128.png`
   - You can use any icon generator or create simple colored squares

3. **Open Chrome/Edge Extensions page**:
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

4. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

5. **Load the extension**:
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

### Method 2: Create Icons Programmatically

If you don't have icons, you can create simple ones using this HTML file:

```html
<!DOCTYPE html>
<html>
<body>
<canvas id="canvas"></canvas>
<script>
function createIcon(size) {
  const canvas = document.getElementById('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#2563eb');
  gradient.addColorStop(1, '#9333ea');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📊', size/2, size/2);
  
  // Download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon${size}.png`;
    a.click();
  });
}

// Generate all three sizes
createIcon(16);
setTimeout(() => createIcon(48), 100);
setTimeout(() => createIcon(128), 200);
</script>
</body>
</html>
```

Save this as `icon-generator.html`, open it in a browser, and it will download the three required icon files.

## Usage

### Step 1: Navigate to Facebook Ads Library
1. Go to [Facebook Ads Library](https://www.facebook.com/ads/library/)
2. Search for ads (by advertiser, keyword, etc.)
3. Make sure some ads are loaded on the page

### Step 2: Start Analysis
1. Click the extension icon in your browser toolbar
2. The popup will open showing the analyzer interface
3. Click **"🚀 Start Analysis"** button

### Step 3: Wait for Auto-Scroll
- The extension will automatically scroll through all available ads
- Progress is shown in the status bar
- This typically takes 30-120 seconds depending on the number of ads

### Step 4: View Results
- Once complete, the timeline visualization appears automatically
- Use sorting and grouping options to analyze the data
- Click any campaign bar to view top performing ads

## Interface Features

### Main Controls

**Sort Options:**
- **Start Date**: Chronological order by campaign start date
- **Duration**: Longest-running campaigns first
- **# of Ads**: Most ads per URL first

**View Options:**
- **Group by Domain**: Organize campaigns by website domain
- Toggle this to see domain-level insights

### Color Legend

| Color | Ad Count |
|-------|----------|
| 🟣 Purple | 1-4 ads |
| 🔵 Blue | 5-9 ads |
| 🟢 Green | 10-19 ads |
| 🟡 Yellow | 20-49 ads |
| 🟠 Orange | 50-99 ads |
| 🔴 Red | 100+ ads |

### Campaign Details Modal

Click any campaign bar to see:
- **Full URL**
- **Date range** (first advertised → last advertised)
- **Total duration** and **ad count**
- **Top 5 longest-running ads** with:
  - Library ID (clickable link to view on Facebook)
  - Duration in days
  - Complete ad copy text

## How It Works

### 1. Auto-Scrolling
The extension injects JavaScript into the Facebook page that:
- Scrolls down incrementally (600px per step)
- Waits 400ms between scrolls to allow content to load
- Monitors for new content (up to 20 idle cycles)
- Scrolls to absolute bottom when complete

### 2. Data Extraction
After scrolling, the scraper:
- Finds all elements containing "Library ID"
- Extracts date ranges (handles both "Started running" and date ranges)
- Captures ad copy from the appropriate container
- Extracts all destination URLs (unwraps Facebook redirects)
- Removes tracking parameters and duplicate URLs

### 3. Campaign Aggregation
Data is processed to:
- Group ads by destination URL
- Calculate campaign duration (first → last advertised date)
- Count total ads per URL
- Identify top 5 longest-running unique ad copies
- Sort campaigns chronologically

### 4. Visualization
The timeline chart:
- Shows all campaigns on a time-scaled Gantt chart
- Color-codes by ad volume
- Allows interactive sorting and grouping
- Displays detailed breakdowns on click

## Technical Details

### Architecture

```
┌─────────────────┐
│   popup.html    │ ← User Interface
│   popup.js      │ ← Visualization Logic
└────────┬────────┘
         │
         │ chrome.runtime.sendMessage()
         ↓
┌─────────────────┐
│   content.js    │ ← Bridge Script (injects injected.js)
└────────┬────────┘
         │
         │ Loads external script
         ↓
┌─────────────────┐
│  injected.js    │ ← Scraper Code (runs in page context)
│  (Facebook DOM) │    (autoScroller + adsAnalyzer)
└─────────────────┘
```

### Key Technologies
- **Manifest V3**: Latest Chrome extension standard
- **Content Scripts**: Isolated execution context
- **External Script Injection**: CSP-compliant method (injected.js)
- **Web Accessible Resources**: Allows page context access
- **Message Passing**: Communication between contexts
- **Vanilla JavaScript**: No external dependencies

### Data Flow

1. User clicks extension → Opens popup
2. Popup sends message to content script
3. Content script injects injected.js into page (CSP-compliant)
4. injected.js runs autoScroller, then adsAnalyzer
5. Results sent back via postMessage → content script → popup
6. Popup renders visualization

## Troubleshooting

### "Please open Facebook Ads Library" error
- Make sure you're on `facebook.com/ads/library`
- Refresh the page and try again

### Extension doesn't appear after installation
- Check that Developer Mode is enabled
- Look for error messages in `chrome://extensions/`
- Ensure all files are in the same folder

### No data collected after scrolling
- Ensure ads are visible on the page before starting
- Try searching for a specific advertiser first
- Check browser console (F12) for error messages

### Scraping stops early
- The page may have rate limits
- Try refreshing and starting again
- Some advertisers have limited ad history

### Modal doesn't show ad details
- Some campaigns may not have top5 data if ads were filtered
- This is normal for URLs with very few ads

### CSP (Content Security Policy) errors
- Ensure you have the `injected.js` file in your extension folder
- Check that `web_accessible_resources` is properly configured in manifest.json
- This is already fixed in the current version using external script injection

## Privacy & Permissions

The extension requires:
- **activeTab**: To interact with the current Facebook tab
- **scripting**: To inject the scraper code
- **storage**: To save preferences (if implemented)

**No data is sent externally** - all processing happens locally in your browser.

## Development

### File Structure

```
manifest.json       # Extension configuration
content.js          # Content script (bridge)
injected.js         # Page context scraper
popup.html          # UI structure
popup.js            # UI logic & visualization
icon16.png          # Toolbar icon (16x16)
icon48.png          # Extensions page (48x48)
icon128.png         # Web store (128x128)
```

### Customization

**Adjust scroll speed:**
Edit in `injected.js`:
```javascript
const CONFIG = {
  scrollStep: 600,      // pixels per scroll
  scrollDelay: 400,     // ms between scrolls
  maxIdleCycles: 20     // stop after X cycles
};
```

**Modify color thresholds:**
Edit in `popup.js`:
```javascript
function getColor(ads) {
  if (ads >= 100) return '#ef4444';  // red
  if (ads >= 50) return '#f97316';   // orange
  // ... etc
}
```

## Known Limitations

- Only works on Facebook Ads Library pages
- Scraping speed limited by Facebook's content loading
- Cannot access ads behind login walls
- Date parsing relies on Facebook's current format
- Large datasets (1000+ ads) may take several minutes

## Future Enhancements

- [ ] Export data as CSV/JSON
- [ ] Search and filter within results
- [ ] Compare multiple scraping sessions
- [ ] Advanced analytics (spend estimates, targeting data)
- [ ] Save results to local storage
- [ ] Batch analysis for multiple advertisers

## Support

For issues, suggestions, or contributions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Ensure you're on the latest version of Chrome/Edge

## License

MIT License - Feel free to modify and distribute

## Credits

Created for competitive intelligence and market research purposes. Use responsibly and in accordance with Facebook's Terms of Service.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatible With**: Chrome 88+, Edge 88+
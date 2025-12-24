# Quick Installation Guide

## 📦 What You'll Need

1. All extension files in one folder:
   - `manifest.json`
   - `content.js`
   - `injected.js`
   - `popup.html`
   - `popup.js`
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
   - `README.md` (optional)

## 🎨 Step 1: Create Icons (if you don't have them)

1. Open `icon-generator.html` in any web browser
2. Click **"📥 Download All Icons"**
3. Three PNG files will download automatically
4. Move them to your extension folder

## 🔧 Step 2: Install Extension

### Chrome / Edge / Brave

1. Open extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`

2. **Enable Developer Mode** (toggle in top-right corner)

3. Click **"Load unpacked"**

4. Select your extension folder

5. Done! The extension icon should appear in your toolbar

## 🚀 Step 3: Use the Extension

1. Go to [Facebook Ads Library](https://www.facebook.com/ads/library/)
2. Search for an advertiser or keywords
3. Wait for ads to load
4. Click the extension icon in your toolbar
5. Click **"🚀 Start Analysis"**
6. Wait 30-120 seconds while it auto-scrolls and scrapes
7. View your timeline visualization!

## ⚡ Quick Tips

- **Best results**: Search for specific advertisers with many ads
- **Performance**: Extension works best with 50-500 ads loaded
- **Patience**: Large scrapes can take 2-3 minutes
- **Refresh**: If it fails, refresh Facebook and try again

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension not showing | Enable Developer Mode and reload |
| "Please navigate to Facebook" | Must be on facebook.com/ads/library |
| No data collected | Ensure ads are loaded before starting |
| Extension crashes | Reduce number of ads by filtering search |

## 📊 What Gets Scraped

- ✅ Campaign URLs (destination links)
- ✅ First & last advertised dates
- ✅ Campaign duration
- ✅ Total ad count per URL
- ✅ Top 5 longest-running ads per campaign
- ✅ Complete ad copy text
- ✅ Facebook Library IDs

## 🎯 Use Cases

- Competitive intelligence
- Campaign timeline analysis
- Ad copy research
- Market trend identification
- Performance benchmarking

## 📁 File Structure

```
fb-ads-analyzer/
│
├── manifest.json          ← Extension config
├── content.js             ← Bridge script
├── injected.js            ← Scraper (runs in page context)
├── popup.html             ← UI layout
├── popup.js               ← Visualization logic
├── icon16.png             ← Toolbar icon
├── icon48.png             ← Extension page icon
├── icon128.png            ← Store icon
├── README.md              ← Full documentation
├── QUICK_INSTALL.md       ← This file
└── icon-generator.html    ← Icon creator tool
```

## 🔐 Privacy

- ✅ All processing happens locally
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ Source code is fully visible
- ✅ Works offline after scraping

## 💡 Pro Tips

1. **Use filters**: Narrow Facebook search before scraping for faster results
2. **Compare competitors**: Run multiple scrapes and compare
3. **Export data**: Copy results from browser console if needed
4. **Best timing**: Scrape during off-peak hours for better loading
5. **Save results**: Take screenshots or export visualizations

## 🆘 Need Help?

1. Check the full README.md for detailed documentation
2. Look at browser console (F12) for error messages
3. Ensure you're on latest Chrome/Edge version
4. Try refreshing Facebook page and restarting extension

## ⚖️ Legal Notice

This tool is for research and competitive intelligence purposes. Use responsibly and in accordance with:
- Facebook's Terms of Service
- Your local data protection laws
- Ethical research practices

---

**Ready to start?** Follow Step 1 above! 🎉
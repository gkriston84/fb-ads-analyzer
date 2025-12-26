// Content script - runs in isolated context but can inject into page
console.log('[FB Ads Analyzer] Content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScraping') {
    console.log('[FB Ads Analyzer] Starting scraping process');
    injectScraperAndVisualizer(request.aiConfig);
    sendResponse({ status: 'started' });
  } else if (request.action === 'loadData' || request.action === 'importData') {
    console.log('[FB Ads Analyzer] Loading imported data');
    injectVisualizerWithData(request.data, request.aiConfig);
    sendResponse({ status: 'loaded' });
  } else if (request.action === 'checkExisting') {
    console.log('[FB Ads Analyzer] Checking for existing overlay');
    const hasOverlay = !!document.getElementById('fbAdsAnalyzerOverlay');
    sendResponse({ hasOverlay });
  } else if (request.action === 'reopenOverlay') {
    console.log('[FB Ads Analyzer] Reopening overlay');
    const event = new CustomEvent('fbAdsReopen');
    document.dispatchEvent(event);
    sendResponse({ status: 'reopened' });
  }
  return true;
});

// Listen for analysis requests from visualizer (to proxy through background)
document.addEventListener('fbAdsAnalyzeRequest', (e) => {
  const { apiKey, systemPrompt, userContent } = e.detail;

  console.log('[FB Ads Analyzer] Proxying AI request to background');

  chrome.runtime.sendMessage({
    action: 'analyzeAI',
    payload: { apiKey, systemPrompt, userContent }
  }, (response) => {
    // Dispatch response back to visualizer
    const event = new CustomEvent('fbAdsAnalyzeResponse', {
      detail: response
    });
    document.dispatchEvent(event);
  });
});

// Inject both scraper and visualizer into the page context
function injectScraperAndVisualizer(aiConfig) {
  // Check if already exists
  // Check if already exists
  const existingOverlay = document.getElementById('fbAdsAnalyzerOverlay');
  const isScraperLoaded = document.body.getAttribute('data-fb-ads-scraper-loaded') === 'true';

  if (existingOverlay) {
    if (isScraperLoaded) {
      console.log('[FB Ads Analyzer] Already running, restarting analysis...');
      // Dispatch restart event handled by injected.js
      document.dispatchEvent(new CustomEvent('fbAdsRestart'));
    } else {
      console.log('[FB Ads Analyzer] Visualizer exists but scraper missing. Injecting scraper...');
      // Inject the scraper
      const scraperScript = document.createElement('script');
      scraperScript.src = chrome.runtime.getURL('src/injected.js');
      scraperScript.onload = function () {
        this.remove();
      };
      (document.head || document.documentElement).appendChild(scraperScript);
    }

    // Also ensure we update AI config
    if (aiConfig) {
      setTimeout(() => {
        const event = new CustomEvent('fbAdsConfig', { detail: aiConfig });
        document.dispatchEvent(event);
      }, 500);
    }
    return;
  }

  // Inject configuration via data attribute (CSP-compliant)
  let configEl = document.getElementById('fbAdsConfig');
  if (!configEl) {
    configEl = document.createElement('div');
    configEl.id = 'fbAdsConfig';
    configEl.style.display = 'none';
    document.body.appendChild(configEl);
  }
  configEl.dataset.logoUrl = chrome.runtime.getURL('logo.jpg');

  // Inject the scraper
  const scraperScript = document.createElement('script');
  scraperScript.src = chrome.runtime.getURL('src/injected.js');
  scraperScript.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(scraperScript);

  // Inject the visualizer
  const visualizerScript = document.createElement('script');
  visualizerScript.src = chrome.runtime.getURL('src/visualizer.js');
  visualizerScript.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(visualizerScript);

  // Inject styles
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('src/visualizer.css');
  (document.head || document.documentElement).appendChild(styleLink);

  // Send AI Config if available
  if (aiConfig) {
    // Wait slightly for visualizer to load listeners
    setTimeout(() => {
      const event = new CustomEvent('fbAdsConfig', { detail: aiConfig });
      document.dispatchEvent(event);
    }, 500);
  }
}

// Inject visualizer and send imported data
function injectVisualizerWithData(data, aiConfig) {
  // Check if visualizer already exists
  const existingOverlay = document.getElementById('fbAdsAnalyzerOverlay');

  if (existingOverlay) {
    // Visualizer already exists, send data via CustomEvent
    console.log('[FB Ads Analyzer] Visualizer exists, sending data via CustomEvent');
    const event = new CustomEvent('fbAdsImportData', { detail: { ...data, isImported: true } });
    document.dispatchEvent(event);

    if (aiConfig) {
      setTimeout(() => {
        const configEvent = new CustomEvent('fbAdsConfig', { detail: aiConfig });
        document.dispatchEvent(configEvent);
      }, 200);
    }
    return;
  }

  // Inject configuration via data attribute (CSP-compliant)
  let configEl = document.getElementById('fbAdsConfig');
  if (!configEl) {
    configEl = document.createElement('div');
    configEl.id = 'fbAdsConfig';
    configEl.style.display = 'none';
    document.body.appendChild(configEl);
  }
  configEl.dataset.logoUrl = chrome.runtime.getURL('logo.jpg');

  // Store data in DOM for visualizer to pick up (CSP-compliant)
  const dataContainer = document.createElement('div');
  dataContainer.id = 'fbAdsImportedData';
  dataContainer.style.display = 'none';
  dataContainer.textContent = JSON.stringify({ ...data, isImported: true });
  document.body.appendChild(dataContainer);

  // Inject the visualizer
  const visualizerScript = document.createElement('script');
  visualizerScript.src = chrome.runtime.getURL('src/visualizer.js');
  visualizerScript.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(visualizerScript);

  // Inject styles
  if (!document.querySelector('link[href*="visualizer.css"]')) {
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('src/visualizer.css');
    (document.head || document.documentElement).appendChild(styleLink);
  }

  // Send AI Config if available
  if (aiConfig) {
    setTimeout(() => {
      const event = new CustomEvent('fbAdsConfig', { detail: aiConfig });
      document.dispatchEvent(event);
    }, 500);
  }
}
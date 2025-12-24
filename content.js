// Content script - runs in isolated context but can inject into page
console.log('[FB Ads Analyzer] Content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScraping') {
    console.log('[FB Ads Analyzer] Starting scraping process');
    injectScraperAndVisualizer();
    sendResponse({ status: 'started' });
  } else if (request.action === 'loadData') {
    console.log('[FB Ads Analyzer] Loading imported data');
    injectVisualizerWithData(request.data);
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

// Inject both scraper and visualizer into the page context
function injectScraperAndVisualizer() {
  // Check if already exists
  // const existingOverlay = document.getElementById('fbAdsAnalyzerOverlay');
  // if (existingOverlay) {
  //   console.log('[FB Ads Analyzer] Already running');
  //   return;
  // }

  // Inject the scraper
  const scraperScript = document.createElement('script');
  scraperScript.src = chrome.runtime.getURL('injected.js');
  scraperScript.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(scraperScript);

  // Inject the visualizer
  const visualizerScript = document.createElement('script');
  visualizerScript.src = chrome.runtime.getURL('visualizer.js');
  visualizerScript.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(visualizerScript);

  // Inject styles
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('visualizer.css');
  (document.head || document.documentElement).appendChild(styleLink);
}

// Inject visualizer and send imported data
function injectVisualizerWithData(data) {
  // Check if visualizer already exists
  const existingOverlay = document.getElementById('fbAdsAnalyzerOverlay');
  
  if (existingOverlay) {
    // Visualizer already exists, send data via CustomEvent
    console.log('[FB Ads Analyzer] Visualizer exists, sending data via CustomEvent');
    const event = new CustomEvent('fbAdsImportData', { detail: data });
    document.dispatchEvent(event);
    return;
  }

  // Store data in DOM for visualizer to pick up (CSP-compliant)
  const dataContainer = document.createElement('div');
  dataContainer.id = 'fbAdsImportedData';
  dataContainer.style.display = 'none';
  dataContainer.textContent = JSON.stringify(data);
  document.body.appendChild(dataContainer);

  // Inject the visualizer
  const visualizerScript = document.createElement('script');
  visualizerScript.src = chrome.runtime.getURL('visualizer.js');
  visualizerScript.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(visualizerScript);

  // Inject styles
  if (!document.querySelector('link[href*="visualizer.css"]')) {
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('visualizer.css');
    (document.head || document.documentElement).appendChild(styleLink);
  }
}
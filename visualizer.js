// Visualizer - creates floating overlay on Facebook page
(function() {
  console.log('[FB Ads Visualizer] Loaded');

  let state = {
    rawCampaigns: [],
    allAds: [],
    sortBy: 'start',
    groupByDomain: false,
    isMinimized: true,
    currentView: 'timeline', // 'timeline', 'all-copy', 'top5-text'
    isAnalyzing: false
  };

  // Create the floating overlay
  function createOverlay() {
    if (document.getElementById('fbAdsAnalyzerOverlay')) {
      return; // Already exists
    }

    const overlay = document.createElement('div');
    overlay.id = 'fbAdsAnalyzerOverlay';
    overlay.className = 'minimized';
    overlay.innerHTML = `
      <!-- Minimized State -->
      <div class="fb-ads-minimized-bar" id="fbAdsMinimizedBar">
        <div class="fb-ads-mini-content">
          <span class="fb-ads-mini-icon">📊</span>
          <span class="fb-ads-mini-text" id="fbAdsMinimizedText">FB Ads Analyzer - Ready</span>
          <div class="fb-ads-spinner" id="fbAdsMinimizedSpinner" style="display: none;"></div>
        </div>
        <div class="fb-ads-mini-actions">
          <button class="fb-ads-mini-btn" id="fbAdsMaximizeBtn" title="Maximize">
            <span>▲</span>
          </button>
          <button class="fb-ads-mini-btn" id="fbAdsMinimizedCloseBtn" title="Close">
            <span>✕</span>
          </button>
        </div>
      </div>

      <!-- Full State -->
      <div class="fb-ads-analyzer-container">
        <div class="fb-ads-analyzer-panel">
          <div class="fb-ads-analyzer-header">
            <div>
              <h1>🎯 Facebook Ads Campaign Analyzer</h1>
              <p id="fbAdsSubtitle">Ready to analyze</p>
            </div>
            <div class="fb-ads-header-actions">
              <button class="fb-ads-header-btn" id="fbAdsMinimizeBtn" title="Minimize">_</button>
              <button class="fb-ads-header-btn" id="fbAdsCloseBtn" title="Close">✕</button>
            </div>
          </div>

          <div class="fb-ads-status-bar" id="fbAdsStatusBar">
          <div class="fb-ads-spinner"></div>
          <div class="fb-ads-status-text" id="fbAdsStatusText">Auto-scrolling and extracting ad data...</div>
        </div>

        <div class="fb-ads-controls" id="fbAdsControls" style="display: none;">
          <div class="fb-ads-control-group">
            <span style="font-size: 12px; font-weight: 500; color: #374151;">View:</span>
            <button class="fb-ads-btn fb-ads-btn-outline active" data-view="timeline">📊 Timeline</button>
            <button class="fb-ads-btn fb-ads-btn-outline" data-view="all-copy">📝 All Copy</button>
            <button class="fb-ads-btn fb-ads-btn-outline" data-view="top5-text">🏆 Top 5 Text</button>
          </div>
          
          <div class="fb-ads-control-group" id="fbAdsSortGroup">
            <span style="font-size: 12px; font-weight: 500; color: #374151;">Sort by:</span>
            <button class="fb-ads-btn fb-ads-btn-outline active" data-sort="start">Start Date</button>
            <button class="fb-ads-btn fb-ads-btn-outline" data-sort="duration">Duration</button>
            <button class="fb-ads-btn fb-ads-btn-outline" data-sort="ads"># of Ads</button>
            <button class="fb-ads-btn fb-ads-btn-outline" id="fbAdsGroupBtn">Group by Domain</button>
          </div>

          <div class="fb-ads-control-group">
            <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsRestartBtn">
              🔄 Restart Analysis
            </button>
            <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsDownloadBtn">
              💾 Download Data
            </button>
            <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsImportBtn">
              📁 Import Data
            </button>
            <input type="file" id="fbAdsFileInput" accept=".json" style="display: none;">
          </div>
        </div>

        <div class="fb-ads-legend" id="fbAdsLegend" style="display: none;">
          <div class="fb-ads-legend-item">
            <div class="fb-ads-legend-color" style="background: #8b5cf6;"></div>
            <span>1-4 ads</span>
          </div>
          <div class="fb-ads-legend-item">
            <div class="fb-ads-legend-color" style="background: #3b82f6;"></div>
            <span>5-9 ads</span>
          </div>
          <div class="fb-ads-legend-item">
            <div class="fb-ads-legend-color" style="background: #22c55e;"></div>
            <span>10-19 ads</span>
          </div>
          <div class="fb-ads-legend-item">
            <div class="fb-ads-legend-color" style="background: #eab308;"></div>
            <span>20-49 ads</span>
          </div>
          <div class="fb-ads-legend-item">
            <div class="fb-ads-legend-color" style="background: #f97316;"></div>
            <span>50-99 ads</span>
          </div>
          <div class="fb-ads-legend-item">
            <div class="fb-ads-legend-color" style="background: #ef4444;"></div>
            <span>100+ ads</span>
          </div>
        </div>

        <div class="fb-ads-chart-container">
          <div id="fbAdsChartContent"></div>
        </div>
      </div>

      <div class="fb-ads-modal-overlay" id="fbAdsModalOverlay">
        <div class="fb-ads-modal">
          <div class="fb-ads-modal-header">
            <div class="fb-ads-modal-title">
              <h2 id="fbAdsModalUrl"></h2>
              <div class="fb-ads-modal-meta" id="fbAdsModalMeta"></div>
            </div>
            <button class="fb-ads-modal-close" id="fbAdsModalClose">✕</button>
          </div>
          <div class="fb-ads-modal-body" id="fbAdsModalBody"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    setupEventListeners();
  }

  function setupEventListeners() {
    // Minimize/Maximize
    document.getElementById('fbAdsMinimizeBtn').addEventListener('click', minimize);
    document.getElementById('fbAdsMaximizeBtn').addEventListener('click', maximize);
    document.getElementById('fbAdsMinimizedBar').addEventListener('click', (e) => {
      if (!e.target.closest('button')) maximize();
    });

    // Close buttons
    document.getElementById('fbAdsCloseBtn').addEventListener('click', closeOverlay);
    document.getElementById('fbAdsMinimizedCloseBtn').addEventListener('click', closeOverlay);

    // View buttons
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentView = btn.dataset.view;
        renderCurrentView();
      });
    });

    // Sort buttons
    document.querySelectorAll('[data-sort]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.sortBy = btn.dataset.sort;
        renderChart();
      });
    });

    // Group button
    document.getElementById('fbAdsGroupBtn').addEventListener('click', () => {
      state.groupByDomain = !state.groupByDomain;
      const btn = document.getElementById('fbAdsGroupBtn');
      if (state.groupByDomain) {
        btn.classList.add('active');
        btn.textContent = '✓ Grouped';
      } else {
        btn.classList.remove('active');
        btn.textContent = 'Group by Domain';
      }
      renderChart();
    });

    // Action buttons
    document.getElementById('fbAdsRestartBtn').addEventListener('click', restartAnalysis);
    document.getElementById('fbAdsDownloadBtn').addEventListener('click', downloadData);
    document.getElementById('fbAdsImportBtn').addEventListener('click', () => {
      document.getElementById('fbAdsFileInput').click();
    });
    document.getElementById('fbAdsFileInput').addEventListener('change', importData);

    // Modal close
    document.getElementById('fbAdsModalClose').addEventListener('click', closeModal);
    document.getElementById('fbAdsModalOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'fbAdsModalOverlay') closeModal();
    });
  }

  function minimize() {
    state.isMinimized = true;
    document.getElementById('fbAdsAnalyzerOverlay').classList.add('minimized');
  }

  function maximize() {
    state.isMinimized = false;
    document.getElementById('fbAdsAnalyzerOverlay').classList.remove('minimized');
  }

  function closeOverlay() {
    const overlay = document.getElementById('fbAdsAnalyzerOverlay');
    overlay.classList.add('hidden');
  }

  function showOverlay() {
    const overlay = document.getElementById('fbAdsAnalyzerOverlay');
    overlay.classList.remove('hidden');
    if (state.isMinimized) {
      // Keep minimized if it was minimized
      return;
    }
    maximize();
  }

  function restartAnalysis() {
    if (state.isAnalyzing) {
      alert('Analysis already in progress. Please wait for it to complete.');
      return;
    }
    
    // Clear existing data
    state.rawCampaigns = [];
    state.allAds = [];
    
    // Show analyzing state
    state.isAnalyzing = true;
    document.getElementById('fbAdsSubtitle').textContent = 'Scraping in progress...';
    showStatus('🔄 Restarting analysis...');
    minimize();
    
    // Trigger new analysis
    if (window.fbAdsAnalyzer && window.fbAdsAnalyzer.runFullAnalysis) {
      window.fbAdsAnalyzer.runFullAnalysis();
    } else {
      showStatus('❌ Error: Analyzer not found. Refresh page and try again.');
      state.isAnalyzing = false;
    }
  }

  function downloadData() {
    const data = {
      campaigns: state.rawCampaigns,
      allAds: state.allAds,
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const query = document.querySelector('input[placeholder*="Search by"]').value.toLowerCase().replaceAll(' ', '-');
    const range = document.getElementById('fbAdsSubtitle').innerText.toLowerCase().replaceAll(',','').replaceAll(' ', '-')
;

    a.href = url;
    a.download = `${query}-fb-ads-${range}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showStatus('✅ Data downloaded successfully!');
    setTimeout(hideStatus, 2000);
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.campaigns && Array.isArray(data.campaigns)) {
          state.rawCampaigns = data.campaigns;
          state.allAds = data.allAds || [];
          
          showStatus(`✅ Imported ${state.rawCampaigns.length} campaigns!`);
          setTimeout(hideStatus, 2000);
          showControls();
          maximize();
          renderCurrentView();
        } else {
          showStatus('❌ Invalid data format. Expected campaigns array.');
        }
      } catch (err) {
        showStatus('❌ Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  }

  function showStatus(text) {
    document.getElementById('fbAdsStatusText').textContent = text;
    document.getElementById('fbAdsStatusBar').style.display = 'flex';
    document.getElementById('fbAdsMinimizedText').textContent = text;
    
    const isLoading = text.includes('...') || text.includes('🔄');
    document.getElementById('fbAdsMinimizedSpinner').style.display = isLoading ? 'block' : 'none';
  }

  function hideStatus() {
    document.getElementById('fbAdsStatusBar').style.display = 'none';
  }

  function showControls() {
    document.getElementById('fbAdsControls').style.display = 'flex';
  }

  function renderCurrentView() {
    const sortGroup = document.getElementById('fbAdsSortGroup');
    const legend = document.getElementById('fbAdsLegend');
    
    if (state.currentView === 'timeline') {
      sortGroup.style.display = 'flex';
      legend.style.display = 'flex';
      renderChart();
    } else if (state.currentView === 'all-copy') {
      sortGroup.style.display = 'none';
      legend.style.display = 'none';
      renderAllCopy();
    } else if (state.currentView === 'top5-text') {
      sortGroup.style.display = 'none';
      legend.style.display = 'none';
      renderTop5Text();
    }
  }

  function renderAllCopy() {
    const chartContent = document.getElementById('fbAdsChartContent');
    
    if (!state.allAds || state.allAds.length === 0) {
      chartContent.innerHTML = '<div class="fb-ads-empty-state">No ad copy data available</div>';
      return;
    }

    // Extract unique ad copy
    const seen = new Set();
    const uniqueCopy = [];
    
    state.allAds.forEach(ad => {
      const text = ad.adText?.trim();
      if (text && !seen.has(text)) {
        seen.add(text);
        uniqueCopy.push({
          text,
          libraryId: ad.libraryId,
          duration: ad.duration,
          startingDate: ad.startingDate,
          endDate: ad.endDate
        });
      }
    });

    // Sort by duration (longest first)
    uniqueCopy.sort((a, b) => b.duration - a.duration);

    document.getElementById('fbAdsSubtitle').textContent = 
      `${uniqueCopy.length} unique ad copies`;

    chartContent.innerHTML = `
      <div class="fb-ads-copy-list">
        ${uniqueCopy.map((ad, idx) => `
          <div class="fb-ads-copy-item">
            <div class="fb-ads-copy-header">
              <span class="fb-ads-copy-number">#${idx + 1}</span>
              <div class="fb-ads-copy-meta">
                <a href="https://www.facebook.com/ads/library/?id=${ad.libraryId}" 
                   target="_blank" 
                   class="fb-ads-library-id-link">
                  Library ID: ${ad.libraryId}
                </a>
                <span class="fb-ads-copy-duration">${ad.duration} days</span>
              </div>
            </div>
            <div class="fb-ads-copy-text">${ad.text}</div>
            <div class="fb-ads-copy-dates">${ad.startingDate} → ${ad.endDate}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderTop5Text() {
    const chartContent = document.getElementById('fbAdsChartContent');
    
    if (!state.rawCampaigns || state.rawCampaigns.length === 0) {
      chartContent.innerHTML = '<div class="fb-ads-empty-state">No campaign data available</div>';
      return;
    }

    document.getElementById('fbAdsSubtitle').textContent = 
      `Top 5 ads for ${state.rawCampaigns.length} campaigns`;

    let output = '';
    
    state.rawCampaigns.forEach(campaign => {
      const formatDate = (dateStr) => new Date(dateStr).toDateString();
      
      output += `
        <div class="fb-ads-text-campaign">
          <div class="fb-ads-text-header">
            <strong>${campaign.url}</strong>
          </div>
          <div class="fb-ads-text-meta">
            ${formatDate(campaign.firstAdvertised)} — ${formatDate(campaign.lastAdvertised)} | 
            ${campaign.campaignDurationDays} days | 
            ${campaign.adsCount} ads
          </div>
          
          ${campaign.top5 && campaign.top5.length > 0 ? `
            <div class="fb-ads-text-ads">
              <div class="fb-ads-text-label">Top 5 Ads</div>
              ${campaign.top5.map(ad => `
                <div class="fb-ads-text-ad">
                  <div class="fb-ads-text-ad-header">
                    <strong>Library ID:</strong> 
                    <a href="https://www.facebook.com/ads/library/?id=${ad.libraryId}" 
                       target="_blank" 
                       class="fb-ads-library-id-link">
                      ${ad.libraryId}
                    </a>
                  </div>
                  <div class="fb-ads-text-ad-meta">
                    <strong>Dates:</strong> ${ad.startingDate} — ${ad.endDate}<br>
                    <strong>Duration:</strong> ${ad.duration} days
                  </div>
                  <div class="fb-ads-text-ad-copy">
                    <strong>Ad Copy:</strong><br>
                    ${ad.adText || '[no copy]'}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<div class="fb-ads-text-no-ads">No top ads data available</div>'}
        </div>
      `;
    });

    chartContent.innerHTML = `<div class="fb-ads-text-output">${output}</div>`;
  }

  // Utility functions
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getColor(ads) {
    if (ads >= 100) return '#ef4444';
    if (ads >= 50) return '#f97316';
    if (ads >= 20) return '#eab308';
    if (ads >= 10) return '#22c55e';
    if (ads >= 5) return '#3b82f6';
    return '#8b5cf6';
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url.split('/')[0];
    }
  }

  function transformCampaigns(rawCampaigns) {
    return rawCampaigns.map(campaign => ({
      url: campaign.url.replace('https://', '').replace('http://', ''),
      firstAdvertised: campaign.firstAdvertised.split('T')[0],
      lastAdvertised: campaign.lastAdvertised.split('T')[0],
      campaignDurationDays: campaign.campaignDurationDays,
      adsUsingUrl: campaign.adsCount,
      top5: campaign.top5 || []
    }));
  }

  function sortCampaigns(campaigns, sortBy) {
    const sorted = [...campaigns];
    if (sortBy === 'start') {
      sorted.sort((a, b) => new Date(a.firstAdvertised) - new Date(b.firstAdvertised));
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => b.campaignDurationDays - a.campaignDurationDays);
    } else if (sortBy === 'ads') {
      sorted.sort((a, b) => b.adsUsingUrl - a.adsUsingUrl);
    }
    return sorted;
  }

  function groupCampaignsByDomain(campaigns, sortBy) {
    const groups = {};
    campaigns.forEach(campaign => {
      const domain = getDomain(campaign.url);
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(campaign);
    });

    Object.keys(groups).forEach(domain => {
      groups[domain] = sortCampaigns(groups[domain], sortBy);
    });

    const sortedDomains = Object.keys(groups).sort((a, b) => {
      const totalA = groups[a].reduce((sum, c) => sum + c.adsUsingUrl, 0);
      const totalB = groups[b].reduce((sum, c) => sum + c.adsUsingUrl, 0);
      return totalB - totalA;
    });

    return { groups, sortedDomains };
  }

  function getBarPosition(campaign, minDate, totalDays) {
    const start = new Date(campaign.firstAdvertised);
    const end = new Date(campaign.lastAdvertised);
    const startOffset = Math.ceil((start - minDate) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  }

  function getMonthMarkers(minDate, maxDate, totalDays) {
    const markers = [];
    let current = new Date(minDate);
    current.setDate(1);
    
    while (current <= maxDate) {
      const offset = Math.ceil((current - minDate) / (1000 * 60 * 60 * 24));
      markers.push({
        date: new Date(current),
        position: (offset / totalDays) * 100
      });
      current.setMonth(current.getMonth() + 1);
    }
    return markers;
  }

  // Render functions
  function renderChart() {
    if (!state.rawCampaigns || state.rawCampaigns.length === 0) return;

    const campaigns = transformCampaigns(state.rawCampaigns);
    const minDate = new Date(Math.min(...campaigns.map(c => new Date(c.firstAdvertised))));
    const maxDate = new Date(Math.max(...campaigns.map(c => new Date(c.lastAdvertised))));
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const monthMarkers = getMonthMarkers(minDate, maxDate, totalDays);

    // Update subtitle
    document.getElementById('fbAdsSubtitle').textContent = 
      `${campaigns.length} campaigns from ${formatDate(minDate)} to ${formatDate(maxDate)}`;

    const chartContent = document.getElementById('fbAdsChartContent');
    chartContent.innerHTML = '';

    // Render timeline header
    const header = document.createElement('div');
    header.className = 'fb-ads-timeline-header';
    header.innerHTML = `
      <div class="fb-ads-timeline-label"></div>
      <div class="fb-ads-timeline-grid">
        ${monthMarkers.map(marker => `
          <div class="fb-ads-month-marker" style="left: ${marker.position}%">
            <div class="fb-ads-month-label">
              ${marker.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    chartContent.appendChild(header);

    // Render campaigns
    if (state.groupByDomain) {
      const { groups, sortedDomains } = groupCampaignsByDomain(campaigns, state.sortBy);
      sortedDomains.forEach(domain => {
        const domainCampaigns = groups[domain];
        const totalAds = domainCampaigns.reduce((sum, c) => sum + c.adsUsingUrl, 0);
        
        const domainGroup = document.createElement('div');
        domainGroup.className = 'fb-ads-domain-group';
        domainGroup.innerHTML = `
          <div class="fb-ads-domain-header">
            <div class="fb-ads-timeline-label">
              <div class="fb-ads-domain-name">${domain}</div>
              <div class="fb-ads-domain-stats">${domainCampaigns.length} campaigns • ${totalAds} ads</div>
            </div>
          </div>
        `;
        
        domainCampaigns.forEach(campaign => {
          domainGroup.appendChild(createCampaignRow(campaign, minDate, maxDate, totalDays, monthMarkers));
        });
        
        chartContent.appendChild(domainGroup);
      });
    } else {
      const sorted = sortCampaigns(campaigns, state.sortBy);
      sorted.forEach(campaign => {
        chartContent.appendChild(createCampaignRow(campaign, minDate, maxDate, totalDays, monthMarkers));
      });
    }
  }

  function createCampaignRow(campaign, minDate, maxDate, totalDays, monthMarkers) {
    const row = document.createElement('div');
    row.className = 'fb-ads-campaign-row';
    
    const barPos = getBarPosition(campaign, minDate, totalDays);
    const color = getColor(campaign.adsUsingUrl);
    
    row.innerHTML = `
      <div class="fb-ads-campaign-info">
        <div class="fb-ads-campaign-url" title="${campaign.url}"><a onclick="arguments[0].stopPropagation();" href="https://${campaign.url}" target="_blank">${campaign.url}</div>
        <a onclick="arguments[0].stopPropagation();" href="https://web.archive.org/web/*/https://${campaign.url}/*" target="_blank">Archived versions</a>
        <div class="fb-ads-campaign-meta">${campaign.campaignDurationDays} days • ${campaign.adsUsingUrl} ads</div>
      </div>
      <div class="fb-ads-campaign-timeline">
        ${monthMarkers.map(marker => `
          <div class="fb-ads-timeline-bg-marker" style="left: ${marker.position}%"></div>
        `).join('')}
        <div class="fb-ads-campaign-bar" style="left: ${barPos.left}; width: ${barPos.width}; background-color: ${color};"></div>
      </div>
    `;

    row.addEventListener('click', () => showModal(campaign));
    return row;
  }

  function showModal(campaign) {
    const modal = document.getElementById('fbAdsModalOverlay');
    const modalBody = document.getElementById('fbAdsModalBody');
    
    document.getElementById('fbAdsModalUrl').textContent = campaign.url;
    document.getElementById('fbAdsModalMeta').innerHTML = `
      <div>${formatDate(campaign.firstAdvertised)} → ${formatDate(campaign.lastAdvertised)}</div>
      <div style="margin-top: 4px;">${campaign.campaignDurationDays} days • ${campaign.adsUsingUrl} ads</div>
    `;

    if (campaign.top5 && campaign.top5.length > 0) {
      modalBody.innerHTML = `
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #111827;">Top Performing Ads</h3>
        <div class="fb-ads-list">
          ${campaign.top5.map((ad, idx) => `
            <div class="fb-ads-card">
              <div class="fb-ads-ad-header">
                <div class="fb-ads-ad-rank">
                  <div class="fb-ads-rank-number">#${idx + 1}</div>
                  <div>
                    <div class="fb-ads-library-id-label">Library ID</div>
                    <a href="https://www.facebook.com/ads/library/?id=${ad.libraryId}" 
                       target="_blank" 
                       class="fb-ads-library-id-link">
                      ${ad.libraryId}
                    </a>
                  </div>
                </div>
                <div class="fb-ads-ad-duration">
                  <div class="fb-ads-duration-label">Duration</div>
                  <div class="fb-ads-duration-value">${ad.duration} days</div>
                </div>
              </div>
              <div class="fb-ads-ad-copy-section">
                <div class="fb-ads-ad-copy-label">Ad Copy</div>
                <div class="fb-ads-ad-copy">${ad.adText || '[No copy available]'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      modalBody.innerHTML = `
        <div class="fb-ads-no-ads">
          <div style="font-size: 16px; margin-bottom: 8px; color: #6b7280;">No ad data available</div>
          <div style="font-size: 12px; color: #9ca3af;">Top performing ads not tracked for this campaign</div>
        </div>
      `;
    }

    modal.style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('fbAdsModalOverlay').style.display = 'none';
  }

  // Listen for data from scraper
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data.type === 'FB_ADS_DATA') {
      console.log('[FB Ads Visualizer] Received data:', event.data.data);
      state.rawCampaigns = event.data.data || [];
      state.allAds = event.data.allAds || [];
      state.isAnalyzing = false;
      
      if (state.rawCampaigns.length > 0) {
        showStatus(`✅ Found ${state.rawCampaigns.length} campaigns!`);
        setTimeout(hideStatus, 2000);
        showControls();
        maximize();
        renderCurrentView();
      } else {
        showStatus('⚠️ No campaigns found. Try different search criteria.');
      }
    } else if (event.data.type === 'FB_ADS_ERROR') {
      showStatus('❌ Error: ' + event.data.error);
      state.isAnalyzing = false;
    }
  });

  // Listen for imported data via CustomEvent
  document.addEventListener('fbAdsImportData', (event) => {
    console.log('[FB Ads Visualizer] Received imported data via CustomEvent');
    loadImportedData(event.detail);
  });

  // Listen for reopen request
  document.addEventListener('fbAdsReopen', () => {
    console.log('[FB Ads Visualizer] Reopening overlay');
    showOverlay();
  });

  // Expose reopen function globally for content script
  window.fbAdsReopenOverlay = showOverlay;

  function loadImportedData(importedData) {
    state.rawCampaigns = importedData.campaigns || [];
    state.allAds = importedData.allAds || [];
    state.isAnalyzing = false;
    
    if (state.rawCampaigns.length > 0) {
      hideStatus(); // Hide status immediately for imports
      showControls();
      maximize();
      renderCurrentView();
      
      // Show brief success message
      showStatus(`✅ Imported ${state.rawCampaigns.length} campaigns!`);
      setTimeout(hideStatus, 2000);
    } else {
      showStatus('⚠️ No campaigns in imported data.');
    }
  }

  // Initialize
  createOverlay();
  
  // Check for imported data in DOM
  const dataContainer = document.getElementById('fbAdsImportedData');
  if (dataContainer) {
    // Import mode - load data immediately
    console.log('[FB Ads Visualizer] Found imported data in DOM');
    try {
      const importedData = JSON.parse(dataContainer.textContent);
      dataContainer.remove(); // Clean up
      loadImportedData(importedData);
    } catch (err) {
      console.error('[FB Ads Visualizer] Error parsing imported data:', err);
      showStatus('❌ Error parsing imported data');
    }
  } else {
    // Scraping mode - show status bar and update subtitle
    document.getElementById('fbAdsSubtitle').textContent = 'Scraping in progress...';
    showStatus('🔄 Auto-scrolling and extracting ad data...');
  }
})();
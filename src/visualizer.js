/* Facebook Ads Analyzer - Visualizer Script */

(function () {
  console.log('[FB Ads Analyzer] Visualizer script loaded');

  // State Management
  const state = {
    rawCampaigns: [],
    processedCampaigns: [],
    allAds: [],
    filterDomain: 'all',
    filterText: '',
    filterSort: 'recent', // 'recent', 'duration', 'ads'
    groupByDomain: false,
    isMinimized: true,
    currentView: 'timeline', // 'timeline', 'top5-text', 'all-copy'
    isAnalyzing: false,
    isAnalyzing: false,
    aiConfig: null,
    isAnalyzing: false,
    aiConfig: null,
    metadata: null,
    sortDirection: 'asc', // 'asc' or 'desc'
    isImported: false
  };

  // Color Helper
  function getAdCountColor(count) {
    if (count >= 100) return '#ef4444'; // Red
    if (count >= 50) return '#f97316';  // Orange
    if (count >= 20) return '#eab308';  // Yellow
    if (count >= 10) return '#22c55e';  // Green
    if (count >= 5) return '#3b82f6';   // Blue
    return '#8b5cf6';                   // Purple
  }

  // Get logo URL from config element (set by content.js)
  const configEl = document.getElementById('fbAdsConfig');
  const logoUrl = configEl?.dataset?.logoUrl || '';

  // Create the floating overlay
  const overlay = document.createElement('div');
  overlay.id = 'fbAdsAnalyzerOverlay';
  overlay.className = 'hidden minimized';
  overlay.innerHTML = `
      <div class="fb-ads-minimized-bar" id="fbAdsMinimizedBar">
        <div class="fb-ads-mini-content">
          <div class="fb-ads-mini-icon">
            <img src="${logoUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
          </div>
          <div class="fb-ads-mini-text">Facebook Ads Campaign Analyzer</div>
        </div>
        <div class="fb-ads-mini-actions">
           <button class="fb-ads-mini-btn" id="fbAdsMaximizeBtn">Show</button>
        </div>
      </div>
  
      <div class="fb-ads-analyzer-container">
        <div class="fb-ads-analyzer-panel">
          <div class="fb-ads-analyzer-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 24px;">
                <img src="${logoUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb;">
              </div>
              <div>
                <h1>Facebook Ads Campaign Analyzer</h1>
                <p id="fbAdsSubtitle">Timeline & Campaign Analysis</p>
              </div>
            </div>
            <div class="fb-ads-header-actions">
              <button class="fb-ads-header-btn" id="fbAdsMinimizeBtn" title="Minimize">_</button>
              <button class="fb-ads-header-btn" id="fbAdsCloseBtn" title="Close">×</button>
            </div>
          </div>
          
          <div class="fb-ads-controls">
            <div class="fb-ads-control-row" style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 12px; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div class="fb-ads-control-group">
                  <span style="font-weight: 500; font-size: 13px; color: #374151;">View:</span>
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-view="timeline">📊 Timeline</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-view="top5-text">🏆 Top 5 Text</button>
                </div>

                 <div class="fb-ads-control-group">
                  <span style="font-weight: 500; font-size: 13px; color: #374151;">Sort:</span>
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-sort="recent">Start Date</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="duration">Duration</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="ads"># of Ads</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" id="fbAdsGroupDomainBtn" title="Group campaigns by domain">📂 Group by Domain</button>
                </div>

                 <div class="fb-ads-control-group" style="flex: 1; max-width: 300px;">
                   <input type="text" id="fbAdsFilterInput" class="fb-ads-input" placeholder="🔍 Filter campaigns..." style="width: 100%;">
                 </div>
                
                <div class="fb-ads-control-group" style="margin-left: auto;">
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsDownloadBtn">💾 Download Data</button>
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsImportBtn">📂 Import Data</button>
                    <input type="file" id="fbAdsImportInput" style="display: none;" accept=".json">
                </div>
            </div>

             <div class="fb-ads-legend" id="fbAdsTimelineLegend" style="display: flex; width: 100%; gap: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #8b5cf6;"></div> 1-4 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #3b82f6;"></div> 5-9 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #22c55e;"></div> 10-19 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #eab308;"></div> 20-49 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #f97316;"></div> 50-99 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #ef4444;"></div> 100+ ads</div>
            </div>
             <div class="fb-ads-status-bar" style="border: none; padding-top: 0; padding-bottom: 0;">
                 <div class="fb-ads-spinner" id="fbAdsSpinner"></div>
                 <div class="fb-ads-status-text" id="fbAdsStatusText">Loading analysis data...</div>
            </div>
          </div>
  
          <div class="fb-ads-chart-container" id="fbAdsChartContent">
             <!-- Dynamic Content -->
          </div>
        </div>
      </div>
      
      <!-- Modal Container -->
      <div class="fb-ads-modal-overlay" id="fbAdsModalOverlay">
        <div class="fb-ads-modal">
          <div class="fb-ads-modal-header">
            <div class="fb-ads-modal-title">
              <h2 id="fbAdsModalTitle">Campaign Details</h2>
              <p class="fb-ads-modal-meta" id="fbAdsModalMeta">url...</p>
            </div>
            <button class="fb-ads-modal-close" id="fbAdsModalClose">×</button>
          </div>
          <div class="fb-ads-modal-body" id="fbAdsModalBody">
             <!-- Details -->
          </div>
        </div>
      </div>
    `;

  document.body.appendChild(overlay);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'fb-ads-tooltip';
  overlay.appendChild(tooltip);

  // --- Event Listeners ---

  // Header Actions
  document.getElementById('fbAdsCloseBtn').addEventListener('click', hideOverlay);
  document.getElementById('fbAdsMinimizeBtn').addEventListener('click', toggleMinimize);
  document.getElementById('fbAdsMaximizeBtn').addEventListener('click', toggleMinimize);
  document.getElementById('fbAdsMinimizedBar').addEventListener('click', toggleMinimize);

  // Modal Actions
  document.getElementById('fbAdsModalClose').addEventListener('click', hideModal);
  document.getElementById('fbAdsModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'fbAdsModalOverlay') hideModal();
  });

  // Main Actions


  // Main Actions
  const filterInput = document.getElementById('fbAdsFilterInput');
  filterInput.addEventListener('input', (e) => {
    state.filterText = e.target.value.toLowerCase();
    updateView();
  });

  document.getElementById('fbAdsDownloadBtn').addEventListener('click', downloadData);
  document.getElementById('fbAdsImportBtn').addEventListener('click', () => {
    document.getElementById('fbAdsImportInput').click();
  });
  document.getElementById('fbAdsImportInput').addEventListener('change', handleFileImport);


  // View Switcher
  const viewButtons = document.querySelectorAll('[data-view]');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      viewButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.currentView = e.target.getAttribute('data-view');

      const legend = document.getElementById('fbAdsTimelineLegend');
      if (state.currentView === 'timeline') {
        legend.style.display = 'flex';
      } else {
        legend.style.display = 'none';
      }
      updateView();
    });
  });

  // Sort Switcher
  const sortButtons = document.querySelectorAll('[data-sort]');

  // Helper to update button labels
  const updateSortButtons = () => {
    sortButtons.forEach(btn => {
      const sortType = btn.getAttribute('data-sort');
      let label = btn.innerText.replace(/ [↑↓]/, ''); // Clean existing arrow

      if (state.filterSort === sortType) {
        btn.classList.add('active');
        // Add arrow
        label += state.sortDirection === 'asc' ? ' ↑' : ' ↓';
      } else {
        btn.classList.remove('active');
      }
      btn.innerText = label;
    });
  };

  sortButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetSort = e.target.getAttribute('data-sort');

      if (state.filterSort === targetSort) {
        // Toggle direction
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // New sort: Default to 'desc' for everything? 
        // Usually 'Start Date' users might want Oldest First (Asc) or Newest First (Desc).
        // Let's default to 'desc' (High/Newest) as standard, but maybe 'asc' for Date?
        // The original code had default Date as Asc (Oldest first).
        if (targetSort === 'recent') {
          state.sortDirection = 'asc';
        } else {
          state.sortDirection = 'desc';
        }
        state.filterSort = targetSort;
      }

      updateSortButtons();
      updateView();
    });
  });

  // Init button labels
  updateSortButtons();

  // Group by Domain
  const groupBtn = document.getElementById('fbAdsGroupDomainBtn');
  groupBtn.addEventListener('click', () => {
    state.groupByDomain = !state.groupByDomain;
    groupBtn.classList.toggle('active');
    updateView();
  });


  // --- Functions ---

  function showOverlay() {
    overlay.classList.remove('hidden');
    overlay.classList.remove('minimized');
    state.isMinimized = false;
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  function toggleMinimize(e) {
    if (e) e.stopPropagation();
    state.isMinimized = !state.isMinimized;
    if (state.isMinimized) {
      overlay.classList.add('minimized');
    } else {
      overlay.classList.remove('minimized');
    }
  }

  function showModal(contentHtml, title, meta) {
    document.getElementById('fbAdsModalTitle').innerText = title;
    document.getElementById('fbAdsModalMeta').innerText = meta;
    document.getElementById('fbAdsModalBody').innerHTML = contentHtml;
    document.getElementById('fbAdsModalOverlay').style.display = 'flex';
    setupCopyButtons(document.getElementById('fbAdsModalBody'));
  }

  function hideModal() {
    document.getElementById('fbAdsModalOverlay').style.display = 'none';
  }

  function copyRichText(plain, html) {
    if (typeof ClipboardItem !== "undefined") {
      const textBlob = new Blob([plain], { type: "text/plain" });
      const htmlBlob = new Blob([html], { type: "text/html" });
      navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": textBlob,
          "text/html": htmlBlob
        })
      ]).catch(err => {
        console.error("Rich copy failed, falling back to plain:", err);
        navigator.clipboard.writeText(plain);
      });
    } else {
      navigator.clipboard.writeText(plain);
    }
  }

  function setupCopyButtons(container) {
    const copyBtns = container.querySelectorAll('.fb-ads-copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget; // Use currentTarget to ensure we get the button, not icon
        const rawText = decodeURIComponent(target.dataset.copyText);

        // Extract metadata if available
        const meta = {
          url: target.dataset.url ? decodeURIComponent(target.dataset.url) : '',
          campaignDuration: target.dataset.campaignDuration || '',
          campaignAds: target.dataset.campaignAds || '',
          libId: target.dataset.adLibId || '',
          adDuration: target.dataset.adDuration || '',
          adDates: target.dataset.adDates || ''
        };

        // Construct Rich Text HTML
        const richText = `
             <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #374151;">
                 <p style="margin-bottom: 8px;">
                    <strong>Campaign:</strong> <a href="${meta.url}">${meta.url}</a><br>
                    ${meta.campaignDuration ? `<strong>Duration:</strong> ${meta.campaignDuration} days` : ''} 
                    ${meta.campaignAds ? `• ${meta.campaignAds} ads` : ''}
                 </p>
                 <p style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                    <strong>Library ID:</strong> <a href="https://www.facebook.com/ads/library/?id=${meta.libId}">${meta.libId}</a><br>
                    <strong>Dates:</strong> ${meta.adDates} | <strong>Ad Duration:</strong> ${meta.adDuration} days
                 </p>
                 <div>
                    ${rawText.replace(/\n/g, '<br>')}
                 </div>
             </div>
        `;

        // Construct Plain Text Fallback
        const plainText = `Campaign: ${meta.url}\nDuration: ${meta.campaignDuration} days • ${meta.campaignAds} ads\n\nLibrary ID: ${meta.libId}\nDates: ${meta.adDates} | Ad Duration: ${meta.adDuration} days\n\n---\n\n${rawText}`;

        // Use rich text copy helper
        copyRichText(plainText, richText);

        const original = target.innerHTML;
        target.innerHTML = '✅ Copied!';
        target.classList.add('success');
        setTimeout(() => {
          target.innerHTML = original;
          target.classList.remove('success');
        }, 2000);
      });
    });
  }

  function updateView() {
    if (state.currentView === 'timeline') {
      renderTimeline();
    } else if (state.currentView === 'top5-text') {
      renderTop5Text();
    }
  }

  function processData(campaigns) {
    let sorted = [...campaigns];
    console.log('[FB Ads Visualizer] Processing data. Sort:', state.filterSort, 'Group:', state.groupByDomain);

    // 1. Sorting Logic
    // 0. Filter Logic
    if (state.filterText) {
      sorted = sorted.filter(c =>
        c.url.toLowerCase().includes(state.filterText) ||
        (c.top5 && c.top5.some(ad => ad.adText && ad.adText.toLowerCase().includes(state.filterText)))
      );
    }

    // 1. Sorting Logic
    sorted.sort((a, b) => {
      let valA, valB;

      if (state.filterSort === 'ads') {
        valA = Number(a.adsCount) || 0;
        valB = Number(b.adsCount) || 0;
      } else if (state.filterSort === 'duration') {
        valA = Number(a.campaignDurationDays) || 0;
        valB = Number(b.campaignDurationDays) || 0;
      } else {
        // 'recent' / Start Date
        valA = new Date(a.firstAdvertised).getTime();
        valB = new Date(b.firstAdvertised).getTime();
      }

      // Standard Ascending: valA - valB
      const comparison = valA - valB;

      // Apply Direction
      return state.sortDirection === 'asc' ? comparison : -comparison;
    });

    // 2. Grouping Logic (Secondary Sort)
    if (state.groupByDomain) {
      sorted.sort((a, b) => {
        const dA = getDomain(a.url);
        const dB = getDomain(b.url);
        if (dA < dB) return -1;
        if (dA > dB) return 1;
        // Keep previous sort order within same domain
        return 0;
      });
    }

    return sorted;
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  function renderTimeline() {
    const chartContent = document.getElementById('fbAdsChartContent');
    chartContent.classList.remove('fb-ads-bg-gray');
    chartContent.innerHTML = '';

    const campaignsToRender = processData(state.rawCampaigns);

    if (campaignsToRender.length === 0) {
      chartContent.innerHTML = '<div class="fb-ads-empty-state">No campaigns match criteria</div>';
      return;
    }

    const subtitle = document.getElementById('fbAdsSubtitle');
    if (state.rawCampaigns.length > 0) {
      const first = new Date(state.rawCampaigns[state.rawCampaigns.length - 1].firstAdvertised);
      const last = new Date(state.rawCampaigns[0].lastAdvertised); // Rough approx depending on sort
      subtitle.textContent = `${state.rawCampaigns.length} campaigns analyzed`;
    }


    // Determine Timeline Range
    let minDate = new Date();
    let maxDate = new Date(0);

    campaignsToRender.forEach(c => {
      if (c.firstAdvertised < minDate) minDate = c.firstAdvertised;
      if (c.lastAdvertised > maxDate) maxDate = c.lastAdvertised;
    });

    const dayMs = 86400000;
    // Ensure at least 1 day range to avoid division by zero
    let rangeMs = maxDate - minDate;
    if (rangeMs < dayMs) rangeMs = dayMs;

    // Add padding (max of 5 days or 10% of total range)
    const padding = Math.max(dayMs * 5, rangeMs * 0.1);

    const renderMin = new Date(minDate.getTime() - padding);
    const renderMax = new Date(maxDate.getTime() + padding);
    const totalDuration = renderMax - renderMin;

    // Header
    const header = document.createElement('div');
    header.className = 'fb-ads-timeline-header';
    header.innerHTML = `
       <div class="fb-ads-timeline-label"><strong>Campaign</strong></div>
       <div class="fb-ads-timeline-grid"></div>
    `;
    chartContent.appendChild(header);

    const grid = header.querySelector('.fb-ads-timeline-grid');

    // Adaptive Markers logic
    const isShortRange = rangeMs < (dayMs * 60);

    if (isShortRange) {
      // Weekly markers
      let d = new Date(renderMin);
      while (d <= renderMax) {
        const pos = ((d - renderMin) / totalDuration) * 100;
        if (pos >= 0 && pos <= 100) {
          const marker = document.createElement('div');
          marker.className = 'fb-ads-month-marker';
          marker.style.left = `${pos}%`;
          marker.innerHTML = `<div class="fb-ads-month-label">${d.toLocaleString('default', { month: 'short', day: 'numeric' })}</div>`;
          grid.appendChild(marker);
        }
        d.setDate(d.getDate() + 7);
      }
    } else {
      // Monthly markers
      let d = new Date(renderMin);
      d.setDate(1);
      while (d <= renderMax) {
        const pos = ((d - renderMin) / totalDuration) * 100;
        if (pos >= 0 && pos <= 100) {
          const marker = document.createElement('div');
          marker.className = 'fb-ads-month-marker';
          marker.style.left = `${pos}%`;
          marker.innerHTML = `<div class="fb-ads-month-label">${d.toLocaleString('default', { month: 'short', year: '2-digit' })}</div>`;
          grid.appendChild(marker);
        }
        d.setMonth(d.getMonth() + 1);
      }
    }

    // Render Rows
    let lastDomain = null;

    campaignsToRender.forEach(campaign => {
      // Domain Header for Grouping
      const domain = getDomain(campaign.url);
      if (state.groupByDomain && domain !== lastDomain) {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'fb-ads-domain-header';
        groupHeader.innerHTML = `<div class="fb-ads-domain-name">${domain}</div>`;
        chartContent.appendChild(groupHeader);
        lastDomain = domain;
      }

      const row = document.createElement('div');
      row.className = 'fb-ads-campaign-row';

      const left = ((campaign.firstAdvertised - renderMin) / totalDuration) * 100;
      const width = Math.max(0.5, ((campaign.lastAdvertised - campaign.firstAdvertised) / totalDuration) * 100);
      const color = getAdCountColor(campaign.adsCount);

      row.innerHTML = `
          <div class="fb-ads-campaign-info">
             <div class="fb-ads-campaign-url" title="${campaign.url}">
                <a href="${campaign.url}" target="_blank" style="color: inherit; text-decoration: none;">${campaign.url}</a>
                <span style="font-size: 11px; margin-left: 6px;">
                  (<a href="https://web.archive.org/web/*/${campaign.url}/*" target="_blank" style="color: #6b7280; text-decoration: underline;">Archive</a>)
                </span>
             </div>
             <div class="fb-ads-campaign-meta">
               ${campaign.campaignDurationDays} days • ${campaign.adsCount} ads
             </div>
          </div>
          <div class="fb-ads-campaign-timeline">
             <div class="fb-ads-timeline-bg-marker" style="left: ${left}%; width: ${width}%"></div> 
             <div class="fb-ads-campaign-bar" 
                  style="left: ${left}%; width: ${width}%; background: ${color}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
             </div>
          </div>
       `;

      // Tooltip logic for the bar
      setTimeout(() => {
        // We need to query the newly added row's bar. 
        // Since we appendChild(row) later, we can attach listeners to the element 'row' before appending?
        // Wait, the row is created via document.createElement('div') then appended.
        // So we can find the bar inside 'row' immediately.
        const bar = row.querySelector('.fb-ads-campaign-bar');
        if (bar) {
          bar.addEventListener('mouseenter', () => {
            const startDate = new Date(campaign.firstAdvertised).toLocaleDateString();
            const endDate = new Date(campaign.lastAdvertised).toLocaleDateString();

            tooltip.innerHTML = `
               <div class="fb-ads-tooltip-header">Campaign Details</div>
               <div class="fb-ads-tooltip-dates">${startDate} — ${endDate}</div>
               <a class="fb-ads-tooltip-action" id="fbAdsTooltipViewBtn">Click to View Top 5 Ads</a>
             `;
            tooltip.style.display = 'block';

            // Attach click listener to the link inside tooltip
            const viewBtn = tooltip.querySelector('#fbAdsTooltipViewBtn');
            if (viewBtn) {
              viewBtn.onclick = (e) => {
                e.stopPropagation();
                openCampaignDetails(campaign);
                tooltip.style.display = 'none';
              };
            }
          });

          bar.addEventListener('mousemove', (e) => {
            // Position tooltip near mouse but ensure it stays within viewport
            // Add slight offset so it doesn't flicker
            const x = e.clientX + 15;
            const y = e.clientY + 15;
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
          });

          bar.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
          });
        }
      }, 0);

      row.addEventListener('click', (e) => {
        // Don't open modal if clicking a link
        if (e.target.closest('a')) return;
        openCampaignDetails(campaign);
      });

      chartContent.appendChild(row);
    });
  }

  function renderTop5Text() {
    const chartContent = document.getElementById('fbAdsChartContent');
    chartContent.classList.add('fb-ads-bg-gray');
    const subtitle = document.getElementById('fbAdsSubtitle');
    subtitle.textContent = `Top 5 ads for ${state.rawCampaigns.length} campaigns`;

    if (!state.rawCampaigns || state.rawCampaigns.length === 0) {
      chartContent.innerHTML = '<div class="fb-ads-empty-state">No campaign data available</div>';
      return;
    }

    let output = '';
    const campaignsToRender = processData(state.rawCampaigns);

    campaignsToRender.forEach(campaign => {
      const formatDate = (dateStr) => new Date(dateStr).toDateString();
      const color = getAdCountColor(campaign.adsCount);

      output += `
        <div class="fb-ads-text-campaign fb-ads-card-white" style="border-left: 4px solid ${color};">
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
              <div class="fb-ads-grid">
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
                    <strong>Dates:</strong> ${new Date(ad.startingDate).toLocaleDateString()} — ${new Date(ad.endDate).toLocaleDateString()}<br>
                    <strong>Duration:</strong> ${ad.duration} days
                  </div>
                  <div class="fb-ads-text-ad-copy">
                     ${ad.mediaType === 'video'
          ? `<div style="margin-bottom: 8px;"><video src="${ad.mediaSrc}" controls style="max-width: 100%; height: auto; border-radius: 4px;"></video></div>`
          : (ad.mediaType === 'image' ? `<div style="margin-bottom: 8px;"><img src="${ad.mediaSrc}" style="max-width: 100%; height: auto; border-radius: 4px;"></div>` : '')
        }
                    <strong>Ad Copy:</strong><br>
                    ${ad.adText || '[no copy]'}
                  </div>
                </div>
              `).join('')}
              </div>
            </div>
          ` : '<div class="fb-ads-text-no-ads">No top ads data available</div>'}
        </div>
      `;
    });

    chartContent.innerHTML = `
      <div class="fb-ads-text-actions" style="margin-top: 15px; margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
        ${state.aiConfig ? `
        <button id="fbAdsAnalyzeBtn" class="fb-ads-btn fb-ads-btn-action">
          🤖 Analyze with AI
        </button>` : ''
      }
    <button id="fbAdsCopyAllTextBtn" class="fb-ads-btn fb-ads-btn-action">
      📋 Copy All Text
    </button>
      </div>
       <div id="fbAdsAIResult" style="display: none; padding: 12px 16px; margin-bottom: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; overflow: hidden;">
          <div class="fb-ads-ai-header" style="padding: 12px 16px; background: #dcfce7; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #bbf7d0;">
            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;">🤖 AI Analysis</div>
            <button class="fb-ads-ai-minimize" style="background: none; border: none; font-size: 18px; color: #166534; cursor: pointer; line-height: 1;">−</button>
          </div>
          <div class="fb-ads-ai-content" style="padding: 16px; white-space: pre-wrap;"></div>
       </div>
      <div class="fb-ads-text-output">${output}</div>
    `;

    // Toggle minimize
    const aiHeader = chartContent.querySelector('.fb-ads-ai-header');
    const aiContent = chartContent.querySelector('.fb-ads-ai-content');
    const minimizeBtn = chartContent.querySelector('.fb-ads-ai-minimize');

    if (aiHeader) {
      aiHeader.addEventListener('click', () => {
        const isHidden = aiContent.style.display === 'none';
        aiContent.style.display = isHidden ? 'block' : 'none';
        minimizeBtn.textContent = isHidden ? '−' : '+';
      });
    }

    // Restore AI Result if exists
    const resultDiv = document.getElementById('fbAdsAIResult');
    if (state.aiAnalysisResult) {
      const contentDiv = resultDiv.querySelector('.fb-ads-ai-content');
      contentDiv.innerHTML = state.aiAnalysisResult;
      resultDiv.style.display = 'block';
    }

    if (state.aiConfig) {
      document.getElementById('fbAdsAnalyzeBtn')?.addEventListener('click', analyzeWithAI);
    }

    document.getElementById('fbAdsCopyAllTextBtn')?.addEventListener('click', () => {
      const container = document.querySelector('.fb-ads-text-output');
      if (!container) return;

      // 1. Temporarily hide media
      const media = container.querySelectorAll('img, video');
      const originalDisplays = [];
      media.forEach(el => {
        originalDisplays.push(el.style.display);
        el.style.display = 'none';
      });

      // 2. Select content
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(container);
      selection.removeAllRanges();
      selection.addRange(range);

      // 3. Copy
      try {
        document.execCommand('copy');

        const btn = document.getElementById('fbAdsCopyAllTextBtn');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Copy failed:', err);
        alert('Copy failed');
      }

      // 4. Cleanup
      selection.removeAllRanges();
      media.forEach((el, i) => {
        el.style.display = originalDisplays[i];
      });
    });
  }

  function openCampaignDetails(campaign) {
    if (!campaign.top5 || campaign.top5.length === 0) return;

    let content = `<div class="fb-ads-list">`;

    campaign.top5.forEach((ad, index) => {
      const formatDate = (dateStr) => new Date(dateStr).toDateString();
      content += `
      <div class="fb-ads-card fb-ads-card-white">
              <div class="fb-ads-ad-header">
                <div class="fb-ads-ad-rank">
                   <div class="fb-ads-rank-number">#${index + 1}</div>
                   <div>
                     <div class="fb-ads-library-id-label">Library ID</div>
                     <a href="https://www.facebook.com/ads/library/?id=${ad.libraryId}" target="_blank" class="fb-ads-library-id-link">${ad.libraryId}</a>
                   </div>
                </div>
                <div class="fb-ads-ad-duration">
                   <div class="fb-ads-duration-label">Duration</div>
                   <div class="fb-ads-duration-value">${ad.duration} days</div>
                   <div class="fb-ads-modal-meta">${formatDate(ad.startingDate)} - ${formatDate(ad.endDate)}</div>
                </div>
              </div>
              <div class="fb-ads-ad-copy-section">
                 ${ad.mediaType === 'video'
          ? `<div class="fb-ads-ad-image" style="margin-bottom: 12px; text-align: center;"><video src="${ad.mediaSrc}" controls style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></video></div>`
          : (ad.mediaType === 'image' ? `<div class="fb-ads-ad-image" style="margin-bottom: 12px; text-align: center;"><img src="${ad.mediaSrc}" style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>` : '')
        }
                <div class="fb-ads-ad-copy-header">
                  <div class="fb-ads-ad-copy-label">Ad Copy</div>
                  <button class="fb-ads-copy-btn" 
                    data-copy-text="${encodeURIComponent(ad.adText || '')}"
                    data-url="${encodeURIComponent(campaign.url)}"
                    data-campaign-duration="${campaign.campaignDurationDays}"
                    data-campaign-ads="${campaign.adsCount}"
                    data-ad-lib-id="${ad.libraryId}"
                    data-ad-duration="${ad.duration}"
                    data-ad-dates="${formatDate(ad.startingDate)} — ${formatDate(ad.endDate)}"
                  >
                    📋 Copy
                  </button>
                </div>
                <div class="fb-ads-ad-copy">${ad.adText || '[No copy available]'}</div>
              </div>
          </div>
      `;
    });

    content += `</div>`;
    showModal(content, `${campaign.url} `, `${campaign.adsCount} total ads • ${campaign.campaignDurationDays} days active`);
  }

  // --- Data Management ---

  function downloadData() {
    // Generate filename properties
    const advertiser = (state.metadata?.advertiserName || 'fb_ads_analysis')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const count = state.rawCampaigns.length;

    // Calculate date range from all campaigns
    let minDate = new Date();
    let maxDate = new Date(0);

    state.rawCampaigns.forEach(c => {
      if (c.firstAdvertised < minDate) minDate = c.firstAdvertised;
      if (c.lastAdvertised > maxDate) maxDate = c.lastAdvertised;
    });

    // Helper for date formatting like "jan-1-2025"
    const formatDate = (d) => {
      const m = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      return `${m[d.getMonth()]} -${d.getDate()} -${d.getFullYear()} `;
    };

    const startStr = formatDate(minDate);
    const endStr = formatDate(maxDate);

    // Filename: peng-joon-fb-ads-8-campaigns-from-jan-1-2025-to-dec-24-2025.json
    const filename = `${advertiser} -fb - ads - ${count} -campaigns - from - ${startStr} -to - ${endStr}.json`;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      campaigns: state.rawCampaigns,
      allAds: state.allAds,
      metadata: state.metadata || { advertiserName: advertiser }, // Fallback metadata
      aiAnalysisResult: state.aiAnalysisResult || null
    }, null, 2));

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.campaigns) throw new Error("Invalid format");
        loadImportedData(json);
      } catch (err) {
        alert('Error importing file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function loadImportedData(importedData) {
    state.rawCampaigns = importedData.campaigns || [];
    state.allAds = importedData.allAds || [];
    state.metadata = importedData.metadata || null;
    state.isImported = !!importedData.isImported;
    state.aiAnalysisResult = importedData.aiAnalysisResult || null;

    // Hide Download Button if imported
    const downloadBtn = document.getElementById('fbAdsDownloadBtn');
    if (state.isImported) {
      downloadBtn.style.display = 'none';
    } else {
      downloadBtn.style.display = 'inline-flex';
    }

    // Parse dates
    state.rawCampaigns.forEach(c => {
      c.firstAdvertised = new Date(c.firstAdvertised);
      c.lastAdvertised = new Date(c.lastAdvertised);
      if (c.top5) {
        c.top5.forEach(ad => {
          // Check if date strings or objects
          ad.startingDate = new Date(ad.startingDate);
          ad.endDate = new Date(ad.endDate);
        });
      }
    });

    // Initial Sort
    state.rawCampaigns.sort((a, b) => new Date(b.firstAdvertised) - new Date(a.firstAdvertised));

    document.getElementById('fbAdsStatusText').textContent =
      `Loaded ${state.rawCampaigns.length} campaigns`;
    document.getElementById('fbAdsSpinner').style.display = 'none';

    updateView();
    showOverlay();
  }

  // --- AI Logic (CSP Fixed) ---

  async function analyzeWithAI() {
    const btn = document.getElementById('fbAdsAnalyzeBtn');
    const resultDiv = document.getElementById('fbAdsAIResult');

    if (!state.aiConfig || !state.aiConfig.apiKey) {
      alert('AI Configuration missing. Please check database settings.');
      return;
    }

    btn.disabled = true;
    btn.textContent = '🤖 Analyzing...';
    resultDiv.style.display = 'none';

    // Collect all ad texts
    let allAdTexts = [];
    state.rawCampaigns.forEach(c => {
      if (c.top5) {
        c.top5.forEach(ad => {
          if (ad.adText && ad.adText.length > 10) {
            allAdTexts.push(ad.adText);
          }
        });
      }
    });

    // Remove duplicates and limit
    allAdTexts = [...new Set(allAdTexts)].slice(0, 50);

    if (allAdTexts.length === 0) {
      alert('No ad text content found to analyze.');
      btn.disabled = false;
      btn.textContent = '🤖 Analyze with AI';
      return;
    }

    const systemPrompt = state.aiConfig.systemPrompt || "You are an expert marketing analyst. Analyze these Facebook ad copies and identify common hooks, pain points addressed, and CTAs used. Provide a concise bulleted summary of the strategy.";
    const userContent = "Analyze the following ad copies:\n\n" + allAdTexts.join("\n\n---\n\n");

    // Define response handler
    const handleResponse = (e) => {
      const response = e.detail;
      document.removeEventListener('fbAdsAnalyzeResponse', handleResponse);

      // Re-query elements to ensure we interact with the current DOM (view might have refreshed)
      const currentResultDiv = document.getElementById('fbAdsAIResult');
      const currentBtn = document.getElementById('fbAdsAnalyzeBtn');

      if (response && response.success) {
        // Markdown conversion simple replacement for bold/newlines if needed, 
        // but innerHTML preserves basic formatting mostly.
        const formatted = response.analysis.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        state.aiAnalysisResult = formatted; // Save state

        if (currentResultDiv) {
          const contentDiv = currentResultDiv.querySelector('.fb-ads-ai-content');
          if (contentDiv) {
            contentDiv.innerHTML = formatted;
          } else {
            // Fallback if structure is somehow missing
            currentResultDiv.innerHTML = `<strong>🤖 AI Analysis:</strong> <br><br>${formatted}`;
          }
          currentResultDiv.style.display = 'block';
        }
      } else {
        const errorMsg = response ? (response.error || 'Unknown error') : 'Unknown error';
        console.error('AI Analysis failed:', errorMsg);
        alert('Analysis failed: ' + errorMsg);
      }

      if (currentBtn) {
        currentBtn.disabled = false;
        currentBtn.textContent = '🤖 Analyze with AI';
      }
    };

    // Listen for response
    document.addEventListener('fbAdsAnalyzeResponse', handleResponse);

    // Dispatch request to content script -> background
    console.log('[FB Ads Visualizer] Dispatching AI analysis request');
    document.dispatchEvent(new CustomEvent('fbAdsAnalyzeRequest', {
      detail: {
        apiKey: state.aiConfig.apiKey,
        systemPrompt: systemPrompt,
        userContent: userContent
      }
    }));

    // Fallback/Timeout cleanup
    setTimeout(() => {
      // Re-query btn for timeout check
      const currentBtn = document.getElementById('fbAdsAnalyzeBtn');
      if (currentBtn && currentBtn.disabled && currentBtn.textContent === '🤖 Analyzing...') {
        document.removeEventListener('fbAdsAnalyzeResponse', handleResponse);
        currentBtn.disabled = false;
        currentBtn.textContent = '🤖 Analyze with AI';
        console.warn('[FB Ads Visualizer] AI request timed out');
      }
    }, 60000);
  }


  // --- Event Bridge ---

  // Listen for imported data via CustomEvent (from injected.js)
  document.addEventListener('fbAdsImportData', (event) => {
    console.log('[FB Ads Visualizer] Received imported data via CustomEvent');
    loadImportedData(event.detail);
  });

  // Listen for reopen request
  document.addEventListener('fbAdsReopen', () => {
    console.log('[FB Ads Visualizer] Reopening overlay');
    showOverlay();
  });

  // Listen for AI Config
  document.addEventListener('fbAdsConfig', (event) => {
    console.log('[FB Ads Visualizer] Received AI Config');
    state.aiConfig = event.detail;
    updateView(); // Re-render to show AI button if needed
  });

  // Listen for Scraping Status
  document.addEventListener('fbAdsStatus', (event) => {
    const { scrolling, adsFound, message } = event.detail;

    // Ensure overlay is visible but minimized
    if (scrolling) {
      overlay.classList.remove('hidden');
      overlay.classList.add('minimized');
      state.isMinimized = true;
    }

    const minBar = document.getElementById('fbAdsMinimizedBar');
    const icon = minBar.querySelector('.fb-ads-mini-icon');
    const text = minBar.querySelector('.fb-ads-mini-text');
    const btn = document.getElementById('fbAdsMaximizeBtn');

    if (scrolling) {
      icon.innerHTML = '<span class="fb-ads-mini-spinner">🔄</span>';
      text.textContent = message;
      // minBar.style.background = 'linear-gradient(to right, #f59e0b, #d97706)'; // Removed to match styling
      btn.style.display = 'none'; // Hide "Show" button while scraping

      // Add spinner style if not exists
      if (!document.getElementById('fbAdsMiniSpinnerStyle')) {
        const style = document.createElement('style');
        style.id = 'fbAdsMiniSpinnerStyle';
        style.textContent = `
      @keyframes fbAdsSpin {100 % { transform: rotate(360deg); }}
      .fb-ads-mini-spinner {display: inline-block; animation: fbAdsSpin 1s linear infinite; }
      `;
        document.head.appendChild(style);
      }
    } else {
      // Done
      icon.innerHTML = `<img src="${logoUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`;
      text.textContent = 'Analysis Ready!';
      minBar.style.background = ''; // Revert to default blue/purple
      btn.style.display = 'block';
    }
  });

  // Expose reopen helper
  window.fbAdsReopenOverlay = showOverlay;

  // Check for pre-injected data (from file import)
  const preInjectedData = document.getElementById('fbAdsImportedData');
  if (preInjectedData) {
    try {
      const json = JSON.parse(preInjectedData.textContent);
      console.log('[FB Ads Visualizer] Found pre-injected data, loading...');
      loadImportedData(json);
      // Clean up
      preInjectedData.remove();
    } catch (e) {
      console.error('[FB Ads Visualizer] Error loading pre-injected data:', e);
    }
  }

})();
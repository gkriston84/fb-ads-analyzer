(function() {
  var _a;
  console.log("[FB Ads Analyzer] Visualizer script loaded");
  const ICONS = {
    timeline: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2v-4h2v4zm4 0h-2v-2h2v2z"/></svg>',
    top5: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 21h16v2H4zM6 7h12v2H6zM6 11h12v2H6zM6 15h8v2H6z"/></svg>',
    folder: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
    save: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
    ai: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>',
    refresh: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
    arrowUp: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>',
    arrowDown: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>'
  };
  const state = {
    rawCampaigns: [],
    allAds: [],
    filterText: "",
    filterSort: "recent",
    // 'recent', 'duration', 'ads'
    groupByDomain: false,
    isMinimized: true,
    currentView: "timeline",
    // 'timeline', 'top5-text', 'all-copy'
    aiConfig: null,
    metadata: null,
    sortDirection: "asc",
    // 'asc' or 'desc'
    isImported: false
  };
  function getAdCountColor(count) {
    if (count >= 100) return "#ef4444";
    if (count >= 50) return "#f97316";
    if (count >= 20) return "#eab308";
    if (count >= 10) return "#22c55e";
    if (count >= 5) return "#3b82f6";
    return "#8b5cf6";
  }
  const configEl = document.getElementById("fbAdsConfig");
  const logoUrl = ((_a = configEl == null ? void 0 : configEl.dataset) == null ? void 0 : _a.logoUrl) || "";
  const overlay = document.createElement("div");
  overlay.id = "fbAdsAnalyzerOverlay";
  overlay.className = "hidden minimized";
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
                <h1>Facebook Ads Campaign Analyzer <span style="font-size: 14px; font-weight: normal; color: #6b7280;">by <a href="https://wizard.funnel.expert" target="_blank" style="color: #6b7280; text-decoration: none;">Funnel Wizard</a></span></h1>
                <p id="fbAdsSubtitle">Timeline & Campaign Analysis</p>
              </div>
            </div>
            <div class="fb-ads-header-actions">
              <button class="fb-ads-header-btn" id="fbAdsMinimizeBtn" title="Minimize">_</button>
              <button class="fb-ads-header-btn" id="fbAdsCloseBtn" title="Close">×</button>
            </div>
          </div>
          
          <div class="fb-ads-controls">
            <div class="fb-ads-control-row" style="display: flex; justify-content: space-between; width: 100%; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div class="fb-ads-control-group">
                  <span style="font-weight: 500; font-size: 13px; color: #374151;">View:</span>
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-view="timeline">${ICONS.timeline} Timeline</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-view="top5-text">${ICONS.top5} Top 5 Text</button>
                </div>

                 <div class="fb-ads-control-group">
                  <span style="font-weight: 500; font-size: 13px; color: #374151;">Sort:</span>
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-sort="recent">Start Date</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="duration">Duration</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="ads"># of Ads</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" id="fbAdsGroupDomainBtn" title="Group campaigns by domain">${ICONS.folder} Group by Domain</button>
                </div>

                 <div class="fb-ads-control-group" style="flex: 1; max-width: 300px;">
                   <input type="text" id="fbAdsFilterInput" class="fb-ads-input" placeholder="Filter campaigns..." style="width: 100%;">
                 </div>
                
                <div class="fb-ads-control-group" style="margin-left: auto;">
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsDownloadBtn">${ICONS.save} Download Data</button>
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsImportBtn">${ICONS.folder} Import Data</button>
                    <input type="file" id="fbAdsImportInput" style="display: none;" accept=".json">
                </div>
            </div>
           </div>

           <div class="fb-ads-legend" id="fbAdsTimelineLegend" style="display: flex; width: 100%; gap: 16px; padding: 12px 24px; border-bottom: 1px solid #e5e7eb; background: #fafafa;">
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #8b5cf6;"></div> 1-4 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #3b82f6;"></div> 5-9 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #22c55e;"></div> 10-19 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #eab308;"></div> 20-49 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #f97316;"></div> 50-99 ads</div>
                <div class="fb-ads-legend-item"><div class="fb-ads-legend-color" style="background: #ef4444;"></div> 100+ ads</div>
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
  const tooltip = document.createElement("div");
  tooltip.className = "fb-ads-tooltip";
  overlay.appendChild(tooltip);
  document.getElementById("fbAdsCloseBtn").addEventListener("click", hideOverlay);
  document.getElementById("fbAdsMinimizeBtn").addEventListener("click", toggleMinimize);
  document.getElementById("fbAdsMaximizeBtn").addEventListener("click", toggleMinimize);
  document.getElementById("fbAdsMinimizedBar").addEventListener("click", toggleMinimize);
  document.getElementById("fbAdsModalClose").addEventListener("click", hideModal);
  document.getElementById("fbAdsModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "fbAdsModalOverlay") hideModal();
  });
  const filterInput = document.getElementById("fbAdsFilterInput");
  filterInput.addEventListener("input", (e) => {
    state.filterText = e.target.value.toLowerCase();
    updateView();
  });
  document.getElementById("fbAdsDownloadBtn").addEventListener("click", downloadData);
  document.getElementById("fbAdsImportBtn").addEventListener("click", () => {
    document.getElementById("fbAdsImportInput").click();
  });
  document.getElementById("fbAdsImportInput").addEventListener("change", handleFileImport);
  const viewButtons = document.querySelectorAll("[data-view]");
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      viewButtons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      state.currentView = e.target.getAttribute("data-view");
      const legend = document.getElementById("fbAdsTimelineLegend");
      if (state.currentView === "timeline") {
        legend.style.display = "flex";
      } else {
        legend.style.display = "none";
      }
      updateView();
    });
  });
  const sortButtons = document.querySelectorAll("[data-sort]");
  const updateSortButtons = () => {
    sortButtons.forEach((btn) => {
      const sortType = btn.getAttribute("data-sort");
      let baseLabel = "";
      if (sortType === "recent") baseLabel = "Start Date";
      if (sortType === "duration") baseLabel = "Duration";
      if (sortType === "ads") baseLabel = "# of Ads";
      let inner = baseLabel;
      if (state.filterSort === sortType) {
        btn.classList.add("active");
        inner += state.sortDirection === "asc" ? ` ${ICONS.arrowUp}` : ` ${ICONS.arrowDown}`;
      } else {
        btn.classList.remove("active");
      }
      btn.innerHTML = inner;
    });
  };
  sortButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetSort = e.target.getAttribute("data-sort");
      if (state.filterSort === targetSort) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        if (targetSort === "recent") {
          state.sortDirection = "asc";
        } else {
          state.sortDirection = "desc";
        }
        state.filterSort = targetSort;
      }
      updateSortButtons();
      updateView();
    });
  });
  updateSortButtons();
  const groupBtn = document.getElementById("fbAdsGroupDomainBtn");
  groupBtn.addEventListener("click", () => {
    state.groupByDomain = !state.groupByDomain;
    groupBtn.classList.toggle("active");
    updateView();
  });
  function showOverlay() {
    overlay.classList.remove("hidden");
    overlay.classList.remove("minimized");
    state.isMinimized = false;
  }
  function hideOverlay() {
    overlay.classList.add("hidden");
  }
  function toggleMinimize(e) {
    if (e) e.stopPropagation();
    state.isMinimized = !state.isMinimized;
    if (state.isMinimized) {
      overlay.classList.add("minimized");
    } else {
      overlay.classList.remove("minimized");
    }
  }
  function showModal(contentHtml, title, meta) {
    document.getElementById("fbAdsModalTitle").innerText = title;
    document.getElementById("fbAdsModalMeta").innerText = meta;
    document.getElementById("fbAdsModalBody").innerHTML = contentHtml;
    document.getElementById("fbAdsModalOverlay").style.display = "flex";
    setupCopyButtons(document.getElementById("fbAdsModalBody"));
  }
  function hideModal() {
    document.getElementById("fbAdsModalOverlay").style.display = "none";
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
      ]).catch((err) => {
        console.error("Rich copy failed, falling back to plain:", err);
        navigator.clipboard.writeText(plain);
      });
    } else {
      navigator.clipboard.writeText(plain);
    }
  }
  function setupCopyButtons(container) {
    const copyBtns = container.querySelectorAll(".fb-ads-copy-btn");
    copyBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const rawText = decodeURIComponent(target.dataset.copyText);
        const meta = {
          url: target.dataset.url ? decodeURIComponent(target.dataset.url) : "",
          campaignDuration: target.dataset.campaignDuration || "",
          campaignAds: target.dataset.campaignAds || "",
          libId: target.dataset.adLibId || "",
          adDuration: target.dataset.adDuration || "",
          adDates: target.dataset.adDates || ""
        };
        const richText = `
             <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #374151;">
                 <p style="margin-bottom: 8px;">
                    <strong>Campaign:</strong> <a href="${meta.url}">${meta.url}</a><br>
                    ${meta.campaignDuration ? `<strong>Duration:</strong> ${meta.campaignDuration} days` : ""} 
                    ${meta.campaignAds ? `• ${meta.campaignAds} ads` : ""}
                 </p>
                 <p style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                    <strong>Library ID:</strong> <a href="https://www.facebook.com/ads/library/?id=${meta.libId}">${meta.libId}</a><br>
                    <strong>Dates:</strong> ${meta.adDates} | <strong>Ad Duration:</strong> ${meta.adDuration} days
                 </p>
                 <div>
                    ${rawText.replace(/\n/g, "<br>")}
                 </div>
             </div>
        `;
        const plainText = `Campaign: ${meta.url}
Duration: ${meta.campaignDuration} days • ${meta.campaignAds} ads

Library ID: ${meta.libId}
Dates: ${meta.adDates} | Ad Duration: ${meta.adDuration} days

---

${rawText}`;
        copyRichText(plainText, richText);
        const original = target.innerHTML;
        target.innerHTML = `${ICONS.check} Copied!`;
        target.classList.add("success");
        setTimeout(() => {
          target.innerHTML = original;
          target.classList.remove("success");
        }, 2e3);
      });
    });
  }
  function updateView() {
    if (state.currentView === "timeline") {
      renderTimeline();
    } else if (state.currentView === "top5-text") {
      renderTop5Text();
    }
  }
  function processData(campaigns) {
    let sorted = [...campaigns];
    console.log("[FB Ads Visualizer] Processing data. Sort:", state.filterSort, "Group:", state.groupByDomain);
    if (state.filterText) {
      sorted = sorted.filter(
        (c) => c.url.toLowerCase().includes(state.filterText) || c.top5 && c.top5.some((ad) => ad.adText && ad.adText.toLowerCase().includes(state.filterText))
      );
    }
    sorted.sort((a, b) => {
      let valA, valB;
      if (state.filterSort === "ads") {
        valA = Number(a.adsCount) || 0;
        valB = Number(b.adsCount) || 0;
      } else if (state.filterSort === "duration") {
        valA = Number(a.campaignDurationDays) || 0;
        valB = Number(b.campaignDurationDays) || 0;
      } else {
        valA = new Date(a.firstAdvertised).getTime();
        valB = new Date(b.firstAdvertised).getTime();
      }
      const comparison = valA - valB;
      return state.sortDirection === "asc" ? comparison : -comparison;
    });
    if (state.groupByDomain) {
      sorted.sort((a, b) => {
        const dA = getDomain(a.url);
        const dB = getDomain(b.url);
        if (dA < dB) return -1;
        if (dA > dB) return 1;
        return 0;
      });
    }
    return sorted;
  }
  function getDomain(url) {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  }
  function renderTimeline() {
    const chartContent = document.getElementById("fbAdsChartContent");
    chartContent.classList.remove("fb-ads-bg-gray");
    chartContent.innerHTML = "";
    const campaignsToRender = processData(state.rawCampaigns);
    if (campaignsToRender.length === 0) {
      chartContent.innerHTML = '<div class="fb-ads-empty-state">No campaigns match criteria</div>';
      return;
    }
    const subtitle = document.getElementById("fbAdsSubtitle");
    if (state.rawCampaigns.length > 0) {
      new Date(state.rawCampaigns[state.rawCampaigns.length - 1].firstAdvertised);
      new Date(state.rawCampaigns[0].lastAdvertised);
      subtitle.textContent = `${state.rawCampaigns.length} campaigns analyzed`;
    }
    let minDate = /* @__PURE__ */ new Date();
    let maxDate = /* @__PURE__ */ new Date(0);
    campaignsToRender.forEach((c) => {
      if (c.firstAdvertised < minDate) minDate = c.firstAdvertised;
      if (c.lastAdvertised > maxDate) maxDate = c.lastAdvertised;
    });
    const dayMs = 864e5;
    let rangeMs = maxDate - minDate;
    if (rangeMs < dayMs) rangeMs = dayMs;
    const padding = Math.max(dayMs * 5, rangeMs * 0.1);
    const renderMin = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endOfMaxDateMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const renderMax = new Date(Math.min(maxDate.getTime() + padding, endOfMaxDateMonth.getTime()));
    const totalDuration = renderMax - renderMin;
    const header = document.createElement("div");
    header.className = "fb-ads-timeline-header";
    header.innerHTML = `
       <div class="fb-ads-timeline-label"><strong>Campaign</strong></div>
       <div class="fb-ads-timeline-grid"></div>
    `;
    chartContent.appendChild(header);
    const grid = header.querySelector(".fb-ads-timeline-grid");
    let gridLinesHTML = "";
    const isShortRange = rangeMs < dayMs * 60;
    if (isShortRange) {
      let d = new Date(renderMin);
      while (d <= renderMax) {
        const pos = (d - renderMin) / totalDuration * 100;
        if (pos >= 0 && pos <= 100) {
          const marker = document.createElement("div");
          marker.className = "fb-ads-month-marker";
          marker.style.left = `${pos}%`;
          marker.innerHTML = `<div class="fb-ads-month-label">${d.toLocaleString("default", { month: "short", day: "numeric" })}</div>`;
          grid.appendChild(marker);
          gridLinesHTML += `<div class="fb-ads-grid-line" style="left: ${pos}%"></div>`;
        }
        d.setDate(d.getDate() + 7);
      }
    } else {
      let d = new Date(renderMin);
      d.setDate(1);
      while (d <= renderMax) {
        const pos = (d - renderMin) / totalDuration * 100;
        if (pos >= 0 && pos <= 100) {
          const marker = document.createElement("div");
          marker.className = "fb-ads-month-marker";
          marker.style.left = `${pos}%`;
          marker.innerHTML = `<div class="fb-ads-month-label">${d.toLocaleString("default", { month: "short", year: "2-digit" })}</div>`;
          grid.appendChild(marker);
          gridLinesHTML += `<div class="fb-ads-grid-line" style="left: ${pos}%"></div>`;
        }
        d.setMonth(d.getMonth() + 1);
      }
    }
    const bodyContainer = document.createElement("div");
    bodyContainer.className = "fb-ads-timeline-body";
    bodyContainer.style.position = "relative";
    const gridLayer = document.createElement("div");
    gridLayer.className = "fb-ads-global-grid";
    gridLayer.innerHTML = `
       <div class="fb-ads-grid-spacer"></div>
       <div class="fb-ads-grid-area">${gridLinesHTML}</div>
    `;
    bodyContainer.appendChild(gridLayer);
    let lastDomain = null;
    campaignsToRender.forEach((campaign) => {
      const domain = getDomain(campaign.url);
      if (state.groupByDomain && domain !== lastDomain) {
        const groupHeader = document.createElement("div");
        groupHeader.className = "fb-ads-domain-header";
        groupHeader.innerHTML = `<div class="fb-ads-domain-name">${domain}</div>`;
        bodyContainer.appendChild(groupHeader);
        lastDomain = domain;
      }
      const row = document.createElement("div");
      row.className = "fb-ads-campaign-row";
      const left = (campaign.firstAdvertised - renderMin) / totalDuration * 100;
      const width = Math.max(0.5, (campaign.lastAdvertised - campaign.firstAdvertised) / totalDuration * 100);
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
      setTimeout(() => {
        const bar = row.querySelector(".fb-ads-campaign-bar");
        if (bar) {
          bar.addEventListener("mouseenter", () => {
            const startDate = new Date(campaign.firstAdvertised).toLocaleDateString();
            const endDate = new Date(campaign.lastAdvertised).toLocaleDateString();
            tooltip.innerHTML = `
               <div class="fb-ads-tooltip-header">Campaign Details</div>
               <div class="fb-ads-tooltip-dates">${startDate} — ${endDate}</div>
               <a class="fb-ads-tooltip-action" id="fbAdsTooltipViewBtn">Click to View Top 5 Ads</a>
             `;
            tooltip.style.display = "block";
            const viewBtn = tooltip.querySelector("#fbAdsTooltipViewBtn");
            if (viewBtn) {
              viewBtn.onclick = (e) => {
                e.stopPropagation();
                openCampaignDetails(campaign);
                tooltip.style.display = "none";
              };
            }
          });
          bar.addEventListener("mousemove", (e) => {
            const x = e.clientX + 15;
            const y = e.clientY + 15;
            tooltip.style.left = x + "px";
            tooltip.style.top = y + "px";
          });
          bar.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
          });
        }
      }, 0);
      row.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        openCampaignDetails(campaign);
      });
      bodyContainer.appendChild(row);
    });
    chartContent.appendChild(bodyContainer);
  }
  function renderTop5Text() {
    var _a2, _b;
    const chartContent = document.getElementById("fbAdsChartContent");
    chartContent.classList.add("fb-ads-bg-gray");
    const subtitle = document.getElementById("fbAdsSubtitle");
    subtitle.textContent = `Top 5 ads for ${state.rawCampaigns.length} campaigns`;
    if (!state.rawCampaigns || state.rawCampaigns.length === 0) {
      chartContent.innerHTML = '<div class="fb-ads-empty-state">No campaign data available</div>';
      return;
    }
    let output = "";
    const campaignsToRender = processData(state.rawCampaigns);
    campaignsToRender.forEach((campaign) => {
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
              ${campaign.top5.map((ad) => `
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
                     ${ad.mediaType === "video" ? `<div style="margin-bottom: 8px;"><video src="${ad.mediaSrc}" controls style="max-width: 100%; height: auto; border-radius: 4px;"></video></div>` : ad.mediaType === "image" ? `<div style="margin-bottom: 8px;"><img src="${ad.mediaSrc}" style="max-width: 100%; height: auto; border-radius: 4px;"></div>` : ""}
                    <strong>Ad Copy:</strong><br>
                    ${ad.adText || "[no copy]"}
                  </div>
                </div>
              `).join("")}
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
          ${ICONS.ai} Analyze with AI
        </button>` : ""}
    <button id="fbAdsCopyAllTextBtn" class="fb-ads-btn fb-ads-btn-action">
      ${ICONS.copy} Copy All Text
    </button>
      </div>
       <div id="fbAdsAIResult" style="display: none; margin-bottom: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; overflow: hidden;">
          <div class="fb-ads-ai-header" style="padding: 12px 16px; background: #dcfce7; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #bbf7d0;">
            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;">${ICONS.ai} AI Analysis</div>
            <button class="fb-ads-ai-minimize" style="background: none; border: none; font-size: 18px; color: #166534; cursor: pointer; line-height: 1;">−</button>
          </div>
          <div class="fb-ads-ai-content" style="padding: 16px; white-space: pre-wrap;"></div>
       </div>
      <div class="fb-ads-text-output">${output}</div>
    `;
    const aiHeader = chartContent.querySelector(".fb-ads-ai-header");
    const aiContent = chartContent.querySelector(".fb-ads-ai-content");
    const minimizeBtn = chartContent.querySelector(".fb-ads-ai-minimize");
    if (aiHeader) {
      aiHeader.addEventListener("click", () => {
        const isHidden = aiContent.style.display === "none";
        aiContent.style.display = isHidden ? "block" : "none";
        minimizeBtn.textContent = isHidden ? "−" : "+";
      });
    }
    const resultDiv = document.getElementById("fbAdsAIResult");
    if (state.aiAnalysisResult) {
      const contentDiv = resultDiv.querySelector(".fb-ads-ai-content");
      contentDiv.innerHTML = state.aiAnalysisResult;
      resultDiv.style.display = "block";
    }
    if (state.aiConfig) {
      (_a2 = document.getElementById("fbAdsAnalyzeBtn")) == null ? void 0 : _a2.addEventListener("click", analyzeWithAI);
    }
    (_b = document.getElementById("fbAdsCopyAllTextBtn")) == null ? void 0 : _b.addEventListener("click", () => {
      const container = document.querySelector(".fb-ads-text-output");
      if (!container) return;
      const media = container.querySelectorAll("img, video");
      const originalDisplays = [];
      media.forEach((el) => {
        originalDisplays.push(el.style.display);
        el.style.display = "none";
      });
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(container);
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand("copy");
        const btn = document.getElementById("fbAdsCopyAllTextBtn");
        const originalText = btn.innerHTML;
        btn.innerHTML = `${ICONS.check} Copied!`;
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2e3);
      } catch (err) {
        console.error("Copy failed:", err);
        alert("Copy failed");
      }
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
                 ${ad.mediaType === "video" ? `<div class="fb-ads-ad-image" style="margin-bottom: 12px; text-align: center;"><video src="${ad.mediaSrc}" controls style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></video></div>` : ad.mediaType === "image" ? `<div class="fb-ads-ad-image" style="margin-bottom: 12px; text-align: center;"><img src="${ad.mediaSrc}" style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>` : ""}
                <div class="fb-ads-ad-copy-header">
                  <div class="fb-ads-ad-copy-label">Ad Copy</div>
                  <button class="fb-ads-copy-btn" 
                    data-copy-text="${encodeURIComponent(ad.adText || "")}"
                    data-url="${encodeURIComponent(campaign.url)}"
                    data-campaign-duration="${campaign.campaignDurationDays}"
                    data-campaign-ads="${campaign.adsCount}"
                    data-ad-lib-id="${ad.libraryId}"
                    data-ad-duration="${ad.duration}"
                    data-ad-dates="${formatDate(ad.startingDate)} — ${formatDate(ad.endDate)}"
                  >
                    ${ICONS.copy} Copy
                  </button>
                </div>
                <div class="fb-ads-ad-copy">${ad.adText || "[No copy available]"}</div>
              </div>
          </div>
      `;
    });
    content += `</div>`;
    showModal(content, `${campaign.url} `, `${campaign.adsCount} total ads • ${campaign.campaignDurationDays} days active`);
  }
  function downloadData() {
    var _a2;
    const advertiser = (((_a2 = state.metadata) == null ? void 0 : _a2.advertiserName) || "fb_ads_analysis").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const count = state.rawCampaigns.length;
    let minDate = /* @__PURE__ */ new Date();
    let maxDate = /* @__PURE__ */ new Date(0);
    state.rawCampaigns.forEach((c) => {
      if (c.firstAdvertised < minDate) minDate = c.firstAdvertised;
      if (c.lastAdvertised > maxDate) maxDate = c.lastAdvertised;
    });
    const formatDate = (d) => {
      const m = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      return `${m[d.getMonth()]} -${d.getDate()} -${d.getFullYear()} `;
    };
    const startStr = formatDate(minDate);
    const endStr = formatDate(maxDate);
    const filename = `${advertiser} -fb - ads - ${count} -campaigns - from - ${startStr} -to - ${endStr}.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      campaigns: state.rawCampaigns,
      allAds: state.allAds,
      metadata: state.metadata || { advertiserName: advertiser },
      // Fallback metadata
      aiAnalysisResult: state.aiAnalysisResult || null
    }, null, 2));
    const downloadAnchorNode = document.createElement("a");
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
        alert("Error importing file: " + err.message);
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
    const downloadBtn = document.getElementById("fbAdsDownloadBtn");
    if (state.isImported) {
      downloadBtn.style.display = "none";
    } else {
      downloadBtn.style.display = "inline-flex";
    }
    state.rawCampaigns.forEach((c) => {
      c.firstAdvertised = new Date(c.firstAdvertised);
      c.lastAdvertised = new Date(c.lastAdvertised);
      if (c.top5) {
        c.top5.forEach((ad) => {
          ad.startingDate = new Date(ad.startingDate);
          ad.endDate = new Date(ad.endDate);
        });
      }
    });
    state.rawCampaigns.sort((a, b) => new Date(b.firstAdvertised) - new Date(a.firstAdvertised));
    updateView();
    showOverlay();
  }
  async function analyzeWithAI() {
    const btn = document.getElementById("fbAdsAnalyzeBtn");
    const resultDiv = document.getElementById("fbAdsAIResult");
    if (!state.aiConfig) {
      alert("AI Configuration missing. Please check database settings.");
      return;
    }
    btn.disabled = true;
    btn.innerHTML = `${ICONS.ai} Analyzing...`;
    resultDiv.style.display = "none";
    let structuredContent = [];
    const safeDate = (d) => {
      try {
        return new Date(d).toLocaleDateString();
      } catch (e) {
        return "N/A";
      }
    };
    state.rawCampaigns.forEach((c) => {
      if (!c.top5 || c.top5.length === 0) return;
      let hasValidAds = false;
      let campaignBlock = `CAMPAIGN: ${c.url}
`;
      campaignBlock += `METADATA: Duration: ${c.campaignDurationDays} days | Ads Count: ${c.adsCount} | Active: ${safeDate(c.firstAdvertised)} to ${safeDate(c.lastAdvertised)}
`;
      campaignBlock += `TOP ADS:
`;
      c.top5.forEach((ad, index) => {
        if (!ad.adText || ad.adText.length < 5) return;
        hasValidAds = true;
        campaignBlock += `  [Ad #${index + 1}] LibID: ${ad.libraryId} | Duration: ${ad.duration} days | Dates: ${safeDate(ad.startingDate)} - ${safeDate(ad.endDate)}
`;
        campaignBlock += `  TEXT: ${ad.adText.replace(/\n\s*\n/g, "\n").trim()}

`;
      });
      campaignBlock += `--------------------------------------------------
`;
      if (hasValidAds) {
        structuredContent.push(campaignBlock);
      }
    });
    if (structuredContent.length === 0) {
      alert("No valid ad content found to analyze.");
      btn.disabled = false;
      btn.innerHTML = `${ICONS.ai} Analyze with AI`;
      return;
    }
    let finalString = structuredContent.join("\n");
    if (finalString.length > 4e4) {
      finalString = finalString.substring(0, 4e4) + "\n...[TRUNCATED DATA]";
    }
    const systemPrompt = state.aiConfig.systemPrompt || "You are an expert marketing analyst. Analyze these Facebook ad campaigns. Look for patterns in the successful ads (high duration, high count). Identify hooks, angles, and structures that are working across the timeline. Focus on the Top Ads provided for each campaign.";
    const userContent = "Analyze the following campaign performance data:\n\n" + finalString;
    const handleResponse = (e) => {
      const response = e.detail;
      document.removeEventListener("fbAdsAnalyzeResponse", handleResponse);
      const currentResultDiv = document.getElementById("fbAdsAIResult");
      const currentBtn = document.getElementById("fbAdsAnalyzeBtn");
      if (response && response.success) {
        const formatted = response.analysis.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        state.aiAnalysisResult = formatted;
        if (currentResultDiv) {
          const contentDiv = currentResultDiv.querySelector(".fb-ads-ai-content");
          if (contentDiv) {
            contentDiv.innerHTML = formatted;
          } else {
            currentResultDiv.innerHTML = `<strong>${ICONS.ai} AI Analysis:</strong> <br><br>${formatted}`;
          }
          currentResultDiv.style.display = "block";
        }
      } else {
        const errorMsg = response ? response.error || "Unknown error" : "Unknown error";
        console.error("AI Analysis failed:", errorMsg);
        alert("Analysis failed: " + errorMsg);
      }
      if (currentBtn) {
        currentBtn.disabled = false;
        currentBtn.innerHTML = `${ICONS.ai} Analyze with AI`;
      }
    };
    document.addEventListener("fbAdsAnalyzeResponse", handleResponse);
    console.log("[FB Ads Visualizer] Dispatching AI analysis request");
    document.dispatchEvent(new CustomEvent("fbAdsAnalyzeRequest", {
      detail: {
        systemPrompt,
        userContent
      }
    }));
    setTimeout(() => {
      const currentBtn = document.getElementById("fbAdsAnalyzeBtn");
      if (currentBtn && currentBtn.disabled && currentBtn.innerHTML.includes("Analyzing")) {
        document.removeEventListener("fbAdsAnalyzeResponse", handleResponse);
        currentBtn.disabled = false;
        currentBtn.innerHTML = `${ICONS.ai} Analyze with AI`;
        console.warn("[FB Ads Visualizer] AI request timed out");
      }
    }, 6e4);
  }
  document.addEventListener("fbAdsImportData", (event) => {
    console.log("[FB Ads Visualizer] Received imported data via CustomEvent");
    loadImportedData(event.detail);
  });
  document.addEventListener("fbAdsReopen", () => {
    console.log("[FB Ads Visualizer] Reopening overlay");
    showOverlay();
  });
  document.addEventListener("fbAdsConfig", (event) => {
    console.log("[FB Ads Visualizer] Received AI Config");
    state.aiConfig = event.detail;
    updateView();
  });
  document.addEventListener("fbAdsStatus", (event) => {
    const { scrolling, adsFound, message } = event.detail;
    if (scrolling) {
      overlay.classList.remove("hidden");
      overlay.classList.add("minimized");
      state.isMinimized = true;
    }
    const minBar = document.getElementById("fbAdsMinimizedBar");
    const icon = minBar.querySelector(".fb-ads-mini-icon");
    const text = minBar.querySelector(".fb-ads-mini-text");
    const btn = document.getElementById("fbAdsMaximizeBtn");
    if (scrolling) {
      icon.innerHTML = `<span class="fb-ads-mini-spinner">${ICONS.refresh}</span>`;
      text.textContent = message;
      btn.style.display = "none";
      if (!document.getElementById("fbAdsMiniSpinnerStyle")) {
        const style = document.createElement("style");
        style.id = "fbAdsMiniSpinnerStyle";
        style.textContent = `
      @keyframes fbAdsSpin {100 % { transform: rotate(360deg); }}
      .fb-ads-mini-spinner {display: inline-block; animation: fbAdsSpin 1s linear infinite; }
      .fb-ads-mini-spinner svg { width: 20px; height: 20px; }
      `;
        document.head.appendChild(style);
      }
    } else {
      icon.innerHTML = `<img src="${logoUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`;
      text.textContent = "Analysis Ready!";
      minBar.style.background = "";
      btn.style.display = "block";
    }
  });
  window.fbAdsReopenOverlay = showOverlay;
  const preInjectedData = document.getElementById("fbAdsImportedData");
  if (preInjectedData) {
    try {
      const json = JSON.parse(preInjectedData.textContent);
      console.log("[FB Ads Visualizer] Found pre-injected data, loading...");
      loadImportedData(json);
      preInjectedData.remove();
    } catch (e) {
      console.error("[FB Ads Visualizer] Error loading pre-injected data:", e);
    }
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXplci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Zpc3VhbGl6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogRmFjZWJvb2sgQWRzIEFuYWx5emVyIC0gVmlzdWFsaXplciBTY3JpcHQgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgY29uc29sZS5sb2coJ1tGQiBBZHMgQW5hbHl6ZXJdIFZpc3VhbGl6ZXIgc2NyaXB0IGxvYWRlZCcpO1xyXG5cclxuICAvLyBJY29ucyBDb25maWd1cmF0aW9uXHJcbiAgY29uc3QgSUNPTlMgPSB7XHJcbiAgICB0aW1lbGluZTogJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+PHBhdGggZD1cIk0xOSAzSDVjLTEuMSAwLTIgLjktMiAydjE0YzAgMS4xLjkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMnpNOSAxN0g3di03aDJ2N3ptNCAwaC0ydi00aDJ2NHptNCAwaC0ydi0yaDJ2MnpcIi8+PC9zdmc+JyxcclxuICAgIHRvcDU6ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjxwYXRoIGQ9XCJNMTkgM0g1Yy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6TTQgMjFoMTZ2Mkg0ek02IDdoMTJ2Mkg2ek02IDExaDEydjJINnpNNiAxNWg4djJINnpcIi8+PC9zdmc+JyxcclxuICAgIGZvbGRlcjogJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+PHBhdGggZD1cIk0xMCA0SDRjLTEuMSAwLTEuOTkuOS0xLjk5IDJMMiAxOGMwIDEuMS45IDIgMiAyaDE2YzEuMSAwIDItLjkgMi0yVjhjMC0xLjEtLjktMi0yLTJoLThsLTItMnpcIi8+PC9zdmc+JyxcclxuICAgIHNhdmU6ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjxwYXRoIGQ9XCJNMTcgM0g1Yy0xLjExIDAtMiAuOS0yIDJ2MTRjMCAxLjEuODkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWN2wtNC00em0tNSAxNmMtMS42NiAwLTMtMS4zNC0zLTNzMS4zNC0zIDMtMyAzIDEuMzQgMyAzLTEuMzQgMy0zIDN6bTMtMTBINVY1aDEwdjR6XCIvPjwvc3ZnPicsXHJcbiAgICBjaGVjazogJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+PHBhdGggZD1cIk0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5elwiLz48L3N2Zz4nLFxyXG4gICAgY29weTogJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+PHBhdGggZD1cIk0xNiAxSDRjLTEuMSAwLTIgLjktMiAydjE0aDJWM2gxMlYxem0zIDRIOGMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxMWMxLjEgMCAyLS45IDItMlY3YzAtMS4xLS45LTItMi0yem0wIDE2SDhWN2gxMXYxNHpcIi8+PC9zdmc+JyxcclxuICAgIGFpOiAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj48cGF0aCBkPVwiTTEzIDNjLTQuOTcgMC05IDQuMDMtOSA5SDFsMy44OSAzLjg5LjA3LjE0TDkgMTJINmMwLTMuODcgMy4xMy03IDctN3M3IDMuMTMgNyA3LTMuMTMgNy03IDdjLTEuOTMgMC0zLjY4LS43OS00Ljk0LTIuMDZsLTEuNDIgMS40MkM4LjI3IDE5Ljk5IDEwLjUxIDIxIDEzIDIxYzQuOTcgMCA5LTQuMDMgOS05cy00LjAzLTktOS05em0tMSA1djVsNC4yOCAyLjU0LjcyLTEuMjEtMy41LTIuMDhWOEgxMnpcIi8+PC9zdmc+JyxcclxuICAgIHJlZnJlc2g6ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjxwYXRoIGQ9XCJNMTcuNjUgNi4zNUMxNi4yIDQuOSAxNC4yMSA0IDEyIDRjLTQuNDIgMC03Ljk5IDMuNTgtNy45OSA4czMuNTcgOCA3Ljk5IDhjMy43MyAwIDYuODQtMi41NSA3LjczLTZoLTIuMDhjLS44MiAyLjMzLTMuMDQgNC01LjY1IDQtMy4zMSAwLTYtMi42OS02LTZzMi42OS02IDYtNmMxLjY2IDAgMy4xNC42OSA0LjIyIDEuNzhMMTMgMTFoN1Y0bC0yLjM1IDIuMzV6XCIvPjwvc3ZnPicsXHJcbiAgICBhcnJvd1VwOiAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj48cGF0aCBkPVwiTTQgMTJsMS40MSAxLjQxTDExIDcuODNWMjBoMlY3LjgzbDUuNTggNS41OUwyMCAxMmwtOC04LTggOHpcIi8+PC9zdmc+JyxcclxuICAgIGFycm93RG93bjogJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+PHBhdGggZD1cIk0yMCAxMmwtMS40MS0xLjQxTDEzIDE2LjE3VjRoLTJ2MTIuMTdsLTUuNTgtNS41OUw0IDEybDggOCA4LTh6XCIvPjwvc3ZnPicsXHJcbiAgICBzZWFyY2g6ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjxwYXRoIGQ9XCJNMTUuNSAxNGgtLjc5bC0uMjgtLjI3QzE1LjQxIDEyLjU5IDE2IDExLjExIDE2IDkuNSAxNiA1LjkxIDEzLjA5IDMgOS41IDNTMyA1LjkxIDMgOS41IDUuOTEgMTYgOS41IDE2YzEuNjEgMCAzLjA5LS41OSA0LjIzLTEuNTdsLjI3LjI4di43OWw1IDQuOTlMMjAuNDkgMTlsLTQuOTktNXptLTYgMEM3LjAxIDE0IDUgMTEuOTkgNSA5LjVTNy4wMSA1IDkuNSA1IDE0IDcuMDEgMTQgOS41IDExLjk5IDE0IDkuNSAxNHpcIi8+PC9zdmc+J1xyXG4gIH07XHJcblxyXG4gIC8vIFN0YXRlIE1hbmFnZW1lbnRcclxuICBjb25zdCBzdGF0ZSA9IHtcclxuICAgIHJhd0NhbXBhaWduczogW10sXHJcbiAgICBwcm9jZXNzZWRDYW1wYWlnbnM6IFtdLFxyXG4gICAgYWxsQWRzOiBbXSxcclxuICAgIGZpbHRlckRvbWFpbjogJ2FsbCcsXHJcbiAgICBmaWx0ZXJUZXh0OiAnJyxcclxuICAgIGZpbHRlclNvcnQ6ICdyZWNlbnQnLCAvLyAncmVjZW50JywgJ2R1cmF0aW9uJywgJ2FkcydcclxuICAgIGdyb3VwQnlEb21haW46IGZhbHNlLFxyXG4gICAgaXNNaW5pbWl6ZWQ6IHRydWUsXHJcbiAgICBjdXJyZW50VmlldzogJ3RpbWVsaW5lJywgLy8gJ3RpbWVsaW5lJywgJ3RvcDUtdGV4dCcsICdhbGwtY29weSdcclxuICAgIGlzQW5hbHl6aW5nOiBmYWxzZSxcclxuICAgIGlzQW5hbHl6aW5nOiBmYWxzZSxcclxuICAgIGFpQ29uZmlnOiBudWxsLFxyXG4gICAgaXNBbmFseXppbmc6IGZhbHNlLFxyXG4gICAgYWlDb25maWc6IG51bGwsXHJcbiAgICBtZXRhZGF0YTogbnVsbCxcclxuICAgIHNvcnREaXJlY3Rpb246ICdhc2MnLCAvLyAnYXNjJyBvciAnZGVzYydcclxuICAgIGlzSW1wb3J0ZWQ6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgLy8gQ29sb3IgSGVscGVyXHJcbiAgZnVuY3Rpb24gZ2V0QWRDb3VudENvbG9yKGNvdW50KSB7XHJcbiAgICBpZiAoY291bnQgPj0gMTAwKSByZXR1cm4gJyNlZjQ0NDQnOyAvLyBSZWRcclxuICAgIGlmIChjb3VudCA+PSA1MCkgcmV0dXJuICcjZjk3MzE2JzsgIC8vIE9yYW5nZVxyXG4gICAgaWYgKGNvdW50ID49IDIwKSByZXR1cm4gJyNlYWIzMDgnOyAgLy8gWWVsbG93XHJcbiAgICBpZiAoY291bnQgPj0gMTApIHJldHVybiAnIzIyYzU1ZSc7ICAvLyBHcmVlblxyXG4gICAgaWYgKGNvdW50ID49IDUpIHJldHVybiAnIzNiODJmNic7ICAgLy8gQmx1ZVxyXG4gICAgcmV0dXJuICcjOGI1Y2Y2JzsgICAgICAgICAgICAgICAgICAgLy8gUHVycGxlXHJcbiAgfVxyXG5cclxuICAvLyBHZXQgbG9nbyBVUkwgZnJvbSBjb25maWcgZWxlbWVudCAoc2V0IGJ5IGNvbnRlbnQuanMpXHJcbiAgY29uc3QgY29uZmlnRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDb25maWcnKTtcclxuICBjb25zdCBsb2dvVXJsID0gY29uZmlnRWw/LmRhdGFzZXQ/LmxvZ29VcmwgfHwgJyc7XHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgZmxvYXRpbmcgb3ZlcmxheVxyXG4gIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBvdmVybGF5LmlkID0gJ2ZiQWRzQW5hbHl6ZXJPdmVybGF5JztcclxuICBvdmVybGF5LmNsYXNzTmFtZSA9ICdoaWRkZW4gbWluaW1pemVkJztcclxuICBvdmVybGF5LmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pbWl6ZWQtYmFyXCIgaWQ9XCJmYkFkc01pbmltaXplZEJhclwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS1jb250ZW50XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktaWNvblwiPlxyXG4gICAgICAgICAgICA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBzdHlsZT1cIndpZHRoOiAyNHB4OyBoZWlnaHQ6IDI0cHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgb2JqZWN0LWZpdDogY292ZXI7XCI+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS10ZXh0XCI+RmFjZWJvb2sgQWRzIENhbXBhaWduIEFuYWx5emVyPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pLWFjdGlvbnNcIj5cclxuICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLW1pbmktYnRuXCIgaWQ9XCJmYkFkc01heGltaXplQnRuXCI+U2hvdzwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1jb250YWluZXJcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFuYWx5emVyLXBhbmVsXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFuYWx5emVyLWhlYWRlclwiPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAxMHB4O1wiPlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6IDI0cHg7XCI+XHJcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7bG9nb1VybH1cIiBzdHlsZT1cIndpZHRoOiA0MHB4OyBoZWlnaHQ6IDQwcHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgb2JqZWN0LWZpdDogY292ZXI7IGJvcmRlcjogMXB4IHNvbGlkICNlNWU3ZWI7XCI+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxoMT5GYWNlYm9vayBBZHMgQ2FtcGFpZ24gQW5hbHl6ZXIgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDE0cHg7IGZvbnQtd2VpZ2h0OiBub3JtYWw7IGNvbG9yOiAjNmI3MjgwO1wiPmJ5IDxhIGhyZWY9XCJodHRwczovL3dpemFyZC5mdW5uZWwuZXhwZXJ0XCIgdGFyZ2V0PVwiX2JsYW5rXCIgc3R5bGU9XCJjb2xvcjogIzZiNzI4MDsgdGV4dC1kZWNvcmF0aW9uOiBub25lO1wiPkZ1bm5lbCBXaXphcmQ8L2E+PC9zcGFuPjwvaDE+XHJcbiAgICAgICAgICAgICAgICA8cCBpZD1cImZiQWRzU3VidGl0bGVcIj5UaW1lbGluZSAmIENhbXBhaWduIEFuYWx5c2lzPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYWN0aW9uc1wiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtaGVhZGVyLWJ0blwiIGlkPVwiZmJBZHNNaW5pbWl6ZUJ0blwiIHRpdGxlPVwiTWluaW1pemVcIj5fPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYnRuXCIgaWQ9XCJmYkFkc0Nsb3NlQnRuXCIgdGl0bGU9XCJDbG9zZVwiPsOXPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbHNcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLXJvd1wiIHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB3aWR0aDogMTAwJTsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZmxleC13cmFwOiB3cmFwOyBnYXA6IDEycHg7XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXdlaWdodDogNTAwOyBmb250LXNpemU6IDEzcHg7IGNvbG9yOiAjMzc0MTUxO1wiPlZpZXc6PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmUgYWN0aXZlXCIgZGF0YS12aWV3PVwidGltZWxpbmVcIj4ke0lDT05TLnRpbWVsaW5lfSBUaW1lbGluZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXZpZXc9XCJ0b3A1LXRleHRcIj4ke0lDT05TLnRvcDV9IFRvcCA1IFRleHQ8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXdlaWdodDogNTAwOyBmb250LXNpemU6IDEzcHg7IGNvbG9yOiAjMzc0MTUxO1wiPlNvcnQ6PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmUgYWN0aXZlXCIgZGF0YS1zb3J0PVwicmVjZW50XCI+U3RhcnQgRGF0ZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXNvcnQ9XCJkdXJhdGlvblwiPkR1cmF0aW9uPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZVwiIGRhdGEtc29ydD1cImFkc1wiPiMgb2YgQWRzPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZVwiIGlkPVwiZmJBZHNHcm91cERvbWFpbkJ0blwiIHRpdGxlPVwiR3JvdXAgY2FtcGFpZ25zIGJ5IGRvbWFpblwiPiR7SUNPTlMuZm9sZGVyfSBHcm91cCBieSBEb21haW48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIiBzdHlsZT1cImZsZXg6IDE7IG1heC13aWR0aDogMzAwcHg7XCI+XHJcbiAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cImZiQWRzRmlsdGVySW5wdXRcIiBjbGFzcz1cImZiLWFkcy1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiRmlsdGVyIGNhbXBhaWducy4uLlwiIHN0eWxlPVwid2lkdGg6IDEwMCU7XCI+XHJcbiAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6IGF1dG87XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIiBpZD1cImZiQWRzRG93bmxvYWRCdG5cIj4ke0lDT05TLnNhdmV9IERvd25sb2FkIERhdGE8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiIGlkPVwiZmJBZHNJbXBvcnRCdG5cIj4ke0lDT05TLmZvbGRlcn0gSW1wb3J0IERhdGE8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIiBpZD1cImZiQWRzSW1wb3J0SW5wdXRcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCIgYWNjZXB0PVwiLmpzb25cIj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmRcIiBpZD1cImZiQWRzVGltZWxpbmVMZWdlbmRcIiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IHdpZHRoOiAxMDAlOyBnYXA6IDE2cHg7IHBhZGRpbmc6IDEycHggMjRweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlNWU3ZWI7IGJhY2tncm91bmQ6ICNmYWZhZmE7XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICM4YjVjZjY7XCI+PC9kaXY+IDEtNCBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogIzNiODJmNjtcIj48L2Rpdj4gNS05IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjMjJjNTVlO1wiPjwvZGl2PiAxMC0xOSBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2VhYjMwODtcIj48L2Rpdj4gMjAtNDkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICNmOTczMTY7XCI+PC9kaXY+IDUwLTk5IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZWY0NDQ0O1wiPjwvZGl2PiAxMDArIGFkczwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2hhcnQtY29udGFpbmVyXCIgaWQ9XCJmYkFkc0NoYXJ0Q29udGVudFwiPlxyXG4gICAgICAgICAgICAgPCEtLSBEeW5hbWljIENvbnRlbnQgLS0+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIFxyXG4gICAgICA8IS0tIE1vZGFsIENvbnRhaW5lciAtLT5cclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1vdmVybGF5XCIgaWQ9XCJmYkFkc01vZGFsT3ZlcmxheVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWxcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtdGl0bGVcIj5cclxuICAgICAgICAgICAgICA8aDIgaWQ9XCJmYkFkc01vZGFsVGl0bGVcIj5DYW1wYWlnbiBEZXRhaWxzPC9oMj5cclxuICAgICAgICAgICAgICA8cCBjbGFzcz1cImZiLWFkcy1tb2RhbC1tZXRhXCIgaWQ9XCJmYkFkc01vZGFsTWV0YVwiPnVybC4uLjwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtbW9kYWwtY2xvc2VcIiBpZD1cImZiQWRzTW9kYWxDbG9zZVwiPsOXPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtYm9keVwiIGlkPVwiZmJBZHNNb2RhbEJvZHlcIj5cclxuICAgICAgICAgICAgIDwhLS0gRGV0YWlscyAtLT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XHJcblxyXG4gIC8vIFRvb2x0aXBcclxuICBjb25zdCB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgdG9vbHRpcC5jbGFzc05hbWUgPSAnZmItYWRzLXRvb2x0aXAnO1xyXG4gIG92ZXJsYXkuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XHJcblxyXG4gIC8vIC0tLSBFdmVudCBMaXN0ZW5lcnMgLS0tXHJcblxyXG4gIC8vIEhlYWRlciBBY3Rpb25zXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ2xvc2VCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVPdmVybGF5KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlTWluaW1pemUpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01heGltaXplQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNaW5pbWl6ZSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWluaW1pemVkQmFyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNaW5pbWl6ZSk7XHJcblxyXG4gIC8vIE1vZGFsIEFjdGlvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbENsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlTW9kYWwpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsT3ZlcmxheScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgIGlmIChlLnRhcmdldC5pZCA9PT0gJ2ZiQWRzTW9kYWxPdmVybGF5JykgaGlkZU1vZGFsKCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIE1haW4gQWN0aW9uc1xyXG5cclxuXHJcbiAgLy8gTWFpbiBBY3Rpb25zXHJcbiAgY29uc3QgZmlsdGVySW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNGaWx0ZXJJbnB1dCcpO1xyXG4gIGZpbHRlcklucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcclxuICAgIHN0YXRlLmZpbHRlclRleHQgPSBlLnRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdXBkYXRlVmlldygpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNEb3dubG9hZEJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZG93bmxvYWREYXRhKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydElucHV0JykuY2xpY2soKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRJbnB1dCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVJbXBvcnQpO1xyXG5cclxuXHJcbiAgLy8gVmlldyBTd2l0Y2hlclxyXG4gIGNvbnN0IHZpZXdCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdmlld10nKTtcclxuICB2aWV3QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICB2aWV3QnV0dG9ucy5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XHJcbiAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICBzdGF0ZS5jdXJyZW50VmlldyA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS12aWV3Jyk7XHJcblxyXG4gICAgICBjb25zdCBsZWdlbmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNUaW1lbGluZUxlZ2VuZCcpO1xyXG4gICAgICBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0aW1lbGluZScpIHtcclxuICAgICAgICBsZWdlbmQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWdlbmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgfVxyXG4gICAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gU29ydCBTd2l0Y2hlclxyXG4gIGNvbnN0IHNvcnRCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc29ydF0nKTtcclxuXHJcbiAgLy8gSGVscGVyIHRvIHVwZGF0ZSBidXR0b24gbGFiZWxzXHJcbiAgY29uc3QgdXBkYXRlU29ydEJ1dHRvbnMgPSAoKSA9PiB7XHJcbiAgICBzb3J0QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICAgIGNvbnN0IHNvcnRUeXBlID0gYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1zb3J0Jyk7XHJcbiAgICAgIGxldCBiYXNlTGFiZWwgPSAnJztcclxuICAgICAgaWYgKHNvcnRUeXBlID09PSAncmVjZW50JykgYmFzZUxhYmVsID0gJ1N0YXJ0IERhdGUnO1xyXG4gICAgICBpZiAoc29ydFR5cGUgPT09ICdkdXJhdGlvbicpIGJhc2VMYWJlbCA9ICdEdXJhdGlvbic7XHJcbiAgICAgIGlmIChzb3J0VHlwZSA9PT0gJ2FkcycpIGJhc2VMYWJlbCA9ICcjIG9mIEFkcyc7XHJcblxyXG4gICAgICBsZXQgaW5uZXIgPSBiYXNlTGFiZWw7XHJcblxyXG4gICAgICBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gc29ydFR5cGUpIHtcclxuICAgICAgICBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgLy8gQWRkIGFycm93XHJcbiAgICAgICAgaW5uZXIgKz0gc3RhdGUuc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyBgICR7SUNPTlMuYXJyb3dVcH1gIDogYCAke0lDT05TLmFycm93RG93bn1gO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgfVxyXG4gICAgICBidG4uaW5uZXJIVE1MID0gaW5uZXI7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBzb3J0QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB0YXJnZXRTb3J0ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNvcnQnKTtcclxuXHJcbiAgICAgIGlmIChzdGF0ZS5maWx0ZXJTb3J0ID09PSB0YXJnZXRTb3J0KSB7XHJcbiAgICAgICAgLy8gVG9nZ2xlIGRpcmVjdGlvblxyXG4gICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSBzdGF0ZS5zb3J0RGlyZWN0aW9uID09PSAnYXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIE5ldyBzb3J0OiBEZWZhdWx0IHRvICdkZXNjJyBmb3IgZXZlcnl0aGluZz8gXHJcbiAgICAgICAgLy8gVXN1YWxseSAnU3RhcnQgRGF0ZScgdXNlcnMgbWlnaHQgd2FudCBPbGRlc3QgRmlyc3QgKEFzYykgb3IgTmV3ZXN0IEZpcnN0IChEZXNjKS5cclxuICAgICAgICAvLyBMZXQncyBkZWZhdWx0IHRvICdkZXNjJyAoSGlnaC9OZXdlc3QpIGFzIHN0YW5kYXJkLCBidXQgbWF5YmUgJ2FzYycgZm9yIERhdGU/XHJcbiAgICAgICAgLy8gVGhlIG9yaWdpbmFsIGNvZGUgaGFkIGRlZmF1bHQgRGF0ZSBhcyBBc2MgKE9sZGVzdCBmaXJzdCkuXHJcbiAgICAgICAgaWYgKHRhcmdldFNvcnQgPT09ICdyZWNlbnQnKSB7XHJcbiAgICAgICAgICBzdGF0ZS5zb3J0RGlyZWN0aW9uID0gJ2FzYyc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSAnZGVzYyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlLmZpbHRlclNvcnQgPSB0YXJnZXRTb3J0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB1cGRhdGVTb3J0QnV0dG9ucygpO1xyXG4gICAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gSW5pdCBidXR0b24gbGFiZWxzXHJcbiAgdXBkYXRlU29ydEJ1dHRvbnMoKTtcclxuXHJcbiAgLy8gR3JvdXAgYnkgRG9tYWluXHJcbiAgY29uc3QgZ3JvdXBCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNHcm91cERvbWFpbkJ0bicpO1xyXG4gIGdyb3VwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc3RhdGUuZ3JvdXBCeURvbWFpbiA9ICFzdGF0ZS5ncm91cEJ5RG9tYWluO1xyXG4gICAgZ3JvdXBCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XHJcbiAgICB1cGRhdGVWaWV3KCk7XHJcbiAgfSk7XHJcblxyXG5cclxuICAvLyAtLS0gRnVuY3Rpb25zIC0tLVxyXG5cclxuICBmdW5jdGlvbiBzaG93T3ZlcmxheSgpIHtcclxuICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ21pbmltaXplZCcpO1xyXG4gICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhpZGVPdmVybGF5KCkge1xyXG4gICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRvZ2dsZU1pbmltaXplKGUpIHtcclxuICAgIGlmIChlKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSAhc3RhdGUuaXNNaW5pbWl6ZWQ7XHJcbiAgICBpZiAoc3RhdGUuaXNNaW5pbWl6ZWQpIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdtaW5pbWl6ZWQnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnbWluaW1pemVkJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzaG93TW9kYWwoY29udGVudEh0bWwsIHRpdGxlLCBtZXRhKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbFRpdGxlJykuaW5uZXJUZXh0ID0gdGl0bGU7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE1ldGEnKS5pbm5lclRleHQgPSBtZXRhO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxCb2R5JykuaW5uZXJIVE1MID0gY29udGVudEh0bWw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgc2V0dXBDb3B5QnV0dG9ucyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbEJvZHknKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoaWRlTW9kYWwoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29weVJpY2hUZXh0KHBsYWluLCBodG1sKSB7XHJcbiAgICBpZiAodHlwZW9mIENsaXBib2FyZEl0ZW0gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgY29uc3QgdGV4dEJsb2IgPSBuZXcgQmxvYihbcGxhaW5dLCB7IHR5cGU6IFwidGV4dC9wbGFpblwiIH0pO1xyXG4gICAgICBjb25zdCBodG1sQmxvYiA9IG5ldyBCbG9iKFtodG1sXSwgeyB0eXBlOiBcInRleHQvaHRtbFwiIH0pO1xyXG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlKFtcclxuICAgICAgICBuZXcgQ2xpcGJvYXJkSXRlbSh7XHJcbiAgICAgICAgICBcInRleHQvcGxhaW5cIjogdGV4dEJsb2IsXHJcbiAgICAgICAgICBcInRleHQvaHRtbFwiOiBodG1sQmxvYlxyXG4gICAgICAgIH0pXHJcbiAgICAgIF0pLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlJpY2ggY29weSBmYWlsZWQsIGZhbGxpbmcgYmFjayB0byBwbGFpbjpcIiwgZXJyKTtcclxuICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwbGFpbik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocGxhaW4pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0dXBDb3B5QnV0dG9ucyhjb250YWluZXIpIHtcclxuICAgIGNvbnN0IGNvcHlCdG5zID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5mYi1hZHMtY29weS1idG4nKTtcclxuICAgIGNvcHlCdG5zLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQ7IC8vIFVzZSBjdXJyZW50VGFyZ2V0IHRvIGVuc3VyZSB3ZSBnZXQgdGhlIGJ1dHRvbiwgbm90IGljb25cclxuICAgICAgICBjb25zdCByYXdUZXh0ID0gZGVjb2RlVVJJQ29tcG9uZW50KHRhcmdldC5kYXRhc2V0LmNvcHlUZXh0KTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCBtZXRhZGF0YSBpZiBhdmFpbGFibGVcclxuICAgICAgICBjb25zdCBtZXRhID0ge1xyXG4gICAgICAgICAgdXJsOiB0YXJnZXQuZGF0YXNldC51cmwgPyBkZWNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQudXJsKSA6ICcnLFxyXG4gICAgICAgICAgY2FtcGFpZ25EdXJhdGlvbjogdGFyZ2V0LmRhdGFzZXQuY2FtcGFpZ25EdXJhdGlvbiB8fCAnJyxcclxuICAgICAgICAgIGNhbXBhaWduQWRzOiB0YXJnZXQuZGF0YXNldC5jYW1wYWlnbkFkcyB8fCAnJyxcclxuICAgICAgICAgIGxpYklkOiB0YXJnZXQuZGF0YXNldC5hZExpYklkIHx8ICcnLFxyXG4gICAgICAgICAgYWREdXJhdGlvbjogdGFyZ2V0LmRhdGFzZXQuYWREdXJhdGlvbiB8fCAnJyxcclxuICAgICAgICAgIGFkRGF0ZXM6IHRhcmdldC5kYXRhc2V0LmFkRGF0ZXMgfHwgJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDb25zdHJ1Y3QgUmljaCBUZXh0IEhUTUxcclxuICAgICAgICBjb25zdCByaWNoVGV4dCA9IGBcclxuICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LWZhbWlseTogc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNHB4OyBsaW5lLWhlaWdodDogMS41OyBjb2xvcjogIzM3NDE1MTtcIj5cclxuICAgICAgICAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDhweDtcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkNhbXBhaWduOjwvc3Ryb25nPiA8YSBocmVmPVwiJHttZXRhLnVybH1cIj4ke21ldGEudXJsfTwvYT48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHttZXRhLmNhbXBhaWduRHVyYXRpb24gPyBgPHN0cm9uZz5EdXJhdGlvbjo8L3N0cm9uZz4gJHttZXRhLmNhbXBhaWduRHVyYXRpb259IGRheXNgIDogJyd9IFxyXG4gICAgICAgICAgICAgICAgICAgICR7bWV0YS5jYW1wYWlnbkFkcyA/IGDigKIgJHttZXRhLmNhbXBhaWduQWRzfSBhZHNgIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTJweDsgcGFkZGluZy1ib3R0b206IDEycHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTVlN2ViO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TGlicmFyeSBJRDo8L3N0cm9uZz4gPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHttZXRhLmxpYklkfVwiPiR7bWV0YS5saWJJZH08L2E+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RGF0ZXM6PC9zdHJvbmc+ICR7bWV0YS5hZERhdGVzfSB8IDxzdHJvbmc+QWQgRHVyYXRpb246PC9zdHJvbmc+ICR7bWV0YS5hZER1cmF0aW9ufSBkYXlzXHJcbiAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyYXdUZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpfVxyXG4gICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgLy8gQ29uc3RydWN0IFBsYWluIFRleHQgRmFsbGJhY2tcclxuICAgICAgICBjb25zdCBwbGFpblRleHQgPSBgQ2FtcGFpZ246ICR7bWV0YS51cmx9XFxuRHVyYXRpb246ICR7bWV0YS5jYW1wYWlnbkR1cmF0aW9ufSBkYXlzIOKAoiAke21ldGEuY2FtcGFpZ25BZHN9IGFkc1xcblxcbkxpYnJhcnkgSUQ6ICR7bWV0YS5saWJJZH1cXG5EYXRlczogJHttZXRhLmFkRGF0ZXN9IHwgQWQgRHVyYXRpb246ICR7bWV0YS5hZER1cmF0aW9ufSBkYXlzXFxuXFxuLS0tXFxuXFxuJHtyYXdUZXh0fWA7XHJcblxyXG4gICAgICAgIC8vIFVzZSByaWNoIHRleHQgY29weSBoZWxwZXJcclxuICAgICAgICBjb3B5UmljaFRleHQocGxhaW5UZXh0LCByaWNoVGV4dCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsID0gdGFyZ2V0LmlubmVySFRNTDtcclxuICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gYCR7SUNPTlMuY2hlY2t9IENvcGllZCFgO1xyXG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gb3JpZ2luYWw7XHJcbiAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnc3VjY2VzcycpO1xyXG4gICAgICAgIH0sIDIwMDApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlVmlldygpIHtcclxuICAgIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RpbWVsaW5lJykge1xyXG4gICAgICByZW5kZXJUaW1lbGluZSgpO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RvcDUtdGV4dCcpIHtcclxuICAgICAgcmVuZGVyVG9wNVRleHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHByb2Nlc3NEYXRhKGNhbXBhaWducykge1xyXG4gICAgbGV0IHNvcnRlZCA9IFsuLi5jYW1wYWlnbnNdO1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUHJvY2Vzc2luZyBkYXRhLiBTb3J0OicsIHN0YXRlLmZpbHRlclNvcnQsICdHcm91cDonLCBzdGF0ZS5ncm91cEJ5RG9tYWluKTtcclxuXHJcbiAgICAvLyAxLiBTb3J0aW5nIExvZ2ljXHJcbiAgICAvLyAwLiBGaWx0ZXIgTG9naWNcclxuICAgIGlmIChzdGF0ZS5maWx0ZXJUZXh0KSB7XHJcbiAgICAgIHNvcnRlZCA9IHNvcnRlZC5maWx0ZXIoYyA9PlxyXG4gICAgICAgIGMudXJsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RhdGUuZmlsdGVyVGV4dCkgfHxcclxuICAgICAgICAoYy50b3A1ICYmIGMudG9wNS5zb21lKGFkID0+IGFkLmFkVGV4dCAmJiBhZC5hZFRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdGF0ZS5maWx0ZXJUZXh0KSkpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMS4gU29ydGluZyBMb2dpY1xyXG4gICAgc29ydGVkLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgbGV0IHZhbEEsIHZhbEI7XHJcblxyXG4gICAgICBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gJ2FkcycpIHtcclxuICAgICAgICB2YWxBID0gTnVtYmVyKGEuYWRzQ291bnQpIHx8IDA7XHJcbiAgICAgICAgdmFsQiA9IE51bWJlcihiLmFkc0NvdW50KSB8fCAwO1xyXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09ICdkdXJhdGlvbicpIHtcclxuICAgICAgICB2YWxBID0gTnVtYmVyKGEuY2FtcGFpZ25EdXJhdGlvbkRheXMpIHx8IDA7XHJcbiAgICAgICAgdmFsQiA9IE51bWJlcihiLmNhbXBhaWduRHVyYXRpb25EYXlzKSB8fCAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vICdyZWNlbnQnIC8gU3RhcnQgRGF0ZVxyXG4gICAgICAgIHZhbEEgPSBuZXcgRGF0ZShhLmZpcnN0QWR2ZXJ0aXNlZCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHZhbEIgPSBuZXcgRGF0ZShiLmZpcnN0QWR2ZXJ0aXNlZCkuZ2V0VGltZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGFuZGFyZCBBc2NlbmRpbmc6IHZhbEEgLSB2YWxCXHJcbiAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSB2YWxBIC0gdmFsQjtcclxuXHJcbiAgICAgIC8vIEFwcGx5IERpcmVjdGlvblxyXG4gICAgICByZXR1cm4gc3RhdGUuc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyBjb21wYXJpc29uIDogLWNvbXBhcmlzb247XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyAyLiBHcm91cGluZyBMb2dpYyAoU2Vjb25kYXJ5IFNvcnQpXHJcbiAgICBpZiAoc3RhdGUuZ3JvdXBCeURvbWFpbikge1xyXG4gICAgICBzb3J0ZWQuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRBID0gZ2V0RG9tYWluKGEudXJsKTtcclxuICAgICAgICBjb25zdCBkQiA9IGdldERvbWFpbihiLnVybCk7XHJcbiAgICAgICAgaWYgKGRBIDwgZEIpIHJldHVybiAtMTtcclxuICAgICAgICBpZiAoZEEgPiBkQikgcmV0dXJuIDE7XHJcbiAgICAgICAgLy8gS2VlcCBwcmV2aW91cyBzb3J0IG9yZGVyIHdpdGhpbiBzYW1lIGRvbWFpblxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc29ydGVkO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0RG9tYWluKHVybCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIG5ldyBVUkwodXJsKS5ob3N0bmFtZS5yZXBsYWNlKCd3d3cuJywgJycpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiB1cmw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJUaW1lbGluZSgpIHtcclxuICAgIGNvbnN0IGNoYXJ0Q29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NoYXJ0Q29udGVudCcpO1xyXG4gICAgY2hhcnRDb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ZiLWFkcy1iZy1ncmF5Jyk7XHJcbiAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgY29uc3QgY2FtcGFpZ25zVG9SZW5kZXIgPSBwcm9jZXNzRGF0YShzdGF0ZS5yYXdDYW1wYWlnbnMpO1xyXG5cclxuICAgIGlmIChjYW1wYWlnbnNUb1JlbmRlci5sZW5ndGggPT09IDApIHtcclxuICAgICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZmItYWRzLWVtcHR5LXN0YXRlXCI+Tm8gY2FtcGFpZ25zIG1hdGNoIGNyaXRlcmlhPC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YnRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3VidGl0bGUnKTtcclxuICAgIGlmIChzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBmaXJzdCA9IG5ldyBEYXRlKHN0YXRlLnJhd0NhbXBhaWduc1tzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoIC0gMV0uZmlyc3RBZHZlcnRpc2VkKTtcclxuICAgICAgY29uc3QgbGFzdCA9IG5ldyBEYXRlKHN0YXRlLnJhd0NhbXBhaWduc1swXS5sYXN0QWR2ZXJ0aXNlZCk7IC8vIFJvdWdoIGFwcHJveCBkZXBlbmRpbmcgb24gc29ydFxyXG4gICAgICBzdWJ0aXRsZS50ZXh0Q29udGVudCA9IGAke3N0YXRlLnJhd0NhbXBhaWducy5sZW5ndGh9IGNhbXBhaWducyBhbmFseXplZGA7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIERldGVybWluZSBUaW1lbGluZSBSYW5nZVxyXG4gICAgbGV0IG1pbkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IG1heERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy5maXJzdEFkdmVydGlzZWQgPCBtaW5EYXRlKSBtaW5EYXRlID0gYy5maXJzdEFkdmVydGlzZWQ7XHJcbiAgICAgIGlmIChjLmxhc3RBZHZlcnRpc2VkID4gbWF4RGF0ZSkgbWF4RGF0ZSA9IGMubGFzdEFkdmVydGlzZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBkYXlNcyA9IDg2NDAwMDAwO1xyXG4gICAgLy8gRW5zdXJlIGF0IGxlYXN0IDEgZGF5IHJhbmdlIHRvIGF2b2lkIGRpdmlzaW9uIGJ5IHplcm9cclxuICAgIGxldCByYW5nZU1zID0gbWF4RGF0ZSAtIG1pbkRhdGU7XHJcbiAgICBpZiAocmFuZ2VNcyA8IGRheU1zKSByYW5nZU1zID0gZGF5TXM7XHJcblxyXG4gICAgLy8gQWRkIHBhZGRpbmcgKG1heCBvZiA1IGRheXMgb3IgMTAlIG9mIHRvdGFsIHJhbmdlKVxyXG4gICAgLy8gQ2xhbXAgcGFkZGluZyBmb3IgcmlnaHQgc2lkZSB0byBhdm9pZCBzaG93aW5nIGZ1dHVyZSBtb250aHMgdW5uZWNlc3NhcmlseVxyXG4gICAgLy8gQ2xhbXAgcGFkZGluZyBmb3IgcmlnaHQgc2lkZSB0byBhdm9pZCBzaG93aW5nIGZ1dHVyZSBtb250aHMgdW5uZWNlc3NhcmlseVxyXG4gICAgY29uc3QgcGFkZGluZyA9IE1hdGgubWF4KGRheU1zICogNSwgcmFuZ2VNcyAqIDAuMSk7XHJcblxyXG4gICAgLy8gU3RhcnQgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBtb250aCBvZiB0aGUgZmlyc3QgYWQgKG5vIGxlZnQgcGFkZGluZyBpbnRvIHByZXZpb3VzIG1vbnRocylcclxuICAgIGNvbnN0IHJlbmRlck1pbiA9IG5ldyBEYXRlKG1pbkRhdGUuZ2V0RnVsbFllYXIoKSwgbWluRGF0ZS5nZXRNb250aCgpLCAxKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgcmlnaHQtc2lkZSBib3VuZCAoRW5kIG9mIHRoZSBtb250aCBvZiB0aGUgbWF4RGF0ZSlcclxuICAgIGNvbnN0IGVuZE9mTWF4RGF0ZU1vbnRoID0gbmV3IERhdGUobWF4RGF0ZS5nZXRGdWxsWWVhcigpLCBtYXhEYXRlLmdldE1vbnRoKCkgKyAxLCAwLCAyMywgNTksIDU5LCA5OTkpO1xyXG4gICAgLy8gVXNlIHBhZGRpbmcgbm9ybWFsbHksIGJ1dCBkb24ndCBleGNlZWQgZW5kIG9mIHRoYXQgbW9udGggYnkgbXVjaCAobWF5YmUgYWxsb3cgaGl0dGluZyB0aGUgbGFzdCBkYXkpXHJcbiAgICAvLyBBY3R1YWxseSB1c2VyIHdhbnRzIFwidW50aWwgdGhlIGN1cnJlbnQgbW9udGggb25seVwiLlxyXG4gICAgLy8gU28gaWYgbWF4RGF0ZSBpcyBOb3YsIHdlIHNob3VsZG4ndCBzaG93IEphbi4gXHJcbiAgICAvLyBTaW1wbHkgY2xhbXBpbmcgdG8gZW5kT2ZNYXhEYXRlTW9udGggc2VlbXMgY29ycmVjdCBmb3IgXCJjdXJyZW50IG1vbnRoIG9ubHlcIi5cclxuICAgIGNvbnN0IHJlbmRlck1heCA9IG5ldyBEYXRlKE1hdGgubWluKG1heERhdGUuZ2V0VGltZSgpICsgcGFkZGluZywgZW5kT2ZNYXhEYXRlTW9udGguZ2V0VGltZSgpKSk7XHJcbiAgICBjb25zdCB0b3RhbER1cmF0aW9uID0gcmVuZGVyTWF4IC0gcmVuZGVyTWluO1xyXG5cclxuICAgIC8vIEhlYWRlclxyXG4gICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBoZWFkZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy10aW1lbGluZS1oZWFkZXInO1xyXG4gICAgaGVhZGVyLmlubmVySFRNTCA9IGBcclxuICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtbGFiZWxcIj48c3Ryb25nPkNhbXBhaWduPC9zdHJvbmc+PC9kaXY+XHJcbiAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRpbWVsaW5lLWdyaWRcIj48L2Rpdj5cclxuICAgIGA7XHJcbiAgICBjaGFydENvbnRlbnQuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcclxuXHJcbiAgICBjb25zdCBncmlkID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtdGltZWxpbmUtZ3JpZCcpO1xyXG4gICAgbGV0IGdyaWRMaW5lc0hUTUwgPSAnJztcclxuXHJcbiAgICAvLyBBZGFwdGl2ZSBNYXJrZXJzIGxvZ2ljXHJcbiAgICBjb25zdCBpc1Nob3J0UmFuZ2UgPSByYW5nZU1zIDwgKGRheU1zICogNjApO1xyXG5cclxuICAgIGlmIChpc1Nob3J0UmFuZ2UpIHtcclxuICAgICAgLy8gV2Vla2x5IG1hcmtlcnNcclxuICAgICAgbGV0IGQgPSBuZXcgRGF0ZShyZW5kZXJNaW4pO1xyXG4gICAgICB3aGlsZSAoZCA8PSByZW5kZXJNYXgpIHtcclxuICAgICAgICBjb25zdCBwb3MgPSAoKGQgLSByZW5kZXJNaW4pIC8gdG90YWxEdXJhdGlvbikgKiAxMDA7XHJcbiAgICAgICAgaWYgKHBvcyA+PSAwICYmIHBvcyA8PSAxMDApIHtcclxuICAgICAgICAgIGNvbnN0IG1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgbWFya2VyLmNsYXNzTmFtZSA9ICdmYi1hZHMtbW9udGgtbWFya2VyJztcclxuICAgICAgICAgIG1hcmtlci5zdHlsZS5sZWZ0ID0gYCR7cG9zfSVgO1xyXG4gICAgICAgICAgbWFya2VyLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vbnRoLWxhYmVsXCI+JHtkLnRvTG9jYWxlU3RyaW5nKCdkZWZhdWx0JywgeyBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycgfSl9PC9kaXY+YDtcclxuICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobWFya2VyKTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgR3JpZCBMaW5lXHJcbiAgICAgICAgICBncmlkTGluZXNIVE1MICs9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWdyaWQtbGluZVwiIHN0eWxlPVwibGVmdDogJHtwb3N9JVwiPjwvZGl2PmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSArIDcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBNb250aGx5IG1hcmtlcnNcclxuICAgICAgbGV0IGQgPSBuZXcgRGF0ZShyZW5kZXJNaW4pO1xyXG4gICAgICBkLnNldERhdGUoMSk7XHJcbiAgICAgIHdoaWxlIChkIDw9IHJlbmRlck1heCkge1xyXG4gICAgICAgIGNvbnN0IHBvcyA9ICgoZCAtIHJlbmRlck1pbikgLyB0b3RhbER1cmF0aW9uKSAqIDEwMDtcclxuICAgICAgICBpZiAocG9zID49IDAgJiYgcG9zIDw9IDEwMCkge1xyXG4gICAgICAgICAgY29uc3QgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICBtYXJrZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1tb250aC1tYXJrZXInO1xyXG4gICAgICAgICAgbWFya2VyLnN0eWxlLmxlZnQgPSBgJHtwb3N9JWA7XHJcbiAgICAgICAgICBtYXJrZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9udGgtbGFiZWxcIj4ke2QudG9Mb2NhbGVTdHJpbmcoJ2RlZmF1bHQnLCB7IG1vbnRoOiAnc2hvcnQnLCB5ZWFyOiAnMi1kaWdpdCcgfSl9PC9kaXY+YDtcclxuICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobWFya2VyKTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgR3JpZCBMaW5lXHJcbiAgICAgICAgICBncmlkTGluZXNIVE1MICs9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWdyaWQtbGluZVwiIHN0eWxlPVwibGVmdDogJHtwb3N9JVwiPjwvZGl2PmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGQuc2V0TW9udGgoZC5nZXRNb250aCgpICsgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBcHBlbmQgQmFja2dyb3VuZCBHcmlkIGFuZCBSb3dzIFdyYXBwZXJcclxuICAgIGNvbnN0IGJvZHlDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGJvZHlDb250YWluZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy10aW1lbGluZS1ib2R5JztcclxuICAgIGJvZHlDb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnOyAvLyBFbnN1cmUgZ3JpZCBpcyByZWxhdGl2ZSB0byB0aGlzIGNvbnRlbnQgaGVpZ2h0XHJcblxyXG4gICAgY29uc3QgZ3JpZExheWVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBncmlkTGF5ZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1nbG9iYWwtZ3JpZCc7XHJcbiAgICBncmlkTGF5ZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1ncmlkLXNwYWNlclwiPjwvZGl2PlxyXG4gICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1ncmlkLWFyZWFcIj4ke2dyaWRMaW5lc0hUTUx9PC9kaXY+XHJcbiAgICBgO1xyXG4gICAgYm9keUNvbnRhaW5lci5hcHBlbmRDaGlsZChncmlkTGF5ZXIpO1xyXG5cclxuICAgIC8vIFJlbmRlciBSb3dzXHJcbiAgICBsZXQgbGFzdERvbWFpbiA9IG51bGw7XHJcblxyXG4gICAgY2FtcGFpZ25zVG9SZW5kZXIuZm9yRWFjaChjYW1wYWlnbiA9PiB7XHJcbiAgICAgIC8vIERvbWFpbiBIZWFkZXIgZm9yIEdyb3VwaW5nXHJcbiAgICAgIGNvbnN0IGRvbWFpbiA9IGdldERvbWFpbihjYW1wYWlnbi51cmwpO1xyXG4gICAgICBpZiAoc3RhdGUuZ3JvdXBCeURvbWFpbiAmJiBkb21haW4gIT09IGxhc3REb21haW4pIHtcclxuICAgICAgICBjb25zdCBncm91cEhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGdyb3VwSGVhZGVyLmNsYXNzTmFtZSA9ICdmYi1hZHMtZG9tYWluLWhlYWRlcic7XHJcbiAgICAgICAgZ3JvdXBIZWFkZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtZG9tYWluLW5hbWVcIj4ke2RvbWFpbn08L2Rpdj5gO1xyXG4gICAgICAgIGJvZHlDb250YWluZXIuYXBwZW5kQ2hpbGQoZ3JvdXBIZWFkZXIpO1xyXG4gICAgICAgIGxhc3REb21haW4gPSBkb21haW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICByb3cuY2xhc3NOYW1lID0gJ2ZiLWFkcy1jYW1wYWlnbi1yb3cnO1xyXG5cclxuICAgICAgY29uc3QgbGVmdCA9ICgoY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkIC0gcmVuZGVyTWluKSAvIHRvdGFsRHVyYXRpb24pICogMTAwO1xyXG4gICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KDAuNSwgKChjYW1wYWlnbi5sYXN0QWR2ZXJ0aXNlZCAtIGNhbXBhaWduLmZpcnN0QWR2ZXJ0aXNlZCkgLyB0b3RhbER1cmF0aW9uKSAqIDEwMCk7XHJcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0QWRDb3VudENvbG9yKGNhbXBhaWduLmFkc0NvdW50KTtcclxuXHJcbiAgICAgIHJvdy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLWluZm9cIj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tdXJsXCIgdGl0bGU9XCIke2NhbXBhaWduLnVybH1cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke2NhbXBhaWduLnVybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiBpbmhlcml0OyB0ZXh0LWRlY29yYXRpb246IG5vbmU7XCI+JHtjYW1wYWlnbi51cmx9PC9hPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDExcHg7IG1hcmdpbi1sZWZ0OiA2cHg7XCI+XHJcbiAgICAgICAgICAgICAgICAgICg8YSBocmVmPVwiaHR0cHM6Ly93ZWIuYXJjaGl2ZS5vcmcvd2ViLyovJHtjYW1wYWlnbi51cmx9LypcIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiAjNmI3MjgwOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcIj5BcmNoaXZlPC9hPilcclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi1tZXRhXCI+XHJcbiAgICAgICAgICAgICAgICR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9IGRheXMg4oCiICR7Y2FtcGFpZ24uYWRzQ291bnR9IGFkc1xyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tdGltZWxpbmVcIj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtYmctbWFya2VyXCIgc3R5bGU9XCJsZWZ0OiAke2xlZnR9JTsgd2lkdGg6ICR7d2lkdGh9JVwiPjwvZGl2PiBcclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tYmFyXCIgXHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPVwibGVmdDogJHtsZWZ0fSU7IHdpZHRoOiAke3dpZHRofSU7IGJhY2tncm91bmQ6ICR7Y29sb3J9OyBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLDAsMCwwLjEpO1wiPlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgIGA7XHJcblxyXG4gICAgICAvLyBUb29sdGlwIGxvZ2ljIGZvciB0aGUgYmFyXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJhciA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWNhbXBhaWduLWJhcicpO1xyXG4gICAgICAgIGlmIChiYXIpIHtcclxuICAgICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzdGFydERhdGUgPSBuZXcgRGF0ZShjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoY2FtcGFpZ24ubGFzdEFkdmVydGlzZWQpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgdG9vbHRpcC5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdG9vbHRpcC1oZWFkZXJcIj5DYW1wYWlnbiBEZXRhaWxzPC9kaXY+XHJcbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdG9vbHRpcC1kYXRlc1wiPiR7c3RhcnREYXRlfSDigJQgJHtlbmREYXRlfTwvZGl2PlxyXG4gICAgICAgICAgICAgICA8YSBjbGFzcz1cImZiLWFkcy10b29sdGlwLWFjdGlvblwiIGlkPVwiZmJBZHNUb29sdGlwVmlld0J0blwiPkNsaWNrIHRvIFZpZXcgVG9wIDUgQWRzPC9hPlxyXG4gICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHZpZXdCdG4gPSB0b29sdGlwLnF1ZXJ5U2VsZWN0b3IoJyNmYkFkc1Rvb2x0aXBWaWV3QnRuJyk7XHJcbiAgICAgICAgICAgIGlmICh2aWV3QnRuKSB7XHJcbiAgICAgICAgICAgICAgdmlld0J0bi5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKTtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUuY2xpZW50WCArIDE1O1xyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS5jbGllbnRZICsgMTU7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgMCk7XHJcblxyXG4gICAgICByb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCdhJykpIHJldHVybjtcclxuICAgICAgICBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBib2R5Q29udGFpbmVyLmFwcGVuZENoaWxkKHJvdyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjaGFydENvbnRlbnQuYXBwZW5kQ2hpbGQoYm9keUNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJUb3A1VGV4dCgpIHtcclxuICAgIGNvbnN0IGNoYXJ0Q29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NoYXJ0Q29udGVudCcpO1xyXG4gICAgY2hhcnRDb250ZW50LmNsYXNzTGlzdC5hZGQoJ2ZiLWFkcy1iZy1ncmF5Jyk7XHJcbiAgICBjb25zdCBzdWJ0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1N1YnRpdGxlJyk7XHJcbiAgICBzdWJ0aXRsZS50ZXh0Q29udGVudCA9IGBUb3AgNSBhZHMgZm9yICR7c3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aH0gY2FtcGFpZ25zYDtcclxuXHJcbiAgICBpZiAoIXN0YXRlLnJhd0NhbXBhaWducyB8fCBzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNoYXJ0Q29udGVudC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImZiLWFkcy1lbXB0eS1zdGF0ZVwiPk5vIGNhbXBhaWduIGRhdGEgYXZhaWxhYmxlPC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBvdXRwdXQgPSAnJztcclxuICAgIGNvbnN0IGNhbXBhaWduc1RvUmVuZGVyID0gcHJvY2Vzc0RhdGEoc3RhdGUucmF3Q2FtcGFpZ25zKTtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGNhbXBhaWduID0+IHtcclxuICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyKSA9PiBuZXcgRGF0ZShkYXRlU3RyKS50b0RhdGVTdHJpbmcoKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBnZXRBZENvdW50Q29sb3IoY2FtcGFpZ24uYWRzQ291bnQpO1xyXG5cclxuICAgICAgb3V0cHV0ICs9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtY2FtcGFpZ24gZmItYWRzLWNhcmQtd2hpdGVcIiBzdHlsZT1cImJvcmRlci1sZWZ0OiA0cHggc29saWQgJHtjb2xvcn07XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+JHtjYW1wYWlnbi51cmx9PC9zdHJvbmc+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1tZXRhXCI+XHJcbiAgICAgICAgICAgICR7Zm9ybWF0RGF0ZShjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQpfSDigJQgJHtmb3JtYXREYXRlKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkKX0gfCBcclxuICAgICAgICAgICAgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyB8IFxyXG4gICAgICAgICAgICAke2NhbXBhaWduLmFkc0NvdW50fSBhZHNcclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAke2NhbXBhaWduLnRvcDUgJiYgY2FtcGFpZ24udG9wNS5sZW5ndGggPiAwID8gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWRzXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWxhYmVsXCI+VG9wIDUgQWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1ncmlkXCI+XHJcbiAgICAgICAgICAgICAgJHtjYW1wYWlnbi50b3A1Lm1hcChhZCA9PiBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWRcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TGlicmFyeSBJRDo8L3N0cm9uZz4gXHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHthZC5saWJyYXJ5SWR9XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1saW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAke2FkLmxpYnJhcnlJZH1cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWQtbWV0YVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RGF0ZXM6PC9zdHJvbmc+ICR7bmV3IERhdGUoYWQuc3RhcnRpbmdEYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoKX0g4oCUICR7bmV3IERhdGUoYWQuZW5kRGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCl9PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RHVyYXRpb246PC9zdHJvbmc+ICR7YWQuZHVyYXRpb259IGRheXNcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZC1jb3B5XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICR7YWQubWVkaWFUeXBlID09PSAndmlkZW8nXHJcbiAgICAgICAgICA/IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPjx2aWRlbyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBoZWlnaHQ6IGF1dG87IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L3ZpZGVvPjwvZGl2PmBcclxuICAgICAgICAgIDogKGFkLm1lZGlhVHlwZSA9PT0gJ2ltYWdlJyA/IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPjxpbWcgc3JjPVwiJHthZC5tZWRpYVNyY31cIiBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgaGVpZ2h0OiBhdXRvOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC9kaXY+YCA6ICcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkFkIENvcHk6PC9zdHJvbmc+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7YWQuYWRUZXh0IHx8ICdbbm8gY29weV0nfVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIGAgOiAnPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LW5vLWFkc1wiPk5vIHRvcCBhZHMgZGF0YSBhdmFpbGFibGU8L2Rpdj4nfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFjdGlvbnNcIiBzdHlsZT1cIm1hcmdpbi10b3A6IDE1cHg7IG1hcmdpbi1ib3R0b206IDIwcHg7IGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7IGdhcDogMTBweDtcIj5cclxuICAgICAgICAke3N0YXRlLmFpQ29uZmlnID8gYFxyXG4gICAgICAgIDxidXR0b24gaWQ9XCJmYkFkc0FuYWx5emVCdG5cIiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIj5cclxuICAgICAgICAgICR7SUNPTlMuYWl9IEFuYWx5emUgd2l0aCBBSVxyXG4gICAgICAgIDwvYnV0dG9uPmAgOiAnJ1xyXG4gICAgICB9XHJcbiAgICA8YnV0dG9uIGlkPVwiZmJBZHNDb3B5QWxsVGV4dEJ0blwiIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiPlxyXG4gICAgICAke0lDT05TLmNvcHl9IENvcHkgQWxsIFRleHRcclxuICAgIDwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgIDxkaXYgaWQ9XCJmYkFkc0FJUmVzdWx0XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lOyBtYXJnaW4tYm90dG9tOiAyMHB4OyBiYWNrZ3JvdW5kOiAjZjBmZGY0OyBib3JkZXI6IDFweCBzb2xpZCAjYmJmN2QwOyBib3JkZXItcmFkaXVzOiA4cHg7IGNvbG9yOiAjMTY2NTM0OyBvdmVyZmxvdzogaGlkZGVuO1wiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1haS1oZWFkZXJcIiBzdHlsZT1cInBhZGRpbmc6IDEycHggMTZweDsgYmFja2dyb3VuZDogI2RjZmNlNzsgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyOyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYmJmN2QwO1wiPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC13ZWlnaHQ6IDYwMDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA4cHg7XCI+JHtJQ09OUy5haX0gQUkgQW5hbHlzaXM8L2Rpdj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1haS1taW5pbWl6ZVwiIHN0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBmb250LXNpemU6IDE4cHg7IGNvbG9yOiAjMTY2NTM0OyBjdXJzb3I6IHBvaW50ZXI7IGxpbmUtaGVpZ2h0OiAxO1wiPuKIkjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFpLWNvbnRlbnRcIiBzdHlsZT1cInBhZGRpbmc6IDE2cHg7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcIj48L2Rpdj5cclxuICAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtb3V0cHV0XCI+JHtvdXRwdXR9PC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIFRvZ2dsZSBtaW5pbWl6ZVxyXG4gICAgY29uc3QgYWlIZWFkZXIgPSBjaGFydENvbnRlbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy1haS1oZWFkZXInKTtcclxuICAgIGNvbnN0IGFpQ29udGVudCA9IGNoYXJ0Q29udGVudC5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLWNvbnRlbnQnKTtcclxuICAgIGNvbnN0IG1pbmltaXplQnRuID0gY2hhcnRDb250ZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktbWluaW1pemUnKTtcclxuXHJcbiAgICBpZiAoYWlIZWFkZXIpIHtcclxuICAgICAgYWlIZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNIaWRkZW4gPSBhaUNvbnRlbnQuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xyXG4gICAgICAgIGFpQ29udGVudC5zdHlsZS5kaXNwbGF5ID0gaXNIaWRkZW4gPyAnYmxvY2snIDogJ25vbmUnO1xyXG4gICAgICAgIG1pbmltaXplQnRuLnRleHRDb250ZW50ID0gaXNIaWRkZW4gPyAn4oiSJyA6ICcrJztcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzdG9yZSBBSSBSZXN1bHQgaWYgZXhpc3RzXHJcbiAgICBjb25zdCByZXN1bHREaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBSVJlc3VsdCcpO1xyXG4gICAgaWYgKHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQpIHtcclxuICAgICAgY29uc3QgY29udGVudERpdiA9IHJlc3VsdERpdi5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLWNvbnRlbnQnKTtcclxuICAgICAgY29udGVudERpdi5pbm5lckhUTUwgPSBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0O1xyXG4gICAgICByZXN1bHREaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHN0YXRlLmFpQ29uZmlnKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhbmFseXplV2l0aEFJKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDb3B5QWxsVGV4dEJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy10ZXh0LW91dHB1dCcpO1xyXG4gICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gMS4gVGVtcG9yYXJpbHkgaGlkZSBtZWRpYVxyXG4gICAgICBjb25zdCBtZWRpYSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdpbWcsIHZpZGVvJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsRGlzcGxheXMgPSBbXTtcclxuICAgICAgbWVkaWEuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgb3JpZ2luYWxEaXNwbGF5cy5wdXNoKGVsLnN0eWxlLmRpc3BsYXkpO1xyXG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gMi4gU2VsZWN0IGNvbnRlbnRcclxuICAgICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhjb250YWluZXIpO1xyXG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XHJcblxyXG4gICAgICAvLyAzLiBDb3B5XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ29weUFsbFRleHRCdG4nKTtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4uaW5uZXJIVE1MO1xyXG4gICAgICAgIGJ0bi5pbm5lckhUTUwgPSBgJHtJQ09OUy5jaGVja30gQ29waWVkIWA7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBidG4uaW5uZXJIVE1MID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIH0sIDIwMDApO1xyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdDb3B5IGZhaWxlZDonLCBlcnIpO1xyXG4gICAgICAgIGFsZXJ0KCdDb3B5IGZhaWxlZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyA0LiBDbGVhbnVwXHJcbiAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgbWVkaWEuZm9yRWFjaCgoZWwsIGkpID0+IHtcclxuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gb3JpZ2luYWxEaXNwbGF5c1tpXTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9wZW5DYW1wYWlnbkRldGFpbHMoY2FtcGFpZ24pIHtcclxuICAgIGlmICghY2FtcGFpZ24udG9wNSB8fCBjYW1wYWlnbi50b3A1Lmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBjb250ZW50ID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtbGlzdFwiPmA7XHJcblxyXG4gICAgY2FtcGFpZ24udG9wNS5mb3JFYWNoKChhZCwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyKSA9PiBuZXcgRGF0ZShkYXRlU3RyKS50b0RhdGVTdHJpbmcoKTtcclxuICAgICAgY29udGVudCArPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FyZCBmYi1hZHMtY2FyZC13aGl0ZVwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLXJhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtcmFuay1udW1iZXJcIj4jJHtpbmRleCArIDF9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxpYnJhcnktaWQtbGFiZWxcIj5MaWJyYXJ5IElEPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vYWRzL2xpYnJhcnkvP2lkPSR7YWQubGlicmFyeUlkfVwiIHRhcmdldD1cIl9ibGFua1wiIGNsYXNzPVwiZmItYWRzLWxpYnJhcnktaWQtbGlua1wiPiR7YWQubGlicmFyeUlkfTwvYT5cclxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWR1cmF0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWR1cmF0aW9uLWxhYmVsXCI+RHVyYXRpb248L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtZHVyYXRpb24tdmFsdWVcIj4ke2FkLmR1cmF0aW9ufSBkYXlzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsLW1ldGFcIj4ke2Zvcm1hdERhdGUoYWQuc3RhcnRpbmdEYXRlKX0gLSAke2Zvcm1hdERhdGUoYWQuZW5kRGF0ZSl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWNvcHktc2VjdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICR7YWQubWVkaWFUeXBlID09PSAndmlkZW8nXHJcbiAgICAgICAgICA/IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWltYWdlXCIgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxMnB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+PHZpZGVvIHNyYz1cIiR7YWQubWVkaWFTcmN9XCIgY29udHJvbHMgc3R5bGU9XCJtYXgtd2lkdGg6IDEwMCU7IG1heC1oZWlnaHQ6IDMwMHB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGJveC1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSk7XCI+PC92aWRlbz48L2Rpdj5gXHJcbiAgICAgICAgICA6IChhZC5tZWRpYVR5cGUgPT09ICdpbWFnZScgPyBgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1pbWFnZVwiIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTJweDsgdGV4dC1hbGlnbjogY2VudGVyO1wiPjxpbWcgc3JjPVwiJHthZC5tZWRpYVNyY31cIiBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgbWF4LWhlaWdodDogMzAwcHg7IGJvcmRlci1yYWRpdXM6IDZweDsgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKTtcIj48L2Rpdj5gIDogJycpXHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5LWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWNvcHktbGFiZWxcIj5BZCBDb3B5PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtY29weS1idG5cIiBcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWNvcHktdGV4dD1cIiR7ZW5jb2RlVVJJQ29tcG9uZW50KGFkLmFkVGV4dCB8fCAnJyl9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLXVybD1cIiR7ZW5jb2RlVVJJQ29tcG9uZW50KGNhbXBhaWduLnVybCl9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWNhbXBhaWduLWR1cmF0aW9uPVwiJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c31cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtY2FtcGFpZ24tYWRzPVwiJHtjYW1wYWlnbi5hZHNDb3VudH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtYWQtbGliLWlkPVwiJHthZC5saWJyYXJ5SWR9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFkLWR1cmF0aW9uPVwiJHthZC5kdXJhdGlvbn1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtYWQtZGF0ZXM9XCIke2Zvcm1hdERhdGUoYWQuc3RhcnRpbmdEYXRlKX0g4oCUICR7Zm9ybWF0RGF0ZShhZC5lbmREYXRlKX1cIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtJQ09OUy5jb3B5fSBDb3B5XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWNvcHlcIj4ke2FkLmFkVGV4dCB8fCAnW05vIGNvcHkgYXZhaWxhYmxlXSd9PC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgYDtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnRlbnQgKz0gYDwvZGl2PmA7XHJcbiAgICBzaG93TW9kYWwoY29udGVudCwgYCR7Y2FtcGFpZ24udXJsfSBgLCBgJHtjYW1wYWlnbi5hZHNDb3VudH0gdG90YWwgYWRzIOKAoiAke2NhbXBhaWduLmNhbXBhaWduRHVyYXRpb25EYXlzfSBkYXlzIGFjdGl2ZWApO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tIERhdGEgTWFuYWdlbWVudCAtLS1cclxuXHJcbiAgZnVuY3Rpb24gZG93bmxvYWREYXRhKCkge1xyXG4gICAgLy8gR2VuZXJhdGUgZmlsZW5hbWUgcHJvcGVydGllc1xyXG4gICAgY29uc3QgYWR2ZXJ0aXNlciA9IChzdGF0ZS5tZXRhZGF0YT8uYWR2ZXJ0aXNlck5hbWUgfHwgJ2ZiX2Fkc19hbmFseXNpcycpXHJcbiAgICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcclxuICAgICAgLnJlcGxhY2UoLyheLXwtJCkvZywgJycpO1xyXG5cclxuICAgIGNvbnN0IGNvdW50ID0gc3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aDtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgZGF0ZSByYW5nZSBmcm9tIGFsbCBjYW1wYWlnbnNcclxuICAgIGxldCBtaW5EYXRlID0gbmV3IERhdGUoKTtcclxuICAgIGxldCBtYXhEYXRlID0gbmV3IERhdGUoMCk7XHJcblxyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zLmZvckVhY2goYyA9PiB7XHJcbiAgICAgIGlmIChjLmZpcnN0QWR2ZXJ0aXNlZCA8IG1pbkRhdGUpIG1pbkRhdGUgPSBjLmZpcnN0QWR2ZXJ0aXNlZDtcclxuICAgICAgaWYgKGMubGFzdEFkdmVydGlzZWQgPiBtYXhEYXRlKSBtYXhEYXRlID0gYy5sYXN0QWR2ZXJ0aXNlZDtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhlbHBlciBmb3IgZGF0ZSBmb3JtYXR0aW5nIGxpa2UgXCJqYW4tMS0yMDI1XCJcclxuICAgIGNvbnN0IGZvcm1hdERhdGUgPSAoZCkgPT4ge1xyXG4gICAgICBjb25zdCBtID0gW1wiamFuXCIsIFwiZmViXCIsIFwibWFyXCIsIFwiYXByXCIsIFwibWF5XCIsIFwianVuXCIsIFwianVsXCIsIFwiYXVnXCIsIFwic2VwXCIsIFwib2N0XCIsIFwibm92XCIsIFwiZGVjXCJdO1xyXG4gICAgICByZXR1cm4gYCR7bVtkLmdldE1vbnRoKCldfSAtJHtkLmdldERhdGUoKX0gLSR7ZC5nZXRGdWxsWWVhcigpfSBgO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBzdGFydFN0ciA9IGZvcm1hdERhdGUobWluRGF0ZSk7XHJcbiAgICBjb25zdCBlbmRTdHIgPSBmb3JtYXREYXRlKG1heERhdGUpO1xyXG5cclxuICAgIC8vIEZpbGVuYW1lOiBwZW5nLWpvb24tZmItYWRzLTgtY2FtcGFpZ25zLWZyb20tamFuLTEtMjAyNS10by1kZWMtMjQtMjAyNS5qc29uXHJcbiAgICBjb25zdCBmaWxlbmFtZSA9IGAke2FkdmVydGlzZXJ9IC1mYiAtIGFkcyAtICR7Y291bnR9IC1jYW1wYWlnbnMgLSBmcm9tIC0gJHtzdGFydFN0cn0gLXRvIC0gJHtlbmRTdHJ9Lmpzb25gO1xyXG5cclxuICAgIGNvbnN0IGRhdGFTdHIgPSBcImRhdGE6dGV4dC9qc29uO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICBjYW1wYWlnbnM6IHN0YXRlLnJhd0NhbXBhaWducyxcclxuICAgICAgYWxsQWRzOiBzdGF0ZS5hbGxBZHMsXHJcbiAgICAgIG1ldGFkYXRhOiBzdGF0ZS5tZXRhZGF0YSB8fCB7IGFkdmVydGlzZXJOYW1lOiBhZHZlcnRpc2VyIH0sIC8vIEZhbGxiYWNrIG1ldGFkYXRhXHJcbiAgICAgIGFpQW5hbHlzaXNSZXN1bHQ6IHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgfHwgbnVsbFxyXG4gICAgfSwgbnVsbCwgMikpO1xyXG5cclxuICAgIGNvbnN0IGRvd25sb2FkQW5jaG9yTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGRvd25sb2FkQW5jaG9yTm9kZS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIGRhdGFTdHIpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIGZpbGVuYW1lKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZG93bmxvYWRBbmNob3JOb2RlKTtcclxuICAgIGRvd25sb2FkQW5jaG9yTm9kZS5jbGljaygpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLnJlbW92ZSgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlRmlsZUltcG9ydChldmVudCkge1xyXG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlc1swXTtcclxuICAgIGlmICghZmlsZSkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICByZWFkZXIub25sb2FkID0gKGUpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShlLnRhcmdldC5yZXN1bHQpO1xyXG4gICAgICAgIGlmICghanNvbi5jYW1wYWlnbnMpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZm9ybWF0XCIpO1xyXG4gICAgICAgIGxvYWRJbXBvcnRlZERhdGEoanNvbik7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciBpbXBvcnRpbmcgZmlsZTogJyArIGVyci5tZXNzYWdlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9hZEltcG9ydGVkRGF0YShpbXBvcnRlZERhdGEpIHtcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducyA9IGltcG9ydGVkRGF0YS5jYW1wYWlnbnMgfHwgW107XHJcbiAgICBzdGF0ZS5hbGxBZHMgPSBpbXBvcnRlZERhdGEuYWxsQWRzIHx8IFtdO1xyXG4gICAgc3RhdGUubWV0YWRhdGEgPSBpbXBvcnRlZERhdGEubWV0YWRhdGEgfHwgbnVsbDtcclxuICAgIHN0YXRlLmlzSW1wb3J0ZWQgPSAhIWltcG9ydGVkRGF0YS5pc0ltcG9ydGVkO1xyXG4gICAgc3RhdGUuYWlBbmFseXNpc1Jlc3VsdCA9IGltcG9ydGVkRGF0YS5haUFuYWx5c2lzUmVzdWx0IHx8IG51bGw7XHJcblxyXG4gICAgLy8gSGlkZSBEb3dubG9hZCBCdXR0b24gaWYgaW1wb3J0ZWRcclxuICAgIGNvbnN0IGRvd25sb2FkQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzRG93bmxvYWRCdG4nKTtcclxuICAgIGlmIChzdGF0ZS5pc0ltcG9ydGVkKSB7XHJcbiAgICAgIGRvd25sb2FkQnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb3dubG9hZEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1mbGV4JztcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXJzZSBkYXRlc1xyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zLmZvckVhY2goYyA9PiB7XHJcbiAgICAgIGMuZmlyc3RBZHZlcnRpc2VkID0gbmV3IERhdGUoYy5maXJzdEFkdmVydGlzZWQpO1xyXG4gICAgICBjLmxhc3RBZHZlcnRpc2VkID0gbmV3IERhdGUoYy5sYXN0QWR2ZXJ0aXNlZCk7XHJcbiAgICAgIGlmIChjLnRvcDUpIHtcclxuICAgICAgICBjLnRvcDUuZm9yRWFjaChhZCA9PiB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBkYXRlIHN0cmluZ3Mgb3Igb2JqZWN0c1xyXG4gICAgICAgICAgYWQuc3RhcnRpbmdEYXRlID0gbmV3IERhdGUoYWQuc3RhcnRpbmdEYXRlKTtcclxuICAgICAgICAgIGFkLmVuZERhdGUgPSBuZXcgRGF0ZShhZC5lbmREYXRlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSW5pdGlhbCBTb3J0XHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYi5maXJzdEFkdmVydGlzZWQpIC0gbmV3IERhdGUoYS5maXJzdEFkdmVydGlzZWQpKTtcclxuXHJcblxyXG5cclxuICAgIHVwZGF0ZVZpZXcoKTtcclxuICAgIHNob3dPdmVybGF5KCk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gQUkgTG9naWMgKENTUCBGaXhlZCkgLS0tXHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGFuYWx5emVXaXRoQUkoKSB7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBbmFseXplQnRuJyk7XHJcbiAgICBjb25zdCByZXN1bHREaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBSVJlc3VsdCcpO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIGNvbmZpZ3VyYXRpb24gZXhpc3RzIChldmVuIGlmIG5vIGFwaUtleSBsb2NhbGx5KVxyXG4gICAgaWYgKCFzdGF0ZS5haUNvbmZpZykge1xyXG4gICAgICBhbGVydCgnQUkgQ29uZmlndXJhdGlvbiBtaXNzaW5nLiBQbGVhc2UgY2hlY2sgZGF0YWJhc2Ugc2V0dGluZ3MuJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgYnRuLmlubmVySFRNTCA9IGAke0lDT05TLmFpfSBBbmFseXppbmcuLi5gO1xyXG4gICAgcmVzdWx0RGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgLy8gQnVpbGQgc3RydWN0dXJlZCBjb250ZW50XHJcbiAgICBsZXQgc3RydWN0dXJlZENvbnRlbnQgPSBbXTtcclxuXHJcbiAgICAvLyBIZWxwZXIgZm9yIHNhZmUgZGF0ZXNcclxuICAgIGNvbnN0IHNhZmVEYXRlID0gKGQpID0+IHtcclxuICAgICAgdHJ5IHsgcmV0dXJuIG5ldyBEYXRlKGQpLnRvTG9jYWxlRGF0ZVN0cmluZygpOyB9IGNhdGNoIChlKSB7IHJldHVybiAnTi9BJzsgfVxyXG4gICAgfTtcclxuXHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaCgoYykgPT4ge1xyXG4gICAgICBpZiAoIWMudG9wNSB8fCBjLnRvcDUubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICBsZXQgaGFzVmFsaWRBZHMgPSBmYWxzZTtcclxuICAgICAgbGV0IGNhbXBhaWduQmxvY2sgPSBgQ0FNUEFJR046ICR7Yy51cmx9XFxuYDtcclxuICAgICAgY2FtcGFpZ25CbG9jayArPSBgTUVUQURBVEE6IER1cmF0aW9uOiAke2MuY2FtcGFpZ25EdXJhdGlvbkRheXN9IGRheXMgfCBBZHMgQ291bnQ6ICR7Yy5hZHNDb3VudH0gfCBBY3RpdmU6ICR7c2FmZURhdGUoYy5maXJzdEFkdmVydGlzZWQpfSB0byAke3NhZmVEYXRlKGMubGFzdEFkdmVydGlzZWQpfVxcbmA7XHJcbiAgICAgIGNhbXBhaWduQmxvY2sgKz0gYFRPUCBBRFM6XFxuYDtcclxuXHJcbiAgICAgIGMudG9wNS5mb3JFYWNoKChhZCwgaW5kZXgpID0+IHtcclxuICAgICAgICAvLyBTa2lwIGFkcyB3aXRoIHZlcnkgbGl0dGxlIHRleHQgaWYgZGVzaXJhYmxlLCBidXQgdXNlciBhc2tlZCBmb3IgXCJhbGwgZGF0YVwiXHJcbiAgICAgICAgLy8gc3RpY2tpbmcgdG8gYSBiYXNpYyBsZW5ndGggY2hlY2sgdG8gYXZvaWQgZW1wdHkgbm9pc2VcclxuICAgICAgICBpZiAoIWFkLmFkVGV4dCB8fCBhZC5hZFRleHQubGVuZ3RoIDwgNSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBoYXNWYWxpZEFkcyA9IHRydWU7XHJcbiAgICAgICAgY2FtcGFpZ25CbG9jayArPSBgICBbQWQgIyR7aW5kZXggKyAxfV0gTGliSUQ6ICR7YWQubGlicmFyeUlkfSB8IER1cmF0aW9uOiAke2FkLmR1cmF0aW9ufSBkYXlzIHwgRGF0ZXM6ICR7c2FmZURhdGUoYWQuc3RhcnRpbmdEYXRlKX0gLSAke3NhZmVEYXRlKGFkLmVuZERhdGUpfVxcbmA7XHJcbiAgICAgICAgLy8gQ2xlYW4gdXAgbmV3bGluZXMgZm9yIGNvbXBhY3RuZXNzIGJ1dCBrZWVwIHN0cnVjdHVyZVxyXG4gICAgICAgIGNhbXBhaWduQmxvY2sgKz0gYCAgVEVYVDogJHthZC5hZFRleHQucmVwbGFjZSgvXFxuXFxzKlxcbi9nLCAnXFxuJykudHJpbSgpfVxcblxcbmA7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY2FtcGFpZ25CbG9jayArPSBgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5gO1xyXG5cclxuICAgICAgaWYgKGhhc1ZhbGlkQWRzKSB7XHJcbiAgICAgICAgc3RydWN0dXJlZENvbnRlbnQucHVzaChjYW1wYWlnbkJsb2NrKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHN0cnVjdHVyZWRDb250ZW50Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBhbGVydCgnTm8gdmFsaWQgYWQgY29udGVudCBmb3VuZCB0byBhbmFseXplLicpO1xyXG4gICAgICBidG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgYnRuLmlubmVySFRNTCA9IGAke0lDT05TLmFpfSBBbmFseXplIHdpdGggQUlgO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGltaXQgdG90YWwgbGVuZ3RoIHRvIGF2b2lkIGNvbnRleHQgd2luZG93IGlzc3VlcyAoYXBwcm94IDMwayBjaGFycyBzYWZlIGZvciBtb3N0IG1vZGVscyB0b2RheSlcclxuICAgIGxldCBmaW5hbFN0cmluZyA9IHN0cnVjdHVyZWRDb250ZW50LmpvaW4oJ1xcbicpO1xyXG4gICAgaWYgKGZpbmFsU3RyaW5nLmxlbmd0aCA+IDQwMDAwKSB7XHJcbiAgICAgIGZpbmFsU3RyaW5nID0gZmluYWxTdHJpbmcuc3Vic3RyaW5nKDAsIDQwMDAwKSArIFwiXFxuLi4uW1RSVU5DQVRFRCBEQVRBXVwiO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IHN0YXRlLmFpQ29uZmlnLnN5c3RlbVByb21wdCB8fCBcIllvdSBhcmUgYW4gZXhwZXJ0IG1hcmtldGluZyBhbmFseXN0LiBBbmFseXplIHRoZXNlIEZhY2Vib29rIGFkIGNhbXBhaWducy4gTG9vayBmb3IgcGF0dGVybnMgaW4gdGhlIHN1Y2Nlc3NmdWwgYWRzIChoaWdoIGR1cmF0aW9uLCBoaWdoIGNvdW50KS4gSWRlbnRpZnkgaG9va3MsIGFuZ2xlcywgYW5kIHN0cnVjdHVyZXMgdGhhdCBhcmUgd29ya2luZyBhY3Jvc3MgdGhlIHRpbWVsaW5lLiBGb2N1cyBvbiB0aGUgVG9wIEFkcyBwcm92aWRlZCBmb3IgZWFjaCBjYW1wYWlnbi5cIjtcclxuICAgIGNvbnN0IHVzZXJDb250ZW50ID0gXCJBbmFseXplIHRoZSBmb2xsb3dpbmcgY2FtcGFpZ24gcGVyZm9ybWFuY2UgZGF0YTpcXG5cXG5cIiArIGZpbmFsU3RyaW5nO1xyXG5cclxuICAgIC8vIERlZmluZSByZXNwb25zZSBoYW5kbGVyXHJcbiAgICBjb25zdCBoYW5kbGVSZXNwb25zZSA9IChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gZS5kZXRhaWw7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZiQWRzQW5hbHl6ZVJlc3BvbnNlJywgaGFuZGxlUmVzcG9uc2UpO1xyXG5cclxuICAgICAgLy8gUmUtcXVlcnkgZWxlbWVudHMgdG8gZW5zdXJlIHdlIGludGVyYWN0IHdpdGggdGhlIGN1cnJlbnQgRE9NICh2aWV3IG1pZ2h0IGhhdmUgcmVmcmVzaGVkKVxyXG4gICAgICBjb25zdCBjdXJyZW50UmVzdWx0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQUlSZXN1bHQnKTtcclxuICAgICAgY29uc3QgY3VycmVudEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgLy8gTWFya2Rvd24gY29udmVyc2lvbiBzaW1wbGUgcmVwbGFjZW1lbnQgZm9yIGJvbGQvbmV3bGluZXMgaWYgbmVlZGVkLCBcclxuICAgICAgICAvLyBidXQgaW5uZXJIVE1MIHByZXNlcnZlcyBiYXNpYyBmb3JtYXR0aW5nIG1vc3RseS5cclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSByZXNwb25zZS5hbmFseXNpcy5yZXBsYWNlKC9cXG4vZywgJzxicj4nKS5yZXBsYWNlKC9cXCpcXCooLio/KVxcKlxcKi9nLCAnPHN0cm9uZz4kMTwvc3Ryb25nPicpO1xyXG4gICAgICAgIHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgPSBmb3JtYXR0ZWQ7IC8vIFNhdmUgc3RhdGVcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRSZXN1bHREaXYpIHtcclxuICAgICAgICAgIGNvbnN0IGNvbnRlbnREaXYgPSBjdXJyZW50UmVzdWx0RGl2LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktY29udGVudCcpO1xyXG4gICAgICAgICAgaWYgKGNvbnRlbnREaXYpIHtcclxuICAgICAgICAgICAgY29udGVudERpdi5pbm5lckhUTUwgPSBmb3JtYXR0ZWQ7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBGYWxsYmFjayBpZiBzdHJ1Y3R1cmUgaXMgc29tZWhvdyBtaXNzaW5nXHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXN1bHREaXYuaW5uZXJIVE1MID0gYDxzdHJvbmc+JHtJQ09OUy5haX0gQUkgQW5hbHlzaXM6PC9zdHJvbmc+IDxicj48YnI+JHtmb3JtYXR0ZWR9YDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGN1cnJlbnRSZXN1bHREaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gcmVzcG9uc2UgPyAocmVzcG9uc2UuZXJyb3IgfHwgJ1Vua25vd24gZXJyb3InKSA6ICdVbmtub3duIGVycm9yJztcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdBSSBBbmFseXNpcyBmYWlsZWQ6JywgZXJyb3JNc2cpO1xyXG4gICAgICAgIGFsZXJ0KCdBbmFseXNpcyBmYWlsZWQ6ICcgKyBlcnJvck1zZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjdXJyZW50QnRuKSB7XHJcbiAgICAgICAgY3VycmVudEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN1cnJlbnRCdG4uaW5uZXJIVE1MID0gYCR7SUNPTlMuYWl9IEFuYWx5emUgd2l0aCBBSWA7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gTGlzdGVuIGZvciByZXNwb25zZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcblxyXG4gICAgLy8gRGlzcGF0Y2ggcmVxdWVzdCB0byBjb250ZW50IHNjcmlwdCAtPiBiYWNrZ3JvdW5kXHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBEaXNwYXRjaGluZyBBSSBhbmFseXNpcyByZXF1ZXN0Jyk7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZmJBZHNBbmFseXplUmVxdWVzdCcsIHtcclxuICAgICAgZGV0YWlsOiB7XHJcbiAgICAgICAgc3lzdGVtUHJvbXB0OiBzeXN0ZW1Qcm9tcHQsXHJcbiAgICAgICAgdXNlckNvbnRlbnQ6IHVzZXJDb250ZW50XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICAvLyBGYWxsYmFjay9UaW1lb3V0IGNsZWFudXBcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAvLyBSZS1xdWVyeSBidG4gZm9yIHRpbWVvdXQgY2hlY2tcclxuICAgICAgY29uc3QgY3VycmVudEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuICAgICAgaWYgKGN1cnJlbnRCdG4gJiYgY3VycmVudEJ0bi5kaXNhYmxlZCAmJiBjdXJyZW50QnRuLmlubmVySFRNTC5pbmNsdWRlcygnQW5hbHl6aW5nJykpIHtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmYkFkc0FuYWx5emVSZXNwb25zZScsIGhhbmRsZVJlc3BvbnNlKTtcclxuICAgICAgICBjdXJyZW50QnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgY3VycmVudEJ0bi5pbm5lckhUTUwgPSBgJHtJQ09OUy5haX0gQW5hbHl6ZSB3aXRoIEFJYDtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1tGQiBBZHMgVmlzdWFsaXplcl0gQUkgcmVxdWVzdCB0aW1lZCBvdXQnKTtcclxuICAgICAgfVxyXG4gICAgfSwgNjAwMDApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIC0tLSBFdmVudCBCcmlkZ2UgLS0tXHJcblxyXG4gIC8vIExpc3RlbiBmb3IgaW1wb3J0ZWQgZGF0YSB2aWEgQ3VzdG9tRXZlbnQgKGZyb20gaW5qZWN0ZWQuanMpXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNJbXBvcnREYXRhJywgKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBSZWNlaXZlZCBpbXBvcnRlZCBkYXRhIHZpYSBDdXN0b21FdmVudCcpO1xyXG4gICAgbG9hZEltcG9ydGVkRGF0YShldmVudC5kZXRhaWwpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIHJlb3BlbiByZXF1ZXN0XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNSZW9wZW4nLCAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBSZW9wZW5pbmcgb3ZlcmxheScpO1xyXG4gICAgc2hvd092ZXJsYXkoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciBBSSBDb25maWdcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc0NvbmZpZycsIChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUmVjZWl2ZWQgQUkgQ29uZmlnJyk7XHJcbiAgICBzdGF0ZS5haUNvbmZpZyA9IGV2ZW50LmRldGFpbDtcclxuICAgIHVwZGF0ZVZpZXcoKTsgLy8gUmUtcmVuZGVyIHRvIHNob3cgQUkgYnV0dG9uIGlmIG5lZWRlZFxyXG4gIH0pO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIFNjcmFwaW5nIFN0YXR1c1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzU3RhdHVzJywgKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zdCB7IHNjcm9sbGluZywgYWRzRm91bmQsIG1lc3NhZ2UgfSA9IGV2ZW50LmRldGFpbDtcclxuXHJcbiAgICAvLyBFbnN1cmUgb3ZlcmxheSBpcyB2aXNpYmxlIGJ1dCBtaW5pbWl6ZWRcclxuICAgIGlmIChzY3JvbGxpbmcpIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdtaW5pbWl6ZWQnKTtcclxuICAgICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1pbkJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01pbmltaXplZEJhcicpO1xyXG4gICAgY29uc3QgaWNvbiA9IG1pbkJhci5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLW1pbmktaWNvbicpO1xyXG4gICAgY29uc3QgdGV4dCA9IG1pbkJhci5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLW1pbmktdGV4dCcpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWF4aW1pemVCdG4nKTtcclxuXHJcbiAgICBpZiAoc2Nyb2xsaW5nKSB7XHJcbiAgICAgIGljb24uaW5uZXJIVE1MID0gYDxzcGFuIGNsYXNzPVwiZmItYWRzLW1pbmktc3Bpbm5lclwiPiR7SUNPTlMucmVmcmVzaH08L3NwYW4+YDtcclxuICAgICAgdGV4dC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XHJcbiAgICAgIC8vIG1pbkJhci5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byByaWdodCwgI2Y1OWUwYiwgI2Q5NzcwNiknOyAvLyBSZW1vdmVkIHRvIG1hdGNoIHN0eWxpbmdcclxuICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IC8vIEhpZGUgXCJTaG93XCIgYnV0dG9uIHdoaWxlIHNjcmFwaW5nXHJcblxyXG4gICAgICAvLyBBZGQgc3Bpbm5lciBzdHlsZSBpZiBub3QgZXhpc3RzXHJcbiAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWluaVNwaW5uZXJTdHlsZScpKSB7XHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgIHN0eWxlLmlkID0gJ2ZiQWRzTWluaVNwaW5uZXJTdHlsZSc7XHJcbiAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSBgXHJcbiAgICAgIEBrZXlmcmFtZXMgZmJBZHNTcGluIHsxMDAgJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH19XHJcbiAgICAgIC5mYi1hZHMtbWluaS1zcGlubmVyIHtkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGFuaW1hdGlvbjogZmJBZHNTcGluIDFzIGxpbmVhciBpbmZpbml0ZTsgfVxyXG4gICAgICAuZmItYWRzLW1pbmktc3Bpbm5lciBzdmcgeyB3aWR0aDogMjBweDsgaGVpZ2h0OiAyMHB4OyB9XHJcbiAgICAgIGA7XHJcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERvbmVcclxuICAgICAgaWNvbi5pbm5lckhUTUwgPSBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogMjRweDsgaGVpZ2h0OiAyNHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyO1wiPmA7XHJcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSAnQW5hbHlzaXMgUmVhZHkhJztcclxuICAgICAgbWluQmFyLnN0eWxlLmJhY2tncm91bmQgPSAnJzsgLy8gUmV2ZXJ0IHRvIGRlZmF1bHQgYmx1ZS9wdXJwbGVcclxuICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBFeHBvc2UgcmVvcGVuIGhlbHBlclxyXG4gIHdpbmRvdy5mYkFkc1Jlb3Blbk92ZXJsYXkgPSBzaG93T3ZlcmxheTtcclxuXHJcbiAgLy8gQ2hlY2sgZm9yIHByZS1pbmplY3RlZCBkYXRhIChmcm9tIGZpbGUgaW1wb3J0KVxyXG4gIGNvbnN0IHByZUluamVjdGVkRGF0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydGVkRGF0YScpO1xyXG4gIGlmIChwcmVJbmplY3RlZERhdGEpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHByZUluamVjdGVkRGF0YS50ZXh0Q29udGVudCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIEZvdW5kIHByZS1pbmplY3RlZCBkYXRhLCBsb2FkaW5nLi4uJyk7XHJcbiAgICAgIGxvYWRJbXBvcnRlZERhdGEoanNvbik7XHJcbiAgICAgIC8vIENsZWFuIHVwXHJcbiAgICAgIHByZUluamVjdGVkRGF0YS5yZW1vdmUoKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0ZCIEFkcyBWaXN1YWxpemVyXSBFcnJvciBsb2FkaW5nIHByZS1pbmplY3RlZCBkYXRhOicsIGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0pKCk7Il0sIm5hbWVzIjpbIl9hIl0sIm1hcHBpbmdzIjoiQ0FFQyxXQUFZO0FBRmI7QUFHRSxVQUFRLElBQUksNENBQTRDO0FBR3hELFFBQU0sUUFBUTtBQUFBLElBQ1osVUFBVTtBQUFBLElBQ1YsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLEVBQ1o7QUFHRSxRQUFNLFFBQVE7QUFBQSxJQUNaLGNBQWMsQ0FBQTtBQUFBLElBRWQsUUFBUSxDQUFBO0FBQUEsSUFFUixZQUFZO0FBQUEsSUFDWixZQUFZO0FBQUE7QUFBQSxJQUNaLGVBQWU7QUFBQSxJQUNmLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQTtBQUFBLElBS2IsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBO0FBQUEsSUFDZixZQUFZO0FBQUEsRUFDaEI7QUFHRSxXQUFTLGdCQUFnQixPQUFPO0FBQzlCLFFBQUksU0FBUyxJQUFLLFFBQU87QUFDekIsUUFBSSxTQUFTLEdBQUksUUFBTztBQUN4QixRQUFJLFNBQVMsR0FBSSxRQUFPO0FBQ3hCLFFBQUksU0FBUyxHQUFJLFFBQU87QUFDeEIsUUFBSSxTQUFTLEVBQUcsUUFBTztBQUN2QixXQUFPO0FBQUEsRUFDVDtBQUdBLFFBQU0sV0FBVyxTQUFTLGVBQWUsYUFBYTtBQUN0RCxRQUFNLFlBQVUsMENBQVUsWUFBVixtQkFBbUIsWUFBVztBQUc5QyxRQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsVUFBUSxLQUFLO0FBQ2IsVUFBUSxZQUFZO0FBQ3BCLFVBQVEsWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUlFLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDRCQWNILE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDhGQWlCMkQsTUFBTSxRQUFRO0FBQUEsd0ZBQ3BCLE1BQU0sSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsNkhBUTJCLE1BQU0sTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEseUZBUWhELE1BQU0sSUFBSTtBQUFBLHVGQUNaLE1BQU0sTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXNDakcsV0FBUyxLQUFLLFlBQVksT0FBTztBQUdqQyxRQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsVUFBUSxZQUFZO0FBQ3BCLFVBQVEsWUFBWSxPQUFPO0FBSzNCLFdBQVMsZUFBZSxlQUFlLEVBQUUsaUJBQWlCLFNBQVMsV0FBVztBQUM5RSxXQUFTLGVBQWUsa0JBQWtCLEVBQUUsaUJBQWlCLFNBQVMsY0FBYztBQUNwRixXQUFTLGVBQWUsa0JBQWtCLEVBQUUsaUJBQWlCLFNBQVMsY0FBYztBQUNwRixXQUFTLGVBQWUsbUJBQW1CLEVBQUUsaUJBQWlCLFNBQVMsY0FBYztBQUdyRixXQUFTLGVBQWUsaUJBQWlCLEVBQUUsaUJBQWlCLFNBQVMsU0FBUztBQUM5RSxXQUFTLGVBQWUsbUJBQW1CLEVBQUUsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQzVFLFFBQUksRUFBRSxPQUFPLE9BQU8sb0JBQXFCLFdBQVM7QUFBQSxFQUNwRCxDQUFDO0FBTUQsUUFBTSxjQUFjLFNBQVMsZUFBZSxrQkFBa0I7QUFDOUQsY0FBWSxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDM0MsVUFBTSxhQUFhLEVBQUUsT0FBTyxNQUFNLFlBQVc7QUFDN0M7RUFDRixDQUFDO0FBRUQsV0FBUyxlQUFlLGtCQUFrQixFQUFFLGlCQUFpQixTQUFTLFlBQVk7QUFDbEYsV0FBUyxlQUFlLGdCQUFnQixFQUFFLGlCQUFpQixTQUFTLE1BQU07QUFDeEUsYUFBUyxlQUFlLGtCQUFrQixFQUFFLE1BQUs7QUFBQSxFQUNuRCxDQUFDO0FBQ0QsV0FBUyxlQUFlLGtCQUFrQixFQUFFLGlCQUFpQixVQUFVLGdCQUFnQjtBQUl2RixRQUFNLGNBQWMsU0FBUyxpQkFBaUIsYUFBYTtBQUMzRCxjQUFZLFFBQVEsU0FBTztBQUN6QixRQUFJLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNuQyxrQkFBWSxRQUFRLE9BQUssRUFBRSxVQUFVLE9BQU8sUUFBUSxDQUFDO0FBQ3JELFFBQUUsT0FBTyxVQUFVLElBQUksUUFBUTtBQUMvQixZQUFNLGNBQWMsRUFBRSxPQUFPLGFBQWEsV0FBVztBQUVyRCxZQUFNLFNBQVMsU0FBUyxlQUFlLHFCQUFxQjtBQUM1RCxVQUFJLE1BQU0sZ0JBQWdCLFlBQVk7QUFDcEMsZUFBTyxNQUFNLFVBQVU7QUFBQSxNQUN6QixPQUFPO0FBQ0wsZUFBTyxNQUFNLFVBQVU7QUFBQSxNQUN6QjtBQUNBO0lBQ0YsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUdELFFBQU0sY0FBYyxTQUFTLGlCQUFpQixhQUFhO0FBRzNELFFBQU0sb0JBQW9CLE1BQU07QUFDOUIsZ0JBQVksUUFBUSxTQUFPO0FBQ3pCLFlBQU0sV0FBVyxJQUFJLGFBQWEsV0FBVztBQUM3QyxVQUFJLFlBQVk7QUFDaEIsVUFBSSxhQUFhLFNBQVUsYUFBWTtBQUN2QyxVQUFJLGFBQWEsV0FBWSxhQUFZO0FBQ3pDLFVBQUksYUFBYSxNQUFPLGFBQVk7QUFFcEMsVUFBSSxRQUFRO0FBRVosVUFBSSxNQUFNLGVBQWUsVUFBVTtBQUNqQyxZQUFJLFVBQVUsSUFBSSxRQUFRO0FBRTFCLGlCQUFTLE1BQU0sa0JBQWtCLFFBQVEsSUFBSSxNQUFNLE9BQU8sS0FBSyxJQUFJLE1BQU0sU0FBUztBQUFBLE1BQ3BGLE9BQU87QUFDTCxZQUFJLFVBQVUsT0FBTyxRQUFRO0FBQUEsTUFDL0I7QUFDQSxVQUFJLFlBQVk7QUFBQSxJQUNsQixDQUFDO0FBQUEsRUFDSDtBQUVBLGNBQVksUUFBUSxTQUFPO0FBQ3pCLFFBQUksaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ25DLFlBQU0sYUFBYSxFQUFFLE9BQU8sYUFBYSxXQUFXO0FBRXBELFVBQUksTUFBTSxlQUFlLFlBQVk7QUFFbkMsY0FBTSxnQkFBZ0IsTUFBTSxrQkFBa0IsUUFBUSxTQUFTO0FBQUEsTUFDakUsT0FBTztBQUtMLFlBQUksZUFBZSxVQUFVO0FBQzNCLGdCQUFNLGdCQUFnQjtBQUFBLFFBQ3hCLE9BQU87QUFDTCxnQkFBTSxnQkFBZ0I7QUFBQSxRQUN4QjtBQUNBLGNBQU0sYUFBYTtBQUFBLE1BQ3JCO0FBRUE7QUFDQTtJQUNGLENBQUM7QUFBQSxFQUNILENBQUM7QUFHRDtBQUdBLFFBQU0sV0FBVyxTQUFTLGVBQWUscUJBQXFCO0FBQzlELFdBQVMsaUJBQWlCLFNBQVMsTUFBTTtBQUN2QyxVQUFNLGdCQUFnQixDQUFDLE1BQU07QUFDN0IsYUFBUyxVQUFVLE9BQU8sUUFBUTtBQUNsQztFQUNGLENBQUM7QUFLRCxXQUFTLGNBQWM7QUFDckIsWUFBUSxVQUFVLE9BQU8sUUFBUTtBQUNqQyxZQUFRLFVBQVUsT0FBTyxXQUFXO0FBQ3BDLFVBQU0sY0FBYztBQUFBLEVBQ3RCO0FBRUEsV0FBUyxjQUFjO0FBQ3JCLFlBQVEsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUNoQztBQUVBLFdBQVMsZUFBZSxHQUFHO0FBQ3pCLFFBQUksRUFBRyxHQUFFO0FBQ1QsVUFBTSxjQUFjLENBQUMsTUFBTTtBQUMzQixRQUFJLE1BQU0sYUFBYTtBQUNyQixjQUFRLFVBQVUsSUFBSSxXQUFXO0FBQUEsSUFDbkMsT0FBTztBQUNMLGNBQVEsVUFBVSxPQUFPLFdBQVc7QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFFQSxXQUFTLFVBQVUsYUFBYSxPQUFPLE1BQU07QUFDM0MsYUFBUyxlQUFlLGlCQUFpQixFQUFFLFlBQVk7QUFDdkQsYUFBUyxlQUFlLGdCQUFnQixFQUFFLFlBQVk7QUFDdEQsYUFBUyxlQUFlLGdCQUFnQixFQUFFLFlBQVk7QUFDdEQsYUFBUyxlQUFlLG1CQUFtQixFQUFFLE1BQU0sVUFBVTtBQUM3RCxxQkFBaUIsU0FBUyxlQUFlLGdCQUFnQixDQUFDO0FBQUEsRUFDNUQ7QUFFQSxXQUFTLFlBQVk7QUFDbkIsYUFBUyxlQUFlLG1CQUFtQixFQUFFLE1BQU0sVUFBVTtBQUFBLEVBQy9EO0FBRUEsV0FBUyxhQUFhLE9BQU8sTUFBTTtBQUNqQyxRQUFJLE9BQU8sa0JBQWtCLGFBQWE7QUFDeEMsWUFBTSxXQUFXLElBQUksS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFLE1BQU0sYUFBWSxDQUFFO0FBQ3pELFlBQU0sV0FBVyxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxNQUFNLFlBQVcsQ0FBRTtBQUN2RCxnQkFBVSxVQUFVLE1BQU07QUFBQSxRQUN4QixJQUFJLGNBQWM7QUFBQSxVQUNoQixjQUFjO0FBQUEsVUFDZCxhQUFhO0FBQUEsUUFDdkIsQ0FBUztBQUFBLE1BQ1QsQ0FBTyxFQUFFLE1BQU0sU0FBTztBQUNkLGdCQUFRLE1BQU0sNENBQTRDLEdBQUc7QUFDN0Qsa0JBQVUsVUFBVSxVQUFVLEtBQUs7QUFBQSxNQUNyQyxDQUFDO0FBQUEsSUFDSCxPQUFPO0FBQ0wsZ0JBQVUsVUFBVSxVQUFVLEtBQUs7QUFBQSxJQUNyQztBQUFBLEVBQ0Y7QUFFQSxXQUFTLGlCQUFpQixXQUFXO0FBQ25DLFVBQU0sV0FBVyxVQUFVLGlCQUFpQixrQkFBa0I7QUFDOUQsYUFBUyxRQUFRLFNBQU87QUFDdEIsVUFBSSxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDbkMsY0FBTSxTQUFTLEVBQUU7QUFDakIsY0FBTSxVQUFVLG1CQUFtQixPQUFPLFFBQVEsUUFBUTtBQUcxRCxjQUFNLE9BQU87QUFBQSxVQUNYLEtBQUssT0FBTyxRQUFRLE1BQU0sbUJBQW1CLE9BQU8sUUFBUSxHQUFHLElBQUk7QUFBQSxVQUNuRSxrQkFBa0IsT0FBTyxRQUFRLG9CQUFvQjtBQUFBLFVBQ3JELGFBQWEsT0FBTyxRQUFRLGVBQWU7QUFBQSxVQUMzQyxPQUFPLE9BQU8sUUFBUSxXQUFXO0FBQUEsVUFDakMsWUFBWSxPQUFPLFFBQVEsY0FBYztBQUFBLFVBQ3pDLFNBQVMsT0FBTyxRQUFRLFdBQVc7QUFBQSxRQUM3QztBQUdRLGNBQU0sV0FBVztBQUFBO0FBQUE7QUFBQSwwREFHaUMsS0FBSyxHQUFHLEtBQUssS0FBSyxHQUFHO0FBQUEsc0JBQ3pELEtBQUssbUJBQW1CLDhCQUE4QixLQUFLLGdCQUFnQixVQUFVLEVBQUU7QUFBQSxzQkFDdkYsS0FBSyxjQUFjLEtBQUssS0FBSyxXQUFXLFNBQVMsRUFBRTtBQUFBO0FBQUE7QUFBQSxxR0FHNEIsS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQUEsOENBQ2hGLEtBQUssT0FBTyxvQ0FBb0MsS0FBSyxVQUFVO0FBQUE7QUFBQTtBQUFBLHNCQUd2RixRQUFRLFFBQVEsT0FBTyxNQUFNLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFNNUMsY0FBTSxZQUFZLGFBQWEsS0FBSyxHQUFHO0FBQUEsWUFBZSxLQUFLLGdCQUFnQixXQUFXLEtBQUssV0FBVztBQUFBO0FBQUEsY0FBdUIsS0FBSyxLQUFLO0FBQUEsU0FBWSxLQUFLLE9BQU8sbUJBQW1CLEtBQUssVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBQW1CLE9BQU87QUFHM04scUJBQWEsV0FBVyxRQUFRO0FBRWhDLGNBQU0sV0FBVyxPQUFPO0FBQ3hCLGVBQU8sWUFBWSxHQUFHLE1BQU0sS0FBSztBQUNqQyxlQUFPLFVBQVUsSUFBSSxTQUFTO0FBQzlCLG1CQUFXLE1BQU07QUFDZixpQkFBTyxZQUFZO0FBQ25CLGlCQUFPLFVBQVUsT0FBTyxTQUFTO0FBQUEsUUFDbkMsR0FBRyxHQUFJO0FBQUEsTUFDVCxDQUFDO0FBQUEsSUFDSCxDQUFDO0FBQUEsRUFDSDtBQUVBLFdBQVMsYUFBYTtBQUNwQixRQUFJLE1BQU0sZ0JBQWdCLFlBQVk7QUFDcEM7SUFDRixXQUFXLE1BQU0sZ0JBQWdCLGFBQWE7QUFDNUM7SUFDRjtBQUFBLEVBQ0Y7QUFFQSxXQUFTLFlBQVksV0FBVztBQUM5QixRQUFJLFNBQVMsQ0FBQyxHQUFHLFNBQVM7QUFDMUIsWUFBUSxJQUFJLDhDQUE4QyxNQUFNLFlBQVksVUFBVSxNQUFNLGFBQWE7QUFJekcsUUFBSSxNQUFNLFlBQVk7QUFDcEIsZUFBUyxPQUFPO0FBQUEsUUFBTyxPQUNyQixFQUFFLElBQUksWUFBVyxFQUFHLFNBQVMsTUFBTSxVQUFVLEtBQzVDLEVBQUUsUUFBUSxFQUFFLEtBQUssS0FBSyxRQUFNLEdBQUcsVUFBVSxHQUFHLE9BQU8sWUFBVyxFQUFHLFNBQVMsTUFBTSxVQUFVLENBQUM7QUFBQSxNQUNwRztBQUFBLElBQ0k7QUFHQSxXQUFPLEtBQUssQ0FBQyxHQUFHLE1BQU07QUFDcEIsVUFBSSxNQUFNO0FBRVYsVUFBSSxNQUFNLGVBQWUsT0FBTztBQUM5QixlQUFPLE9BQU8sRUFBRSxRQUFRLEtBQUs7QUFDN0IsZUFBTyxPQUFPLEVBQUUsUUFBUSxLQUFLO0FBQUEsTUFDL0IsV0FBVyxNQUFNLGVBQWUsWUFBWTtBQUMxQyxlQUFPLE9BQU8sRUFBRSxvQkFBb0IsS0FBSztBQUN6QyxlQUFPLE9BQU8sRUFBRSxvQkFBb0IsS0FBSztBQUFBLE1BQzNDLE9BQU87QUFFTCxlQUFPLElBQUksS0FBSyxFQUFFLGVBQWUsRUFBRSxRQUFPO0FBQzFDLGVBQU8sSUFBSSxLQUFLLEVBQUUsZUFBZSxFQUFFLFFBQU87QUFBQSxNQUM1QztBQUdBLFlBQU0sYUFBYSxPQUFPO0FBRzFCLGFBQU8sTUFBTSxrQkFBa0IsUUFBUSxhQUFhLENBQUM7QUFBQSxJQUN2RCxDQUFDO0FBR0QsUUFBSSxNQUFNLGVBQWU7QUFDdkIsYUFBTyxLQUFLLENBQUMsR0FBRyxNQUFNO0FBQ3BCLGNBQU0sS0FBSyxVQUFVLEVBQUUsR0FBRztBQUMxQixjQUFNLEtBQUssVUFBVSxFQUFFLEdBQUc7QUFDMUIsWUFBSSxLQUFLLEdBQUksUUFBTztBQUNwQixZQUFJLEtBQUssR0FBSSxRQUFPO0FBRXBCLGVBQU87QUFBQSxNQUNULENBQUM7QUFBQSxJQUNIO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLFVBQVUsS0FBSztBQUN0QixRQUFJO0FBQ0YsYUFBTyxJQUFJLElBQUksR0FBRyxFQUFFLFNBQVMsUUFBUSxRQUFRLEVBQUU7QUFBQSxJQUNqRCxRQUFRO0FBQ04sYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBRUEsV0FBUyxpQkFBaUI7QUFDeEIsVUFBTSxlQUFlLFNBQVMsZUFBZSxtQkFBbUI7QUFDaEUsaUJBQWEsVUFBVSxPQUFPLGdCQUFnQjtBQUM5QyxpQkFBYSxZQUFZO0FBRXpCLFVBQU0sb0JBQW9CLFlBQVksTUFBTSxZQUFZO0FBRXhELFFBQUksa0JBQWtCLFdBQVcsR0FBRztBQUNsQyxtQkFBYSxZQUFZO0FBQ3pCO0FBQUEsSUFDRjtBQUVBLFVBQU0sV0FBVyxTQUFTLGVBQWUsZUFBZTtBQUN4RCxRQUFJLE1BQU0sYUFBYSxTQUFTLEdBQUc7QUFDbkIsVUFBSSxLQUFLLE1BQU0sYUFBYSxNQUFNLGFBQWEsU0FBUyxDQUFDLEVBQUUsZUFBZTtBQUMzRSxVQUFJLEtBQUssTUFBTSxhQUFhLENBQUMsRUFBRSxjQUFjO0FBQzFELGVBQVMsY0FBYyxHQUFHLE1BQU0sYUFBYSxNQUFNO0FBQUEsSUFDckQ7QUFJQSxRQUFJLFVBQVUsb0JBQUk7QUFDbEIsUUFBSSxVQUFVLG9CQUFJLEtBQUssQ0FBQztBQUV4QixzQkFBa0IsUUFBUSxPQUFLO0FBQzdCLFVBQUksRUFBRSxrQkFBa0IsUUFBUyxXQUFVLEVBQUU7QUFDN0MsVUFBSSxFQUFFLGlCQUFpQixRQUFTLFdBQVUsRUFBRTtBQUFBLElBQzlDLENBQUM7QUFFRCxVQUFNLFFBQVE7QUFFZCxRQUFJLFVBQVUsVUFBVTtBQUN4QixRQUFJLFVBQVUsTUFBTyxXQUFVO0FBSy9CLFVBQU0sVUFBVSxLQUFLLElBQUksUUFBUSxHQUFHLFVBQVUsR0FBRztBQUdqRCxVQUFNLFlBQVksSUFBSSxLQUFLLFFBQVEsWUFBVyxHQUFJLFFBQVEsWUFBWSxDQUFDO0FBR3ZFLFVBQU0sb0JBQW9CLElBQUksS0FBSyxRQUFRLFlBQVcsR0FBSSxRQUFRLFNBQVEsSUFBSyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRztBQUtwRyxVQUFNLFlBQVksSUFBSSxLQUFLLEtBQUssSUFBSSxRQUFRLFFBQU8sSUFBSyxTQUFTLGtCQUFrQixRQUFPLENBQUUsQ0FBQztBQUM3RixVQUFNLGdCQUFnQixZQUFZO0FBR2xDLFVBQU0sU0FBUyxTQUFTLGNBQWMsS0FBSztBQUMzQyxXQUFPLFlBQVk7QUFDbkIsV0FBTyxZQUFZO0FBQUE7QUFBQTtBQUFBO0FBSW5CLGlCQUFhLFlBQVksTUFBTTtBQUUvQixVQUFNLE9BQU8sT0FBTyxjQUFjLHVCQUF1QjtBQUN6RCxRQUFJLGdCQUFnQjtBQUdwQixVQUFNLGVBQWUsVUFBVyxRQUFRO0FBRXhDLFFBQUksY0FBYztBQUVoQixVQUFJLElBQUksSUFBSSxLQUFLLFNBQVM7QUFDMUIsYUFBTyxLQUFLLFdBQVc7QUFDckIsY0FBTSxPQUFRLElBQUksYUFBYSxnQkFBaUI7QUFDaEQsWUFBSSxPQUFPLEtBQUssT0FBTyxLQUFLO0FBQzFCLGdCQUFNLFNBQVMsU0FBUyxjQUFjLEtBQUs7QUFDM0MsaUJBQU8sWUFBWTtBQUNuQixpQkFBTyxNQUFNLE9BQU8sR0FBRyxHQUFHO0FBQzFCLGlCQUFPLFlBQVksbUNBQW1DLEVBQUUsZUFBZSxXQUFXLEVBQUUsT0FBTyxTQUFTLEtBQUssVUFBUyxDQUFFLENBQUM7QUFDckgsZUFBSyxZQUFZLE1BQU07QUFHdkIsMkJBQWlCLDhDQUE4QyxHQUFHO0FBQUEsUUFDcEU7QUFDQSxVQUFFLFFBQVEsRUFBRSxRQUFPLElBQUssQ0FBQztBQUFBLE1BQzNCO0FBQUEsSUFDRixPQUFPO0FBRUwsVUFBSSxJQUFJLElBQUksS0FBSyxTQUFTO0FBQzFCLFFBQUUsUUFBUSxDQUFDO0FBQ1gsYUFBTyxLQUFLLFdBQVc7QUFDckIsY0FBTSxPQUFRLElBQUksYUFBYSxnQkFBaUI7QUFDaEQsWUFBSSxPQUFPLEtBQUssT0FBTyxLQUFLO0FBQzFCLGdCQUFNLFNBQVMsU0FBUyxjQUFjLEtBQUs7QUFDM0MsaUJBQU8sWUFBWTtBQUNuQixpQkFBTyxNQUFNLE9BQU8sR0FBRyxHQUFHO0FBQzFCLGlCQUFPLFlBQVksbUNBQW1DLEVBQUUsZUFBZSxXQUFXLEVBQUUsT0FBTyxTQUFTLE1BQU0sVUFBUyxDQUFFLENBQUM7QUFDdEgsZUFBSyxZQUFZLE1BQU07QUFHdkIsMkJBQWlCLDhDQUE4QyxHQUFHO0FBQUEsUUFDcEU7QUFDQSxVQUFFLFNBQVMsRUFBRSxTQUFRLElBQUssQ0FBQztBQUFBLE1BQzdCO0FBQUEsSUFDRjtBQUdBLFVBQU0sZ0JBQWdCLFNBQVMsY0FBYyxLQUFLO0FBQ2xELGtCQUFjLFlBQVk7QUFDMUIsa0JBQWMsTUFBTSxXQUFXO0FBRS9CLFVBQU0sWUFBWSxTQUFTLGNBQWMsS0FBSztBQUM5QyxjQUFVLFlBQVk7QUFDdEIsY0FBVSxZQUFZO0FBQUE7QUFBQSx1Q0FFYSxhQUFhO0FBQUE7QUFFaEQsa0JBQWMsWUFBWSxTQUFTO0FBR25DLFFBQUksYUFBYTtBQUVqQixzQkFBa0IsUUFBUSxjQUFZO0FBRXBDLFlBQU0sU0FBUyxVQUFVLFNBQVMsR0FBRztBQUNyQyxVQUFJLE1BQU0saUJBQWlCLFdBQVcsWUFBWTtBQUNoRCxjQUFNLGNBQWMsU0FBUyxjQUFjLEtBQUs7QUFDaEQsb0JBQVksWUFBWTtBQUN4QixvQkFBWSxZQUFZLG1DQUFtQyxNQUFNO0FBQ2pFLHNCQUFjLFlBQVksV0FBVztBQUNyQyxxQkFBYTtBQUFBLE1BQ2Y7QUFFQSxZQUFNLE1BQU0sU0FBUyxjQUFjLEtBQUs7QUFDeEMsVUFBSSxZQUFZO0FBRWhCLFlBQU0sUUFBUyxTQUFTLGtCQUFrQixhQUFhLGdCQUFpQjtBQUN4RSxZQUFNLFFBQVEsS0FBSyxJQUFJLE1BQU8sU0FBUyxpQkFBaUIsU0FBUyxtQkFBbUIsZ0JBQWlCLEdBQUc7QUFDeEcsWUFBTSxRQUFRLGdCQUFnQixTQUFTLFFBQVE7QUFFL0MsVUFBSSxZQUFZO0FBQUE7QUFBQSx1REFFaUMsU0FBUyxHQUFHO0FBQUEsMkJBQ3hDLFNBQVMsR0FBRyxvRUFBb0UsU0FBUyxHQUFHO0FBQUE7QUFBQSw0REFFM0QsU0FBUyxHQUFHO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBSXZELFNBQVMsb0JBQW9CLFdBQVcsU0FBUyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUVBSVAsSUFBSSxhQUFhLEtBQUs7QUFBQTtBQUFBLGlDQUV4RCxJQUFJLGFBQWEsS0FBSyxrQkFBa0IsS0FBSztBQUFBO0FBQUE7QUFBQTtBQU14RSxpQkFBVyxNQUFNO0FBQ2YsY0FBTSxNQUFNLElBQUksY0FBYyxzQkFBc0I7QUFDcEQsWUFBSSxLQUFLO0FBQ1AsY0FBSSxpQkFBaUIsY0FBYyxNQUFNO0FBQ3ZDLGtCQUFNLFlBQVksSUFBSSxLQUFLLFNBQVMsZUFBZSxFQUFFO0FBQ3JELGtCQUFNLFVBQVUsSUFBSSxLQUFLLFNBQVMsY0FBYyxFQUFFO0FBRWxELG9CQUFRLFlBQVk7QUFBQTtBQUFBLG1EQUVtQixTQUFTLE1BQU0sT0FBTztBQUFBO0FBQUE7QUFHN0Qsb0JBQVEsTUFBTSxVQUFVO0FBRXhCLGtCQUFNLFVBQVUsUUFBUSxjQUFjLHNCQUFzQjtBQUM1RCxnQkFBSSxTQUFTO0FBQ1gsc0JBQVEsVUFBVSxDQUFDLE1BQU07QUFDdkIsa0JBQUUsZ0JBQWU7QUFDakIsb0NBQW9CLFFBQVE7QUFDNUIsd0JBQVEsTUFBTSxVQUFVO0FBQUEsY0FDMUI7QUFBQSxZQUNGO0FBQUEsVUFDRixDQUFDO0FBRUQsY0FBSSxpQkFBaUIsYUFBYSxDQUFDLE1BQU07QUFDdkMsa0JBQU0sSUFBSSxFQUFFLFVBQVU7QUFDdEIsa0JBQU0sSUFBSSxFQUFFLFVBQVU7QUFDdEIsb0JBQVEsTUFBTSxPQUFPLElBQUk7QUFDekIsb0JBQVEsTUFBTSxNQUFNLElBQUk7QUFBQSxVQUMxQixDQUFDO0FBRUQsY0FBSSxpQkFBaUIsY0FBYyxNQUFNO0FBQ3ZDLG9CQUFRLE1BQU0sVUFBVTtBQUFBLFVBQzFCLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRixHQUFHLENBQUM7QUFFSixVQUFJLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNuQyxZQUFJLEVBQUUsT0FBTyxRQUFRLEdBQUcsRUFBRztBQUMzQiw0QkFBb0IsUUFBUTtBQUFBLE1BQzlCLENBQUM7QUFFRCxvQkFBYyxZQUFZLEdBQUc7QUFBQSxJQUMvQixDQUFDO0FBRUQsaUJBQWEsWUFBWSxhQUFhO0FBQUEsRUFDeEM7QUFFQSxXQUFTLGlCQUFpQjtBQXJvQjVCLFFBQUFBLEtBQUE7QUFzb0JJLFVBQU0sZUFBZSxTQUFTLGVBQWUsbUJBQW1CO0FBQ2hFLGlCQUFhLFVBQVUsSUFBSSxnQkFBZ0I7QUFDM0MsVUFBTSxXQUFXLFNBQVMsZUFBZSxlQUFlO0FBQ3hELGFBQVMsY0FBYyxpQkFBaUIsTUFBTSxhQUFhLE1BQU07QUFFakUsUUFBSSxDQUFDLE1BQU0sZ0JBQWdCLE1BQU0sYUFBYSxXQUFXLEdBQUc7QUFDMUQsbUJBQWEsWUFBWTtBQUN6QjtBQUFBLElBQ0Y7QUFFQSxRQUFJLFNBQVM7QUFDYixVQUFNLG9CQUFvQixZQUFZLE1BQU0sWUFBWTtBQUV4RCxzQkFBa0IsUUFBUSxjQUFZO0FBQ3BDLFlBQU0sYUFBYSxDQUFDLFlBQVksSUFBSSxLQUFLLE9BQU8sRUFBRTtBQUNsRCxZQUFNLFFBQVEsZ0JBQWdCLFNBQVMsUUFBUTtBQUUvQyxnQkFBVTtBQUFBLDRGQUM0RSxLQUFLO0FBQUE7QUFBQSxzQkFFM0UsU0FBUyxHQUFHO0FBQUE7QUFBQTtBQUFBLGNBR3BCLFdBQVcsU0FBUyxlQUFlLENBQUMsTUFBTSxXQUFXLFNBQVMsY0FBYyxDQUFDO0FBQUEsY0FDN0UsU0FBUyxvQkFBb0I7QUFBQSxjQUM3QixTQUFTLFFBQVE7QUFBQTtBQUFBO0FBQUEsWUFHbkIsU0FBUyxRQUFRLFNBQVMsS0FBSyxTQUFTLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFJeEMsU0FBUyxLQUFLLElBQUksUUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdFQUlnQyxHQUFHLFNBQVM7QUFBQTtBQUFBO0FBQUEsd0JBRzVELEdBQUcsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLDhDQUlVLElBQUksS0FBSyxHQUFHLFlBQVksRUFBRSxtQkFBa0IsQ0FBRSxNQUFNLElBQUksS0FBSyxHQUFHLE9BQU8sRUFBRSxtQkFBa0IsQ0FBRTtBQUFBLGlEQUMxRixHQUFHLFFBQVE7QUFBQTtBQUFBO0FBQUEsdUJBR3JDLEdBQUcsY0FBYyxVQUM1QixnREFBZ0QsR0FBRyxRQUFRLHlGQUMxRCxHQUFHLGNBQWMsVUFBVSw4Q0FBOEMsR0FBRyxRQUFRLHdFQUF3RSxFQUN6SztBQUFBO0FBQUEsc0JBRXNCLEdBQUcsVUFBVSxXQUFXO0FBQUE7QUFBQTtBQUFBLGVBRy9CLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFBQTtBQUFBO0FBQUEsY0FHWCxpRUFBaUU7QUFBQTtBQUFBO0FBQUEsSUFHM0UsQ0FBQztBQUVELGlCQUFhLFlBQVk7QUFBQTtBQUFBLFVBRW5CLE1BQU0sV0FBVztBQUFBO0FBQUEsWUFFZixNQUFNLEVBQUU7QUFBQSxxQkFDQyxFQUNyQjtBQUFBO0FBQUEsUUFFUSxNQUFNLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDJGQUt5RSxNQUFNLEVBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdDQUszRCxNQUFNO0FBQUE7QUFJMUMsVUFBTSxXQUFXLGFBQWEsY0FBYyxtQkFBbUI7QUFDL0QsVUFBTSxZQUFZLGFBQWEsY0FBYyxvQkFBb0I7QUFDakUsVUFBTSxjQUFjLGFBQWEsY0FBYyxxQkFBcUI7QUFFcEUsUUFBSSxVQUFVO0FBQ1osZUFBUyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3ZDLGNBQU0sV0FBVyxVQUFVLE1BQU0sWUFBWTtBQUM3QyxrQkFBVSxNQUFNLFVBQVUsV0FBVyxVQUFVO0FBQy9DLG9CQUFZLGNBQWMsV0FBVyxNQUFNO0FBQUEsTUFDN0MsQ0FBQztBQUFBLElBQ0g7QUFHQSxVQUFNLFlBQVksU0FBUyxlQUFlLGVBQWU7QUFDekQsUUFBSSxNQUFNLGtCQUFrQjtBQUMxQixZQUFNLGFBQWEsVUFBVSxjQUFjLG9CQUFvQjtBQUMvRCxpQkFBVyxZQUFZLE1BQU07QUFDN0IsZ0JBQVUsTUFBTSxVQUFVO0FBQUEsSUFDNUI7QUFFQSxRQUFJLE1BQU0sVUFBVTtBQUNsQixPQUFBQSxNQUFBLFNBQVMsZUFBZSxpQkFBaUIsTUFBekMsZ0JBQUFBLElBQTRDLGlCQUFpQixTQUFTO0FBQUEsSUFDeEU7QUFFQSxtQkFBUyxlQUFlLHFCQUFxQixNQUE3QyxtQkFBZ0QsaUJBQWlCLFNBQVMsTUFBTTtBQUM5RSxZQUFNLFlBQVksU0FBUyxjQUFjLHFCQUFxQjtBQUM5RCxVQUFJLENBQUMsVUFBVztBQUdoQixZQUFNLFFBQVEsVUFBVSxpQkFBaUIsWUFBWTtBQUNyRCxZQUFNLG1CQUFtQixDQUFBO0FBQ3pCLFlBQU0sUUFBUSxRQUFNO0FBQ2xCLHlCQUFpQixLQUFLLEdBQUcsTUFBTSxPQUFPO0FBQ3RDLFdBQUcsTUFBTSxVQUFVO0FBQUEsTUFDckIsQ0FBQztBQUdELFlBQU0sWUFBWSxPQUFPO0FBQ3pCLFlBQU0sUUFBUSxTQUFTO0FBQ3ZCLFlBQU0sbUJBQW1CLFNBQVM7QUFDbEMsZ0JBQVUsZ0JBQWU7QUFDekIsZ0JBQVUsU0FBUyxLQUFLO0FBR3hCLFVBQUk7QUFDRixpQkFBUyxZQUFZLE1BQU07QUFFM0IsY0FBTSxNQUFNLFNBQVMsZUFBZSxxQkFBcUI7QUFDekQsY0FBTSxlQUFlLElBQUk7QUFDekIsWUFBSSxZQUFZLEdBQUcsTUFBTSxLQUFLO0FBQzlCLG1CQUFXLE1BQU07QUFDZixjQUFJLFlBQVk7QUFBQSxRQUNsQixHQUFHLEdBQUk7QUFBQSxNQUNULFNBQVMsS0FBSztBQUNaLGdCQUFRLE1BQU0sZ0JBQWdCLEdBQUc7QUFDakMsY0FBTSxhQUFhO0FBQUEsTUFDckI7QUFHQSxnQkFBVSxnQkFBZTtBQUN6QixZQUFNLFFBQVEsQ0FBQyxJQUFJLE1BQU07QUFDdkIsV0FBRyxNQUFNLFVBQVUsaUJBQWlCLENBQUM7QUFBQSxNQUN2QyxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFFQSxXQUFTLG9CQUFvQixVQUFVO0FBQ3JDLFFBQUksQ0FBQyxTQUFTLFFBQVEsU0FBUyxLQUFLLFdBQVcsRUFBRztBQUVsRCxRQUFJLFVBQVU7QUFFZCxhQUFTLEtBQUssUUFBUSxDQUFDLElBQUksVUFBVTtBQUNuQyxZQUFNLGFBQWEsQ0FBQyxZQUFZLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDbEQsaUJBQVc7QUFBQTtBQUFBO0FBQUE7QUFBQSxzREFJcUMsUUFBUSxDQUFDO0FBQUE7QUFBQTtBQUFBLHlFQUdVLEdBQUcsU0FBUyxvREFBb0QsR0FBRyxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3REFLN0YsR0FBRyxRQUFRO0FBQUEsb0RBQ2YsV0FBVyxHQUFHLFlBQVksQ0FBQyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFJeEYsR0FBRyxjQUFjLFVBQ3hCLDZGQUE2RixHQUFHLFFBQVEscUlBQ3ZHLEdBQUcsY0FBYyxVQUFVLDJGQUEyRixHQUFHLFFBQVEsb0hBQW9ILEVBQ2xRO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0NBSXNDLG1CQUFtQixHQUFHLFVBQVUsRUFBRSxDQUFDO0FBQUEsZ0NBQ3pDLG1CQUFtQixTQUFTLEdBQUcsQ0FBQztBQUFBLDhDQUNsQixTQUFTLG9CQUFvQjtBQUFBLHlDQUNsQyxTQUFTLFFBQVE7QUFBQSxzQ0FDcEIsR0FBRyxTQUFTO0FBQUEsd0NBQ1YsR0FBRyxRQUFRO0FBQUEscUNBQ2QsV0FBVyxHQUFHLFlBQVksQ0FBQyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUM7QUFBQTtBQUFBLHNCQUV0RSxNQUFNLElBQUk7QUFBQTtBQUFBO0FBQUEsOENBR2MsR0FBRyxVQUFVLHFCQUFxQjtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSTVFLENBQUM7QUFFRCxlQUFXO0FBQ1gsY0FBVSxTQUFTLEdBQUcsU0FBUyxHQUFHLEtBQUssR0FBRyxTQUFTLFFBQVEsZ0JBQWdCLFNBQVMsb0JBQW9CLGNBQWM7QUFBQSxFQUN4SDtBQUlBLFdBQVMsZUFBZTtBQW4xQjFCLFFBQUFBO0FBcTFCSSxVQUFNLGdCQUFjQSxNQUFBLE1BQU0sYUFBTixnQkFBQUEsSUFBZ0IsbUJBQWtCLG1CQUNuRCxZQUFXLEVBQ1gsUUFBUSxlQUFlLEdBQUcsRUFDMUIsUUFBUSxZQUFZLEVBQUU7QUFFekIsVUFBTSxRQUFRLE1BQU0sYUFBYTtBQUdqQyxRQUFJLFVBQVUsb0JBQUk7QUFDbEIsUUFBSSxVQUFVLG9CQUFJLEtBQUssQ0FBQztBQUV4QixVQUFNLGFBQWEsUUFBUSxPQUFLO0FBQzlCLFVBQUksRUFBRSxrQkFBa0IsUUFBUyxXQUFVLEVBQUU7QUFDN0MsVUFBSSxFQUFFLGlCQUFpQixRQUFTLFdBQVUsRUFBRTtBQUFBLElBQzlDLENBQUM7QUFHRCxVQUFNLGFBQWEsQ0FBQyxNQUFNO0FBQ3hCLFlBQU0sSUFBSSxDQUFDLE9BQU8sT0FBTyxPQUFPLE9BQU8sT0FBTyxPQUFPLE9BQU8sT0FBTyxPQUFPLE9BQU8sT0FBTyxLQUFLO0FBQzdGLGFBQU8sR0FBRyxFQUFFLEVBQUUsU0FBUSxDQUFFLENBQUMsS0FBSyxFQUFFLFFBQU8sQ0FBRSxLQUFLLEVBQUUsWUFBVyxDQUFFO0FBQUEsSUFDL0Q7QUFFQSxVQUFNLFdBQVcsV0FBVyxPQUFPO0FBQ25DLFVBQU0sU0FBUyxXQUFXLE9BQU87QUFHakMsVUFBTSxXQUFXLEdBQUcsVUFBVSxnQkFBZ0IsS0FBSyx3QkFBd0IsUUFBUSxVQUFVLE1BQU07QUFFbkcsVUFBTSxVQUFVLGtDQUFrQyxtQkFBbUIsS0FBSyxVQUFVO0FBQUEsTUFDbEYsV0FBVyxNQUFNO0FBQUEsTUFDakIsUUFBUSxNQUFNO0FBQUEsTUFDZCxVQUFVLE1BQU0sWUFBWSxFQUFFLGdCQUFnQixXQUFVO0FBQUE7QUFBQSxNQUN4RCxrQkFBa0IsTUFBTSxvQkFBb0I7QUFBQSxJQUNsRCxHQUFPLE1BQU0sQ0FBQyxDQUFDO0FBRVgsVUFBTSxxQkFBcUIsU0FBUyxjQUFjLEdBQUc7QUFDckQsdUJBQW1CLGFBQWEsUUFBUSxPQUFPO0FBQy9DLHVCQUFtQixhQUFhLFlBQVksUUFBUTtBQUNwRCxhQUFTLEtBQUssWUFBWSxrQkFBa0I7QUFDNUMsdUJBQW1CLE1BQUs7QUFDeEIsdUJBQW1CLE9BQU07QUFBQSxFQUMzQjtBQUVBLFdBQVMsaUJBQWlCLE9BQU87QUFDL0IsVUFBTSxPQUFPLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFDakMsUUFBSSxDQUFDLEtBQU07QUFFWCxVQUFNLFNBQVMsSUFBSTtBQUNuQixXQUFPLFNBQVMsQ0FBQyxNQUFNO0FBQ3JCLFVBQUk7QUFDRixjQUFNLE9BQU8sS0FBSyxNQUFNLEVBQUUsT0FBTyxNQUFNO0FBQ3ZDLFlBQUksQ0FBQyxLQUFLLFVBQVcsT0FBTSxJQUFJLE1BQU0sZ0JBQWdCO0FBQ3JELHlCQUFpQixJQUFJO0FBQUEsTUFDdkIsU0FBUyxLQUFLO0FBQ1osY0FBTSwyQkFBMkIsSUFBSSxPQUFPO0FBQUEsTUFDOUM7QUFBQSxJQUNGO0FBQ0EsV0FBTyxXQUFXLElBQUk7QUFBQSxFQUN4QjtBQUVBLFdBQVMsaUJBQWlCLGNBQWM7QUFDdEMsVUFBTSxlQUFlLGFBQWEsYUFBYSxDQUFBO0FBQy9DLFVBQU0sU0FBUyxhQUFhLFVBQVUsQ0FBQTtBQUN0QyxVQUFNLFdBQVcsYUFBYSxZQUFZO0FBQzFDLFVBQU0sYUFBYSxDQUFDLENBQUMsYUFBYTtBQUNsQyxVQUFNLG1CQUFtQixhQUFhLG9CQUFvQjtBQUcxRCxVQUFNLGNBQWMsU0FBUyxlQUFlLGtCQUFrQjtBQUM5RCxRQUFJLE1BQU0sWUFBWTtBQUNwQixrQkFBWSxNQUFNLFVBQVU7QUFBQSxJQUM5QixPQUFPO0FBQ0wsa0JBQVksTUFBTSxVQUFVO0FBQUEsSUFDOUI7QUFHQSxVQUFNLGFBQWEsUUFBUSxPQUFLO0FBQzlCLFFBQUUsa0JBQWtCLElBQUksS0FBSyxFQUFFLGVBQWU7QUFDOUMsUUFBRSxpQkFBaUIsSUFBSSxLQUFLLEVBQUUsY0FBYztBQUM1QyxVQUFJLEVBQUUsTUFBTTtBQUNWLFVBQUUsS0FBSyxRQUFRLFFBQU07QUFFbkIsYUFBRyxlQUFlLElBQUksS0FBSyxHQUFHLFlBQVk7QUFDMUMsYUFBRyxVQUFVLElBQUksS0FBSyxHQUFHLE9BQU87QUFBQSxRQUNsQyxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUdELFVBQU0sYUFBYSxLQUFLLENBQUMsR0FBRyxNQUFNLElBQUksS0FBSyxFQUFFLGVBQWUsSUFBSSxJQUFJLEtBQUssRUFBRSxlQUFlLENBQUM7QUFJM0Y7QUFDQTtFQUNGO0FBSUEsaUJBQWUsZ0JBQWdCO0FBQzdCLFVBQU0sTUFBTSxTQUFTLGVBQWUsaUJBQWlCO0FBQ3JELFVBQU0sWUFBWSxTQUFTLGVBQWUsZUFBZTtBQUd6RCxRQUFJLENBQUMsTUFBTSxVQUFVO0FBQ25CLFlBQU0sMkRBQTJEO0FBQ2pFO0FBQUEsSUFDRjtBQUVBLFFBQUksV0FBVztBQUNmLFFBQUksWUFBWSxHQUFHLE1BQU0sRUFBRTtBQUMzQixjQUFVLE1BQU0sVUFBVTtBQUcxQixRQUFJLG9CQUFvQixDQUFBO0FBR3hCLFVBQU0sV0FBVyxDQUFDLE1BQU07QUFDdEIsVUFBSTtBQUFFLGVBQU8sSUFBSSxLQUFLLENBQUMsRUFBRSxtQkFBa0I7QUFBQSxNQUFJLFNBQVMsR0FBRztBQUFFLGVBQU87QUFBQSxNQUFPO0FBQUEsSUFDN0U7QUFFQSxVQUFNLGFBQWEsUUFBUSxDQUFDLE1BQU07QUFDaEMsVUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssV0FBVyxFQUFHO0FBRXBDLFVBQUksY0FBYztBQUNsQixVQUFJLGdCQUFnQixhQUFhLEVBQUUsR0FBRztBQUFBO0FBQ3RDLHVCQUFpQix1QkFBdUIsRUFBRSxvQkFBb0Isc0JBQXNCLEVBQUUsUUFBUSxjQUFjLFNBQVMsRUFBRSxlQUFlLENBQUMsT0FBTyxTQUFTLEVBQUUsY0FBYyxDQUFDO0FBQUE7QUFDeEssdUJBQWlCO0FBQUE7QUFFakIsUUFBRSxLQUFLLFFBQVEsQ0FBQyxJQUFJLFVBQVU7QUFHNUIsWUFBSSxDQUFDLEdBQUcsVUFBVSxHQUFHLE9BQU8sU0FBUyxFQUFHO0FBRXhDLHNCQUFjO0FBQ2QseUJBQWlCLFVBQVUsUUFBUSxDQUFDLFlBQVksR0FBRyxTQUFTLGdCQUFnQixHQUFHLFFBQVEsa0JBQWtCLFNBQVMsR0FBRyxZQUFZLENBQUMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDO0FBQUE7QUFFNUoseUJBQWlCLFdBQVcsR0FBRyxPQUFPLFFBQVEsWUFBWSxJQUFJLEVBQUUsS0FBSSxDQUFFO0FBQUE7QUFBQTtBQUFBLE1BQ3hFLENBQUM7QUFFRCx1QkFBaUI7QUFBQTtBQUVqQixVQUFJLGFBQWE7QUFDZiwwQkFBa0IsS0FBSyxhQUFhO0FBQUEsTUFDdEM7QUFBQSxJQUNGLENBQUM7QUFFRCxRQUFJLGtCQUFrQixXQUFXLEdBQUc7QUFDbEMsWUFBTSx1Q0FBdUM7QUFDN0MsVUFBSSxXQUFXO0FBQ2YsVUFBSSxZQUFZLEdBQUcsTUFBTSxFQUFFO0FBQzNCO0FBQUEsSUFDRjtBQUdBLFFBQUksY0FBYyxrQkFBa0IsS0FBSyxJQUFJO0FBQzdDLFFBQUksWUFBWSxTQUFTLEtBQU87QUFDOUIsb0JBQWMsWUFBWSxVQUFVLEdBQUcsR0FBSyxJQUFJO0FBQUEsSUFDbEQ7QUFFQSxVQUFNLGVBQWUsTUFBTSxTQUFTLGdCQUFnQjtBQUNwRCxVQUFNLGNBQWMseURBQXlEO0FBRzdFLFVBQU0saUJBQWlCLENBQUMsTUFBTTtBQUM1QixZQUFNLFdBQVcsRUFBRTtBQUNuQixlQUFTLG9CQUFvQix3QkFBd0IsY0FBYztBQUduRSxZQUFNLG1CQUFtQixTQUFTLGVBQWUsZUFBZTtBQUNoRSxZQUFNLGFBQWEsU0FBUyxlQUFlLGlCQUFpQjtBQUU1RCxVQUFJLFlBQVksU0FBUyxTQUFTO0FBR2hDLGNBQU0sWUFBWSxTQUFTLFNBQVMsUUFBUSxPQUFPLE1BQU0sRUFBRSxRQUFRLGtCQUFrQixxQkFBcUI7QUFDMUcsY0FBTSxtQkFBbUI7QUFFekIsWUFBSSxrQkFBa0I7QUFDcEIsZ0JBQU0sYUFBYSxpQkFBaUIsY0FBYyxvQkFBb0I7QUFDdEUsY0FBSSxZQUFZO0FBQ2QsdUJBQVcsWUFBWTtBQUFBLFVBQ3pCLE9BQU87QUFFTCw2QkFBaUIsWUFBWSxXQUFXLE1BQU0sRUFBRSxrQ0FBa0MsU0FBUztBQUFBLFVBQzdGO0FBQ0EsMkJBQWlCLE1BQU0sVUFBVTtBQUFBLFFBQ25DO0FBQUEsTUFDRixPQUFPO0FBQ0wsY0FBTSxXQUFXLFdBQVksU0FBUyxTQUFTLGtCQUFtQjtBQUNsRSxnQkFBUSxNQUFNLHVCQUF1QixRQUFRO0FBQzdDLGNBQU0sc0JBQXNCLFFBQVE7QUFBQSxNQUN0QztBQUVBLFVBQUksWUFBWTtBQUNkLG1CQUFXLFdBQVc7QUFDdEIsbUJBQVcsWUFBWSxHQUFHLE1BQU0sRUFBRTtBQUFBLE1BQ3BDO0FBQUEsSUFDRjtBQUdBLGFBQVMsaUJBQWlCLHdCQUF3QixjQUFjO0FBR2hFLFlBQVEsSUFBSSxxREFBcUQ7QUFDakUsYUFBUyxjQUFjLElBQUksWUFBWSx1QkFBdUI7QUFBQSxNQUM1RCxRQUFRO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxNQUNSO0FBQUEsSUFDQSxDQUFLLENBQUM7QUFHRixlQUFXLE1BQU07QUFFZixZQUFNLGFBQWEsU0FBUyxlQUFlLGlCQUFpQjtBQUM1RCxVQUFJLGNBQWMsV0FBVyxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsR0FBRztBQUNuRixpQkFBUyxvQkFBb0Isd0JBQXdCLGNBQWM7QUFDbkUsbUJBQVcsV0FBVztBQUN0QixtQkFBVyxZQUFZLEdBQUcsTUFBTSxFQUFFO0FBQ2xDLGdCQUFRLEtBQUssMENBQTBDO0FBQUEsTUFDekQ7QUFBQSxJQUNGLEdBQUcsR0FBSztBQUFBLEVBQ1Y7QUFNQSxXQUFTLGlCQUFpQixtQkFBbUIsQ0FBQyxVQUFVO0FBQ3RELFlBQVEsSUFBSSw0REFBNEQ7QUFDeEUscUJBQWlCLE1BQU0sTUFBTTtBQUFBLEVBQy9CLENBQUM7QUFHRCxXQUFTLGlCQUFpQixlQUFlLE1BQU07QUFDN0MsWUFBUSxJQUFJLHVDQUF1QztBQUNuRDtFQUNGLENBQUM7QUFHRCxXQUFTLGlCQUFpQixlQUFlLENBQUMsVUFBVTtBQUNsRCxZQUFRLElBQUksd0NBQXdDO0FBQ3BELFVBQU0sV0FBVyxNQUFNO0FBQ3ZCO0VBQ0YsQ0FBQztBQUdELFdBQVMsaUJBQWlCLGVBQWUsQ0FBQyxVQUFVO0FBQ2xELFVBQU0sRUFBRSxXQUFXLFVBQVUsUUFBTyxJQUFLLE1BQU07QUFHL0MsUUFBSSxXQUFXO0FBQ2IsY0FBUSxVQUFVLE9BQU8sUUFBUTtBQUNqQyxjQUFRLFVBQVUsSUFBSSxXQUFXO0FBQ2pDLFlBQU0sY0FBYztBQUFBLElBQ3RCO0FBRUEsVUFBTSxTQUFTLFNBQVMsZUFBZSxtQkFBbUI7QUFDMUQsVUFBTSxPQUFPLE9BQU8sY0FBYyxtQkFBbUI7QUFDckQsVUFBTSxPQUFPLE9BQU8sY0FBYyxtQkFBbUI7QUFDckQsVUFBTSxNQUFNLFNBQVMsZUFBZSxrQkFBa0I7QUFFdEQsUUFBSSxXQUFXO0FBQ2IsV0FBSyxZQUFZLHFDQUFxQyxNQUFNLE9BQU87QUFDbkUsV0FBSyxjQUFjO0FBRW5CLFVBQUksTUFBTSxVQUFVO0FBR3BCLFVBQUksQ0FBQyxTQUFTLGVBQWUsdUJBQXVCLEdBQUc7QUFDckQsY0FBTSxRQUFRLFNBQVMsY0FBYyxPQUFPO0FBQzVDLGNBQU0sS0FBSztBQUNYLGNBQU0sY0FBYztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS3BCLGlCQUFTLEtBQUssWUFBWSxLQUFLO0FBQUEsTUFDakM7QUFBQSxJQUNGLE9BQU87QUFFTCxXQUFLLFlBQVksYUFBYSxPQUFPO0FBQ3JDLFdBQUssY0FBYztBQUNuQixhQUFPLE1BQU0sYUFBYTtBQUMxQixVQUFJLE1BQU0sVUFBVTtBQUFBLElBQ3RCO0FBQUEsRUFDRixDQUFDO0FBR0QsU0FBTyxxQkFBcUI7QUFHNUIsUUFBTSxrQkFBa0IsU0FBUyxlQUFlLG1CQUFtQjtBQUNuRSxNQUFJLGlCQUFpQjtBQUNuQixRQUFJO0FBQ0YsWUFBTSxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsV0FBVztBQUNuRCxjQUFRLElBQUkseURBQXlEO0FBQ3JFLHVCQUFpQixJQUFJO0FBRXJCLHNCQUFnQixPQUFNO0FBQUEsSUFDeEIsU0FBUyxHQUFHO0FBQ1YsY0FBUSxNQUFNLHdEQUF3RCxDQUFDO0FBQUEsSUFDekU7QUFBQSxFQUNGO0FBRUYsR0FBQzsifQ==

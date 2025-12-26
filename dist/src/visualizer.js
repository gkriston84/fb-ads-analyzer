(function() {
  var _a;
  console.log("[FB Ads Analyzer] Visualizer script loaded");
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
            <div class="fb-ads-control-row" style="display: flex; justify-content: space-between; width: 100%; align-items: center; flex-wrap: wrap; gap: 12px;">
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
      let label = btn.innerText.replace(/ [↑↓]/, "");
      if (state.filterSort === sortType) {
        btn.classList.add("active");
        label += state.sortDirection === "asc" ? " ↑" : " ↓";
      } else {
        btn.classList.remove("active");
      }
      btn.innerText = label;
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
        target.innerHTML = "✅ Copied!";
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
          🤖 Analyze with AI
        </button>` : ""}
    <button id="fbAdsCopyAllTextBtn" class="fb-ads-btn fb-ads-btn-action">
      📋 Copy All Text
    </button>
      </div>
       <div id="fbAdsAIResult" style="display: none; margin-bottom: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; overflow: hidden;">
          <div class="fb-ads-ai-header" style="padding: 12px 16px; background: #dcfce7; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #bbf7d0;">
            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;">🤖 AI Analysis</div>
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
        const originalText = btn.textContent;
        btn.textContent = "✅ Copied!";
        setTimeout(() => {
          btn.textContent = originalText;
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
                    📋 Copy
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
    if (!state.aiConfig || !state.aiConfig.apiKey) {
      alert("AI Configuration missing. Please check database settings.");
      return;
    }
    btn.disabled = true;
    btn.textContent = "🤖 Analyzing...";
    resultDiv.style.display = "none";
    let allAdTexts = [];
    state.rawCampaigns.forEach((c) => {
      if (c.top5) {
        c.top5.forEach((ad) => {
          if (ad.adText && ad.adText.length > 10) {
            allAdTexts.push(ad.adText);
          }
        });
      }
    });
    allAdTexts = [...new Set(allAdTexts)].slice(0, 50);
    if (allAdTexts.length === 0) {
      alert("No ad text content found to analyze.");
      btn.disabled = false;
      btn.textContent = "🤖 Analyze with AI";
      return;
    }
    const systemPrompt = state.aiConfig.systemPrompt || "You are an expert marketing analyst. Analyze these Facebook ad copies and identify common hooks, pain points addressed, and CTAs used. Provide a concise bulleted summary of the strategy.";
    const userContent = "Analyze the following ad copies:\n\n" + allAdTexts.join("\n\n---\n\n");
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
            currentResultDiv.innerHTML = `<strong>🤖 AI Analysis:</strong> <br><br>${formatted}`;
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
        currentBtn.textContent = "🤖 Analyze with AI";
      }
    };
    document.addEventListener("fbAdsAnalyzeResponse", handleResponse);
    console.log("[FB Ads Visualizer] Dispatching AI analysis request");
    document.dispatchEvent(new CustomEvent("fbAdsAnalyzeRequest", {
      detail: {
        apiKey: state.aiConfig.apiKey,
        systemPrompt,
        userContent
      }
    }));
    setTimeout(() => {
      const currentBtn = document.getElementById("fbAdsAnalyzeBtn");
      if (currentBtn && currentBtn.disabled && currentBtn.textContent === "🤖 Analyzing...") {
        document.removeEventListener("fbAdsAnalyzeResponse", handleResponse);
        currentBtn.disabled = false;
        currentBtn.textContent = "🤖 Analyze with AI";
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
      icon.innerHTML = '<span class="fb-ads-mini-spinner">🔄</span>';
      text.textContent = message;
      btn.style.display = "none";
      if (!document.getElementById("fbAdsMiniSpinnerStyle")) {
        const style = document.createElement("style");
        style.id = "fbAdsMiniSpinnerStyle";
        style.textContent = `
      @keyframes fbAdsSpin {100 % { transform: rotate(360deg); }}
      .fb-ads-mini-spinner {display: inline-block; animation: fbAdsSpin 1s linear infinite; }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXplci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Zpc3VhbGl6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogRmFjZWJvb2sgQWRzIEFuYWx5emVyIC0gVmlzdWFsaXplciBTY3JpcHQgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgY29uc29sZS5sb2coJ1tGQiBBZHMgQW5hbHl6ZXJdIFZpc3VhbGl6ZXIgc2NyaXB0IGxvYWRlZCcpO1xyXG5cclxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50XHJcbiAgY29uc3Qgc3RhdGUgPSB7XHJcbiAgICByYXdDYW1wYWlnbnM6IFtdLFxyXG4gICAgcHJvY2Vzc2VkQ2FtcGFpZ25zOiBbXSxcclxuICAgIGFsbEFkczogW10sXHJcbiAgICBmaWx0ZXJEb21haW46ICdhbGwnLFxyXG4gICAgZmlsdGVyVGV4dDogJycsXHJcbiAgICBmaWx0ZXJTb3J0OiAncmVjZW50JywgLy8gJ3JlY2VudCcsICdkdXJhdGlvbicsICdhZHMnXHJcbiAgICBncm91cEJ5RG9tYWluOiBmYWxzZSxcclxuICAgIGlzTWluaW1pemVkOiB0cnVlLFxyXG4gICAgY3VycmVudFZpZXc6ICd0aW1lbGluZScsIC8vICd0aW1lbGluZScsICd0b3A1LXRleHQnLCAnYWxsLWNvcHknXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBhaUNvbmZpZzogbnVsbCxcclxuICAgIGlzQW5hbHl6aW5nOiBmYWxzZSxcclxuICAgIGFpQ29uZmlnOiBudWxsLFxyXG4gICAgbWV0YWRhdGE6IG51bGwsXHJcbiAgICBzb3J0RGlyZWN0aW9uOiAnYXNjJywgLy8gJ2FzYycgb3IgJ2Rlc2MnXHJcbiAgICBpc0ltcG9ydGVkOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIC8vIENvbG9yIEhlbHBlclxyXG4gIGZ1bmN0aW9uIGdldEFkQ291bnRDb2xvcihjb3VudCkge1xyXG4gICAgaWYgKGNvdW50ID49IDEwMCkgcmV0dXJuICcjZWY0NDQ0JzsgLy8gUmVkXHJcbiAgICBpZiAoY291bnQgPj0gNTApIHJldHVybiAnI2Y5NzMxNic7ICAvLyBPcmFuZ2VcclxuICAgIGlmIChjb3VudCA+PSAyMCkgcmV0dXJuICcjZWFiMzA4JzsgIC8vIFllbGxvd1xyXG4gICAgaWYgKGNvdW50ID49IDEwKSByZXR1cm4gJyMyMmM1NWUnOyAgLy8gR3JlZW5cclxuICAgIGlmIChjb3VudCA+PSA1KSByZXR1cm4gJyMzYjgyZjYnOyAgIC8vIEJsdWVcclxuICAgIHJldHVybiAnIzhiNWNmNic7ICAgICAgICAgICAgICAgICAgIC8vIFB1cnBsZVxyXG4gIH1cclxuXHJcbiAgLy8gR2V0IGxvZ28gVVJMIGZyb20gY29uZmlnIGVsZW1lbnQgKHNldCBieSBjb250ZW50LmpzKVxyXG4gIGNvbnN0IGNvbmZpZ0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ29uZmlnJyk7XHJcbiAgY29uc3QgbG9nb1VybCA9IGNvbmZpZ0VsPy5kYXRhc2V0Py5sb2dvVXJsIHx8ICcnO1xyXG5cclxuICAvLyBDcmVhdGUgdGhlIGZsb2F0aW5nIG92ZXJsYXlcclxuICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgb3ZlcmxheS5pZCA9ICdmYkFkc0FuYWx5emVyT3ZlcmxheSc7XHJcbiAgb3ZlcmxheS5jbGFzc05hbWUgPSAnaGlkZGVuIG1pbmltaXplZCc7XHJcbiAgb3ZlcmxheS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaW1pemVkLWJhclwiIGlkPVwiZmJBZHNNaW5pbWl6ZWRCYXJcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktY29udGVudFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pLWljb25cIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogMjRweDsgaGVpZ2h0OiAyNHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyO1wiPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktdGV4dFwiPkZhY2Vib29rIEFkcyBDYW1wYWlnbiBBbmFseXplcjwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1taW5pLWJ0blwiIGlkPVwiZmJBZHNNYXhpbWl6ZUJ0blwiPlNob3c8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYW5hbHl6ZXItY29udGFpbmVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1wYW5lbFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDtcIj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAyNHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogNDBweDsgaGVpZ2h0OiA0MHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyOyBib3JkZXI6IDFweCBzb2xpZCAjZTVlN2ViO1wiPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8aDE+RmFjZWJvb2sgQWRzIENhbXBhaWduIEFuYWx5emVyPC9oMT5cclxuICAgICAgICAgICAgICAgIDxwIGlkPVwiZmJBZHNTdWJ0aXRsZVwiPlRpbWVsaW5lICYgQ2FtcGFpZ24gQW5hbHlzaXM8L3A+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWhlYWRlci1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYnRuXCIgaWQ9XCJmYkFkc01pbmltaXplQnRuXCIgdGl0bGU9XCJNaW5pbWl6ZVwiPl88L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWhlYWRlci1idG5cIiBpZD1cImZiQWRzQ2xvc2VCdG5cIiB0aXRsZT1cIkNsb3NlXCI+w5c8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sc1wiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtcm93XCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IHdpZHRoOiAxMDAlOyBhbGlnbi1pdGVtczogY2VudGVyOyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogMTJweDtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6ICMzNzQxNTE7XCI+Vmlldzo8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZSBhY3RpdmVcIiBkYXRhLXZpZXc9XCJ0aW1lbGluZVwiPvCfk4ogVGltZWxpbmU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS12aWV3PVwidG9wNS10ZXh0XCI+8J+PhiBUb3AgNSBUZXh0PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDUwMDsgZm9udC1zaXplOiAxM3B4OyBjb2xvcjogIzM3NDE1MTtcIj5Tb3J0Ojwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lIGFjdGl2ZVwiIGRhdGEtc29ydD1cInJlY2VudFwiPlN0YXJ0IERhdGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS1zb3J0PVwiZHVyYXRpb25cIj5EdXJhdGlvbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXNvcnQ9XCJhZHNcIj4jIG9mIEFkczwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBpZD1cImZiQWRzR3JvdXBEb21haW5CdG5cIiB0aXRsZT1cIkdyb3VwIGNhbXBhaWducyBieSBkb21haW5cIj7wn5OCIEdyb3VwIGJ5IERvbWFpbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiIHN0eWxlPVwiZmxleDogMTsgbWF4LXdpZHRoOiAzMDBweDtcIj5cclxuICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiZmJBZHNGaWx0ZXJJbnB1dFwiIGNsYXNzPVwiZmItYWRzLWlucHV0XCIgcGxhY2Vob2xkZXI9XCLwn5SNIEZpbHRlciBjYW1wYWlnbnMuLi5cIiBzdHlsZT1cIndpZHRoOiAxMDAlO1wiPlxyXG4gICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiBhdXRvO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCIgaWQ9XCJmYkFkc0Rvd25sb2FkQnRuXCI+8J+SviBEb3dubG9hZCBEYXRhPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIiBpZD1cImZiQWRzSW1wb3J0QnRuXCI+8J+TgiBJbXBvcnQgRGF0YTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZmlsZVwiIGlkPVwiZmJBZHNJbXBvcnRJbnB1dFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBhY2NlcHQ9XCIuanNvblwiPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZFwiIGlkPVwiZmJBZHNUaW1lbGluZUxlZ2VuZFwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgd2lkdGg6IDEwMCU7IGdhcDogMTZweDsgcGFkZGluZzogMTJweCAyNHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2U1ZTdlYjsgYmFja2dyb3VuZDogI2ZhZmFmYTtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogIzhiNWNmNjtcIj48L2Rpdj4gMS00IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjM2I4MmY2O1wiPjwvZGl2PiA1LTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICMyMmM1NWU7XCI+PC9kaXY+IDEwLTE5IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZWFiMzA4O1wiPjwvZGl2PiAyMC00OSBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2Y5NzMxNjtcIj48L2Rpdj4gNTAtOTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICNlZjQ0NDQ7XCI+PC9kaXY+IDEwMCsgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gIFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jaGFydC1jb250YWluZXJcIiBpZD1cImZiQWRzQ2hhcnRDb250ZW50XCI+XHJcbiAgICAgICAgICAgICA8IS0tIER5bmFtaWMgQ29udGVudCAtLT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgXHJcbiAgICAgIDwhLS0gTW9kYWwgQ29udGFpbmVyIC0tPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsLW92ZXJsYXlcIiBpZD1cImZiQWRzTW9kYWxPdmVybGF5XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC10aXRsZVwiPlxyXG4gICAgICAgICAgICAgIDxoMiBpZD1cImZiQWRzTW9kYWxUaXRsZVwiPkNhbXBhaWduIERldGFpbHM8L2gyPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwiZmItYWRzLW1vZGFsLW1ldGFcIiBpZD1cImZiQWRzTW9kYWxNZXRhXCI+dXJsLi4uPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1tb2RhbC1jbG9zZVwiIGlkPVwiZmJBZHNNb2RhbENsb3NlXCI+w5c8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1ib2R5XCIgaWQ9XCJmYkFkc01vZGFsQm9keVwiPlxyXG4gICAgICAgICAgICAgPCEtLSBEZXRhaWxzIC0tPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcclxuXHJcbiAgLy8gVG9vbHRpcFxyXG4gIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICB0b29sdGlwLmNsYXNzTmFtZSA9ICdmYi1hZHMtdG9vbHRpcCc7XHJcbiAgb3ZlcmxheS5hcHBlbmRDaGlsZCh0b29sdGlwKTtcclxuXHJcbiAgLy8gLS0tIEV2ZW50IExpc3RlbmVycyAtLS1cclxuXHJcbiAgLy8gSGVhZGVyIEFjdGlvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDbG9zZUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZU92ZXJsYXkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01pbmltaXplQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNaW5pbWl6ZSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWF4aW1pemVCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZWRCYXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuXHJcbiAgLy8gTW9kYWwgQWN0aW9uc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsQ2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVNb2RhbCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxPdmVybGF5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmlkID09PSAnZmJBZHNNb2RhbE92ZXJsYXknKSBoaWRlTW9kYWwoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTWFpbiBBY3Rpb25zXHJcblxyXG5cclxuICAvLyBNYWluIEFjdGlvbnNcclxuICBjb25zdCBmaWx0ZXJJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ZpbHRlcklucHV0Jyk7XHJcbiAgZmlsdGVySW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xyXG4gICAgc3RhdGUuZmlsdGVyVGV4dCA9IGUudGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB1cGRhdGVWaWV3KCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0Rvd25sb2FkQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkb3dubG9hZERhdGEpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydEJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzSW1wb3J0SW5wdXQnKS5jbGljaygpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydElucHV0JykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlRmlsZUltcG9ydCk7XHJcblxyXG5cclxuICAvLyBWaWV3IFN3aXRjaGVyXHJcbiAgY29uc3Qgdmlld0J1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS12aWV3XScpO1xyXG4gIHZpZXdCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIHZpZXdCdXR0b25zLmZvckVhY2goYiA9PiBiLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTtcclxuICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgIHN0YXRlLmN1cnJlbnRWaWV3ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXZpZXcnKTtcclxuXHJcbiAgICAgIGNvbnN0IGxlZ2VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1RpbWVsaW5lTGVnZW5kJyk7XHJcbiAgICAgIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RpbWVsaW5lJykge1xyXG4gICAgICAgIGxlZ2VuZC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZ2VuZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZVZpZXcoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBTb3J0IFN3aXRjaGVyXHJcbiAgY29uc3Qgc29ydEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zb3J0XScpO1xyXG5cclxuICAvLyBIZWxwZXIgdG8gdXBkYXRlIGJ1dHRvbiBsYWJlbHNcclxuICBjb25zdCB1cGRhdGVTb3J0QnV0dG9ucyA9ICgpID0+IHtcclxuICAgIHNvcnRCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgY29uc3Qgc29ydFR5cGUgPSBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLXNvcnQnKTtcclxuICAgICAgbGV0IGxhYmVsID0gYnRuLmlubmVyVGV4dC5yZXBsYWNlKC8gW+KGkeKGk10vLCAnJyk7IC8vIENsZWFuIGV4aXN0aW5nIGFycm93XHJcblxyXG4gICAgICBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gc29ydFR5cGUpIHtcclxuICAgICAgICBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgLy8gQWRkIGFycm93XHJcbiAgICAgICAgbGFiZWwgKz0gc3RhdGUuc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyAnIOKGkScgOiAnIOKGkyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xyXG4gICAgICB9XHJcbiAgICAgIGJ0bi5pbm5lclRleHQgPSBsYWJlbDtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHNvcnRCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRhcmdldFNvcnQgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29ydCcpO1xyXG5cclxuICAgICAgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09IHRhcmdldFNvcnQpIHtcclxuICAgICAgICAvLyBUb2dnbGUgZGlyZWN0aW9uXHJcbiAgICAgICAgc3RhdGUuc29ydERpcmVjdGlvbiA9IHN0YXRlLnNvcnREaXJlY3Rpb24gPT09ICdhc2MnID8gJ2Rlc2MnIDogJ2FzYyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gTmV3IHNvcnQ6IERlZmF1bHQgdG8gJ2Rlc2MnIGZvciBldmVyeXRoaW5nPyBcclxuICAgICAgICAvLyBVc3VhbGx5ICdTdGFydCBEYXRlJyB1c2VycyBtaWdodCB3YW50IE9sZGVzdCBGaXJzdCAoQXNjKSBvciBOZXdlc3QgRmlyc3QgKERlc2MpLlxyXG4gICAgICAgIC8vIExldCdzIGRlZmF1bHQgdG8gJ2Rlc2MnIChIaWdoL05ld2VzdCkgYXMgc3RhbmRhcmQsIGJ1dCBtYXliZSAnYXNjJyBmb3IgRGF0ZT9cclxuICAgICAgICAvLyBUaGUgb3JpZ2luYWwgY29kZSBoYWQgZGVmYXVsdCBEYXRlIGFzIEFzYyAoT2xkZXN0IGZpcnN0KS5cclxuICAgICAgICBpZiAodGFyZ2V0U29ydCA9PT0gJ3JlY2VudCcpIHtcclxuICAgICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSAnYXNjJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhdGUuc29ydERpcmVjdGlvbiA9ICdkZXNjJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUuZmlsdGVyU29ydCA9IHRhcmdldFNvcnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHVwZGF0ZVNvcnRCdXR0b25zKCk7XHJcbiAgICAgIHVwZGF0ZVZpZXcoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbml0IGJ1dHRvbiBsYWJlbHNcclxuICB1cGRhdGVTb3J0QnV0dG9ucygpO1xyXG5cclxuICAvLyBHcm91cCBieSBEb21haW5cclxuICBjb25zdCBncm91cEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0dyb3VwRG9tYWluQnRuJyk7XHJcbiAgZ3JvdXBCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzdGF0ZS5ncm91cEJ5RG9tYWluID0gIXN0YXRlLmdyb3VwQnlEb21haW47XHJcbiAgICBncm91cEJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcclxuICAgIHVwZGF0ZVZpZXcoKTtcclxuICB9KTtcclxuXHJcblxyXG4gIC8vIC0tLSBGdW5jdGlvbnMgLS0tXHJcblxyXG4gIGZ1bmN0aW9uIHNob3dPdmVybGF5KCkge1xyXG4gICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnbWluaW1pemVkJyk7XHJcbiAgICBzdGF0ZS5pc01pbmltaXplZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGlkZU92ZXJsYXkoKSB7XHJcbiAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdG9nZ2xlTWluaW1pemUoZSkge1xyXG4gICAgaWYgKGUpIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBzdGF0ZS5pc01pbmltaXplZCA9ICFzdGF0ZS5pc01pbmltaXplZDtcclxuICAgIGlmIChzdGF0ZS5pc01pbmltaXplZCkge1xyXG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21pbmltaXplZCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdtaW5pbWl6ZWQnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3dNb2RhbChjb250ZW50SHRtbCwgdGl0bGUsIG1ldGEpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsVGl0bGUnKS5pbm5lclRleHQgPSB0aXRsZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsTWV0YScpLmlubmVyVGV4dCA9IG1ldGE7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbEJvZHknKS5pbm5lckhUTUwgPSBjb250ZW50SHRtbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsT3ZlcmxheScpLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICBzZXR1cENvcHlCdXR0b25zKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsQm9keScpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhpZGVNb2RhbCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsT3ZlcmxheScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb3B5UmljaFRleHQocGxhaW4sIGh0bWwpIHtcclxuICAgIGlmICh0eXBlb2YgQ2xpcGJvYXJkSXRlbSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICBjb25zdCB0ZXh0QmxvYiA9IG5ldyBCbG9iKFtwbGFpbl0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluXCIgfSk7XHJcbiAgICAgIGNvbnN0IGh0bWxCbG9iID0gbmV3IEJsb2IoW2h0bWxdLCB7IHR5cGU6IFwidGV4dC9odG1sXCIgfSk7XHJcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoW1xyXG4gICAgICAgIG5ldyBDbGlwYm9hcmRJdGVtKHtcclxuICAgICAgICAgIFwidGV4dC9wbGFpblwiOiB0ZXh0QmxvYixcclxuICAgICAgICAgIFwidGV4dC9odG1sXCI6IGh0bWxCbG9iXHJcbiAgICAgICAgfSlcclxuICAgICAgXSkuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiUmljaCBjb3B5IGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIHBsYWluOlwiLCBlcnIpO1xyXG4gICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHBsYWluKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwbGFpbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXR1cENvcHlCdXR0b25zKGNvbnRhaW5lcikge1xyXG4gICAgY29uc3QgY29weUJ0bnMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmZiLWFkcy1jb3B5LWJ0bicpO1xyXG4gICAgY29weUJ0bnMuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldDsgLy8gVXNlIGN1cnJlbnRUYXJnZXQgdG8gZW5zdXJlIHdlIGdldCB0aGUgYnV0dG9uLCBub3QgaWNvblxyXG4gICAgICAgIGNvbnN0IHJhd1RleHQgPSBkZWNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQuY29weVRleHQpO1xyXG5cclxuICAgICAgICAvLyBFeHRyYWN0IG1ldGFkYXRhIGlmIGF2YWlsYWJsZVxyXG4gICAgICAgIGNvbnN0IG1ldGEgPSB7XHJcbiAgICAgICAgICB1cmw6IHRhcmdldC5kYXRhc2V0LnVybCA/IGRlY29kZVVSSUNvbXBvbmVudCh0YXJnZXQuZGF0YXNldC51cmwpIDogJycsXHJcbiAgICAgICAgICBjYW1wYWlnbkR1cmF0aW9uOiB0YXJnZXQuZGF0YXNldC5jYW1wYWlnbkR1cmF0aW9uIHx8ICcnLFxyXG4gICAgICAgICAgY2FtcGFpZ25BZHM6IHRhcmdldC5kYXRhc2V0LmNhbXBhaWduQWRzIHx8ICcnLFxyXG4gICAgICAgICAgbGliSWQ6IHRhcmdldC5kYXRhc2V0LmFkTGliSWQgfHwgJycsXHJcbiAgICAgICAgICBhZER1cmF0aW9uOiB0YXJnZXQuZGF0YXNldC5hZER1cmF0aW9uIHx8ICcnLFxyXG4gICAgICAgICAgYWREYXRlczogdGFyZ2V0LmRhdGFzZXQuYWREYXRlcyB8fCAnJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENvbnN0cnVjdCBSaWNoIFRleHQgSFRNTFxyXG4gICAgICAgIGNvbnN0IHJpY2hUZXh0ID0gYFxyXG4gICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE0cHg7IGxpbmUtaGVpZ2h0OiAxLjU7IGNvbG9yOiAjMzc0MTUxO1wiPlxyXG4gICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+Q2FtcGFpZ246PC9zdHJvbmc+IDxhIGhyZWY9XCIke21ldGEudXJsfVwiPiR7bWV0YS51cmx9PC9hPjxicj5cclxuICAgICAgICAgICAgICAgICAgICAke21ldGEuY2FtcGFpZ25EdXJhdGlvbiA/IGA8c3Ryb25nPkR1cmF0aW9uOjwvc3Ryb25nPiAke21ldGEuY2FtcGFpZ25EdXJhdGlvbn0gZGF5c2AgOiAnJ30gXHJcbiAgICAgICAgICAgICAgICAgICAgJHttZXRhLmNhbXBhaWduQWRzID8gYOKAoiAke21ldGEuY2FtcGFpZ25BZHN9IGFkc2AgOiAnJ31cclxuICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxMnB4OyBwYWRkaW5nLWJvdHRvbTogMTJweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlNWU3ZWI7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5MaWJyYXJ5IElEOjwvc3Ryb25nPiA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2Fkcy9saWJyYXJ5Lz9pZD0ke21ldGEubGliSWR9XCI+JHttZXRhLmxpYklkfTwvYT48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5EYXRlczo8L3N0cm9uZz4gJHttZXRhLmFkRGF0ZXN9IHwgPHN0cm9uZz5BZCBEdXJhdGlvbjo8L3N0cm9uZz4gJHttZXRhLmFkRHVyYXRpb259IGRheXNcclxuICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAke3Jhd1RleHQucmVwbGFjZSgvXFxuL2csICc8YnI+Jyl9XHJcbiAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICAvLyBDb25zdHJ1Y3QgUGxhaW4gVGV4dCBGYWxsYmFja1xyXG4gICAgICAgIGNvbnN0IHBsYWluVGV4dCA9IGBDYW1wYWlnbjogJHttZXRhLnVybH1cXG5EdXJhdGlvbjogJHttZXRhLmNhbXBhaWduRHVyYXRpb259IGRheXMg4oCiICR7bWV0YS5jYW1wYWlnbkFkc30gYWRzXFxuXFxuTGlicmFyeSBJRDogJHttZXRhLmxpYklkfVxcbkRhdGVzOiAke21ldGEuYWREYXRlc30gfCBBZCBEdXJhdGlvbjogJHttZXRhLmFkRHVyYXRpb259IGRheXNcXG5cXG4tLS1cXG5cXG4ke3Jhd1RleHR9YDtcclxuXHJcbiAgICAgICAgLy8gVXNlIHJpY2ggdGV4dCBjb3B5IGhlbHBlclxyXG4gICAgICAgIGNvcHlSaWNoVGV4dChwbGFpblRleHQsIHJpY2hUZXh0KTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSB0YXJnZXQuaW5uZXJIVE1MO1xyXG4gICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSAn4pyFIENvcGllZCEnO1xyXG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gb3JpZ2luYWw7XHJcbiAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnc3VjY2VzcycpO1xyXG4gICAgICAgIH0sIDIwMDApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlVmlldygpIHtcclxuICAgIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RpbWVsaW5lJykge1xyXG4gICAgICByZW5kZXJUaW1lbGluZSgpO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RvcDUtdGV4dCcpIHtcclxuICAgICAgcmVuZGVyVG9wNVRleHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHByb2Nlc3NEYXRhKGNhbXBhaWducykge1xyXG4gICAgbGV0IHNvcnRlZCA9IFsuLi5jYW1wYWlnbnNdO1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUHJvY2Vzc2luZyBkYXRhLiBTb3J0OicsIHN0YXRlLmZpbHRlclNvcnQsICdHcm91cDonLCBzdGF0ZS5ncm91cEJ5RG9tYWluKTtcclxuXHJcbiAgICAvLyAxLiBTb3J0aW5nIExvZ2ljXHJcbiAgICAvLyAwLiBGaWx0ZXIgTG9naWNcclxuICAgIGlmIChzdGF0ZS5maWx0ZXJUZXh0KSB7XHJcbiAgICAgIHNvcnRlZCA9IHNvcnRlZC5maWx0ZXIoYyA9PlxyXG4gICAgICAgIGMudXJsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RhdGUuZmlsdGVyVGV4dCkgfHxcclxuICAgICAgICAoYy50b3A1ICYmIGMudG9wNS5zb21lKGFkID0+IGFkLmFkVGV4dCAmJiBhZC5hZFRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdGF0ZS5maWx0ZXJUZXh0KSkpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMS4gU29ydGluZyBMb2dpY1xyXG4gICAgc29ydGVkLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgbGV0IHZhbEEsIHZhbEI7XHJcblxyXG4gICAgICBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gJ2FkcycpIHtcclxuICAgICAgICB2YWxBID0gTnVtYmVyKGEuYWRzQ291bnQpIHx8IDA7XHJcbiAgICAgICAgdmFsQiA9IE51bWJlcihiLmFkc0NvdW50KSB8fCAwO1xyXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09ICdkdXJhdGlvbicpIHtcclxuICAgICAgICB2YWxBID0gTnVtYmVyKGEuY2FtcGFpZ25EdXJhdGlvbkRheXMpIHx8IDA7XHJcbiAgICAgICAgdmFsQiA9IE51bWJlcihiLmNhbXBhaWduRHVyYXRpb25EYXlzKSB8fCAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vICdyZWNlbnQnIC8gU3RhcnQgRGF0ZVxyXG4gICAgICAgIHZhbEEgPSBuZXcgRGF0ZShhLmZpcnN0QWR2ZXJ0aXNlZCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHZhbEIgPSBuZXcgRGF0ZShiLmZpcnN0QWR2ZXJ0aXNlZCkuZ2V0VGltZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGFuZGFyZCBBc2NlbmRpbmc6IHZhbEEgLSB2YWxCXHJcbiAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSB2YWxBIC0gdmFsQjtcclxuXHJcbiAgICAgIC8vIEFwcGx5IERpcmVjdGlvblxyXG4gICAgICByZXR1cm4gc3RhdGUuc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyBjb21wYXJpc29uIDogLWNvbXBhcmlzb247XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyAyLiBHcm91cGluZyBMb2dpYyAoU2Vjb25kYXJ5IFNvcnQpXHJcbiAgICBpZiAoc3RhdGUuZ3JvdXBCeURvbWFpbikge1xyXG4gICAgICBzb3J0ZWQuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRBID0gZ2V0RG9tYWluKGEudXJsKTtcclxuICAgICAgICBjb25zdCBkQiA9IGdldERvbWFpbihiLnVybCk7XHJcbiAgICAgICAgaWYgKGRBIDwgZEIpIHJldHVybiAtMTtcclxuICAgICAgICBpZiAoZEEgPiBkQikgcmV0dXJuIDE7XHJcbiAgICAgICAgLy8gS2VlcCBwcmV2aW91cyBzb3J0IG9yZGVyIHdpdGhpbiBzYW1lIGRvbWFpblxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc29ydGVkO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0RG9tYWluKHVybCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIG5ldyBVUkwodXJsKS5ob3N0bmFtZS5yZXBsYWNlKCd3d3cuJywgJycpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiB1cmw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJUaW1lbGluZSgpIHtcclxuICAgIGNvbnN0IGNoYXJ0Q29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NoYXJ0Q29udGVudCcpO1xyXG4gICAgY2hhcnRDb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ZiLWFkcy1iZy1ncmF5Jyk7XHJcbiAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgY29uc3QgY2FtcGFpZ25zVG9SZW5kZXIgPSBwcm9jZXNzRGF0YShzdGF0ZS5yYXdDYW1wYWlnbnMpO1xyXG5cclxuICAgIGlmIChjYW1wYWlnbnNUb1JlbmRlci5sZW5ndGggPT09IDApIHtcclxuICAgICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZmItYWRzLWVtcHR5LXN0YXRlXCI+Tm8gY2FtcGFpZ25zIG1hdGNoIGNyaXRlcmlhPC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YnRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3VidGl0bGUnKTtcclxuICAgIGlmIChzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBmaXJzdCA9IG5ldyBEYXRlKHN0YXRlLnJhd0NhbXBhaWduc1tzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoIC0gMV0uZmlyc3RBZHZlcnRpc2VkKTtcclxuICAgICAgY29uc3QgbGFzdCA9IG5ldyBEYXRlKHN0YXRlLnJhd0NhbXBhaWduc1swXS5sYXN0QWR2ZXJ0aXNlZCk7IC8vIFJvdWdoIGFwcHJveCBkZXBlbmRpbmcgb24gc29ydFxyXG4gICAgICBzdWJ0aXRsZS50ZXh0Q29udGVudCA9IGAke3N0YXRlLnJhd0NhbXBhaWducy5sZW5ndGh9IGNhbXBhaWducyBhbmFseXplZGA7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIERldGVybWluZSBUaW1lbGluZSBSYW5nZVxyXG4gICAgbGV0IG1pbkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IG1heERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy5maXJzdEFkdmVydGlzZWQgPCBtaW5EYXRlKSBtaW5EYXRlID0gYy5maXJzdEFkdmVydGlzZWQ7XHJcbiAgICAgIGlmIChjLmxhc3RBZHZlcnRpc2VkID4gbWF4RGF0ZSkgbWF4RGF0ZSA9IGMubGFzdEFkdmVydGlzZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBkYXlNcyA9IDg2NDAwMDAwO1xyXG4gICAgLy8gRW5zdXJlIGF0IGxlYXN0IDEgZGF5IHJhbmdlIHRvIGF2b2lkIGRpdmlzaW9uIGJ5IHplcm9cclxuICAgIGxldCByYW5nZU1zID0gbWF4RGF0ZSAtIG1pbkRhdGU7XHJcbiAgICBpZiAocmFuZ2VNcyA8IGRheU1zKSByYW5nZU1zID0gZGF5TXM7XHJcblxyXG4gICAgLy8gQWRkIHBhZGRpbmcgKG1heCBvZiA1IGRheXMgb3IgMTAlIG9mIHRvdGFsIHJhbmdlKVxyXG4gICAgLy8gQ2xhbXAgcGFkZGluZyBmb3IgcmlnaHQgc2lkZSB0byBhdm9pZCBzaG93aW5nIGZ1dHVyZSBtb250aHMgdW5uZWNlc3NhcmlseVxyXG4gICAgLy8gQ2xhbXAgcGFkZGluZyBmb3IgcmlnaHQgc2lkZSB0byBhdm9pZCBzaG93aW5nIGZ1dHVyZSBtb250aHMgdW5uZWNlc3NhcmlseVxyXG4gICAgY29uc3QgcGFkZGluZyA9IE1hdGgubWF4KGRheU1zICogNSwgcmFuZ2VNcyAqIDAuMSk7XHJcblxyXG4gICAgLy8gU3RhcnQgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBtb250aCBvZiB0aGUgZmlyc3QgYWQgKG5vIGxlZnQgcGFkZGluZyBpbnRvIHByZXZpb3VzIG1vbnRocylcclxuICAgIGNvbnN0IHJlbmRlck1pbiA9IG5ldyBEYXRlKG1pbkRhdGUuZ2V0RnVsbFllYXIoKSwgbWluRGF0ZS5nZXRNb250aCgpLCAxKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgcmlnaHQtc2lkZSBib3VuZCAoRW5kIG9mIHRoZSBtb250aCBvZiB0aGUgbWF4RGF0ZSlcclxuICAgIGNvbnN0IGVuZE9mTWF4RGF0ZU1vbnRoID0gbmV3IERhdGUobWF4RGF0ZS5nZXRGdWxsWWVhcigpLCBtYXhEYXRlLmdldE1vbnRoKCkgKyAxLCAwLCAyMywgNTksIDU5LCA5OTkpO1xyXG4gICAgLy8gVXNlIHBhZGRpbmcgbm9ybWFsbHksIGJ1dCBkb24ndCBleGNlZWQgZW5kIG9mIHRoYXQgbW9udGggYnkgbXVjaCAobWF5YmUgYWxsb3cgaGl0dGluZyB0aGUgbGFzdCBkYXkpXHJcbiAgICAvLyBBY3R1YWxseSB1c2VyIHdhbnRzIFwidW50aWwgdGhlIGN1cnJlbnQgbW9udGggb25seVwiLlxyXG4gICAgLy8gU28gaWYgbWF4RGF0ZSBpcyBOb3YsIHdlIHNob3VsZG4ndCBzaG93IEphbi4gXHJcbiAgICAvLyBTaW1wbHkgY2xhbXBpbmcgdG8gZW5kT2ZNYXhEYXRlTW9udGggc2VlbXMgY29ycmVjdCBmb3IgXCJjdXJyZW50IG1vbnRoIG9ubHlcIi5cclxuICAgIGNvbnN0IHJlbmRlck1heCA9IG5ldyBEYXRlKE1hdGgubWluKG1heERhdGUuZ2V0VGltZSgpICsgcGFkZGluZywgZW5kT2ZNYXhEYXRlTW9udGguZ2V0VGltZSgpKSk7XHJcbiAgICBjb25zdCB0b3RhbER1cmF0aW9uID0gcmVuZGVyTWF4IC0gcmVuZGVyTWluO1xyXG5cclxuICAgIC8vIEhlYWRlclxyXG4gICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBoZWFkZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy10aW1lbGluZS1oZWFkZXInO1xyXG4gICAgaGVhZGVyLmlubmVySFRNTCA9IGBcclxuICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtbGFiZWxcIj48c3Ryb25nPkNhbXBhaWduPC9zdHJvbmc+PC9kaXY+XHJcbiAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRpbWVsaW5lLWdyaWRcIj48L2Rpdj5cclxuICAgIGA7XHJcbiAgICBjaGFydENvbnRlbnQuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcclxuXHJcbiAgICBjb25zdCBncmlkID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtdGltZWxpbmUtZ3JpZCcpO1xyXG4gICAgbGV0IGdyaWRMaW5lc0hUTUwgPSAnJztcclxuXHJcbiAgICAvLyBBZGFwdGl2ZSBNYXJrZXJzIGxvZ2ljXHJcbiAgICBjb25zdCBpc1Nob3J0UmFuZ2UgPSByYW5nZU1zIDwgKGRheU1zICogNjApO1xyXG5cclxuICAgIGlmIChpc1Nob3J0UmFuZ2UpIHtcclxuICAgICAgLy8gV2Vla2x5IG1hcmtlcnNcclxuICAgICAgbGV0IGQgPSBuZXcgRGF0ZShyZW5kZXJNaW4pO1xyXG4gICAgICB3aGlsZSAoZCA8PSByZW5kZXJNYXgpIHtcclxuICAgICAgICBjb25zdCBwb3MgPSAoKGQgLSByZW5kZXJNaW4pIC8gdG90YWxEdXJhdGlvbikgKiAxMDA7XHJcbiAgICAgICAgaWYgKHBvcyA+PSAwICYmIHBvcyA8PSAxMDApIHtcclxuICAgICAgICAgIGNvbnN0IG1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgbWFya2VyLmNsYXNzTmFtZSA9ICdmYi1hZHMtbW9udGgtbWFya2VyJztcclxuICAgICAgICAgIG1hcmtlci5zdHlsZS5sZWZ0ID0gYCR7cG9zfSVgO1xyXG4gICAgICAgICAgbWFya2VyLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vbnRoLWxhYmVsXCI+JHtkLnRvTG9jYWxlU3RyaW5nKCdkZWZhdWx0JywgeyBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycgfSl9PC9kaXY+YDtcclxuICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobWFya2VyKTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgR3JpZCBMaW5lXHJcbiAgICAgICAgICBncmlkTGluZXNIVE1MICs9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWdyaWQtbGluZVwiIHN0eWxlPVwibGVmdDogJHtwb3N9JVwiPjwvZGl2PmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSArIDcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBNb250aGx5IG1hcmtlcnNcclxuICAgICAgbGV0IGQgPSBuZXcgRGF0ZShyZW5kZXJNaW4pO1xyXG4gICAgICBkLnNldERhdGUoMSk7XHJcbiAgICAgIHdoaWxlIChkIDw9IHJlbmRlck1heCkge1xyXG4gICAgICAgIGNvbnN0IHBvcyA9ICgoZCAtIHJlbmRlck1pbikgLyB0b3RhbER1cmF0aW9uKSAqIDEwMDtcclxuICAgICAgICBpZiAocG9zID49IDAgJiYgcG9zIDw9IDEwMCkge1xyXG4gICAgICAgICAgY29uc3QgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICBtYXJrZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1tb250aC1tYXJrZXInO1xyXG4gICAgICAgICAgbWFya2VyLnN0eWxlLmxlZnQgPSBgJHtwb3N9JWA7XHJcbiAgICAgICAgICBtYXJrZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9udGgtbGFiZWxcIj4ke2QudG9Mb2NhbGVTdHJpbmcoJ2RlZmF1bHQnLCB7IG1vbnRoOiAnc2hvcnQnLCB5ZWFyOiAnMi1kaWdpdCcgfSl9PC9kaXY+YDtcclxuICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobWFya2VyKTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgR3JpZCBMaW5lXHJcbiAgICAgICAgICBncmlkTGluZXNIVE1MICs9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWdyaWQtbGluZVwiIHN0eWxlPVwibGVmdDogJHtwb3N9JVwiPjwvZGl2PmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGQuc2V0TW9udGgoZC5nZXRNb250aCgpICsgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBcHBlbmQgQmFja2dyb3VuZCBHcmlkIGFuZCBSb3dzIFdyYXBwZXJcclxuICAgIGNvbnN0IGJvZHlDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGJvZHlDb250YWluZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy10aW1lbGluZS1ib2R5JztcclxuICAgIGJvZHlDb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnOyAvLyBFbnN1cmUgZ3JpZCBpcyByZWxhdGl2ZSB0byB0aGlzIGNvbnRlbnQgaGVpZ2h0XHJcblxyXG4gICAgY29uc3QgZ3JpZExheWVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBncmlkTGF5ZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1nbG9iYWwtZ3JpZCc7XHJcbiAgICBncmlkTGF5ZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1ncmlkLXNwYWNlclwiPjwvZGl2PlxyXG4gICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1ncmlkLWFyZWFcIj4ke2dyaWRMaW5lc0hUTUx9PC9kaXY+XHJcbiAgICBgO1xyXG4gICAgYm9keUNvbnRhaW5lci5hcHBlbmRDaGlsZChncmlkTGF5ZXIpO1xyXG5cclxuICAgIC8vIFJlbmRlciBSb3dzXHJcbiAgICBsZXQgbGFzdERvbWFpbiA9IG51bGw7XHJcblxyXG4gICAgY2FtcGFpZ25zVG9SZW5kZXIuZm9yRWFjaChjYW1wYWlnbiA9PiB7XHJcbiAgICAgIC8vIERvbWFpbiBIZWFkZXIgZm9yIEdyb3VwaW5nXHJcbiAgICAgIGNvbnN0IGRvbWFpbiA9IGdldERvbWFpbihjYW1wYWlnbi51cmwpO1xyXG4gICAgICBpZiAoc3RhdGUuZ3JvdXBCeURvbWFpbiAmJiBkb21haW4gIT09IGxhc3REb21haW4pIHtcclxuICAgICAgICBjb25zdCBncm91cEhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGdyb3VwSGVhZGVyLmNsYXNzTmFtZSA9ICdmYi1hZHMtZG9tYWluLWhlYWRlcic7XHJcbiAgICAgICAgZ3JvdXBIZWFkZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtZG9tYWluLW5hbWVcIj4ke2RvbWFpbn08L2Rpdj5gO1xyXG4gICAgICAgIGJvZHlDb250YWluZXIuYXBwZW5kQ2hpbGQoZ3JvdXBIZWFkZXIpO1xyXG4gICAgICAgIGxhc3REb21haW4gPSBkb21haW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICByb3cuY2xhc3NOYW1lID0gJ2ZiLWFkcy1jYW1wYWlnbi1yb3cnO1xyXG5cclxuICAgICAgY29uc3QgbGVmdCA9ICgoY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkIC0gcmVuZGVyTWluKSAvIHRvdGFsRHVyYXRpb24pICogMTAwO1xyXG4gICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KDAuNSwgKChjYW1wYWlnbi5sYXN0QWR2ZXJ0aXNlZCAtIGNhbXBhaWduLmZpcnN0QWR2ZXJ0aXNlZCkgLyB0b3RhbER1cmF0aW9uKSAqIDEwMCk7XHJcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0QWRDb3VudENvbG9yKGNhbXBhaWduLmFkc0NvdW50KTtcclxuXHJcbiAgICAgIHJvdy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLWluZm9cIj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tdXJsXCIgdGl0bGU9XCIke2NhbXBhaWduLnVybH1cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke2NhbXBhaWduLnVybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiBpbmhlcml0OyB0ZXh0LWRlY29yYXRpb246IG5vbmU7XCI+JHtjYW1wYWlnbi51cmx9PC9hPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDExcHg7IG1hcmdpbi1sZWZ0OiA2cHg7XCI+XHJcbiAgICAgICAgICAgICAgICAgICg8YSBocmVmPVwiaHR0cHM6Ly93ZWIuYXJjaGl2ZS5vcmcvd2ViLyovJHtjYW1wYWlnbi51cmx9LypcIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiAjNmI3MjgwOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcIj5BcmNoaXZlPC9hPilcclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi1tZXRhXCI+XHJcbiAgICAgICAgICAgICAgICR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9IGRheXMg4oCiICR7Y2FtcGFpZ24uYWRzQ291bnR9IGFkc1xyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tdGltZWxpbmVcIj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtYmctbWFya2VyXCIgc3R5bGU9XCJsZWZ0OiAke2xlZnR9JTsgd2lkdGg6ICR7d2lkdGh9JVwiPjwvZGl2PiBcclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tYmFyXCIgXHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPVwibGVmdDogJHtsZWZ0fSU7IHdpZHRoOiAke3dpZHRofSU7IGJhY2tncm91bmQ6ICR7Y29sb3J9OyBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLDAsMCwwLjEpO1wiPlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgIGA7XHJcblxyXG4gICAgICAvLyBUb29sdGlwIGxvZ2ljIGZvciB0aGUgYmFyXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJhciA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWNhbXBhaWduLWJhcicpO1xyXG4gICAgICAgIGlmIChiYXIpIHtcclxuICAgICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzdGFydERhdGUgPSBuZXcgRGF0ZShjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoY2FtcGFpZ24ubGFzdEFkdmVydGlzZWQpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgdG9vbHRpcC5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdG9vbHRpcC1oZWFkZXJcIj5DYW1wYWlnbiBEZXRhaWxzPC9kaXY+XHJcbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdG9vbHRpcC1kYXRlc1wiPiR7c3RhcnREYXRlfSDigJQgJHtlbmREYXRlfTwvZGl2PlxyXG4gICAgICAgICAgICAgICA8YSBjbGFzcz1cImZiLWFkcy10b29sdGlwLWFjdGlvblwiIGlkPVwiZmJBZHNUb29sdGlwVmlld0J0blwiPkNsaWNrIHRvIFZpZXcgVG9wIDUgQWRzPC9hPlxyXG4gICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHZpZXdCdG4gPSB0b29sdGlwLnF1ZXJ5U2VsZWN0b3IoJyNmYkFkc1Rvb2x0aXBWaWV3QnRuJyk7XHJcbiAgICAgICAgICAgIGlmICh2aWV3QnRuKSB7XHJcbiAgICAgICAgICAgICAgdmlld0J0bi5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKTtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUuY2xpZW50WCArIDE1O1xyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS5jbGllbnRZICsgMTU7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgMCk7XHJcblxyXG4gICAgICByb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCdhJykpIHJldHVybjtcclxuICAgICAgICBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBib2R5Q29udGFpbmVyLmFwcGVuZENoaWxkKHJvdyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjaGFydENvbnRlbnQuYXBwZW5kQ2hpbGQoYm9keUNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJUb3A1VGV4dCgpIHtcclxuICAgIGNvbnN0IGNoYXJ0Q29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NoYXJ0Q29udGVudCcpO1xyXG4gICAgY2hhcnRDb250ZW50LmNsYXNzTGlzdC5hZGQoJ2ZiLWFkcy1iZy1ncmF5Jyk7XHJcbiAgICBjb25zdCBzdWJ0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1N1YnRpdGxlJyk7XHJcbiAgICBzdWJ0aXRsZS50ZXh0Q29udGVudCA9IGBUb3AgNSBhZHMgZm9yICR7c3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aH0gY2FtcGFpZ25zYDtcclxuXHJcbiAgICBpZiAoIXN0YXRlLnJhd0NhbXBhaWducyB8fCBzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNoYXJ0Q29udGVudC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImZiLWFkcy1lbXB0eS1zdGF0ZVwiPk5vIGNhbXBhaWduIGRhdGEgYXZhaWxhYmxlPC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBvdXRwdXQgPSAnJztcclxuICAgIGNvbnN0IGNhbXBhaWduc1RvUmVuZGVyID0gcHJvY2Vzc0RhdGEoc3RhdGUucmF3Q2FtcGFpZ25zKTtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGNhbXBhaWduID0+IHtcclxuICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyKSA9PiBuZXcgRGF0ZShkYXRlU3RyKS50b0RhdGVTdHJpbmcoKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBnZXRBZENvdW50Q29sb3IoY2FtcGFpZ24uYWRzQ291bnQpO1xyXG5cclxuICAgICAgb3V0cHV0ICs9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtY2FtcGFpZ24gZmItYWRzLWNhcmQtd2hpdGVcIiBzdHlsZT1cImJvcmRlci1sZWZ0OiA0cHggc29saWQgJHtjb2xvcn07XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+JHtjYW1wYWlnbi51cmx9PC9zdHJvbmc+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1tZXRhXCI+XHJcbiAgICAgICAgICAgICR7Zm9ybWF0RGF0ZShjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQpfSDigJQgJHtmb3JtYXREYXRlKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkKX0gfCBcclxuICAgICAgICAgICAgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyB8IFxyXG4gICAgICAgICAgICAke2NhbXBhaWduLmFkc0NvdW50fSBhZHNcclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAke2NhbXBhaWduLnRvcDUgJiYgY2FtcGFpZ24udG9wNS5sZW5ndGggPiAwID8gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWRzXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWxhYmVsXCI+VG9wIDUgQWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1ncmlkXCI+XHJcbiAgICAgICAgICAgICAgJHtjYW1wYWlnbi50b3A1Lm1hcChhZCA9PiBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWRcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TGlicmFyeSBJRDo8L3N0cm9uZz4gXHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHthZC5saWJyYXJ5SWR9XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1saW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAke2FkLmxpYnJhcnlJZH1cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWQtbWV0YVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RGF0ZXM6PC9zdHJvbmc+ICR7bmV3IERhdGUoYWQuc3RhcnRpbmdEYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoKX0g4oCUICR7bmV3IERhdGUoYWQuZW5kRGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCl9PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RHVyYXRpb246PC9zdHJvbmc+ICR7YWQuZHVyYXRpb259IGRheXNcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZC1jb3B5XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICR7YWQubWVkaWFUeXBlID09PSAndmlkZW8nXHJcbiAgICAgICAgICA/IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPjx2aWRlbyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBoZWlnaHQ6IGF1dG87IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L3ZpZGVvPjwvZGl2PmBcclxuICAgICAgICAgIDogKGFkLm1lZGlhVHlwZSA9PT0gJ2ltYWdlJyA/IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPjxpbWcgc3JjPVwiJHthZC5tZWRpYVNyY31cIiBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgaGVpZ2h0OiBhdXRvOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC9kaXY+YCA6ICcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkFkIENvcHk6PC9zdHJvbmc+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7YWQuYWRUZXh0IHx8ICdbbm8gY29weV0nfVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIGAgOiAnPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LW5vLWFkc1wiPk5vIHRvcCBhZHMgZGF0YSBhdmFpbGFibGU8L2Rpdj4nfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFjdGlvbnNcIiBzdHlsZT1cIm1hcmdpbi10b3A6IDE1cHg7IG1hcmdpbi1ib3R0b206IDIwcHg7IGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7IGdhcDogMTBweDtcIj5cclxuICAgICAgICAke3N0YXRlLmFpQ29uZmlnID8gYFxyXG4gICAgICAgIDxidXR0b24gaWQ9XCJmYkFkc0FuYWx5emVCdG5cIiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIj5cclxuICAgICAgICAgIPCfpJYgQW5hbHl6ZSB3aXRoIEFJXHJcbiAgICAgICAgPC9idXR0b24+YCA6ICcnXHJcbiAgICAgIH1cclxuICAgIDxidXR0b24gaWQ9XCJmYkFkc0NvcHlBbGxUZXh0QnRuXCIgY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCI+XHJcbiAgICAgIPCfk4sgQ29weSBBbGwgVGV4dFxyXG4gICAgPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICAgPGRpdiBpZD1cImZiQWRzQUlSZXN1bHRcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7IG1hcmdpbi1ib3R0b206IDIwcHg7IGJhY2tncm91bmQ6ICNmMGZkZjQ7IGJvcmRlcjogMXB4IHNvbGlkICNiYmY3ZDA7IGJvcmRlci1yYWRpdXM6IDhweDsgY29sb3I6ICMxNjY1MzQ7IG92ZXJmbG93OiBoaWRkZW47XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFpLWhlYWRlclwiIHN0eWxlPVwicGFkZGluZzogMTJweCAxNnB4OyBiYWNrZ3JvdW5kOiAjZGNmY2U3OyBkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGN1cnNvcjogcG9pbnRlcjsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiYmY3ZDA7XCI+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXdlaWdodDogNjAwOyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDhweDtcIj7wn6SWIEFJIEFuYWx5c2lzPC9kaXY+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYWktbWluaW1pemVcIiBzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgZm9udC1zaXplOiAxOHB4OyBjb2xvcjogIzE2NjUzNDsgY3Vyc29yOiBwb2ludGVyOyBsaW5lLWhlaWdodDogMTtcIj7iiJI8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1haS1jb250ZW50XCIgc3R5bGU9XCJwYWRkaW5nOiAxNnB4OyB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XCI+PC9kaXY+XHJcbiAgICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LW91dHB1dFwiPiR7b3V0cHV0fTwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICAvLyBUb2dnbGUgbWluaW1pemVcclxuICAgIGNvbnN0IGFpSGVhZGVyID0gY2hhcnRDb250ZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktaGVhZGVyJyk7XHJcbiAgICBjb25zdCBhaUNvbnRlbnQgPSBjaGFydENvbnRlbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy1haS1jb250ZW50Jyk7XHJcbiAgICBjb25zdCBtaW5pbWl6ZUJ0biA9IGNoYXJ0Q29udGVudC5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLW1pbmltaXplJyk7XHJcblxyXG4gICAgaWYgKGFpSGVhZGVyKSB7XHJcbiAgICAgIGFpSGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlzSGlkZGVuID0gYWlDb250ZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJztcclxuICAgICAgICBhaUNvbnRlbnQuc3R5bGUuZGlzcGxheSA9IGlzSGlkZGVuID8gJ2Jsb2NrJyA6ICdub25lJztcclxuICAgICAgICBtaW5pbWl6ZUJ0bi50ZXh0Q29udGVudCA9IGlzSGlkZGVuID8gJ+KIkicgOiAnKyc7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc3RvcmUgQUkgUmVzdWx0IGlmIGV4aXN0c1xyXG4gICAgY29uc3QgcmVzdWx0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQUlSZXN1bHQnKTtcclxuICAgIGlmIChzdGF0ZS5haUFuYWx5c2lzUmVzdWx0KSB7XHJcbiAgICAgIGNvbnN0IGNvbnRlbnREaXYgPSByZXN1bHREaXYucXVlcnlTZWxlY3RvcignLmZiLWFkcy1haS1jb250ZW50Jyk7XHJcbiAgICAgIGNvbnRlbnREaXYuaW5uZXJIVE1MID0gc3RhdGUuYWlBbmFseXNpc1Jlc3VsdDtcclxuICAgICAgcmVzdWx0RGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzdGF0ZS5haUNvbmZpZykge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBbmFseXplQnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYW5hbHl6ZVdpdGhBSSk7XHJcbiAgICB9XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ29weUFsbFRleHRCdG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtdGV4dC1vdXRwdXQnKTtcclxuICAgICAgaWYgKCFjb250YWluZXIpIHJldHVybjtcclxuXHJcbiAgICAgIC8vIDEuIFRlbXBvcmFyaWx5IGhpZGUgbWVkaWFcclxuICAgICAgY29uc3QgbWVkaWEgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnaW1nLCB2aWRlbycpO1xyXG4gICAgICBjb25zdCBvcmlnaW5hbERpc3BsYXlzID0gW107XHJcbiAgICAgIG1lZGlhLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgIG9yaWdpbmFsRGlzcGxheXMucHVzaChlbC5zdHlsZS5kaXNwbGF5KTtcclxuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIDIuIFNlbGVjdCBjb250ZW50XHJcbiAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoY29udGFpbmVyKTtcclxuICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xyXG5cclxuICAgICAgLy8gMy4gQ29weVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NvcHlBbGxUZXh0QnRuJyk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gYnRuLnRleHRDb250ZW50O1xyXG4gICAgICAgIGJ0bi50ZXh0Q29udGVudCA9ICfinIUgQ29waWVkISc7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvcHkgZmFpbGVkOicsIGVycik7XHJcbiAgICAgICAgYWxlcnQoJ0NvcHkgZmFpbGVkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIDQuIENsZWFudXBcclxuICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgICBtZWRpYS5mb3JFYWNoKChlbCwgaSkgPT4ge1xyXG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSBvcmlnaW5hbERpc3BsYXlzW2ldO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb3BlbkNhbXBhaWduRGV0YWlscyhjYW1wYWlnbikge1xyXG4gICAgaWYgKCFjYW1wYWlnbi50b3A1IHx8IGNhbXBhaWduLnRvcDUubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgbGV0IGNvbnRlbnQgPSBgPGRpdiBjbGFzcz1cImZiLWFkcy1saXN0XCI+YDtcclxuXHJcbiAgICBjYW1wYWlnbi50b3A1LmZvckVhY2goKGFkLCBpbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCBmb3JtYXREYXRlID0gKGRhdGVTdHIpID0+IG5ldyBEYXRlKGRhdGVTdHIpLnRvRGF0ZVN0cmluZygpO1xyXG4gICAgICBjb250ZW50ICs9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYXJkIGZiLWFkcy1jYXJkLXdoaXRlXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtcmFua1wiPlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1yYW5rLW51bWJlclwiPiMke2luZGV4ICsgMX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1sYWJlbFwiPkxpYnJhcnkgSUQ8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHthZC5saWJyYXJ5SWR9XCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1saW5rXCI+JHthZC5saWJyYXJ5SWR9PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtZHVyYXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtZHVyYXRpb24tbGFiZWxcIj5EdXJhdGlvbjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1kdXJhdGlvbi12YWx1ZVwiPiR7YWQuZHVyYXRpb259IGRheXM8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtbWV0YVwiPiR7Zm9ybWF0RGF0ZShhZC5zdGFydGluZ0RhdGUpfSAtICR7Zm9ybWF0RGF0ZShhZC5lbmREYXRlKX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1zZWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgJHthZC5tZWRpYVR5cGUgPT09ICd2aWRlbydcclxuICAgICAgICAgID8gYDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtaW1hZ2VcIiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDEycHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj48dmlkZW8gc3JjPVwiJHthZC5tZWRpYVNyY31cIiBjb250cm9scyBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgbWF4LWhlaWdodDogMzAwcHg7IGJvcmRlci1yYWRpdXM6IDZweDsgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKTtcIj48L3ZpZGVvPjwvZGl2PmBcclxuICAgICAgICAgIDogKGFkLm1lZGlhVHlwZSA9PT0gJ2ltYWdlJyA/IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWltYWdlXCIgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxMnB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+PGltZyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBtYXgtaGVpZ2h0OiAzMDBweDsgYm9yZGVyLXJhZGl1czogNnB4OyBib3gtc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpO1wiPjwvZGl2PmAgOiAnJylcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWNvcHktaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1sYWJlbFwiPkFkIENvcHk8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1jb3B5LWJ0blwiIFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtY29weS10ZXh0PVwiJHtlbmNvZGVVUklDb21wb25lbnQoYWQuYWRUZXh0IHx8ICcnKX1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtdXJsPVwiJHtlbmNvZGVVUklDb21wb25lbnQoY2FtcGFpZ24udXJsKX1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtY2FtcGFpZ24tZHVyYXRpb249XCIke2NhbXBhaWduLmNhbXBhaWduRHVyYXRpb25EYXlzfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jYW1wYWlnbi1hZHM9XCIke2NhbXBhaWduLmFkc0NvdW50fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1saWItaWQ9XCIke2FkLmxpYnJhcnlJZH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtYWQtZHVyYXRpb249XCIke2FkLmR1cmF0aW9ufVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1kYXRlcz1cIiR7Zm9ybWF0RGF0ZShhZC5zdGFydGluZ0RhdGUpfSDigJQgJHtmb3JtYXREYXRlKGFkLmVuZERhdGUpfVwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICDwn5OLIENvcHlcclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weVwiPiR7YWQuYWRUZXh0IHx8ICdbTm8gY29weSBhdmFpbGFibGVdJ308L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29udGVudCArPSBgPC9kaXY+YDtcclxuICAgIHNob3dNb2RhbChjb250ZW50LCBgJHtjYW1wYWlnbi51cmx9IGAsIGAke2NhbXBhaWduLmFkc0NvdW50fSB0b3RhbCBhZHMg4oCiICR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9IGRheXMgYWN0aXZlYCk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gRGF0YSBNYW5hZ2VtZW50IC0tLVxyXG5cclxuICBmdW5jdGlvbiBkb3dubG9hZERhdGEoKSB7XHJcbiAgICAvLyBHZW5lcmF0ZSBmaWxlbmFtZSBwcm9wZXJ0aWVzXHJcbiAgICBjb25zdCBhZHZlcnRpc2VyID0gKHN0YXRlLm1ldGFkYXRhPy5hZHZlcnRpc2VyTmFtZSB8fCAnZmJfYWRzX2FuYWx5c2lzJylcclxuICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxyXG4gICAgICAucmVwbGFjZSgvKF4tfC0kKS9nLCAnJyk7XHJcblxyXG4gICAgY29uc3QgY291bnQgPSBzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBkYXRlIHJhbmdlIGZyb20gYWxsIGNhbXBhaWduc1xyXG4gICAgbGV0IG1pbkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IG1heERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgaWYgKGMuZmlyc3RBZHZlcnRpc2VkIDwgbWluRGF0ZSkgbWluRGF0ZSA9IGMuZmlyc3RBZHZlcnRpc2VkO1xyXG4gICAgICBpZiAoYy5sYXN0QWR2ZXJ0aXNlZCA+IG1heERhdGUpIG1heERhdGUgPSBjLmxhc3RBZHZlcnRpc2VkO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGVscGVyIGZvciBkYXRlIGZvcm1hdHRpbmcgbGlrZSBcImphbi0xLTIwMjVcIlxyXG4gICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkKSA9PiB7XHJcbiAgICAgIGNvbnN0IG0gPSBbXCJqYW5cIiwgXCJmZWJcIiwgXCJtYXJcIiwgXCJhcHJcIiwgXCJtYXlcIiwgXCJqdW5cIiwgXCJqdWxcIiwgXCJhdWdcIiwgXCJzZXBcIiwgXCJvY3RcIiwgXCJub3ZcIiwgXCJkZWNcIl07XHJcbiAgICAgIHJldHVybiBgJHttW2QuZ2V0TW9udGgoKV19IC0ke2QuZ2V0RGF0ZSgpfSAtJHtkLmdldEZ1bGxZZWFyKCl9IGA7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0U3RyID0gZm9ybWF0RGF0ZShtaW5EYXRlKTtcclxuICAgIGNvbnN0IGVuZFN0ciA9IGZvcm1hdERhdGUobWF4RGF0ZSk7XHJcblxyXG4gICAgLy8gRmlsZW5hbWU6IHBlbmctam9vbi1mYi1hZHMtOC1jYW1wYWlnbnMtZnJvbS1qYW4tMS0yMDI1LXRvLWRlYy0yNC0yMDI1Lmpzb25cclxuICAgIGNvbnN0IGZpbGVuYW1lID0gYCR7YWR2ZXJ0aXNlcn0gLWZiIC0gYWRzIC0gJHtjb3VudH0gLWNhbXBhaWducyAtIGZyb20gLSAke3N0YXJ0U3RyfSAtdG8gLSAke2VuZFN0cn0uanNvbmA7XHJcblxyXG4gICAgY29uc3QgZGF0YVN0ciA9IFwiZGF0YTp0ZXh0L2pzb247Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgIGNhbXBhaWduczogc3RhdGUucmF3Q2FtcGFpZ25zLFxyXG4gICAgICBhbGxBZHM6IHN0YXRlLmFsbEFkcyxcclxuICAgICAgbWV0YWRhdGE6IHN0YXRlLm1ldGFkYXRhIHx8IHsgYWR2ZXJ0aXNlck5hbWU6IGFkdmVydGlzZXIgfSwgLy8gRmFsbGJhY2sgbWV0YWRhdGFcclxuICAgICAgYWlBbmFseXNpc1Jlc3VsdDogc3RhdGUuYWlBbmFseXNpc1Jlc3VsdCB8fCBudWxsXHJcbiAgICB9LCBudWxsLCAyKSk7XHJcblxyXG4gICAgY29uc3QgZG93bmxvYWRBbmNob3JOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgZGF0YVN0cik7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb3dubG9hZEFuY2hvck5vZGUpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLmNsaWNrKCk7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUucmVtb3ZlKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVGaWxlSW1wb3J0KGV2ZW50KSB7XHJcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzWzBdO1xyXG4gICAgaWYgKCFmaWxlKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGUudGFyZ2V0LnJlc3VsdCk7XHJcbiAgICAgICAgaWYgKCFqc29uLmNhbXBhaWducykgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmb3JtYXRcIik7XHJcbiAgICAgICAgbG9hZEltcG9ydGVkRGF0YShqc29uKTtcclxuICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIGltcG9ydGluZyBmaWxlOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2FkSW1wb3J0ZWREYXRhKGltcG9ydGVkRGF0YSkge1xyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zID0gaW1wb3J0ZWREYXRhLmNhbXBhaWducyB8fCBbXTtcclxuICAgIHN0YXRlLmFsbEFkcyA9IGltcG9ydGVkRGF0YS5hbGxBZHMgfHwgW107XHJcbiAgICBzdGF0ZS5tZXRhZGF0YSA9IGltcG9ydGVkRGF0YS5tZXRhZGF0YSB8fCBudWxsO1xyXG4gICAgc3RhdGUuaXNJbXBvcnRlZCA9ICEhaW1wb3J0ZWREYXRhLmlzSW1wb3J0ZWQ7XHJcbiAgICBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0ID0gaW1wb3J0ZWREYXRhLmFpQW5hbHlzaXNSZXN1bHQgfHwgbnVsbDtcclxuXHJcbiAgICAvLyBIaWRlIERvd25sb2FkIEJ1dHRvbiBpZiBpbXBvcnRlZFxyXG4gICAgY29uc3QgZG93bmxvYWRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNEb3dubG9hZEJ0bicpO1xyXG4gICAgaWYgKHN0YXRlLmlzSW1wb3J0ZWQpIHtcclxuICAgICAgZG93bmxvYWRCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvd25sb2FkQnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWZsZXgnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBhcnNlIGRhdGVzXHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgYy5maXJzdEFkdmVydGlzZWQgPSBuZXcgRGF0ZShjLmZpcnN0QWR2ZXJ0aXNlZCk7XHJcbiAgICAgIGMubGFzdEFkdmVydGlzZWQgPSBuZXcgRGF0ZShjLmxhc3RBZHZlcnRpc2VkKTtcclxuICAgICAgaWYgKGMudG9wNSkge1xyXG4gICAgICAgIGMudG9wNS5mb3JFYWNoKGFkID0+IHtcclxuICAgICAgICAgIC8vIENoZWNrIGlmIGRhdGUgc3RyaW5ncyBvciBvYmplY3RzXHJcbiAgICAgICAgICBhZC5zdGFydGluZ0RhdGUgPSBuZXcgRGF0ZShhZC5zdGFydGluZ0RhdGUpO1xyXG4gICAgICAgICAgYWQuZW5kRGF0ZSA9IG5ldyBEYXRlKGFkLmVuZERhdGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJbml0aWFsIFNvcnRcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5zb3J0KChhLCBiKSA9PiBuZXcgRGF0ZShiLmZpcnN0QWR2ZXJ0aXNlZCkgLSBuZXcgRGF0ZShhLmZpcnN0QWR2ZXJ0aXNlZCkpO1xyXG5cclxuXHJcblxyXG4gICAgdXBkYXRlVmlldygpO1xyXG4gICAgc2hvd092ZXJsYXkoKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBBSSBMb2dpYyAoQ1NQIEZpeGVkKSAtLS1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gYW5hbHl6ZVdpdGhBSSgpIHtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuICAgIGNvbnN0IHJlc3VsdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FJUmVzdWx0Jyk7XHJcblxyXG4gICAgaWYgKCFzdGF0ZS5haUNvbmZpZyB8fCAhc3RhdGUuYWlDb25maWcuYXBpS2V5KSB7XHJcbiAgICAgIGFsZXJ0KCdBSSBDb25maWd1cmF0aW9uIG1pc3NpbmcuIFBsZWFzZSBjaGVjayBkYXRhYmFzZSBzZXR0aW5ncy4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXppbmcuLi4nO1xyXG4gICAgcmVzdWx0RGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgLy8gQ29sbGVjdCBhbGwgYWQgdGV4dHNcclxuICAgIGxldCBhbGxBZFRleHRzID0gW107XHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgaWYgKGMudG9wNSkge1xyXG4gICAgICAgIGMudG9wNS5mb3JFYWNoKGFkID0+IHtcclxuICAgICAgICAgIGlmIChhZC5hZFRleHQgJiYgYWQuYWRUZXh0Lmxlbmd0aCA+IDEwKSB7XHJcbiAgICAgICAgICAgIGFsbEFkVGV4dHMucHVzaChhZC5hZFRleHQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBhbmQgbGltaXRcclxuICAgIGFsbEFkVGV4dHMgPSBbLi4ubmV3IFNldChhbGxBZFRleHRzKV0uc2xpY2UoMCwgNTApO1xyXG5cclxuICAgIGlmIChhbGxBZFRleHRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBhbGVydCgnTm8gYWQgdGV4dCBjb250ZW50IGZvdW5kIHRvIGFuYWx5emUuJyk7XHJcbiAgICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXplIHdpdGggQUknO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gc3RhdGUuYWlDb25maWcuc3lzdGVtUHJvbXB0IHx8IFwiWW91IGFyZSBhbiBleHBlcnQgbWFya2V0aW5nIGFuYWx5c3QuIEFuYWx5emUgdGhlc2UgRmFjZWJvb2sgYWQgY29waWVzIGFuZCBpZGVudGlmeSBjb21tb24gaG9va3MsIHBhaW4gcG9pbnRzIGFkZHJlc3NlZCwgYW5kIENUQXMgdXNlZC4gUHJvdmlkZSBhIGNvbmNpc2UgYnVsbGV0ZWQgc3VtbWFyeSBvZiB0aGUgc3RyYXRlZ3kuXCI7XHJcbiAgICBjb25zdCB1c2VyQ29udGVudCA9IFwiQW5hbHl6ZSB0aGUgZm9sbG93aW5nIGFkIGNvcGllczpcXG5cXG5cIiArIGFsbEFkVGV4dHMuam9pbihcIlxcblxcbi0tLVxcblxcblwiKTtcclxuXHJcbiAgICAvLyBEZWZpbmUgcmVzcG9uc2UgaGFuZGxlclxyXG4gICAgY29uc3QgaGFuZGxlUmVzcG9uc2UgPSAoZSkgPT4ge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGUuZGV0YWlsO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmYkFkc0FuYWx5emVSZXNwb25zZScsIGhhbmRsZVJlc3BvbnNlKTtcclxuXHJcbiAgICAgIC8vIFJlLXF1ZXJ5IGVsZW1lbnRzIHRvIGVuc3VyZSB3ZSBpbnRlcmFjdCB3aXRoIHRoZSBjdXJyZW50IERPTSAodmlldyBtaWdodCBoYXZlIHJlZnJlc2hlZClcclxuICAgICAgY29uc3QgY3VycmVudFJlc3VsdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FJUmVzdWx0Jyk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBbmFseXplQnRuJyk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIC8vIE1hcmtkb3duIGNvbnZlcnNpb24gc2ltcGxlIHJlcGxhY2VtZW50IGZvciBib2xkL25ld2xpbmVzIGlmIG5lZWRlZCwgXHJcbiAgICAgICAgLy8gYnV0IGlubmVySFRNTCBwcmVzZXJ2ZXMgYmFzaWMgZm9ybWF0dGluZyBtb3N0bHkuXHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gcmVzcG9uc2UuYW5hbHlzaXMucmVwbGFjZSgvXFxuL2csICc8YnI+JykucmVwbGFjZSgvXFwqXFwqKC4qPylcXCpcXCovZywgJzxzdHJvbmc+JDE8L3N0cm9uZz4nKTtcclxuICAgICAgICBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0ID0gZm9ybWF0dGVkOyAvLyBTYXZlIHN0YXRlXHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50UmVzdWx0RGl2KSB7XHJcbiAgICAgICAgICBjb25zdCBjb250ZW50RGl2ID0gY3VycmVudFJlc3VsdERpdi5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLWNvbnRlbnQnKTtcclxuICAgICAgICAgIGlmIChjb250ZW50RGl2KSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnREaXYuaW5uZXJIVE1MID0gZm9ybWF0dGVkO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gRmFsbGJhY2sgaWYgc3RydWN0dXJlIGlzIHNvbWVob3cgbWlzc2luZ1xyXG4gICAgICAgICAgICBjdXJyZW50UmVzdWx0RGl2LmlubmVySFRNTCA9IGA8c3Ryb25nPvCfpJYgQUkgQW5hbHlzaXM6PC9zdHJvbmc+IDxicj48YnI+JHtmb3JtYXR0ZWR9YDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGN1cnJlbnRSZXN1bHREaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gcmVzcG9uc2UgPyAocmVzcG9uc2UuZXJyb3IgfHwgJ1Vua25vd24gZXJyb3InKSA6ICdVbmtub3duIGVycm9yJztcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdBSSBBbmFseXNpcyBmYWlsZWQ6JywgZXJyb3JNc2cpO1xyXG4gICAgICAgIGFsZXJ0KCdBbmFseXNpcyBmYWlsZWQ6ICcgKyBlcnJvck1zZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjdXJyZW50QnRuKSB7XHJcbiAgICAgICAgY3VycmVudEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN1cnJlbnRCdG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXplIHdpdGggQUknO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIExpc3RlbiBmb3IgcmVzcG9uc2VcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzQW5hbHl6ZVJlc3BvbnNlJywgaGFuZGxlUmVzcG9uc2UpO1xyXG5cclxuICAgIC8vIERpc3BhdGNoIHJlcXVlc3QgdG8gY29udGVudCBzY3JpcHQgLT4gYmFja2dyb3VuZFxyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gRGlzcGF0Y2hpbmcgQUkgYW5hbHlzaXMgcmVxdWVzdCcpO1xyXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2ZiQWRzQW5hbHl6ZVJlcXVlc3QnLCB7XHJcbiAgICAgIGRldGFpbDoge1xyXG4gICAgICAgIGFwaUtleTogc3RhdGUuYWlDb25maWcuYXBpS2V5LFxyXG4gICAgICAgIHN5c3RlbVByb21wdDogc3lzdGVtUHJvbXB0LFxyXG4gICAgICAgIHVzZXJDb250ZW50OiB1c2VyQ29udGVudFxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgLy8gRmFsbGJhY2svVGltZW91dCBjbGVhbnVwXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgLy8gUmUtcXVlcnkgYnRuIGZvciB0aW1lb3V0IGNoZWNrXHJcbiAgICAgIGNvbnN0IGN1cnJlbnRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBbmFseXplQnRuJyk7XHJcbiAgICAgIGlmIChjdXJyZW50QnRuICYmIGN1cnJlbnRCdG4uZGlzYWJsZWQgJiYgY3VycmVudEJ0bi50ZXh0Q29udGVudCA9PT0gJ/CfpJYgQW5hbHl6aW5nLi4uJykge1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZiQWRzQW5hbHl6ZVJlc3BvbnNlJywgaGFuZGxlUmVzcG9uc2UpO1xyXG4gICAgICAgIGN1cnJlbnRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBjdXJyZW50QnRuLnRleHRDb250ZW50ID0gJ/CfpJYgQW5hbHl6ZSB3aXRoIEFJJztcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1tGQiBBZHMgVmlzdWFsaXplcl0gQUkgcmVxdWVzdCB0aW1lZCBvdXQnKTtcclxuICAgICAgfVxyXG4gICAgfSwgNjAwMDApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIC0tLSBFdmVudCBCcmlkZ2UgLS0tXHJcblxyXG4gIC8vIExpc3RlbiBmb3IgaW1wb3J0ZWQgZGF0YSB2aWEgQ3VzdG9tRXZlbnQgKGZyb20gaW5qZWN0ZWQuanMpXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNJbXBvcnREYXRhJywgKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBSZWNlaXZlZCBpbXBvcnRlZCBkYXRhIHZpYSBDdXN0b21FdmVudCcpO1xyXG4gICAgbG9hZEltcG9ydGVkRGF0YShldmVudC5kZXRhaWwpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIHJlb3BlbiByZXF1ZXN0XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNSZW9wZW4nLCAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBSZW9wZW5pbmcgb3ZlcmxheScpO1xyXG4gICAgc2hvd092ZXJsYXkoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciBBSSBDb25maWdcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc0NvbmZpZycsIChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUmVjZWl2ZWQgQUkgQ29uZmlnJyk7XHJcbiAgICBzdGF0ZS5haUNvbmZpZyA9IGV2ZW50LmRldGFpbDtcclxuICAgIHVwZGF0ZVZpZXcoKTsgLy8gUmUtcmVuZGVyIHRvIHNob3cgQUkgYnV0dG9uIGlmIG5lZWRlZFxyXG4gIH0pO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIFNjcmFwaW5nIFN0YXR1c1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzU3RhdHVzJywgKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zdCB7IHNjcm9sbGluZywgYWRzRm91bmQsIG1lc3NhZ2UgfSA9IGV2ZW50LmRldGFpbDtcclxuXHJcbiAgICAvLyBFbnN1cmUgb3ZlcmxheSBpcyB2aXNpYmxlIGJ1dCBtaW5pbWl6ZWRcclxuICAgIGlmIChzY3JvbGxpbmcpIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdtaW5pbWl6ZWQnKTtcclxuICAgICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1pbkJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01pbmltaXplZEJhcicpO1xyXG4gICAgY29uc3QgaWNvbiA9IG1pbkJhci5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLW1pbmktaWNvbicpO1xyXG4gICAgY29uc3QgdGV4dCA9IG1pbkJhci5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLW1pbmktdGV4dCcpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWF4aW1pemVCdG4nKTtcclxuXHJcbiAgICBpZiAoc2Nyb2xsaW5nKSB7XHJcbiAgICAgIGljb24uaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwiZmItYWRzLW1pbmktc3Bpbm5lclwiPvCflIQ8L3NwYW4+JztcclxuICAgICAgdGV4dC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XHJcbiAgICAgIC8vIG1pbkJhci5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byByaWdodCwgI2Y1OWUwYiwgI2Q5NzcwNiknOyAvLyBSZW1vdmVkIHRvIG1hdGNoIHN0eWxpbmdcclxuICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IC8vIEhpZGUgXCJTaG93XCIgYnV0dG9uIHdoaWxlIHNjcmFwaW5nXHJcblxyXG4gICAgICAvLyBBZGQgc3Bpbm5lciBzdHlsZSBpZiBub3QgZXhpc3RzXHJcbiAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWluaVNwaW5uZXJTdHlsZScpKSB7XHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgIHN0eWxlLmlkID0gJ2ZiQWRzTWluaVNwaW5uZXJTdHlsZSc7XHJcbiAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSBgXHJcbiAgICAgIEBrZXlmcmFtZXMgZmJBZHNTcGluIHsxMDAgJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH19XHJcbiAgICAgIC5mYi1hZHMtbWluaS1zcGlubmVyIHtkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGFuaW1hdGlvbjogZmJBZHNTcGluIDFzIGxpbmVhciBpbmZpbml0ZTsgfVxyXG4gICAgICBgO1xyXG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBEb25lXHJcbiAgICAgIGljb24uaW5uZXJIVE1MID0gYDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIHN0eWxlPVwid2lkdGg6IDI0cHg7IGhlaWdodDogMjRweDsgYm9yZGVyLXJhZGl1czogNTAlOyBvYmplY3QtZml0OiBjb3ZlcjtcIj5gO1xyXG4gICAgICB0ZXh0LnRleHRDb250ZW50ID0gJ0FuYWx5c2lzIFJlYWR5ISc7XHJcbiAgICAgIG1pbkJhci5zdHlsZS5iYWNrZ3JvdW5kID0gJyc7IC8vIFJldmVydCB0byBkZWZhdWx0IGJsdWUvcHVycGxlXHJcbiAgICAgIGJ0bi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gRXhwb3NlIHJlb3BlbiBoZWxwZXJcclxuICB3aW5kb3cuZmJBZHNSZW9wZW5PdmVybGF5ID0gc2hvd092ZXJsYXk7XHJcblxyXG4gIC8vIENoZWNrIGZvciBwcmUtaW5qZWN0ZWQgZGF0YSAoZnJvbSBmaWxlIGltcG9ydClcclxuICBjb25zdCBwcmVJbmplY3RlZERhdGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRlZERhdGEnKTtcclxuICBpZiAocHJlSW5qZWN0ZWREYXRhKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShwcmVJbmplY3RlZERhdGEudGV4dENvbnRlbnQpO1xyXG4gICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBGb3VuZCBwcmUtaW5qZWN0ZWQgZGF0YSwgbG9hZGluZy4uLicpO1xyXG4gICAgICBsb2FkSW1wb3J0ZWREYXRhKGpzb24pO1xyXG4gICAgICAvLyBDbGVhbiB1cFxyXG4gICAgICBwcmVJbmplY3RlZERhdGEucmVtb3ZlKCk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGQiBBZHMgVmlzdWFsaXplcl0gRXJyb3IgbG9hZGluZyBwcmUtaW5qZWN0ZWQgZGF0YTonLCBl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

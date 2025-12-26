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
    const endOfMaxDateMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    const renderMax = new Date(Math.min(maxDate.getTime() + padding, endOfMaxDateMonth.getTime() + dayMs));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXplci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Zpc3VhbGl6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogRmFjZWJvb2sgQWRzIEFuYWx5emVyIC0gVmlzdWFsaXplciBTY3JpcHQgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgY29uc29sZS5sb2coJ1tGQiBBZHMgQW5hbHl6ZXJdIFZpc3VhbGl6ZXIgc2NyaXB0IGxvYWRlZCcpO1xyXG5cclxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50XHJcbiAgY29uc3Qgc3RhdGUgPSB7XHJcbiAgICByYXdDYW1wYWlnbnM6IFtdLFxyXG4gICAgcHJvY2Vzc2VkQ2FtcGFpZ25zOiBbXSxcclxuICAgIGFsbEFkczogW10sXHJcbiAgICBmaWx0ZXJEb21haW46ICdhbGwnLFxyXG4gICAgZmlsdGVyVGV4dDogJycsXHJcbiAgICBmaWx0ZXJTb3J0OiAncmVjZW50JywgLy8gJ3JlY2VudCcsICdkdXJhdGlvbicsICdhZHMnXHJcbiAgICBncm91cEJ5RG9tYWluOiBmYWxzZSxcclxuICAgIGlzTWluaW1pemVkOiB0cnVlLFxyXG4gICAgY3VycmVudFZpZXc6ICd0aW1lbGluZScsIC8vICd0aW1lbGluZScsICd0b3A1LXRleHQnLCAnYWxsLWNvcHknXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBhaUNvbmZpZzogbnVsbCxcclxuICAgIGlzQW5hbHl6aW5nOiBmYWxzZSxcclxuICAgIGFpQ29uZmlnOiBudWxsLFxyXG4gICAgbWV0YWRhdGE6IG51bGwsXHJcbiAgICBzb3J0RGlyZWN0aW9uOiAnYXNjJywgLy8gJ2FzYycgb3IgJ2Rlc2MnXHJcbiAgICBpc0ltcG9ydGVkOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIC8vIENvbG9yIEhlbHBlclxyXG4gIGZ1bmN0aW9uIGdldEFkQ291bnRDb2xvcihjb3VudCkge1xyXG4gICAgaWYgKGNvdW50ID49IDEwMCkgcmV0dXJuICcjZWY0NDQ0JzsgLy8gUmVkXHJcbiAgICBpZiAoY291bnQgPj0gNTApIHJldHVybiAnI2Y5NzMxNic7ICAvLyBPcmFuZ2VcclxuICAgIGlmIChjb3VudCA+PSAyMCkgcmV0dXJuICcjZWFiMzA4JzsgIC8vIFllbGxvd1xyXG4gICAgaWYgKGNvdW50ID49IDEwKSByZXR1cm4gJyMyMmM1NWUnOyAgLy8gR3JlZW5cclxuICAgIGlmIChjb3VudCA+PSA1KSByZXR1cm4gJyMzYjgyZjYnOyAgIC8vIEJsdWVcclxuICAgIHJldHVybiAnIzhiNWNmNic7ICAgICAgICAgICAgICAgICAgIC8vIFB1cnBsZVxyXG4gIH1cclxuXHJcbiAgLy8gR2V0IGxvZ28gVVJMIGZyb20gY29uZmlnIGVsZW1lbnQgKHNldCBieSBjb250ZW50LmpzKVxyXG4gIGNvbnN0IGNvbmZpZ0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ29uZmlnJyk7XHJcbiAgY29uc3QgbG9nb1VybCA9IGNvbmZpZ0VsPy5kYXRhc2V0Py5sb2dvVXJsIHx8ICcnO1xyXG5cclxuICAvLyBDcmVhdGUgdGhlIGZsb2F0aW5nIG92ZXJsYXlcclxuICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgb3ZlcmxheS5pZCA9ICdmYkFkc0FuYWx5emVyT3ZlcmxheSc7XHJcbiAgb3ZlcmxheS5jbGFzc05hbWUgPSAnaGlkZGVuIG1pbmltaXplZCc7XHJcbiAgb3ZlcmxheS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaW1pemVkLWJhclwiIGlkPVwiZmJBZHNNaW5pbWl6ZWRCYXJcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktY29udGVudFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pLWljb25cIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogMjRweDsgaGVpZ2h0OiAyNHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyO1wiPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktdGV4dFwiPkZhY2Vib29rIEFkcyBDYW1wYWlnbiBBbmFseXplcjwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1taW5pLWJ0blwiIGlkPVwiZmJBZHNNYXhpbWl6ZUJ0blwiPlNob3c8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYW5hbHl6ZXItY29udGFpbmVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1wYW5lbFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDtcIj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAyNHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogNDBweDsgaGVpZ2h0OiA0MHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyOyBib3JkZXI6IDFweCBzb2xpZCAjZTVlN2ViO1wiPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8aDE+RmFjZWJvb2sgQWRzIENhbXBhaWduIEFuYWx5emVyPC9oMT5cclxuICAgICAgICAgICAgICAgIDxwIGlkPVwiZmJBZHNTdWJ0aXRsZVwiPlRpbWVsaW5lICYgQ2FtcGFpZ24gQW5hbHlzaXM8L3A+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWhlYWRlci1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYnRuXCIgaWQ9XCJmYkFkc01pbmltaXplQnRuXCIgdGl0bGU9XCJNaW5pbWl6ZVwiPl88L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWhlYWRlci1idG5cIiBpZD1cImZiQWRzQ2xvc2VCdG5cIiB0aXRsZT1cIkNsb3NlXCI+w5c8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sc1wiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtcm93XCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IHdpZHRoOiAxMDAlOyBhbGlnbi1pdGVtczogY2VudGVyOyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogMTJweDtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6ICMzNzQxNTE7XCI+Vmlldzo8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZSBhY3RpdmVcIiBkYXRhLXZpZXc9XCJ0aW1lbGluZVwiPvCfk4ogVGltZWxpbmU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS12aWV3PVwidG9wNS10ZXh0XCI+8J+PhiBUb3AgNSBUZXh0PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDUwMDsgZm9udC1zaXplOiAxM3B4OyBjb2xvcjogIzM3NDE1MTtcIj5Tb3J0Ojwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lIGFjdGl2ZVwiIGRhdGEtc29ydD1cInJlY2VudFwiPlN0YXJ0IERhdGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS1zb3J0PVwiZHVyYXRpb25cIj5EdXJhdGlvbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXNvcnQ9XCJhZHNcIj4jIG9mIEFkczwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBpZD1cImZiQWRzR3JvdXBEb21haW5CdG5cIiB0aXRsZT1cIkdyb3VwIGNhbXBhaWducyBieSBkb21haW5cIj7wn5OCIEdyb3VwIGJ5IERvbWFpbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiIHN0eWxlPVwiZmxleDogMTsgbWF4LXdpZHRoOiAzMDBweDtcIj5cclxuICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiZmJBZHNGaWx0ZXJJbnB1dFwiIGNsYXNzPVwiZmItYWRzLWlucHV0XCIgcGxhY2Vob2xkZXI9XCLwn5SNIEZpbHRlciBjYW1wYWlnbnMuLi5cIiBzdHlsZT1cIndpZHRoOiAxMDAlO1wiPlxyXG4gICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiBhdXRvO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCIgaWQ9XCJmYkFkc0Rvd25sb2FkQnRuXCI+8J+SviBEb3dubG9hZCBEYXRhPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIiBpZD1cImZiQWRzSW1wb3J0QnRuXCI+8J+TgiBJbXBvcnQgRGF0YTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZmlsZVwiIGlkPVwiZmJBZHNJbXBvcnRJbnB1dFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBhY2NlcHQ9XCIuanNvblwiPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZFwiIGlkPVwiZmJBZHNUaW1lbGluZUxlZ2VuZFwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgd2lkdGg6IDEwMCU7IGdhcDogMTZweDsgcGFkZGluZzogMTJweCAyNHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2U1ZTdlYjsgYmFja2dyb3VuZDogI2ZhZmFmYTtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogIzhiNWNmNjtcIj48L2Rpdj4gMS00IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjM2I4MmY2O1wiPjwvZGl2PiA1LTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICMyMmM1NWU7XCI+PC9kaXY+IDEwLTE5IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZWFiMzA4O1wiPjwvZGl2PiAyMC00OSBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2Y5NzMxNjtcIj48L2Rpdj4gNTAtOTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICNlZjQ0NDQ7XCI+PC9kaXY+IDEwMCsgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gIFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jaGFydC1jb250YWluZXJcIiBpZD1cImZiQWRzQ2hhcnRDb250ZW50XCI+XHJcbiAgICAgICAgICAgICA8IS0tIER5bmFtaWMgQ29udGVudCAtLT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgXHJcbiAgICAgIDwhLS0gTW9kYWwgQ29udGFpbmVyIC0tPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsLW92ZXJsYXlcIiBpZD1cImZiQWRzTW9kYWxPdmVybGF5XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC10aXRsZVwiPlxyXG4gICAgICAgICAgICAgIDxoMiBpZD1cImZiQWRzTW9kYWxUaXRsZVwiPkNhbXBhaWduIERldGFpbHM8L2gyPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwiZmItYWRzLW1vZGFsLW1ldGFcIiBpZD1cImZiQWRzTW9kYWxNZXRhXCI+dXJsLi4uPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1tb2RhbC1jbG9zZVwiIGlkPVwiZmJBZHNNb2RhbENsb3NlXCI+w5c8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1ib2R5XCIgaWQ9XCJmYkFkc01vZGFsQm9keVwiPlxyXG4gICAgICAgICAgICAgPCEtLSBEZXRhaWxzIC0tPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcclxuXHJcbiAgLy8gVG9vbHRpcFxyXG4gIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICB0b29sdGlwLmNsYXNzTmFtZSA9ICdmYi1hZHMtdG9vbHRpcCc7XHJcbiAgb3ZlcmxheS5hcHBlbmRDaGlsZCh0b29sdGlwKTtcclxuXHJcbiAgLy8gLS0tIEV2ZW50IExpc3RlbmVycyAtLS1cclxuXHJcbiAgLy8gSGVhZGVyIEFjdGlvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDbG9zZUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZU92ZXJsYXkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01pbmltaXplQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNaW5pbWl6ZSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWF4aW1pemVCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZWRCYXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuXHJcbiAgLy8gTW9kYWwgQWN0aW9uc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsQ2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVNb2RhbCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxPdmVybGF5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmlkID09PSAnZmJBZHNNb2RhbE92ZXJsYXknKSBoaWRlTW9kYWwoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTWFpbiBBY3Rpb25zXHJcblxyXG5cclxuICAvLyBNYWluIEFjdGlvbnNcclxuICBjb25zdCBmaWx0ZXJJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ZpbHRlcklucHV0Jyk7XHJcbiAgZmlsdGVySW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xyXG4gICAgc3RhdGUuZmlsdGVyVGV4dCA9IGUudGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB1cGRhdGVWaWV3KCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0Rvd25sb2FkQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkb3dubG9hZERhdGEpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydEJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzSW1wb3J0SW5wdXQnKS5jbGljaygpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydElucHV0JykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlRmlsZUltcG9ydCk7XHJcblxyXG5cclxuICAvLyBWaWV3IFN3aXRjaGVyXHJcbiAgY29uc3Qgdmlld0J1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS12aWV3XScpO1xyXG4gIHZpZXdCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIHZpZXdCdXR0b25zLmZvckVhY2goYiA9PiBiLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTtcclxuICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgIHN0YXRlLmN1cnJlbnRWaWV3ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXZpZXcnKTtcclxuXHJcbiAgICAgIGNvbnN0IGxlZ2VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1RpbWVsaW5lTGVnZW5kJyk7XHJcbiAgICAgIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RpbWVsaW5lJykge1xyXG4gICAgICAgIGxlZ2VuZC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZ2VuZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZVZpZXcoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBTb3J0IFN3aXRjaGVyXHJcbiAgY29uc3Qgc29ydEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zb3J0XScpO1xyXG5cclxuICAvLyBIZWxwZXIgdG8gdXBkYXRlIGJ1dHRvbiBsYWJlbHNcclxuICBjb25zdCB1cGRhdGVTb3J0QnV0dG9ucyA9ICgpID0+IHtcclxuICAgIHNvcnRCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgY29uc3Qgc29ydFR5cGUgPSBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLXNvcnQnKTtcclxuICAgICAgbGV0IGxhYmVsID0gYnRuLmlubmVyVGV4dC5yZXBsYWNlKC8gW+KGkeKGk10vLCAnJyk7IC8vIENsZWFuIGV4aXN0aW5nIGFycm93XHJcblxyXG4gICAgICBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gc29ydFR5cGUpIHtcclxuICAgICAgICBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgLy8gQWRkIGFycm93XHJcbiAgICAgICAgbGFiZWwgKz0gc3RhdGUuc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyAnIOKGkScgOiAnIOKGkyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xyXG4gICAgICB9XHJcbiAgICAgIGJ0bi5pbm5lclRleHQgPSBsYWJlbDtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHNvcnRCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRhcmdldFNvcnQgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29ydCcpO1xyXG5cclxuICAgICAgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09IHRhcmdldFNvcnQpIHtcclxuICAgICAgICAvLyBUb2dnbGUgZGlyZWN0aW9uXHJcbiAgICAgICAgc3RhdGUuc29ydERpcmVjdGlvbiA9IHN0YXRlLnNvcnREaXJlY3Rpb24gPT09ICdhc2MnID8gJ2Rlc2MnIDogJ2FzYyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gTmV3IHNvcnQ6IERlZmF1bHQgdG8gJ2Rlc2MnIGZvciBldmVyeXRoaW5nPyBcclxuICAgICAgICAvLyBVc3VhbGx5ICdTdGFydCBEYXRlJyB1c2VycyBtaWdodCB3YW50IE9sZGVzdCBGaXJzdCAoQXNjKSBvciBOZXdlc3QgRmlyc3QgKERlc2MpLlxyXG4gICAgICAgIC8vIExldCdzIGRlZmF1bHQgdG8gJ2Rlc2MnIChIaWdoL05ld2VzdCkgYXMgc3RhbmRhcmQsIGJ1dCBtYXliZSAnYXNjJyBmb3IgRGF0ZT9cclxuICAgICAgICAvLyBUaGUgb3JpZ2luYWwgY29kZSBoYWQgZGVmYXVsdCBEYXRlIGFzIEFzYyAoT2xkZXN0IGZpcnN0KS5cclxuICAgICAgICBpZiAodGFyZ2V0U29ydCA9PT0gJ3JlY2VudCcpIHtcclxuICAgICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSAnYXNjJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhdGUuc29ydERpcmVjdGlvbiA9ICdkZXNjJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUuZmlsdGVyU29ydCA9IHRhcmdldFNvcnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHVwZGF0ZVNvcnRCdXR0b25zKCk7XHJcbiAgICAgIHVwZGF0ZVZpZXcoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbml0IGJ1dHRvbiBsYWJlbHNcclxuICB1cGRhdGVTb3J0QnV0dG9ucygpO1xyXG5cclxuICAvLyBHcm91cCBieSBEb21haW5cclxuICBjb25zdCBncm91cEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0dyb3VwRG9tYWluQnRuJyk7XHJcbiAgZ3JvdXBCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzdGF0ZS5ncm91cEJ5RG9tYWluID0gIXN0YXRlLmdyb3VwQnlEb21haW47XHJcbiAgICBncm91cEJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcclxuICAgIHVwZGF0ZVZpZXcoKTtcclxuICB9KTtcclxuXHJcblxyXG4gIC8vIC0tLSBGdW5jdGlvbnMgLS0tXHJcblxyXG4gIGZ1bmN0aW9uIHNob3dPdmVybGF5KCkge1xyXG4gICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnbWluaW1pemVkJyk7XHJcbiAgICBzdGF0ZS5pc01pbmltaXplZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGlkZU92ZXJsYXkoKSB7XHJcbiAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdG9nZ2xlTWluaW1pemUoZSkge1xyXG4gICAgaWYgKGUpIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBzdGF0ZS5pc01pbmltaXplZCA9ICFzdGF0ZS5pc01pbmltaXplZDtcclxuICAgIGlmIChzdGF0ZS5pc01pbmltaXplZCkge1xyXG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21pbmltaXplZCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdtaW5pbWl6ZWQnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3dNb2RhbChjb250ZW50SHRtbCwgdGl0bGUsIG1ldGEpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsVGl0bGUnKS5pbm5lclRleHQgPSB0aXRsZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsTWV0YScpLmlubmVyVGV4dCA9IG1ldGE7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbEJvZHknKS5pbm5lckhUTUwgPSBjb250ZW50SHRtbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsT3ZlcmxheScpLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICBzZXR1cENvcHlCdXR0b25zKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsQm9keScpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhpZGVNb2RhbCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsT3ZlcmxheScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb3B5UmljaFRleHQocGxhaW4sIGh0bWwpIHtcclxuICAgIGlmICh0eXBlb2YgQ2xpcGJvYXJkSXRlbSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICBjb25zdCB0ZXh0QmxvYiA9IG5ldyBCbG9iKFtwbGFpbl0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluXCIgfSk7XHJcbiAgICAgIGNvbnN0IGh0bWxCbG9iID0gbmV3IEJsb2IoW2h0bWxdLCB7IHR5cGU6IFwidGV4dC9odG1sXCIgfSk7XHJcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoW1xyXG4gICAgICAgIG5ldyBDbGlwYm9hcmRJdGVtKHtcclxuICAgICAgICAgIFwidGV4dC9wbGFpblwiOiB0ZXh0QmxvYixcclxuICAgICAgICAgIFwidGV4dC9odG1sXCI6IGh0bWxCbG9iXHJcbiAgICAgICAgfSlcclxuICAgICAgXSkuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiUmljaCBjb3B5IGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIHBsYWluOlwiLCBlcnIpO1xyXG4gICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHBsYWluKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwbGFpbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXR1cENvcHlCdXR0b25zKGNvbnRhaW5lcikge1xyXG4gICAgY29uc3QgY29weUJ0bnMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmZiLWFkcy1jb3B5LWJ0bicpO1xyXG4gICAgY29weUJ0bnMuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldDsgLy8gVXNlIGN1cnJlbnRUYXJnZXQgdG8gZW5zdXJlIHdlIGdldCB0aGUgYnV0dG9uLCBub3QgaWNvblxyXG4gICAgICAgIGNvbnN0IHJhd1RleHQgPSBkZWNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQuY29weVRleHQpO1xyXG5cclxuICAgICAgICAvLyBFeHRyYWN0IG1ldGFkYXRhIGlmIGF2YWlsYWJsZVxyXG4gICAgICAgIGNvbnN0IG1ldGEgPSB7XHJcbiAgICAgICAgICB1cmw6IHRhcmdldC5kYXRhc2V0LnVybCA/IGRlY29kZVVSSUNvbXBvbmVudCh0YXJnZXQuZGF0YXNldC51cmwpIDogJycsXHJcbiAgICAgICAgICBjYW1wYWlnbkR1cmF0aW9uOiB0YXJnZXQuZGF0YXNldC5jYW1wYWlnbkR1cmF0aW9uIHx8ICcnLFxyXG4gICAgICAgICAgY2FtcGFpZ25BZHM6IHRhcmdldC5kYXRhc2V0LmNhbXBhaWduQWRzIHx8ICcnLFxyXG4gICAgICAgICAgbGliSWQ6IHRhcmdldC5kYXRhc2V0LmFkTGliSWQgfHwgJycsXHJcbiAgICAgICAgICBhZER1cmF0aW9uOiB0YXJnZXQuZGF0YXNldC5hZER1cmF0aW9uIHx8ICcnLFxyXG4gICAgICAgICAgYWREYXRlczogdGFyZ2V0LmRhdGFzZXQuYWREYXRlcyB8fCAnJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENvbnN0cnVjdCBSaWNoIFRleHQgSFRNTFxyXG4gICAgICAgIGNvbnN0IHJpY2hUZXh0ID0gYFxyXG4gICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE0cHg7IGxpbmUtaGVpZ2h0OiAxLjU7IGNvbG9yOiAjMzc0MTUxO1wiPlxyXG4gICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+Q2FtcGFpZ246PC9zdHJvbmc+IDxhIGhyZWY9XCIke21ldGEudXJsfVwiPiR7bWV0YS51cmx9PC9hPjxicj5cclxuICAgICAgICAgICAgICAgICAgICAke21ldGEuY2FtcGFpZ25EdXJhdGlvbiA/IGA8c3Ryb25nPkR1cmF0aW9uOjwvc3Ryb25nPiAke21ldGEuY2FtcGFpZ25EdXJhdGlvbn0gZGF5c2AgOiAnJ30gXHJcbiAgICAgICAgICAgICAgICAgICAgJHttZXRhLmNhbXBhaWduQWRzID8gYOKAoiAke21ldGEuY2FtcGFpZ25BZHN9IGFkc2AgOiAnJ31cclxuICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxMnB4OyBwYWRkaW5nLWJvdHRvbTogMTJweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlNWU3ZWI7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5MaWJyYXJ5IElEOjwvc3Ryb25nPiA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2Fkcy9saWJyYXJ5Lz9pZD0ke21ldGEubGliSWR9XCI+JHttZXRhLmxpYklkfTwvYT48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5EYXRlczo8L3N0cm9uZz4gJHttZXRhLmFkRGF0ZXN9IHwgPHN0cm9uZz5BZCBEdXJhdGlvbjo8L3N0cm9uZz4gJHttZXRhLmFkRHVyYXRpb259IGRheXNcclxuICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAke3Jhd1RleHQucmVwbGFjZSgvXFxuL2csICc8YnI+Jyl9XHJcbiAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICAvLyBDb25zdHJ1Y3QgUGxhaW4gVGV4dCBGYWxsYmFja1xyXG4gICAgICAgIGNvbnN0IHBsYWluVGV4dCA9IGBDYW1wYWlnbjogJHttZXRhLnVybH1cXG5EdXJhdGlvbjogJHttZXRhLmNhbXBhaWduRHVyYXRpb259IGRheXMg4oCiICR7bWV0YS5jYW1wYWlnbkFkc30gYWRzXFxuXFxuTGlicmFyeSBJRDogJHttZXRhLmxpYklkfVxcbkRhdGVzOiAke21ldGEuYWREYXRlc30gfCBBZCBEdXJhdGlvbjogJHttZXRhLmFkRHVyYXRpb259IGRheXNcXG5cXG4tLS1cXG5cXG4ke3Jhd1RleHR9YDtcclxuXHJcbiAgICAgICAgLy8gVXNlIHJpY2ggdGV4dCBjb3B5IGhlbHBlclxyXG4gICAgICAgIGNvcHlSaWNoVGV4dChwbGFpblRleHQsIHJpY2hUZXh0KTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSB0YXJnZXQuaW5uZXJIVE1MO1xyXG4gICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSAn4pyFIENvcGllZCEnO1xyXG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gb3JpZ2luYWw7XHJcbiAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnc3VjY2VzcycpO1xyXG4gICAgICAgIH0sIDIwMDApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlVmlldygpIHtcclxuICAgIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RpbWVsaW5lJykge1xyXG4gICAgICByZW5kZXJUaW1lbGluZSgpO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RvcDUtdGV4dCcpIHtcclxuICAgICAgcmVuZGVyVG9wNVRleHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHByb2Nlc3NEYXRhKGNhbXBhaWducykge1xyXG4gICAgbGV0IHNvcnRlZCA9IFsuLi5jYW1wYWlnbnNdO1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUHJvY2Vzc2luZyBkYXRhLiBTb3J0OicsIHN0YXRlLmZpbHRlclNvcnQsICdHcm91cDonLCBzdGF0ZS5ncm91cEJ5RG9tYWluKTtcclxuXHJcbiAgICAvLyAxLiBTb3J0aW5nIExvZ2ljXHJcbiAgICAvLyAwLiBGaWx0ZXIgTG9naWNcclxuICAgIGlmIChzdGF0ZS5maWx0ZXJUZXh0KSB7XHJcbiAgICAgIHNvcnRlZCA9IHNvcnRlZC5maWx0ZXIoYyA9PlxyXG4gICAgICAgIGMudXJsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RhdGUuZmlsdGVyVGV4dCkgfHxcclxuICAgICAgICAoYy50b3A1ICYmIGMudG9wNS5zb21lKGFkID0+IGFkLmFkVGV4dCAmJiBhZC5hZFRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdGF0ZS5maWx0ZXJUZXh0KSkpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMS4gU29ydGluZyBMb2dpY1xyXG4gICAgc29ydGVkLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgbGV0IHZhbEEsIHZhbEI7XHJcblxyXG4gICAgICBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gJ2FkcycpIHtcclxuICAgICAgICB2YWxBID0gTnVtYmVyKGEuYWRzQ291bnQpIHx8IDA7XHJcbiAgICAgICAgdmFsQiA9IE51bWJlcihiLmFkc0NvdW50KSB8fCAwO1xyXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09ICdkdXJhdGlvbicpIHtcclxuICAgICAgICB2YWxBID0gTnVtYmVyKGEuY2FtcGFpZ25EdXJhdGlvbkRheXMpIHx8IDA7XHJcbiAgICAgICAgdmFsQiA9IE51bWJlcihiLmNhbXBhaWduRHVyYXRpb25EYXlzKSB8fCAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vICdyZWNlbnQnIC8gU3RhcnQgRGF0ZVxyXG4gICAgICAgIHZhbEEgPSBuZXcgRGF0ZShhLmZpcnN0QWR2ZXJ0aXNlZCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHZhbEIgPSBuZXcgRGF0ZShiLmZpcnN0QWR2ZXJ0aXNlZCkuZ2V0VGltZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGFuZGFyZCBBc2NlbmRpbmc6IHZhbEEgLSB2YWxCXHJcbiAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSB2YWxBIC0gdmFsQjtcclxuXHJcbiAgICAgIC8vIEFwcGx5IERpcmVjdGlvblxyXG4gICAgICByZXR1cm4gc3RhdGUuc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyBjb21wYXJpc29uIDogLWNvbXBhcmlzb247XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyAyLiBHcm91cGluZyBMb2dpYyAoU2Vjb25kYXJ5IFNvcnQpXHJcbiAgICBpZiAoc3RhdGUuZ3JvdXBCeURvbWFpbikge1xyXG4gICAgICBzb3J0ZWQuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRBID0gZ2V0RG9tYWluKGEudXJsKTtcclxuICAgICAgICBjb25zdCBkQiA9IGdldERvbWFpbihiLnVybCk7XHJcbiAgICAgICAgaWYgKGRBIDwgZEIpIHJldHVybiAtMTtcclxuICAgICAgICBpZiAoZEEgPiBkQikgcmV0dXJuIDE7XHJcbiAgICAgICAgLy8gS2VlcCBwcmV2aW91cyBzb3J0IG9yZGVyIHdpdGhpbiBzYW1lIGRvbWFpblxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc29ydGVkO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0RG9tYWluKHVybCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIG5ldyBVUkwodXJsKS5ob3N0bmFtZS5yZXBsYWNlKCd3d3cuJywgJycpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiB1cmw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJUaW1lbGluZSgpIHtcclxuICAgIGNvbnN0IGNoYXJ0Q29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NoYXJ0Q29udGVudCcpO1xyXG4gICAgY2hhcnRDb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ZiLWFkcy1iZy1ncmF5Jyk7XHJcbiAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgY29uc3QgY2FtcGFpZ25zVG9SZW5kZXIgPSBwcm9jZXNzRGF0YShzdGF0ZS5yYXdDYW1wYWlnbnMpO1xyXG5cclxuICAgIGlmIChjYW1wYWlnbnNUb1JlbmRlci5sZW5ndGggPT09IDApIHtcclxuICAgICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZmItYWRzLWVtcHR5LXN0YXRlXCI+Tm8gY2FtcGFpZ25zIG1hdGNoIGNyaXRlcmlhPC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YnRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3VidGl0bGUnKTtcclxuICAgIGlmIChzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBmaXJzdCA9IG5ldyBEYXRlKHN0YXRlLnJhd0NhbXBhaWduc1tzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoIC0gMV0uZmlyc3RBZHZlcnRpc2VkKTtcclxuICAgICAgY29uc3QgbGFzdCA9IG5ldyBEYXRlKHN0YXRlLnJhd0NhbXBhaWduc1swXS5sYXN0QWR2ZXJ0aXNlZCk7IC8vIFJvdWdoIGFwcHJveCBkZXBlbmRpbmcgb24gc29ydFxyXG4gICAgICBzdWJ0aXRsZS50ZXh0Q29udGVudCA9IGAke3N0YXRlLnJhd0NhbXBhaWducy5sZW5ndGh9IGNhbXBhaWducyBhbmFseXplZGA7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIERldGVybWluZSBUaW1lbGluZSBSYW5nZVxyXG4gICAgbGV0IG1pbkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IG1heERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy5maXJzdEFkdmVydGlzZWQgPCBtaW5EYXRlKSBtaW5EYXRlID0gYy5maXJzdEFkdmVydGlzZWQ7XHJcbiAgICAgIGlmIChjLmxhc3RBZHZlcnRpc2VkID4gbWF4RGF0ZSkgbWF4RGF0ZSA9IGMubGFzdEFkdmVydGlzZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBkYXlNcyA9IDg2NDAwMDAwO1xyXG4gICAgLy8gRW5zdXJlIGF0IGxlYXN0IDEgZGF5IHJhbmdlIHRvIGF2b2lkIGRpdmlzaW9uIGJ5IHplcm9cclxuICAgIGxldCByYW5nZU1zID0gbWF4RGF0ZSAtIG1pbkRhdGU7XHJcbiAgICBpZiAocmFuZ2VNcyA8IGRheU1zKSByYW5nZU1zID0gZGF5TXM7XHJcblxyXG4gICAgLy8gQWRkIHBhZGRpbmcgKG1heCBvZiA1IGRheXMgb3IgMTAlIG9mIHRvdGFsIHJhbmdlKVxyXG4gICAgLy8gQ2xhbXAgcGFkZGluZyBmb3IgcmlnaHQgc2lkZSB0byBhdm9pZCBzaG93aW5nIGZ1dHVyZSBtb250aHMgdW5uZWNlc3NhcmlseVxyXG4gICAgLy8gQ2xhbXAgcGFkZGluZyBmb3IgcmlnaHQgc2lkZSB0byBhdm9pZCBzaG93aW5nIGZ1dHVyZSBtb250aHMgdW5uZWNlc3NhcmlseVxyXG4gICAgY29uc3QgcGFkZGluZyA9IE1hdGgubWF4KGRheU1zICogNSwgcmFuZ2VNcyAqIDAuMSk7XHJcblxyXG4gICAgLy8gU3RhcnQgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBtb250aCBvZiB0aGUgZmlyc3QgYWQgKG5vIGxlZnQgcGFkZGluZyBpbnRvIHByZXZpb3VzIG1vbnRocylcclxuICAgIGNvbnN0IHJlbmRlck1pbiA9IG5ldyBEYXRlKG1pbkRhdGUuZ2V0RnVsbFllYXIoKSwgbWluRGF0ZS5nZXRNb250aCgpLCAxKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgcmlnaHQtc2lkZSBib3VuZCAoRW5kIG9mIHRoZSBtb250aCBvZiB0aGUgbWF4RGF0ZSlcclxuICAgIGNvbnN0IGVuZE9mTWF4RGF0ZU1vbnRoID0gbmV3IERhdGUobWF4RGF0ZS5nZXRGdWxsWWVhcigpLCBtYXhEYXRlLmdldE1vbnRoKCkgKyAxLCAwKTtcclxuICAgIC8vIFVzZSBwYWRkaW5nIG5vcm1hbGx5LCBidXQgZG9uJ3QgZXhjZWVkIGVuZCBvZiB0aGF0IG1vbnRoIGJ5IG11Y2ggKG1heWJlIGFsbG93IGhpdHRpbmcgdGhlIGxhc3QgZGF5KVxyXG4gICAgLy8gQWN0dWFsbHkgdXNlciB3YW50cyBcInVudGlsIHRoZSBjdXJyZW50IG1vbnRoIG9ubHlcIi5cclxuICAgIC8vIFNvIGlmIG1heERhdGUgaXMgTm92LCB3ZSBzaG91bGRuJ3Qgc2hvdyBKYW4uIFxyXG4gICAgLy8gU2ltcGx5IGNsYW1waW5nIHRvIGVuZE9mTWF4RGF0ZU1vbnRoIHNlZW1zIGNvcnJlY3QgZm9yIFwiY3VycmVudCBtb250aCBvbmx5XCIuXHJcbiAgICBjb25zdCByZW5kZXJNYXggPSBuZXcgRGF0ZShNYXRoLm1pbihtYXhEYXRlLmdldFRpbWUoKSArIHBhZGRpbmcsIGVuZE9mTWF4RGF0ZU1vbnRoLmdldFRpbWUoKSArIGRheU1zKSk7IC8vICsxIGRheSBidWZmZXJcclxuICAgIGNvbnN0IHRvdGFsRHVyYXRpb24gPSByZW5kZXJNYXggLSByZW5kZXJNaW47XHJcblxyXG4gICAgLy8gSGVhZGVyXHJcbiAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGhlYWRlci5jbGFzc05hbWUgPSAnZmItYWRzLXRpbWVsaW5lLWhlYWRlcic7XHJcbiAgICBoZWFkZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10aW1lbGluZS1sYWJlbFwiPjxzdHJvbmc+Q2FtcGFpZ248L3N0cm9uZz48L2Rpdj5cclxuICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtZ3JpZFwiPjwvZGl2PlxyXG4gICAgYDtcclxuICAgIGNoYXJ0Q29udGVudC5hcHBlbmRDaGlsZChoZWFkZXIpO1xyXG5cclxuICAgIGNvbnN0IGdyaWQgPSBoZWFkZXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy10aW1lbGluZS1ncmlkJyk7XHJcbiAgICBsZXQgZ3JpZExpbmVzSFRNTCA9ICcnO1xyXG5cclxuICAgIC8vIEFkYXB0aXZlIE1hcmtlcnMgbG9naWNcclxuICAgIGNvbnN0IGlzU2hvcnRSYW5nZSA9IHJhbmdlTXMgPCAoZGF5TXMgKiA2MCk7XHJcblxyXG4gICAgaWYgKGlzU2hvcnRSYW5nZSkge1xyXG4gICAgICAvLyBXZWVrbHkgbWFya2Vyc1xyXG4gICAgICBsZXQgZCA9IG5ldyBEYXRlKHJlbmRlck1pbik7XHJcbiAgICAgIHdoaWxlIChkIDw9IHJlbmRlck1heCkge1xyXG4gICAgICAgIGNvbnN0IHBvcyA9ICgoZCAtIHJlbmRlck1pbikgLyB0b3RhbER1cmF0aW9uKSAqIDEwMDtcclxuICAgICAgICBpZiAocG9zID49IDAgJiYgcG9zIDw9IDEwMCkge1xyXG4gICAgICAgICAgY29uc3QgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICBtYXJrZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1tb250aC1tYXJrZXInO1xyXG4gICAgICAgICAgbWFya2VyLnN0eWxlLmxlZnQgPSBgJHtwb3N9JWA7XHJcbiAgICAgICAgICBtYXJrZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9udGgtbGFiZWxcIj4ke2QudG9Mb2NhbGVTdHJpbmcoJ2RlZmF1bHQnLCB7IG1vbnRoOiAnc2hvcnQnLCBkYXk6ICdudW1lcmljJyB9KX08L2Rpdj5gO1xyXG4gICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChtYXJrZXIpO1xyXG5cclxuICAgICAgICAgIC8vIEFkZCBHcmlkIExpbmVcclxuICAgICAgICAgIGdyaWRMaW5lc0hUTUwgKz0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtZ3JpZC1saW5lXCIgc3R5bGU9XCJsZWZ0OiAke3Bvc30lXCI+PC9kaXY+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpICsgNyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE1vbnRobHkgbWFya2Vyc1xyXG4gICAgICBsZXQgZCA9IG5ldyBEYXRlKHJlbmRlck1pbik7XHJcbiAgICAgIGQuc2V0RGF0ZSgxKTtcclxuICAgICAgd2hpbGUgKGQgPD0gcmVuZGVyTWF4KSB7XHJcbiAgICAgICAgY29uc3QgcG9zID0gKChkIC0gcmVuZGVyTWluKSAvIHRvdGFsRHVyYXRpb24pICogMTAwO1xyXG4gICAgICAgIGlmIChwb3MgPj0gMCAmJiBwb3MgPD0gMTAwKSB7XHJcbiAgICAgICAgICBjb25zdCBtYXJrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgIG1hcmtlci5jbGFzc05hbWUgPSAnZmItYWRzLW1vbnRoLW1hcmtlcic7XHJcbiAgICAgICAgICBtYXJrZXIuc3R5bGUubGVmdCA9IGAke3Bvc30lYDtcclxuICAgICAgICAgIG1hcmtlci5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImZiLWFkcy1tb250aC1sYWJlbFwiPiR7ZC50b0xvY2FsZVN0cmluZygnZGVmYXVsdCcsIHsgbW9udGg6ICdzaG9ydCcsIHllYXI6ICcyLWRpZ2l0JyB9KX08L2Rpdj5gO1xyXG4gICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChtYXJrZXIpO1xyXG5cclxuICAgICAgICAgIC8vIEFkZCBHcmlkIExpbmVcclxuICAgICAgICAgIGdyaWRMaW5lc0hUTUwgKz0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtZ3JpZC1saW5lXCIgc3R5bGU9XCJsZWZ0OiAke3Bvc30lXCI+PC9kaXY+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZC5zZXRNb250aChkLmdldE1vbnRoKCkgKyAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFwcGVuZCBCYWNrZ3JvdW5kIEdyaWQgYW5kIFJvd3MgV3JhcHBlclxyXG4gICAgY29uc3QgYm9keUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgYm9keUNvbnRhaW5lci5jbGFzc05hbWUgPSAnZmItYWRzLXRpbWVsaW5lLWJvZHknO1xyXG4gICAgYm9keUNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7IC8vIEVuc3VyZSBncmlkIGlzIHJlbGF0aXZlIHRvIHRoaXMgY29udGVudCBoZWlnaHRcclxuXHJcbiAgICBjb25zdCBncmlkTGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGdyaWRMYXllci5jbGFzc05hbWUgPSAnZmItYWRzLWdsb2JhbC1ncmlkJztcclxuICAgIGdyaWRMYXllci5pbm5lckhUTUwgPSBgXHJcbiAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWdyaWQtc3BhY2VyXCI+PC9kaXY+XHJcbiAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWdyaWQtYXJlYVwiPiR7Z3JpZExpbmVzSFRNTH08L2Rpdj5cclxuICAgIGA7XHJcbiAgICBib2R5Q29udGFpbmVyLmFwcGVuZENoaWxkKGdyaWRMYXllcik7XHJcblxyXG4gICAgLy8gUmVuZGVyIFJvd3NcclxuICAgIGxldCBsYXN0RG9tYWluID0gbnVsbDtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGNhbXBhaWduID0+IHtcclxuICAgICAgLy8gRG9tYWluIEhlYWRlciBmb3IgR3JvdXBpbmdcclxuICAgICAgY29uc3QgZG9tYWluID0gZ2V0RG9tYWluKGNhbXBhaWduLnVybCk7XHJcbiAgICAgIGlmIChzdGF0ZS5ncm91cEJ5RG9tYWluICYmIGRvbWFpbiAhPT0gbGFzdERvbWFpbikge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZ3JvdXBIZWFkZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1kb21haW4taGVhZGVyJztcclxuICAgICAgICBncm91cEhlYWRlci5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImZiLWFkcy1kb21haW4tbmFtZVwiPiR7ZG9tYWlufTwvZGl2PmA7XHJcbiAgICAgICAgYm9keUNvbnRhaW5lci5hcHBlbmRDaGlsZChncm91cEhlYWRlcik7XHJcbiAgICAgICAgbGFzdERvbWFpbiA9IGRvbWFpbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHJvdy5jbGFzc05hbWUgPSAnZmItYWRzLWNhbXBhaWduLXJvdyc7XHJcblxyXG4gICAgICBjb25zdCBsZWZ0ID0gKChjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQgLSByZW5kZXJNaW4pIC8gdG90YWxEdXJhdGlvbikgKiAxMDA7XHJcbiAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5tYXgoMC41LCAoKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkIC0gY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkKSAvIHRvdGFsRHVyYXRpb24pICogMTAwKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBnZXRBZENvdW50Q29sb3IoY2FtcGFpZ24uYWRzQ291bnQpO1xyXG5cclxuICAgICAgcm93LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24taW5mb1wiPlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi11cmxcIiB0aXRsZT1cIiR7Y2FtcGFpZ24udXJsfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7Y2FtcGFpZ24udXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwiY29sb3I6IGluaGVyaXQ7IHRleHQtZGVjb3JhdGlvbjogbm9uZTtcIj4ke2NhbXBhaWduLnVybH08L2E+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgbWFyZ2luLWxlZnQ6IDZweDtcIj5cclxuICAgICAgICAgICAgICAgICAgKDxhIGhyZWY9XCJodHRwczovL3dlYi5hcmNoaXZlLm9yZy93ZWIvKi8ke2NhbXBhaWduLnVybH0vKlwiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwiY29sb3I6ICM2YjcyODA7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1wiPkFyY2hpdmU8L2E+KVxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLW1ldGFcIj5cclxuICAgICAgICAgICAgICAgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyDigKIgJHtjYW1wYWlnbi5hZHNDb3VudH0gYWRzXHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi10aW1lbGluZVwiPlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10aW1lbGluZS1iZy1tYXJrZXJcIiBzdHlsZT1cImxlZnQ6ICR7bGVmdH0lOyB3aWR0aDogJHt3aWR0aH0lXCI+PC9kaXY+IFxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi1iYXJcIiBcclxuICAgICAgICAgICAgICAgICAgc3R5bGU9XCJsZWZ0OiAke2xlZnR9JTsgd2lkdGg6ICR7d2lkdGh9JTsgYmFja2dyb3VuZDogJHtjb2xvcn07IGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuMSk7XCI+XHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgYDtcclxuXHJcbiAgICAgIC8vIFRvb2x0aXAgbG9naWMgZm9yIHRoZSBiYXJcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFyID0gcm93LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtY2FtcGFpZ24tYmFyJyk7XHJcbiAgICAgICAgaWYgKGJhcikge1xyXG4gICAgICAgICAgYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKGNhbXBhaWduLmZpcnN0QWR2ZXJ0aXNlZCkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZShjYW1wYWlnbi5sYXN0QWR2ZXJ0aXNlZCkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICB0b29sdGlwLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10b29sdGlwLWhlYWRlclwiPkNhbXBhaWduIERldGFpbHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10b29sdGlwLWRhdGVzXCI+JHtzdGFydERhdGV9IOKAlCAke2VuZERhdGV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiZmItYWRzLXRvb2x0aXAtYWN0aW9uXCIgaWQ9XCJmYkFkc1Rvb2x0aXBWaWV3QnRuXCI+Q2xpY2sgdG8gVmlldyBUb3AgNSBBZHM8L2E+XHJcbiAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgdmlld0J0biA9IHRvb2x0aXAucXVlcnlTZWxlY3RvcignI2ZiQWRzVG9vbHRpcFZpZXdCdG4nKTtcclxuICAgICAgICAgICAgaWYgKHZpZXdCdG4pIHtcclxuICAgICAgICAgICAgICB2aWV3QnRuLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIG9wZW5DYW1wYWlnbkRldGFpbHMoY2FtcGFpZ24pO1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS5jbGllbnRYICsgMTU7XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLmNsaWVudFkgKyAxNTtcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0geCArICdweCc7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUudG9wID0geSArICdweCc7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCAwKTtcclxuXHJcbiAgICAgIHJvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoJ2EnKSkgcmV0dXJuO1xyXG4gICAgICAgIG9wZW5DYW1wYWlnbkRldGFpbHMoY2FtcGFpZ24pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGJvZHlDb250YWluZXIuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNoYXJ0Q29udGVudC5hcHBlbmRDaGlsZChib2R5Q29udGFpbmVyKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclRvcDVUZXh0KCkge1xyXG4gICAgY29uc3QgY2hhcnRDb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ2hhcnRDb250ZW50Jyk7XHJcbiAgICBjaGFydENvbnRlbnQuY2xhc3NMaXN0LmFkZCgnZmItYWRzLWJnLWdyYXknKTtcclxuICAgIGNvbnN0IHN1YnRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3VidGl0bGUnKTtcclxuICAgIHN1YnRpdGxlLnRleHRDb250ZW50ID0gYFRvcCA1IGFkcyBmb3IgJHtzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RofSBjYW1wYWlnbnNgO1xyXG5cclxuICAgIGlmICghc3RhdGUucmF3Q2FtcGFpZ25zIHx8IHN0YXRlLnJhd0NhbXBhaWducy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZmItYWRzLWVtcHR5LXN0YXRlXCI+Tm8gY2FtcGFpZ24gZGF0YSBhdmFpbGFibGU8L2Rpdj4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG91dHB1dCA9ICcnO1xyXG4gICAgY29uc3QgY2FtcGFpZ25zVG9SZW5kZXIgPSBwcm9jZXNzRGF0YShzdGF0ZS5yYXdDYW1wYWlnbnMpO1xyXG5cclxuICAgIGNhbXBhaWduc1RvUmVuZGVyLmZvckVhY2goY2FtcGFpZ24gPT4ge1xyXG4gICAgICBjb25zdCBmb3JtYXREYXRlID0gKGRhdGVTdHIpID0+IG5ldyBEYXRlKGRhdGVTdHIpLnRvRGF0ZVN0cmluZygpO1xyXG4gICAgICBjb25zdCBjb2xvciA9IGdldEFkQ291bnRDb2xvcihjYW1wYWlnbi5hZHNDb3VudCk7XHJcblxyXG4gICAgICBvdXRwdXQgKz0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1jYW1wYWlnbiBmYi1hZHMtY2FyZC13aGl0ZVwiIHN0eWxlPVwiYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCAke2NvbG9yfTtcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPHN0cm9uZz4ke2NhbXBhaWduLnVybH08L3N0cm9uZz5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LW1ldGFcIj5cclxuICAgICAgICAgICAgJHtmb3JtYXREYXRlKGNhbXBhaWduLmZpcnN0QWR2ZXJ0aXNlZCl9IOKAlCAke2Zvcm1hdERhdGUoY2FtcGFpZ24ubGFzdEFkdmVydGlzZWQpfSB8IFxyXG4gICAgICAgICAgICAke2NhbXBhaWduLmNhbXBhaWduRHVyYXRpb25EYXlzfSBkYXlzIHwgXHJcbiAgICAgICAgICAgICR7Y2FtcGFpZ24uYWRzQ291bnR9IGFkc1xyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBcclxuICAgICAgICAgICR7Y2FtcGFpZ24udG9wNSAmJiBjYW1wYWlnbi50b3A1Lmxlbmd0aCA+IDAgPyBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZHNcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtbGFiZWxcIj5Ub3AgNSBBZHM8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWdyaWRcIj5cclxuICAgICAgICAgICAgICAke2NhbXBhaWduLnRvcDUubWFwKGFkID0+IGBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZFwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWQtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5MaWJyYXJ5IElEOjwvc3Ryb25nPiBcclxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2Fkcy9saWJyYXJ5Lz9pZD0ke2FkLmxpYnJhcnlJZH1cIiBcclxuICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImZiLWFkcy1saWJyYXJ5LWlkLWxpbmtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICR7YWQubGlicmFyeUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZC1tZXRhXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5EYXRlczo8L3N0cm9uZz4gJHtuZXcgRGF0ZShhZC5zdGFydGluZ0RhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygpfSDigJQgJHtuZXcgRGF0ZShhZC5lbmREYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoKX08YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5EdXJhdGlvbjo8L3N0cm9uZz4gJHthZC5kdXJhdGlvbn0gZGF5c1xyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkLWNvcHlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgJHthZC5tZWRpYVR5cGUgPT09ICd2aWRlbydcclxuICAgICAgICAgID8gYDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiA4cHg7XCI+PHZpZGVvIHNyYz1cIiR7YWQubWVkaWFTcmN9XCIgY29udHJvbHMgc3R5bGU9XCJtYXgtd2lkdGg6IDEwMCU7IGhlaWdodDogYXV0bzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvdmlkZW8+PC9kaXY+YFxyXG4gICAgICAgICAgOiAoYWQubWVkaWFUeXBlID09PSAnaW1hZ2UnID8gYDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiA4cHg7XCI+PGltZyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBoZWlnaHQ6IGF1dG87IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L2Rpdj5gIDogJycpXHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+QWQgQ29weTo8L3N0cm9uZz48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHthZC5hZFRleHQgfHwgJ1tubyBjb3B5XSd9XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYCA6ICc8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtbm8tYWRzXCI+Tm8gdG9wIGFkcyBkYXRhIGF2YWlsYWJsZTwvZGl2Pid9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWN0aW9uc1wiIHN0eWxlPVwibWFyZ2luLXRvcDogMTVweDsgbWFyZ2luLWJvdHRvbTogMjBweDsgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDsgZ2FwOiAxMHB4O1wiPlxyXG4gICAgICAgICR7c3RhdGUuYWlDb25maWcgPyBgXHJcbiAgICAgICAgPGJ1dHRvbiBpZD1cImZiQWRzQW5hbHl6ZUJ0blwiIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiPlxyXG4gICAgICAgICAg8J+kliBBbmFseXplIHdpdGggQUlcclxuICAgICAgICA8L2J1dHRvbj5gIDogJydcclxuICAgICAgfVxyXG4gICAgPGJ1dHRvbiBpZD1cImZiQWRzQ29weUFsbFRleHRCdG5cIiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIj5cclxuICAgICAg8J+TiyBDb3B5IEFsbCBUZXh0XHJcbiAgICA8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgICA8ZGl2IGlkPVwiZmJBZHNBSVJlc3VsdFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTsgbWFyZ2luLWJvdHRvbTogMjBweDsgYmFja2dyb3VuZDogI2YwZmRmNDsgYm9yZGVyOiAxcHggc29saWQgI2JiZjdkMDsgYm9yZGVyLXJhZGl1czogOHB4OyBjb2xvcjogIzE2NjUzNDsgb3ZlcmZsb3c6IGhpZGRlbjtcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWktaGVhZGVyXCIgc3R5bGU9XCJwYWRkaW5nOiAxMnB4IDE2cHg7IGJhY2tncm91bmQ6ICNkY2ZjZTc7IGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgY3Vyc29yOiBwb2ludGVyOyBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JiZjdkMDtcIj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA2MDA7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogOHB4O1wiPvCfpJYgQUkgQW5hbHlzaXM8L2Rpdj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1haS1taW5pbWl6ZVwiIHN0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBmb250LXNpemU6IDE4cHg7IGNvbG9yOiAjMTY2NTM0OyBjdXJzb3I6IHBvaW50ZXI7IGxpbmUtaGVpZ2h0OiAxO1wiPuKIkjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFpLWNvbnRlbnRcIiBzdHlsZT1cInBhZGRpbmc6IDE2cHg7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcIj48L2Rpdj5cclxuICAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtb3V0cHV0XCI+JHtvdXRwdXR9PC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIFRvZ2dsZSBtaW5pbWl6ZVxyXG4gICAgY29uc3QgYWlIZWFkZXIgPSBjaGFydENvbnRlbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy1haS1oZWFkZXInKTtcclxuICAgIGNvbnN0IGFpQ29udGVudCA9IGNoYXJ0Q29udGVudC5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLWNvbnRlbnQnKTtcclxuICAgIGNvbnN0IG1pbmltaXplQnRuID0gY2hhcnRDb250ZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktbWluaW1pemUnKTtcclxuXHJcbiAgICBpZiAoYWlIZWFkZXIpIHtcclxuICAgICAgYWlIZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNIaWRkZW4gPSBhaUNvbnRlbnQuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xyXG4gICAgICAgIGFpQ29udGVudC5zdHlsZS5kaXNwbGF5ID0gaXNIaWRkZW4gPyAnYmxvY2snIDogJ25vbmUnO1xyXG4gICAgICAgIG1pbmltaXplQnRuLnRleHRDb250ZW50ID0gaXNIaWRkZW4gPyAn4oiSJyA6ICcrJztcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzdG9yZSBBSSBSZXN1bHQgaWYgZXhpc3RzXHJcbiAgICBjb25zdCByZXN1bHREaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBSVJlc3VsdCcpO1xyXG4gICAgaWYgKHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQpIHtcclxuICAgICAgY29uc3QgY29udGVudERpdiA9IHJlc3VsdERpdi5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLWNvbnRlbnQnKTtcclxuICAgICAgY29udGVudERpdi5pbm5lckhUTUwgPSBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0O1xyXG4gICAgICByZXN1bHREaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHN0YXRlLmFpQ29uZmlnKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhbmFseXplV2l0aEFJKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDb3B5QWxsVGV4dEJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy10ZXh0LW91dHB1dCcpO1xyXG4gICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gMS4gVGVtcG9yYXJpbHkgaGlkZSBtZWRpYVxyXG4gICAgICBjb25zdCBtZWRpYSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdpbWcsIHZpZGVvJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsRGlzcGxheXMgPSBbXTtcclxuICAgICAgbWVkaWEuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgb3JpZ2luYWxEaXNwbGF5cy5wdXNoKGVsLnN0eWxlLmRpc3BsYXkpO1xyXG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gMi4gU2VsZWN0IGNvbnRlbnRcclxuICAgICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhjb250YWluZXIpO1xyXG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XHJcblxyXG4gICAgICAvLyAzLiBDb3B5XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ29weUFsbFRleHRCdG4nKTtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4udGV4dENvbnRlbnQ7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ+KchSBDb3BpZWQhJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignQ29weSBmYWlsZWQ6JywgZXJyKTtcclxuICAgICAgICBhbGVydCgnQ29weSBmYWlsZWQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gNC4gQ2xlYW51cFxyXG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICAgIG1lZGlhLmZvckVhY2goKGVsLCBpKSA9PiB7XHJcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IG9yaWdpbmFsRGlzcGxheXNbaV07XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKSB7XHJcbiAgICBpZiAoIWNhbXBhaWduLnRvcDUgfHwgY2FtcGFpZ24udG9wNS5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICBsZXQgY29udGVudCA9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWxpc3RcIj5gO1xyXG5cclxuICAgIGNhbXBhaWduLnRvcDUuZm9yRWFjaCgoYWQsIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZVN0cikgPT4gbmV3IERhdGUoZGF0ZVN0cikudG9EYXRlU3RyaW5nKCk7XHJcbiAgICAgIGNvbnRlbnQgKz0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhcmQgZmItYWRzLWNhcmQtd2hpdGVcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1yYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXJhbmstbnVtYmVyXCI+IyR7aW5kZXggKyAxfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1saWJyYXJ5LWlkLWxhYmVsXCI+TGlicmFyeSBJRDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2Fkcy9saWJyYXJ5Lz9pZD0ke2FkLmxpYnJhcnlJZH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImZiLWFkcy1saWJyYXJ5LWlkLWxpbmtcIj4ke2FkLmxpYnJhcnlJZH08L2E+XHJcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1kdXJhdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1kdXJhdGlvbi1sYWJlbFwiPkR1cmF0aW9uPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWR1cmF0aW9uLXZhbHVlXCI+JHthZC5kdXJhdGlvbn0gZGF5czwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1tZXRhXCI+JHtmb3JtYXREYXRlKGFkLnN0YXJ0aW5nRGF0ZSl9IC0gJHtmb3JtYXREYXRlKGFkLmVuZERhdGUpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5LXNlY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAke2FkLm1lZGlhVHlwZSA9PT0gJ3ZpZGVvJ1xyXG4gICAgICAgICAgPyBgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1pbWFnZVwiIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTJweDsgdGV4dC1hbGlnbjogY2VudGVyO1wiPjx2aWRlbyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBtYXgtaGVpZ2h0OiAzMDBweDsgYm9yZGVyLXJhZGl1czogNnB4OyBib3gtc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpO1wiPjwvdmlkZW8+PC9kaXY+YFxyXG4gICAgICAgICAgOiAoYWQubWVkaWFUeXBlID09PSAnaW1hZ2UnID8gYDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtaW1hZ2VcIiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDEycHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj48aW1nIHNyYz1cIiR7YWQubWVkaWFTcmN9XCIgc3R5bGU9XCJtYXgtd2lkdGg6IDEwMCU7IG1heC1oZWlnaHQ6IDMwMHB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGJveC1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSk7XCI+PC9kaXY+YCA6ICcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5LWxhYmVsXCI+QWQgQ29weTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWNvcHktYnRuXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jb3B5LXRleHQ9XCIke2VuY29kZVVSSUNvbXBvbmVudChhZC5hZFRleHQgfHwgJycpfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS11cmw9XCIke2VuY29kZVVSSUNvbXBvbmVudChjYW1wYWlnbi51cmwpfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jYW1wYWlnbi1kdXJhdGlvbj1cIiR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWNhbXBhaWduLWFkcz1cIiR7Y2FtcGFpZ24uYWRzQ291bnR9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFkLWxpYi1pZD1cIiR7YWQubGlicmFyeUlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1kdXJhdGlvbj1cIiR7YWQuZHVyYXRpb259XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFkLWRhdGVzPVwiJHtmb3JtYXREYXRlKGFkLnN0YXJ0aW5nRGF0ZSl9IOKAlCAke2Zvcm1hdERhdGUoYWQuZW5kRGF0ZSl9XCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIPCfk4sgQ29weVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5XCI+JHthZC5hZFRleHQgfHwgJ1tObyBjb3B5IGF2YWlsYWJsZV0nfTwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb250ZW50ICs9IGA8L2Rpdj5gO1xyXG4gICAgc2hvd01vZGFsKGNvbnRlbnQsIGAke2NhbXBhaWduLnVybH0gYCwgYCR7Y2FtcGFpZ24uYWRzQ291bnR9IHRvdGFsIGFkcyDigKIgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyBhY3RpdmVgKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBEYXRhIE1hbmFnZW1lbnQgLS0tXHJcblxyXG4gIGZ1bmN0aW9uIGRvd25sb2FkRGF0YSgpIHtcclxuICAgIC8vIEdlbmVyYXRlIGZpbGVuYW1lIHByb3BlcnRpZXNcclxuICAgIGNvbnN0IGFkdmVydGlzZXIgPSAoc3RhdGUubWV0YWRhdGE/LmFkdmVydGlzZXJOYW1lIHx8ICdmYl9hZHNfYW5hbHlzaXMnKVxyXG4gICAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXHJcbiAgICAgIC5yZXBsYWNlKC8oXi18LSQpL2csICcnKTtcclxuXHJcbiAgICBjb25zdCBjb3VudCA9IHN0YXRlLnJhd0NhbXBhaWducy5sZW5ndGg7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIGRhdGUgcmFuZ2UgZnJvbSBhbGwgY2FtcGFpZ25zXHJcbiAgICBsZXQgbWluRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBsZXQgbWF4RGF0ZSA9IG5ldyBEYXRlKDApO1xyXG5cclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy5maXJzdEFkdmVydGlzZWQgPCBtaW5EYXRlKSBtaW5EYXRlID0gYy5maXJzdEFkdmVydGlzZWQ7XHJcbiAgICAgIGlmIChjLmxhc3RBZHZlcnRpc2VkID4gbWF4RGF0ZSkgbWF4RGF0ZSA9IGMubGFzdEFkdmVydGlzZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIZWxwZXIgZm9yIGRhdGUgZm9ybWF0dGluZyBsaWtlIFwiamFuLTEtMjAyNVwiXHJcbiAgICBjb25zdCBmb3JtYXREYXRlID0gKGQpID0+IHtcclxuICAgICAgY29uc3QgbSA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1blwiLCBcImp1bFwiLCBcImF1Z1wiLCBcInNlcFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcclxuICAgICAgcmV0dXJuIGAke21bZC5nZXRNb250aCgpXX0gLSR7ZC5nZXREYXRlKCl9IC0ke2QuZ2V0RnVsbFllYXIoKX0gYDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgc3RhcnRTdHIgPSBmb3JtYXREYXRlKG1pbkRhdGUpO1xyXG4gICAgY29uc3QgZW5kU3RyID0gZm9ybWF0RGF0ZShtYXhEYXRlKTtcclxuXHJcbiAgICAvLyBGaWxlbmFtZTogcGVuZy1qb29uLWZiLWFkcy04LWNhbXBhaWducy1mcm9tLWphbi0xLTIwMjUtdG8tZGVjLTI0LTIwMjUuanNvblxyXG4gICAgY29uc3QgZmlsZW5hbWUgPSBgJHthZHZlcnRpc2VyfSAtZmIgLSBhZHMgLSAke2NvdW50fSAtY2FtcGFpZ25zIC0gZnJvbSAtICR7c3RhcnRTdHJ9IC10byAtICR7ZW5kU3RyfS5qc29uYDtcclxuXHJcbiAgICBjb25zdCBkYXRhU3RyID0gXCJkYXRhOnRleHQvanNvbjtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgY2FtcGFpZ25zOiBzdGF0ZS5yYXdDYW1wYWlnbnMsXHJcbiAgICAgIGFsbEFkczogc3RhdGUuYWxsQWRzLFxyXG4gICAgICBtZXRhZGF0YTogc3RhdGUubWV0YWRhdGEgfHwgeyBhZHZlcnRpc2VyTmFtZTogYWR2ZXJ0aXNlciB9LCAvLyBGYWxsYmFjayBtZXRhZGF0YVxyXG4gICAgICBhaUFuYWx5c2lzUmVzdWx0OiBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0IHx8IG51bGxcclxuICAgIH0sIG51bGwsIDIpKTtcclxuXHJcbiAgICBjb25zdCBkb3dubG9hZEFuY2hvck5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBkYXRhU3RyKTtcclxuICAgIGRvd25sb2FkQW5jaG9yTm9kZS5zZXRBdHRyaWJ1dGUoXCJkb3dubG9hZFwiLCBmaWxlbmFtZSk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvd25sb2FkQW5jaG9yTm9kZSk7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUuY2xpY2soKTtcclxuICAgIGRvd25sb2FkQW5jaG9yTm9kZS5yZW1vdmUoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZUZpbGVJbXBvcnQoZXZlbnQpIHtcclxuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXNbMF07XHJcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChlKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICBpZiAoIWpzb24uY2FtcGFpZ25zKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGZvcm1hdFwiKTtcclxuICAgICAgICBsb2FkSW1wb3J0ZWREYXRhKGpzb24pO1xyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgaW1wb3J0aW5nIGZpbGU6ICcgKyBlcnIubWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGxvYWRJbXBvcnRlZERhdGEoaW1wb3J0ZWREYXRhKSB7XHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMgPSBpbXBvcnRlZERhdGEuY2FtcGFpZ25zIHx8IFtdO1xyXG4gICAgc3RhdGUuYWxsQWRzID0gaW1wb3J0ZWREYXRhLmFsbEFkcyB8fCBbXTtcclxuICAgIHN0YXRlLm1ldGFkYXRhID0gaW1wb3J0ZWREYXRhLm1ldGFkYXRhIHx8IG51bGw7XHJcbiAgICBzdGF0ZS5pc0ltcG9ydGVkID0gISFpbXBvcnRlZERhdGEuaXNJbXBvcnRlZDtcclxuICAgIHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgPSBpbXBvcnRlZERhdGEuYWlBbmFseXNpc1Jlc3VsdCB8fCBudWxsO1xyXG5cclxuICAgIC8vIEhpZGUgRG93bmxvYWQgQnV0dG9uIGlmIGltcG9ydGVkXHJcbiAgICBjb25zdCBkb3dubG9hZEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0Rvd25sb2FkQnRuJyk7XHJcbiAgICBpZiAoc3RhdGUuaXNJbXBvcnRlZCkge1xyXG4gICAgICBkb3dubG9hZEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG93bmxvYWRCdG4uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtZmxleCc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGFyc2UgZGF0ZXNcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBjLmZpcnN0QWR2ZXJ0aXNlZCA9IG5ldyBEYXRlKGMuZmlyc3RBZHZlcnRpc2VkKTtcclxuICAgICAgYy5sYXN0QWR2ZXJ0aXNlZCA9IG5ldyBEYXRlKGMubGFzdEFkdmVydGlzZWQpO1xyXG4gICAgICBpZiAoYy50b3A1KSB7XHJcbiAgICAgICAgYy50b3A1LmZvckVhY2goYWQgPT4ge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZGF0ZSBzdHJpbmdzIG9yIG9iamVjdHNcclxuICAgICAgICAgIGFkLnN0YXJ0aW5nRGF0ZSA9IG5ldyBEYXRlKGFkLnN0YXJ0aW5nRGF0ZSk7XHJcbiAgICAgICAgICBhZC5lbmREYXRlID0gbmV3IERhdGUoYWQuZW5kRGF0ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEluaXRpYWwgU29ydFxyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGIuZmlyc3RBZHZlcnRpc2VkKSAtIG5ldyBEYXRlKGEuZmlyc3RBZHZlcnRpc2VkKSk7XHJcblxyXG5cclxuXHJcbiAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICBzaG93T3ZlcmxheSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tIEFJIExvZ2ljIChDU1AgRml4ZWQpIC0tLVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBhbmFseXplV2l0aEFJKCkge1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQW5hbHl6ZUJ0bicpO1xyXG4gICAgY29uc3QgcmVzdWx0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQUlSZXN1bHQnKTtcclxuXHJcbiAgICBpZiAoIXN0YXRlLmFpQ29uZmlnIHx8ICFzdGF0ZS5haUNvbmZpZy5hcGlLZXkpIHtcclxuICAgICAgYWxlcnQoJ0FJIENvbmZpZ3VyYXRpb24gbWlzc2luZy4gUGxlYXNlIGNoZWNrIGRhdGFiYXNlIHNldHRpbmdzLicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICfwn6SWIEFuYWx5emluZy4uLic7XHJcbiAgICByZXN1bHREaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcbiAgICAvLyBDb2xsZWN0IGFsbCBhZCB0ZXh0c1xyXG4gICAgbGV0IGFsbEFkVGV4dHMgPSBbXTtcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy50b3A1KSB7XHJcbiAgICAgICAgYy50b3A1LmZvckVhY2goYWQgPT4ge1xyXG4gICAgICAgICAgaWYgKGFkLmFkVGV4dCAmJiBhZC5hZFRleHQubGVuZ3RoID4gMTApIHtcclxuICAgICAgICAgICAgYWxsQWRUZXh0cy5wdXNoKGFkLmFkVGV4dCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGFuZCBsaW1pdFxyXG4gICAgYWxsQWRUZXh0cyA9IFsuLi5uZXcgU2V0KGFsbEFkVGV4dHMpXS5zbGljZSgwLCA1MCk7XHJcblxyXG4gICAgaWYgKGFsbEFkVGV4dHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGFsZXJ0KCdObyBhZCB0ZXh0IGNvbnRlbnQgZm91bmQgdG8gYW5hbHl6ZS4nKTtcclxuICAgICAgYnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9ICfwn6SWIEFuYWx5emUgd2l0aCBBSSc7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBzdGF0ZS5haUNvbmZpZy5zeXN0ZW1Qcm9tcHQgfHwgXCJZb3UgYXJlIGFuIGV4cGVydCBtYXJrZXRpbmcgYW5hbHlzdC4gQW5hbHl6ZSB0aGVzZSBGYWNlYm9vayBhZCBjb3BpZXMgYW5kIGlkZW50aWZ5IGNvbW1vbiBob29rcywgcGFpbiBwb2ludHMgYWRkcmVzc2VkLCBhbmQgQ1RBcyB1c2VkLiBQcm92aWRlIGEgY29uY2lzZSBidWxsZXRlZCBzdW1tYXJ5IG9mIHRoZSBzdHJhdGVneS5cIjtcclxuICAgIGNvbnN0IHVzZXJDb250ZW50ID0gXCJBbmFseXplIHRoZSBmb2xsb3dpbmcgYWQgY29waWVzOlxcblxcblwiICsgYWxsQWRUZXh0cy5qb2luKFwiXFxuXFxuLS0tXFxuXFxuXCIpO1xyXG5cclxuICAgIC8vIERlZmluZSByZXNwb25zZSBoYW5kbGVyXHJcbiAgICBjb25zdCBoYW5kbGVSZXNwb25zZSA9IChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gZS5kZXRhaWw7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZiQWRzQW5hbHl6ZVJlc3BvbnNlJywgaGFuZGxlUmVzcG9uc2UpO1xyXG5cclxuICAgICAgLy8gUmUtcXVlcnkgZWxlbWVudHMgdG8gZW5zdXJlIHdlIGludGVyYWN0IHdpdGggdGhlIGN1cnJlbnQgRE9NICh2aWV3IG1pZ2h0IGhhdmUgcmVmcmVzaGVkKVxyXG4gICAgICBjb25zdCBjdXJyZW50UmVzdWx0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQUlSZXN1bHQnKTtcclxuICAgICAgY29uc3QgY3VycmVudEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgLy8gTWFya2Rvd24gY29udmVyc2lvbiBzaW1wbGUgcmVwbGFjZW1lbnQgZm9yIGJvbGQvbmV3bGluZXMgaWYgbmVlZGVkLCBcclxuICAgICAgICAvLyBidXQgaW5uZXJIVE1MIHByZXNlcnZlcyBiYXNpYyBmb3JtYXR0aW5nIG1vc3RseS5cclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSByZXNwb25zZS5hbmFseXNpcy5yZXBsYWNlKC9cXG4vZywgJzxicj4nKS5yZXBsYWNlKC9cXCpcXCooLio/KVxcKlxcKi9nLCAnPHN0cm9uZz4kMTwvc3Ryb25nPicpO1xyXG4gICAgICAgIHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgPSBmb3JtYXR0ZWQ7IC8vIFNhdmUgc3RhdGVcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRSZXN1bHREaXYpIHtcclxuICAgICAgICAgIGNvbnN0IGNvbnRlbnREaXYgPSBjdXJyZW50UmVzdWx0RGl2LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktY29udGVudCcpO1xyXG4gICAgICAgICAgaWYgKGNvbnRlbnREaXYpIHtcclxuICAgICAgICAgICAgY29udGVudERpdi5pbm5lckhUTUwgPSBmb3JtYXR0ZWQ7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBGYWxsYmFjayBpZiBzdHJ1Y3R1cmUgaXMgc29tZWhvdyBtaXNzaW5nXHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXN1bHREaXYuaW5uZXJIVE1MID0gYDxzdHJvbmc+8J+kliBBSSBBbmFseXNpczo8L3N0cm9uZz4gPGJyPjxicj4ke2Zvcm1hdHRlZH1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY3VycmVudFJlc3VsdERpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSByZXNwb25zZSA/IChyZXNwb25zZS5lcnJvciB8fCAnVW5rbm93biBlcnJvcicpIDogJ1Vua25vd24gZXJyb3InO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0FJIEFuYWx5c2lzIGZhaWxlZDonLCBlcnJvck1zZyk7XHJcbiAgICAgICAgYWxlcnQoJ0FuYWx5c2lzIGZhaWxlZDogJyArIGVycm9yTXNnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGN1cnJlbnRCdG4pIHtcclxuICAgICAgICBjdXJyZW50QnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgY3VycmVudEJ0bi50ZXh0Q29udGVudCA9ICfwn6SWIEFuYWx5emUgd2l0aCBBSSc7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gTGlzdGVuIGZvciByZXNwb25zZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcblxyXG4gICAgLy8gRGlzcGF0Y2ggcmVxdWVzdCB0byBjb250ZW50IHNjcmlwdCAtPiBiYWNrZ3JvdW5kXHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBEaXNwYXRjaGluZyBBSSBhbmFseXNpcyByZXF1ZXN0Jyk7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZmJBZHNBbmFseXplUmVxdWVzdCcsIHtcclxuICAgICAgZGV0YWlsOiB7XHJcbiAgICAgICAgYXBpS2V5OiBzdGF0ZS5haUNvbmZpZy5hcGlLZXksXHJcbiAgICAgICAgc3lzdGVtUHJvbXB0OiBzeXN0ZW1Qcm9tcHQsXHJcbiAgICAgICAgdXNlckNvbnRlbnQ6IHVzZXJDb250ZW50XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICAvLyBGYWxsYmFjay9UaW1lb3V0IGNsZWFudXBcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAvLyBSZS1xdWVyeSBidG4gZm9yIHRpbWVvdXQgY2hlY2tcclxuICAgICAgY29uc3QgY3VycmVudEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuICAgICAgaWYgKGN1cnJlbnRCdG4gJiYgY3VycmVudEJ0bi5kaXNhYmxlZCAmJiBjdXJyZW50QnRuLnRleHRDb250ZW50ID09PSAn8J+kliBBbmFseXppbmcuLi4nKSB7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcbiAgICAgICAgY3VycmVudEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN1cnJlbnRCdG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXplIHdpdGggQUknO1xyXG4gICAgICAgIGNvbnNvbGUud2FybignW0ZCIEFkcyBWaXN1YWxpemVyXSBBSSByZXF1ZXN0IHRpbWVkIG91dCcpO1xyXG4gICAgICB9XHJcbiAgICB9LCA2MDAwMCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gLS0tIEV2ZW50IEJyaWRnZSAtLS1cclxuXHJcbiAgLy8gTGlzdGVuIGZvciBpbXBvcnRlZCBkYXRhIHZpYSBDdXN0b21FdmVudCAoZnJvbSBpbmplY3RlZC5qcylcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc0ltcG9ydERhdGEnLCAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIFJlY2VpdmVkIGltcG9ydGVkIGRhdGEgdmlhIEN1c3RvbUV2ZW50Jyk7XHJcbiAgICBsb2FkSW1wb3J0ZWREYXRhKGV2ZW50LmRldGFpbCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgcmVvcGVuIHJlcXVlc3RcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc1Jlb3BlbicsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIFJlb3BlbmluZyBvdmVybGF5Jyk7XHJcbiAgICBzaG93T3ZlcmxheSgpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIEFJIENvbmZpZ1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzQ29uZmlnJywgKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBSZWNlaXZlZCBBSSBDb25maWcnKTtcclxuICAgIHN0YXRlLmFpQ29uZmlnID0gZXZlbnQuZGV0YWlsO1xyXG4gICAgdXBkYXRlVmlldygpOyAvLyBSZS1yZW5kZXIgdG8gc2hvdyBBSSBidXR0b24gaWYgbmVlZGVkXHJcbiAgfSk7XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgU2NyYXBpbmcgU3RhdHVzXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNTdGF0dXMnLCAoZXZlbnQpID0+IHtcclxuICAgIGNvbnN0IHsgc2Nyb2xsaW5nLCBhZHNGb3VuZCwgbWVzc2FnZSB9ID0gZXZlbnQuZGV0YWlsO1xyXG5cclxuICAgIC8vIEVuc3VyZSBvdmVybGF5IGlzIHZpc2libGUgYnV0IG1pbmltaXplZFxyXG4gICAgaWYgKHNjcm9sbGluZykge1xyXG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21pbmltaXplZCcpO1xyXG4gICAgICBzdGF0ZS5pc01pbmltaXplZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWluQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWluaW1pemVkQmFyJyk7XHJcbiAgICBjb25zdCBpY29uID0gbWluQmFyLnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtbWluaS1pY29uJyk7XHJcbiAgICBjb25zdCB0ZXh0ID0gbWluQmFyLnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtbWluaS10ZXh0Jyk7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNYXhpbWl6ZUJ0bicpO1xyXG5cclxuICAgIGlmIChzY3JvbGxpbmcpIHtcclxuICAgICAgaWNvbi5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJmYi1hZHMtbWluaS1zcGlubmVyXCI+8J+UhDwvc3Bhbj4nO1xyXG4gICAgICB0ZXh0LnRleHRDb250ZW50ID0gbWVzc2FnZTtcclxuICAgICAgLy8gbWluQmFyLnN0eWxlLmJhY2tncm91bmQgPSAnbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0LCAjZjU5ZTBiLCAjZDk3NzA2KSc7IC8vIFJlbW92ZWQgdG8gbWF0Y2ggc3R5bGluZ1xyXG4gICAgICBidG4uc3R5bGUuZGlzcGxheSA9ICdub25lJzsgLy8gSGlkZSBcIlNob3dcIiBidXR0b24gd2hpbGUgc2NyYXBpbmdcclxuXHJcbiAgICAgIC8vIEFkZCBzcGlubmVyIHN0eWxlIGlmIG5vdCBleGlzdHNcclxuICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJykpIHtcclxuICAgICAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgc3R5bGUuaWQgPSAnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJztcclxuICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcclxuICAgICAgQGtleWZyYW1lcyBmYkFkc1NwaW4gezEwMCAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfX1cclxuICAgICAgLmZiLWFkcy1taW5pLXNwaW5uZXIge2Rpc3BsYXk6IGlubGluZS1ibG9jazsgYW5pbWF0aW9uOiBmYkFkc1NwaW4gMXMgbGluZWFyIGluZmluaXRlOyB9XHJcbiAgICAgIGA7XHJcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERvbmVcclxuICAgICAgaWNvbi5pbm5lckhUTUwgPSBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogMjRweDsgaGVpZ2h0OiAyNHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyO1wiPmA7XHJcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSAnQW5hbHlzaXMgUmVhZHkhJztcclxuICAgICAgbWluQmFyLnN0eWxlLmJhY2tncm91bmQgPSAnJzsgLy8gUmV2ZXJ0IHRvIGRlZmF1bHQgYmx1ZS9wdXJwbGVcclxuICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBFeHBvc2UgcmVvcGVuIGhlbHBlclxyXG4gIHdpbmRvdy5mYkFkc1Jlb3Blbk92ZXJsYXkgPSBzaG93T3ZlcmxheTtcclxuXHJcbiAgLy8gQ2hlY2sgZm9yIHByZS1pbmplY3RlZCBkYXRhIChmcm9tIGZpbGUgaW1wb3J0KVxyXG4gIGNvbnN0IHByZUluamVjdGVkRGF0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydGVkRGF0YScpO1xyXG4gIGlmIChwcmVJbmplY3RlZERhdGEpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHByZUluamVjdGVkRGF0YS50ZXh0Q29udGVudCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIEZvdW5kIHByZS1pbmplY3RlZCBkYXRhLCBsb2FkaW5nLi4uJyk7XHJcbiAgICAgIGxvYWRJbXBvcnRlZERhdGEoanNvbik7XHJcbiAgICAgIC8vIENsZWFuIHVwXHJcbiAgICAgIHByZUluamVjdGVkRGF0YS5yZW1vdmUoKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0ZCIEFkcyBWaXN1YWxpemVyXSBFcnJvciBsb2FkaW5nIHByZS1pbmplY3RlZCBk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

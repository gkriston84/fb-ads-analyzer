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
    const renderMin = new Date(minDate.getTime() - padding);
    const renderMax = new Date(maxDate.getTime() + padding);
    const totalDuration = renderMax - renderMin;
    const header = document.createElement("div");
    header.className = "fb-ads-timeline-header";
    header.innerHTML = `
       <div class="fb-ads-timeline-label"><strong>Campaign</strong></div>
       <div class="fb-ads-timeline-grid"></div>
    `;
    chartContent.appendChild(header);
    const grid = header.querySelector(".fb-ads-timeline-grid");
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
        }
        d.setMonth(d.getMonth() + 1);
      }
    }
    let lastDomain = null;
    campaignsToRender.forEach((campaign) => {
      const domain = getDomain(campaign.url);
      if (state.groupByDomain && domain !== lastDomain) {
        const groupHeader = document.createElement("div");
        groupHeader.className = "fb-ads-domain-header";
        groupHeader.innerHTML = `<div class="fb-ads-domain-name">${domain}</div>`;
        chartContent.appendChild(groupHeader);
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
      chartContent.appendChild(row);
    });
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
       <div id="fbAdsAIResult" style="display: none; padding: 12px 16px; margin-bottom: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; overflow: hidden;">
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
    document.getElementById("fbAdsStatusText").textContent = `Loaded ${state.rawCampaigns.length} campaigns`;
    document.getElementById("fbAdsSpinner").style.display = "none";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXplci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Zpc3VhbGl6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogRmFjZWJvb2sgQWRzIEFuYWx5emVyIC0gVmlzdWFsaXplciBTY3JpcHQgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgY29uc29sZS5sb2coJ1tGQiBBZHMgQW5hbHl6ZXJdIFZpc3VhbGl6ZXIgc2NyaXB0IGxvYWRlZCcpO1xyXG5cclxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50XHJcbiAgY29uc3Qgc3RhdGUgPSB7XHJcbiAgICByYXdDYW1wYWlnbnM6IFtdLFxyXG4gICAgcHJvY2Vzc2VkQ2FtcGFpZ25zOiBbXSxcclxuICAgIGFsbEFkczogW10sXHJcbiAgICBmaWx0ZXJEb21haW46ICdhbGwnLFxyXG4gICAgZmlsdGVyVGV4dDogJycsXHJcbiAgICBmaWx0ZXJTb3J0OiAncmVjZW50JywgLy8gJ3JlY2VudCcsICdkdXJhdGlvbicsICdhZHMnXHJcbiAgICBncm91cEJ5RG9tYWluOiBmYWxzZSxcclxuICAgIGlzTWluaW1pemVkOiB0cnVlLFxyXG4gICAgY3VycmVudFZpZXc6ICd0aW1lbGluZScsIC8vICd0aW1lbGluZScsICd0b3A1LXRleHQnLCAnYWxsLWNvcHknXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBhaUNvbmZpZzogbnVsbCxcclxuICAgIGlzQW5hbHl6aW5nOiBmYWxzZSxcclxuICAgIGFpQ29uZmlnOiBudWxsLFxyXG4gICAgbWV0YWRhdGE6IG51bGwsXHJcbiAgICBzb3J0RGlyZWN0aW9uOiAnYXNjJywgLy8gJ2FzYycgb3IgJ2Rlc2MnXHJcbiAgICBpc0ltcG9ydGVkOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIC8vIENvbG9yIEhlbHBlclxyXG4gIGZ1bmN0aW9uIGdldEFkQ291bnRDb2xvcihjb3VudCkge1xyXG4gICAgaWYgKGNvdW50ID49IDEwMCkgcmV0dXJuICcjZWY0NDQ0JzsgLy8gUmVkXHJcbiAgICBpZiAoY291bnQgPj0gNTApIHJldHVybiAnI2Y5NzMxNic7ICAvLyBPcmFuZ2VcclxuICAgIGlmIChjb3VudCA+PSAyMCkgcmV0dXJuICcjZWFiMzA4JzsgIC8vIFllbGxvd1xyXG4gICAgaWYgKGNvdW50ID49IDEwKSByZXR1cm4gJyMyMmM1NWUnOyAgLy8gR3JlZW5cclxuICAgIGlmIChjb3VudCA+PSA1KSByZXR1cm4gJyMzYjgyZjYnOyAgIC8vIEJsdWVcclxuICAgIHJldHVybiAnIzhiNWNmNic7ICAgICAgICAgICAgICAgICAgIC8vIFB1cnBsZVxyXG4gIH1cclxuXHJcbiAgLy8gR2V0IGxvZ28gVVJMIGZyb20gY29uZmlnIGVsZW1lbnQgKHNldCBieSBjb250ZW50LmpzKVxyXG4gIGNvbnN0IGNvbmZpZ0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ29uZmlnJyk7XHJcbiAgY29uc3QgbG9nb1VybCA9IGNvbmZpZ0VsPy5kYXRhc2V0Py5sb2dvVXJsIHx8ICcnO1xyXG5cclxuICAvLyBDcmVhdGUgdGhlIGZsb2F0aW5nIG92ZXJsYXlcclxuICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgb3ZlcmxheS5pZCA9ICdmYkFkc0FuYWx5emVyT3ZlcmxheSc7XHJcbiAgb3ZlcmxheS5jbGFzc05hbWUgPSAnaGlkZGVuIG1pbmltaXplZCc7XHJcbiAgb3ZlcmxheS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaW1pemVkLWJhclwiIGlkPVwiZmJBZHNNaW5pbWl6ZWRCYXJcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktY29udGVudFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pLWljb25cIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogMjRweDsgaGVpZ2h0OiAyNHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyO1wiPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktdGV4dFwiPkZhY2Vib29rIEFkcyBDYW1wYWlnbiBBbmFseXplcjwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1taW5pLWJ0blwiIGlkPVwiZmJBZHNNYXhpbWl6ZUJ0blwiPlNob3c8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYW5hbHl6ZXItY29udGFpbmVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1wYW5lbFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDtcIj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAyNHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogNDBweDsgaGVpZ2h0OiA0MHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyOyBib3JkZXI6IDFweCBzb2xpZCAjZTVlN2ViO1wiPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8aDE+RmFjZWJvb2sgQWRzIENhbXBhaWduIEFuYWx5emVyPC9oMT5cclxuICAgICAgICAgICAgICAgIDxwIGlkPVwiZmJBZHNTdWJ0aXRsZVwiPlRpbWVsaW5lICYgQ2FtcGFpZ24gQW5hbHlzaXM8L3A+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWhlYWRlci1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYnRuXCIgaWQ9XCJmYkFkc01pbmltaXplQnRuXCIgdGl0bGU9XCJNaW5pbWl6ZVwiPl88L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWhlYWRlci1idG5cIiBpZD1cImZiQWRzQ2xvc2VCdG5cIiB0aXRsZT1cIkNsb3NlXCI+w5c8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sc1wiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtcm93XCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IHdpZHRoOiAxMDAlOyBtYXJnaW4tYm90dG9tOiAxMnB4OyBhbGlnbi1pdGVtczogY2VudGVyOyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogMTJweDtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6ICMzNzQxNTE7XCI+Vmlldzo8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZSBhY3RpdmVcIiBkYXRhLXZpZXc9XCJ0aW1lbGluZVwiPvCfk4ogVGltZWxpbmU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS12aWV3PVwidG9wNS10ZXh0XCI+8J+PhiBUb3AgNSBUZXh0PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDUwMDsgZm9udC1zaXplOiAxM3B4OyBjb2xvcjogIzM3NDE1MTtcIj5Tb3J0Ojwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lIGFjdGl2ZVwiIGRhdGEtc29ydD1cInJlY2VudFwiPlN0YXJ0IERhdGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS1zb3J0PVwiZHVyYXRpb25cIj5EdXJhdGlvbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXNvcnQ9XCJhZHNcIj4jIG9mIEFkczwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBpZD1cImZiQWRzR3JvdXBEb21haW5CdG5cIiB0aXRsZT1cIkdyb3VwIGNhbXBhaWducyBieSBkb21haW5cIj7wn5OCIEdyb3VwIGJ5IERvbWFpbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiIHN0eWxlPVwiZmxleDogMTsgbWF4LXdpZHRoOiAzMDBweDtcIj5cclxuICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiZmJBZHNGaWx0ZXJJbnB1dFwiIGNsYXNzPVwiZmItYWRzLWlucHV0XCIgcGxhY2Vob2xkZXI9XCLwn5SNIEZpbHRlciBjYW1wYWlnbnMuLi5cIiBzdHlsZT1cIndpZHRoOiAxMDAlO1wiPlxyXG4gICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiBhdXRvO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCIgaWQ9XCJmYkFkc0Rvd25sb2FkQnRuXCI+8J+SviBEb3dubG9hZCBEYXRhPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIiBpZD1cImZiQWRzSW1wb3J0QnRuXCI+8J+TgiBJbXBvcnQgRGF0YTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZmlsZVwiIGlkPVwiZmJBZHNJbXBvcnRJbnB1dFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBhY2NlcHQ9XCIuanNvblwiPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kXCIgaWQ9XCJmYkFkc1RpbWVsaW5lTGVnZW5kXCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyB3aWR0aDogMTAwJTsgZ2FwOiAxNnB4OyBwYWRkaW5nLXRvcDogMTJweDsgYm9yZGVyLXRvcDogMXB4IHNvbGlkICNlNWU3ZWI7XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICM4YjVjZjY7XCI+PC9kaXY+IDEtNCBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogIzNiODJmNjtcIj48L2Rpdj4gNS05IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjMjJjNTVlO1wiPjwvZGl2PiAxMC0xOSBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2VhYjMwODtcIj48L2Rpdj4gMjAtNDkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICNmOTczMTY7XCI+PC9kaXY+IDUwLTk5IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZWY0NDQ0O1wiPjwvZGl2PiAxMDArIGFkczwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtc3RhdHVzLWJhclwiIHN0eWxlPVwiYm9yZGVyOiBub25lOyBwYWRkaW5nLXRvcDogMDsgcGFkZGluZy1ib3R0b206IDA7XCI+XHJcbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1zcGlubmVyXCIgaWQ9XCJmYkFkc1NwaW5uZXJcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXN0YXR1cy10ZXh0XCIgaWQ9XCJmYkFkc1N0YXR1c1RleHRcIj5Mb2FkaW5nIGFuYWx5c2lzIGRhdGEuLi48L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2hhcnQtY29udGFpbmVyXCIgaWQ9XCJmYkFkc0NoYXJ0Q29udGVudFwiPlxyXG4gICAgICAgICAgICAgPCEtLSBEeW5hbWljIENvbnRlbnQgLS0+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIFxyXG4gICAgICA8IS0tIE1vZGFsIENvbnRhaW5lciAtLT5cclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1vdmVybGF5XCIgaWQ9XCJmYkFkc01vZGFsT3ZlcmxheVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWxcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtdGl0bGVcIj5cclxuICAgICAgICAgICAgICA8aDIgaWQ9XCJmYkFkc01vZGFsVGl0bGVcIj5DYW1wYWlnbiBEZXRhaWxzPC9oMj5cclxuICAgICAgICAgICAgICA8cCBjbGFzcz1cImZiLWFkcy1tb2RhbC1tZXRhXCIgaWQ9XCJmYkFkc01vZGFsTWV0YVwiPnVybC4uLjwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtbW9kYWwtY2xvc2VcIiBpZD1cImZiQWRzTW9kYWxDbG9zZVwiPsOXPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtYm9keVwiIGlkPVwiZmJBZHNNb2RhbEJvZHlcIj5cclxuICAgICAgICAgICAgIDwhLS0gRGV0YWlscyAtLT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XHJcblxyXG4gIC8vIFRvb2x0aXBcclxuICBjb25zdCB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgdG9vbHRpcC5jbGFzc05hbWUgPSAnZmItYWRzLXRvb2x0aXAnO1xyXG4gIG92ZXJsYXkuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XHJcblxyXG4gIC8vIC0tLSBFdmVudCBMaXN0ZW5lcnMgLS0tXHJcblxyXG4gIC8vIEhlYWRlciBBY3Rpb25zXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ2xvc2VCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVPdmVybGF5KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlTWluaW1pemUpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01heGltaXplQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNaW5pbWl6ZSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWluaW1pemVkQmFyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNaW5pbWl6ZSk7XHJcblxyXG4gIC8vIE1vZGFsIEFjdGlvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbENsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlTW9kYWwpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsT3ZlcmxheScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgIGlmIChlLnRhcmdldC5pZCA9PT0gJ2ZiQWRzTW9kYWxPdmVybGF5JykgaGlkZU1vZGFsKCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIE1haW4gQWN0aW9uc1xyXG5cclxuXHJcbiAgLy8gTWFpbiBBY3Rpb25zXHJcbiAgY29uc3QgZmlsdGVySW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNGaWx0ZXJJbnB1dCcpO1xyXG4gIGZpbHRlcklucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcclxuICAgIHN0YXRlLmZpbHRlclRleHQgPSBlLnRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdXBkYXRlVmlldygpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNEb3dubG9hZEJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZG93bmxvYWREYXRhKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydElucHV0JykuY2xpY2soKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRJbnB1dCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVJbXBvcnQpO1xyXG5cclxuXHJcbiAgLy8gVmlldyBTd2l0Y2hlclxyXG4gIGNvbnN0IHZpZXdCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdmlld10nKTtcclxuICB2aWV3QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICB2aWV3QnV0dG9ucy5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XHJcbiAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICBzdGF0ZS5jdXJyZW50VmlldyA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS12aWV3Jyk7XHJcblxyXG4gICAgICBjb25zdCBsZWdlbmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNUaW1lbGluZUxlZ2VuZCcpO1xyXG4gICAgICBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0aW1lbGluZScpIHtcclxuICAgICAgICBsZWdlbmQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWdlbmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgfVxyXG4gICAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gU29ydCBTd2l0Y2hlclxyXG4gIGNvbnN0IHNvcnRCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc29ydF0nKTtcclxuXHJcbiAgLy8gSGVscGVyIHRvIHVwZGF0ZSBidXR0b24gbGFiZWxzXHJcbiAgY29uc3QgdXBkYXRlU29ydEJ1dHRvbnMgPSAoKSA9PiB7XHJcbiAgICBzb3J0QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICAgIGNvbnN0IHNvcnRUeXBlID0gYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1zb3J0Jyk7XHJcbiAgICAgIGxldCBsYWJlbCA9IGJ0bi5pbm5lclRleHQucmVwbGFjZSgvIFvihpHihpNdLywgJycpOyAvLyBDbGVhbiBleGlzdGluZyBhcnJvd1xyXG5cclxuICAgICAgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09IHNvcnRUeXBlKSB7XHJcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vIEFkZCBhcnJvd1xyXG4gICAgICAgIGxhYmVsICs9IHN0YXRlLnNvcnREaXJlY3Rpb24gPT09ICdhc2MnID8gJyDihpEnIDogJyDihpMnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgfVxyXG4gICAgICBidG4uaW5uZXJUZXh0ID0gbGFiZWw7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBzb3J0QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB0YXJnZXRTb3J0ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNvcnQnKTtcclxuXHJcbiAgICAgIGlmIChzdGF0ZS5maWx0ZXJTb3J0ID09PSB0YXJnZXRTb3J0KSB7XHJcbiAgICAgICAgLy8gVG9nZ2xlIGRpcmVjdGlvblxyXG4gICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSBzdGF0ZS5zb3J0RGlyZWN0aW9uID09PSAnYXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIE5ldyBzb3J0OiBEZWZhdWx0IHRvICdkZXNjJyBmb3IgZXZlcnl0aGluZz8gXHJcbiAgICAgICAgLy8gVXN1YWxseSAnU3RhcnQgRGF0ZScgdXNlcnMgbWlnaHQgd2FudCBPbGRlc3QgRmlyc3QgKEFzYykgb3IgTmV3ZXN0IEZpcnN0IChEZXNjKS5cclxuICAgICAgICAvLyBMZXQncyBkZWZhdWx0IHRvICdkZXNjJyAoSGlnaC9OZXdlc3QpIGFzIHN0YW5kYXJkLCBidXQgbWF5YmUgJ2FzYycgZm9yIERhdGU/XHJcbiAgICAgICAgLy8gVGhlIG9yaWdpbmFsIGNvZGUgaGFkIGRlZmF1bHQgRGF0ZSBhcyBBc2MgKE9sZGVzdCBmaXJzdCkuXHJcbiAgICAgICAgaWYgKHRhcmdldFNvcnQgPT09ICdyZWNlbnQnKSB7XHJcbiAgICAgICAgICBzdGF0ZS5zb3J0RGlyZWN0aW9uID0gJ2FzYyc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSAnZGVzYyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlLmZpbHRlclNvcnQgPSB0YXJnZXRTb3J0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB1cGRhdGVTb3J0QnV0dG9ucygpO1xyXG4gICAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gSW5pdCBidXR0b24gbGFiZWxzXHJcbiAgdXBkYXRlU29ydEJ1dHRvbnMoKTtcclxuXHJcbiAgLy8gR3JvdXAgYnkgRG9tYWluXHJcbiAgY29uc3QgZ3JvdXBCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNHcm91cERvbWFpbkJ0bicpO1xyXG4gIGdyb3VwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc3RhdGUuZ3JvdXBCeURvbWFpbiA9ICFzdGF0ZS5ncm91cEJ5RG9tYWluO1xyXG4gICAgZ3JvdXBCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XHJcbiAgICB1cGRhdGVWaWV3KCk7XHJcbiAgfSk7XHJcblxyXG5cclxuICAvLyAtLS0gRnVuY3Rpb25zIC0tLVxyXG5cclxuICBmdW5jdGlvbiBzaG93T3ZlcmxheSgpIHtcclxuICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ21pbmltaXplZCcpO1xyXG4gICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhpZGVPdmVybGF5KCkge1xyXG4gICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRvZ2dsZU1pbmltaXplKGUpIHtcclxuICAgIGlmIChlKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSAhc3RhdGUuaXNNaW5pbWl6ZWQ7XHJcbiAgICBpZiAoc3RhdGUuaXNNaW5pbWl6ZWQpIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdtaW5pbWl6ZWQnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnbWluaW1pemVkJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzaG93TW9kYWwoY29udGVudEh0bWwsIHRpdGxlLCBtZXRhKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbFRpdGxlJykuaW5uZXJUZXh0ID0gdGl0bGU7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE1ldGEnKS5pbm5lclRleHQgPSBtZXRhO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxCb2R5JykuaW5uZXJIVE1MID0gY29udGVudEh0bWw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgc2V0dXBDb3B5QnV0dG9ucyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbEJvZHknKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoaWRlTW9kYWwoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29weVJpY2hUZXh0KHBsYWluLCBodG1sKSB7XHJcbiAgICBpZiAodHlwZW9mIENsaXBib2FyZEl0ZW0gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgY29uc3QgdGV4dEJsb2IgPSBuZXcgQmxvYihbcGxhaW5dLCB7IHR5cGU6IFwidGV4dC9wbGFpblwiIH0pO1xyXG4gICAgICBjb25zdCBodG1sQmxvYiA9IG5ldyBCbG9iKFtodG1sXSwgeyB0eXBlOiBcInRleHQvaHRtbFwiIH0pO1xyXG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlKFtcclxuICAgICAgICBuZXcgQ2xpcGJvYXJkSXRlbSh7XHJcbiAgICAgICAgICBcInRleHQvcGxhaW5cIjogdGV4dEJsb2IsXHJcbiAgICAgICAgICBcInRleHQvaHRtbFwiOiBodG1sQmxvYlxyXG4gICAgICAgIH0pXHJcbiAgICAgIF0pLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlJpY2ggY29weSBmYWlsZWQsIGZhbGxpbmcgYmFjayB0byBwbGFpbjpcIiwgZXJyKTtcclxuICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwbGFpbik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocGxhaW4pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0dXBDb3B5QnV0dG9ucyhjb250YWluZXIpIHtcclxuICAgIGNvbnN0IGNvcHlCdG5zID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5mYi1hZHMtY29weS1idG4nKTtcclxuICAgIGNvcHlCdG5zLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQ7IC8vIFVzZSBjdXJyZW50VGFyZ2V0IHRvIGVuc3VyZSB3ZSBnZXQgdGhlIGJ1dHRvbiwgbm90IGljb25cclxuICAgICAgICBjb25zdCByYXdUZXh0ID0gZGVjb2RlVVJJQ29tcG9uZW50KHRhcmdldC5kYXRhc2V0LmNvcHlUZXh0KTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCBtZXRhZGF0YSBpZiBhdmFpbGFibGVcclxuICAgICAgICBjb25zdCBtZXRhID0ge1xyXG4gICAgICAgICAgdXJsOiB0YXJnZXQuZGF0YXNldC51cmwgPyBkZWNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQudXJsKSA6ICcnLFxyXG4gICAgICAgICAgY2FtcGFpZ25EdXJhdGlvbjogdGFyZ2V0LmRhdGFzZXQuY2FtcGFpZ25EdXJhdGlvbiB8fCAnJyxcclxuICAgICAgICAgIGNhbXBhaWduQWRzOiB0YXJnZXQuZGF0YXNldC5jYW1wYWlnbkFkcyB8fCAnJyxcclxuICAgICAgICAgIGxpYklkOiB0YXJnZXQuZGF0YXNldC5hZExpYklkIHx8ICcnLFxyXG4gICAgICAgICAgYWREdXJhdGlvbjogdGFyZ2V0LmRhdGFzZXQuYWREdXJhdGlvbiB8fCAnJyxcclxuICAgICAgICAgIGFkRGF0ZXM6IHRhcmdldC5kYXRhc2V0LmFkRGF0ZXMgfHwgJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDb25zdHJ1Y3QgUmljaCBUZXh0IEhUTUxcclxuICAgICAgICBjb25zdCByaWNoVGV4dCA9IGBcclxuICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LWZhbWlseTogc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNHB4OyBsaW5lLWhlaWdodDogMS41OyBjb2xvcjogIzM3NDE1MTtcIj5cclxuICAgICAgICAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDhweDtcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkNhbXBhaWduOjwvc3Ryb25nPiA8YSBocmVmPVwiJHttZXRhLnVybH1cIj4ke21ldGEudXJsfTwvYT48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHttZXRhLmNhbXBhaWduRHVyYXRpb24gPyBgPHN0cm9uZz5EdXJhdGlvbjo8L3N0cm9uZz4gJHttZXRhLmNhbXBhaWduRHVyYXRpb259IGRheXNgIDogJyd9IFxyXG4gICAgICAgICAgICAgICAgICAgICR7bWV0YS5jYW1wYWlnbkFkcyA/IGDigKIgJHttZXRhLmNhbXBhaWduQWRzfSBhZHNgIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTJweDsgcGFkZGluZy1ib3R0b206IDEycHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTVlN2ViO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TGlicmFyeSBJRDo8L3N0cm9uZz4gPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHttZXRhLmxpYklkfVwiPiR7bWV0YS5saWJJZH08L2E+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RGF0ZXM6PC9zdHJvbmc+ICR7bWV0YS5hZERhdGVzfSB8IDxzdHJvbmc+QWQgRHVyYXRpb246PC9zdHJvbmc+ICR7bWV0YS5hZER1cmF0aW9ufSBkYXlzXHJcbiAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyYXdUZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpfVxyXG4gICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgLy8gQ29uc3RydWN0IFBsYWluIFRleHQgRmFsbGJhY2tcclxuICAgICAgICBjb25zdCBwbGFpblRleHQgPSBgQ2FtcGFpZ246ICR7bWV0YS51cmx9XFxuRHVyYXRpb246ICR7bWV0YS5jYW1wYWlnbkR1cmF0aW9ufSBkYXlzIOKAoiAke21ldGEuY2FtcGFpZ25BZHN9IGFkc1xcblxcbkxpYnJhcnkgSUQ6ICR7bWV0YS5saWJJZH1cXG5EYXRlczogJHttZXRhLmFkRGF0ZXN9IHwgQWQgRHVyYXRpb246ICR7bWV0YS5hZER1cmF0aW9ufSBkYXlzXFxuXFxuLS0tXFxuXFxuJHtyYXdUZXh0fWA7XHJcblxyXG4gICAgICAgIC8vIFVzZSByaWNoIHRleHQgY29weSBoZWxwZXJcclxuICAgICAgICBjb3B5UmljaFRleHQocGxhaW5UZXh0LCByaWNoVGV4dCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsID0gdGFyZ2V0LmlubmVySFRNTDtcclxuICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gJ+KchSBDb3BpZWQhJztcclxuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCgnc3VjY2VzcycpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGFyZ2V0LmlubmVySFRNTCA9IG9yaWdpbmFsO1xyXG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ3N1Y2Nlc3MnKTtcclxuICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZVZpZXcoKSB7XHJcbiAgICBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0aW1lbGluZScpIHtcclxuICAgICAgcmVuZGVyVGltZWxpbmUoKTtcclxuICAgIH0gZWxzZSBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0b3A1LXRleHQnKSB7XHJcbiAgICAgIHJlbmRlclRvcDVUZXh0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcm9jZXNzRGF0YShjYW1wYWlnbnMpIHtcclxuICAgIGxldCBzb3J0ZWQgPSBbLi4uY2FtcGFpZ25zXTtcclxuICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIFByb2Nlc3NpbmcgZGF0YS4gU29ydDonLCBzdGF0ZS5maWx0ZXJTb3J0LCAnR3JvdXA6Jywgc3RhdGUuZ3JvdXBCeURvbWFpbik7XHJcblxyXG4gICAgLy8gMS4gU29ydGluZyBMb2dpY1xyXG4gICAgLy8gMC4gRmlsdGVyIExvZ2ljXHJcbiAgICBpZiAoc3RhdGUuZmlsdGVyVGV4dCkge1xyXG4gICAgICBzb3J0ZWQgPSBzb3J0ZWQuZmlsdGVyKGMgPT5cclxuICAgICAgICBjLnVybC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHN0YXRlLmZpbHRlclRleHQpIHx8XHJcbiAgICAgICAgKGMudG9wNSAmJiBjLnRvcDUuc29tZShhZCA9PiBhZC5hZFRleHQgJiYgYWQuYWRUZXh0LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RhdGUuZmlsdGVyVGV4dCkpKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDEuIFNvcnRpbmcgTG9naWNcclxuICAgIHNvcnRlZC5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgIGxldCB2YWxBLCB2YWxCO1xyXG5cclxuICAgICAgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09ICdhZHMnKSB7XHJcbiAgICAgICAgdmFsQSA9IE51bWJlcihhLmFkc0NvdW50KSB8fCAwO1xyXG4gICAgICAgIHZhbEIgPSBOdW1iZXIoYi5hZHNDb3VudCkgfHwgMDtcclxuICAgICAgfSBlbHNlIGlmIChzdGF0ZS5maWx0ZXJTb3J0ID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgdmFsQSA9IE51bWJlcihhLmNhbXBhaWduRHVyYXRpb25EYXlzKSB8fCAwO1xyXG4gICAgICAgIHZhbEIgPSBOdW1iZXIoYi5jYW1wYWlnbkR1cmF0aW9uRGF5cykgfHwgMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAncmVjZW50JyAvIFN0YXJ0IERhdGVcclxuICAgICAgICB2YWxBID0gbmV3IERhdGUoYS5maXJzdEFkdmVydGlzZWQpLmdldFRpbWUoKTtcclxuICAgICAgICB2YWxCID0gbmV3IERhdGUoYi5maXJzdEFkdmVydGlzZWQpLmdldFRpbWUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3RhbmRhcmQgQXNjZW5kaW5nOiB2YWxBIC0gdmFsQlxyXG4gICAgICBjb25zdCBjb21wYXJpc29uID0gdmFsQSAtIHZhbEI7XHJcblxyXG4gICAgICAvLyBBcHBseSBEaXJlY3Rpb25cclxuICAgICAgcmV0dXJuIHN0YXRlLnNvcnREaXJlY3Rpb24gPT09ICdhc2MnID8gY29tcGFyaXNvbiA6IC1jb21wYXJpc29uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gMi4gR3JvdXBpbmcgTG9naWMgKFNlY29uZGFyeSBTb3J0KVxyXG4gICAgaWYgKHN0YXRlLmdyb3VwQnlEb21haW4pIHtcclxuICAgICAgc29ydGVkLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICBjb25zdCBkQSA9IGdldERvbWFpbihhLnVybCk7XHJcbiAgICAgICAgY29uc3QgZEIgPSBnZXREb21haW4oYi51cmwpO1xyXG4gICAgICAgIGlmIChkQSA8IGRCKSByZXR1cm4gLTE7XHJcbiAgICAgICAgaWYgKGRBID4gZEIpIHJldHVybiAxO1xyXG4gICAgICAgIC8vIEtlZXAgcHJldmlvdXMgc29ydCBvcmRlciB3aXRoaW4gc2FtZSBkb21haW5cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNvcnRlZDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldERvbWFpbih1cmwpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBuZXcgVVJMKHVybCkuaG9zdG5hbWUucmVwbGFjZSgnd3d3LicsICcnKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gdXJsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyVGltZWxpbmUoKSB7XHJcbiAgICBjb25zdCBjaGFydENvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDaGFydENvbnRlbnQnKTtcclxuICAgIGNoYXJ0Q29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCdmYi1hZHMtYmctZ3JheScpO1xyXG4gICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgIGNvbnN0IGNhbXBhaWduc1RvUmVuZGVyID0gcHJvY2Vzc0RhdGEoc3RhdGUucmF3Q2FtcGFpZ25zKTtcclxuXHJcbiAgICBpZiAoY2FtcGFpZ25zVG9SZW5kZXIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNoYXJ0Q29udGVudC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImZiLWFkcy1lbXB0eS1zdGF0ZVwiPk5vIGNhbXBhaWducyBtYXRjaCBjcml0ZXJpYTwvZGl2Pic7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdWJ0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1N1YnRpdGxlJyk7XHJcbiAgICBpZiAoc3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgY29uc3QgZmlyc3QgPSBuZXcgRGF0ZShzdGF0ZS5yYXdDYW1wYWlnbnNbc3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aCAtIDFdLmZpcnN0QWR2ZXJ0aXNlZCk7XHJcbiAgICAgIGNvbnN0IGxhc3QgPSBuZXcgRGF0ZShzdGF0ZS5yYXdDYW1wYWlnbnNbMF0ubGFzdEFkdmVydGlzZWQpOyAvLyBSb3VnaCBhcHByb3ggZGVwZW5kaW5nIG9uIHNvcnRcclxuICAgICAgc3VidGl0bGUudGV4dENvbnRlbnQgPSBgJHtzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RofSBjYW1wYWlnbnMgYW5hbHl6ZWRgO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgVGltZWxpbmUgUmFuZ2VcclxuICAgIGxldCBtaW5EYXRlID0gbmV3IERhdGUoKTtcclxuICAgIGxldCBtYXhEYXRlID0gbmV3IERhdGUoMCk7XHJcblxyXG4gICAgY2FtcGFpZ25zVG9SZW5kZXIuZm9yRWFjaChjID0+IHtcclxuICAgICAgaWYgKGMuZmlyc3RBZHZlcnRpc2VkIDwgbWluRGF0ZSkgbWluRGF0ZSA9IGMuZmlyc3RBZHZlcnRpc2VkO1xyXG4gICAgICBpZiAoYy5sYXN0QWR2ZXJ0aXNlZCA+IG1heERhdGUpIG1heERhdGUgPSBjLmxhc3RBZHZlcnRpc2VkO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgZGF5TXMgPSA4NjQwMDAwMDtcclxuICAgIC8vIEVuc3VyZSBhdCBsZWFzdCAxIGRheSByYW5nZSB0byBhdm9pZCBkaXZpc2lvbiBieSB6ZXJvXHJcbiAgICBsZXQgcmFuZ2VNcyA9IG1heERhdGUgLSBtaW5EYXRlO1xyXG4gICAgaWYgKHJhbmdlTXMgPCBkYXlNcykgcmFuZ2VNcyA9IGRheU1zO1xyXG5cclxuICAgIC8vIEFkZCBwYWRkaW5nIChtYXggb2YgNSBkYXlzIG9yIDEwJSBvZiB0b3RhbCByYW5nZSlcclxuICAgIGNvbnN0IHBhZGRpbmcgPSBNYXRoLm1heChkYXlNcyAqIDUsIHJhbmdlTXMgKiAwLjEpO1xyXG5cclxuICAgIGNvbnN0IHJlbmRlck1pbiA9IG5ldyBEYXRlKG1pbkRhdGUuZ2V0VGltZSgpIC0gcGFkZGluZyk7XHJcbiAgICBjb25zdCByZW5kZXJNYXggPSBuZXcgRGF0ZShtYXhEYXRlLmdldFRpbWUoKSArIHBhZGRpbmcpO1xyXG4gICAgY29uc3QgdG90YWxEdXJhdGlvbiA9IHJlbmRlck1heCAtIHJlbmRlck1pbjtcclxuXHJcbiAgICAvLyBIZWFkZXJcclxuICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaGVhZGVyLmNsYXNzTmFtZSA9ICdmYi1hZHMtdGltZWxpbmUtaGVhZGVyJztcclxuICAgIGhlYWRlci5pbm5lckhUTUwgPSBgXHJcbiAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRpbWVsaW5lLWxhYmVsXCI+PHN0cm9uZz5DYW1wYWlnbjwvc3Ryb25nPjwvZGl2PlxyXG4gICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10aW1lbGluZS1ncmlkXCI+PC9kaXY+XHJcbiAgICBgO1xyXG4gICAgY2hhcnRDb250ZW50LmFwcGVuZENoaWxkKGhlYWRlcik7XHJcblxyXG4gICAgY29uc3QgZ3JpZCA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLXRpbWVsaW5lLWdyaWQnKTtcclxuXHJcbiAgICAvLyBBZGFwdGl2ZSBNYXJrZXJzIGxvZ2ljXHJcbiAgICBjb25zdCBpc1Nob3J0UmFuZ2UgPSByYW5nZU1zIDwgKGRheU1zICogNjApO1xyXG5cclxuICAgIGlmIChpc1Nob3J0UmFuZ2UpIHtcclxuICAgICAgLy8gV2Vla2x5IG1hcmtlcnNcclxuICAgICAgbGV0IGQgPSBuZXcgRGF0ZShyZW5kZXJNaW4pO1xyXG4gICAgICB3aGlsZSAoZCA8PSByZW5kZXJNYXgpIHtcclxuICAgICAgICBjb25zdCBwb3MgPSAoKGQgLSByZW5kZXJNaW4pIC8gdG90YWxEdXJhdGlvbikgKiAxMDA7XHJcbiAgICAgICAgaWYgKHBvcyA+PSAwICYmIHBvcyA8PSAxMDApIHtcclxuICAgICAgICAgIGNvbnN0IG1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgbWFya2VyLmNsYXNzTmFtZSA9ICdmYi1hZHMtbW9udGgtbWFya2VyJztcclxuICAgICAgICAgIG1hcmtlci5zdHlsZS5sZWZ0ID0gYCR7cG9zfSVgO1xyXG4gICAgICAgICAgbWFya2VyLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vbnRoLWxhYmVsXCI+JHtkLnRvTG9jYWxlU3RyaW5nKCdkZWZhdWx0JywgeyBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycgfSl9PC9kaXY+YDtcclxuICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobWFya2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpICsgNyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE1vbnRobHkgbWFya2Vyc1xyXG4gICAgICBsZXQgZCA9IG5ldyBEYXRlKHJlbmRlck1pbik7XHJcbiAgICAgIGQuc2V0RGF0ZSgxKTtcclxuICAgICAgd2hpbGUgKGQgPD0gcmVuZGVyTWF4KSB7XHJcbiAgICAgICAgY29uc3QgcG9zID0gKChkIC0gcmVuZGVyTWluKSAvIHRvdGFsRHVyYXRpb24pICogMTAwO1xyXG4gICAgICAgIGlmIChwb3MgPj0gMCAmJiBwb3MgPD0gMTAwKSB7XHJcbiAgICAgICAgICBjb25zdCBtYXJrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgIG1hcmtlci5jbGFzc05hbWUgPSAnZmItYWRzLW1vbnRoLW1hcmtlcic7XHJcbiAgICAgICAgICBtYXJrZXIuc3R5bGUubGVmdCA9IGAke3Bvc30lYDtcclxuICAgICAgICAgIG1hcmtlci5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImZiLWFkcy1tb250aC1sYWJlbFwiPiR7ZC50b0xvY2FsZVN0cmluZygnZGVmYXVsdCcsIHsgbW9udGg6ICdzaG9ydCcsIHllYXI6ICcyLWRpZ2l0JyB9KX08L2Rpdj5gO1xyXG4gICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChtYXJrZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkLnNldE1vbnRoKGQuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVuZGVyIFJvd3NcclxuICAgIGxldCBsYXN0RG9tYWluID0gbnVsbDtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGNhbXBhaWduID0+IHtcclxuICAgICAgLy8gRG9tYWluIEhlYWRlciBmb3IgR3JvdXBpbmdcclxuICAgICAgY29uc3QgZG9tYWluID0gZ2V0RG9tYWluKGNhbXBhaWduLnVybCk7XHJcbiAgICAgIGlmIChzdGF0ZS5ncm91cEJ5RG9tYWluICYmIGRvbWFpbiAhPT0gbGFzdERvbWFpbikge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZ3JvdXBIZWFkZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1kb21haW4taGVhZGVyJztcclxuICAgICAgICBncm91cEhlYWRlci5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImZiLWFkcy1kb21haW4tbmFtZVwiPiR7ZG9tYWlufTwvZGl2PmA7XHJcbiAgICAgICAgY2hhcnRDb250ZW50LmFwcGVuZENoaWxkKGdyb3VwSGVhZGVyKTtcclxuICAgICAgICBsYXN0RG9tYWluID0gZG9tYWluO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgcm93LmNsYXNzTmFtZSA9ICdmYi1hZHMtY2FtcGFpZ24tcm93JztcclxuXHJcbiAgICAgIGNvbnN0IGxlZnQgPSAoKGNhbXBhaWduLmZpcnN0QWR2ZXJ0aXNlZCAtIHJlbmRlck1pbikgLyB0b3RhbER1cmF0aW9uKSAqIDEwMDtcclxuICAgICAgY29uc3Qgd2lkdGggPSBNYXRoLm1heCgwLjUsICgoY2FtcGFpZ24ubGFzdEFkdmVydGlzZWQgLSBjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQpIC8gdG90YWxEdXJhdGlvbikgKiAxMDApO1xyXG4gICAgICBjb25zdCBjb2xvciA9IGdldEFkQ291bnRDb2xvcihjYW1wYWlnbi5hZHNDb3VudCk7XHJcblxyXG4gICAgICByb3cuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi1pbmZvXCI+XHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLXVybFwiIHRpdGxlPVwiJHtjYW1wYWlnbi51cmx9XCI+XHJcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtjYW1wYWlnbi51cmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCIgc3R5bGU9XCJjb2xvcjogaW5oZXJpdDsgdGV4dC1kZWNvcmF0aW9uOiBub25lO1wiPiR7Y2FtcGFpZ24udXJsfTwvYT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBtYXJnaW4tbGVmdDogNnB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICAoPGEgaHJlZj1cImh0dHBzOi8vd2ViLmFyY2hpdmUub3JnL3dlYi8qLyR7Y2FtcGFpZ24udXJsfS8qXCIgdGFyZ2V0PVwiX2JsYW5rXCIgc3R5bGU9XCJjb2xvcjogIzZiNzI4MDsgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XCI+QXJjaGl2ZTwvYT4pXHJcbiAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tbWV0YVwiPlxyXG4gICAgICAgICAgICAgICAke2NhbXBhaWduLmNhbXBhaWduRHVyYXRpb25EYXlzfSBkYXlzIOKAoiAke2NhbXBhaWduLmFkc0NvdW50fSBhZHNcclxuICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLXRpbWVsaW5lXCI+XHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRpbWVsaW5lLWJnLW1hcmtlclwiIHN0eWxlPVwibGVmdDogJHtsZWZ0fSU7IHdpZHRoOiAke3dpZHRofSVcIj48L2Rpdj4gXHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLWJhclwiIFxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT1cImxlZnQ6ICR7bGVmdH0lOyB3aWR0aDogJHt3aWR0aH0lOyBiYWNrZ3JvdW5kOiAke2NvbG9yfTsgYm94LXNoYWRvdzogMCAycHggNHB4IHJnYmEoMCwwLDAsMC4xKTtcIj5cclxuICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICBgO1xyXG5cclxuICAgICAgLy8gVG9vbHRpcCBsb2dpYyBmb3IgdGhlIGJhclxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAvLyBXZSBuZWVkIHRvIHF1ZXJ5IHRoZSBuZXdseSBhZGRlZCByb3cncyBiYXIuIFxyXG4gICAgICAgIC8vIFNpbmNlIHdlIGFwcGVuZENoaWxkKHJvdykgbGF0ZXIsIHdlIGNhbiBhdHRhY2ggbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50ICdyb3cnIGJlZm9yZSBhcHBlbmRpbmc/XHJcbiAgICAgICAgLy8gV2FpdCwgdGhlIHJvdyBpcyBjcmVhdGVkIHZpYSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSB0aGVuIGFwcGVuZGVkLlxyXG4gICAgICAgIC8vIFNvIHdlIGNhbiBmaW5kIHRoZSBiYXIgaW5zaWRlICdyb3cnIGltbWVkaWF0ZWx5LlxyXG4gICAgICAgIGNvbnN0IGJhciA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWNhbXBhaWduLWJhcicpO1xyXG4gICAgICAgIGlmIChiYXIpIHtcclxuICAgICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzdGFydERhdGUgPSBuZXcgRGF0ZShjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoY2FtcGFpZ24ubGFzdEFkdmVydGlzZWQpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgdG9vbHRpcC5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdG9vbHRpcC1oZWFkZXJcIj5DYW1wYWlnbiBEZXRhaWxzPC9kaXY+XHJcbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdG9vbHRpcC1kYXRlc1wiPiR7c3RhcnREYXRlfSDigJQgJHtlbmREYXRlfTwvZGl2PlxyXG4gICAgICAgICAgICAgICA8YSBjbGFzcz1cImZiLWFkcy10b29sdGlwLWFjdGlvblwiIGlkPVwiZmJBZHNUb29sdGlwVmlld0J0blwiPkNsaWNrIHRvIFZpZXcgVG9wIDUgQWRzPC9hPlxyXG4gICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHJcbiAgICAgICAgICAgIC8vIEF0dGFjaCBjbGljayBsaXN0ZW5lciB0byB0aGUgbGluayBpbnNpZGUgdG9vbHRpcFxyXG4gICAgICAgICAgICBjb25zdCB2aWV3QnRuID0gdG9vbHRpcC5xdWVyeVNlbGVjdG9yKCcjZmJBZHNUb29sdGlwVmlld0J0bicpO1xyXG4gICAgICAgICAgICBpZiAodmlld0J0bikge1xyXG4gICAgICAgICAgICAgIHZpZXdCdG4ub25jbGljayA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgb3BlbkNhbXBhaWduRGV0YWlscyhjYW1wYWlnbik7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFBvc2l0aW9uIHRvb2x0aXAgbmVhciBtb3VzZSBidXQgZW5zdXJlIGl0IHN0YXlzIHdpdGhpbiB2aWV3cG9ydFxyXG4gICAgICAgICAgICAvLyBBZGQgc2xpZ2h0IG9mZnNldCBzbyBpdCBkb2Vzbid0IGZsaWNrZXJcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUuY2xpZW50WCArIDE1O1xyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS5jbGllbnRZICsgMTU7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgMCk7XHJcblxyXG4gICAgICByb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIC8vIERvbid0IG9wZW4gbW9kYWwgaWYgY2xpY2tpbmcgYSBsaW5rXHJcbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoJ2EnKSkgcmV0dXJuO1xyXG4gICAgICAgIG9wZW5DYW1wYWlnbkRldGFpbHMoY2FtcGFpZ24pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNoYXJ0Q29udGVudC5hcHBlbmRDaGlsZChyb3cpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJUb3A1VGV4dCgpIHtcclxuICAgIGNvbnN0IGNoYXJ0Q29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NoYXJ0Q29udGVudCcpO1xyXG4gICAgY2hhcnRDb250ZW50LmNsYXNzTGlzdC5hZGQoJ2ZiLWFkcy1iZy1ncmF5Jyk7XHJcbiAgICBjb25zdCBzdWJ0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1N1YnRpdGxlJyk7XHJcbiAgICBzdWJ0aXRsZS50ZXh0Q29udGVudCA9IGBUb3AgNSBhZHMgZm9yICR7c3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aH0gY2FtcGFpZ25zYDtcclxuXHJcbiAgICBpZiAoIXN0YXRlLnJhd0NhbXBhaWducyB8fCBzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNoYXJ0Q29udGVudC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImZiLWFkcy1lbXB0eS1zdGF0ZVwiPk5vIGNhbXBhaWduIGRhdGEgYXZhaWxhYmxlPC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBvdXRwdXQgPSAnJztcclxuICAgIGNvbnN0IGNhbXBhaWduc1RvUmVuZGVyID0gcHJvY2Vzc0RhdGEoc3RhdGUucmF3Q2FtcGFpZ25zKTtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGNhbXBhaWduID0+IHtcclxuICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyKSA9PiBuZXcgRGF0ZShkYXRlU3RyKS50b0RhdGVTdHJpbmcoKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBnZXRBZENvdW50Q29sb3IoY2FtcGFpZ24uYWRzQ291bnQpO1xyXG5cclxuICAgICAgb3V0cHV0ICs9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtY2FtcGFpZ24gZmItYWRzLWNhcmQtd2hpdGVcIiBzdHlsZT1cImJvcmRlci1sZWZ0OiA0cHggc29saWQgJHtjb2xvcn07XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+JHtjYW1wYWlnbi51cmx9PC9zdHJvbmc+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1tZXRhXCI+XHJcbiAgICAgICAgICAgICR7Zm9ybWF0RGF0ZShjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQpfSDigJQgJHtmb3JtYXREYXRlKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkKX0gfCBcclxuICAgICAgICAgICAgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyB8IFxyXG4gICAgICAgICAgICAke2NhbXBhaWduLmFkc0NvdW50fSBhZHNcclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAke2NhbXBhaWduLnRvcDUgJiYgY2FtcGFpZ24udG9wNS5sZW5ndGggPiAwID8gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWRzXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWxhYmVsXCI+VG9wIDUgQWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1ncmlkXCI+XHJcbiAgICAgICAgICAgICAgJHtjYW1wYWlnbi50b3A1Lm1hcChhZCA9PiBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWRcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TGlicmFyeSBJRDo8L3N0cm9uZz4gXHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHthZC5saWJyYXJ5SWR9XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1saW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAke2FkLmxpYnJhcnlJZH1cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWQtbWV0YVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RGF0ZXM6PC9zdHJvbmc+ICR7bmV3IERhdGUoYWQuc3RhcnRpbmdEYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoKX0g4oCUICR7bmV3IERhdGUoYWQuZW5kRGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCl9PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RHVyYXRpb246PC9zdHJvbmc+ICR7YWQuZHVyYXRpb259IGRheXNcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZC1jb3B5XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICR7YWQubWVkaWFUeXBlID09PSAndmlkZW8nXHJcbiAgICAgICAgICA/IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPjx2aWRlbyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBoZWlnaHQ6IGF1dG87IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L3ZpZGVvPjwvZGl2PmBcclxuICAgICAgICAgIDogKGFkLm1lZGlhVHlwZSA9PT0gJ2ltYWdlJyA/IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPjxpbWcgc3JjPVwiJHthZC5tZWRpYVNyY31cIiBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgaGVpZ2h0OiBhdXRvOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC9kaXY+YCA6ICcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkFkIENvcHk6PC9zdHJvbmc+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7YWQuYWRUZXh0IHx8ICdbbm8gY29weV0nfVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIGAgOiAnPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LW5vLWFkc1wiPk5vIHRvcCBhZHMgZGF0YSBhdmFpbGFibGU8L2Rpdj4nfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFjdGlvbnNcIiBzdHlsZT1cIm1hcmdpbi10b3A6IDE1cHg7IG1hcmdpbi1ib3R0b206IDIwcHg7IGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7IGdhcDogMTBweDtcIj5cclxuICAgICAgICAke3N0YXRlLmFpQ29uZmlnID8gYFxyXG4gICAgICAgIDxidXR0b24gaWQ9XCJmYkFkc0FuYWx5emVCdG5cIiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIj5cclxuICAgICAgICAgIPCfpJYgQW5hbHl6ZSB3aXRoIEFJXHJcbiAgICAgICAgPC9idXR0b24+YCA6ICcnXHJcbiAgICAgIH1cclxuICAgIDxidXR0b24gaWQ9XCJmYkFkc0NvcHlBbGxUZXh0QnRuXCIgY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCI+XHJcbiAgICAgIPCfk4sgQ29weSBBbGwgVGV4dFxyXG4gICAgPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICAgPGRpdiBpZD1cImZiQWRzQUlSZXN1bHRcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7IHBhZGRpbmc6IDEycHggMTZweDsgbWFyZ2luLWJvdHRvbTogMjBweDsgYmFja2dyb3VuZDogI2YwZmRmNDsgYm9yZGVyOiAxcHggc29saWQgI2JiZjdkMDsgYm9yZGVyLXJhZGl1czogOHB4OyBjb2xvcjogIzE2NjUzNDsgb3ZlcmZsb3c6IGhpZGRlbjtcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWktaGVhZGVyXCIgc3R5bGU9XCJwYWRkaW5nOiAxMnB4IDE2cHg7IGJhY2tncm91bmQ6ICNkY2ZjZTc7IGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgY3Vyc29yOiBwb2ludGVyOyBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JiZjdkMDtcIj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA2MDA7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogOHB4O1wiPvCfpJYgQUkgQW5hbHlzaXM8L2Rpdj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1haS1taW5pbWl6ZVwiIHN0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBmb250LXNpemU6IDE4cHg7IGNvbG9yOiAjMTY2NTM0OyBjdXJzb3I6IHBvaW50ZXI7IGxpbmUtaGVpZ2h0OiAxO1wiPuKIkjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFpLWNvbnRlbnRcIiBzdHlsZT1cInBhZGRpbmc6IDE2cHg7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcIj48L2Rpdj5cclxuICAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtb3V0cHV0XCI+JHtvdXRwdXR9PC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIFRvZ2dsZSBtaW5pbWl6ZVxyXG4gICAgY29uc3QgYWlIZWFkZXIgPSBjaGFydENvbnRlbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy1haS1oZWFkZXInKTtcclxuICAgIGNvbnN0IGFpQ29udGVudCA9IGNoYXJ0Q29udGVudC5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLWNvbnRlbnQnKTtcclxuICAgIGNvbnN0IG1pbmltaXplQnRuID0gY2hhcnRDb250ZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktbWluaW1pemUnKTtcclxuXHJcbiAgICBpZiAoYWlIZWFkZXIpIHtcclxuICAgICAgYWlIZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNIaWRkZW4gPSBhaUNvbnRlbnQuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xyXG4gICAgICAgIGFpQ29udGVudC5zdHlsZS5kaXNwbGF5ID0gaXNIaWRkZW4gPyAnYmxvY2snIDogJ25vbmUnO1xyXG4gICAgICAgIG1pbmltaXplQnRuLnRleHRDb250ZW50ID0gaXNIaWRkZW4gPyAn4oiSJyA6ICcrJztcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzdG9yZSBBSSBSZXN1bHQgaWYgZXhpc3RzXHJcbiAgICBjb25zdCByZXN1bHREaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBSVJlc3VsdCcpO1xyXG4gICAgaWYgKHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQpIHtcclxuICAgICAgY29uc3QgY29udGVudERpdiA9IHJlc3VsdERpdi5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLWNvbnRlbnQnKTtcclxuICAgICAgY29udGVudERpdi5pbm5lckhUTUwgPSBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0O1xyXG4gICAgICByZXN1bHREaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHN0YXRlLmFpQ29uZmlnKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhbmFseXplV2l0aEFJKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDb3B5QWxsVGV4dEJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy10ZXh0LW91dHB1dCcpO1xyXG4gICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gMS4gVGVtcG9yYXJpbHkgaGlkZSBtZWRpYVxyXG4gICAgICBjb25zdCBtZWRpYSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdpbWcsIHZpZGVvJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsRGlzcGxheXMgPSBbXTtcclxuICAgICAgbWVkaWEuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgb3JpZ2luYWxEaXNwbGF5cy5wdXNoKGVsLnN0eWxlLmRpc3BsYXkpO1xyXG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gMi4gU2VsZWN0IGNvbnRlbnRcclxuICAgICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhjb250YWluZXIpO1xyXG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XHJcblxyXG4gICAgICAvLyAzLiBDb3B5XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ29weUFsbFRleHRCdG4nKTtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4udGV4dENvbnRlbnQ7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ+KchSBDb3BpZWQhJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignQ29weSBmYWlsZWQ6JywgZXJyKTtcclxuICAgICAgICBhbGVydCgnQ29weSBmYWlsZWQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gNC4gQ2xlYW51cFxyXG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICAgIG1lZGlhLmZvckVhY2goKGVsLCBpKSA9PiB7XHJcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IG9yaWdpbmFsRGlzcGxheXNbaV07XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKSB7XHJcbiAgICBpZiAoIWNhbXBhaWduLnRvcDUgfHwgY2FtcGFpZ24udG9wNS5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICBsZXQgY29udGVudCA9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWxpc3RcIj5gO1xyXG5cclxuICAgIGNhbXBhaWduLnRvcDUuZm9yRWFjaCgoYWQsIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZVN0cikgPT4gbmV3IERhdGUoZGF0ZVN0cikudG9EYXRlU3RyaW5nKCk7XHJcbiAgICAgIGNvbnRlbnQgKz0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhcmQgZmItYWRzLWNhcmQtd2hpdGVcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1yYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXJhbmstbnVtYmVyXCI+IyR7aW5kZXggKyAxfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1saWJyYXJ5LWlkLWxhYmVsXCI+TGlicmFyeSBJRDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2Fkcy9saWJyYXJ5Lz9pZD0ke2FkLmxpYnJhcnlJZH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImZiLWFkcy1saWJyYXJ5LWlkLWxpbmtcIj4ke2FkLmxpYnJhcnlJZH08L2E+XHJcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1kdXJhdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1kdXJhdGlvbi1sYWJlbFwiPkR1cmF0aW9uPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWR1cmF0aW9uLXZhbHVlXCI+JHthZC5kdXJhdGlvbn0gZGF5czwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1tZXRhXCI+JHtmb3JtYXREYXRlKGFkLnN0YXJ0aW5nRGF0ZSl9IC0gJHtmb3JtYXREYXRlKGFkLmVuZERhdGUpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5LXNlY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAke2FkLm1lZGlhVHlwZSA9PT0gJ3ZpZGVvJ1xyXG4gICAgICAgICAgPyBgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1pbWFnZVwiIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTJweDsgdGV4dC1hbGlnbjogY2VudGVyO1wiPjx2aWRlbyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBtYXgtaGVpZ2h0OiAzMDBweDsgYm9yZGVyLXJhZGl1czogNnB4OyBib3gtc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpO1wiPjwvdmlkZW8+PC9kaXY+YFxyXG4gICAgICAgICAgOiAoYWQubWVkaWFUeXBlID09PSAnaW1hZ2UnID8gYDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtaW1hZ2VcIiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDEycHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj48aW1nIHNyYz1cIiR7YWQubWVkaWFTcmN9XCIgc3R5bGU9XCJtYXgtd2lkdGg6IDEwMCU7IG1heC1oZWlnaHQ6IDMwMHB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGJveC1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSk7XCI+PC9kaXY+YCA6ICcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5LWxhYmVsXCI+QWQgQ29weTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWNvcHktYnRuXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jb3B5LXRleHQ9XCIke2VuY29kZVVSSUNvbXBvbmVudChhZC5hZFRleHQgfHwgJycpfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS11cmw9XCIke2VuY29kZVVSSUNvbXBvbmVudChjYW1wYWlnbi51cmwpfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jYW1wYWlnbi1kdXJhdGlvbj1cIiR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWNhbXBhaWduLWFkcz1cIiR7Y2FtcGFpZ24uYWRzQ291bnR9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFkLWxpYi1pZD1cIiR7YWQubGlicmFyeUlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1kdXJhdGlvbj1cIiR7YWQuZHVyYXRpb259XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFkLWRhdGVzPVwiJHtmb3JtYXREYXRlKGFkLnN0YXJ0aW5nRGF0ZSl9IOKAlCAke2Zvcm1hdERhdGUoYWQuZW5kRGF0ZSl9XCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIPCfk4sgQ29weVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5XCI+JHthZC5hZFRleHQgfHwgJ1tObyBjb3B5IGF2YWlsYWJsZV0nfTwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb250ZW50ICs9IGA8L2Rpdj5gO1xyXG4gICAgc2hvd01vZGFsKGNvbnRlbnQsIGAke2NhbXBhaWduLnVybH0gYCwgYCR7Y2FtcGFpZ24uYWRzQ291bnR9IHRvdGFsIGFkcyDigKIgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyBhY3RpdmVgKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBEYXRhIE1hbmFnZW1lbnQgLS0tXHJcblxyXG4gIGZ1bmN0aW9uIGRvd25sb2FkRGF0YSgpIHtcclxuICAgIC8vIEdlbmVyYXRlIGZpbGVuYW1lIHByb3BlcnRpZXNcclxuICAgIGNvbnN0IGFkdmVydGlzZXIgPSAoc3RhdGUubWV0YWRhdGE/LmFkdmVydGlzZXJOYW1lIHx8ICdmYl9hZHNfYW5hbHlzaXMnKVxyXG4gICAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXHJcbiAgICAgIC5yZXBsYWNlKC8oXi18LSQpL2csICcnKTtcclxuXHJcbiAgICBjb25zdCBjb3VudCA9IHN0YXRlLnJhd0NhbXBhaWducy5sZW5ndGg7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIGRhdGUgcmFuZ2UgZnJvbSBhbGwgY2FtcGFpZ25zXHJcbiAgICBsZXQgbWluRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBsZXQgbWF4RGF0ZSA9IG5ldyBEYXRlKDApO1xyXG5cclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy5maXJzdEFkdmVydGlzZWQgPCBtaW5EYXRlKSBtaW5EYXRlID0gYy5maXJzdEFkdmVydGlzZWQ7XHJcbiAgICAgIGlmIChjLmxhc3RBZHZlcnRpc2VkID4gbWF4RGF0ZSkgbWF4RGF0ZSA9IGMubGFzdEFkdmVydGlzZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIZWxwZXIgZm9yIGRhdGUgZm9ybWF0dGluZyBsaWtlIFwiamFuLTEtMjAyNVwiXHJcbiAgICBjb25zdCBmb3JtYXREYXRlID0gKGQpID0+IHtcclxuICAgICAgY29uc3QgbSA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1blwiLCBcImp1bFwiLCBcImF1Z1wiLCBcInNlcFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcclxuICAgICAgcmV0dXJuIGAke21bZC5nZXRNb250aCgpXX0gLSR7ZC5nZXREYXRlKCl9IC0ke2QuZ2V0RnVsbFllYXIoKX0gYDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgc3RhcnRTdHIgPSBmb3JtYXREYXRlKG1pbkRhdGUpO1xyXG4gICAgY29uc3QgZW5kU3RyID0gZm9ybWF0RGF0ZShtYXhEYXRlKTtcclxuXHJcbiAgICAvLyBGaWxlbmFtZTogcGVuZy1qb29uLWZiLWFkcy04LWNhbXBhaWducy1mcm9tLWphbi0xLTIwMjUtdG8tZGVjLTI0LTIwMjUuanNvblxyXG4gICAgY29uc3QgZmlsZW5hbWUgPSBgJHthZHZlcnRpc2VyfSAtZmIgLSBhZHMgLSAke2NvdW50fSAtY2FtcGFpZ25zIC0gZnJvbSAtICR7c3RhcnRTdHJ9IC10byAtICR7ZW5kU3RyfS5qc29uYDtcclxuXHJcbiAgICBjb25zdCBkYXRhU3RyID0gXCJkYXRhOnRleHQvanNvbjtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgY2FtcGFpZ25zOiBzdGF0ZS5yYXdDYW1wYWlnbnMsXHJcbiAgICAgIGFsbEFkczogc3RhdGUuYWxsQWRzLFxyXG4gICAgICBtZXRhZGF0YTogc3RhdGUubWV0YWRhdGEgfHwgeyBhZHZlcnRpc2VyTmFtZTogYWR2ZXJ0aXNlciB9LCAvLyBGYWxsYmFjayBtZXRhZGF0YVxyXG4gICAgICBhaUFuYWx5c2lzUmVzdWx0OiBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0IHx8IG51bGxcclxuICAgIH0sIG51bGwsIDIpKTtcclxuXHJcbiAgICBjb25zdCBkb3dubG9hZEFuY2hvck5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBkYXRhU3RyKTtcclxuICAgIGRvd25sb2FkQW5jaG9yTm9kZS5zZXRBdHRyaWJ1dGUoXCJkb3dubG9hZFwiLCBmaWxlbmFtZSk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvd25sb2FkQW5jaG9yTm9kZSk7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUuY2xpY2soKTtcclxuICAgIGRvd25sb2FkQW5jaG9yTm9kZS5yZW1vdmUoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZUZpbGVJbXBvcnQoZXZlbnQpIHtcclxuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXNbMF07XHJcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChlKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICBpZiAoIWpzb24uY2FtcGFpZ25zKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGZvcm1hdFwiKTtcclxuICAgICAgICBsb2FkSW1wb3J0ZWREYXRhKGpzb24pO1xyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3IgaW1wb3J0aW5nIGZpbGU6ICcgKyBlcnIubWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGxvYWRJbXBvcnRlZERhdGEoaW1wb3J0ZWREYXRhKSB7XHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMgPSBpbXBvcnRlZERhdGEuY2FtcGFpZ25zIHx8IFtdO1xyXG4gICAgc3RhdGUuYWxsQWRzID0gaW1wb3J0ZWREYXRhLmFsbEFkcyB8fCBbXTtcclxuICAgIHN0YXRlLm1ldGFkYXRhID0gaW1wb3J0ZWREYXRhLm1ldGFkYXRhIHx8IG51bGw7XHJcbiAgICBzdGF0ZS5pc0ltcG9ydGVkID0gISFpbXBvcnRlZERhdGEuaXNJbXBvcnRlZDtcclxuICAgIHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgPSBpbXBvcnRlZERhdGEuYWlBbmFseXNpc1Jlc3VsdCB8fCBudWxsO1xyXG5cclxuICAgIC8vIEhpZGUgRG93bmxvYWQgQnV0dG9uIGlmIGltcG9ydGVkXHJcbiAgICBjb25zdCBkb3dubG9hZEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0Rvd25sb2FkQnRuJyk7XHJcbiAgICBpZiAoc3RhdGUuaXNJbXBvcnRlZCkge1xyXG4gICAgICBkb3dubG9hZEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG93bmxvYWRCdG4uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtZmxleCc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGFyc2UgZGF0ZXNcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBjLmZpcnN0QWR2ZXJ0aXNlZCA9IG5ldyBEYXRlKGMuZmlyc3RBZHZlcnRpc2VkKTtcclxuICAgICAgYy5sYXN0QWR2ZXJ0aXNlZCA9IG5ldyBEYXRlKGMubGFzdEFkdmVydGlzZWQpO1xyXG4gICAgICBpZiAoYy50b3A1KSB7XHJcbiAgICAgICAgYy50b3A1LmZvckVhY2goYWQgPT4ge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZGF0ZSBzdHJpbmdzIG9yIG9iamVjdHNcclxuICAgICAgICAgIGFkLnN0YXJ0aW5nRGF0ZSA9IG5ldyBEYXRlKGFkLnN0YXJ0aW5nRGF0ZSk7XHJcbiAgICAgICAgICBhZC5lbmREYXRlID0gbmV3IERhdGUoYWQuZW5kRGF0ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEluaXRpYWwgU29ydFxyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGIuZmlyc3RBZHZlcnRpc2VkKSAtIG5ldyBEYXRlKGEuZmlyc3RBZHZlcnRpc2VkKSk7XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3RhdHVzVGV4dCcpLnRleHRDb250ZW50ID1cclxuICAgICAgYExvYWRlZCAke3N0YXRlLnJhd0NhbXBhaWducy5sZW5ndGh9IGNhbXBhaWduc2A7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNTcGlubmVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcbiAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICBzaG93T3ZlcmxheSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tIEFJIExvZ2ljIChDU1AgRml4ZWQpIC0tLVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBhbmFseXplV2l0aEFJKCkge1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQW5hbHl6ZUJ0bicpO1xyXG4gICAgY29uc3QgcmVzdWx0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQUlSZXN1bHQnKTtcclxuXHJcbiAgICBpZiAoIXN0YXRlLmFpQ29uZmlnIHx8ICFzdGF0ZS5haUNvbmZpZy5hcGlLZXkpIHtcclxuICAgICAgYWxlcnQoJ0FJIENvbmZpZ3VyYXRpb24gbWlzc2luZy4gUGxlYXNlIGNoZWNrIGRhdGFiYXNlIHNldHRpbmdzLicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9ICfwn6SWIEFuYWx5emluZy4uLic7XHJcbiAgICByZXN1bHREaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcbiAgICAvLyBDb2xsZWN0IGFsbCBhZCB0ZXh0c1xyXG4gICAgbGV0IGFsbEFkVGV4dHMgPSBbXTtcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy50b3A1KSB7XHJcbiAgICAgICAgYy50b3A1LmZvckVhY2goYWQgPT4ge1xyXG4gICAgICAgICAgaWYgKGFkLmFkVGV4dCAmJiBhZC5hZFRleHQubGVuZ3RoID4gMTApIHtcclxuICAgICAgICAgICAgYWxsQWRUZXh0cy5wdXNoKGFkLmFkVGV4dCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGFuZCBsaW1pdFxyXG4gICAgYWxsQWRUZXh0cyA9IFsuLi5uZXcgU2V0KGFsbEFkVGV4dHMpXS5zbGljZSgwLCA1MCk7XHJcblxyXG4gICAgaWYgKGFsbEFkVGV4dHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGFsZXJ0KCdObyBhZCB0ZXh0IGNvbnRlbnQgZm91bmQgdG8gYW5hbHl6ZS4nKTtcclxuICAgICAgYnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9ICfwn6SWIEFuYWx5emUgd2l0aCBBSSc7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBzdGF0ZS5haUNvbmZpZy5zeXN0ZW1Qcm9tcHQgfHwgXCJZb3UgYXJlIGFuIGV4cGVydCBtYXJrZXRpbmcgYW5hbHlzdC4gQW5hbHl6ZSB0aGVzZSBGYWNlYm9vayBhZCBjb3BpZXMgYW5kIGlkZW50aWZ5IGNvbW1vbiBob29rcywgcGFpbiBwb2ludHMgYWRkcmVzc2VkLCBhbmQgQ1RBcyB1c2VkLiBQcm92aWRlIGEgY29uY2lzZSBidWxsZXRlZCBzdW1tYXJ5IG9mIHRoZSBzdHJhdGVneS5cIjtcclxuICAgIGNvbnN0IHVzZXJDb250ZW50ID0gXCJBbmFseXplIHRoZSBmb2xsb3dpbmcgYWQgY29waWVzOlxcblxcblwiICsgYWxsQWRUZXh0cy5qb2luKFwiXFxuXFxuLS0tXFxuXFxuXCIpO1xyXG5cclxuICAgIC8vIERlZmluZSByZXNwb25zZSBoYW5kbGVyXHJcbiAgICBjb25zdCBoYW5kbGVSZXNwb25zZSA9IChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gZS5kZXRhaWw7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZiQWRzQW5hbHl6ZVJlc3BvbnNlJywgaGFuZGxlUmVzcG9uc2UpO1xyXG5cclxuICAgICAgLy8gUmUtcXVlcnkgZWxlbWVudHMgdG8gZW5zdXJlIHdlIGludGVyYWN0IHdpdGggdGhlIGN1cnJlbnQgRE9NICh2aWV3IG1pZ2h0IGhhdmUgcmVmcmVzaGVkKVxyXG4gICAgICBjb25zdCBjdXJyZW50UmVzdWx0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQUlSZXN1bHQnKTtcclxuICAgICAgY29uc3QgY3VycmVudEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgLy8gTWFya2Rvd24gY29udmVyc2lvbiBzaW1wbGUgcmVwbGFjZW1lbnQgZm9yIGJvbGQvbmV3bGluZXMgaWYgbmVlZGVkLCBcclxuICAgICAgICAvLyBidXQgaW5uZXJIVE1MIHByZXNlcnZlcyBiYXNpYyBmb3JtYXR0aW5nIG1vc3RseS5cclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSByZXNwb25zZS5hbmFseXNpcy5yZXBsYWNlKC9cXG4vZywgJzxicj4nKS5yZXBsYWNlKC9cXCpcXCooLio/KVxcKlxcKi9nLCAnPHN0cm9uZz4kMTwvc3Ryb25nPicpO1xyXG4gICAgICAgIHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgPSBmb3JtYXR0ZWQ7IC8vIFNhdmUgc3RhdGVcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRSZXN1bHREaXYpIHtcclxuICAgICAgICAgIGNvbnN0IGNvbnRlbnREaXYgPSBjdXJyZW50UmVzdWx0RGl2LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktY29udGVudCcpO1xyXG4gICAgICAgICAgaWYgKGNvbnRlbnREaXYpIHtcclxuICAgICAgICAgICAgY29udGVudERpdi5pbm5lckhUTUwgPSBmb3JtYXR0ZWQ7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBGYWxsYmFjayBpZiBzdHJ1Y3R1cmUgaXMgc29tZWhvdyBtaXNzaW5nXHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXN1bHREaXYuaW5uZXJIVE1MID0gYDxzdHJvbmc+8J+kliBBSSBBbmFseXNpczo8L3N0cm9uZz4gPGJyPjxicj4ke2Zvcm1hdHRlZH1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY3VycmVudFJlc3VsdERpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSByZXNwb25zZSA/IChyZXNwb25zZS5lcnJvciB8fCAnVW5rbm93biBlcnJvcicpIDogJ1Vua25vd24gZXJyb3InO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0FJIEFuYWx5c2lzIGZhaWxlZDonLCBlcnJvck1zZyk7XHJcbiAgICAgICAgYWxlcnQoJ0FuYWx5c2lzIGZhaWxlZDogJyArIGVycm9yTXNnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGN1cnJlbnRCdG4pIHtcclxuICAgICAgICBjdXJyZW50QnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgY3VycmVudEJ0bi50ZXh0Q29udGVudCA9ICfwn6SWIEFuYWx5emUgd2l0aCBBSSc7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gTGlzdGVuIGZvciByZXNwb25zZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcblxyXG4gICAgLy8gRGlzcGF0Y2ggcmVxdWVzdCB0byBjb250ZW50IHNjcmlwdCAtPiBiYWNrZ3JvdW5kXHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBEaXNwYXRjaGluZyBBSSBhbmFseXNpcyByZXF1ZXN0Jyk7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZmJBZHNBbmFseXplUmVxdWVzdCcsIHtcclxuICAgICAgZGV0YWlsOiB7XHJcbiAgICAgICAgYXBpS2V5OiBzdGF0ZS5haUNvbmZpZy5hcGlLZXksXHJcbiAgICAgICAgc3lzdGVtUHJvbXB0OiBzeXN0ZW1Qcm9tcHQsXHJcbiAgICAgICAgdXNlckNvbnRlbnQ6IHVzZXJDb250ZW50XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICAvLyBGYWxsYmFjay9UaW1lb3V0IGNsZWFudXBcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAvLyBSZS1xdWVyeSBidG4gZm9yIHRpbWVvdXQgY2hlY2tcclxuICAgICAgY29uc3QgY3VycmVudEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuICAgICAgaWYgKGN1cnJlbnRCdG4gJiYgY3VycmVudEJ0bi5kaXNhYmxlZCAmJiBjdXJyZW50QnRuLnRleHRDb250ZW50ID09PSAn8J+kliBBbmFseXppbmcuLi4nKSB7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcbiAgICAgICAgY3VycmVudEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN1cnJlbnRCdG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXplIHdpdGggQUknO1xyXG4gICAgICAgIGNvbnNvbGUud2FybignW0ZCIEFkcyBWaXN1YWxpemVyXSBBSSByZXF1ZXN0IHRpbWVkIG91dCcpO1xyXG4gICAgICB9XHJcbiAgICB9LCA2MDAwMCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gLS0tIEV2ZW50IEJyaWRnZSAtLS1cclxuXHJcbiAgLy8gTGlzdGVuIGZvciBpbXBvcnRlZCBkYXRhIHZpYSBDdXN0b21FdmVudCAoZnJvbSBpbmplY3RlZC5qcylcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc0ltcG9ydERhdGEnLCAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIFJlY2VpdmVkIGltcG9ydGVkIGRhdGEgdmlhIEN1c3RvbUV2ZW50Jyk7XHJcbiAgICBsb2FkSW1wb3J0ZWREYXRhKGV2ZW50LmRldGFpbCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgcmVvcGVuIHJlcXVlc3RcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc1Jlb3BlbicsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIFJlb3BlbmluZyBvdmVybGF5Jyk7XHJcbiAgICBzaG93T3ZlcmxheSgpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIEFJIENvbmZpZ1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzQ29uZmlnJywgKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBSZWNlaXZlZCBBSSBDb25maWcnKTtcclxuICAgIHN0YXRlLmFpQ29uZmlnID0gZXZlbnQuZGV0YWlsO1xyXG4gICAgdXBkYXRlVmlldygpOyAvLyBSZS1yZW5kZXIgdG8gc2hvdyBBSSBidXR0b24gaWYgbmVlZGVkXHJcbiAgfSk7XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgU2NyYXBpbmcgU3RhdHVzXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNTdGF0dXMnLCAoZXZlbnQpID0+IHtcclxuICAgIGNvbnN0IHsgc2Nyb2xsaW5nLCBhZHNGb3VuZCwgbWVzc2FnZSB9ID0gZXZlbnQuZGV0YWlsO1xyXG5cclxuICAgIC8vIEVuc3VyZSBvdmVybGF5IGlzIHZpc2libGUgYnV0IG1pbmltaXplZFxyXG4gICAgaWYgKHNjcm9sbGluZykge1xyXG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21pbmltaXplZCcpO1xyXG4gICAgICBzdGF0ZS5pc01pbmltaXplZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWluQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWluaW1pemVkQmFyJyk7XHJcbiAgICBjb25zdCBpY29uID0gbWluQmFyLnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtbWluaS1pY29uJyk7XHJcbiAgICBjb25zdCB0ZXh0ID0gbWluQmFyLnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtbWluaS10ZXh0Jyk7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNYXhpbWl6ZUJ0bicpO1xyXG5cclxuICAgIGlmIChzY3JvbGxpbmcpIHtcclxuICAgICAgaWNvbi5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJmYi1hZHMtbWluaS1zcGlubmVyXCI+8J+UhDwvc3Bhbj4nO1xyXG4gICAgICB0ZXh0LnRleHRDb250ZW50ID0gbWVzc2FnZTtcclxuICAgICAgLy8gbWluQmFyLnN0eWxlLmJhY2tncm91bmQgPSAnbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0LCAjZjU5ZTBiLCAjZDk3NzA2KSc7IC8vIFJlbW92ZWQgdG8gbWF0Y2ggc3R5bGluZ1xyXG4gICAgICBidG4uc3R5bGUuZGlzcGxheSA9ICdub25lJzsgLy8gSGlkZSBcIlNob3dcIiBidXR0b24gd2hpbGUgc2NyYXBpbmdcclxuXHJcbiAgICAgIC8vIEFkZCBzcGlubmVyIHN0eWxlIGlmIG5vdCBleGlzdHNcclxuICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJykpIHtcclxuICAgICAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgc3R5bGUuaWQgPSAnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJztcclxuICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcclxuICAgICAgQGtleWZyYW1lcyBmYkFkc1NwaW4gezEwMCAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfX1cclxuICAgICAgLmZiLWFkcy1taW5pLXNwaW5uZXIge2Rpc3BsYXk6IGlubGluZS1ibG9jazsgYW5pbWF0aW9uOiBmYkFkc1NwaW4gMXMgbGluZWFyIGluZmluaXRlOyB9XHJcbiAgICAgIGA7XHJcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERvbmVcclxuICAgICAgaWNvbi5pbm5lckhUTUwgPSBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogMjRweDsgaGVpZ2h0OiAyNHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyO1wiPmA7XHJcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSAnQW5hbHlzaXMgUmVhZHkhJztcclxuICAgICAgbWluQmFyLnN0eWxlLmJhY2tncm91bmQgPSAnJzsgLy8gUmV2ZXJ0IHRvIGRlZmF1bHQgYmx1ZS9wdXJwbGVcclxuICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBFeHBvc2UgcmVvcGVuIGhlbHBlclxyXG4gIHdpbmRvdy5mYkFkc1Jlb3Blbk92ZXJsYXkgPSBzaG93T3ZlcmxheTtcclxuXHJcbiAgLy8gQ2hlY2sgZm9yIHByZS1pbmplY3RlZCBkYXRhIChmcm9tIGZpbGUgaW1wb3J0KVxyXG4gIGNvbnN0IHByZUluamVjdGVkRGF0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydGVkRGF0YScpO1xyXG4gIGlmIChwcmVJbmplY3RlZERhdGEpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHByZUluamVjdGVkRGF0YS50ZXh0Q29udGVudCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIEZvdW5kIHByZS1pbmplY3RlZCBkYXRhLCBsb2FkaW5nLi4uJyk7XHJcbiAgICAgIGxvYWRJbXBvcnRlZERhdGEoanNvbik7XHJcbiAgICAgIC8vIENsZWFuIHVwXHJcbiAgICAgIHByZUluamVjdGVkRGF0YS5yZW1vdmUoKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0ZCIEFkcyBWaXN1YWxpemVyXSBFcnJvciBsb2FkaW5nIHByZS1pbmplY3RlZCBkYXRhOicsIGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0pKCk7Il0sIm5hbWVzIjpbIl9hIl0sIm1hcHBpbmdzIjoiQ0FFQyxXQUFZO0FBRmI7QUFHRSxVQUFRLElBQUksNENBQTRDO0FBR3hELFFBQU0sUUFBUTtBQUFBLElBQ1osY0FBYyxDQUFBO0FBQUEsSUFFZCxRQUFRLENBQUE7QUFBQSxJQUVSLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQTtBQUFBLElBQ1osZUFBZTtBQUFBLElBQ2YsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBO0FBQUEsSUFLYixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixlQUFlO0FBQUE7QUFBQSxJQUNmLFlBQVk7QUFBQSxFQUNoQjtBQUdFLFdBQVMsZ0JBQWdCLE9BQU87QUFDOUIsUUFBSSxTQUFTLElBQUssUUFBTztBQUN6QixRQUFJLFNBQVMsR0FBSSxRQUFPO0FBQ3hCLFFBQUksU0FBUyxHQUFJLFFBQU87QUFDeEIsUUFBSSxTQUFTLEdBQUksUUFBTztBQUN4QixRQUFJLFNBQVMsRUFBRyxRQUFPO0FBQ3ZCLFdBQU87QUFBQSxFQUNUO0FBR0EsUUFBTSxXQUFXLFNBQVMsZUFBZSxhQUFhO0FBQ3RELFFBQU0sWUFBVSwwQ0FBVSxZQUFWLG1CQUFtQixZQUFXO0FBRzlDLFFBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxVQUFRLEtBQUs7QUFDYixVQUFRLFlBQVk7QUFDcEIsVUFBUSxZQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBSUUs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

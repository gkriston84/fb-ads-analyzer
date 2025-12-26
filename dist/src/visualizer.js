(function() {
  var _a;
  console.log("[FB Ads Analyzer] Visualizer script loaded");
  const state = {
    rawCampaigns: [],
    allAds: [],
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
            <div class="fb-ads-control-row" style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 12px;">
                <div class="fb-ads-control-group">
                  <span style="font-weight: 500; font-size: 13px; color: #374151;">View:</span>
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-view="timeline">📊 Timeline</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-view="top5-text">🏆 Top 5 Text</button>
                </div>

                 <div class="fb-ads-control-group">
                  <span style="font-weight: 500; font-size: 13px; color: #374151;">Sort by:</span>
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-sort="recent">Start Date</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="duration">Duration</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="ads"># of Ads</button>
                </div>

                <div class="fb-ads-control-group">
                   <button class="fb-ads-btn fb-ads-btn-outline" id="fbAdsGroupDomainBtn">Group by Domain</button>
                </div>
                
                <div class="fb-ads-control-group">
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsRestartBtn">🔄 Restart Analysis</button>
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
  document.getElementById("fbAdsRestartBtn").addEventListener("click", () => {
    if (confirm("Restart analysis? This will clear current data.")) {
      state.rawCampaigns = [];
      state.allAds = [];
      state.isImported = false;
      document.dispatchEvent(new CustomEvent("fbAdsRestart"));
      const chartContent = document.getElementById("fbAdsChartContent");
      chartContent.innerHTML = "";
      document.getElementById("fbAdsStatusText").textContent = "Restarting...";
      document.getElementById("fbAdsSpinner").style.display = "block";
    }
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
    const sorted = [...campaigns];
    console.log("[FB Ads Visualizer] Processing data. Sort:", state.filterSort, "Group:", state.groupByDomain);
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
    let content = `< div class="fb-ads-list" > `;
    campaign.top5.forEach((ad, index) => {
      const formatDate = (dateStr) => new Date(dateStr).toDateString();
      content += `
      < div class="fb-ads-card fb-ads-card-white" >
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
          </div >
      `;
    });
    content += `</div > `;
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
      if (response && response.success) {
        const formatted = response.analysis.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        state.aiAnalysisResult = formatted;
        resultDiv.innerHTML = `< strong >🤖 AI Analysis:</strong > <br><br>${formatted}`;
        resultDiv.style.display = "block";
      } else {
        const errorMsg = response ? response.error || "Unknown error" : "Unknown error";
        console.error("AI Analysis failed:", errorMsg);
        alert("Analysis failed: " + errorMsg);
      }
      btn.disabled = false;
      btn.textContent = "🤖 Analyze with AI";
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
      if (btn.disabled && btn.textContent === "🤖 Analyzing...") {
        document.removeEventListener("fbAdsAnalyzeResponse", handleResponse);
        btn.disabled = false;
        btn.textContent = "🤖 Analyze with AI";
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
      minBar.style.background = "linear-gradient(to right, #f59e0b, #d97706)";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXplci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Zpc3VhbGl6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogRmFjZWJvb2sgQWRzIEFuYWx5emVyIC0gVmlzdWFsaXplciBTY3JpcHQgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgY29uc29sZS5sb2coJ1tGQiBBZHMgQW5hbHl6ZXJdIFZpc3VhbGl6ZXIgc2NyaXB0IGxvYWRlZCcpO1xyXG5cclxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50XHJcbiAgY29uc3Qgc3RhdGUgPSB7XHJcbiAgICByYXdDYW1wYWlnbnM6IFtdLFxyXG4gICAgcHJvY2Vzc2VkQ2FtcGFpZ25zOiBbXSxcclxuICAgIGFsbEFkczogW10sXHJcbiAgICBmaWx0ZXJEb21haW46ICdhbGwnLFxyXG4gICAgZmlsdGVyU29ydDogJ3JlY2VudCcsIC8vICdyZWNlbnQnLCAnZHVyYXRpb24nLCAnYWRzJ1xyXG4gICAgZ3JvdXBCeURvbWFpbjogZmFsc2UsXHJcbiAgICBpc01pbmltaXplZDogdHJ1ZSxcclxuICAgIGN1cnJlbnRWaWV3OiAndGltZWxpbmUnLCAvLyAndGltZWxpbmUnLCAndG9wNS10ZXh0JywgJ2FsbC1jb3B5J1xyXG4gICAgaXNBbmFseXppbmc6IGZhbHNlLFxyXG4gICAgaXNBbmFseXppbmc6IGZhbHNlLFxyXG4gICAgYWlDb25maWc6IG51bGwsXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBhaUNvbmZpZzogbnVsbCxcclxuICAgIG1ldGFkYXRhOiBudWxsLFxyXG4gICAgc29ydERpcmVjdGlvbjogJ2FzYycsIC8vICdhc2MnIG9yICdkZXNjJ1xyXG4gICAgaXNJbXBvcnRlZDogZmFsc2VcclxuICB9O1xyXG5cclxuICAvLyBDb2xvciBIZWxwZXJcclxuICBmdW5jdGlvbiBnZXRBZENvdW50Q29sb3IoY291bnQpIHtcclxuICAgIGlmIChjb3VudCA+PSAxMDApIHJldHVybiAnI2VmNDQ0NCc7IC8vIFJlZFxyXG4gICAgaWYgKGNvdW50ID49IDUwKSByZXR1cm4gJyNmOTczMTYnOyAgLy8gT3JhbmdlXHJcbiAgICBpZiAoY291bnQgPj0gMjApIHJldHVybiAnI2VhYjMwOCc7ICAvLyBZZWxsb3dcclxuICAgIGlmIChjb3VudCA+PSAxMCkgcmV0dXJuICcjMjJjNTVlJzsgIC8vIEdyZWVuXHJcbiAgICBpZiAoY291bnQgPj0gNSkgcmV0dXJuICcjM2I4MmY2JzsgICAvLyBCbHVlXHJcbiAgICByZXR1cm4gJyM4YjVjZjYnOyAgICAgICAgICAgICAgICAgICAvLyBQdXJwbGVcclxuICB9XHJcblxyXG4gIC8vIEdldCBsb2dvIFVSTCBmcm9tIGNvbmZpZyBlbGVtZW50IChzZXQgYnkgY29udGVudC5qcylcclxuICBjb25zdCBjb25maWdFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NvbmZpZycpO1xyXG4gIGNvbnN0IGxvZ29VcmwgPSBjb25maWdFbD8uZGF0YXNldD8ubG9nb1VybCB8fCAnJztcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBmbG9hdGluZyBvdmVybGF5XHJcbiAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIG92ZXJsYXkuaWQgPSAnZmJBZHNBbmFseXplck92ZXJsYXknO1xyXG4gIG92ZXJsYXkuY2xhc3NOYW1lID0gJ2hpZGRlbiBtaW5pbWl6ZWQnO1xyXG4gIG92ZXJsYXkuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmltaXplZC1iYXJcIiBpZD1cImZiQWRzTWluaW1pemVkQmFyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pLWNvbnRlbnRcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS1pY29uXCI+XHJcbiAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIHN0eWxlPVwid2lkdGg6IDI0cHg7IGhlaWdodDogMjRweDsgYm9yZGVyLXJhZGl1czogNTAlOyBvYmplY3QtZml0OiBjb3ZlcjtcIj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pLXRleHRcIj5GYWNlYm9vayBBZHMgQ2FtcGFpZ24gQW5hbHl6ZXI8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktYWN0aW9uc1wiPlxyXG4gICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtbWluaS1idG5cIiBpZD1cImZiQWRzTWF4aW1pemVCdG5cIj5TaG93PC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gIFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFuYWx5emVyLWNvbnRhaW5lclwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYW5hbHl6ZXItcGFuZWxcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYW5hbHl6ZXItaGVhZGVyXCI+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDEwcHg7XCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMjRweDtcIj5cclxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtsb2dvVXJsfVwiIHN0eWxlPVwid2lkdGg6IDQwcHg7IGhlaWdodDogNDBweDsgYm9yZGVyLXJhZGl1czogNTAlOyBvYmplY3QtZml0OiBjb3ZlcjsgYm9yZGVyOiAxcHggc29saWQgI2U1ZTdlYjtcIj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGgxPkZhY2Vib29rIEFkcyBDYW1wYWlnbiBBbmFseXplcjwvaDE+XHJcbiAgICAgICAgICAgICAgICA8cCBpZD1cImZiQWRzU3VidGl0bGVcIj5UaW1lbGluZSAmIENhbXBhaWduIEFuYWx5c2lzPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYWN0aW9uc1wiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtaGVhZGVyLWJ0blwiIGlkPVwiZmJBZHNNaW5pbWl6ZUJ0blwiIHRpdGxlPVwiTWluaW1pemVcIj5fPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYnRuXCIgaWQ9XCJmYkFkc0Nsb3NlQnRuXCIgdGl0bGU9XCJDbG9zZVwiPsOXPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbHNcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLXJvd1wiIHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB3aWR0aDogMTAwJTsgbWFyZ2luLWJvdHRvbTogMTJweDtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6ICMzNzQxNTE7XCI+Vmlldzo8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZSBhY3RpdmVcIiBkYXRhLXZpZXc9XCJ0aW1lbGluZVwiPvCfk4ogVGltZWxpbmU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS12aWV3PVwidG9wNS10ZXh0XCI+8J+PhiBUb3AgNSBUZXh0PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDUwMDsgZm9udC1zaXplOiAxM3B4OyBjb2xvcjogIzM3NDE1MTtcIj5Tb3J0IGJ5Ojwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lIGFjdGl2ZVwiIGRhdGEtc29ydD1cInJlY2VudFwiPlN0YXJ0IERhdGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS1zb3J0PVwiZHVyYXRpb25cIj5EdXJhdGlvbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXNvcnQ9XCJhZHNcIj4jIG9mIEFkczwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBpZD1cImZiQWRzR3JvdXBEb21haW5CdG5cIj5Hcm91cCBieSBEb21haW48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiIGlkPVwiZmJBZHNSZXN0YXJ0QnRuXCI+8J+UhCBSZXN0YXJ0IEFuYWx5c2lzPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIiBpZD1cImZiQWRzRG93bmxvYWRCdG5cIj7wn5K+IERvd25sb2FkIERhdGE8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiIGlkPVwiZmJBZHNJbXBvcnRCdG5cIj7wn5OCIEltcG9ydCBEYXRhPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJmaWxlXCIgaWQ9XCJmYkFkc0ltcG9ydElucHV0XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiIGFjY2VwdD1cIi5qc29uXCI+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmRcIiBpZD1cImZiQWRzVGltZWxpbmVMZWdlbmRcIiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IHdpZHRoOiAxMDAlOyBnYXA6IDE2cHg7IHBhZGRpbmctdG9wOiAxMnB4OyBib3JkZXItdG9wOiAxcHggc29saWQgI2U1ZTdlYjtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogIzhiNWNmNjtcIj48L2Rpdj4gMS00IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjM2I4MmY2O1wiPjwvZGl2PiA1LTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICMyMmM1NWU7XCI+PC9kaXY+IDEwLTE5IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZWFiMzA4O1wiPjwvZGl2PiAyMC00OSBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2Y5NzMxNjtcIj48L2Rpdj4gNTAtOTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICNlZjQ0NDQ7XCI+PC9kaXY+IDEwMCsgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1zdGF0dXMtYmFyXCIgc3R5bGU9XCJib3JkZXI6IG5vbmU7IHBhZGRpbmctdG9wOiAwOyBwYWRkaW5nLWJvdHRvbTogMDtcIj5cclxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXNwaW5uZXJcIiBpZD1cImZiQWRzU3Bpbm5lclwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtc3RhdHVzLXRleHRcIiBpZD1cImZiQWRzU3RhdHVzVGV4dFwiPkxvYWRpbmcgYW5hbHlzaXMgZGF0YS4uLjwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gIFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jaGFydC1jb250YWluZXJcIiBpZD1cImZiQWRzQ2hhcnRDb250ZW50XCI+XHJcbiAgICAgICAgICAgICA8IS0tIER5bmFtaWMgQ29udGVudCAtLT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgXHJcbiAgICAgIDwhLS0gTW9kYWwgQ29udGFpbmVyIC0tPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsLW92ZXJsYXlcIiBpZD1cImZiQWRzTW9kYWxPdmVybGF5XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC10aXRsZVwiPlxyXG4gICAgICAgICAgICAgIDxoMiBpZD1cImZiQWRzTW9kYWxUaXRsZVwiPkNhbXBhaWduIERldGFpbHM8L2gyPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwiZmItYWRzLW1vZGFsLW1ldGFcIiBpZD1cImZiQWRzTW9kYWxNZXRhXCI+dXJsLi4uPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1tb2RhbC1jbG9zZVwiIGlkPVwiZmJBZHNNb2RhbENsb3NlXCI+w5c8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1ib2R5XCIgaWQ9XCJmYkFkc01vZGFsQm9keVwiPlxyXG4gICAgICAgICAgICAgPCEtLSBEZXRhaWxzIC0tPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcclxuXHJcbiAgLy8gVG9vbHRpcFxyXG4gIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICB0b29sdGlwLmNsYXNzTmFtZSA9ICdmYi1hZHMtdG9vbHRpcCc7XHJcbiAgb3ZlcmxheS5hcHBlbmRDaGlsZCh0b29sdGlwKTtcclxuXHJcbiAgLy8gLS0tIEV2ZW50IExpc3RlbmVycyAtLS1cclxuXHJcbiAgLy8gSGVhZGVyIEFjdGlvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDbG9zZUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZU92ZXJsYXkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01pbmltaXplQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNaW5pbWl6ZSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWF4aW1pemVCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZWRCYXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuXHJcbiAgLy8gTW9kYWwgQWN0aW9uc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsQ2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVNb2RhbCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxPdmVybGF5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmlkID09PSAnZmJBZHNNb2RhbE92ZXJsYXknKSBoaWRlTW9kYWwoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTWFpbiBBY3Rpb25zXHJcblxyXG5cclxuICAvLyBNYWluIEFjdGlvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNSZXN0YXJ0QnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBpZiAoY29uZmlybSgnUmVzdGFydCBhbmFseXNpcz8gVGhpcyB3aWxsIGNsZWFyIGN1cnJlbnQgZGF0YS4nKSkge1xyXG4gICAgICAvLyBDbGVhciBsb2NhbCBzdGF0ZVxyXG4gICAgICBzdGF0ZS5yYXdDYW1wYWlnbnMgPSBbXTtcclxuICAgICAgc3RhdGUuYWxsQWRzID0gW107XHJcbiAgICAgIHN0YXRlLmlzSW1wb3J0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIERpc3BhdGNoIHJlc3RhcnQgZXZlbnRcclxuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2ZiQWRzUmVzdGFydCcpKTtcclxuXHJcbiAgICAgIC8vIFJlc2V0IFVJIGltbWVkaWF0ZWx5XHJcbiAgICAgIGNvbnN0IGNoYXJ0Q29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NoYXJ0Q29udGVudCcpO1xyXG4gICAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1N0YXR1c1RleHQnKS50ZXh0Q29udGVudCA9ICdSZXN0YXJ0aW5nLi4uJztcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3Bpbm5lcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNEb3dubG9hZEJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZG93bmxvYWREYXRhKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydElucHV0JykuY2xpY2soKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRJbnB1dCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVJbXBvcnQpO1xyXG5cclxuXHJcbiAgLy8gVmlldyBTd2l0Y2hlclxyXG4gIGNvbnN0IHZpZXdCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdmlld10nKTtcclxuICB2aWV3QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICB2aWV3QnV0dG9ucy5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XHJcbiAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICBzdGF0ZS5jdXJyZW50VmlldyA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS12aWV3Jyk7XHJcblxyXG4gICAgICBjb25zdCBsZWdlbmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNUaW1lbGluZUxlZ2VuZCcpO1xyXG4gICAgICBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0aW1lbGluZScpIHtcclxuICAgICAgICBsZWdlbmQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWdlbmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgfVxyXG4gICAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gU29ydCBTd2l0Y2hlclxyXG4gIGNvbnN0IHNvcnRCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc29ydF0nKTtcclxuXHJcbiAgLy8gSGVscGVyIHRvIHVwZGF0ZSBidXR0b24gbGFiZWxzXHJcbiAgY29uc3QgdXBkYXRlU29ydEJ1dHRvbnMgPSAoKSA9PiB7XHJcbiAgICBzb3J0QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICAgIGNvbnN0IHNvcnRUeXBlID0gYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1zb3J0Jyk7XHJcbiAgICAgIGxldCBsYWJlbCA9IGJ0bi5pbm5lclRleHQucmVwbGFjZSgvIFvihpHihpNdLywgJycpOyAvLyBDbGVhbiBleGlzdGluZyBhcnJvd1xyXG5cclxuICAgICAgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09IHNvcnRUeXBlKSB7XHJcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vIEFkZCBhcnJvd1xyXG4gICAgICAgIGxhYmVsICs9IHN0YXRlLnNvcnREaXJlY3Rpb24gPT09ICdhc2MnID8gJyDihpEnIDogJyDihpMnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgfVxyXG4gICAgICBidG4uaW5uZXJUZXh0ID0gbGFiZWw7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBzb3J0QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB0YXJnZXRTb3J0ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNvcnQnKTtcclxuXHJcbiAgICAgIGlmIChzdGF0ZS5maWx0ZXJTb3J0ID09PSB0YXJnZXRTb3J0KSB7XHJcbiAgICAgICAgLy8gVG9nZ2xlIGRpcmVjdGlvblxyXG4gICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSBzdGF0ZS5zb3J0RGlyZWN0aW9uID09PSAnYXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIE5ldyBzb3J0OiBEZWZhdWx0IHRvICdkZXNjJyBmb3IgZXZlcnl0aGluZz8gXHJcbiAgICAgICAgLy8gVXN1YWxseSAnU3RhcnQgRGF0ZScgdXNlcnMgbWlnaHQgd2FudCBPbGRlc3QgRmlyc3QgKEFzYykgb3IgTmV3ZXN0IEZpcnN0IChEZXNjKS5cclxuICAgICAgICAvLyBMZXQncyBkZWZhdWx0IHRvICdkZXNjJyAoSGlnaC9OZXdlc3QpIGFzIHN0YW5kYXJkLCBidXQgbWF5YmUgJ2FzYycgZm9yIERhdGU/XHJcbiAgICAgICAgLy8gVGhlIG9yaWdpbmFsIGNvZGUgaGFkIGRlZmF1bHQgRGF0ZSBhcyBBc2MgKE9sZGVzdCBmaXJzdCkuXHJcbiAgICAgICAgaWYgKHRhcmdldFNvcnQgPT09ICdyZWNlbnQnKSB7XHJcbiAgICAgICAgICBzdGF0ZS5zb3J0RGlyZWN0aW9uID0gJ2FzYyc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSAnZGVzYyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlLmZpbHRlclNvcnQgPSB0YXJnZXRTb3J0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB1cGRhdGVTb3J0QnV0dG9ucygpO1xyXG4gICAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gSW5pdCBidXR0b24gbGFiZWxzXHJcbiAgdXBkYXRlU29ydEJ1dHRvbnMoKTtcclxuXHJcbiAgLy8gR3JvdXAgYnkgRG9tYWluXHJcbiAgY29uc3QgZ3JvdXBCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNHcm91cERvbWFpbkJ0bicpO1xyXG4gIGdyb3VwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc3RhdGUuZ3JvdXBCeURvbWFpbiA9ICFzdGF0ZS5ncm91cEJ5RG9tYWluO1xyXG4gICAgZ3JvdXBCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XHJcbiAgICB1cGRhdGVWaWV3KCk7XHJcbiAgfSk7XHJcblxyXG5cclxuICAvLyAtLS0gRnVuY3Rpb25zIC0tLVxyXG5cclxuICBmdW5jdGlvbiBzaG93T3ZlcmxheSgpIHtcclxuICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ21pbmltaXplZCcpO1xyXG4gICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhpZGVPdmVybGF5KCkge1xyXG4gICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRvZ2dsZU1pbmltaXplKGUpIHtcclxuICAgIGlmIChlKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSAhc3RhdGUuaXNNaW5pbWl6ZWQ7XHJcbiAgICBpZiAoc3RhdGUuaXNNaW5pbWl6ZWQpIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdtaW5pbWl6ZWQnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnbWluaW1pemVkJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzaG93TW9kYWwoY29udGVudEh0bWwsIHRpdGxlLCBtZXRhKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbFRpdGxlJykuaW5uZXJUZXh0ID0gdGl0bGU7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE1ldGEnKS5pbm5lclRleHQgPSBtZXRhO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxCb2R5JykuaW5uZXJIVE1MID0gY29udGVudEh0bWw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgc2V0dXBDb3B5QnV0dG9ucyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbEJvZHknKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoaWRlTW9kYWwoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29weVJpY2hUZXh0KHBsYWluLCBodG1sKSB7XHJcbiAgICBpZiAodHlwZW9mIENsaXBib2FyZEl0ZW0gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgY29uc3QgdGV4dEJsb2IgPSBuZXcgQmxvYihbcGxhaW5dLCB7IHR5cGU6IFwidGV4dC9wbGFpblwiIH0pO1xyXG4gICAgICBjb25zdCBodG1sQmxvYiA9IG5ldyBCbG9iKFtodG1sXSwgeyB0eXBlOiBcInRleHQvaHRtbFwiIH0pO1xyXG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlKFtcclxuICAgICAgICBuZXcgQ2xpcGJvYXJkSXRlbSh7XHJcbiAgICAgICAgICBcInRleHQvcGxhaW5cIjogdGV4dEJsb2IsXHJcbiAgICAgICAgICBcInRleHQvaHRtbFwiOiBodG1sQmxvYlxyXG4gICAgICAgIH0pXHJcbiAgICAgIF0pLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlJpY2ggY29weSBmYWlsZWQsIGZhbGxpbmcgYmFjayB0byBwbGFpbjpcIiwgZXJyKTtcclxuICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwbGFpbik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocGxhaW4pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0dXBDb3B5QnV0dG9ucyhjb250YWluZXIpIHtcclxuICAgIGNvbnN0IGNvcHlCdG5zID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5mYi1hZHMtY29weS1idG4nKTtcclxuICAgIGNvcHlCdG5zLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQ7IC8vIFVzZSBjdXJyZW50VGFyZ2V0IHRvIGVuc3VyZSB3ZSBnZXQgdGhlIGJ1dHRvbiwgbm90IGljb25cclxuICAgICAgICBjb25zdCByYXdUZXh0ID0gZGVjb2RlVVJJQ29tcG9uZW50KHRhcmdldC5kYXRhc2V0LmNvcHlUZXh0KTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCBtZXRhZGF0YSBpZiBhdmFpbGFibGVcclxuICAgICAgICBjb25zdCBtZXRhID0ge1xyXG4gICAgICAgICAgdXJsOiB0YXJnZXQuZGF0YXNldC51cmwgPyBkZWNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQudXJsKSA6ICcnLFxyXG4gICAgICAgICAgY2FtcGFpZ25EdXJhdGlvbjogdGFyZ2V0LmRhdGFzZXQuY2FtcGFpZ25EdXJhdGlvbiB8fCAnJyxcclxuICAgICAgICAgIGNhbXBhaWduQWRzOiB0YXJnZXQuZGF0YXNldC5jYW1wYWlnbkFkcyB8fCAnJyxcclxuICAgICAgICAgIGxpYklkOiB0YXJnZXQuZGF0YXNldC5hZExpYklkIHx8ICcnLFxyXG4gICAgICAgICAgYWREdXJhdGlvbjogdGFyZ2V0LmRhdGFzZXQuYWREdXJhdGlvbiB8fCAnJyxcclxuICAgICAgICAgIGFkRGF0ZXM6IHRhcmdldC5kYXRhc2V0LmFkRGF0ZXMgfHwgJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDb25zdHJ1Y3QgUmljaCBUZXh0IEhUTUxcclxuICAgICAgICBjb25zdCByaWNoVGV4dCA9IGBcclxuICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LWZhbWlseTogc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNHB4OyBsaW5lLWhlaWdodDogMS41OyBjb2xvcjogIzM3NDE1MTtcIj5cclxuICAgICAgICAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDhweDtcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkNhbXBhaWduOjwvc3Ryb25nPiA8YSBocmVmPVwiJHttZXRhLnVybH1cIj4ke21ldGEudXJsfTwvYT48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHttZXRhLmNhbXBhaWduRHVyYXRpb24gPyBgPHN0cm9uZz5EdXJhdGlvbjo8L3N0cm9uZz4gJHttZXRhLmNhbXBhaWduRHVyYXRpb259IGRheXNgIDogJyd9IFxyXG4gICAgICAgICAgICAgICAgICAgICR7bWV0YS5jYW1wYWlnbkFkcyA/IGDigKIgJHttZXRhLmNhbXBhaWduQWRzfSBhZHNgIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTJweDsgcGFkZGluZy1ib3R0b206IDEycHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTVlN2ViO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TGlicmFyeSBJRDo8L3N0cm9uZz4gPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHttZXRhLmxpYklkfVwiPiR7bWV0YS5saWJJZH08L2E+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RGF0ZXM6PC9zdHJvbmc+ICR7bWV0YS5hZERhdGVzfSB8IDxzdHJvbmc+QWQgRHVyYXRpb246PC9zdHJvbmc+ICR7bWV0YS5hZER1cmF0aW9ufSBkYXlzXHJcbiAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyYXdUZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpfVxyXG4gICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgLy8gQ29uc3RydWN0IFBsYWluIFRleHQgRmFsbGJhY2tcclxuICAgICAgICBjb25zdCBwbGFpblRleHQgPSBgQ2FtcGFpZ246ICR7bWV0YS51cmx9XFxuRHVyYXRpb246ICR7bWV0YS5jYW1wYWlnbkR1cmF0aW9ufSBkYXlzIOKAoiAke21ldGEuY2FtcGFpZ25BZHN9IGFkc1xcblxcbkxpYnJhcnkgSUQ6ICR7bWV0YS5saWJJZH1cXG5EYXRlczogJHttZXRhLmFkRGF0ZXN9IHwgQWQgRHVyYXRpb246ICR7bWV0YS5hZER1cmF0aW9ufSBkYXlzXFxuXFxuLS0tXFxuXFxuJHtyYXdUZXh0fWA7XHJcblxyXG4gICAgICAgIC8vIFVzZSByaWNoIHRleHQgY29weSBoZWxwZXJcclxuICAgICAgICBjb3B5UmljaFRleHQocGxhaW5UZXh0LCByaWNoVGV4dCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsID0gdGFyZ2V0LmlubmVySFRNTDtcclxuICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gJ+KchSBDb3BpZWQhJztcclxuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCgnc3VjY2VzcycpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGFyZ2V0LmlubmVySFRNTCA9IG9yaWdpbmFsO1xyXG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ3N1Y2Nlc3MnKTtcclxuICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZVZpZXcoKSB7XHJcbiAgICBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0aW1lbGluZScpIHtcclxuICAgICAgcmVuZGVyVGltZWxpbmUoKTtcclxuICAgIH0gZWxzZSBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0b3A1LXRleHQnKSB7XHJcbiAgICAgIHJlbmRlclRvcDVUZXh0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcm9jZXNzRGF0YShjYW1wYWlnbnMpIHtcclxuICAgIGNvbnN0IHNvcnRlZCA9IFsuLi5jYW1wYWlnbnNdO1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUHJvY2Vzc2luZyBkYXRhLiBTb3J0OicsIHN0YXRlLmZpbHRlclNvcnQsICdHcm91cDonLCBzdGF0ZS5ncm91cEJ5RG9tYWluKTtcclxuXHJcbiAgICAvLyAxLiBTb3J0aW5nIExvZ2ljXHJcbiAgICAvLyAxLiBTb3J0aW5nIExvZ2ljXHJcbiAgICBzb3J0ZWQuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICBsZXQgdmFsQSwgdmFsQjtcclxuXHJcbiAgICAgIGlmIChzdGF0ZS5maWx0ZXJTb3J0ID09PSAnYWRzJykge1xyXG4gICAgICAgIHZhbEEgPSBOdW1iZXIoYS5hZHNDb3VudCkgfHwgMDtcclxuICAgICAgICB2YWxCID0gTnVtYmVyKGIuYWRzQ291bnQpIHx8IDA7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gJ2R1cmF0aW9uJykge1xyXG4gICAgICAgIHZhbEEgPSBOdW1iZXIoYS5jYW1wYWlnbkR1cmF0aW9uRGF5cykgfHwgMDtcclxuICAgICAgICB2YWxCID0gTnVtYmVyKGIuY2FtcGFpZ25EdXJhdGlvbkRheXMpIHx8IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gJ3JlY2VudCcgLyBTdGFydCBEYXRlXHJcbiAgICAgICAgdmFsQSA9IG5ldyBEYXRlKGEuZmlyc3RBZHZlcnRpc2VkKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgdmFsQiA9IG5ldyBEYXRlKGIuZmlyc3RBZHZlcnRpc2VkKS5nZXRUaW1lKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0YW5kYXJkIEFzY2VuZGluZzogdmFsQSAtIHZhbEJcclxuICAgICAgY29uc3QgY29tcGFyaXNvbiA9IHZhbEEgLSB2YWxCO1xyXG5cclxuICAgICAgLy8gQXBwbHkgRGlyZWN0aW9uXHJcbiAgICAgIHJldHVybiBzdGF0ZS5zb3J0RGlyZWN0aW9uID09PSAnYXNjJyA/IGNvbXBhcmlzb24gOiAtY29tcGFyaXNvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIDIuIEdyb3VwaW5nIExvZ2ljIChTZWNvbmRhcnkgU29ydClcclxuICAgIGlmIChzdGF0ZS5ncm91cEJ5RG9tYWluKSB7XHJcbiAgICAgIHNvcnRlZC5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZEEgPSBnZXREb21haW4oYS51cmwpO1xyXG4gICAgICAgIGNvbnN0IGRCID0gZ2V0RG9tYWluKGIudXJsKTtcclxuICAgICAgICBpZiAoZEEgPCBkQikgcmV0dXJuIC0xO1xyXG4gICAgICAgIGlmIChkQSA+IGRCKSByZXR1cm4gMTtcclxuICAgICAgICAvLyBLZWVwIHByZXZpb3VzIHNvcnQgb3JkZXIgd2l0aGluIHNhbWUgZG9tYWluXHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzb3J0ZWQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXREb21haW4odXJsKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gbmV3IFVSTCh1cmwpLmhvc3RuYW1lLnJlcGxhY2UoJ3d3dy4nLCAnJyk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgcmV0dXJuIHVybDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclRpbWVsaW5lKCkge1xyXG4gICAgY29uc3QgY2hhcnRDb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ2hhcnRDb250ZW50Jyk7XHJcbiAgICBjaGFydENvbnRlbnQuY2xhc3NMaXN0LnJlbW92ZSgnZmItYWRzLWJnLWdyYXknKTtcclxuICAgIGNoYXJ0Q29udGVudC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICBjb25zdCBjYW1wYWlnbnNUb1JlbmRlciA9IHByb2Nlc3NEYXRhKHN0YXRlLnJhd0NhbXBhaWducyk7XHJcblxyXG4gICAgaWYgKGNhbXBhaWduc1RvUmVuZGVyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJmYi1hZHMtZW1wdHktc3RhdGVcIj5ObyBjYW1wYWlnbnMgbWF0Y2ggY3JpdGVyaWE8L2Rpdj4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3VidGl0bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNTdWJ0aXRsZScpO1xyXG4gICAgaWYgKHN0YXRlLnJhd0NhbXBhaWducy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGNvbnN0IGZpcnN0ID0gbmV3IERhdGUoc3RhdGUucmF3Q2FtcGFpZ25zW3N0YXRlLnJhd0NhbXBhaWducy5sZW5ndGggLSAxXS5maXJzdEFkdmVydGlzZWQpO1xyXG4gICAgICBjb25zdCBsYXN0ID0gbmV3IERhdGUoc3RhdGUucmF3Q2FtcGFpZ25zWzBdLmxhc3RBZHZlcnRpc2VkKTsgLy8gUm91Z2ggYXBwcm94IGRlcGVuZGluZyBvbiBzb3J0XHJcbiAgICAgIHN1YnRpdGxlLnRleHRDb250ZW50ID0gYCR7c3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aH0gY2FtcGFpZ25zIGFuYWx5emVkYDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIFRpbWVsaW5lIFJhbmdlXHJcbiAgICBsZXQgbWluRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBsZXQgbWF4RGF0ZSA9IG5ldyBEYXRlKDApO1xyXG5cclxuICAgIGNhbXBhaWduc1RvUmVuZGVyLmZvckVhY2goYyA9PiB7XHJcbiAgICAgIGlmIChjLmZpcnN0QWR2ZXJ0aXNlZCA8IG1pbkRhdGUpIG1pbkRhdGUgPSBjLmZpcnN0QWR2ZXJ0aXNlZDtcclxuICAgICAgaWYgKGMubGFzdEFkdmVydGlzZWQgPiBtYXhEYXRlKSBtYXhEYXRlID0gYy5sYXN0QWR2ZXJ0aXNlZDtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGRheU1zID0gODY0MDAwMDA7XHJcbiAgICAvLyBFbnN1cmUgYXQgbGVhc3QgMSBkYXkgcmFuZ2UgdG8gYXZvaWQgZGl2aXNpb24gYnkgemVyb1xyXG4gICAgbGV0IHJhbmdlTXMgPSBtYXhEYXRlIC0gbWluRGF0ZTtcclxuICAgIGlmIChyYW5nZU1zIDwgZGF5TXMpIHJhbmdlTXMgPSBkYXlNcztcclxuXHJcbiAgICAvLyBBZGQgcGFkZGluZyAobWF4IG9mIDUgZGF5cyBvciAxMCUgb2YgdG90YWwgcmFuZ2UpXHJcbiAgICBjb25zdCBwYWRkaW5nID0gTWF0aC5tYXgoZGF5TXMgKiA1LCByYW5nZU1zICogMC4xKTtcclxuXHJcbiAgICBjb25zdCByZW5kZXJNaW4gPSBuZXcgRGF0ZShtaW5EYXRlLmdldFRpbWUoKSAtIHBhZGRpbmcpO1xyXG4gICAgY29uc3QgcmVuZGVyTWF4ID0gbmV3IERhdGUobWF4RGF0ZS5nZXRUaW1lKCkgKyBwYWRkaW5nKTtcclxuICAgIGNvbnN0IHRvdGFsRHVyYXRpb24gPSByZW5kZXJNYXggLSByZW5kZXJNaW47XHJcblxyXG4gICAgLy8gSGVhZGVyXHJcbiAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGhlYWRlci5jbGFzc05hbWUgPSAnZmItYWRzLXRpbWVsaW5lLWhlYWRlcic7XHJcbiAgICBoZWFkZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10aW1lbGluZS1sYWJlbFwiPjxzdHJvbmc+Q2FtcGFpZ248L3N0cm9uZz48L2Rpdj5cclxuICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtZ3JpZFwiPjwvZGl2PlxyXG4gICAgYDtcclxuICAgIGNoYXJ0Q29udGVudC5hcHBlbmRDaGlsZChoZWFkZXIpO1xyXG5cclxuICAgIGNvbnN0IGdyaWQgPSBoZWFkZXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy10aW1lbGluZS1ncmlkJyk7XHJcblxyXG4gICAgLy8gQWRhcHRpdmUgTWFya2VycyBsb2dpY1xyXG4gICAgY29uc3QgaXNTaG9ydFJhbmdlID0gcmFuZ2VNcyA8IChkYXlNcyAqIDYwKTtcclxuXHJcbiAgICBpZiAoaXNTaG9ydFJhbmdlKSB7XHJcbiAgICAgIC8vIFdlZWtseSBtYXJrZXJzXHJcbiAgICAgIGxldCBkID0gbmV3IERhdGUocmVuZGVyTWluKTtcclxuICAgICAgd2hpbGUgKGQgPD0gcmVuZGVyTWF4KSB7XHJcbiAgICAgICAgY29uc3QgcG9zID0gKChkIC0gcmVuZGVyTWluKSAvIHRvdGFsRHVyYXRpb24pICogMTAwO1xyXG4gICAgICAgIGlmIChwb3MgPj0gMCAmJiBwb3MgPD0gMTAwKSB7XHJcbiAgICAgICAgICBjb25zdCBtYXJrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgIG1hcmtlci5jbGFzc05hbWUgPSAnZmItYWRzLW1vbnRoLW1hcmtlcic7XHJcbiAgICAgICAgICBtYXJrZXIuc3R5bGUubGVmdCA9IGAke3Bvc30lYDtcclxuICAgICAgICAgIG1hcmtlci5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImZiLWFkcy1tb250aC1sYWJlbFwiPiR7ZC50b0xvY2FsZVN0cmluZygnZGVmYXVsdCcsIHsgbW9udGg6ICdzaG9ydCcsIGRheTogJ251bWVyaWMnIH0pfTwvZGl2PmA7XHJcbiAgICAgICAgICBncmlkLmFwcGVuZENoaWxkKG1hcmtlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSArIDcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBNb250aGx5IG1hcmtlcnNcclxuICAgICAgbGV0IGQgPSBuZXcgRGF0ZShyZW5kZXJNaW4pO1xyXG4gICAgICBkLnNldERhdGUoMSk7XHJcbiAgICAgIHdoaWxlIChkIDw9IHJlbmRlck1heCkge1xyXG4gICAgICAgIGNvbnN0IHBvcyA9ICgoZCAtIHJlbmRlck1pbikgLyB0b3RhbER1cmF0aW9uKSAqIDEwMDtcclxuICAgICAgICBpZiAocG9zID49IDAgJiYgcG9zIDw9IDEwMCkge1xyXG4gICAgICAgICAgY29uc3QgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICBtYXJrZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1tb250aC1tYXJrZXInO1xyXG4gICAgICAgICAgbWFya2VyLnN0eWxlLmxlZnQgPSBgJHtwb3N9JWA7XHJcbiAgICAgICAgICBtYXJrZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9udGgtbGFiZWxcIj4ke2QudG9Mb2NhbGVTdHJpbmcoJ2RlZmF1bHQnLCB7IG1vbnRoOiAnc2hvcnQnLCB5ZWFyOiAnMi1kaWdpdCcgfSl9PC9kaXY+YDtcclxuICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobWFya2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZC5zZXRNb250aChkLmdldE1vbnRoKCkgKyAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbmRlciBSb3dzXHJcbiAgICBsZXQgbGFzdERvbWFpbiA9IG51bGw7XHJcblxyXG4gICAgY2FtcGFpZ25zVG9SZW5kZXIuZm9yRWFjaChjYW1wYWlnbiA9PiB7XHJcbiAgICAgIC8vIERvbWFpbiBIZWFkZXIgZm9yIEdyb3VwaW5nXHJcbiAgICAgIGNvbnN0IGRvbWFpbiA9IGdldERvbWFpbihjYW1wYWlnbi51cmwpO1xyXG4gICAgICBpZiAoc3RhdGUuZ3JvdXBCeURvbWFpbiAmJiBkb21haW4gIT09IGxhc3REb21haW4pIHtcclxuICAgICAgICBjb25zdCBncm91cEhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGdyb3VwSGVhZGVyLmNsYXNzTmFtZSA9ICdmYi1hZHMtZG9tYWluLWhlYWRlcic7XHJcbiAgICAgICAgZ3JvdXBIZWFkZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtZG9tYWluLW5hbWVcIj4ke2RvbWFpbn08L2Rpdj5gO1xyXG4gICAgICAgIGNoYXJ0Q29udGVudC5hcHBlbmRDaGlsZChncm91cEhlYWRlcik7XHJcbiAgICAgICAgbGFzdERvbWFpbiA9IGRvbWFpbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHJvdy5jbGFzc05hbWUgPSAnZmItYWRzLWNhbXBhaWduLXJvdyc7XHJcblxyXG4gICAgICBjb25zdCBsZWZ0ID0gKChjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQgLSByZW5kZXJNaW4pIC8gdG90YWxEdXJhdGlvbikgKiAxMDA7XHJcbiAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5tYXgoMC41LCAoKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkIC0gY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkKSAvIHRvdGFsRHVyYXRpb24pICogMTAwKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBnZXRBZENvdW50Q29sb3IoY2FtcGFpZ24uYWRzQ291bnQpO1xyXG5cclxuICAgICAgcm93LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24taW5mb1wiPlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi11cmxcIiB0aXRsZT1cIiR7Y2FtcGFpZ24udXJsfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7Y2FtcGFpZ24udXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwiY29sb3I6IGluaGVyaXQ7IHRleHQtZGVjb3JhdGlvbjogbm9uZTtcIj4ke2NhbXBhaWduLnVybH08L2E+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgbWFyZ2luLWxlZnQ6IDZweDtcIj5cclxuICAgICAgICAgICAgICAgICAgKDxhIGhyZWY9XCJodHRwczovL3dlYi5hcmNoaXZlLm9yZy93ZWIvKi8ke2NhbXBhaWduLnVybH0vKlwiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwiY29sb3I6ICM2YjcyODA7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1wiPkFyY2hpdmU8L2E+KVxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLW1ldGFcIj5cclxuICAgICAgICAgICAgICAgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyDigKIgJHtjYW1wYWlnbi5hZHNDb3VudH0gYWRzXHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi10aW1lbGluZVwiPlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10aW1lbGluZS1iZy1tYXJrZXJcIiBzdHlsZT1cImxlZnQ6ICR7bGVmdH0lOyB3aWR0aDogJHt3aWR0aH0lXCI+PC9kaXY+IFxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi1iYXJcIiBcclxuICAgICAgICAgICAgICAgICAgc3R5bGU9XCJsZWZ0OiAke2xlZnR9JTsgd2lkdGg6ICR7d2lkdGh9JTsgYmFja2dyb3VuZDogJHtjb2xvcn07IGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuMSk7XCI+XHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgYDtcclxuXHJcbiAgICAgIC8vIFRvb2x0aXAgbG9naWMgZm9yIHRoZSBiYXJcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgbmVlZCB0byBxdWVyeSB0aGUgbmV3bHkgYWRkZWQgcm93J3MgYmFyLiBcclxuICAgICAgICAvLyBTaW5jZSB3ZSBhcHBlbmRDaGlsZChyb3cpIGxhdGVyLCB3ZSBjYW4gYXR0YWNoIGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCAncm93JyBiZWZvcmUgYXBwZW5kaW5nP1xyXG4gICAgICAgIC8vIFdhaXQsIHRoZSByb3cgaXMgY3JlYXRlZCB2aWEgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgdGhlbiBhcHBlbmRlZC5cclxuICAgICAgICAvLyBTbyB3ZSBjYW4gZmluZCB0aGUgYmFyIGluc2lkZSAncm93JyBpbW1lZGlhdGVseS5cclxuICAgICAgICBjb25zdCBiYXIgPSByb3cucXVlcnlTZWxlY3RvcignLmZiLWFkcy1jYW1wYWlnbi1iYXInKTtcclxuICAgICAgICBpZiAoYmFyKSB7XHJcbiAgICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gbmV3IERhdGUoY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgY29uc3QgZW5kRGF0ZSA9IG5ldyBEYXRlKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIHRvb2x0aXAuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRvb2x0aXAtaGVhZGVyXCI+Q2FtcGFpZ24gRGV0YWlsczwvZGl2PlxyXG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRvb2x0aXAtZGF0ZXNcIj4ke3N0YXJ0RGF0ZX0g4oCUICR7ZW5kRGF0ZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJmYi1hZHMtdG9vbHRpcC1hY3Rpb25cIiBpZD1cImZiQWRzVG9vbHRpcFZpZXdCdG5cIj5DbGljayB0byBWaWV3IFRvcCA1IEFkczwvYT5cclxuICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICAgICAgICAvLyBBdHRhY2ggY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGxpbmsgaW5zaWRlIHRvb2x0aXBcclxuICAgICAgICAgICAgY29uc3Qgdmlld0J0biA9IHRvb2x0aXAucXVlcnlTZWxlY3RvcignI2ZiQWRzVG9vbHRpcFZpZXdCdG4nKTtcclxuICAgICAgICAgICAgaWYgKHZpZXdCdG4pIHtcclxuICAgICAgICAgICAgICB2aWV3QnRuLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIG9wZW5DYW1wYWlnbkRldGFpbHMoY2FtcGFpZ24pO1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBQb3NpdGlvbiB0b29sdGlwIG5lYXIgbW91c2UgYnV0IGVuc3VyZSBpdCBzdGF5cyB3aXRoaW4gdmlld3BvcnRcclxuICAgICAgICAgICAgLy8gQWRkIHNsaWdodCBvZmZzZXQgc28gaXQgZG9lc24ndCBmbGlja2VyXHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLmNsaWVudFggKyAxNTtcclxuICAgICAgICAgICAgY29uc3QgeSA9IGUuY2xpZW50WSArIDE1O1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSB5ICsgJ3B4JztcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIDApO1xyXG5cclxuICAgICAgcm93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICAvLyBEb24ndCBvcGVuIG1vZGFsIGlmIGNsaWNraW5nIGEgbGlua1xyXG4gICAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCdhJykpIHJldHVybjtcclxuICAgICAgICBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjaGFydENvbnRlbnQuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyVG9wNVRleHQoKSB7XHJcbiAgICBjb25zdCBjaGFydENvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDaGFydENvbnRlbnQnKTtcclxuICAgIGNoYXJ0Q29udGVudC5jbGFzc0xpc3QuYWRkKCdmYi1hZHMtYmctZ3JheScpO1xyXG4gICAgY29uc3Qgc3VidGl0bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNTdWJ0aXRsZScpO1xyXG4gICAgc3VidGl0bGUudGV4dENvbnRlbnQgPSBgVG9wIDUgYWRzIGZvciAke3N0YXRlLnJhd0NhbXBhaWducy5sZW5ndGh9IGNhbXBhaWduc2A7XHJcblxyXG4gICAgaWYgKCFzdGF0ZS5yYXdDYW1wYWlnbnMgfHwgc3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJmYi1hZHMtZW1wdHktc3RhdGVcIj5ObyBjYW1wYWlnbiBkYXRhIGF2YWlsYWJsZTwvZGl2Pic7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgb3V0cHV0ID0gJyc7XHJcbiAgICBjb25zdCBjYW1wYWlnbnNUb1JlbmRlciA9IHByb2Nlc3NEYXRhKHN0YXRlLnJhd0NhbXBhaWducyk7XHJcblxyXG4gICAgY2FtcGFpZ25zVG9SZW5kZXIuZm9yRWFjaChjYW1wYWlnbiA9PiB7XHJcbiAgICAgIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZVN0cikgPT4gbmV3IERhdGUoZGF0ZVN0cikudG9EYXRlU3RyaW5nKCk7XHJcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0QWRDb3VudENvbG9yKGNhbXBhaWduLmFkc0NvdW50KTtcclxuXHJcbiAgICAgIG91dHB1dCArPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWNhbXBhaWduIGZiLWFkcy1jYXJkLXdoaXRlXCIgc3R5bGU9XCJib3JkZXItbGVmdDogNHB4IHNvbGlkICR7Y29sb3J9O1wiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWhlYWRlclwiPlxyXG4gICAgICAgICAgICA8c3Ryb25nPiR7Y2FtcGFpZ24udXJsfTwvc3Ryb25nPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtbWV0YVwiPlxyXG4gICAgICAgICAgICAke2Zvcm1hdERhdGUoY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkKX0g4oCUICR7Zm9ybWF0RGF0ZShjYW1wYWlnbi5sYXN0QWR2ZXJ0aXNlZCl9IHwgXHJcbiAgICAgICAgICAgICR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9IGRheXMgfCBcclxuICAgICAgICAgICAgJHtjYW1wYWlnbi5hZHNDb3VudH0gYWRzXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgJHtjYW1wYWlnbi50b3A1ICYmIGNhbXBhaWduLnRvcDUubGVuZ3RoID4gMCA/IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkc1wiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1sYWJlbFwiPlRvcCA1IEFkczwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtZ3JpZFwiPlxyXG4gICAgICAgICAgICAgICR7Y2FtcGFpZ24udG9wNS5tYXAoYWQgPT4gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkxpYnJhcnkgSUQ6PC9zdHJvbmc+IFxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vYWRzL2xpYnJhcnkvP2lkPSR7YWQubGlicmFyeUlkfVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZmItYWRzLWxpYnJhcnktaWQtbGlua1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgJHthZC5saWJyYXJ5SWR9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkLW1ldGFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkRhdGVzOjwvc3Ryb25nPiAke25ldyBEYXRlKGFkLnN0YXJ0aW5nRGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCl9IOKAlCAke25ldyBEYXRlKGFkLmVuZERhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygpfTxicj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkR1cmF0aW9uOjwvc3Ryb25nPiAke2FkLmR1cmF0aW9ufSBkYXlzXHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWQtY29weVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAke2FkLm1lZGlhVHlwZSA9PT0gJ3ZpZGVvJ1xyXG4gICAgICAgICAgPyBgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDhweDtcIj48dmlkZW8gc3JjPVwiJHthZC5tZWRpYVNyY31cIiBjb250cm9scyBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgaGVpZ2h0OiBhdXRvOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC92aWRlbz48L2Rpdj5gXHJcbiAgICAgICAgICA6IChhZC5tZWRpYVR5cGUgPT09ICdpbWFnZScgPyBgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDhweDtcIj48aW1nIHNyYz1cIiR7YWQubWVkaWFTcmN9XCIgc3R5bGU9XCJtYXgtd2lkdGg6IDEwMCU7IGhlaWdodDogYXV0bzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvZGl2PmAgOiAnJylcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5BZCBDb3B5Ojwvc3Ryb25nPjxicj5cclxuICAgICAgICAgICAgICAgICAgICAke2FkLmFkVGV4dCB8fCAnW25vIGNvcHldJ31cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBgIDogJzxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1uby1hZHNcIj5ObyB0b3AgYWRzIGRhdGEgYXZhaWxhYmxlPC9kaXY+J31cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYDtcclxuICAgIH0pO1xyXG5cclxuICAgIGNoYXJ0Q29udGVudC5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hY3Rpb25zXCIgc3R5bGU9XCJtYXJnaW4tdG9wOiAxNXB4OyBtYXJnaW4tYm90dG9tOiAyMHB4OyBkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kOyBnYXA6IDEwcHg7XCI+XHJcbiAgICAgICAgJHtzdGF0ZS5haUNvbmZpZyA/IGBcclxuICAgICAgICA8YnV0dG9uIGlkPVwiZmJBZHNBbmFseXplQnRuXCIgY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCI+XHJcbiAgICAgICAgICDwn6SWIEFuYWx5emUgd2l0aCBBSVxyXG4gICAgICAgIDwvYnV0dG9uPmAgOiAnJ1xyXG4gICAgICB9XHJcbiAgICA8YnV0dG9uIGlkPVwiZmJBZHNDb3B5QWxsVGV4dEJ0blwiIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiPlxyXG4gICAgICDwn5OLIENvcHkgQWxsIFRleHRcclxuICAgIDwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgIDxkaXYgaWQ9XCJmYkFkc0FJUmVzdWx0XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lOyBtYXJnaW4tYm90dG9tOiAyMHB4OyBiYWNrZ3JvdW5kOiAjZjBmZGY0OyBib3JkZXI6IDFweCBzb2xpZCAjYmJmN2QwOyBib3JkZXItcmFkaXVzOiA4cHg7IGNvbG9yOiAjMTY2NTM0OyBvdmVyZmxvdzogaGlkZGVuO1wiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1haS1oZWFkZXJcIiBzdHlsZT1cInBhZGRpbmc6IDEycHggMTZweDsgYmFja2dyb3VuZDogI2RjZmNlNzsgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyOyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYmJmN2QwO1wiPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC13ZWlnaHQ6IDYwMDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA4cHg7XCI+8J+kliBBSSBBbmFseXNpczwvZGl2PlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWFpLW1pbmltaXplXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IGZvbnQtc2l6ZTogMThweDsgY29sb3I6ICMxNjY1MzQ7IGN1cnNvcjogcG9pbnRlcjsgbGluZS1oZWlnaHQ6IDE7XCI+4oiSPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWktY29udGVudFwiIHN0eWxlPVwicGFkZGluZzogMTZweDsgd2hpdGUtc3BhY2U6IHByZS13cmFwO1wiPjwvZGl2PlxyXG4gICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1vdXRwdXRcIj4ke291dHB1dH08L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gVG9nZ2xlIG1pbmltaXplXHJcbiAgICBjb25zdCBhaUhlYWRlciA9IGNoYXJ0Q29udGVudC5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLWFpLWhlYWRlcicpO1xyXG4gICAgY29uc3QgYWlDb250ZW50ID0gY2hhcnRDb250ZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktY29udGVudCcpO1xyXG4gICAgY29uc3QgbWluaW1pemVCdG4gPSBjaGFydENvbnRlbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy1haS1taW5pbWl6ZScpO1xyXG5cclxuICAgIGlmIChhaUhlYWRlcikge1xyXG4gICAgICBhaUhlYWRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBjb25zdCBpc0hpZGRlbiA9IGFpQ29udGVudC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZSc7XHJcbiAgICAgICAgYWlDb250ZW50LnN0eWxlLmRpc3BsYXkgPSBpc0hpZGRlbiA/ICdibG9jaycgOiAnbm9uZSc7XHJcbiAgICAgICAgbWluaW1pemVCdG4udGV4dENvbnRlbnQgPSBpc0hpZGRlbiA/ICfiiJInIDogJysnO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXN0b3JlIEFJIFJlc3VsdCBpZiBleGlzdHNcclxuICAgIGNvbnN0IHJlc3VsdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FJUmVzdWx0Jyk7XHJcbiAgICBpZiAoc3RhdGUuYWlBbmFseXNpc1Jlc3VsdCkge1xyXG4gICAgICBjb25zdCBjb250ZW50RGl2ID0gcmVzdWx0RGl2LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtYWktY29udGVudCcpO1xyXG4gICAgICBjb250ZW50RGl2LmlubmVySFRNTCA9IHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQ7XHJcbiAgICAgIHJlc3VsdERpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3RhdGUuYWlDb25maWcpIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQW5hbHl6ZUJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFuYWx5emVXaXRoQUkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NvcHlBbGxUZXh0QnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLXRleHQtb3V0cHV0Jyk7XHJcbiAgICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XHJcblxyXG4gICAgICAvLyAxLiBUZW1wb3JhcmlseSBoaWRlIG1lZGlhXHJcbiAgICAgIGNvbnN0IG1lZGlhID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZywgdmlkZW8nKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxEaXNwbGF5cyA9IFtdO1xyXG4gICAgICBtZWRpYS5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICBvcmlnaW5hbERpc3BsYXlzLnB1c2goZWwuc3R5bGUuZGlzcGxheSk7XHJcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyAyLiBTZWxlY3QgY29udGVudFxyXG4gICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGNvbnRhaW5lcik7XHJcbiAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcclxuXHJcbiAgICAgIC8vIDMuIENvcHlcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xyXG5cclxuICAgICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDb3B5QWxsVGV4dEJ0bicpO1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgICAgICBidG4udGV4dENvbnRlbnQgPSAn4pyFIENvcGllZCEnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIH0sIDIwMDApO1xyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdDb3B5IGZhaWxlZDonLCBlcnIpO1xyXG4gICAgICAgIGFsZXJ0KCdDb3B5IGZhaWxlZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyA0LiBDbGVhbnVwXHJcbiAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgbWVkaWEuZm9yRWFjaCgoZWwsIGkpID0+IHtcclxuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gb3JpZ2luYWxEaXNwbGF5c1tpXTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9wZW5DYW1wYWlnbkRldGFpbHMoY2FtcGFpZ24pIHtcclxuICAgIGlmICghY2FtcGFpZ24udG9wNSB8fCBjYW1wYWlnbi50b3A1Lmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBjb250ZW50ID0gYDwgZGl2IGNsYXNzPVwiZmItYWRzLWxpc3RcIiA+IGA7XHJcblxyXG4gICAgY2FtcGFpZ24udG9wNS5mb3JFYWNoKChhZCwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyKSA9PiBuZXcgRGF0ZShkYXRlU3RyKS50b0RhdGVTdHJpbmcoKTtcclxuICAgICAgY29udGVudCArPSBgXHJcbiAgICAgIDwgZGl2IGNsYXNzPVwiZmItYWRzLWNhcmQgZmItYWRzLWNhcmQtd2hpdGVcIiA+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtcmFua1wiPlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1yYW5rLW51bWJlclwiPiMke2luZGV4ICsgMX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1sYWJlbFwiPkxpYnJhcnkgSUQ8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHthZC5saWJyYXJ5SWR9XCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1saW5rXCI+JHthZC5saWJyYXJ5SWR9PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtZHVyYXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtZHVyYXRpb24tbGFiZWxcIj5EdXJhdGlvbjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1kdXJhdGlvbi12YWx1ZVwiPiR7YWQuZHVyYXRpb259IGRheXM8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtbWV0YVwiPiR7Zm9ybWF0RGF0ZShhZC5zdGFydGluZ0RhdGUpfSAtICR7Zm9ybWF0RGF0ZShhZC5lbmREYXRlKX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1zZWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgJHthZC5tZWRpYVR5cGUgPT09ICd2aWRlbydcclxuICAgICAgICAgID8gYDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtaW1hZ2VcIiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDEycHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj48dmlkZW8gc3JjPVwiJHthZC5tZWRpYVNyY31cIiBjb250cm9scyBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgbWF4LWhlaWdodDogMzAwcHg7IGJvcmRlci1yYWRpdXM6IDZweDsgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKTtcIj48L3ZpZGVvPjwvZGl2PmBcclxuICAgICAgICAgIDogKGFkLm1lZGlhVHlwZSA9PT0gJ2ltYWdlJyA/IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWltYWdlXCIgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxMnB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+PGltZyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBtYXgtaGVpZ2h0OiAzMDBweDsgYm9yZGVyLXJhZGl1czogNnB4OyBib3gtc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpO1wiPjwvZGl2PmAgOiAnJylcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWNvcHktaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1sYWJlbFwiPkFkIENvcHk8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1jb3B5LWJ0blwiIFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtY29weS10ZXh0PVwiJHtlbmNvZGVVUklDb21wb25lbnQoYWQuYWRUZXh0IHx8ICcnKX1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtdXJsPVwiJHtlbmNvZGVVUklDb21wb25lbnQoY2FtcGFpZ24udXJsKX1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtY2FtcGFpZ24tZHVyYXRpb249XCIke2NhbXBhaWduLmNhbXBhaWduRHVyYXRpb25EYXlzfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jYW1wYWlnbi1hZHM9XCIke2NhbXBhaWduLmFkc0NvdW50fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1saWItaWQ9XCIke2FkLmxpYnJhcnlJZH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtYWQtZHVyYXRpb249XCIke2FkLmR1cmF0aW9ufVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1kYXRlcz1cIiR7Zm9ybWF0RGF0ZShhZC5zdGFydGluZ0RhdGUpfSDigJQgJHtmb3JtYXREYXRlKGFkLmVuZERhdGUpfVwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICDwn5OLIENvcHlcclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weVwiPiR7YWQuYWRUZXh0IHx8ICdbTm8gY29weSBhdmFpbGFibGVdJ308L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2ID5cclxuICAgICAgYDtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnRlbnQgKz0gYDwvZGl2ID4gYDtcclxuICAgIHNob3dNb2RhbChjb250ZW50LCBgJHtjYW1wYWlnbi51cmx9IGAsIGAke2NhbXBhaWduLmFkc0NvdW50fSB0b3RhbCBhZHMg4oCiICR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9IGRheXMgYWN0aXZlYCk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gRGF0YSBNYW5hZ2VtZW50IC0tLVxyXG5cclxuICBmdW5jdGlvbiBkb3dubG9hZERhdGEoKSB7XHJcbiAgICAvLyBHZW5lcmF0ZSBmaWxlbmFtZSBwcm9wZXJ0aWVzXHJcbiAgICBjb25zdCBhZHZlcnRpc2VyID0gKHN0YXRlLm1ldGFkYXRhPy5hZHZlcnRpc2VyTmFtZSB8fCAnZmJfYWRzX2FuYWx5c2lzJylcclxuICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxyXG4gICAgICAucmVwbGFjZSgvKF4tfC0kKS9nLCAnJyk7XHJcblxyXG4gICAgY29uc3QgY291bnQgPSBzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBkYXRlIHJhbmdlIGZyb20gYWxsIGNhbXBhaWduc1xyXG4gICAgbGV0IG1pbkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IG1heERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgaWYgKGMuZmlyc3RBZHZlcnRpc2VkIDwgbWluRGF0ZSkgbWluRGF0ZSA9IGMuZmlyc3RBZHZlcnRpc2VkO1xyXG4gICAgICBpZiAoYy5sYXN0QWR2ZXJ0aXNlZCA+IG1heERhdGUpIG1heERhdGUgPSBjLmxhc3RBZHZlcnRpc2VkO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGVscGVyIGZvciBkYXRlIGZvcm1hdHRpbmcgbGlrZSBcImphbi0xLTIwMjVcIlxyXG4gICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkKSA9PiB7XHJcbiAgICAgIGNvbnN0IG0gPSBbXCJqYW5cIiwgXCJmZWJcIiwgXCJtYXJcIiwgXCJhcHJcIiwgXCJtYXlcIiwgXCJqdW5cIiwgXCJqdWxcIiwgXCJhdWdcIiwgXCJzZXBcIiwgXCJvY3RcIiwgXCJub3ZcIiwgXCJkZWNcIl07XHJcbiAgICAgIHJldHVybiBgJHttW2QuZ2V0TW9udGgoKV19IC0ke2QuZ2V0RGF0ZSgpfSAtJHtkLmdldEZ1bGxZZWFyKCl9IGA7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0U3RyID0gZm9ybWF0RGF0ZShtaW5EYXRlKTtcclxuICAgIGNvbnN0IGVuZFN0ciA9IGZvcm1hdERhdGUobWF4RGF0ZSk7XHJcblxyXG4gICAgLy8gRmlsZW5hbWU6IHBlbmctam9vbi1mYi1hZHMtOC1jYW1wYWlnbnMtZnJvbS1qYW4tMS0yMDI1LXRvLWRlYy0yNC0yMDI1Lmpzb25cclxuICAgIGNvbnN0IGZpbGVuYW1lID0gYCR7YWR2ZXJ0aXNlcn0gLWZiIC0gYWRzIC0gJHtjb3VudH0gLWNhbXBhaWducyAtIGZyb20gLSAke3N0YXJ0U3RyfSAtdG8gLSAke2VuZFN0cn0uanNvbmA7XHJcblxyXG4gICAgY29uc3QgZGF0YVN0ciA9IFwiZGF0YTp0ZXh0L2pzb247Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgIGNhbXBhaWduczogc3RhdGUucmF3Q2FtcGFpZ25zLFxyXG4gICAgICBhbGxBZHM6IHN0YXRlLmFsbEFkcyxcclxuICAgICAgbWV0YWRhdGE6IHN0YXRlLm1ldGFkYXRhIHx8IHsgYWR2ZXJ0aXNlck5hbWU6IGFkdmVydGlzZXIgfSwgLy8gRmFsbGJhY2sgbWV0YWRhdGFcclxuICAgICAgYWlBbmFseXNpc1Jlc3VsdDogc3RhdGUuYWlBbmFseXNpc1Jlc3VsdCB8fCBudWxsXHJcbiAgICB9LCBudWxsLCAyKSk7XHJcblxyXG4gICAgY29uc3QgZG93bmxvYWRBbmNob3JOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgZGF0YVN0cik7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb3dubG9hZEFuY2hvck5vZGUpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLmNsaWNrKCk7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUucmVtb3ZlKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVGaWxlSW1wb3J0KGV2ZW50KSB7XHJcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzWzBdO1xyXG4gICAgaWYgKCFmaWxlKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGUudGFyZ2V0LnJlc3VsdCk7XHJcbiAgICAgICAgaWYgKCFqc29uLmNhbXBhaWducykgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmb3JtYXRcIik7XHJcbiAgICAgICAgbG9hZEltcG9ydGVkRGF0YShqc29uKTtcclxuICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIGltcG9ydGluZyBmaWxlOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2FkSW1wb3J0ZWREYXRhKGltcG9ydGVkRGF0YSkge1xyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zID0gaW1wb3J0ZWREYXRhLmNhbXBhaWducyB8fCBbXTtcclxuICAgIHN0YXRlLmFsbEFkcyA9IGltcG9ydGVkRGF0YS5hbGxBZHMgfHwgW107XHJcbiAgICBzdGF0ZS5tZXRhZGF0YSA9IGltcG9ydGVkRGF0YS5tZXRhZGF0YSB8fCBudWxsO1xyXG4gICAgc3RhdGUuaXNJbXBvcnRlZCA9ICEhaW1wb3J0ZWREYXRhLmlzSW1wb3J0ZWQ7XHJcbiAgICBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0ID0gaW1wb3J0ZWREYXRhLmFpQW5hbHlzaXNSZXN1bHQgfHwgbnVsbDtcclxuXHJcbiAgICAvLyBIaWRlIERvd25sb2FkIEJ1dHRvbiBpZiBpbXBvcnRlZFxyXG4gICAgY29uc3QgZG93bmxvYWRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNEb3dubG9hZEJ0bicpO1xyXG4gICAgaWYgKHN0YXRlLmlzSW1wb3J0ZWQpIHtcclxuICAgICAgZG93bmxvYWRCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvd25sb2FkQnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWZsZXgnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBhcnNlIGRhdGVzXHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgYy5maXJzdEFkdmVydGlzZWQgPSBuZXcgRGF0ZShjLmZpcnN0QWR2ZXJ0aXNlZCk7XHJcbiAgICAgIGMubGFzdEFkdmVydGlzZWQgPSBuZXcgRGF0ZShjLmxhc3RBZHZlcnRpc2VkKTtcclxuICAgICAgaWYgKGMudG9wNSkge1xyXG4gICAgICAgIGMudG9wNS5mb3JFYWNoKGFkID0+IHtcclxuICAgICAgICAgIC8vIENoZWNrIGlmIGRhdGUgc3RyaW5ncyBvciBvYmplY3RzXHJcbiAgICAgICAgICBhZC5zdGFydGluZ0RhdGUgPSBuZXcgRGF0ZShhZC5zdGFydGluZ0RhdGUpO1xyXG4gICAgICAgICAgYWQuZW5kRGF0ZSA9IG5ldyBEYXRlKGFkLmVuZERhdGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJbml0aWFsIFNvcnRcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5zb3J0KChhLCBiKSA9PiBuZXcgRGF0ZShiLmZpcnN0QWR2ZXJ0aXNlZCkgLSBuZXcgRGF0ZShhLmZpcnN0QWR2ZXJ0aXNlZCkpO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1N0YXR1c1RleHQnKS50ZXh0Q29udGVudCA9XHJcbiAgICAgIGBMb2FkZWQgJHtzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RofSBjYW1wYWlnbnNgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3Bpbm5lcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgdXBkYXRlVmlldygpO1xyXG4gICAgc2hvd092ZXJsYXkoKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBBSSBMb2dpYyAoQ1NQIEZpeGVkKSAtLS1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gYW5hbHl6ZVdpdGhBSSgpIHtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuICAgIGNvbnN0IHJlc3VsdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FJUmVzdWx0Jyk7XHJcblxyXG4gICAgaWYgKCFzdGF0ZS5haUNvbmZpZyB8fCAhc3RhdGUuYWlDb25maWcuYXBpS2V5KSB7XHJcbiAgICAgIGFsZXJ0KCdBSSBDb25maWd1cmF0aW9uIG1pc3NpbmcuIFBsZWFzZSBjaGVjayBkYXRhYmFzZSBzZXR0aW5ncy4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXppbmcuLi4nO1xyXG4gICAgcmVzdWx0RGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgLy8gQ29sbGVjdCBhbGwgYWQgdGV4dHNcclxuICAgIGxldCBhbGxBZFRleHRzID0gW107XHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgaWYgKGMudG9wNSkge1xyXG4gICAgICAgIGMudG9wNS5mb3JFYWNoKGFkID0+IHtcclxuICAgICAgICAgIGlmIChhZC5hZFRleHQgJiYgYWQuYWRUZXh0Lmxlbmd0aCA+IDEwKSB7XHJcbiAgICAgICAgICAgIGFsbEFkVGV4dHMucHVzaChhZC5hZFRleHQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBhbmQgbGltaXRcclxuICAgIGFsbEFkVGV4dHMgPSBbLi4ubmV3IFNldChhbGxBZFRleHRzKV0uc2xpY2UoMCwgNTApO1xyXG5cclxuICAgIGlmIChhbGxBZFRleHRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBhbGVydCgnTm8gYWQgdGV4dCBjb250ZW50IGZvdW5kIHRvIGFuYWx5emUuJyk7XHJcbiAgICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXplIHdpdGggQUknO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gc3RhdGUuYWlDb25maWcuc3lzdGVtUHJvbXB0IHx8IFwiWW91IGFyZSBhbiBleHBlcnQgbWFya2V0aW5nIGFuYWx5c3QuIEFuYWx5emUgdGhlc2UgRmFjZWJvb2sgYWQgY29waWVzIGFuZCBpZGVudGlmeSBjb21tb24gaG9va3MsIHBhaW4gcG9pbnRzIGFkZHJlc3NlZCwgYW5kIENUQXMgdXNlZC4gUHJvdmlkZSBhIGNvbmNpc2UgYnVsbGV0ZWQgc3VtbWFyeSBvZiB0aGUgc3RyYXRlZ3kuXCI7XHJcbiAgICBjb25zdCB1c2VyQ29udGVudCA9IFwiQW5hbHl6ZSB0aGUgZm9sbG93aW5nIGFkIGNvcGllczpcXG5cXG5cIiArIGFsbEFkVGV4dHMuam9pbihcIlxcblxcbi0tLVxcblxcblwiKTtcclxuXHJcbiAgICAvLyBEZWZpbmUgcmVzcG9uc2UgaGFuZGxlclxyXG4gICAgY29uc3QgaGFuZGxlUmVzcG9uc2UgPSAoZSkgPT4ge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGUuZGV0YWlsO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmYkFkc0FuYWx5emVSZXNwb25zZScsIGhhbmRsZVJlc3BvbnNlKTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgLy8gTWFya2Rvd24gY29udmVyc2lvbiBzaW1wbGUgcmVwbGFjZW1lbnQgZm9yIGJvbGQvbmV3bGluZXMgaWYgbmVlZGVkLCBcclxuICAgICAgICAvLyBidXQgaW5uZXJIVE1MIHByZXNlcnZlcyBiYXNpYyBmb3JtYXR0aW5nIG1vc3RseS5cclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSByZXNwb25zZS5hbmFseXNpcy5yZXBsYWNlKC9cXG4vZywgJzxicj4nKS5yZXBsYWNlKC9cXCpcXCooLio/KVxcKlxcKi9nLCAnPHN0cm9uZz4kMTwvc3Ryb25nPicpO1xyXG4gICAgICAgIHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgPSBmb3JtYXR0ZWQ7IC8vIFNhdmUgc3RhdGVcclxuICAgICAgICByZXN1bHREaXYuaW5uZXJIVE1MID0gYDwgc3Ryb25nID7wn6SWIEFJIEFuYWx5c2lzOjwvc3Ryb25nID4gPGJyPjxicj4ke2Zvcm1hdHRlZH1gO1xyXG4gICAgICAgIHJlc3VsdERpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBlcnJvck1zZyA9IHJlc3BvbnNlID8gKHJlc3BvbnNlLmVycm9yIHx8ICdVbmtub3duIGVycm9yJykgOiAnVW5rbm93biBlcnJvcic7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignQUkgQW5hbHlzaXMgZmFpbGVkOicsIGVycm9yTXNnKTtcclxuICAgICAgICBhbGVydCgnQW5hbHlzaXMgZmFpbGVkOiAnICsgZXJyb3JNc2cpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBidG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ/CfpJYgQW5hbHl6ZSB3aXRoIEFJJztcclxuICAgIH07XHJcblxyXG4gICAgLy8gTGlzdGVuIGZvciByZXNwb25zZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcblxyXG4gICAgLy8gRGlzcGF0Y2ggcmVxdWVzdCB0byBjb250ZW50IHNjcmlwdCAtPiBiYWNrZ3JvdW5kXHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBEaXNwYXRjaGluZyBBSSBhbmFseXNpcyByZXF1ZXN0Jyk7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZmJBZHNBbmFseXplUmVxdWVzdCcsIHtcclxuICAgICAgZGV0YWlsOiB7XHJcbiAgICAgICAgYXBpS2V5OiBzdGF0ZS5haUNvbmZpZy5hcGlLZXksXHJcbiAgICAgICAgc3lzdGVtUHJvbXB0OiBzeXN0ZW1Qcm9tcHQsXHJcbiAgICAgICAgdXNlckNvbnRlbnQ6IHVzZXJDb250ZW50XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICAvLyBGYWxsYmFjay9UaW1lb3V0IGNsZWFudXBcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAoYnRuLmRpc2FibGVkICYmIGJ0bi50ZXh0Q29udGVudCA9PT0gJ/CfpJYgQW5hbHl6aW5nLi4uJykge1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZiQWRzQW5hbHl6ZVJlc3BvbnNlJywgaGFuZGxlUmVzcG9uc2UpO1xyXG4gICAgICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGJ0bi50ZXh0Q29udGVudCA9ICfwn6SWIEFuYWx5emUgd2l0aCBBSSc7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIEFJIHJlcXVlc3QgdGltZWQgb3V0Jyk7XHJcbiAgICAgIH1cclxuICAgIH0sIDYwMDAwKTtcclxuICB9XHJcblxyXG5cclxuICAvLyAtLS0gRXZlbnQgQnJpZGdlIC0tLVxyXG5cclxuICAvLyBMaXN0ZW4gZm9yIGltcG9ydGVkIGRhdGEgdmlhIEN1c3RvbUV2ZW50IChmcm9tIGluamVjdGVkLmpzKVxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzSW1wb3J0RGF0YScsIChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUmVjZWl2ZWQgaW1wb3J0ZWQgZGF0YSB2aWEgQ3VzdG9tRXZlbnQnKTtcclxuICAgIGxvYWRJbXBvcnRlZERhdGEoZXZlbnQuZGV0YWlsKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciByZW9wZW4gcmVxdWVzdFxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzUmVvcGVuJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUmVvcGVuaW5nIG92ZXJsYXknKTtcclxuICAgIHNob3dPdmVybGF5KCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgQUkgQ29uZmlnXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNDb25maWcnLCAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIFJlY2VpdmVkIEFJIENvbmZpZycpO1xyXG4gICAgc3RhdGUuYWlDb25maWcgPSBldmVudC5kZXRhaWw7XHJcbiAgICB1cGRhdGVWaWV3KCk7IC8vIFJlLXJlbmRlciB0byBzaG93IEFJIGJ1dHRvbiBpZiBuZWVkZWRcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciBTY3JhcGluZyBTdGF0dXNcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc1N0YXR1cycsIChldmVudCkgPT4ge1xyXG4gICAgY29uc3QgeyBzY3JvbGxpbmcsIGFkc0ZvdW5kLCBtZXNzYWdlIH0gPSBldmVudC5kZXRhaWw7XHJcblxyXG4gICAgLy8gRW5zdXJlIG92ZXJsYXkgaXMgdmlzaWJsZSBidXQgbWluaW1pemVkXHJcbiAgICBpZiAoc2Nyb2xsaW5nKSB7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnbWluaW1pemVkJyk7XHJcbiAgICAgIHN0YXRlLmlzTWluaW1pemVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtaW5CYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZWRCYXInKTtcclxuICAgIGNvbnN0IGljb24gPSBtaW5CYXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy1taW5pLWljb24nKTtcclxuICAgIGNvbnN0IHRleHQgPSBtaW5CYXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy1taW5pLXRleHQnKTtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01heGltaXplQnRuJyk7XHJcblxyXG4gICAgaWYgKHNjcm9sbGluZykge1xyXG4gICAgICBpY29uLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cImZiLWFkcy1taW5pLXNwaW5uZXJcIj7wn5SEPC9zcGFuPic7XHJcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgICBtaW5CYXIuc3R5bGUuYmFja2dyb3VuZCA9ICdsaW5lYXItZ3JhZGllbnQodG8gcmlnaHQsICNmNTllMGIsICNkOTc3MDYpJzsgLy8gQW1iZXIgZm9yIGFjdGl2ZVxyXG4gICAgICBidG4uc3R5bGUuZGlzcGxheSA9ICdub25lJzsgLy8gSGlkZSBcIlNob3dcIiBidXR0b24gd2hpbGUgc2NyYXBpbmdcclxuXHJcbiAgICAgIC8vIEFkZCBzcGlubmVyIHN0eWxlIGlmIG5vdCBleGlzdHNcclxuICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJykpIHtcclxuICAgICAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgc3R5bGUuaWQgPSAnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJztcclxuICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcclxuICAgICAgQGtleWZyYW1lcyBmYkFkc1NwaW4gezEwMCAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfX1cclxuICAgICAgLmZiLWFkcy1taW5pLXNwaW5uZXIge2Rpc3BsYXk6IGlubGluZS1ibG9jazsgYW5pbWF0aW9uOiBmYkFkc1NwaW4gMXMgbGluZWFyIGluZmluaXRlOyB9XHJcbiAgICAgIGA7XHJcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERvbmVcclxuICAgICAgaWNvbi5pbm5lckhUTUwgPSBgPGltZyBzcmM9XCIke2xvZ29Vcmx9XCIgc3R5bGU9XCJ3aWR0aDogMjRweDsgaGVpZ2h0OiAyNHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IG9iamVjdC1maXQ6IGNvdmVyO1wiPmA7XHJcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSAnQW5hbHlzaXMgUmVhZHkhJztcclxuICAgICAgbWluQmFyLnN0eWxlLmJhY2tncm91bmQgPSAnJzsgLy8gUmV2ZXJ0IHRvIGRlZmF1bHQgYmx1ZS9wdXJwbGVcclxuICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBFeHBvc2UgcmVvcGVuIGhlbHBlclxyXG4gIHdpbmRvdy5mYkFkc1Jlb3Blbk92ZXJsYXkgPSBzaG93T3ZlcmxheTtcclxuXHJcbiAgLy8gQ2hlY2sgZm9yIHByZS1pbmplY3RlZCBkYXRhIChmcm9tIGZpbGUgaW1wb3J0KVxyXG4gIGNvbnN0IHByZUluamVjdGVkRGF0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydGVkRGF0YScpO1xyXG4gIGlmIChwcmVJbmplY3RlZERhdGEpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHByZUluamVjdGVkRGF0YS50ZXh0Q29udGVudCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIEZvdW5kIHByZS1pbmplY3RlZCBkYXRhLCBsb2FkaW5nLi4uJyk7XHJcbiAgICAgIGxvYWRJbXBvcnRlZERhdGEoanNvbik7XHJcbiAgICAgIC8vIENsZWFuIHVwXHJcbiAgICAgIHByZUluamVjdGVkRGF0YS5yZW1vdmUoKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0ZCIEFkcyBWaXN1YWxpemVyXSBFcnJvciBsb2FkaW5nIHByZS1pbmplY3RlZCBkYXRhOicsIGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0pKCk7Il0sIm5hbWVzIjpbIl9hIl0sIm1hcHBpbmdzIjoiQ0FFQyxXQUFZO0FBRmI7QUFHRSxVQUFRLElBQUksNENBQTRDO0FBR3hELFFBQU0sUUFBUTtBQUFBLElBQ1osY0FBYyxDQUFBO0FBQUEsSUFFZCxRQUFRLENBQUE7QUFBQSxJQUVSLFlBQVk7QUFBQTtBQUFBLElBQ1osZUFBZTtBQUFBLElBQ2YsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBO0FBQUEsSUFLYixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixlQUFlO0FBQUE7QUFBQSxJQUNmLFlBQVk7QUFBQSxFQUNoQjtBQUdFLFdBQVMsZ0JBQWdCLE9BQU87QUFDOUIsUUFBSSxTQUFTLElBQUssUUFBTztBQUN6QixRQUFJLFNBQVMsR0FBSSxRQUFPO0FBQ3hCLFFBQUksU0FBUyxHQUFJLFFBQU87QUFDeEIsUUFBSSxTQUFTLEdBQUksUUFBTztBQUN4QixRQUFJLFNBQVMsRUFBRyxRQUFPO0FBQ3ZCLFdBQU87QUFBQSxFQUNUO0FBR0EsUUFBTSxXQUFXLFNBQVMsZUFBZSxhQUFhO0FBQ3RELFFBQU0sWUFBVSwwQ0FBVSxZQUFWLG1CQUFtQixZQUFXO0FBRzlDLFFBQU0sVUFBVSxTQUFTLGNBQWMs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

(function() {
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
  const overlay = document.createElement("div");
  overlay.id = "fbAdsAnalyzerOverlay";
  overlay.className = "hidden minimized";
  overlay.innerHTML = `
      <div class="fb-ads-minimized-bar" id="fbAdsMinimizedBar">
        <div class="fb-ads-mini-content">
          <div class="fb-ads-mini-icon">🎯</div>
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
              <div style="font-size: 24px;">🎯</div>
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
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsDownloadBtn" style="background: #8b5cf6;">💾 Download Data</button>
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsImportBtn" style="background: #eab308; color: black;">📂 Import Data</button>
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
    var _a, _b;
    const chartContent = document.getElementById("fbAdsChartContent");
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
        <div class="fb-ads-text-campaign" style="border-left: 4px solid ${color};">
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
      <div class="fb-ads-text-actions" style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
        ${state.aiConfig ? `
        <button id="fbAdsAnalyzeBtn" class="fb-ads-btn fb-ads-btn-action" style="background: linear-gradient(to right, #10b981, #059669);">
          🤖 Analyze with AI
        </button>` : ""}
        <button id="fbAdsCopyAllTextBtn" class="fb-ads-btn fb-ads-btn-action">
          📋 Copy All Text
        </button>
      </div>
       <div id="fbAdsAIResult" style="display: none; margin-bottom: 20px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; white-space: pre-wrap;"></div>
      <div class="fb-ads-text-output">${output}</div>
    `;
    const resultDiv = document.getElementById("fbAdsAIResult");
    if (state.aiAnalysisResult) {
      resultDiv.innerHTML = `<strong>🤖 AI Analysis:</strong><br><br>${state.aiAnalysisResult}`;
      resultDiv.style.display = "block";
    }
    if (state.aiConfig) {
      (_a = document.getElementById("fbAdsAnalyzeBtn")) == null ? void 0 : _a.addEventListener("click", analyzeWithAI);
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
          <div class="fb-ads-card">
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
    showModal(content, `${campaign.url}`, `${campaign.adsCount} total ads • ${campaign.campaignDurationDays} days active`);
  }
  function downloadData() {
    var _a;
    const advertiser = (((_a = state.metadata) == null ? void 0 : _a.advertiserName) || "fb_ads_analysis").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const count = state.rawCampaigns.length;
    let minDate = /* @__PURE__ */ new Date();
    let maxDate = /* @__PURE__ */ new Date(0);
    state.rawCampaigns.forEach((c) => {
      if (c.firstAdvertised < minDate) minDate = c.firstAdvertised;
      if (c.lastAdvertised > maxDate) maxDate = c.lastAdvertised;
    });
    const formatDate = (d) => {
      const m = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      return `${m[d.getMonth()]}-${d.getDate()}-${d.getFullYear()}`;
    };
    const startStr = formatDate(minDate);
    const endStr = formatDate(maxDate);
    const filename = `${advertiser}-fb-ads-${count}-campaigns-from-${startStr}-to-${endStr}.json`;
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
        resultDiv.innerHTML = `<strong>🤖 AI Analysis:</strong><br><br>${formatted}`;
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
                @keyframes fbAdsSpin { 100% { transform: rotate(360deg); } }
                .fb-ads-mini-spinner { display: inline-block; animation: fbAdsSpin 1s linear infinite; }
            `;
        document.head.appendChild(style);
      }
    } else {
      icon.innerHTML = "🎯";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXplci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Zpc3VhbGl6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogRmFjZWJvb2sgQWRzIEFuYWx5emVyIC0gVmlzdWFsaXplciBTY3JpcHQgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgY29uc29sZS5sb2coJ1tGQiBBZHMgQW5hbHl6ZXJdIFZpc3VhbGl6ZXIgc2NyaXB0IGxvYWRlZCcpO1xyXG5cclxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50XHJcbiAgY29uc3Qgc3RhdGUgPSB7XHJcbiAgICByYXdDYW1wYWlnbnM6IFtdLFxyXG4gICAgcHJvY2Vzc2VkQ2FtcGFpZ25zOiBbXSxcclxuICAgIGFsbEFkczogW10sXHJcbiAgICBmaWx0ZXJEb21haW46ICdhbGwnLFxyXG4gICAgZmlsdGVyU29ydDogJ3JlY2VudCcsIC8vICdyZWNlbnQnLCAnZHVyYXRpb24nLCAnYWRzJ1xyXG4gICAgZ3JvdXBCeURvbWFpbjogZmFsc2UsXHJcbiAgICBpc01pbmltaXplZDogdHJ1ZSxcclxuICAgIGN1cnJlbnRWaWV3OiAndGltZWxpbmUnLCAvLyAndGltZWxpbmUnLCAndG9wNS10ZXh0JywgJ2FsbC1jb3B5J1xyXG4gICAgaXNBbmFseXppbmc6IGZhbHNlLFxyXG4gICAgaXNBbmFseXppbmc6IGZhbHNlLFxyXG4gICAgYWlDb25maWc6IG51bGwsXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBhaUNvbmZpZzogbnVsbCxcclxuICAgIG1ldGFkYXRhOiBudWxsLFxyXG4gICAgc29ydERpcmVjdGlvbjogJ2FzYycsIC8vICdhc2MnIG9yICdkZXNjJ1xyXG4gICAgaXNJbXBvcnRlZDogZmFsc2VcclxuICB9O1xyXG5cclxuICAvLyBDb2xvciBIZWxwZXJcclxuICBmdW5jdGlvbiBnZXRBZENvdW50Q29sb3IoY291bnQpIHtcclxuICAgIGlmIChjb3VudCA+PSAxMDApIHJldHVybiAnI2VmNDQ0NCc7IC8vIFJlZFxyXG4gICAgaWYgKGNvdW50ID49IDUwKSByZXR1cm4gJyNmOTczMTYnOyAgLy8gT3JhbmdlXHJcbiAgICBpZiAoY291bnQgPj0gMjApIHJldHVybiAnI2VhYjMwOCc7ICAvLyBZZWxsb3dcclxuICAgIGlmIChjb3VudCA+PSAxMCkgcmV0dXJuICcjMjJjNTVlJzsgIC8vIEdyZWVuXHJcbiAgICBpZiAoY291bnQgPj0gNSkgcmV0dXJuICcjM2I4MmY2JzsgICAvLyBCbHVlXHJcbiAgICByZXR1cm4gJyM4YjVjZjYnOyAgICAgICAgICAgICAgICAgICAvLyBQdXJwbGVcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgZmxvYXRpbmcgb3ZlcmxheVxyXG4gIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBvdmVybGF5LmlkID0gJ2ZiQWRzQW5hbHl6ZXJPdmVybGF5JztcclxuICBvdmVybGF5LmNsYXNzTmFtZSA9ICdoaWRkZW4gbWluaW1pemVkJztcclxuICBvdmVybGF5LmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pbWl6ZWQtYmFyXCIgaWQ9XCJmYkFkc01pbmltaXplZEJhclwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS1jb250ZW50XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktaWNvblwiPvCfjq88L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS10ZXh0XCI+RmFjZWJvb2sgQWRzIENhbXBhaWduIEFuYWx5emVyPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pLWFjdGlvbnNcIj5cclxuICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLW1pbmktYnRuXCIgaWQ9XCJmYkFkc01heGltaXplQnRuXCI+U2hvdzwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1jb250YWluZXJcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFuYWx5emVyLXBhbmVsXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFuYWx5emVyLWhlYWRlclwiPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAxMHB4O1wiPlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6IDI0cHg7XCI+8J+OrzwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8aDE+RmFjZWJvb2sgQWRzIENhbXBhaWduIEFuYWx5emVyPC9oMT5cclxuICAgICAgICAgICAgICAgIDxwIGlkPVwiZmJBZHNTdWJ0aXRsZVwiPlRpbWVsaW5lICYgQ2FtcGFpZ24gQW5hbHlzaXM8L3A+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWhlYWRlci1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYnRuXCIgaWQ9XCJmYkFkc01pbmltaXplQnRuXCIgdGl0bGU9XCJNaW5pbWl6ZVwiPl88L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWhlYWRlci1idG5cIiBpZD1cImZiQWRzQ2xvc2VCdG5cIiB0aXRsZT1cIkNsb3NlXCI+w5c8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sc1wiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtcm93XCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IHdpZHRoOiAxMDAlOyBtYXJnaW4tYm90dG9tOiAxMnB4O1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDUwMDsgZm9udC1zaXplOiAxM3B4OyBjb2xvcjogIzM3NDE1MTtcIj5WaWV3Ojwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lIGFjdGl2ZVwiIGRhdGEtdmlldz1cInRpbWVsaW5lXCI+8J+TiiBUaW1lbGluZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXZpZXc9XCJ0b3A1LXRleHRcIj7wn4+GIFRvcCA1IFRleHQ8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXdlaWdodDogNTAwOyBmb250LXNpemU6IDEzcHg7IGNvbG9yOiAjMzc0MTUxO1wiPlNvcnQgYnk6PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmUgYWN0aXZlXCIgZGF0YS1zb3J0PVwicmVjZW50XCI+U3RhcnQgRGF0ZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXNvcnQ9XCJkdXJhdGlvblwiPkR1cmF0aW9uPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZVwiIGRhdGEtc29ydD1cImFkc1wiPiMgb2YgQWRzPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZVwiIGlkPVwiZmJBZHNHcm91cERvbWFpbkJ0blwiPkdyb3VwIGJ5IERvbWFpbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCIgaWQ9XCJmYkFkc0Rvd25sb2FkQnRuXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjOGI1Y2Y2O1wiPvCfkr4gRG93bmxvYWQgRGF0YTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCIgaWQ9XCJmYkFkc0ltcG9ydEJ0blwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2VhYjMwODsgY29sb3I6IGJsYWNrO1wiPvCfk4IgSW1wb3J0IERhdGE8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIiBpZD1cImZiQWRzSW1wb3J0SW5wdXRcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCIgYWNjZXB0PVwiLmpzb25cIj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZFwiIGlkPVwiZmJBZHNUaW1lbGluZUxlZ2VuZFwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgd2lkdGg6IDEwMCU7IGdhcDogMTZweDsgcGFkZGluZy10b3A6IDEycHg7IGJvcmRlci10b3A6IDFweCBzb2xpZCAjZTVlN2ViO1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjOGI1Y2Y2O1wiPjwvZGl2PiAxLTQgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICMzYjgyZjY7XCI+PC9kaXY+IDUtOSBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogIzIyYzU1ZTtcIj48L2Rpdj4gMTAtMTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICNlYWIzMDg7XCI+PC9kaXY+IDIwLTQ5IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZjk3MzE2O1wiPjwvZGl2PiA1MC05OSBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2VmNDQ0NDtcIj48L2Rpdj4gMTAwKyBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXN0YXR1cy1iYXJcIiBzdHlsZT1cImJvcmRlcjogbm9uZTsgcGFkZGluZy10b3A6IDA7IHBhZGRpbmctYm90dG9tOiAwO1wiPlxyXG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtc3Bpbm5lclwiIGlkPVwiZmJBZHNTcGlubmVyXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1zdGF0dXMtdGV4dFwiIGlkPVwiZmJBZHNTdGF0dXNUZXh0XCI+TG9hZGluZyBhbmFseXNpcyBkYXRhLi4uPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNoYXJ0LWNvbnRhaW5lclwiIGlkPVwiZmJBZHNDaGFydENvbnRlbnRcIj5cclxuICAgICAgICAgICAgIDwhLS0gRHluYW1pYyBDb250ZW50IC0tPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICBcclxuICAgICAgPCEtLSBNb2RhbCBDb250YWluZXIgLS0+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtb3ZlcmxheVwiIGlkPVwiZmJBZHNNb2RhbE92ZXJsYXlcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsLWhlYWRlclwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsLXRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgPGgyIGlkPVwiZmJBZHNNb2RhbFRpdGxlXCI+Q2FtcGFpZ24gRGV0YWlsczwvaDI+XHJcbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJmYi1hZHMtbW9kYWwtbWV0YVwiIGlkPVwiZmJBZHNNb2RhbE1ldGFcIj51cmwuLi48L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLW1vZGFsLWNsb3NlXCIgaWQ9XCJmYkFkc01vZGFsQ2xvc2VcIj7DlzwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsLWJvZHlcIiBpZD1cImZiQWRzTW9kYWxCb2R5XCI+XHJcbiAgICAgICAgICAgICA8IS0tIERldGFpbHMgLS0+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXkpO1xyXG5cclxuICAvLyBUb29sdGlwXHJcbiAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2ZiLWFkcy10b29sdGlwJztcclxuICBvdmVybGF5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xyXG5cclxuICAvLyAtLS0gRXZlbnQgTGlzdGVuZXJzIC0tLVxyXG5cclxuICAvLyBIZWFkZXIgQWN0aW9uc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0Nsb3NlQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlT3ZlcmxheSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWluaW1pemVCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNYXhpbWl6ZUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlTWluaW1pemUpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01pbmltaXplZEJhcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlTWluaW1pemUpO1xyXG5cclxuICAvLyBNb2RhbCBBY3Rpb25zXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxDbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZU1vZGFsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICBpZiAoZS50YXJnZXQuaWQgPT09ICdmYkFkc01vZGFsT3ZlcmxheScpIGhpZGVNb2RhbCgpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBNYWluIEFjdGlvbnNcclxuXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0Rvd25sb2FkQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkb3dubG9hZERhdGEpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydEJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzSW1wb3J0SW5wdXQnKS5jbGljaygpO1xyXG4gIH0pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydElucHV0JykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlRmlsZUltcG9ydCk7XHJcblxyXG5cclxuICAvLyBWaWV3IFN3aXRjaGVyXHJcbiAgY29uc3Qgdmlld0J1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS12aWV3XScpO1xyXG4gIHZpZXdCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIHZpZXdCdXR0b25zLmZvckVhY2goYiA9PiBiLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTtcclxuICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgIHN0YXRlLmN1cnJlbnRWaWV3ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXZpZXcnKTtcclxuXHJcbiAgICAgIGNvbnN0IGxlZ2VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1RpbWVsaW5lTGVnZW5kJyk7XHJcbiAgICAgIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RpbWVsaW5lJykge1xyXG4gICAgICAgIGxlZ2VuZC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZ2VuZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZVZpZXcoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBTb3J0IFN3aXRjaGVyXHJcbiAgY29uc3Qgc29ydEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zb3J0XScpO1xyXG5cclxuICAvLyBIZWxwZXIgdG8gdXBkYXRlIGJ1dHRvbiBsYWJlbHNcclxuICBjb25zdCB1cGRhdGVTb3J0QnV0dG9ucyA9ICgpID0+IHtcclxuICAgIHNvcnRCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgY29uc3Qgc29ydFR5cGUgPSBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLXNvcnQnKTtcclxuICAgICAgbGV0IGxhYmVsID0gYnRuLmlubmVyVGV4dC5yZXBsYWNlKC8gW+KGkeKGk10vLCAnJyk7IC8vIENsZWFuIGV4aXN0aW5nIGFycm93XHJcblxyXG4gICAgICBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gc29ydFR5cGUpIHtcclxuICAgICAgICBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgLy8gQWRkIGFycm93XHJcbiAgICAgICAgbGFiZWwgKz0gc3RhdGUuc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyAnIOKGkScgOiAnIOKGkyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xyXG4gICAgICB9XHJcbiAgICAgIGJ0bi5pbm5lclRleHQgPSBsYWJlbDtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHNvcnRCdXR0b25zLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRhcmdldFNvcnQgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29ydCcpO1xyXG5cclxuICAgICAgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09IHRhcmdldFNvcnQpIHtcclxuICAgICAgICAvLyBUb2dnbGUgZGlyZWN0aW9uXHJcbiAgICAgICAgc3RhdGUuc29ydERpcmVjdGlvbiA9IHN0YXRlLnNvcnREaXJlY3Rpb24gPT09ICdhc2MnID8gJ2Rlc2MnIDogJ2FzYyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gTmV3IHNvcnQ6IERlZmF1bHQgdG8gJ2Rlc2MnIGZvciBldmVyeXRoaW5nPyBcclxuICAgICAgICAvLyBVc3VhbGx5ICdTdGFydCBEYXRlJyB1c2VycyBtaWdodCB3YW50IE9sZGVzdCBGaXJzdCAoQXNjKSBvciBOZXdlc3QgRmlyc3QgKERlc2MpLlxyXG4gICAgICAgIC8vIExldCdzIGRlZmF1bHQgdG8gJ2Rlc2MnIChIaWdoL05ld2VzdCkgYXMgc3RhbmRhcmQsIGJ1dCBtYXliZSAnYXNjJyBmb3IgRGF0ZT9cclxuICAgICAgICAvLyBUaGUgb3JpZ2luYWwgY29kZSBoYWQgZGVmYXVsdCBEYXRlIGFzIEFzYyAoT2xkZXN0IGZpcnN0KS5cclxuICAgICAgICBpZiAodGFyZ2V0U29ydCA9PT0gJ3JlY2VudCcpIHtcclxuICAgICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSAnYXNjJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhdGUuc29ydERpcmVjdGlvbiA9ICdkZXNjJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUuZmlsdGVyU29ydCA9IHRhcmdldFNvcnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHVwZGF0ZVNvcnRCdXR0b25zKCk7XHJcbiAgICAgIHVwZGF0ZVZpZXcoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbml0IGJ1dHRvbiBsYWJlbHNcclxuICB1cGRhdGVTb3J0QnV0dG9ucygpO1xyXG5cclxuICAvLyBHcm91cCBieSBEb21haW5cclxuICBjb25zdCBncm91cEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0dyb3VwRG9tYWluQnRuJyk7XHJcbiAgZ3JvdXBCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzdGF0ZS5ncm91cEJ5RG9tYWluID0gIXN0YXRlLmdyb3VwQnlEb21haW47XHJcbiAgICBncm91cEJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcclxuICAgIHVwZGF0ZVZpZXcoKTtcclxuICB9KTtcclxuXHJcblxyXG4gIC8vIC0tLSBGdW5jdGlvbnMgLS0tXHJcblxyXG4gIGZ1bmN0aW9uIHNob3dPdmVybGF5KCkge1xyXG4gICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnbWluaW1pemVkJyk7XHJcbiAgICBzdGF0ZS5pc01pbmltaXplZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGlkZU92ZXJsYXkoKSB7XHJcbiAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdG9nZ2xlTWluaW1pemUoZSkge1xyXG4gICAgaWYgKGUpIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBzdGF0ZS5pc01pbmltaXplZCA9ICFzdGF0ZS5pc01pbmltaXplZDtcclxuICAgIGlmIChzdGF0ZS5pc01pbmltaXplZCkge1xyXG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21pbmltaXplZCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdtaW5pbWl6ZWQnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3dNb2RhbChjb250ZW50SHRtbCwgdGl0bGUsIG1ldGEpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsVGl0bGUnKS5pbm5lclRleHQgPSB0aXRsZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsTWV0YScpLmlubmVyVGV4dCA9IG1ldGE7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbEJvZHknKS5pbm5lckhUTUwgPSBjb250ZW50SHRtbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsT3ZlcmxheScpLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICBzZXR1cENvcHlCdXR0b25zKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsQm9keScpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhpZGVNb2RhbCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsT3ZlcmxheScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb3B5UmljaFRleHQocGxhaW4sIGh0bWwpIHtcclxuICAgIGlmICh0eXBlb2YgQ2xpcGJvYXJkSXRlbSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICBjb25zdCB0ZXh0QmxvYiA9IG5ldyBCbG9iKFtwbGFpbl0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluXCIgfSk7XHJcbiAgICAgIGNvbnN0IGh0bWxCbG9iID0gbmV3IEJsb2IoW2h0bWxdLCB7IHR5cGU6IFwidGV4dC9odG1sXCIgfSk7XHJcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoW1xyXG4gICAgICAgIG5ldyBDbGlwYm9hcmRJdGVtKHtcclxuICAgICAgICAgIFwidGV4dC9wbGFpblwiOiB0ZXh0QmxvYixcclxuICAgICAgICAgIFwidGV4dC9odG1sXCI6IGh0bWxCbG9iXHJcbiAgICAgICAgfSlcclxuICAgICAgXSkuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiUmljaCBjb3B5IGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIHBsYWluOlwiLCBlcnIpO1xyXG4gICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHBsYWluKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwbGFpbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXR1cENvcHlCdXR0b25zKGNvbnRhaW5lcikge1xyXG4gICAgY29uc3QgY29weUJ0bnMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmZiLWFkcy1jb3B5LWJ0bicpO1xyXG4gICAgY29weUJ0bnMuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldDsgLy8gVXNlIGN1cnJlbnRUYXJnZXQgdG8gZW5zdXJlIHdlIGdldCB0aGUgYnV0dG9uLCBub3QgaWNvblxyXG4gICAgICAgIGNvbnN0IHJhd1RleHQgPSBkZWNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQuY29weVRleHQpO1xyXG5cclxuICAgICAgICAvLyBFeHRyYWN0IG1ldGFkYXRhIGlmIGF2YWlsYWJsZVxyXG4gICAgICAgIGNvbnN0IG1ldGEgPSB7XHJcbiAgICAgICAgICB1cmw6IHRhcmdldC5kYXRhc2V0LnVybCA/IGRlY29kZVVSSUNvbXBvbmVudCh0YXJnZXQuZGF0YXNldC51cmwpIDogJycsXHJcbiAgICAgICAgICBjYW1wYWlnbkR1cmF0aW9uOiB0YXJnZXQuZGF0YXNldC5jYW1wYWlnbkR1cmF0aW9uIHx8ICcnLFxyXG4gICAgICAgICAgY2FtcGFpZ25BZHM6IHRhcmdldC5kYXRhc2V0LmNhbXBhaWduQWRzIHx8ICcnLFxyXG4gICAgICAgICAgbGliSWQ6IHRhcmdldC5kYXRhc2V0LmFkTGliSWQgfHwgJycsXHJcbiAgICAgICAgICBhZER1cmF0aW9uOiB0YXJnZXQuZGF0YXNldC5hZER1cmF0aW9uIHx8ICcnLFxyXG4gICAgICAgICAgYWREYXRlczogdGFyZ2V0LmRhdGFzZXQuYWREYXRlcyB8fCAnJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENvbnN0cnVjdCBSaWNoIFRleHQgSFRNTFxyXG4gICAgICAgIGNvbnN0IHJpY2hUZXh0ID0gYFxyXG4gICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE0cHg7IGxpbmUtaGVpZ2h0OiAxLjU7IGNvbG9yOiAjMzc0MTUxO1wiPlxyXG4gICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+Q2FtcGFpZ246PC9zdHJvbmc+IDxhIGhyZWY9XCIke21ldGEudXJsfVwiPiR7bWV0YS51cmx9PC9hPjxicj5cclxuICAgICAgICAgICAgICAgICAgICAke21ldGEuY2FtcGFpZ25EdXJhdGlvbiA/IGA8c3Ryb25nPkR1cmF0aW9uOjwvc3Ryb25nPiAke21ldGEuY2FtcGFpZ25EdXJhdGlvbn0gZGF5c2AgOiAnJ30gXHJcbiAgICAgICAgICAgICAgICAgICAgJHttZXRhLmNhbXBhaWduQWRzID8gYOKAoiAke21ldGEuY2FtcGFpZ25BZHN9IGFkc2AgOiAnJ31cclxuICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxMnB4OyBwYWRkaW5nLWJvdHRvbTogMTJweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlNWU3ZWI7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5MaWJyYXJ5IElEOjwvc3Ryb25nPiA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2Fkcy9saWJyYXJ5Lz9pZD0ke21ldGEubGliSWR9XCI+JHttZXRhLmxpYklkfTwvYT48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5EYXRlczo8L3N0cm9uZz4gJHttZXRhLmFkRGF0ZXN9IHwgPHN0cm9uZz5BZCBEdXJhdGlvbjo8L3N0cm9uZz4gJHttZXRhLmFkRHVyYXRpb259IGRheXNcclxuICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAke3Jhd1RleHQucmVwbGFjZSgvXFxuL2csICc8YnI+Jyl9XHJcbiAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICAvLyBDb25zdHJ1Y3QgUGxhaW4gVGV4dCBGYWxsYmFja1xyXG4gICAgICAgIGNvbnN0IHBsYWluVGV4dCA9IGBDYW1wYWlnbjogJHttZXRhLnVybH1cXG5EdXJhdGlvbjogJHttZXRhLmNhbXBhaWduRHVyYXRpb259IGRheXMg4oCiICR7bWV0YS5jYW1wYWlnbkFkc30gYWRzXFxuXFxuTGlicmFyeSBJRDogJHttZXRhLmxpYklkfVxcbkRhdGVzOiAke21ldGEuYWREYXRlc30gfCBBZCBEdXJhdGlvbjogJHttZXRhLmFkRHVyYXRpb259IGRheXNcXG5cXG4tLS1cXG5cXG4ke3Jhd1RleHR9YDtcclxuXHJcbiAgICAgICAgLy8gVXNlIHJpY2ggdGV4dCBjb3B5IGhlbHBlclxyXG4gICAgICAgIGNvcHlSaWNoVGV4dChwbGFpblRleHQsIHJpY2hUZXh0KTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSB0YXJnZXQuaW5uZXJIVE1MO1xyXG4gICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSAn4pyFIENvcGllZCEnO1xyXG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gb3JpZ2luYWw7XHJcbiAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnc3VjY2VzcycpO1xyXG4gICAgICAgIH0sIDIwMDApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlVmlldygpIHtcclxuICAgIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RpbWVsaW5lJykge1xyXG4gICAgICByZW5kZXJUaW1lbGluZSgpO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5jdXJyZW50VmlldyA9PT0gJ3RvcDUtdGV4dCcpIHtcclxuICAgICAgcmVuZGVyVG9wNVRleHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHByb2Nlc3NEYXRhKGNhbXBhaWducykge1xyXG4gICAgY29uc3Qgc29ydGVkID0gWy4uLmNhbXBhaWduc107XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBQcm9jZXNzaW5nIGRhdGEuIFNvcnQ6Jywgc3RhdGUuZmlsdGVyU29ydCwgJ0dyb3VwOicsIHN0YXRlLmdyb3VwQnlEb21haW4pO1xyXG5cclxuICAgIC8vIDEuIFNvcnRpbmcgTG9naWNcclxuICAgIC8vIDEuIFNvcnRpbmcgTG9naWNcclxuICAgIHNvcnRlZC5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgIGxldCB2YWxBLCB2YWxCO1xyXG5cclxuICAgICAgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09ICdhZHMnKSB7XHJcbiAgICAgICAgdmFsQSA9IE51bWJlcihhLmFkc0NvdW50KSB8fCAwO1xyXG4gICAgICAgIHZhbEIgPSBOdW1iZXIoYi5hZHNDb3VudCkgfHwgMDtcclxuICAgICAgfSBlbHNlIGlmIChzdGF0ZS5maWx0ZXJTb3J0ID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgdmFsQSA9IE51bWJlcihhLmNhbXBhaWduRHVyYXRpb25EYXlzKSB8fCAwO1xyXG4gICAgICAgIHZhbEIgPSBOdW1iZXIoYi5jYW1wYWlnbkR1cmF0aW9uRGF5cykgfHwgMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAncmVjZW50JyAvIFN0YXJ0IERhdGVcclxuICAgICAgICB2YWxBID0gbmV3IERhdGUoYS5maXJzdEFkdmVydGlzZWQpLmdldFRpbWUoKTtcclxuICAgICAgICB2YWxCID0gbmV3IERhdGUoYi5maXJzdEFkdmVydGlzZWQpLmdldFRpbWUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3RhbmRhcmQgQXNjZW5kaW5nOiB2YWxBIC0gdmFsQlxyXG4gICAgICBjb25zdCBjb21wYXJpc29uID0gdmFsQSAtIHZhbEI7XHJcblxyXG4gICAgICAvLyBBcHBseSBEaXJlY3Rpb25cclxuICAgICAgcmV0dXJuIHN0YXRlLnNvcnREaXJlY3Rpb24gPT09ICdhc2MnID8gY29tcGFyaXNvbiA6IC1jb21wYXJpc29uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gMi4gR3JvdXBpbmcgTG9naWMgKFNlY29uZGFyeSBTb3J0KVxyXG4gICAgaWYgKHN0YXRlLmdyb3VwQnlEb21haW4pIHtcclxuICAgICAgc29ydGVkLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICBjb25zdCBkQSA9IGdldERvbWFpbihhLnVybCk7XHJcbiAgICAgICAgY29uc3QgZEIgPSBnZXREb21haW4oYi51cmwpO1xyXG4gICAgICAgIGlmIChkQSA8IGRCKSByZXR1cm4gLTE7XHJcbiAgICAgICAgaWYgKGRBID4gZEIpIHJldHVybiAxO1xyXG4gICAgICAgIC8vIEtlZXAgcHJldmlvdXMgc29ydCBvcmRlciB3aXRoaW4gc2FtZSBkb21haW5cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNvcnRlZDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldERvbWFpbih1cmwpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBuZXcgVVJMKHVybCkuaG9zdG5hbWUucmVwbGFjZSgnd3d3LicsICcnKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gdXJsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyVGltZWxpbmUoKSB7XHJcbiAgICBjb25zdCBjaGFydENvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDaGFydENvbnRlbnQnKTtcclxuICAgIGNoYXJ0Q29udGVudC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICBjb25zdCBjYW1wYWlnbnNUb1JlbmRlciA9IHByb2Nlc3NEYXRhKHN0YXRlLnJhd0NhbXBhaWducyk7XHJcblxyXG4gICAgaWYgKGNhbXBhaWduc1RvUmVuZGVyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJmYi1hZHMtZW1wdHktc3RhdGVcIj5ObyBjYW1wYWlnbnMgbWF0Y2ggY3JpdGVyaWE8L2Rpdj4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3VidGl0bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNTdWJ0aXRsZScpO1xyXG4gICAgaWYgKHN0YXRlLnJhd0NhbXBhaWducy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGNvbnN0IGZpcnN0ID0gbmV3IERhdGUoc3RhdGUucmF3Q2FtcGFpZ25zW3N0YXRlLnJhd0NhbXBhaWducy5sZW5ndGggLSAxXS5maXJzdEFkdmVydGlzZWQpO1xyXG4gICAgICBjb25zdCBsYXN0ID0gbmV3IERhdGUoc3RhdGUucmF3Q2FtcGFpZ25zWzBdLmxhc3RBZHZlcnRpc2VkKTsgLy8gUm91Z2ggYXBwcm94IGRlcGVuZGluZyBvbiBzb3J0XHJcbiAgICAgIHN1YnRpdGxlLnRleHRDb250ZW50ID0gYCR7c3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aH0gY2FtcGFpZ25zIGFuYWx5emVkYDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIFRpbWVsaW5lIFJhbmdlXHJcbiAgICBsZXQgbWluRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBsZXQgbWF4RGF0ZSA9IG5ldyBEYXRlKDApO1xyXG5cclxuICAgIGNhbXBhaWduc1RvUmVuZGVyLmZvckVhY2goYyA9PiB7XHJcbiAgICAgIGlmIChjLmZpcnN0QWR2ZXJ0aXNlZCA8IG1pbkRhdGUpIG1pbkRhdGUgPSBjLmZpcnN0QWR2ZXJ0aXNlZDtcclxuICAgICAgaWYgKGMubGFzdEFkdmVydGlzZWQgPiBtYXhEYXRlKSBtYXhEYXRlID0gYy5sYXN0QWR2ZXJ0aXNlZDtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGRheU1zID0gODY0MDAwMDA7XHJcbiAgICAvLyBFbnN1cmUgYXQgbGVhc3QgMSBkYXkgcmFuZ2UgdG8gYXZvaWQgZGl2aXNpb24gYnkgemVyb1xyXG4gICAgbGV0IHJhbmdlTXMgPSBtYXhEYXRlIC0gbWluRGF0ZTtcclxuICAgIGlmIChyYW5nZU1zIDwgZGF5TXMpIHJhbmdlTXMgPSBkYXlNcztcclxuXHJcbiAgICAvLyBBZGQgcGFkZGluZyAobWF4IG9mIDUgZGF5cyBvciAxMCUgb2YgdG90YWwgcmFuZ2UpXHJcbiAgICBjb25zdCBwYWRkaW5nID0gTWF0aC5tYXgoZGF5TXMgKiA1LCByYW5nZU1zICogMC4xKTtcclxuXHJcbiAgICBjb25zdCByZW5kZXJNaW4gPSBuZXcgRGF0ZShtaW5EYXRlLmdldFRpbWUoKSAtIHBhZGRpbmcpO1xyXG4gICAgY29uc3QgcmVuZGVyTWF4ID0gbmV3IERhdGUobWF4RGF0ZS5nZXRUaW1lKCkgKyBwYWRkaW5nKTtcclxuICAgIGNvbnN0IHRvdGFsRHVyYXRpb24gPSByZW5kZXJNYXggLSByZW5kZXJNaW47XHJcblxyXG4gICAgLy8gSGVhZGVyXHJcbiAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGhlYWRlci5jbGFzc05hbWUgPSAnZmItYWRzLXRpbWVsaW5lLWhlYWRlcic7XHJcbiAgICBoZWFkZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10aW1lbGluZS1sYWJlbFwiPjxzdHJvbmc+Q2FtcGFpZ248L3N0cm9uZz48L2Rpdj5cclxuICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtZ3JpZFwiPjwvZGl2PlxyXG4gICAgYDtcclxuICAgIGNoYXJ0Q29udGVudC5hcHBlbmRDaGlsZChoZWFkZXIpO1xyXG5cclxuICAgIGNvbnN0IGdyaWQgPSBoZWFkZXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy10aW1lbGluZS1ncmlkJyk7XHJcblxyXG4gICAgLy8gQWRhcHRpdmUgTWFya2VycyBsb2dpY1xyXG4gICAgY29uc3QgaXNTaG9ydFJhbmdlID0gcmFuZ2VNcyA8IChkYXlNcyAqIDYwKTtcclxuXHJcbiAgICBpZiAoaXNTaG9ydFJhbmdlKSB7XHJcbiAgICAgIC8vIFdlZWtseSBtYXJrZXJzXHJcbiAgICAgIGxldCBkID0gbmV3IERhdGUocmVuZGVyTWluKTtcclxuICAgICAgd2hpbGUgKGQgPD0gcmVuZGVyTWF4KSB7XHJcbiAgICAgICAgY29uc3QgcG9zID0gKChkIC0gcmVuZGVyTWluKSAvIHRvdGFsRHVyYXRpb24pICogMTAwO1xyXG4gICAgICAgIGlmIChwb3MgPj0gMCAmJiBwb3MgPD0gMTAwKSB7XHJcbiAgICAgICAgICBjb25zdCBtYXJrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgIG1hcmtlci5jbGFzc05hbWUgPSAnZmItYWRzLW1vbnRoLW1hcmtlcic7XHJcbiAgICAgICAgICBtYXJrZXIuc3R5bGUubGVmdCA9IGAke3Bvc30lYDtcclxuICAgICAgICAgIG1hcmtlci5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImZiLWFkcy1tb250aC1sYWJlbFwiPiR7ZC50b0xvY2FsZVN0cmluZygnZGVmYXVsdCcsIHsgbW9udGg6ICdzaG9ydCcsIGRheTogJ251bWVyaWMnIH0pfTwvZGl2PmA7XHJcbiAgICAgICAgICBncmlkLmFwcGVuZENoaWxkKG1hcmtlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSArIDcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBNb250aGx5IG1hcmtlcnNcclxuICAgICAgbGV0IGQgPSBuZXcgRGF0ZShyZW5kZXJNaW4pO1xyXG4gICAgICBkLnNldERhdGUoMSk7XHJcbiAgICAgIHdoaWxlIChkIDw9IHJlbmRlck1heCkge1xyXG4gICAgICAgIGNvbnN0IHBvcyA9ICgoZCAtIHJlbmRlck1pbikgLyB0b3RhbER1cmF0aW9uKSAqIDEwMDtcclxuICAgICAgICBpZiAocG9zID49IDAgJiYgcG9zIDw9IDEwMCkge1xyXG4gICAgICAgICAgY29uc3QgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICBtYXJrZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1tb250aC1tYXJrZXInO1xyXG4gICAgICAgICAgbWFya2VyLnN0eWxlLmxlZnQgPSBgJHtwb3N9JWA7XHJcbiAgICAgICAgICBtYXJrZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9udGgtbGFiZWxcIj4ke2QudG9Mb2NhbGVTdHJpbmcoJ2RlZmF1bHQnLCB7IG1vbnRoOiAnc2hvcnQnLCB5ZWFyOiAnMi1kaWdpdCcgfSl9PC9kaXY+YDtcclxuICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobWFya2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZC5zZXRNb250aChkLmdldE1vbnRoKCkgKyAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbmRlciBSb3dzXHJcbiAgICBsZXQgbGFzdERvbWFpbiA9IG51bGw7XHJcblxyXG4gICAgY2FtcGFpZ25zVG9SZW5kZXIuZm9yRWFjaChjYW1wYWlnbiA9PiB7XHJcbiAgICAgIC8vIERvbWFpbiBIZWFkZXIgZm9yIEdyb3VwaW5nXHJcbiAgICAgIGNvbnN0IGRvbWFpbiA9IGdldERvbWFpbihjYW1wYWlnbi51cmwpO1xyXG4gICAgICBpZiAoc3RhdGUuZ3JvdXBCeURvbWFpbiAmJiBkb21haW4gIT09IGxhc3REb21haW4pIHtcclxuICAgICAgICBjb25zdCBncm91cEhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGdyb3VwSGVhZGVyLmNsYXNzTmFtZSA9ICdmYi1hZHMtZG9tYWluLWhlYWRlcic7XHJcbiAgICAgICAgZ3JvdXBIZWFkZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtZG9tYWluLW5hbWVcIj4ke2RvbWFpbn08L2Rpdj5gO1xyXG4gICAgICAgIGNoYXJ0Q29udGVudC5hcHBlbmRDaGlsZChncm91cEhlYWRlcik7XHJcbiAgICAgICAgbGFzdERvbWFpbiA9IGRvbWFpbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHJvdy5jbGFzc05hbWUgPSAnZmItYWRzLWNhbXBhaWduLXJvdyc7XHJcblxyXG4gICAgICBjb25zdCBsZWZ0ID0gKChjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQgLSByZW5kZXJNaW4pIC8gdG90YWxEdXJhdGlvbikgKiAxMDA7XHJcbiAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5tYXgoMC41LCAoKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkIC0gY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkKSAvIHRvdGFsRHVyYXRpb24pICogMTAwKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBnZXRBZENvdW50Q29sb3IoY2FtcGFpZ24uYWRzQ291bnQpO1xyXG5cclxuICAgICAgcm93LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24taW5mb1wiPlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi11cmxcIiB0aXRsZT1cIiR7Y2FtcGFpZ24udXJsfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7Y2FtcGFpZ24udXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwiY29sb3I6IGluaGVyaXQ7IHRleHQtZGVjb3JhdGlvbjogbm9uZTtcIj4ke2NhbXBhaWduLnVybH08L2E+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgbWFyZ2luLWxlZnQ6IDZweDtcIj5cclxuICAgICAgICAgICAgICAgICAgKDxhIGhyZWY9XCJodHRwczovL3dlYi5hcmNoaXZlLm9yZy93ZWIvKi8ke2NhbXBhaWduLnVybH0vKlwiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwiY29sb3I6ICM2YjcyODA7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1wiPkFyY2hpdmU8L2E+KVxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLW1ldGFcIj5cclxuICAgICAgICAgICAgICAgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyDigKIgJHtjYW1wYWlnbi5hZHNDb3VudH0gYWRzXHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi10aW1lbGluZVwiPlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10aW1lbGluZS1iZy1tYXJrZXJcIiBzdHlsZT1cImxlZnQ6ICR7bGVmdH0lOyB3aWR0aDogJHt3aWR0aH0lXCI+PC9kaXY+IFxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi1iYXJcIiBcclxuICAgICAgICAgICAgICAgICAgc3R5bGU9XCJsZWZ0OiAke2xlZnR9JTsgd2lkdGg6ICR7d2lkdGh9JTsgYmFja2dyb3VuZDogJHtjb2xvcn07IGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuMSk7XCI+XHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgYDtcclxuXHJcbiAgICAgIC8vIFRvb2x0aXAgbG9naWMgZm9yIHRoZSBiYXJcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgbmVlZCB0byBxdWVyeSB0aGUgbmV3bHkgYWRkZWQgcm93J3MgYmFyLiBcclxuICAgICAgICAvLyBTaW5jZSB3ZSBhcHBlbmRDaGlsZChyb3cpIGxhdGVyLCB3ZSBjYW4gYXR0YWNoIGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCAncm93JyBiZWZvcmUgYXBwZW5kaW5nP1xyXG4gICAgICAgIC8vIFdhaXQsIHRoZSByb3cgaXMgY3JlYXRlZCB2aWEgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgdGhlbiBhcHBlbmRlZC5cclxuICAgICAgICAvLyBTbyB3ZSBjYW4gZmluZCB0aGUgYmFyIGluc2lkZSAncm93JyBpbW1lZGlhdGVseS5cclxuICAgICAgICBjb25zdCBiYXIgPSByb3cucXVlcnlTZWxlY3RvcignLmZiLWFkcy1jYW1wYWlnbi1iYXInKTtcclxuICAgICAgICBpZiAoYmFyKSB7XHJcbiAgICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gbmV3IERhdGUoY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgY29uc3QgZW5kRGF0ZSA9IG5ldyBEYXRlKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIHRvb2x0aXAuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRvb2x0aXAtaGVhZGVyXCI+Q2FtcGFpZ24gRGV0YWlsczwvZGl2PlxyXG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRvb2x0aXAtZGF0ZXNcIj4ke3N0YXJ0RGF0ZX0g4oCUICR7ZW5kRGF0ZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJmYi1hZHMtdG9vbHRpcC1hY3Rpb25cIiBpZD1cImZiQWRzVG9vbHRpcFZpZXdCdG5cIj5DbGljayB0byBWaWV3IFRvcCA1IEFkczwvYT5cclxuICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICAgICAgICAvLyBBdHRhY2ggY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGxpbmsgaW5zaWRlIHRvb2x0aXBcclxuICAgICAgICAgICAgY29uc3Qgdmlld0J0biA9IHRvb2x0aXAucXVlcnlTZWxlY3RvcignI2ZiQWRzVG9vbHRpcFZpZXdCdG4nKTtcclxuICAgICAgICAgICAgaWYgKHZpZXdCdG4pIHtcclxuICAgICAgICAgICAgICB2aWV3QnRuLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIG9wZW5DYW1wYWlnbkRldGFpbHMoY2FtcGFpZ24pO1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBQb3NpdGlvbiB0b29sdGlwIG5lYXIgbW91c2UgYnV0IGVuc3VyZSBpdCBzdGF5cyB3aXRoaW4gdmlld3BvcnRcclxuICAgICAgICAgICAgLy8gQWRkIHNsaWdodCBvZmZzZXQgc28gaXQgZG9lc24ndCBmbGlja2VyXHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLmNsaWVudFggKyAxNTtcclxuICAgICAgICAgICAgY29uc3QgeSA9IGUuY2xpZW50WSArIDE1O1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSB5ICsgJ3B4JztcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIDApO1xyXG5cclxuICAgICAgcm93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICAvLyBEb24ndCBvcGVuIG1vZGFsIGlmIGNsaWNraW5nIGEgbGlua1xyXG4gICAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCdhJykpIHJldHVybjtcclxuICAgICAgICBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjaGFydENvbnRlbnQuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyVG9wNVRleHQoKSB7XHJcbiAgICBjb25zdCBjaGFydENvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDaGFydENvbnRlbnQnKTtcclxuICAgIGNvbnN0IHN1YnRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3VidGl0bGUnKTtcclxuICAgIHN1YnRpdGxlLnRleHRDb250ZW50ID0gYFRvcCA1IGFkcyBmb3IgJHtzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RofSBjYW1wYWlnbnNgO1xyXG5cclxuICAgIGlmICghc3RhdGUucmF3Q2FtcGFpZ25zIHx8IHN0YXRlLnJhd0NhbXBhaWducy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZmItYWRzLWVtcHR5LXN0YXRlXCI+Tm8gY2FtcGFpZ24gZGF0YSBhdmFpbGFibGU8L2Rpdj4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG91dHB1dCA9ICcnO1xyXG4gICAgY29uc3QgY2FtcGFpZ25zVG9SZW5kZXIgPSBwcm9jZXNzRGF0YShzdGF0ZS5yYXdDYW1wYWlnbnMpO1xyXG5cclxuICAgIGNhbXBhaWduc1RvUmVuZGVyLmZvckVhY2goY2FtcGFpZ24gPT4ge1xyXG4gICAgICBjb25zdCBmb3JtYXREYXRlID0gKGRhdGVTdHIpID0+IG5ldyBEYXRlKGRhdGVTdHIpLnRvRGF0ZVN0cmluZygpO1xyXG4gICAgICBjb25zdCBjb2xvciA9IGdldEFkQ291bnRDb2xvcihjYW1wYWlnbi5hZHNDb3VudCk7XHJcblxyXG4gICAgICBvdXRwdXQgKz0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1jYW1wYWlnblwiIHN0eWxlPVwiYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCAke2NvbG9yfTtcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPHN0cm9uZz4ke2NhbXBhaWduLnVybH08L3N0cm9uZz5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LW1ldGFcIj5cclxuICAgICAgICAgICAgJHtmb3JtYXREYXRlKGNhbXBhaWduLmZpcnN0QWR2ZXJ0aXNlZCl9IOKAlCAke2Zvcm1hdERhdGUoY2FtcGFpZ24ubGFzdEFkdmVydGlzZWQpfSB8IFxyXG4gICAgICAgICAgICAke2NhbXBhaWduLmNhbXBhaWduRHVyYXRpb25EYXlzfSBkYXlzIHwgXHJcbiAgICAgICAgICAgICR7Y2FtcGFpZ24uYWRzQ291bnR9IGFkc1xyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBcclxuICAgICAgICAgICR7Y2FtcGFpZ24udG9wNSAmJiBjYW1wYWlnbi50b3A1Lmxlbmd0aCA+IDAgPyBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZHNcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtbGFiZWxcIj5Ub3AgNSBBZHM8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWdyaWRcIj5cclxuICAgICAgICAgICAgICAke2NhbXBhaWduLnRvcDUubWFwKGFkID0+IGBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZFwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWQtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5MaWJyYXJ5IElEOjwvc3Ryb25nPiBcclxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2Fkcy9saWJyYXJ5Lz9pZD0ke2FkLmxpYnJhcnlJZH1cIiBcclxuICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImZiLWFkcy1saWJyYXJ5LWlkLWxpbmtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICR7YWQubGlicmFyeUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZC1tZXRhXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5EYXRlczo8L3N0cm9uZz4gJHtuZXcgRGF0ZShhZC5zdGFydGluZ0RhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygpfSDigJQgJHtuZXcgRGF0ZShhZC5lbmREYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoKX08YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5EdXJhdGlvbjo8L3N0cm9uZz4gJHthZC5kdXJhdGlvbn0gZGF5c1xyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkLWNvcHlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgJHthZC5tZWRpYVR5cGUgPT09ICd2aWRlbydcclxuICAgICAgICAgID8gYDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiA4cHg7XCI+PHZpZGVvIHNyYz1cIiR7YWQubWVkaWFTcmN9XCIgY29udHJvbHMgc3R5bGU9XCJtYXgtd2lkdGg6IDEwMCU7IGhlaWdodDogYXV0bzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvdmlkZW8+PC9kaXY+YFxyXG4gICAgICAgICAgOiAoYWQubWVkaWFUeXBlID09PSAnaW1hZ2UnID8gYDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiA4cHg7XCI+PGltZyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBoZWlnaHQ6IGF1dG87IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L2Rpdj5gIDogJycpXHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+QWQgQ29weTo8L3N0cm9uZz48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHthZC5hZFRleHQgfHwgJ1tubyBjb3B5XSd9XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYCA6ICc8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtbm8tYWRzXCI+Tm8gdG9wIGFkcyBkYXRhIGF2YWlsYWJsZTwvZGl2Pid9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWN0aW9uc1wiIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMjBweDsgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDsgZ2FwOiAxMHB4O1wiPlxyXG4gICAgICAgICR7c3RhdGUuYWlDb25maWcgPyBgXHJcbiAgICAgICAgPGJ1dHRvbiBpZD1cImZiQWRzQW5hbHl6ZUJ0blwiIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiIHN0eWxlPVwiYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0LCAjMTBiOTgxLCAjMDU5NjY5KTtcIj5cclxuICAgICAgICAgIPCfpJYgQW5hbHl6ZSB3aXRoIEFJXHJcbiAgICAgICAgPC9idXR0b24+YCA6ICcnfVxyXG4gICAgICAgIDxidXR0b24gaWQ9XCJmYkFkc0NvcHlBbGxUZXh0QnRuXCIgY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tYWN0aW9uXCI+XHJcbiAgICAgICAgICDwn5OLIENvcHkgQWxsIFRleHRcclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgICA8ZGl2IGlkPVwiZmJBZHNBSVJlc3VsdFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTsgbWFyZ2luLWJvdHRvbTogMjBweDsgcGFkZGluZzogMTZweDsgYmFja2dyb3VuZDogI2YwZmRmNDsgYm9yZGVyOiAxcHggc29saWQgI2JiZjdkMDsgYm9yZGVyLXJhZGl1czogOHB4OyBjb2xvcjogIzE2NjUzNDsgd2hpdGUtc3BhY2U6IHByZS13cmFwO1wiPjwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtb3V0cHV0XCI+JHtvdXRwdXR9PC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIFJlc3RvcmUgQUkgUmVzdWx0IGlmIGV4aXN0c1xyXG4gICAgY29uc3QgcmVzdWx0RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQUlSZXN1bHQnKTtcclxuICAgIGlmIChzdGF0ZS5haUFuYWx5c2lzUmVzdWx0KSB7XHJcbiAgICAgIHJlc3VsdERpdi5pbm5lckhUTUwgPSBgPHN0cm9uZz7wn6SWIEFJIEFuYWx5c2lzOjwvc3Ryb25nPjxicj48YnI+JHtzdGF0ZS5haUFuYWx5c2lzUmVzdWx0fWA7XHJcbiAgICAgIHJlc3VsdERpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3RhdGUuYWlDb25maWcpIHtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQW5hbHl6ZUJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFuYWx5emVXaXRoQUkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0NvcHlBbGxUZXh0QnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmItYWRzLXRleHQtb3V0cHV0Jyk7XHJcbiAgICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XHJcblxyXG4gICAgICAvLyAxLiBUZW1wb3JhcmlseSBoaWRlIG1lZGlhXHJcbiAgICAgIGNvbnN0IG1lZGlhID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZywgdmlkZW8nKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxEaXNwbGF5cyA9IFtdO1xyXG4gICAgICBtZWRpYS5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICBvcmlnaW5hbERpc3BsYXlzLnB1c2goZWwuc3R5bGUuZGlzcGxheSk7XHJcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyAyLiBTZWxlY3QgY29udGVudFxyXG4gICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGNvbnRhaW5lcik7XHJcbiAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcclxuXHJcbiAgICAgIC8vIDMuIENvcHlcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xyXG5cclxuICAgICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDb3B5QWxsVGV4dEJ0bicpO1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgICAgICBidG4udGV4dENvbnRlbnQgPSAn4pyFIENvcGllZCEnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgIH0sIDIwMDApO1xyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdDb3B5IGZhaWxlZDonLCBlcnIpO1xyXG4gICAgICAgIGFsZXJ0KCdDb3B5IGZhaWxlZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyA0LiBDbGVhbnVwXHJcbiAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgbWVkaWEuZm9yRWFjaCgoZWwsIGkpID0+IHtcclxuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gb3JpZ2luYWxEaXNwbGF5c1tpXTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9wZW5DYW1wYWlnbkRldGFpbHMoY2FtcGFpZ24pIHtcclxuICAgIGlmICghY2FtcGFpZ24udG9wNSB8fCBjYW1wYWlnbi50b3A1Lmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBjb250ZW50ID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtbGlzdFwiPmA7XHJcblxyXG4gICAgY2FtcGFpZ24udG9wNS5mb3JFYWNoKChhZCwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyKSA9PiBuZXcgRGF0ZShkYXRlU3RyKS50b0RhdGVTdHJpbmcoKTtcclxuICAgICAgY29udGVudCArPSBgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhcmRcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1yYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXJhbmstbnVtYmVyXCI+IyR7aW5kZXggKyAxfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1saWJyYXJ5LWlkLWxhYmVsXCI+TGlicmFyeSBJRDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2Fkcy9saWJyYXJ5Lz9pZD0ke2FkLmxpYnJhcnlJZH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImZiLWFkcy1saWJyYXJ5LWlkLWxpbmtcIj4ke2FkLmxpYnJhcnlJZH08L2E+XHJcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1kdXJhdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1kdXJhdGlvbi1sYWJlbFwiPkR1cmF0aW9uPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWR1cmF0aW9uLXZhbHVlXCI+JHthZC5kdXJhdGlvbn0gZGF5czwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1tZXRhXCI+JHtmb3JtYXREYXRlKGFkLnN0YXJ0aW5nRGF0ZSl9IC0gJHtmb3JtYXREYXRlKGFkLmVuZERhdGUpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5LXNlY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAke2FkLm1lZGlhVHlwZSA9PT0gJ3ZpZGVvJ1xyXG4gICAgICAgICAgPyBgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1pbWFnZVwiIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTJweDsgdGV4dC1hbGlnbjogY2VudGVyO1wiPjx2aWRlbyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBtYXgtaGVpZ2h0OiAzMDBweDsgYm9yZGVyLXJhZGl1czogNnB4OyBib3gtc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpO1wiPjwvdmlkZW8+PC9kaXY+YFxyXG4gICAgICAgICAgOiAoYWQubWVkaWFUeXBlID09PSAnaW1hZ2UnID8gYDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtaW1hZ2VcIiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDEycHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj48aW1nIHNyYz1cIiR7YWQubWVkaWFTcmN9XCIgc3R5bGU9XCJtYXgtd2lkdGg6IDEwMCU7IG1heC1oZWlnaHQ6IDMwMHB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGJveC1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSk7XCI+PC9kaXY+YCA6ICcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5LWxhYmVsXCI+QWQgQ29weTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWNvcHktYnRuXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jb3B5LXRleHQ9XCIke2VuY29kZVVSSUNvbXBvbmVudChhZC5hZFRleHQgfHwgJycpfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS11cmw9XCIke2VuY29kZVVSSUNvbXBvbmVudChjYW1wYWlnbi51cmwpfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jYW1wYWlnbi1kdXJhdGlvbj1cIiR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWNhbXBhaWduLWFkcz1cIiR7Y2FtcGFpZ24uYWRzQ291bnR9XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFkLWxpYi1pZD1cIiR7YWQubGlicmFyeUlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1kdXJhdGlvbj1cIiR7YWQuZHVyYXRpb259XCJcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFkLWRhdGVzPVwiJHtmb3JtYXREYXRlKGFkLnN0YXJ0aW5nRGF0ZSl9IOKAlCAke2Zvcm1hdERhdGUoYWQuZW5kRGF0ZSl9XCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIPCfk4sgQ29weVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1jb3B5XCI+JHthZC5hZFRleHQgfHwgJ1tObyBjb3B5IGF2YWlsYWJsZV0nfTwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICBgO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29udGVudCArPSBgPC9kaXY+YDtcclxuICAgIHNob3dNb2RhbChjb250ZW50LCBgJHtjYW1wYWlnbi51cmx9YCwgYCR7Y2FtcGFpZ24uYWRzQ291bnR9IHRvdGFsIGFkcyDigKIgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyBhY3RpdmVgKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBEYXRhIE1hbmFnZW1lbnQgLS0tXHJcblxyXG4gIGZ1bmN0aW9uIGRvd25sb2FkRGF0YSgpIHtcclxuICAgIC8vIEdlbmVyYXRlIGZpbGVuYW1lIHByb3BlcnRpZXNcclxuICAgIGNvbnN0IGFkdmVydGlzZXIgPSAoc3RhdGUubWV0YWRhdGE/LmFkdmVydGlzZXJOYW1lIHx8ICdmYl9hZHNfYW5hbHlzaXMnKVxyXG4gICAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXHJcbiAgICAgIC5yZXBsYWNlKC8oXi18LSQpL2csICcnKTtcclxuXHJcbiAgICBjb25zdCBjb3VudCA9IHN0YXRlLnJhd0NhbXBhaWducy5sZW5ndGg7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIGRhdGUgcmFuZ2UgZnJvbSBhbGwgY2FtcGFpZ25zXHJcbiAgICBsZXQgbWluRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBsZXQgbWF4RGF0ZSA9IG5ldyBEYXRlKDApO1xyXG5cclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy5maXJzdEFkdmVydGlzZWQgPCBtaW5EYXRlKSBtaW5EYXRlID0gYy5maXJzdEFkdmVydGlzZWQ7XHJcbiAgICAgIGlmIChjLmxhc3RBZHZlcnRpc2VkID4gbWF4RGF0ZSkgbWF4RGF0ZSA9IGMubGFzdEFkdmVydGlzZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIZWxwZXIgZm9yIGRhdGUgZm9ybWF0dGluZyBsaWtlIFwiamFuLTEtMjAyNVwiXHJcbiAgICBjb25zdCBmb3JtYXREYXRlID0gKGQpID0+IHtcclxuICAgICAgY29uc3QgbSA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1blwiLCBcImp1bFwiLCBcImF1Z1wiLCBcInNlcFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcclxuICAgICAgcmV0dXJuIGAke21bZC5nZXRNb250aCgpXX0tJHtkLmdldERhdGUoKX0tJHtkLmdldEZ1bGxZZWFyKCl9YDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgc3RhcnRTdHIgPSBmb3JtYXREYXRlKG1pbkRhdGUpO1xyXG4gICAgY29uc3QgZW5kU3RyID0gZm9ybWF0RGF0ZShtYXhEYXRlKTtcclxuXHJcbiAgICAvLyBGaWxlbmFtZTogcGVuZy1qb29uLWZiLWFkcy04LWNhbXBhaWducy1mcm9tLWphbi0xLTIwMjUtdG8tZGVjLTI0LTIwMjUuanNvblxyXG4gICAgY29uc3QgZmlsZW5hbWUgPSBgJHthZHZlcnRpc2VyfS1mYi1hZHMtJHtjb3VudH0tY2FtcGFpZ25zLWZyb20tJHtzdGFydFN0cn0tdG8tJHtlbmRTdHJ9Lmpzb25gO1xyXG5cclxuICAgIGNvbnN0IGRhdGFTdHIgPSBcImRhdGE6dGV4dC9qc29uO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICBjYW1wYWlnbnM6IHN0YXRlLnJhd0NhbXBhaWducyxcclxuICAgICAgYWxsQWRzOiBzdGF0ZS5hbGxBZHMsXHJcbiAgICAgIG1ldGFkYXRhOiBzdGF0ZS5tZXRhZGF0YSB8fCB7IGFkdmVydGlzZXJOYW1lOiBhZHZlcnRpc2VyIH0sIC8vIEZhbGxiYWNrIG1ldGFkYXRhXHJcbiAgICAgIGFpQW5hbHlzaXNSZXN1bHQ6IHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgfHwgbnVsbFxyXG4gICAgfSwgbnVsbCwgMikpO1xyXG5cclxuICAgIGNvbnN0IGRvd25sb2FkQW5jaG9yTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGRvd25sb2FkQW5jaG9yTm9kZS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIGRhdGFTdHIpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIGZpbGVuYW1lKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZG93bmxvYWRBbmNob3JOb2RlKTtcclxuICAgIGRvd25sb2FkQW5jaG9yTm9kZS5jbGljaygpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLnJlbW92ZSgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlRmlsZUltcG9ydChldmVudCkge1xyXG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlc1swXTtcclxuICAgIGlmICghZmlsZSkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICByZWFkZXIub25sb2FkID0gKGUpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShlLnRhcmdldC5yZXN1bHQpO1xyXG4gICAgICAgIGlmICghanNvbi5jYW1wYWlnbnMpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZm9ybWF0XCIpO1xyXG4gICAgICAgIGxvYWRJbXBvcnRlZERhdGEoanNvbik7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvciBpbXBvcnRpbmcgZmlsZTogJyArIGVyci5tZXNzYWdlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9hZEltcG9ydGVkRGF0YShpbXBvcnRlZERhdGEpIHtcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducyA9IGltcG9ydGVkRGF0YS5jYW1wYWlnbnMgfHwgW107XHJcbiAgICBzdGF0ZS5hbGxBZHMgPSBpbXBvcnRlZERhdGEuYWxsQWRzIHx8IFtdO1xyXG4gICAgc3RhdGUubWV0YWRhdGEgPSBpbXBvcnRlZERhdGEubWV0YWRhdGEgfHwgbnVsbDtcclxuICAgIHN0YXRlLmlzSW1wb3J0ZWQgPSAhIWltcG9ydGVkRGF0YS5pc0ltcG9ydGVkO1xyXG4gICAgc3RhdGUuYWlBbmFseXNpc1Jlc3VsdCA9IGltcG9ydGVkRGF0YS5haUFuYWx5c2lzUmVzdWx0IHx8IG51bGw7XHJcblxyXG4gICAgLy8gSGlkZSBEb3dubG9hZCBCdXR0b24gaWYgaW1wb3J0ZWRcclxuICAgIGNvbnN0IGRvd25sb2FkQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzRG93bmxvYWRCdG4nKTtcclxuICAgIGlmIChzdGF0ZS5pc0ltcG9ydGVkKSB7XHJcbiAgICAgIGRvd25sb2FkQnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb3dubG9hZEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1mbGV4JztcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXJzZSBkYXRlc1xyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zLmZvckVhY2goYyA9PiB7XHJcbiAgICAgIGMuZmlyc3RBZHZlcnRpc2VkID0gbmV3IERhdGUoYy5maXJzdEFkdmVydGlzZWQpO1xyXG4gICAgICBjLmxhc3RBZHZlcnRpc2VkID0gbmV3IERhdGUoYy5sYXN0QWR2ZXJ0aXNlZCk7XHJcbiAgICAgIGlmIChjLnRvcDUpIHtcclxuICAgICAgICBjLnRvcDUuZm9yRWFjaChhZCA9PiB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBkYXRlIHN0cmluZ3Mgb3Igb2JqZWN0c1xyXG4gICAgICAgICAgYWQuc3RhcnRpbmdEYXRlID0gbmV3IERhdGUoYWQuc3RhcnRpbmdEYXRlKTtcclxuICAgICAgICAgIGFkLmVuZERhdGUgPSBuZXcgRGF0ZShhZC5lbmREYXRlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSW5pdGlhbCBTb3J0XHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYi5maXJzdEFkdmVydGlzZWQpIC0gbmV3IERhdGUoYS5maXJzdEFkdmVydGlzZWQpKTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNTdGF0dXNUZXh0JykudGV4dENvbnRlbnQgPVxyXG4gICAgICBgTG9hZGVkICR7c3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aH0gY2FtcGFpZ25zYDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1NwaW5uZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgIHVwZGF0ZVZpZXcoKTtcclxuICAgIHNob3dPdmVybGF5KCk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gQUkgTG9naWMgKENTUCBGaXhlZCkgLS0tXHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGFuYWx5emVXaXRoQUkoKSB7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBbmFseXplQnRuJyk7XHJcbiAgICBjb25zdCByZXN1bHREaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNBSVJlc3VsdCcpO1xyXG5cclxuICAgIGlmICghc3RhdGUuYWlDb25maWcgfHwgIXN0YXRlLmFpQ29uZmlnLmFwaUtleSkge1xyXG4gICAgICBhbGVydCgnQUkgQ29uZmlndXJhdGlvbiBtaXNzaW5nLiBQbGVhc2UgY2hlY2sgZGF0YWJhc2Ugc2V0dGluZ3MuJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gJ/CfpJYgQW5hbHl6aW5nLi4uJztcclxuICAgIHJlc3VsdERpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgIC8vIENvbGxlY3QgYWxsIGFkIHRleHRzXHJcbiAgICBsZXQgYWxsQWRUZXh0cyA9IFtdO1xyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zLmZvckVhY2goYyA9PiB7XHJcbiAgICAgIGlmIChjLnRvcDUpIHtcclxuICAgICAgICBjLnRvcDUuZm9yRWFjaChhZCA9PiB7XHJcbiAgICAgICAgICBpZiAoYWQuYWRUZXh0ICYmIGFkLmFkVGV4dC5sZW5ndGggPiAxMCkge1xyXG4gICAgICAgICAgICBhbGxBZFRleHRzLnB1c2goYWQuYWRUZXh0KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgYW5kIGxpbWl0XHJcbiAgICBhbGxBZFRleHRzID0gWy4uLm5ldyBTZXQoYWxsQWRUZXh0cyldLnNsaWNlKDAsIDUwKTtcclxuXHJcbiAgICBpZiAoYWxsQWRUZXh0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgYWxlcnQoJ05vIGFkIHRleHQgY29udGVudCBmb3VuZCB0byBhbmFseXplLicpO1xyXG4gICAgICBidG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ/CfpJYgQW5hbHl6ZSB3aXRoIEFJJztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IHN0YXRlLmFpQ29uZmlnLnN5c3RlbVByb21wdCB8fCBcIllvdSBhcmUgYW4gZXhwZXJ0IG1hcmtldGluZyBhbmFseXN0LiBBbmFseXplIHRoZXNlIEZhY2Vib29rIGFkIGNvcGllcyBhbmQgaWRlbnRpZnkgY29tbW9uIGhvb2tzLCBwYWluIHBvaW50cyBhZGRyZXNzZWQsIGFuZCBDVEFzIHVzZWQuIFByb3ZpZGUgYSBjb25jaXNlIGJ1bGxldGVkIHN1bW1hcnkgb2YgdGhlIHN0cmF0ZWd5LlwiO1xyXG4gICAgY29uc3QgdXNlckNvbnRlbnQgPSBcIkFuYWx5emUgdGhlIGZvbGxvd2luZyBhZCBjb3BpZXM6XFxuXFxuXCIgKyBhbGxBZFRleHRzLmpvaW4oXCJcXG5cXG4tLS1cXG5cXG5cIik7XHJcblxyXG4gICAgLy8gRGVmaW5lIHJlc3BvbnNlIGhhbmRsZXJcclxuICAgIGNvbnN0IGhhbmRsZVJlc3BvbnNlID0gKGUpID0+IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBlLmRldGFpbDtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgIC8vIE1hcmtkb3duIGNvbnZlcnNpb24gc2ltcGxlIHJlcGxhY2VtZW50IGZvciBib2xkL25ld2xpbmVzIGlmIG5lZWRlZCwgXHJcbiAgICAgICAgLy8gYnV0IGlubmVySFRNTCBwcmVzZXJ2ZXMgYmFzaWMgZm9ybWF0dGluZyBtb3N0bHkuXHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gcmVzcG9uc2UuYW5hbHlzaXMucmVwbGFjZSgvXFxuL2csICc8YnI+JykucmVwbGFjZSgvXFwqXFwqKC4qPylcXCpcXCovZywgJzxzdHJvbmc+JDE8L3N0cm9uZz4nKTtcclxuICAgICAgICBzdGF0ZS5haUFuYWx5c2lzUmVzdWx0ID0gZm9ybWF0dGVkOyAvLyBTYXZlIHN0YXRlXHJcbiAgICAgICAgcmVzdWx0RGl2LmlubmVySFRNTCA9IGA8c3Ryb25nPvCfpJYgQUkgQW5hbHlzaXM6PC9zdHJvbmc+PGJyPjxicj4ke2Zvcm1hdHRlZH1gO1xyXG4gICAgICAgIHJlc3VsdERpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBlcnJvck1zZyA9IHJlc3BvbnNlID8gKHJlc3BvbnNlLmVycm9yIHx8ICdVbmtub3duIGVycm9yJykgOiAnVW5rbm93biBlcnJvcic7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignQUkgQW5hbHlzaXMgZmFpbGVkOicsIGVycm9yTXNnKTtcclxuICAgICAgICBhbGVydCgnQW5hbHlzaXMgZmFpbGVkOiAnICsgZXJyb3JNc2cpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBidG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ/CfpJYgQW5hbHl6ZSB3aXRoIEFJJztcclxuICAgIH07XHJcblxyXG4gICAgLy8gTGlzdGVuIGZvciByZXNwb25zZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcblxyXG4gICAgLy8gRGlzcGF0Y2ggcmVxdWVzdCB0byBjb250ZW50IHNjcmlwdCAtPiBiYWNrZ3JvdW5kXHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBEaXNwYXRjaGluZyBBSSBhbmFseXNpcyByZXF1ZXN0Jyk7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZmJBZHNBbmFseXplUmVxdWVzdCcsIHtcclxuICAgICAgZGV0YWlsOiB7XHJcbiAgICAgICAgYXBpS2V5OiBzdGF0ZS5haUNvbmZpZy5hcGlLZXksXHJcbiAgICAgICAgc3lzdGVtUHJvbXB0OiBzeXN0ZW1Qcm9tcHQsXHJcbiAgICAgICAgdXNlckNvbnRlbnQ6IHVzZXJDb250ZW50XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICAvLyBGYWxsYmFjay9UaW1lb3V0IGNsZWFudXBcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAoYnRuLmRpc2FibGVkICYmIGJ0bi50ZXh0Q29udGVudCA9PT0gJ/CfpJYgQW5hbHl6aW5nLi4uJykge1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZiQWRzQW5hbHl6ZVJlc3BvbnNlJywgaGFuZGxlUmVzcG9uc2UpO1xyXG4gICAgICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGJ0bi50ZXh0Q29udGVudCA9ICfwn6SWIEFuYWx5emUgd2l0aCBBSSc7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIEFJIHJlcXVlc3QgdGltZWQgb3V0Jyk7XHJcbiAgICAgIH1cclxuICAgIH0sIDYwMDAwKTtcclxuICB9XHJcblxyXG5cclxuICAvLyAtLS0gRXZlbnQgQnJpZGdlIC0tLVxyXG5cclxuICAvLyBMaXN0ZW4gZm9yIGltcG9ydGVkIGRhdGEgdmlhIEN1c3RvbUV2ZW50IChmcm9tIGluamVjdGVkLmpzKVxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzSW1wb3J0RGF0YScsIChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUmVjZWl2ZWQgaW1wb3J0ZWQgZGF0YSB2aWEgQ3VzdG9tRXZlbnQnKTtcclxuICAgIGxvYWRJbXBvcnRlZERhdGEoZXZlbnQuZGV0YWlsKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciByZW9wZW4gcmVxdWVzdFxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzUmVvcGVuJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUmVvcGVuaW5nIG92ZXJsYXknKTtcclxuICAgIHNob3dPdmVybGF5KCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgQUkgQ29uZmlnXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNDb25maWcnLCAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIFJlY2VpdmVkIEFJIENvbmZpZycpO1xyXG4gICAgc3RhdGUuYWlDb25maWcgPSBldmVudC5kZXRhaWw7XHJcbiAgICB1cGRhdGVWaWV3KCk7IC8vIFJlLXJlbmRlciB0byBzaG93IEFJIGJ1dHRvbiBpZiBuZWVkZWRcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciBTY3JhcGluZyBTdGF0dXNcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc1N0YXR1cycsIChldmVudCkgPT4ge1xyXG4gICAgY29uc3QgeyBzY3JvbGxpbmcsIGFkc0ZvdW5kLCBtZXNzYWdlIH0gPSBldmVudC5kZXRhaWw7XHJcblxyXG4gICAgLy8gRW5zdXJlIG92ZXJsYXkgaXMgdmlzaWJsZSBidXQgbWluaW1pemVkXHJcbiAgICBpZiAoc2Nyb2xsaW5nKSB7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnbWluaW1pemVkJyk7XHJcbiAgICAgIHN0YXRlLmlzTWluaW1pemVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtaW5CYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZWRCYXInKTtcclxuICAgIGNvbnN0IGljb24gPSBtaW5CYXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy1taW5pLWljb24nKTtcclxuICAgIGNvbnN0IHRleHQgPSBtaW5CYXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy1taW5pLXRleHQnKTtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01heGltaXplQnRuJyk7XHJcblxyXG4gICAgaWYgKHNjcm9sbGluZykge1xyXG4gICAgICBpY29uLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cImZiLWFkcy1taW5pLXNwaW5uZXJcIj7wn5SEPC9zcGFuPic7XHJcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgICBtaW5CYXIuc3R5bGUuYmFja2dyb3VuZCA9ICdsaW5lYXItZ3JhZGllbnQodG8gcmlnaHQsICNmNTllMGIsICNkOTc3MDYpJzsgLy8gQW1iZXIgZm9yIGFjdGl2ZVxyXG4gICAgICBidG4uc3R5bGUuZGlzcGxheSA9ICdub25lJzsgLy8gSGlkZSBcIlNob3dcIiBidXR0b24gd2hpbGUgc2NyYXBpbmdcclxuXHJcbiAgICAgIC8vIEFkZCBzcGlubmVyIHN0eWxlIGlmIG5vdCBleGlzdHNcclxuICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJykpIHtcclxuICAgICAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgc3R5bGUuaWQgPSAnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJztcclxuICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcclxuICAgICAgICAgICAgICAgIEBrZXlmcmFtZXMgZmJBZHNTcGluIHsgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH0gfVxyXG4gICAgICAgICAgICAgICAgLmZiLWFkcy1taW5pLXNwaW5uZXIgeyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGFuaW1hdGlvbjogZmJBZHNTcGluIDFzIGxpbmVhciBpbmZpbml0ZTsgfVxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBEb25lXHJcbiAgICAgIGljb24uaW5uZXJIVE1MID0gJ/Cfjq8nO1xyXG4gICAgICB0ZXh0LnRleHRDb250ZW50ID0gJ0FuYWx5c2lzIFJlYWR5ISc7XHJcbiAgICAgIG1pbkJhci5zdHlsZS5iYWNrZ3JvdW5kID0gJyc7IC8vIFJldmVydCB0byBkZWZhdWx0IGJsdWUvcHVycGxlXHJcbiAgICAgIGJ0bi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gRXhwb3NlIHJlb3BlbiBoZWxwZXJcclxuICB3aW5kb3cuZmJBZHNSZW9wZW5PdmVybGF5ID0gc2hvd092ZXJsYXk7XHJcblxyXG4gIC8vIENoZWNrIGZvciBwcmUtaW5qZWN0ZWQgZGF0YSAoZnJvbSBmaWxlIGltcG9ydClcclxuICBjb25zdCBwcmVJbmplY3RlZERhdGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRlZERhdGEnKTtcclxuICBpZiAocHJlSW5qZWN0ZWREYXRhKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShwcmVJbmplY3RlZERhdGEudGV4dENvbnRlbnQpO1xyXG4gICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBGb3VuZCBwcmUtaW5qZWN0ZWQgZGF0YSwgbG9hZGluZy4uLicpO1xyXG4gICAgICBsb2FkSW1wb3J0ZWREYXRhKGpzb24pO1xyXG4gICAgICAvLyBDbGVhbiB1cFxyXG4gICAgICBwcmVJbmplY3RlZERhdGEucmVtb3ZlKCk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGQiBBZHMgVmlzdWFsaXplcl0gRXJyb3IgbG9hZGluZyBwcmUtaW5qZWN0ZWQgZGF0YTonLCBlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59KSgpOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQ0FFQyxXQUFZO0FBQ1gsVUFBUSxJQUFJLDRDQUE0QztBQUd4RCxRQUFNLFFBQVE7QUFBQSxJQUNaLGNBQWMsQ0FBQTtBQUFBLElBRWQsUUFBUSxDQUFBO0FBQUEsSUFFUixZQUFZO0FBQUE7QUFBQSxJQUNaLGVBQWU7QUFBQSxJQUNmLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQTtBQUFBLElBS2IsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBO0FBQUEsSUFDZixZQUFZO0FBQUEsRUFDaEI7QUFHRSxXQUFTLGdCQUFnQixPQUFPO0FBQzlCLFFBQUksU0FBUyxJQUFLLFFBQU87QUFDekIsUUFBSSxTQUFTLEdBQUksUUFBTztBQUN4QixRQUFJLFNBQVMsR0FBSSxRQUFPO0FBQ3hCLFFBQUksU0FBUyxHQUFJLFFBQU87QUFDeEIsUUFBSSxTQUFTLEVBQUcsUUFBTztBQUN2QixXQUFPO0FBQUEsRUFDVDtBQUdBLFFBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxVQUFR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

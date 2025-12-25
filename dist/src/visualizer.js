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
    sortDirection: "asc"
    // 'asc' or 'desc'
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
      resultDiv.innerHTML = `<strong>🤖 AI Analysis (Saved):</strong><br><br>${state.aiAnalysisResult}`;
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
      metadata: state.metadata || { advertiserName: advertiser }
      // Fallback metadata
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsaXplci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Zpc3VhbGl6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogRmFjZWJvb2sgQWRzIEFuYWx5emVyIC0gVmlzdWFsaXplciBTY3JpcHQgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgY29uc29sZS5sb2coJ1tGQiBBZHMgQW5hbHl6ZXJdIFZpc3VhbGl6ZXIgc2NyaXB0IGxvYWRlZCcpO1xyXG5cclxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50XHJcbiAgY29uc3Qgc3RhdGUgPSB7XHJcbiAgICByYXdDYW1wYWlnbnM6IFtdLFxyXG4gICAgcHJvY2Vzc2VkQ2FtcGFpZ25zOiBbXSxcclxuICAgIGFsbEFkczogW10sXHJcbiAgICBmaWx0ZXJEb21haW46ICdhbGwnLFxyXG4gICAgZmlsdGVyU29ydDogJ3JlY2VudCcsIC8vICdyZWNlbnQnLCAnZHVyYXRpb24nLCAnYWRzJ1xyXG4gICAgZ3JvdXBCeURvbWFpbjogZmFsc2UsXHJcbiAgICBpc01pbmltaXplZDogdHJ1ZSxcclxuICAgIGN1cnJlbnRWaWV3OiAndGltZWxpbmUnLCAvLyAndGltZWxpbmUnLCAndG9wNS10ZXh0JywgJ2FsbC1jb3B5J1xyXG4gICAgaXNBbmFseXppbmc6IGZhbHNlLFxyXG4gICAgaXNBbmFseXppbmc6IGZhbHNlLFxyXG4gICAgYWlDb25maWc6IG51bGwsXHJcbiAgICBpc0FuYWx5emluZzogZmFsc2UsXHJcbiAgICBhaUNvbmZpZzogbnVsbCxcclxuICAgIG1ldGFkYXRhOiBudWxsLFxyXG4gICAgc29ydERpcmVjdGlvbjogJ2FzYycgLy8gJ2FzYycgb3IgJ2Rlc2MnXHJcbiAgfTtcclxuXHJcbiAgLy8gQ29sb3IgSGVscGVyXHJcbiAgZnVuY3Rpb24gZ2V0QWRDb3VudENvbG9yKGNvdW50KSB7XHJcbiAgICBpZiAoY291bnQgPj0gMTAwKSByZXR1cm4gJyNlZjQ0NDQnOyAvLyBSZWRcclxuICAgIGlmIChjb3VudCA+PSA1MCkgcmV0dXJuICcjZjk3MzE2JzsgIC8vIE9yYW5nZVxyXG4gICAgaWYgKGNvdW50ID49IDIwKSByZXR1cm4gJyNlYWIzMDgnOyAgLy8gWWVsbG93XHJcbiAgICBpZiAoY291bnQgPj0gMTApIHJldHVybiAnIzIyYzU1ZSc7ICAvLyBHcmVlblxyXG4gICAgaWYgKGNvdW50ID49IDUpIHJldHVybiAnIzNiODJmNic7ICAgLy8gQmx1ZVxyXG4gICAgcmV0dXJuICcjOGI1Y2Y2JzsgICAgICAgICAgICAgICAgICAgLy8gUHVycGxlXHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGUgdGhlIGZsb2F0aW5nIG92ZXJsYXlcclxuICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgb3ZlcmxheS5pZCA9ICdmYkFkc0FuYWx5emVyT3ZlcmxheSc7XHJcbiAgb3ZlcmxheS5jbGFzc05hbWUgPSAnaGlkZGVuIG1pbmltaXplZCc7XHJcbiAgb3ZlcmxheS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaW1pemVkLWJhclwiIGlkPVwiZmJBZHNNaW5pbWl6ZWRCYXJcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktY29udGVudFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1taW5pLWljb25cIj7wn46vPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1pbmktdGV4dFwiPkZhY2Vib29rIEFkcyBDYW1wYWlnbiBBbmFseXplcjwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbWluaS1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1taW5pLWJ0blwiIGlkPVwiZmJBZHNNYXhpbWl6ZUJ0blwiPlNob3c8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYW5hbHl6ZXItY29udGFpbmVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1wYW5lbFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hbmFseXplci1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDtcIj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAyNHB4O1wiPvCfjq88L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGgxPkZhY2Vib29rIEFkcyBDYW1wYWlnbiBBbmFseXplcjwvaDE+XHJcbiAgICAgICAgICAgICAgICA8cCBpZD1cImZiQWRzU3VidGl0bGVcIj5UaW1lbGluZSAmIENhbXBhaWduIEFuYWx5c2lzPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYWN0aW9uc1wiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtaGVhZGVyLWJ0blwiIGlkPVwiZmJBZHNNaW5pbWl6ZUJ0blwiIHRpdGxlPVwiTWluaW1pemVcIj5fPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1oZWFkZXItYnRuXCIgaWQ9XCJmYkFkc0Nsb3NlQnRuXCIgdGl0bGU9XCJDbG9zZVwiPsOXPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbHNcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLXJvd1wiIHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB3aWR0aDogMTAwJTsgbWFyZ2luLWJvdHRvbTogMTJweDtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY29udHJvbC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6ICMzNzQxNTE7XCI+Vmlldzo8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJmYi1hZHMtYnRuIGZiLWFkcy1idG4tb3V0bGluZSBhY3RpdmVcIiBkYXRhLXZpZXc9XCJ0aW1lbGluZVwiPvCfk4ogVGltZWxpbmU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS12aWV3PVwidG9wNS10ZXh0XCI+8J+PhiBUb3AgNSBUZXh0PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDUwMDsgZm9udC1zaXplOiAxM3B4OyBjb2xvcjogIzM3NDE1MTtcIj5Tb3J0IGJ5Ojwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lIGFjdGl2ZVwiIGRhdGEtc29ydD1cInJlY2VudFwiPlN0YXJ0IERhdGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1vdXRsaW5lXCIgZGF0YS1zb3J0PVwiZHVyYXRpb25cIj5EdXJhdGlvbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBkYXRhLXNvcnQ9XCJhZHNcIj4jIG9mIEFkczwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLW91dGxpbmVcIiBpZD1cImZiQWRzR3JvdXBEb21haW5CdG5cIj5Hcm91cCBieSBEb21haW48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiIGlkPVwiZmJBZHNEb3dubG9hZEJ0blwiIHN0eWxlPVwiYmFja2dyb3VuZDogIzhiNWNmNjtcIj7wn5K+IERvd25sb2FkIERhdGE8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiIGlkPVwiZmJBZHNJbXBvcnRCdG5cIiBzdHlsZT1cImJhY2tncm91bmQ6ICNlYWIzMDg7IGNvbG9yOiBibGFjaztcIj7wn5OCIEltcG9ydCBEYXRhPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJmaWxlXCIgaWQ9XCJmYkFkc0ltcG9ydElucHV0XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiIGFjY2VwdD1cIi5qc29uXCI+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmRcIiBpZD1cImZiQWRzVGltZWxpbmVMZWdlbmRcIiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IHdpZHRoOiAxMDAlOyBnYXA6IDE2cHg7IHBhZGRpbmctdG9wOiAxMnB4OyBib3JkZXItdG9wOiAxcHggc29saWQgI2U1ZTdlYjtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogIzhiNWNmNjtcIj48L2Rpdj4gMS00IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjM2I4MmY2O1wiPjwvZGl2PiA1LTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICMyMmM1NWU7XCI+PC9kaXY+IDEwLTE5IGFkczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtaXRlbVwiPjxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZWFiMzA4O1wiPjwvZGl2PiAyMC00OSBhZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGVnZW5kLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2Y5NzMxNjtcIj48L2Rpdj4gNTAtOTkgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWxlZ2VuZC1pdGVtXCI+PGRpdiBjbGFzcz1cImZiLWFkcy1sZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQ6ICNlZjQ0NDQ7XCI+PC9kaXY+IDEwMCsgYWRzPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1zdGF0dXMtYmFyXCIgc3R5bGU9XCJib3JkZXI6IG5vbmU7IHBhZGRpbmctdG9wOiAwOyBwYWRkaW5nLWJvdHRvbTogMDtcIj5cclxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXNwaW5uZXJcIiBpZD1cImZiQWRzU3Bpbm5lclwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtc3RhdHVzLXRleHRcIiBpZD1cImZiQWRzU3RhdHVzVGV4dFwiPkxvYWRpbmcgYW5hbHlzaXMgZGF0YS4uLjwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gIFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jaGFydC1jb250YWluZXJcIiBpZD1cImZiQWRzQ2hhcnRDb250ZW50XCI+XHJcbiAgICAgICAgICAgICA8IS0tIER5bmFtaWMgQ29udGVudCAtLT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgXHJcbiAgICAgIDwhLS0gTW9kYWwgQ29udGFpbmVyIC0tPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vZGFsLW92ZXJsYXlcIiBpZD1cImZiQWRzTW9kYWxPdmVybGF5XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC10aXRsZVwiPlxyXG4gICAgICAgICAgICAgIDxoMiBpZD1cImZiQWRzTW9kYWxUaXRsZVwiPkNhbXBhaWduIERldGFpbHM8L2gyPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwiZmItYWRzLW1vZGFsLW1ldGFcIiBpZD1cImZiQWRzTW9kYWxNZXRhXCI+dXJsLi4uPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1tb2RhbC1jbG9zZVwiIGlkPVwiZmJBZHNNb2RhbENsb3NlXCI+w5c8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1tb2RhbC1ib2R5XCIgaWQ9XCJmYkFkc01vZGFsQm9keVwiPlxyXG4gICAgICAgICAgICAgPCEtLSBEZXRhaWxzIC0tPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcclxuXHJcbiAgLy8gVG9vbHRpcFxyXG4gIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICB0b29sdGlwLmNsYXNzTmFtZSA9ICdmYi1hZHMtdG9vbHRpcCc7XHJcbiAgb3ZlcmxheS5hcHBlbmRDaGlsZCh0b29sdGlwKTtcclxuXHJcbiAgLy8gLS0tIEV2ZW50IExpc3RlbmVycyAtLS1cclxuXHJcbiAgLy8gSGVhZGVyIEFjdGlvbnNcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDbG9zZUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZU92ZXJsYXkpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01pbmltaXplQnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVNaW5pbWl6ZSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTWF4aW1pemVCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZWRCYXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1pbmltaXplKTtcclxuXHJcbiAgLy8gTW9kYWwgQWN0aW9uc1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01vZGFsQ2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVNb2RhbCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxPdmVybGF5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmlkID09PSAnZmJBZHNNb2RhbE92ZXJsYXknKSBoaWRlTW9kYWwoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTWFpbiBBY3Rpb25zXHJcblxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNEb3dubG9hZEJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZG93bmxvYWREYXRhKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRCdG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0ltcG9ydElucHV0JykuY2xpY2soKTtcclxuICB9KTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRJbnB1dCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVJbXBvcnQpO1xyXG5cclxuXHJcbiAgLy8gVmlldyBTd2l0Y2hlclxyXG4gIGNvbnN0IHZpZXdCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdmlld10nKTtcclxuICB2aWV3QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICB2aWV3QnV0dG9ucy5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XHJcbiAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICBzdGF0ZS5jdXJyZW50VmlldyA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS12aWV3Jyk7XHJcblxyXG4gICAgICBjb25zdCBsZWdlbmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNUaW1lbGluZUxlZ2VuZCcpO1xyXG4gICAgICBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0aW1lbGluZScpIHtcclxuICAgICAgICBsZWdlbmQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWdlbmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgfVxyXG4gICAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gU29ydCBTd2l0Y2hlclxyXG4gIGNvbnN0IHNvcnRCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc29ydF0nKTtcclxuXHJcbiAgLy8gSGVscGVyIHRvIHVwZGF0ZSBidXR0b24gbGFiZWxzXHJcbiAgY29uc3QgdXBkYXRlU29ydEJ1dHRvbnMgPSAoKSA9PiB7XHJcbiAgICBzb3J0QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICAgIGNvbnN0IHNvcnRUeXBlID0gYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1zb3J0Jyk7XHJcbiAgICAgIGxldCBsYWJlbCA9IGJ0bi5pbm5lclRleHQucmVwbGFjZSgvIFvihpHihpNdLywgJycpOyAvLyBDbGVhbiBleGlzdGluZyBhcnJvd1xyXG5cclxuICAgICAgaWYgKHN0YXRlLmZpbHRlclNvcnQgPT09IHNvcnRUeXBlKSB7XHJcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vIEFkZCBhcnJvd1xyXG4gICAgICAgIGxhYmVsICs9IHN0YXRlLnNvcnREaXJlY3Rpb24gPT09ICdhc2MnID8gJyDihpEnIDogJyDihpMnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgfVxyXG4gICAgICBidG4uaW5uZXJUZXh0ID0gbGFiZWw7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBzb3J0QnV0dG9ucy5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB0YXJnZXRTb3J0ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNvcnQnKTtcclxuXHJcbiAgICAgIGlmIChzdGF0ZS5maWx0ZXJTb3J0ID09PSB0YXJnZXRTb3J0KSB7XHJcbiAgICAgICAgLy8gVG9nZ2xlIGRpcmVjdGlvblxyXG4gICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSBzdGF0ZS5zb3J0RGlyZWN0aW9uID09PSAnYXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIE5ldyBzb3J0OiBEZWZhdWx0IHRvICdkZXNjJyBmb3IgZXZlcnl0aGluZz8gXHJcbiAgICAgICAgLy8gVXN1YWxseSAnU3RhcnQgRGF0ZScgdXNlcnMgbWlnaHQgd2FudCBPbGRlc3QgRmlyc3QgKEFzYykgb3IgTmV3ZXN0IEZpcnN0IChEZXNjKS5cclxuICAgICAgICAvLyBMZXQncyBkZWZhdWx0IHRvICdkZXNjJyAoSGlnaC9OZXdlc3QpIGFzIHN0YW5kYXJkLCBidXQgbWF5YmUgJ2FzYycgZm9yIERhdGU/XHJcbiAgICAgICAgLy8gVGhlIG9yaWdpbmFsIGNvZGUgaGFkIGRlZmF1bHQgRGF0ZSBhcyBBc2MgKE9sZGVzdCBmaXJzdCkuXHJcbiAgICAgICAgaWYgKHRhcmdldFNvcnQgPT09ICdyZWNlbnQnKSB7XHJcbiAgICAgICAgICBzdGF0ZS5zb3J0RGlyZWN0aW9uID0gJ2FzYyc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXRlLnNvcnREaXJlY3Rpb24gPSAnZGVzYyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlLmZpbHRlclNvcnQgPSB0YXJnZXRTb3J0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB1cGRhdGVTb3J0QnV0dG9ucygpO1xyXG4gICAgICB1cGRhdGVWaWV3KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gSW5pdCBidXR0b24gbGFiZWxzXHJcbiAgdXBkYXRlU29ydEJ1dHRvbnMoKTtcclxuXHJcbiAgLy8gR3JvdXAgYnkgRG9tYWluXHJcbiAgY29uc3QgZ3JvdXBCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNHcm91cERvbWFpbkJ0bicpO1xyXG4gIGdyb3VwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc3RhdGUuZ3JvdXBCeURvbWFpbiA9ICFzdGF0ZS5ncm91cEJ5RG9tYWluO1xyXG4gICAgZ3JvdXBCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XHJcbiAgICB1cGRhdGVWaWV3KCk7XHJcbiAgfSk7XHJcblxyXG5cclxuICAvLyAtLS0gRnVuY3Rpb25zIC0tLVxyXG5cclxuICBmdW5jdGlvbiBzaG93T3ZlcmxheSgpIHtcclxuICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ21pbmltaXplZCcpO1xyXG4gICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhpZGVPdmVybGF5KCkge1xyXG4gICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRvZ2dsZU1pbmltaXplKGUpIHtcclxuICAgIGlmIChlKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgc3RhdGUuaXNNaW5pbWl6ZWQgPSAhc3RhdGUuaXNNaW5pbWl6ZWQ7XHJcbiAgICBpZiAoc3RhdGUuaXNNaW5pbWl6ZWQpIHtcclxuICAgICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdtaW5pbWl6ZWQnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnbWluaW1pemVkJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzaG93TW9kYWwoY29udGVudEh0bWwsIHRpdGxlLCBtZXRhKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbFRpdGxlJykuaW5uZXJUZXh0ID0gdGl0bGU7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE1ldGEnKS5pbm5lclRleHQgPSBtZXRhO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzTW9kYWxCb2R5JykuaW5uZXJIVE1MID0gY29udGVudEh0bWw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgc2V0dXBDb3B5QnV0dG9ucyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbEJvZHknKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoaWRlTW9kYWwoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNb2RhbE92ZXJsYXknKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29weVJpY2hUZXh0KHBsYWluLCBodG1sKSB7XHJcbiAgICBpZiAodHlwZW9mIENsaXBib2FyZEl0ZW0gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgY29uc3QgdGV4dEJsb2IgPSBuZXcgQmxvYihbcGxhaW5dLCB7IHR5cGU6IFwidGV4dC9wbGFpblwiIH0pO1xyXG4gICAgICBjb25zdCBodG1sQmxvYiA9IG5ldyBCbG9iKFtodG1sXSwgeyB0eXBlOiBcInRleHQvaHRtbFwiIH0pO1xyXG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlKFtcclxuICAgICAgICBuZXcgQ2xpcGJvYXJkSXRlbSh7XHJcbiAgICAgICAgICBcInRleHQvcGxhaW5cIjogdGV4dEJsb2IsXHJcbiAgICAgICAgICBcInRleHQvaHRtbFwiOiBodG1sQmxvYlxyXG4gICAgICAgIH0pXHJcbiAgICAgIF0pLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlJpY2ggY29weSBmYWlsZWQsIGZhbGxpbmcgYmFjayB0byBwbGFpbjpcIiwgZXJyKTtcclxuICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChwbGFpbik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocGxhaW4pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0dXBDb3B5QnV0dG9ucyhjb250YWluZXIpIHtcclxuICAgIGNvbnN0IGNvcHlCdG5zID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5mYi1hZHMtY29weS1idG4nKTtcclxuICAgIGNvcHlCdG5zLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQ7IC8vIFVzZSBjdXJyZW50VGFyZ2V0IHRvIGVuc3VyZSB3ZSBnZXQgdGhlIGJ1dHRvbiwgbm90IGljb25cclxuICAgICAgICBjb25zdCByYXdUZXh0ID0gZGVjb2RlVVJJQ29tcG9uZW50KHRhcmdldC5kYXRhc2V0LmNvcHlUZXh0KTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCBtZXRhZGF0YSBpZiBhdmFpbGFibGVcclxuICAgICAgICBjb25zdCBtZXRhID0ge1xyXG4gICAgICAgICAgdXJsOiB0YXJnZXQuZGF0YXNldC51cmwgPyBkZWNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQudXJsKSA6ICcnLFxyXG4gICAgICAgICAgY2FtcGFpZ25EdXJhdGlvbjogdGFyZ2V0LmRhdGFzZXQuY2FtcGFpZ25EdXJhdGlvbiB8fCAnJyxcclxuICAgICAgICAgIGNhbXBhaWduQWRzOiB0YXJnZXQuZGF0YXNldC5jYW1wYWlnbkFkcyB8fCAnJyxcclxuICAgICAgICAgIGxpYklkOiB0YXJnZXQuZGF0YXNldC5hZExpYklkIHx8ICcnLFxyXG4gICAgICAgICAgYWREdXJhdGlvbjogdGFyZ2V0LmRhdGFzZXQuYWREdXJhdGlvbiB8fCAnJyxcclxuICAgICAgICAgIGFkRGF0ZXM6IHRhcmdldC5kYXRhc2V0LmFkRGF0ZXMgfHwgJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDb25zdHJ1Y3QgUmljaCBUZXh0IEhUTUxcclxuICAgICAgICBjb25zdCByaWNoVGV4dCA9IGBcclxuICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LWZhbWlseTogc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNHB4OyBsaW5lLWhlaWdodDogMS41OyBjb2xvcjogIzM3NDE1MTtcIj5cclxuICAgICAgICAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDhweDtcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkNhbXBhaWduOjwvc3Ryb25nPiA8YSBocmVmPVwiJHttZXRhLnVybH1cIj4ke21ldGEudXJsfTwvYT48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHttZXRhLmNhbXBhaWduRHVyYXRpb24gPyBgPHN0cm9uZz5EdXJhdGlvbjo8L3N0cm9uZz4gJHttZXRhLmNhbXBhaWduRHVyYXRpb259IGRheXNgIDogJyd9IFxyXG4gICAgICAgICAgICAgICAgICAgICR7bWV0YS5jYW1wYWlnbkFkcyA/IGDigKIgJHttZXRhLmNhbXBhaWduQWRzfSBhZHNgIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTJweDsgcGFkZGluZy1ib3R0b206IDEycHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTVlN2ViO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TGlicmFyeSBJRDo8L3N0cm9uZz4gPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHttZXRhLmxpYklkfVwiPiR7bWV0YS5saWJJZH08L2E+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RGF0ZXM6PC9zdHJvbmc+ICR7bWV0YS5hZERhdGVzfSB8IDxzdHJvbmc+QWQgRHVyYXRpb246PC9zdHJvbmc+ICR7bWV0YS5hZER1cmF0aW9ufSBkYXlzXHJcbiAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyYXdUZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpfVxyXG4gICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgLy8gQ29uc3RydWN0IFBsYWluIFRleHQgRmFsbGJhY2tcclxuICAgICAgICBjb25zdCBwbGFpblRleHQgPSBgQ2FtcGFpZ246ICR7bWV0YS51cmx9XFxuRHVyYXRpb246ICR7bWV0YS5jYW1wYWlnbkR1cmF0aW9ufSBkYXlzIOKAoiAke21ldGEuY2FtcGFpZ25BZHN9IGFkc1xcblxcbkxpYnJhcnkgSUQ6ICR7bWV0YS5saWJJZH1cXG5EYXRlczogJHttZXRhLmFkRGF0ZXN9IHwgQWQgRHVyYXRpb246ICR7bWV0YS5hZER1cmF0aW9ufSBkYXlzXFxuXFxuLS0tXFxuXFxuJHtyYXdUZXh0fWA7XHJcblxyXG4gICAgICAgIC8vIFVzZSByaWNoIHRleHQgY29weSBoZWxwZXJcclxuICAgICAgICBjb3B5UmljaFRleHQocGxhaW5UZXh0LCByaWNoVGV4dCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsID0gdGFyZ2V0LmlubmVySFRNTDtcclxuICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gJ+KchSBDb3BpZWQhJztcclxuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCgnc3VjY2VzcycpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGFyZ2V0LmlubmVySFRNTCA9IG9yaWdpbmFsO1xyXG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ3N1Y2Nlc3MnKTtcclxuICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZVZpZXcoKSB7XHJcbiAgICBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0aW1lbGluZScpIHtcclxuICAgICAgcmVuZGVyVGltZWxpbmUoKTtcclxuICAgIH0gZWxzZSBpZiAoc3RhdGUuY3VycmVudFZpZXcgPT09ICd0b3A1LXRleHQnKSB7XHJcbiAgICAgIHJlbmRlclRvcDVUZXh0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcm9jZXNzRGF0YShjYW1wYWlnbnMpIHtcclxuICAgIGNvbnN0IHNvcnRlZCA9IFsuLi5jYW1wYWlnbnNdO1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUHJvY2Vzc2luZyBkYXRhLiBTb3J0OicsIHN0YXRlLmZpbHRlclNvcnQsICdHcm91cDonLCBzdGF0ZS5ncm91cEJ5RG9tYWluKTtcclxuXHJcbiAgICAvLyAxLiBTb3J0aW5nIExvZ2ljXHJcbiAgICAvLyAxLiBTb3J0aW5nIExvZ2ljXHJcbiAgICBzb3J0ZWQuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICBsZXQgdmFsQSwgdmFsQjtcclxuXHJcbiAgICAgIGlmIChzdGF0ZS5maWx0ZXJTb3J0ID09PSAnYWRzJykge1xyXG4gICAgICAgIHZhbEEgPSBOdW1iZXIoYS5hZHNDb3VudCkgfHwgMDtcclxuICAgICAgICB2YWxCID0gTnVtYmVyKGIuYWRzQ291bnQpIHx8IDA7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUuZmlsdGVyU29ydCA9PT0gJ2R1cmF0aW9uJykge1xyXG4gICAgICAgIHZhbEEgPSBOdW1iZXIoYS5jYW1wYWlnbkR1cmF0aW9uRGF5cykgfHwgMDtcclxuICAgICAgICB2YWxCID0gTnVtYmVyKGIuY2FtcGFpZ25EdXJhdGlvbkRheXMpIHx8IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gJ3JlY2VudCcgLyBTdGFydCBEYXRlXHJcbiAgICAgICAgdmFsQSA9IG5ldyBEYXRlKGEuZmlyc3RBZHZlcnRpc2VkKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgdmFsQiA9IG5ldyBEYXRlKGIuZmlyc3RBZHZlcnRpc2VkKS5nZXRUaW1lKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0YW5kYXJkIEFzY2VuZGluZzogdmFsQSAtIHZhbEJcclxuICAgICAgY29uc3QgY29tcGFyaXNvbiA9IHZhbEEgLSB2YWxCO1xyXG5cclxuICAgICAgLy8gQXBwbHkgRGlyZWN0aW9uXHJcbiAgICAgIHJldHVybiBzdGF0ZS5zb3J0RGlyZWN0aW9uID09PSAnYXNjJyA/IGNvbXBhcmlzb24gOiAtY29tcGFyaXNvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIDIuIEdyb3VwaW5nIExvZ2ljIChTZWNvbmRhcnkgU29ydClcclxuICAgIGlmIChzdGF0ZS5ncm91cEJ5RG9tYWluKSB7XHJcbiAgICAgIHNvcnRlZC5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZEEgPSBnZXREb21haW4oYS51cmwpO1xyXG4gICAgICAgIGNvbnN0IGRCID0gZ2V0RG9tYWluKGIudXJsKTtcclxuICAgICAgICBpZiAoZEEgPCBkQikgcmV0dXJuIC0xO1xyXG4gICAgICAgIGlmIChkQSA+IGRCKSByZXR1cm4gMTtcclxuICAgICAgICAvLyBLZWVwIHByZXZpb3VzIHNvcnQgb3JkZXIgd2l0aGluIHNhbWUgZG9tYWluXHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzb3J0ZWQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXREb21haW4odXJsKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gbmV3IFVSTCh1cmwpLmhvc3RuYW1lLnJlcGxhY2UoJ3d3dy4nLCAnJyk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgcmV0dXJuIHVybDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclRpbWVsaW5lKCkge1xyXG4gICAgY29uc3QgY2hhcnRDb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ2hhcnRDb250ZW50Jyk7XHJcbiAgICBjaGFydENvbnRlbnQuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgY29uc3QgY2FtcGFpZ25zVG9SZW5kZXIgPSBwcm9jZXNzRGF0YShzdGF0ZS5yYXdDYW1wYWlnbnMpO1xyXG5cclxuICAgIGlmIChjYW1wYWlnbnNUb1JlbmRlci5sZW5ndGggPT09IDApIHtcclxuICAgICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZmItYWRzLWVtcHR5LXN0YXRlXCI+Tm8gY2FtcGFpZ25zIG1hdGNoIGNyaXRlcmlhPC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YnRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3VidGl0bGUnKTtcclxuICAgIGlmIChzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBmaXJzdCA9IG5ldyBEYXRlKHN0YXRlLnJhd0NhbXBhaWduc1tzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoIC0gMV0uZmlyc3RBZHZlcnRpc2VkKTtcclxuICAgICAgY29uc3QgbGFzdCA9IG5ldyBEYXRlKHN0YXRlLnJhd0NhbXBhaWduc1swXS5sYXN0QWR2ZXJ0aXNlZCk7IC8vIFJvdWdoIGFwcHJveCBkZXBlbmRpbmcgb24gc29ydFxyXG4gICAgICBzdWJ0aXRsZS50ZXh0Q29udGVudCA9IGAke3N0YXRlLnJhd0NhbXBhaWducy5sZW5ndGh9IGNhbXBhaWducyBhbmFseXplZGA7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIERldGVybWluZSBUaW1lbGluZSBSYW5nZVxyXG4gICAgbGV0IG1pbkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IG1heERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICBpZiAoYy5maXJzdEFkdmVydGlzZWQgPCBtaW5EYXRlKSBtaW5EYXRlID0gYy5maXJzdEFkdmVydGlzZWQ7XHJcbiAgICAgIGlmIChjLmxhc3RBZHZlcnRpc2VkID4gbWF4RGF0ZSkgbWF4RGF0ZSA9IGMubGFzdEFkdmVydGlzZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBkYXlNcyA9IDg2NDAwMDAwO1xyXG4gICAgLy8gRW5zdXJlIGF0IGxlYXN0IDEgZGF5IHJhbmdlIHRvIGF2b2lkIGRpdmlzaW9uIGJ5IHplcm9cclxuICAgIGxldCByYW5nZU1zID0gbWF4RGF0ZSAtIG1pbkRhdGU7XHJcbiAgICBpZiAocmFuZ2VNcyA8IGRheU1zKSByYW5nZU1zID0gZGF5TXM7XHJcblxyXG4gICAgLy8gQWRkIHBhZGRpbmcgKG1heCBvZiA1IGRheXMgb3IgMTAlIG9mIHRvdGFsIHJhbmdlKVxyXG4gICAgY29uc3QgcGFkZGluZyA9IE1hdGgubWF4KGRheU1zICogNSwgcmFuZ2VNcyAqIDAuMSk7XHJcblxyXG4gICAgY29uc3QgcmVuZGVyTWluID0gbmV3IERhdGUobWluRGF0ZS5nZXRUaW1lKCkgLSBwYWRkaW5nKTtcclxuICAgIGNvbnN0IHJlbmRlck1heCA9IG5ldyBEYXRlKG1heERhdGUuZ2V0VGltZSgpICsgcGFkZGluZyk7XHJcbiAgICBjb25zdCB0b3RhbER1cmF0aW9uID0gcmVuZGVyTWF4IC0gcmVuZGVyTWluO1xyXG5cclxuICAgIC8vIEhlYWRlclxyXG4gICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBoZWFkZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy10aW1lbGluZS1oZWFkZXInO1xyXG4gICAgaGVhZGVyLmlubmVySFRNTCA9IGBcclxuICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtbGFiZWxcIj48c3Ryb25nPkNhbXBhaWduPC9zdHJvbmc+PC9kaXY+XHJcbiAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRpbWVsaW5lLWdyaWRcIj48L2Rpdj5cclxuICAgIGA7XHJcbiAgICBjaGFydENvbnRlbnQuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcclxuXHJcbiAgICBjb25zdCBncmlkID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtdGltZWxpbmUtZ3JpZCcpO1xyXG5cclxuICAgIC8vIEFkYXB0aXZlIE1hcmtlcnMgbG9naWNcclxuICAgIGNvbnN0IGlzU2hvcnRSYW5nZSA9IHJhbmdlTXMgPCAoZGF5TXMgKiA2MCk7XHJcblxyXG4gICAgaWYgKGlzU2hvcnRSYW5nZSkge1xyXG4gICAgICAvLyBXZWVrbHkgbWFya2Vyc1xyXG4gICAgICBsZXQgZCA9IG5ldyBEYXRlKHJlbmRlck1pbik7XHJcbiAgICAgIHdoaWxlIChkIDw9IHJlbmRlck1heCkge1xyXG4gICAgICAgIGNvbnN0IHBvcyA9ICgoZCAtIHJlbmRlck1pbikgLyB0b3RhbER1cmF0aW9uKSAqIDEwMDtcclxuICAgICAgICBpZiAocG9zID49IDAgJiYgcG9zIDw9IDEwMCkge1xyXG4gICAgICAgICAgY29uc3QgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICBtYXJrZXIuY2xhc3NOYW1lID0gJ2ZiLWFkcy1tb250aC1tYXJrZXInO1xyXG4gICAgICAgICAgbWFya2VyLnN0eWxlLmxlZnQgPSBgJHtwb3N9JWA7XHJcbiAgICAgICAgICBtYXJrZXIuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9udGgtbGFiZWxcIj4ke2QudG9Mb2NhbGVTdHJpbmcoJ2RlZmF1bHQnLCB7IG1vbnRoOiAnc2hvcnQnLCBkYXk6ICdudW1lcmljJyB9KX08L2Rpdj5gO1xyXG4gICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChtYXJrZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgKyA3KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTW9udGhseSBtYXJrZXJzXHJcbiAgICAgIGxldCBkID0gbmV3IERhdGUocmVuZGVyTWluKTtcclxuICAgICAgZC5zZXREYXRlKDEpO1xyXG4gICAgICB3aGlsZSAoZCA8PSByZW5kZXJNYXgpIHtcclxuICAgICAgICBjb25zdCBwb3MgPSAoKGQgLSByZW5kZXJNaW4pIC8gdG90YWxEdXJhdGlvbikgKiAxMDA7XHJcbiAgICAgICAgaWYgKHBvcyA+PSAwICYmIHBvcyA8PSAxMDApIHtcclxuICAgICAgICAgIGNvbnN0IG1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgbWFya2VyLmNsYXNzTmFtZSA9ICdmYi1hZHMtbW9udGgtbWFya2VyJztcclxuICAgICAgICAgIG1hcmtlci5zdHlsZS5sZWZ0ID0gYCR7cG9zfSVgO1xyXG4gICAgICAgICAgbWFya2VyLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLW1vbnRoLWxhYmVsXCI+JHtkLnRvTG9jYWxlU3RyaW5nKCdkZWZhdWx0JywgeyBtb250aDogJ3Nob3J0JywgeWVhcjogJzItZGlnaXQnIH0pfTwvZGl2PmA7XHJcbiAgICAgICAgICBncmlkLmFwcGVuZENoaWxkKG1hcmtlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGQuc2V0TW9udGgoZC5nZXRNb250aCgpICsgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW5kZXIgUm93c1xyXG4gICAgbGV0IGxhc3REb21haW4gPSBudWxsO1xyXG5cclxuICAgIGNhbXBhaWduc1RvUmVuZGVyLmZvckVhY2goY2FtcGFpZ24gPT4ge1xyXG4gICAgICAvLyBEb21haW4gSGVhZGVyIGZvciBHcm91cGluZ1xyXG4gICAgICBjb25zdCBkb21haW4gPSBnZXREb21haW4oY2FtcGFpZ24udXJsKTtcclxuICAgICAgaWYgKHN0YXRlLmdyb3VwQnlEb21haW4gJiYgZG9tYWluICE9PSBsYXN0RG9tYWluKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBIZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBncm91cEhlYWRlci5jbGFzc05hbWUgPSAnZmItYWRzLWRvbWFpbi1oZWFkZXInO1xyXG4gICAgICAgIGdyb3VwSGVhZGVyLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWRvbWFpbi1uYW1lXCI+JHtkb21haW59PC9kaXY+YDtcclxuICAgICAgICBjaGFydENvbnRlbnQuYXBwZW5kQ2hpbGQoZ3JvdXBIZWFkZXIpO1xyXG4gICAgICAgIGxhc3REb21haW4gPSBkb21haW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICByb3cuY2xhc3NOYW1lID0gJ2ZiLWFkcy1jYW1wYWlnbi1yb3cnO1xyXG5cclxuICAgICAgY29uc3QgbGVmdCA9ICgoY2FtcGFpZ24uZmlyc3RBZHZlcnRpc2VkIC0gcmVuZGVyTWluKSAvIHRvdGFsRHVyYXRpb24pICogMTAwO1xyXG4gICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KDAuNSwgKChjYW1wYWlnbi5sYXN0QWR2ZXJ0aXNlZCAtIGNhbXBhaWduLmZpcnN0QWR2ZXJ0aXNlZCkgLyB0b3RhbER1cmF0aW9uKSAqIDEwMCk7XHJcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0QWRDb3VudENvbG9yKGNhbXBhaWduLmFkc0NvdW50KTtcclxuXHJcbiAgICAgIHJvdy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWNhbXBhaWduLWluZm9cIj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tdXJsXCIgdGl0bGU9XCIke2NhbXBhaWduLnVybH1cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke2NhbXBhaWduLnVybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiBpbmhlcml0OyB0ZXh0LWRlY29yYXRpb246IG5vbmU7XCI+JHtjYW1wYWlnbi51cmx9PC9hPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDExcHg7IG1hcmdpbi1sZWZ0OiA2cHg7XCI+XHJcbiAgICAgICAgICAgICAgICAgICg8YSBocmVmPVwiaHR0cHM6Ly93ZWIuYXJjaGl2ZS5vcmcvd2ViLyovJHtjYW1wYWlnbi51cmx9LypcIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiAjNmI3MjgwOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcIj5BcmNoaXZlPC9hPilcclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYW1wYWlnbi1tZXRhXCI+XHJcbiAgICAgICAgICAgICAgICR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9IGRheXMg4oCiICR7Y2FtcGFpZ24uYWRzQ291bnR9IGFkc1xyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tdGltZWxpbmVcIj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGltZWxpbmUtYmctbWFya2VyXCIgc3R5bGU9XCJsZWZ0OiAke2xlZnR9JTsgd2lkdGg6ICR7d2lkdGh9JVwiPjwvZGl2PiBcclxuICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtY2FtcGFpZ24tYmFyXCIgXHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPVwibGVmdDogJHtsZWZ0fSU7IHdpZHRoOiAke3dpZHRofSU7IGJhY2tncm91bmQ6ICR7Y29sb3J9OyBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLDAsMCwwLjEpO1wiPlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgIGA7XHJcblxyXG4gICAgICAvLyBUb29sdGlwIGxvZ2ljIGZvciB0aGUgYmFyXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gcXVlcnkgdGhlIG5ld2x5IGFkZGVkIHJvdydzIGJhci4gXHJcbiAgICAgICAgLy8gU2luY2Ugd2UgYXBwZW5kQ2hpbGQocm93KSBsYXRlciwgd2UgY2FuIGF0dGFjaCBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQgJ3JvdycgYmVmb3JlIGFwcGVuZGluZz9cclxuICAgICAgICAvLyBXYWl0LCB0aGUgcm93IGlzIGNyZWF0ZWQgdmlhIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpIHRoZW4gYXBwZW5kZWQuXHJcbiAgICAgICAgLy8gU28gd2UgY2FuIGZpbmQgdGhlIGJhciBpbnNpZGUgJ3JvdycgaW1tZWRpYXRlbHkuXHJcbiAgICAgICAgY29uc3QgYmFyID0gcm93LnF1ZXJ5U2VsZWN0b3IoJy5mYi1hZHMtY2FtcGFpZ24tYmFyJyk7XHJcbiAgICAgICAgaWYgKGJhcikge1xyXG4gICAgICAgICAgYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKGNhbXBhaWduLmZpcnN0QWR2ZXJ0aXNlZCkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZShjYW1wYWlnbi5sYXN0QWR2ZXJ0aXNlZCkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICB0b29sdGlwLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10b29sdGlwLWhlYWRlclwiPkNhbXBhaWduIERldGFpbHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10b29sdGlwLWRhdGVzXCI+JHtzdGFydERhdGV9IOKAlCAke2VuZERhdGV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiZmItYWRzLXRvb2x0aXAtYWN0aW9uXCIgaWQ9XCJmYkFkc1Rvb2x0aXBWaWV3QnRuXCI+Q2xpY2sgdG8gVmlldyBUb3AgNSBBZHM8L2E+XHJcbiAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICAgICAgICAgICAgLy8gQXR0YWNoIGNsaWNrIGxpc3RlbmVyIHRvIHRoZSBsaW5rIGluc2lkZSB0b29sdGlwXHJcbiAgICAgICAgICAgIGNvbnN0IHZpZXdCdG4gPSB0b29sdGlwLnF1ZXJ5U2VsZWN0b3IoJyNmYkFkc1Rvb2x0aXBWaWV3QnRuJyk7XHJcbiAgICAgICAgICAgIGlmICh2aWV3QnRuKSB7XHJcbiAgICAgICAgICAgICAgdmlld0J0bi5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKTtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgLy8gUG9zaXRpb24gdG9vbHRpcCBuZWFyIG1vdXNlIGJ1dCBlbnN1cmUgaXQgc3RheXMgd2l0aGluIHZpZXdwb3J0XHJcbiAgICAgICAgICAgIC8vIEFkZCBzbGlnaHQgb2Zmc2V0IHNvIGl0IGRvZXNuJ3QgZmxpY2tlclxyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS5jbGllbnRYICsgMTU7XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLmNsaWVudFkgKyAxNTtcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0geCArICdweCc7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUudG9wID0geSArICdweCc7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCAwKTtcclxuXHJcbiAgICAgIHJvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgLy8gRG9uJ3Qgb3BlbiBtb2RhbCBpZiBjbGlja2luZyBhIGxpbmtcclxuICAgICAgICBpZiAoZS50YXJnZXQuY2xvc2VzdCgnYScpKSByZXR1cm47XHJcbiAgICAgICAgb3BlbkNhbXBhaWduRGV0YWlscyhjYW1wYWlnbik7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY2hhcnRDb250ZW50LmFwcGVuZENoaWxkKHJvdyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclRvcDVUZXh0KCkge1xyXG4gICAgY29uc3QgY2hhcnRDb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ2hhcnRDb250ZW50Jyk7XHJcbiAgICBjb25zdCBzdWJ0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1N1YnRpdGxlJyk7XHJcbiAgICBzdWJ0aXRsZS50ZXh0Q29udGVudCA9IGBUb3AgNSBhZHMgZm9yICR7c3RhdGUucmF3Q2FtcGFpZ25zLmxlbmd0aH0gY2FtcGFpZ25zYDtcclxuXHJcbiAgICBpZiAoIXN0YXRlLnJhd0NhbXBhaWducyB8fCBzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNoYXJ0Q29udGVudC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImZiLWFkcy1lbXB0eS1zdGF0ZVwiPk5vIGNhbXBhaWduIGRhdGEgYXZhaWxhYmxlPC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBvdXRwdXQgPSAnJztcclxuICAgIGNvbnN0IGNhbXBhaWduc1RvUmVuZGVyID0gcHJvY2Vzc0RhdGEoc3RhdGUucmF3Q2FtcGFpZ25zKTtcclxuXHJcbiAgICBjYW1wYWlnbnNUb1JlbmRlci5mb3JFYWNoKGNhbXBhaWduID0+IHtcclxuICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyKSA9PiBuZXcgRGF0ZShkYXRlU3RyKS50b0RhdGVTdHJpbmcoKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBnZXRBZENvdW50Q29sb3IoY2FtcGFpZ24uYWRzQ291bnQpO1xyXG5cclxuICAgICAgb3V0cHV0ICs9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtY2FtcGFpZ25cIiBzdHlsZT1cImJvcmRlci1sZWZ0OiA0cHggc29saWQgJHtjb2xvcn07XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+JHtjYW1wYWlnbi51cmx9PC9zdHJvbmc+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1tZXRhXCI+XHJcbiAgICAgICAgICAgICR7Zm9ybWF0RGF0ZShjYW1wYWlnbi5maXJzdEFkdmVydGlzZWQpfSDigJQgJHtmb3JtYXREYXRlKGNhbXBhaWduLmxhc3RBZHZlcnRpc2VkKX0gfCBcclxuICAgICAgICAgICAgJHtjYW1wYWlnbi5jYW1wYWlnbkR1cmF0aW9uRGF5c30gZGF5cyB8IFxyXG4gICAgICAgICAgICAke2NhbXBhaWduLmFkc0NvdW50fSBhZHNcclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAke2NhbXBhaWduLnRvcDUgJiYgY2FtcGFpZ24udG9wNS5sZW5ndGggPiAwID8gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWRzXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWxhYmVsXCI+VG9wIDUgQWRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1ncmlkXCI+XHJcbiAgICAgICAgICAgICAgJHtjYW1wYWlnbi50b3A1Lm1hcChhZCA9PiBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWRcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFkLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+TGlicmFyeSBJRDo8L3N0cm9uZz4gXHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHthZC5saWJyYXJ5SWR9XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1saW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAke2FkLmxpYnJhcnlJZH1cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLXRleHQtYWQtbWV0YVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RGF0ZXM6PC9zdHJvbmc+ICR7bmV3IERhdGUoYWQuc3RhcnRpbmdEYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoKX0g4oCUICR7bmV3IERhdGUoYWQuZW5kRGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCl9PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RHVyYXRpb246PC9zdHJvbmc+ICR7YWQuZHVyYXRpb259IGRheXNcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtdGV4dC1hZC1jb3B5XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICR7YWQubWVkaWFUeXBlID09PSAndmlkZW8nXHJcbiAgICAgICAgICA/IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPjx2aWRlbyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBoZWlnaHQ6IGF1dG87IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L3ZpZGVvPjwvZGl2PmBcclxuICAgICAgICAgIDogKGFkLm1lZGlhVHlwZSA9PT0gJ2ltYWdlJyA/IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogOHB4O1wiPjxpbWcgc3JjPVwiJHthZC5tZWRpYVNyY31cIiBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgaGVpZ2h0OiBhdXRvOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC9kaXY+YCA6ICcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkFkIENvcHk6PC9zdHJvbmc+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7YWQuYWRUZXh0IHx8ICdbbm8gY29weV0nfVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIGAgOiAnPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LW5vLWFkc1wiPk5vIHRvcCBhZHMgZGF0YSBhdmFpbGFibGU8L2Rpdj4nfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY2hhcnRDb250ZW50LmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LWFjdGlvbnNcIiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDIwcHg7IGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7IGdhcDogMTBweDtcIj5cclxuICAgICAgICAke3N0YXRlLmFpQ29uZmlnID8gYFxyXG4gICAgICAgIDxidXR0b24gaWQ9XCJmYkFkc0FuYWx5emVCdG5cIiBjbGFzcz1cImZiLWFkcy1idG4gZmItYWRzLWJ0bi1hY3Rpb25cIiBzdHlsZT1cImJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCwgIzEwYjk4MSwgIzA1OTY2OSk7XCI+XHJcbiAgICAgICAgICDwn6SWIEFuYWx5emUgd2l0aCBBSVxyXG4gICAgICAgIDwvYnV0dG9uPmAgOiAnJ31cclxuICAgICAgICA8YnV0dG9uIGlkPVwiZmJBZHNDb3B5QWxsVGV4dEJ0blwiIGNsYXNzPVwiZmItYWRzLWJ0biBmYi1hZHMtYnRuLWFjdGlvblwiPlxyXG4gICAgICAgICAg8J+TiyBDb3B5IEFsbCBUZXh0XHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICAgPGRpdiBpZD1cImZiQWRzQUlSZXN1bHRcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7IG1hcmdpbi1ib3R0b206IDIwcHg7IHBhZGRpbmc6IDE2cHg7IGJhY2tncm91bmQ6ICNmMGZkZjQ7IGJvcmRlcjogMXB4IHNvbGlkICNiYmY3ZDA7IGJvcmRlci1yYWRpdXM6IDhweDsgY29sb3I6ICMxNjY1MzQ7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcIj48L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy10ZXh0LW91dHB1dFwiPiR7b3V0cHV0fTwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICAvLyBSZXN0b3JlIEFJIFJlc3VsdCBpZiBleGlzdHNcclxuICAgIGNvbnN0IHJlc3VsdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FJUmVzdWx0Jyk7XHJcbiAgICBpZiAoc3RhdGUuYWlBbmFseXNpc1Jlc3VsdCkge1xyXG4gICAgICAvLyBNYXJrZG93biBjb252ZXJzaW9uIHNpbXBsZSByZXBsYWNlbWVudCBmb3IgYm9sZC9uZXdsaW5lc1xyXG4gICAgICAvLyBFbnN1cmUgY29uc2lzdGVuY3kgd2l0aCBhbmFseXplV2l0aEFJIGZvcm1hdHRpbmdcclxuICAgICAgcmVzdWx0RGl2LmlubmVySFRNTCA9IGA8c3Ryb25nPvCfpJYgQUkgQW5hbHlzaXMgKFNhdmVkKTo8L3N0cm9uZz48YnI+PGJyPiR7c3RhdGUuYWlBbmFseXNpc1Jlc3VsdH1gO1xyXG4gICAgICByZXN1bHREaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHN0YXRlLmFpQ29uZmlnKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhbmFseXplV2l0aEFJKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNDb3B5QWxsVGV4dEJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZiLWFkcy10ZXh0LW91dHB1dCcpO1xyXG4gICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gMS4gVGVtcG9yYXJpbHkgaGlkZSBtZWRpYVxyXG4gICAgICBjb25zdCBtZWRpYSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdpbWcsIHZpZGVvJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsRGlzcGxheXMgPSBbXTtcclxuICAgICAgbWVkaWEuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgb3JpZ2luYWxEaXNwbGF5cy5wdXNoKGVsLnN0eWxlLmRpc3BsYXkpO1xyXG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gMi4gU2VsZWN0IGNvbnRlbnRcclxuICAgICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhjb250YWluZXIpO1xyXG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XHJcblxyXG4gICAgICAvLyAzLiBDb3B5XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzQ29weUFsbFRleHRCdG4nKTtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBidG4udGV4dENvbnRlbnQ7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ+KchSBDb3BpZWQhJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcclxuICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignQ29weSBmYWlsZWQ6JywgZXJyKTtcclxuICAgICAgICBhbGVydCgnQ29weSBmYWlsZWQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gNC4gQ2xlYW51cFxyXG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICAgIG1lZGlhLmZvckVhY2goKGVsLCBpKSA9PiB7XHJcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IG9yaWdpbmFsRGlzcGxheXNbaV07XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvcGVuQ2FtcGFpZ25EZXRhaWxzKGNhbXBhaWduKSB7XHJcbiAgICBpZiAoIWNhbXBhaWduLnRvcDUgfHwgY2FtcGFpZ24udG9wNS5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICBsZXQgY29udGVudCA9IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWxpc3RcIj5gO1xyXG5cclxuICAgIGNhbXBhaWduLnRvcDUuZm9yRWFjaCgoYWQsIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZVN0cikgPT4gbmV3IERhdGUoZGF0ZVN0cikudG9EYXRlU3RyaW5nKCk7XHJcbiAgICAgIGNvbnRlbnQgKz0gYFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1jYXJkXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1hZC1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtcmFua1wiPlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1yYW5rLW51bWJlclwiPiMke2luZGV4ICsgMX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1sYWJlbFwiPkxpYnJhcnkgSUQ8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hZHMvbGlicmFyeS8/aWQ9JHthZC5saWJyYXJ5SWR9XCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJmYi1hZHMtbGlicmFyeS1pZC1saW5rXCI+JHthZC5saWJyYXJ5SWR9PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtZHVyYXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtZHVyYXRpb24tbGFiZWxcIj5EdXJhdGlvbjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZiLWFkcy1kdXJhdGlvbi12YWx1ZVwiPiR7YWQuZHVyYXRpb259IGRheXM8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtbW9kYWwtbWV0YVwiPiR7Zm9ybWF0RGF0ZShhZC5zdGFydGluZ0RhdGUpfSAtICR7Zm9ybWF0RGF0ZShhZC5lbmREYXRlKX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1zZWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgJHthZC5tZWRpYVR5cGUgPT09ICd2aWRlbydcclxuICAgICAgICAgID8gYDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtaW1hZ2VcIiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDEycHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj48dmlkZW8gc3JjPVwiJHthZC5tZWRpYVNyY31cIiBjb250cm9scyBzdHlsZT1cIm1heC13aWR0aDogMTAwJTsgbWF4LWhlaWdodDogMzAwcHg7IGJvcmRlci1yYWRpdXM6IDZweDsgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKTtcIj48L3ZpZGVvPjwvZGl2PmBcclxuICAgICAgICAgIDogKGFkLm1lZGlhVHlwZSA9PT0gJ2ltYWdlJyA/IGA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWltYWdlXCIgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxMnB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+PGltZyBzcmM9XCIke2FkLm1lZGlhU3JjfVwiIHN0eWxlPVwibWF4LXdpZHRoOiAxMDAlOyBtYXgtaGVpZ2h0OiAzMDBweDsgYm9yZGVyLXJhZGl1czogNnB4OyBib3gtc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpO1wiPjwvZGl2PmAgOiAnJylcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmItYWRzLWFkLWNvcHktaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weS1sYWJlbFwiPkFkIENvcHk8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZiLWFkcy1jb3B5LWJ0blwiIFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtY29weS10ZXh0PVwiJHtlbmNvZGVVUklDb21wb25lbnQoYWQuYWRUZXh0IHx8ICcnKX1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtdXJsPVwiJHtlbmNvZGVVUklDb21wb25lbnQoY2FtcGFpZ24udXJsKX1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtY2FtcGFpZ24tZHVyYXRpb249XCIke2NhbXBhaWduLmNhbXBhaWduRHVyYXRpb25EYXlzfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1jYW1wYWlnbi1hZHM9XCIke2NhbXBhaWduLmFkc0NvdW50fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1saWItaWQ9XCIke2FkLmxpYnJhcnlJZH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtYWQtZHVyYXRpb249XCIke2FkLmR1cmF0aW9ufVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1hZC1kYXRlcz1cIiR7Zm9ybWF0RGF0ZShhZC5zdGFydGluZ0RhdGUpfSDigJQgJHtmb3JtYXREYXRlKGFkLmVuZERhdGUpfVwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICDwn5OLIENvcHlcclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYi1hZHMtYWQtY29weVwiPiR7YWQuYWRUZXh0IHx8ICdbTm8gY29weSBhdmFpbGFibGVdJ308L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgYDtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnRlbnQgKz0gYDwvZGl2PmA7XHJcbiAgICBzaG93TW9kYWwoY29udGVudCwgYCR7Y2FtcGFpZ24udXJsfWAsIGAke2NhbXBhaWduLmFkc0NvdW50fSB0b3RhbCBhZHMg4oCiICR7Y2FtcGFpZ24uY2FtcGFpZ25EdXJhdGlvbkRheXN9IGRheXMgYWN0aXZlYCk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gRGF0YSBNYW5hZ2VtZW50IC0tLVxyXG5cclxuICBmdW5jdGlvbiBkb3dubG9hZERhdGEoKSB7XHJcbiAgICAvLyBHZW5lcmF0ZSBmaWxlbmFtZSBwcm9wZXJ0aWVzXHJcbiAgICBjb25zdCBhZHZlcnRpc2VyID0gKHN0YXRlLm1ldGFkYXRhPy5hZHZlcnRpc2VyTmFtZSB8fCAnZmJfYWRzX2FuYWx5c2lzJylcclxuICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxyXG4gICAgICAucmVwbGFjZSgvKF4tfC0kKS9nLCAnJyk7XHJcblxyXG4gICAgY29uc3QgY291bnQgPSBzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RoO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBkYXRlIHJhbmdlIGZyb20gYWxsIGNhbXBhaWduc1xyXG4gICAgbGV0IG1pbkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IG1heERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuXHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgaWYgKGMuZmlyc3RBZHZlcnRpc2VkIDwgbWluRGF0ZSkgbWluRGF0ZSA9IGMuZmlyc3RBZHZlcnRpc2VkO1xyXG4gICAgICBpZiAoYy5sYXN0QWR2ZXJ0aXNlZCA+IG1heERhdGUpIG1heERhdGUgPSBjLmxhc3RBZHZlcnRpc2VkO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGVscGVyIGZvciBkYXRlIGZvcm1hdHRpbmcgbGlrZSBcImphbi0xLTIwMjVcIlxyXG4gICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkKSA9PiB7XHJcbiAgICAgIGNvbnN0IG0gPSBbXCJqYW5cIiwgXCJmZWJcIiwgXCJtYXJcIiwgXCJhcHJcIiwgXCJtYXlcIiwgXCJqdW5cIiwgXCJqdWxcIiwgXCJhdWdcIiwgXCJzZXBcIiwgXCJvY3RcIiwgXCJub3ZcIiwgXCJkZWNcIl07XHJcbiAgICAgIHJldHVybiBgJHttW2QuZ2V0TW9udGgoKV19LSR7ZC5nZXREYXRlKCl9LSR7ZC5nZXRGdWxsWWVhcigpfWA7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0U3RyID0gZm9ybWF0RGF0ZShtaW5EYXRlKTtcclxuICAgIGNvbnN0IGVuZFN0ciA9IGZvcm1hdERhdGUobWF4RGF0ZSk7XHJcblxyXG4gICAgLy8gRmlsZW5hbWU6IHBlbmctam9vbi1mYi1hZHMtOC1jYW1wYWlnbnMtZnJvbS1qYW4tMS0yMDI1LXRvLWRlYy0yNC0yMDI1Lmpzb25cclxuICAgIGNvbnN0IGZpbGVuYW1lID0gYCR7YWR2ZXJ0aXNlcn0tZmItYWRzLSR7Y291bnR9LWNhbXBhaWducy1mcm9tLSR7c3RhcnRTdHJ9LXRvLSR7ZW5kU3RyfS5qc29uYDtcclxuXHJcbiAgICBjb25zdCBkYXRhU3RyID0gXCJkYXRhOnRleHQvanNvbjtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgY2FtcGFpZ25zOiBzdGF0ZS5yYXdDYW1wYWlnbnMsXHJcbiAgICAgIGFsbEFkczogc3RhdGUuYWxsQWRzLFxyXG4gICAgICBtZXRhZGF0YTogc3RhdGUubWV0YWRhdGEgfHwgeyBhZHZlcnRpc2VyTmFtZTogYWR2ZXJ0aXNlciB9IC8vIEZhbGxiYWNrIG1ldGFkYXRhXHJcbiAgICB9LCBudWxsLCAyKSk7XHJcblxyXG4gICAgY29uc3QgZG93bmxvYWRBbmNob3JOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgZGF0YVN0cik7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb3dubG9hZEFuY2hvck5vZGUpO1xyXG4gICAgZG93bmxvYWRBbmNob3JOb2RlLmNsaWNrKCk7XHJcbiAgICBkb3dubG9hZEFuY2hvck5vZGUucmVtb3ZlKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVGaWxlSW1wb3J0KGV2ZW50KSB7XHJcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzWzBdO1xyXG4gICAgaWYgKCFmaWxlKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGUudGFyZ2V0LnJlc3VsdCk7XHJcbiAgICAgICAgaWYgKCFqc29uLmNhbXBhaWducykgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmb3JtYXRcIik7XHJcbiAgICAgICAgbG9hZEltcG9ydGVkRGF0YShqc29uKTtcclxuICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yIGltcG9ydGluZyBmaWxlOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2FkSW1wb3J0ZWREYXRhKGltcG9ydGVkRGF0YSkge1xyXG4gICAgc3RhdGUucmF3Q2FtcGFpZ25zID0gaW1wb3J0ZWREYXRhLmNhbXBhaWducyB8fCBbXTtcclxuICAgIHN0YXRlLmFsbEFkcyA9IGltcG9ydGVkRGF0YS5hbGxBZHMgfHwgW107XHJcbiAgICBzdGF0ZS5tZXRhZGF0YSA9IGltcG9ydGVkRGF0YS5tZXRhZGF0YSB8fCBudWxsO1xyXG5cclxuICAgIC8vIFBhcnNlIGRhdGVzXHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgYy5maXJzdEFkdmVydGlzZWQgPSBuZXcgRGF0ZShjLmZpcnN0QWR2ZXJ0aXNlZCk7XHJcbiAgICAgIGMubGFzdEFkdmVydGlzZWQgPSBuZXcgRGF0ZShjLmxhc3RBZHZlcnRpc2VkKTtcclxuICAgICAgaWYgKGMudG9wNSkge1xyXG4gICAgICAgIGMudG9wNS5mb3JFYWNoKGFkID0+IHtcclxuICAgICAgICAgIC8vIENoZWNrIGlmIGRhdGUgc3RyaW5ncyBvciBvYmplY3RzXHJcbiAgICAgICAgICBhZC5zdGFydGluZ0RhdGUgPSBuZXcgRGF0ZShhZC5zdGFydGluZ0RhdGUpO1xyXG4gICAgICAgICAgYWQuZW5kRGF0ZSA9IG5ldyBEYXRlKGFkLmVuZERhdGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJbml0aWFsIFNvcnRcclxuICAgIHN0YXRlLnJhd0NhbXBhaWducy5zb3J0KChhLCBiKSA9PiBuZXcgRGF0ZShiLmZpcnN0QWR2ZXJ0aXNlZCkgLSBuZXcgRGF0ZShhLmZpcnN0QWR2ZXJ0aXNlZCkpO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc1N0YXR1c1RleHQnKS50ZXh0Q29udGVudCA9XHJcbiAgICAgIGBMb2FkZWQgJHtzdGF0ZS5yYXdDYW1wYWlnbnMubGVuZ3RofSBjYW1wYWlnbnNgO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZiQWRzU3Bpbm5lcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgdXBkYXRlVmlldygpO1xyXG4gICAgc2hvd092ZXJsYXkoKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBBSSBMb2dpYyAoQ1NQIEZpeGVkKSAtLS1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gYW5hbHl6ZVdpdGhBSSgpIHtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FuYWx5emVCdG4nKTtcclxuICAgIGNvbnN0IHJlc3VsdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc0FJUmVzdWx0Jyk7XHJcblxyXG4gICAgaWYgKCFzdGF0ZS5haUNvbmZpZyB8fCAhc3RhdGUuYWlDb25maWcuYXBpS2V5KSB7XHJcbiAgICAgIGFsZXJ0KCdBSSBDb25maWd1cmF0aW9uIG1pc3NpbmcuIFBsZWFzZSBjaGVjayBkYXRhYmFzZSBzZXR0aW5ncy4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXppbmcuLi4nO1xyXG4gICAgcmVzdWx0RGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgLy8gQ29sbGVjdCBhbGwgYWQgdGV4dHNcclxuICAgIGxldCBhbGxBZFRleHRzID0gW107XHJcbiAgICBzdGF0ZS5yYXdDYW1wYWlnbnMuZm9yRWFjaChjID0+IHtcclxuICAgICAgaWYgKGMudG9wNSkge1xyXG4gICAgICAgIGMudG9wNS5mb3JFYWNoKGFkID0+IHtcclxuICAgICAgICAgIGlmIChhZC5hZFRleHQgJiYgYWQuYWRUZXh0Lmxlbmd0aCA+IDEwKSB7XHJcbiAgICAgICAgICAgIGFsbEFkVGV4dHMucHVzaChhZC5hZFRleHQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBhbmQgbGltaXRcclxuICAgIGFsbEFkVGV4dHMgPSBbLi4ubmV3IFNldChhbGxBZFRleHRzKV0uc2xpY2UoMCwgNTApO1xyXG5cclxuICAgIGlmIChhbGxBZFRleHRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBhbGVydCgnTm8gYWQgdGV4dCBjb250ZW50IGZvdW5kIHRvIGFuYWx5emUuJyk7XHJcbiAgICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXplIHdpdGggQUknO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gc3RhdGUuYWlDb25maWcuc3lzdGVtUHJvbXB0IHx8IFwiWW91IGFyZSBhbiBleHBlcnQgbWFya2V0aW5nIGFuYWx5c3QuIEFuYWx5emUgdGhlc2UgRmFjZWJvb2sgYWQgY29waWVzIGFuZCBpZGVudGlmeSBjb21tb24gaG9va3MsIHBhaW4gcG9pbnRzIGFkZHJlc3NlZCwgYW5kIENUQXMgdXNlZC4gUHJvdmlkZSBhIGNvbmNpc2UgYnVsbGV0ZWQgc3VtbWFyeSBvZiB0aGUgc3RyYXRlZ3kuXCI7XHJcbiAgICBjb25zdCB1c2VyQ29udGVudCA9IFwiQW5hbHl6ZSB0aGUgZm9sbG93aW5nIGFkIGNvcGllczpcXG5cXG5cIiArIGFsbEFkVGV4dHMuam9pbihcIlxcblxcbi0tLVxcblxcblwiKTtcclxuXHJcbiAgICAvLyBEZWZpbmUgcmVzcG9uc2UgaGFuZGxlclxyXG4gICAgY29uc3QgaGFuZGxlUmVzcG9uc2UgPSAoZSkgPT4ge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGUuZGV0YWlsO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmYkFkc0FuYWx5emVSZXNwb25zZScsIGhhbmRsZVJlc3BvbnNlKTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgLy8gTWFya2Rvd24gY29udmVyc2lvbiBzaW1wbGUgcmVwbGFjZW1lbnQgZm9yIGJvbGQvbmV3bGluZXMgaWYgbmVlZGVkLCBcclxuICAgICAgICAvLyBidXQgaW5uZXJIVE1MIHByZXNlcnZlcyBiYXNpYyBmb3JtYXR0aW5nIG1vc3RseS5cclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSByZXNwb25zZS5hbmFseXNpcy5yZXBsYWNlKC9cXG4vZywgJzxicj4nKS5yZXBsYWNlKC9cXCpcXCooLio/KVxcKlxcKi9nLCAnPHN0cm9uZz4kMTwvc3Ryb25nPicpO1xyXG4gICAgICAgIHN0YXRlLmFpQW5hbHlzaXNSZXN1bHQgPSBmb3JtYXR0ZWQ7IC8vIFNhdmUgc3RhdGVcclxuICAgICAgICByZXN1bHREaXYuaW5uZXJIVE1MID0gYDxzdHJvbmc+8J+kliBBSSBBbmFseXNpczo8L3N0cm9uZz48YnI+PGJyPiR7Zm9ybWF0dGVkfWA7XHJcbiAgICAgICAgcmVzdWx0RGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gcmVzcG9uc2UgPyAocmVzcG9uc2UuZXJyb3IgfHwgJ1Vua25vd24gZXJyb3InKSA6ICdVbmtub3duIGVycm9yJztcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdBSSBBbmFseXNpcyBmYWlsZWQ6JywgZXJyb3JNc2cpO1xyXG4gICAgICAgIGFsZXJ0KCdBbmFseXNpcyBmYWlsZWQ6ICcgKyBlcnJvck1zZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAn8J+kliBBbmFseXplIHdpdGggQUknO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBMaXN0ZW4gZm9yIHJlc3BvbnNlXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc0FuYWx5emVSZXNwb25zZScsIGhhbmRsZVJlc3BvbnNlKTtcclxuXHJcbiAgICAvLyBEaXNwYXRjaCByZXF1ZXN0IHRvIGNvbnRlbnQgc2NyaXB0IC0+IGJhY2tncm91bmRcclxuICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFZpc3VhbGl6ZXJdIERpc3BhdGNoaW5nIEFJIGFuYWx5c2lzIHJlcXVlc3QnKTtcclxuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdmYkFkc0FuYWx5emVSZXF1ZXN0Jywge1xyXG4gICAgICBkZXRhaWw6IHtcclxuICAgICAgICBhcGlLZXk6IHN0YXRlLmFpQ29uZmlnLmFwaUtleSxcclxuICAgICAgICBzeXN0ZW1Qcm9tcHQ6IHN5c3RlbVByb21wdCxcclxuICAgICAgICB1c2VyQ29udGVudDogdXNlckNvbnRlbnRcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIC8vIEZhbGxiYWNrL1RpbWVvdXQgY2xlYW51cFxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChidG4uZGlzYWJsZWQgJiYgYnRuLnRleHRDb250ZW50ID09PSAn8J+kliBBbmFseXppbmcuLi4nKSB7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZmJBZHNBbmFseXplUmVzcG9uc2UnLCBoYW5kbGVSZXNwb25zZSk7XHJcbiAgICAgICAgYnRuLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ/CfpJYgQW5hbHl6ZSB3aXRoIEFJJztcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1tGQiBBZHMgVmlzdWFsaXplcl0gQUkgcmVxdWVzdCB0aW1lZCBvdXQnKTtcclxuICAgICAgfVxyXG4gICAgfSwgNjAwMDApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIC0tLSBFdmVudCBCcmlkZ2UgLS0tXHJcblxyXG4gIC8vIExpc3RlbiBmb3IgaW1wb3J0ZWQgZGF0YSB2aWEgQ3VzdG9tRXZlbnQgKGZyb20gaW5qZWN0ZWQuanMpXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNJbXBvcnREYXRhJywgKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBSZWNlaXZlZCBpbXBvcnRlZCBkYXRhIHZpYSBDdXN0b21FdmVudCcpO1xyXG4gICAgbG9hZEltcG9ydGVkRGF0YShldmVudC5kZXRhaWwpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIHJlb3BlbiByZXF1ZXN0XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNSZW9wZW4nLCAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBSZW9wZW5pbmcgb3ZlcmxheScpO1xyXG4gICAgc2hvd092ZXJsYXkoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciBBSSBDb25maWdcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc0NvbmZpZycsIChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ1tGQiBBZHMgVmlzdWFsaXplcl0gUmVjZWl2ZWQgQUkgQ29uZmlnJyk7XHJcbiAgICBzdGF0ZS5haUNvbmZpZyA9IGV2ZW50LmRldGFpbDtcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciBTY3JhcGluZyBTdGF0dXNcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmYkFkc1N0YXR1cycsIChldmVudCkgPT4ge1xyXG4gICAgY29uc3QgeyBzY3JvbGxpbmcsIGFkc0ZvdW5kLCBtZXNzYWdlIH0gPSBldmVudC5kZXRhaWw7XHJcblxyXG4gICAgLy8gRW5zdXJlIG92ZXJsYXkgaXMgdmlzaWJsZSBidXQgbWluaW1pemVkXHJcbiAgICBpZiAoc2Nyb2xsaW5nKSB7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnbWluaW1pemVkJyk7XHJcbiAgICAgIHN0YXRlLmlzTWluaW1pemVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtaW5CYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pbWl6ZWRCYXInKTtcclxuICAgIGNvbnN0IGljb24gPSBtaW5CYXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy1taW5pLWljb24nKTtcclxuICAgIGNvbnN0IHRleHQgPSBtaW5CYXIucXVlcnlTZWxlY3RvcignLmZiLWFkcy1taW5pLXRleHQnKTtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYkFkc01heGltaXplQnRuJyk7XHJcblxyXG4gICAgaWYgKHNjcm9sbGluZykge1xyXG4gICAgICBpY29uLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cImZiLWFkcy1taW5pLXNwaW5uZXJcIj7wn5SEPC9zcGFuPic7XHJcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgICBtaW5CYXIuc3R5bGUuYmFja2dyb3VuZCA9ICdsaW5lYXItZ3JhZGllbnQodG8gcmlnaHQsICNmNTllMGIsICNkOTc3MDYpJzsgLy8gQW1iZXIgZm9yIGFjdGl2ZVxyXG4gICAgICBidG4uc3R5bGUuZGlzcGxheSA9ICdub25lJzsgLy8gSGlkZSBcIlNob3dcIiBidXR0b24gd2hpbGUgc2NyYXBpbmdcclxuXHJcbiAgICAgIC8vIEFkZCBzcGlubmVyIHN0eWxlIGlmIG5vdCBleGlzdHNcclxuICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJykpIHtcclxuICAgICAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgc3R5bGUuaWQgPSAnZmJBZHNNaW5pU3Bpbm5lclN0eWxlJztcclxuICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcclxuICAgICAgICAgICAgICAgIEBrZXlmcmFtZXMgZmJBZHNTcGluIHsgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH0gfVxyXG4gICAgICAgICAgICAgICAgLmZiLWFkcy1taW5pLXNwaW5uZXIgeyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGFuaW1hdGlvbjogZmJBZHNTcGluIDFzIGxpbmVhciBpbmZpbml0ZTsgfVxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBEb25lXHJcbiAgICAgIGljb24uaW5uZXJIVE1MID0gJ/Cfjq8nO1xyXG4gICAgICB0ZXh0LnRleHRDb250ZW50ID0gJ0FuYWx5c2lzIFJlYWR5ISc7XHJcbiAgICAgIG1pbkJhci5zdHlsZS5iYWNrZ3JvdW5kID0gJyc7IC8vIFJldmVydCB0byBkZWZhdWx0IGJsdWUvcHVycGxlXHJcbiAgICAgIGJ0bi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gRXhwb3NlIHJlb3BlbiBoZWxwZXJcclxuICB3aW5kb3cuZmJBZHNSZW9wZW5PdmVybGF5ID0gc2hvd092ZXJsYXk7XHJcblxyXG4gIC8vIENoZWNrIGZvciBwcmUtaW5qZWN0ZWQgZGF0YSAoZnJvbSBmaWxlIGltcG9ydClcclxuICBjb25zdCBwcmVJbmplY3RlZERhdGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmJBZHNJbXBvcnRlZERhdGEnKTtcclxuICBpZiAocHJlSW5qZWN0ZWREYXRhKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShwcmVJbmplY3RlZERhdGEudGV4dENvbnRlbnQpO1xyXG4gICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBWaXN1YWxpemVyXSBGb3VuZCBwcmUtaW5qZWN0ZWQgZGF0YSwgbG9hZGluZy4uLicpO1xyXG4gICAgICBsb2FkSW1wb3J0ZWREYXRhKGpzb24pO1xyXG4gICAgICAvLyBDbGVhbiB1cFxyXG4gICAgICBwcmVJbmplY3RlZERhdGEucmVtb3ZlKCk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGQiBBZHMgVmlzdWFsaXplcl0gRXJyb3IgbG9hZGluZyBwcmUtaW5qZWN0ZWQgZGF0YTonLCBlKTtcclxuICAg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

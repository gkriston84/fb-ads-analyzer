(function(){console.log("[FB Ads Visualizer] Loaded");let i={rawCampaigns:[],allAds:[],sortBy:"start",groupByDomain:!1,isMinimized:!0,currentView:"timeline",isAnalyzing:!1};function T(){if(document.getElementById("fbAdsAnalyzerOverlay"))return;const t=document.createElement("div");t.id="fbAdsAnalyzerOverlay",t.className="minimized",t.innerHTML=`
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
    `,document.body.appendChild(t),$()}function $(){document.getElementById("fbAdsMinimizeBtn").addEventListener("click",g),document.getElementById("fbAdsMaximizeBtn").addEventListener("click",f),document.getElementById("fbAdsMinimizedBar").addEventListener("click",a=>{a.target.closest("button")||f()}),document.getElementById("fbAdsCloseBtn").addEventListener("click",E),document.getElementById("fbAdsMinimizedCloseBtn").addEventListener("click",E),document.querySelectorAll("[data-view]").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll("[data-view]").forEach(s=>s.classList.remove("active")),a.classList.add("active"),i.currentView=a.dataset.view,p()})}),document.querySelectorAll("[data-sort]").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll("[data-sort]").forEach(s=>s.classList.remove("active")),a.classList.add("active"),i.sortBy=a.dataset.sort,h()})}),document.getElementById("fbAdsGroupBtn").addEventListener("click",()=>{i.groupByDomain=!i.groupByDomain;const a=document.getElementById("fbAdsGroupBtn");i.groupByDomain?(a.classList.add("active"),a.textContent="✓ Grouped"):(a.classList.remove("active"),a.textContent="Group by Domain"),h()}),document.getElementById("fbAdsRestartBtn").addEventListener("click",I),document.getElementById("fbAdsDownloadBtn").addEventListener("click",z),document.getElementById("fbAdsImportBtn").addEventListener("click",()=>{document.getElementById("fbAdsFileInput").click()}),document.getElementById("fbAdsFileInput").addEventListener("change",k),document.getElementById("fbAdsModalClose").addEventListener("click",L),document.getElementById("fbAdsModalOverlay").addEventListener("click",a=>{a.target.id==="fbAdsModalOverlay"&&L()});const t=document.getElementById("fbAdsModalBody");t&&t.addEventListener("click",a=>{const s=a.target.closest(".fb-ads-copy-btn");if(s&&s.dataset.copyText){const d=decodeURIComponent(s.dataset.copyText);if(!d)return;navigator.clipboard.writeText(d).then(()=>{const e=s.innerHTML;s.innerHTML="✅ Copied!",s.classList.add("success"),setTimeout(()=>{s.innerHTML=e,s.classList.remove("success")},2e3)}).catch(e=>{console.error("Failed to copy:",e)})}})}function g(){i.isMinimized=!0,document.getElementById("fbAdsAnalyzerOverlay").classList.add("minimized")}function f(){i.isMinimized=!1,document.getElementById("fbAdsAnalyzerOverlay").classList.remove("minimized")}function E(){document.getElementById("fbAdsAnalyzerOverlay").classList.add("hidden")}function u(){document.getElementById("fbAdsAnalyzerOverlay").classList.remove("hidden"),!i.isMinimized&&f()}function I(){if(i.isAnalyzing){alert("Analysis already in progress. Please wait for it to complete.");return}i.rawCampaigns=[],i.allAds=[],i.isAnalyzing=!0,document.getElementById("fbAdsSubtitle").textContent="Scraping in progress...",r("🔄 Restarting analysis..."),g(),window.fbAdsAnalyzer&&window.fbAdsAnalyzer.runFullAnalysis?window.fbAdsAnalyzer.runFullAnalysis():(r("❌ Error: Analyzer not found. Refresh page and try again."),i.isAnalyzing=!1)}function z(){const t={campaigns:i.rawCampaigns,allAds:i.allAds,exportedAt:new Date().toISOString(),version:"2.0"},a=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),s=URL.createObjectURL(a),d=document.createElement("a"),e=document.querySelector('input[placeholder*="Search by"]').value.toLowerCase().replaceAll(" ","-"),n=document.getElementById("fbAdsSubtitle").innerText.toLowerCase().replaceAll(",","").replaceAll(" ","-");d.href=s,d.download=`${e}-fb-ads-${n}.json`,d.click(),URL.revokeObjectURL(s),r("✅ Data downloaded successfully!"),setTimeout(v,2e3)}function k(t){const a=t.target.files[0];if(!a)return;const s=new FileReader;s.onload=d=>{try{const e=JSON.parse(d.target.result);e.campaigns&&Array.isArray(e.campaigns)?(i.rawCampaigns=e.campaigns,i.allAds=e.allAds||[],r(`✅ Imported ${i.rawCampaigns.length} campaigns!`),setTimeout(v,2e3),A(),f(),p()):r("❌ Invalid data format. Expected campaigns array.")}catch(e){r("❌ Failed to parse JSON file: "+e.message)}},s.readAsText(a),t.target.value=""}function r(t){document.getElementById("fbAdsStatusText").textContent=t,document.getElementById("fbAdsStatusBar").style.display="flex",document.getElementById("fbAdsMinimizedText").textContent=t;const a=t.includes("...")||t.includes("🔄");document.getElementById("fbAdsMinimizedSpinner").style.display=a?"block":"none"}function v(){document.getElementById("fbAdsStatusBar").style.display="none"}function A(){document.getElementById("fbAdsControls").style.display="flex"}function p(){const t=document.getElementById("fbAdsSortGroup"),a=document.getElementById("fbAdsLegend");i.currentView==="timeline"?(t.style.display="flex",a.style.display="flex",h()):i.currentView==="top5-text"&&(t.style.display="none",a.style.display="none",S())}function S(){var s;const t=document.getElementById("fbAdsChartContent");if(!i.rawCampaigns||i.rawCampaigns.length===0){t.innerHTML='<div class="fb-ads-empty-state">No campaign data available</div>';return}document.getElementById("fbAdsSubtitle").textContent=`Top 5 ads for ${i.rawCampaigns.length} campaigns`;let a="";i.rawCampaigns.forEach(d=>{const e=n=>new Date(n).toDateString();a+=`
        <div class="fb-ads-text-campaign">
          <div class="fb-ads-text-header">
            <strong>${d.url}</strong>
          </div>
          <div class="fb-ads-text-meta">
            ${e(d.firstAdvertised)} — ${e(d.lastAdvertised)} | 
            ${d.campaignDurationDays} days | 
            ${d.adsCount} ads
          </div>
          
          ${d.top5&&d.top5.length>0?`
            <div class="fb-ads-text-ads">
              <div class="fb-ads-text-label">Top 5 Ads</div>
              <div class="fb-ads-grid">
              ${d.top5.map(n=>`
                <div class="fb-ads-text-ad">
                  <div class="fb-ads-text-ad-header">
                    <strong>Library ID:</strong> 
                    <a href="https://www.facebook.com/ads/library/?id=${n.libraryId}" 
                       target="_blank" 
                       class="fb-ads-library-id-link">
                      ${n.libraryId}
                    </a>
                  </div>
                  <div class="fb-ads-text-ad-meta">
                    <strong>Dates:</strong> ${n.startingDate} — ${n.endDate}<br>
                    <strong>Duration:</strong> ${n.duration} days
                  </div>
                  <div class="fb-ads-text-ad-copy">
                    ${n.mediaType==="video"?`<div style="margin-bottom: 8px;"><video src="${n.mediaSrc}" controls style="max-width: 100%; height: auto; border-radius: 4px;"></video></div>`:n.mediaType==="image"?`<div style="margin-bottom: 8px;"><img src="${n.mediaSrc}" style="max-width: 100%; height: auto; border-radius: 4px;"></div>`:""}
                    <strong>Ad Copy:</strong><br>
                    ${n.adText||"[no copy]"}
                  </div>
                </div>
              `).join("")}
              </div>
            </div>
          `:'<div class="fb-ads-text-no-ads">No top ads data available</div>'}
        </div>
      `}),t.innerHTML=`
      <div class="fb-ads-text-actions" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
        <button id="fbAdsCopyAllTextBtn" class="fb-ads-btn fb-ads-btn-action">
          📋 Copy All Text
        </button>
      </div>
      <div class="fb-ads-text-output">${a}</div>
    `,(s=document.getElementById("fbAdsCopyAllTextBtn"))==null||s.addEventListener("click",()=>{const d=i.rawCampaigns.map(e=>{let n=`Campaign: ${e.url}
Dates: ${b(e.firstAdvertised)} - ${b(e.lastAdvertised)}

`;return e.top5&&e.top5.length>0?n+=e.top5.map((o,l)=>`Ad #${l+1} (Duration: ${o.duration} days)
${o.adText||"[No copy]"}
`).join(`
---

`):n+=`[No top ads data]
`,n}).join(`
==========================================

`);navigator.clipboard.writeText(d).then(()=>{const e=document.getElementById("fbAdsCopyAllTextBtn"),n=e.innerHTML;e.innerHTML="✅ Copied All!",setTimeout(()=>{e.innerHTML=n},2e3)})})}function b(t){return new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}function O(t){return t>=100?"#ef4444":t>=50?"#f97316":t>=20?"#eab308":t>=10?"#22c55e":t>=5?"#3b82f6":"#8b5cf6"}function U(t){try{return new URL(t).hostname.replace("www.","")}catch{return t.split("/")[0]}}function R(t){return t.map(a=>({url:a.url.replace("https://","").replace("http://",""),firstAdvertised:a.firstAdvertised.split("T")[0],lastAdvertised:a.lastAdvertised.split("T")[0],campaignDurationDays:a.campaignDurationDays,adsUsingUrl:a.adsCount,top5:a.top5||[]}))}function C(t,a){const s=[...t];return a==="start"?s.sort((d,e)=>new Date(d.firstAdvertised)-new Date(e.firstAdvertised)):a==="duration"?s.sort((d,e)=>e.campaignDurationDays-d.campaignDurationDays):a==="ads"&&s.sort((d,e)=>e.adsUsingUrl-d.adsUsingUrl),s}function F(t,a){const s={};t.forEach(e=>{const n=U(e.url);s[n]||(s[n]=[]),s[n].push(e)}),Object.keys(s).forEach(e=>{s[e]=C(s[e],a)});const d=Object.keys(s).sort((e,n)=>{const o=s[e].reduce((c,m)=>c+m.adsUsingUrl,0);return s[n].reduce((c,m)=>c+m.adsUsingUrl,0)-o});return{groups:s,sortedDomains:d}}function H(t,a,s){const d=new Date(t.firstAdvertised),e=new Date(t.lastAdvertised),n=Math.ceil((d-a)/(1e3*60*60*24)),o=Math.ceil((e-d)/(1e3*60*60*24))+1;return{left:`${n/s*100}%`,width:`${o/s*100}%`}}function N(t,a,s){const d=[];let e=new Date(t);for(e.setDate(1);e<=a;){const n=Math.ceil((e-t)/864e5);d.push({date:new Date(e),position:n/s*100}),e.setMonth(e.getMonth()+1)}return d}function h(){if(!i.rawCampaigns||i.rawCampaigns.length===0)return;const t=R(i.rawCampaigns),a=new Date(Math.min(...t.map(l=>new Date(l.firstAdvertised)))),s=new Date(Math.max(...t.map(l=>new Date(l.lastAdvertised)))),d=Math.ceil((s-a)/(1e3*60*60*24)),e=N(a,s,d);document.getElementById("fbAdsSubtitle").textContent=`${t.length} campaigns from ${b(a)} to ${b(s)}`;const n=document.getElementById("fbAdsChartContent");n.innerHTML="";const o=document.createElement("div");if(o.className="fb-ads-timeline-header",o.innerHTML=`
      <div class="fb-ads-timeline-label"></div>
      <div class="fb-ads-timeline-grid">
        ${e.map(l=>`
          <div class="fb-ads-month-marker" style="left: ${l.position}%">
            <div class="fb-ads-month-label">
              ${l.date.toLocaleDateString("en-US",{month:"short",year:"2-digit"})}
            </div>
          </div>
        `).join("")}
      </div>
    `,n.appendChild(o),i.groupByDomain){const{groups:l,sortedDomains:c}=F(t,i.sortBy);c.forEach(m=>{const w=l[m],G=w.reduce((B,_)=>B+_.adsUsingUrl,0),y=document.createElement("div");y.className="fb-ads-domain-group",y.innerHTML=`
          <div class="fb-ads-domain-header">
            <div class="fb-ads-timeline-label">
              <div class="fb-ads-domain-name">${m}</div>
              <div class="fb-ads-domain-stats">${w.length} campaigns • ${G} ads</div>
            </div>
          </div>
        `,w.forEach(B=>{y.appendChild(D(B,a,s,d,e))}),n.appendChild(y)})}else C(t,i.sortBy).forEach(c=>{n.appendChild(D(c,a,s,d,e))})}function D(t,a,s,d,e){const n=document.createElement("div");n.className="fb-ads-campaign-row";const o=H(t,a,d),l=O(t.adsUsingUrl);return n.innerHTML=`
      <div class="fb-ads-campaign-info">
        <div class="fb-ads-campaign-url" title="${t.url}"><a onclick="arguments[0].stopPropagation();" href="https://${t.url}" target="_blank">${t.url}</a></div>
        <a onclick="arguments[0].stopPropagation();" href="https://web.archive.org/web/*/https://${t.url}/*" target="_blank">Archived versions</a>
        <div class="fb-ads-campaign-meta">${t.campaignDurationDays} days • ${t.adsUsingUrl} ads</div>
      </div>
      <div class="fb-ads-campaign-timeline">
        ${e.map(c=>`
          <div class="fb-ads-timeline-bg-marker" style="left: ${c.position}%"></div>
        `).join("")}
        <div class="fb-ads-campaign-bar" style="left: ${o.left}; width: ${o.width}; background-color: ${l};"></div>
      </div>
    `,n.addEventListener("click",c=>{c.target.tagName==="A"||c.target.closest("a")||j(t)}),n}function j(t){const a=document.getElementById("fbAdsModalOverlay"),s=document.getElementById("fbAdsModalBody");document.getElementById("fbAdsModalUrl").textContent=t.url,document.getElementById("fbAdsModalMeta").innerHTML=`
      <div>${b(t.firstAdvertised)} → ${b(t.lastAdvertised)}</div>
      <div style="margin-top: 4px;">${t.campaignDurationDays} days • ${t.adsUsingUrl} ads</div>
    `,t.top5&&t.top5.length>0?s.innerHTML=`
        <div class="fb-ads-modal-section-header">
          <h3 style="font-size: 16px; font-weight: 600; margin: 0; color: #111827;">Top Performing Ads</h3>
          <button id="fbAdsModalCopyAllBtn" class="fb-ads-copy-btn">
            📋 Copy All Ads
          </button>
        </div>
        <div class="fb-ads-list">
          ${t.top5.map((e,n)=>`
            <div class="fb-ads-card">
              <div class="fb-ads-ad-header">
                <div class="fb-ads-ad-rank">
                  <div class="fb-ads-rank-number">#${n+1}</div>
                  <div>
                    <div class="fb-ads-library-id-label">Library ID</div>
                    <a href="https://www.facebook.com/ads/library/?id=${e.libraryId}" 
                       target="_blank" 
                       class="fb-ads-library-id-link">
                      ${e.libraryId}
                    </a>
                  </div>
                </div>
                <div class="fb-ads-ad-duration">
                  <div class="fb-ads-duration-label">Duration</div>
                  <div class="fb-ads-duration-value">${e.duration} days</div>
                </div>
              </div>
              <div class="fb-ads-ad-copy-section">
                ${e.mediaType==="video"?`<div class="fb-ads-ad-image" style="margin-bottom: 12px; text-align: center;"><video src="${e.mediaSrc}" controls style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></video></div>`:e.mediaType==="image"?`<div class="fb-ads-ad-image" style="margin-bottom: 12px; text-align: center;"><img src="${e.mediaSrc}" style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>`:""}
                <div class="fb-ads-ad-copy-header">
                  <div class="fb-ads-ad-copy-label">Ad Copy</div>
                  <button class="fb-ads-copy-btn" data-copy-text="${encodeURIComponent(e.adText||"")}">
                    📋 Copy
                  </button>
                </div>
                <div class="fb-ads-ad-copy">${e.adText||"[No copy available]"}</div>
              </div>
            </div>
          `).join("")}
        </div>
      `:s.innerHTML=`
        <div class="fb-ads-no-ads">
          <div style="font-size: 16px; margin-bottom: 8px; color: #6b7280;">No ad data available</div>
          <div style="font-size: 12px; color: #9ca3af;">Top performing ads not tracked for this campaign</div>
        </div>
      `,a.style.display="flex";const d=document.getElementById("fbAdsModalCopyAllBtn");d&&d.addEventListener("click",()=>{const e=t.top5.map((n,o)=>`Ad #${o+1} (Duration: ${n.duration} days)
${n.adText||"[No copy]"}`).join(`

---

`);navigator.clipboard.writeText(e).then(()=>{const n=d.innerHTML;d.innerHTML="✅ Copied All!",d.classList.add("success"),setTimeout(()=>{d.innerHTML=n,d.classList.remove("success")},2e3)})})}function L(){document.getElementById("fbAdsModalOverlay").style.display="none"}window.addEventListener("message",t=>{t.source===window&&(t.data.type==="FB_ADS_DATA"?(console.log("[FB Ads Visualizer] Received data:",t.data.data),i.rawCampaigns=t.data.data||[],i.allAds=t.data.allAds||[],i.isAnalyzing=!1,i.rawCampaigns.length>0?(r(`✅ Found ${i.rawCampaigns.length} campaigns!`),setTimeout(v,2e3),A(),f(),u(),p()):r("⚠️ No campaigns found. Try different search criteria.")):t.data.type==="FB_ADS_ERROR"&&(r("❌ Error: "+t.data.error),i.isAnalyzing=!1))}),document.addEventListener("fbAdsImportData",t=>{console.log("[FB Ads Visualizer] Received imported data via CustomEvent"),M(t.detail)}),document.addEventListener("fbAdsReopen",()=>{console.log("[FB Ads Visualizer] Reopening overlay"),u()}),window.fbAdsReopenOverlay=u;function M(t){i.rawCampaigns=t.campaigns||[],i.allAds=t.allAds||[],i.isAnalyzing=!1,i.rawCampaigns.length>0?(v(),A(),f(),u(),p(),r(`✅ Imported ${i.rawCampaigns.length} campaigns!`),setTimeout(v,2e3)):r("⚠️ No campaigns in imported data.")}const V=!!document.getElementById("fbAdsAnalyzerOverlay");T();const x=document.getElementById("fbAdsImportedData");if(x){console.log("[FB Ads Visualizer] Found imported data in DOM");try{const t=JSON.parse(x.textContent);x.remove(),M(t)}catch(t){console.error("[FB Ads Visualizer] Error parsing imported data:",t),r("❌ Error parsing imported data")}}else V&&(console.log("[FB Ads Visualizer] Overlay already exists, showing it for new scraping session"),u(),i.isAnalyzing=!0,g()),document.getElementById("fbAdsSubtitle").textContent="Scraping in progress...",r("🔄 Auto-scrolling and extracting ad data...")})();

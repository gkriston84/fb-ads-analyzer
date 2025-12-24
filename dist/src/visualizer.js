(function(){console.log("[FB Ads Visualizer] Loaded");let d={rawCampaigns:[],allAds:[],sortBy:"start",groupByDomain:!1,isMinimized:!0,currentView:"timeline",isAnalyzing:!1};function I(){if(document.getElementById("fbAdsAnalyzerOverlay"))return;const t=document.createElement("div");t.id="fbAdsAnalyzerOverlay",t.className="minimized",t.innerHTML=`
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
    `,document.body.appendChild(t),T()}function T(){document.getElementById("fbAdsMinimizeBtn").addEventListener("click",g),document.getElementById("fbAdsMaximizeBtn").addEventListener("click",f),document.getElementById("fbAdsMinimizedBar").addEventListener("click",a=>{a.target.closest("button")||f()}),document.getElementById("fbAdsCloseBtn").addEventListener("click",C),document.getElementById("fbAdsMinimizedCloseBtn").addEventListener("click",C),document.querySelectorAll("[data-view]").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll("[data-view]").forEach(s=>s.classList.remove("active")),a.classList.add("active"),d.currentView=a.dataset.view,p()})}),document.querySelectorAll("[data-sort]").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll("[data-sort]").forEach(s=>s.classList.remove("active")),a.classList.add("active"),d.sortBy=a.dataset.sort,h()})}),document.getElementById("fbAdsGroupBtn").addEventListener("click",()=>{d.groupByDomain=!d.groupByDomain;const a=document.getElementById("fbAdsGroupBtn");d.groupByDomain?(a.classList.add("active"),a.textContent="✓ Grouped"):(a.classList.remove("active"),a.textContent="Group by Domain"),h()}),document.getElementById("fbAdsRestartBtn").addEventListener("click",z),document.getElementById("fbAdsDownloadBtn").addEventListener("click",$),document.getElementById("fbAdsImportBtn").addEventListener("click",()=>{document.getElementById("fbAdsFileInput").click()}),document.getElementById("fbAdsFileInput").addEventListener("change",k),document.getElementById("fbAdsModalClose").addEventListener("click",L),document.getElementById("fbAdsModalOverlay").addEventListener("click",a=>{a.target.id==="fbAdsModalOverlay"&&L()});const t=document.getElementById("fbAdsModalBody");t&&t.addEventListener("click",a=>{const s=a.target.closest(".fb-ads-copy-btn");if(s&&s.dataset.copyText){const n=decodeURIComponent(s.dataset.copyText);if(!n)return;navigator.clipboard.writeText(n).then(()=>{const e=s.innerHTML;s.innerHTML="✅ Copied!",s.classList.add("success"),setTimeout(()=>{s.innerHTML=e,s.classList.remove("success")},2e3)}).catch(e=>{console.error("Failed to copy:",e)})}})}function g(){d.isMinimized=!0,document.getElementById("fbAdsAnalyzerOverlay").classList.add("minimized")}function f(){d.isMinimized=!1,document.getElementById("fbAdsAnalyzerOverlay").classList.remove("minimized")}function C(){document.getElementById("fbAdsAnalyzerOverlay").classList.add("hidden")}function m(){document.getElementById("fbAdsAnalyzerOverlay").classList.remove("hidden"),!d.isMinimized&&f()}function z(){if(d.isAnalyzing){alert("Analysis already in progress. Please wait for it to complete.");return}d.rawCampaigns=[],d.allAds=[],d.isAnalyzing=!0,document.getElementById("fbAdsSubtitle").textContent="Scraping in progress...",r("🔄 Restarting analysis..."),g(),window.fbAdsAnalyzer&&window.fbAdsAnalyzer.runFullAnalysis?window.fbAdsAnalyzer.runFullAnalysis():(r("❌ Error: Analyzer not found. Refresh page and try again."),d.isAnalyzing=!1)}function $(){const t={campaigns:d.rawCampaigns,allAds:d.allAds,exportedAt:new Date().toISOString(),version:"2.0"},a=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),s=URL.createObjectURL(a),n=document.createElement("a"),e=document.querySelector('input[placeholder*="Search by"]').value.toLowerCase().replaceAll(" ","-"),i=document.getElementById("fbAdsSubtitle").innerText.toLowerCase().replaceAll(",","").replaceAll(" ","-");n.href=s,n.download=`${e}-fb-ads-${i}.json`,n.click(),URL.revokeObjectURL(s),r("✅ Data downloaded successfully!"),setTimeout(v,2e3)}function k(t){const a=t.target.files[0];if(!a)return;const s=new FileReader;s.onload=n=>{try{const e=JSON.parse(n.target.result);e.campaigns&&Array.isArray(e.campaigns)?(d.rawCampaigns=e.campaigns,d.allAds=e.allAds||[],r(`✅ Imported ${d.rawCampaigns.length} campaigns!`),setTimeout(v,2e3),A(),f(),p()):r("❌ Invalid data format. Expected campaigns array.")}catch(e){r("❌ Failed to parse JSON file: "+e.message)}},s.readAsText(a),t.target.value=""}function r(t){document.getElementById("fbAdsStatusText").textContent=t,document.getElementById("fbAdsStatusBar").style.display="flex",document.getElementById("fbAdsMinimizedText").textContent=t;const a=t.includes("...")||t.includes("🔄");document.getElementById("fbAdsMinimizedSpinner").style.display=a?"block":"none"}function v(){document.getElementById("fbAdsStatusBar").style.display="none"}function A(){document.getElementById("fbAdsControls").style.display="flex"}function p(){const t=document.getElementById("fbAdsSortGroup"),a=document.getElementById("fbAdsLegend");d.currentView==="timeline"?(t.style.display="flex",a.style.display="flex",h()):d.currentView==="top5-text"&&(t.style.display="none",a.style.display="none",S())}function S(){var s;const t=document.getElementById("fbAdsChartContent");if(!d.rawCampaigns||d.rawCampaigns.length===0){t.innerHTML='<div class="fb-ads-empty-state">No campaign data available</div>';return}document.getElementById("fbAdsSubtitle").textContent=`Top 5 ads for ${d.rawCampaigns.length} campaigns`;let a="";d.rawCampaigns.forEach(n=>{const e=i=>new Date(i).toDateString();a+=`
        <div class="fb-ads-text-campaign">
          <div class="fb-ads-text-header">
            <strong>${n.url}</strong>
          </div>
          <div class="fb-ads-text-meta">
            ${e(n.firstAdvertised)} — ${e(n.lastAdvertised)} | 
            ${n.campaignDurationDays} days | 
            ${n.adsCount} ads
          </div>
          
          ${n.top5&&n.top5.length>0?`
            <div class="fb-ads-text-ads">
              <div class="fb-ads-text-label">Top 5 Ads</div>
              ${n.top5.map(i=>`
                <div class="fb-ads-text-ad">
                  <div class="fb-ads-text-ad-header">
                    <strong>Library ID:</strong> 
                    <a href="https://www.facebook.com/ads/library/?id=${i.libraryId}" 
                       target="_blank" 
                       class="fb-ads-library-id-link">
                      ${i.libraryId}
                    </a>
                  </div>
                  <div class="fb-ads-text-ad-meta">
                    <strong>Dates:</strong> ${i.startingDate} — ${i.endDate}<br>
                    <strong>Duration:</strong> ${i.duration} days
                  </div>
                  <div class="fb-ads-text-ad-copy">
                    <strong>Ad Copy:</strong><br>
                    ${i.adText||"[no copy]"}
                  </div>
                </div>
              `).join("")}
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
    `,(s=document.getElementById("fbAdsCopyAllTextBtn"))==null||s.addEventListener("click",()=>{const n=d.rawCampaigns.map(e=>{let i=`Campaign: ${e.url}
Dates: ${b(e.firstAdvertised)} - ${b(e.lastAdvertised)}

`;return e.top5&&e.top5.length>0?i+=e.top5.map((o,l)=>`Ad #${l+1} (Duration: ${o.duration} days)
${o.adText||"[No copy]"}
`).join(`
---

`):i+=`[No top ads data]
`,i}).join(`
==========================================

`);navigator.clipboard.writeText(n).then(()=>{const e=document.getElementById("fbAdsCopyAllTextBtn"),i=e.innerHTML;e.innerHTML="✅ Copied All!",setTimeout(()=>{e.innerHTML=i},2e3)})})}function b(t){return new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}function O(t){return t>=100?"#ef4444":t>=50?"#f97316":t>=20?"#eab308":t>=10?"#22c55e":t>=5?"#3b82f6":"#8b5cf6"}function U(t){try{return new URL(t).hostname.replace("www.","")}catch{return t.split("/")[0]}}function R(t){return t.map(a=>({url:a.url.replace("https://","").replace("http://",""),firstAdvertised:a.firstAdvertised.split("T")[0],lastAdvertised:a.lastAdvertised.split("T")[0],campaignDurationDays:a.campaignDurationDays,adsUsingUrl:a.adsCount,top5:a.top5||[]}))}function x(t,a){const s=[...t];return a==="start"?s.sort((n,e)=>new Date(n.firstAdvertised)-new Date(e.firstAdvertised)):a==="duration"?s.sort((n,e)=>e.campaignDurationDays-n.campaignDurationDays):a==="ads"&&s.sort((n,e)=>e.adsUsingUrl-n.adsUsingUrl),s}function F(t,a){const s={};t.forEach(e=>{const i=U(e.url);s[i]||(s[i]=[]),s[i].push(e)}),Object.keys(s).forEach(e=>{s[e]=x(s[e],a)});const n=Object.keys(s).sort((e,i)=>{const o=s[e].reduce((c,u)=>c+u.adsUsingUrl,0);return s[i].reduce((c,u)=>c+u.adsUsingUrl,0)-o});return{groups:s,sortedDomains:n}}function H(t,a,s){const n=new Date(t.firstAdvertised),e=new Date(t.lastAdvertised),i=Math.ceil((n-a)/(1e3*60*60*24)),o=Math.ceil((e-n)/(1e3*60*60*24))+1;return{left:`${i/s*100}%`,width:`${o/s*100}%`}}function N(t,a,s){const n=[];let e=new Date(t);for(e.setDate(1);e<=a;){const i=Math.ceil((e-t)/864e5);n.push({date:new Date(e),position:i/s*100}),e.setMonth(e.getMonth()+1)}return n}function h(){if(!d.rawCampaigns||d.rawCampaigns.length===0)return;const t=R(d.rawCampaigns),a=new Date(Math.min(...t.map(l=>new Date(l.firstAdvertised)))),s=new Date(Math.max(...t.map(l=>new Date(l.lastAdvertised)))),n=Math.ceil((s-a)/(1e3*60*60*24)),e=N(a,s,n);document.getElementById("fbAdsSubtitle").textContent=`${t.length} campaigns from ${b(a)} to ${b(s)}`;const i=document.getElementById("fbAdsChartContent");i.innerHTML="";const o=document.createElement("div");if(o.className="fb-ads-timeline-header",o.innerHTML=`
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
    `,i.appendChild(o),d.groupByDomain){const{groups:l,sortedDomains:c}=F(t,d.sortBy);c.forEach(u=>{const w=l[u],G=w.reduce((E,_)=>E+_.adsUsingUrl,0),y=document.createElement("div");y.className="fb-ads-domain-group",y.innerHTML=`
          <div class="fb-ads-domain-header">
            <div class="fb-ads-timeline-label">
              <div class="fb-ads-domain-name">${u}</div>
              <div class="fb-ads-domain-stats">${w.length} campaigns • ${G} ads</div>
            </div>
          </div>
        `,w.forEach(E=>{y.appendChild(D(E,a,s,n,e))}),i.appendChild(y)})}else x(t,d.sortBy).forEach(c=>{i.appendChild(D(c,a,s,n,e))})}function D(t,a,s,n,e){const i=document.createElement("div");i.className="fb-ads-campaign-row";const o=H(t,a,n),l=O(t.adsUsingUrl);return i.innerHTML=`
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
    `,i.addEventListener("click",c=>{c.target.tagName==="A"||c.target.closest("a")||j(t)}),i}function j(t){const a=document.getElementById("fbAdsModalOverlay"),s=document.getElementById("fbAdsModalBody");document.getElementById("fbAdsModalUrl").textContent=t.url,document.getElementById("fbAdsModalMeta").innerHTML=`
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
          ${t.top5.map((e,i)=>`
            <div class="fb-ads-card">
              <div class="fb-ads-ad-header">
                <div class="fb-ads-ad-rank">
                  <div class="fb-ads-rank-number">#${i+1}</div>
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
      `,a.style.display="flex";const n=document.getElementById("fbAdsModalCopyAllBtn");n&&n.addEventListener("click",()=>{const e=t.top5.map((i,o)=>`Ad #${o+1} (Duration: ${i.duration} days)
${i.adText||"[No copy]"}`).join(`

---

`);navigator.clipboard.writeText(e).then(()=>{const i=n.innerHTML;n.innerHTML="✅ Copied All!",n.classList.add("success"),setTimeout(()=>{n.innerHTML=i,n.classList.remove("success")},2e3)})})}function L(){document.getElementById("fbAdsModalOverlay").style.display="none"}window.addEventListener("message",t=>{t.source===window&&(t.data.type==="FB_ADS_DATA"?(console.log("[FB Ads Visualizer] Received data:",t.data.data),d.rawCampaigns=t.data.data||[],d.allAds=t.data.allAds||[],d.isAnalyzing=!1,d.rawCampaigns.length>0?(r(`✅ Found ${d.rawCampaigns.length} campaigns!`),setTimeout(v,2e3),A(),f(),m(),p()):r("⚠️ No campaigns found. Try different search criteria.")):t.data.type==="FB_ADS_ERROR"&&(r("❌ Error: "+t.data.error),d.isAnalyzing=!1))}),document.addEventListener("fbAdsImportData",t=>{console.log("[FB Ads Visualizer] Received imported data via CustomEvent"),M(t.detail)}),document.addEventListener("fbAdsReopen",()=>{console.log("[FB Ads Visualizer] Reopening overlay"),m()}),window.fbAdsReopenOverlay=m;function M(t){d.rawCampaigns=t.campaigns||[],d.allAds=t.allAds||[],d.isAnalyzing=!1,d.rawCampaigns.length>0?(v(),A(),f(),m(),p(),r(`✅ Imported ${d.rawCampaigns.length} campaigns!`),setTimeout(v,2e3)):r("⚠️ No campaigns in imported data.")}const V=!!document.getElementById("fbAdsAnalyzerOverlay");I();const B=document.getElementById("fbAdsImportedData");if(B){console.log("[FB Ads Visualizer] Found imported data in DOM");try{const t=JSON.parse(B.textContent);B.remove(),M(t)}catch(t){console.error("[FB Ads Visualizer] Error parsing imported data:",t),r("❌ Error parsing imported data")}}else V&&(console.log("[FB Ads Visualizer] Overlay already exists, showing it for new scraping session"),m(),d.isAnalyzing=!0,g()),document.getElementById("fbAdsSubtitle").textContent="Scraping in progress...",r("🔄 Auto-scrolling and extracting ad data...")})();

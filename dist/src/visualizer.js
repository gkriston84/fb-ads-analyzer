(function(){var _;console.log("[FB Ads Analyzer] Visualizer script loaded");const u={timeline:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2v-4h2v4zm4 0h-2v-2h2v2z"/></svg>',top5:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 21h16v2H4zM6 7h12v2H6zM6 11h12v2H6zM6 15h8v2H6z"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',ai:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>',refresh:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',arrowUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>',arrowDown:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>',search:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>'},a={rawCampaigns:[],allAds:[],filterText:"",filterSort:"recent",groupByDomain:!1,isMinimized:!0,currentView:"timeline",aiConfig:null,metadata:null,sortDirection:"asc",isImported:!1};function V(e){return e>=100?"#ef4444":e>=50?"#f97316":e>=20?"#eab308":e>=10?"#22c55e":e>=5?"#3b82f6":"#8b5cf6"}const I=document.getElementById("fbAdsConfig"),E=((_=I==null?void 0:I.dataset)==null?void 0:_.logoUrl)||"",h=document.createElement("div");h.id="fbAdsAnalyzerOverlay",h.className="hidden minimized",h.innerHTML=`
      <div class="fb-ads-minimized-bar" id="fbAdsMinimizedBar">
        <div class="fb-ads-mini-content">
          <div class="fb-ads-mini-icon">
            <img src="${E}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
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
                <img src="${E}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb;">
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
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-view="timeline">${u.timeline} Timeline</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-view="top5-text">${u.top5} Top 5 Text</button>
                </div>

                 <div class="fb-ads-control-group">
                  <span style="font-weight: 500; font-size: 13px; color: #374151;">Sort:</span>
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-sort="recent">Start Date</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="duration">Duration</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="ads"># of Ads</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" id="fbAdsGroupDomainBtn" title="Group campaigns by domain">${u.folder} Group by Domain</button>
                </div>

                 <div class="fb-ads-control-group" style="flex: 1; max-width: 300px;">
                   <input type="text" id="fbAdsFilterInput" class="fb-ads-input" placeholder="Filter campaigns..." style="width: 100%;">
                 </div>
                
                <div class="fb-ads-control-group" style="margin-left: auto;">
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsDownloadBtn">${u.save} Download Data</button>
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsImportBtn">${u.folder} Import Data</button>
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
    `,document.body.appendChild(h);const D=document.createElement("div");D.className="fb-ads-tooltip",h.appendChild(D),document.getElementById("fbAdsCloseBtn").addEventListener("click",W),document.getElementById("fbAdsMinimizeBtn").addEventListener("click",T),document.getElementById("fbAdsMaximizeBtn").addEventListener("click",T),document.getElementById("fbAdsMinimizedBar").addEventListener("click",T),document.getElementById("fbAdsModalClose").addEventListener("click",O),document.getElementById("fbAdsModalOverlay").addEventListener("click",e=>{e.target.id==="fbAdsModalOverlay"&&O()}),document.getElementById("fbAdsFilterInput").addEventListener("input",e=>{a.filterText=e.target.value.toLowerCase(),C()}),document.getElementById("fbAdsDownloadBtn").addEventListener("click",te),document.getElementById("fbAdsImportBtn").addEventListener("click",()=>{document.getElementById("fbAdsImportInput").click()}),document.getElementById("fbAdsImportInput").addEventListener("change",ae);const N=document.querySelectorAll("[data-view]");N.forEach(e=>{e.addEventListener("click",i=>{N.forEach(n=>n.classList.remove("active")),i.target.classList.add("active"),a.currentView=i.target.getAttribute("data-view");const t=document.getElementById("fbAdsTimelineLegend");a.currentView==="timeline"?t.style.display="flex":t.style.display="none",C()})});const F=document.querySelectorAll("[data-sort]"),j=()=>{F.forEach(e=>{const i=e.getAttribute("data-sort");let t="";i==="recent"&&(t="Start Date"),i==="duration"&&(t="Duration"),i==="ads"&&(t="# of Ads");let n=t;a.filterSort===i?(e.classList.add("active"),n+=a.sortDirection==="asc"?` ${u.arrowUp}`:` ${u.arrowDown}`):e.classList.remove("active"),e.innerHTML=n})};F.forEach(e=>{e.addEventListener("click",i=>{const t=i.target.getAttribute("data-sort");a.filterSort===t?a.sortDirection=a.sortDirection==="asc"?"desc":"asc":(t==="recent"?a.sortDirection="asc":a.sortDirection="desc",a.filterSort=t),j(),C()})}),j();const q=document.getElementById("fbAdsGroupDomainBtn");q.addEventListener("click",()=>{a.groupByDomain=!a.groupByDomain,q.classList.toggle("active"),C()});function M(){h.classList.remove("hidden"),h.classList.remove("minimized"),a.isMinimized=!1}function W(){h.classList.add("hidden")}function T(e){e&&e.stopPropagation(),a.isMinimized=!a.isMinimized,a.isMinimized?h.classList.add("minimized"):h.classList.remove("minimized")}function X(e,i,t){document.getElementById("fbAdsModalTitle").innerText=i,document.getElementById("fbAdsModalMeta").innerText=t,document.getElementById("fbAdsModalBody").innerHTML=e,document.getElementById("fbAdsModalOverlay").style.display="flex",Q(document.getElementById("fbAdsModalBody"))}function O(){document.getElementById("fbAdsModalOverlay").style.display="none"}function K(e,i){if(typeof ClipboardItem<"u"){const t=new Blob([e],{type:"text/plain"}),n=new Blob([i],{type:"text/html"});navigator.clipboard.write([new ClipboardItem({"text/plain":t,"text/html":n})]).catch(s=>{console.error("Rich copy failed, falling back to plain:",s),navigator.clipboard.writeText(e)})}else navigator.clipboard.writeText(e)}function Q(e){e.querySelectorAll(".fb-ads-copy-btn").forEach(t=>{t.addEventListener("click",n=>{const s=n.currentTarget,f=decodeURIComponent(s.dataset.copyText),r={url:s.dataset.url?decodeURIComponent(s.dataset.url):"",campaignDuration:s.dataset.campaignDuration||"",campaignAds:s.dataset.campaignAds||"",libId:s.dataset.adLibId||"",adDuration:s.dataset.adDuration||"",adDates:s.dataset.adDates||""},p=`
             <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #374151;">
                 <p style="margin-bottom: 8px;">
                    <strong>Campaign:</strong> <a href="${r.url}">${r.url}</a><br>
                    ${r.campaignDuration?`<strong>Duration:</strong> ${r.campaignDuration} days`:""} 
                    ${r.campaignAds?`• ${r.campaignAds} ads`:""}
                 </p>
                 <p style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                    <strong>Library ID:</strong> <a href="https://www.facebook.com/ads/library/?id=${r.libId}">${r.libId}</a><br>
                    <strong>Dates:</strong> ${r.adDates} | <strong>Ad Duration:</strong> ${r.adDuration} days
                 </p>
                 <div>
                    ${f.replace(/\n/g,"<br>")}
                 </div>
             </div>
        `,o=`Campaign: ${r.url}
Duration: ${r.campaignDuration} days • ${r.campaignAds} ads

Library ID: ${r.libId}
Dates: ${r.adDates} | Ad Duration: ${r.adDuration} days

---

${f}`;K(o,p);const m=s.innerHTML;s.innerHTML=`${u.check} Copied!`,s.classList.add("success"),setTimeout(()=>{s.innerHTML=m,s.classList.remove("success")},2e3)})})}function C(){a.currentView==="timeline"?Z():a.currentView==="top5-text"&&ee()}function U(e){let i=[...e];return console.log("[FB Ads Visualizer] Processing data. Sort:",a.filterSort,"Group:",a.groupByDomain),a.filterText&&(i=i.filter(t=>t.url.toLowerCase().includes(a.filterText)||t.top5&&t.top5.some(n=>n.adText&&n.adText.toLowerCase().includes(a.filterText)))),i.sort((t,n)=>{let s,f;a.filterSort==="ads"?(s=Number(t.adsCount)||0,f=Number(n.adsCount)||0):a.filterSort==="duration"?(s=Number(t.campaignDurationDays)||0,f=Number(n.campaignDurationDays)||0):(s=new Date(t.firstAdvertised).getTime(),f=new Date(n.firstAdvertised).getTime());const r=s-f;return a.sortDirection==="asc"?r:-r}),a.groupByDomain&&i.sort((t,n)=>{const s=z(t.url),f=z(n.url);return s<f?-1:s>f?1:0}),i}function z(e){try{return new URL(e).hostname.replace("www.","")}catch{return e}}function Z(){const e=document.getElementById("fbAdsChartContent");e.classList.remove("fb-ads-bg-gray"),e.innerHTML="";const i=U(a.rawCampaigns);if(i.length===0){e.innerHTML='<div class="fb-ads-empty-state">No campaigns match criteria</div>';return}const t=document.getElementById("fbAdsSubtitle");a.rawCampaigns.length>0&&(new Date(a.rawCampaigns[a.rawCampaigns.length-1].firstAdvertised),new Date(a.rawCampaigns[0].lastAdvertised),t.textContent=`${a.rawCampaigns.length} campaigns analyzed`);let n=new Date,s=new Date(0);i.forEach(l=>{l.firstAdvertised<n&&(n=l.firstAdvertised),l.lastAdvertised>s&&(s=l.lastAdvertised)});const f=864e5;let r=s-n;r<f&&(r=f);const p=Math.max(f*5,r*.1),o=new Date(n.getFullYear(),n.getMonth(),1),m=new Date(s.getFullYear(),s.getMonth()+1,0,23,59,59,999),d=new Date(Math.min(s.getTime()+p,m.getTime())),c=d-o,g=document.createElement("div");g.className="fb-ads-timeline-header",g.innerHTML=`
       <div class="fb-ads-timeline-label"><strong>Campaign</strong></div>
       <div class="fb-ads-timeline-grid"></div>
    `,e.appendChild(g);const b=g.querySelector(".fb-ads-timeline-grid");let $="";if(r<f*60){let l=new Date(o);for(;l<=d;){const y=(l-o)/c*100;if(y>=0&&y<=100){const v=document.createElement("div");v.className="fb-ads-month-marker",v.style.left=`${y}%`,v.innerHTML=`<div class="fb-ads-month-label">${l.toLocaleString("default",{month:"short",day:"numeric"})}</div>`,b.appendChild(v),$+=`<div class="fb-ads-grid-line" style="left: ${y}%"></div>`}l.setDate(l.getDate()+7)}}else{let l=new Date(o);for(l.setDate(1);l<=d;){const y=(l-o)/c*100;if(y>=0&&y<=100){const v=document.createElement("div");v.className="fb-ads-month-marker",v.style.left=`${y}%`,v.innerHTML=`<div class="fb-ads-month-label">${l.toLocaleString("default",{month:"short",year:"2-digit"})}</div>`,b.appendChild(v),$+=`<div class="fb-ads-grid-line" style="left: ${y}%"></div>`}l.setMonth(l.getMonth()+1)}}const A=document.createElement("div");A.className="fb-ads-timeline-body",A.style.position="relative";const H=document.createElement("div");H.className="fb-ads-global-grid",H.innerHTML=`
       <div class="fb-ads-grid-spacer"></div>
       <div class="fb-ads-grid-area">${$}</div>
    `,A.appendChild(H);let G=null;i.forEach(l=>{const y=z(l.url);if(a.groupByDomain&&y!==G){const x=document.createElement("div");x.className="fb-ads-domain-header",x.innerHTML=`<div class="fb-ads-domain-name">${y}</div>`,A.appendChild(x),G=y}const v=document.createElement("div");v.className="fb-ads-campaign-row";const Y=(l.firstAdvertised-o)/c*100,J=Math.max(.5,(l.lastAdvertised-l.firstAdvertised)/c*100),ne=V(l.adsCount);v.innerHTML=`
          <div class="fb-ads-campaign-info">
             <div class="fb-ads-campaign-url" title="${l.url}">
                <a href="${l.url}" target="_blank" style="color: inherit; text-decoration: none;">${l.url}</a>
                <span style="font-size: 11px; margin-left: 6px;">
                  (<a href="https://web.archive.org/web/*/${l.url}/*" target="_blank" style="color: #6b7280; text-decoration: underline;">Archive</a>)
                </span>
             </div>
             <div class="fb-ads-campaign-meta">
               ${l.campaignDurationDays} days • ${l.adsCount} ads
             </div>
          </div>
          <div class="fb-ads-campaign-timeline">
             <div class="fb-ads-timeline-bg-marker" style="left: ${Y}%; width: ${J}%"></div> 
             <div class="fb-ads-campaign-bar" 
                  style="left: ${Y}%; width: ${J}%; background: ${ne}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
             </div>
          </div>
       `,setTimeout(()=>{const x=v.querySelector(".fb-ads-campaign-bar");x&&(x.addEventListener("mouseenter",()=>{const B=new Date(l.firstAdvertised).toLocaleDateString(),R=new Date(l.lastAdvertised).toLocaleDateString();D.innerHTML=`
               <div class="fb-ads-tooltip-header">Campaign Details</div>
               <div class="fb-ads-tooltip-dates">${B} — ${R}</div>
               <a class="fb-ads-tooltip-action" id="fbAdsTooltipViewBtn">Click to View Top 5 Ads</a>
             `,D.style.display="block";const L=D.querySelector("#fbAdsTooltipViewBtn");L&&(L.onclick=ie=>{ie.stopPropagation(),P(l),D.style.display="none"})}),x.addEventListener("mousemove",B=>{const R=B.clientX+15,L=B.clientY+15;D.style.left=R+"px",D.style.top=L+"px"}),x.addEventListener("mouseleave",()=>{D.style.display="none"}))},0),v.addEventListener("click",x=>{x.target.closest("a")||P(l)}),A.appendChild(v)}),e.appendChild(A)}function ee(){var o,m;const e=document.getElementById("fbAdsChartContent");e.classList.add("fb-ads-bg-gray");const i=document.getElementById("fbAdsSubtitle");if(i.textContent=`Top 5 ads for ${a.rawCampaigns.length} campaigns`,!a.rawCampaigns||a.rawCampaigns.length===0){e.innerHTML='<div class="fb-ads-empty-state">No campaign data available</div>';return}let t="";U(a.rawCampaigns).forEach(d=>{const c=b=>new Date(b).toDateString(),g=V(d.adsCount);t+=`
        <div class="fb-ads-text-campaign fb-ads-card-white" style="border-left: 4px solid ${g};">
          <div class="fb-ads-text-header">
            <strong>${d.url}</strong>
          </div>
          <div class="fb-ads-text-meta">
            ${c(d.firstAdvertised)} — ${c(d.lastAdvertised)} | 
            ${d.campaignDurationDays} days | 
            ${d.adsCount} ads
          </div>
          
          ${d.top5&&d.top5.length>0?`
            <div class="fb-ads-text-ads">
              <div class="fb-ads-text-label">Top 5 Ads</div>
              <div class="fb-ads-grid">
              ${d.top5.map(b=>`
                <div class="fb-ads-text-ad">
                  <div class="fb-ads-text-ad-header">
                    <strong>Library ID:</strong> 
                    <a href="https://www.facebook.com/ads/library/?id=${b.libraryId}" 
                       target="_blank" 
                       class="fb-ads-library-id-link">
                      ${b.libraryId}
                    </a>
                  </div>
                  <div class="fb-ads-text-ad-meta">
                    <strong>Dates:</strong> ${new Date(b.startingDate).toLocaleDateString()} — ${new Date(b.endDate).toLocaleDateString()}<br>
                    <strong>Duration:</strong> ${b.duration} days
                  </div>
                  <div class="fb-ads-text-ad-copy">
                     ${b.mediaType==="video"?`<div style="margin-bottom: 8px;"><video src="${b.mediaSrc}" controls style="max-width: 100%; height: auto; border-radius: 4px;"></video></div>`:b.mediaType==="image"?`<div style="margin-bottom: 8px;"><img src="${b.mediaSrc}" style="max-width: 100%; height: auto; border-radius: 4px;"></div>`:""}
                    <strong>Ad Copy:</strong><br>
                    ${b.adText||"[no copy]"}
                  </div>
                </div>
              `).join("")}
              </div>
            </div>
          `:'<div class="fb-ads-text-no-ads">No top ads data available</div>'}
        </div>
      `}),e.innerHTML=`
      <div class="fb-ads-text-actions" style="margin-top: 15px; margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
        ${a.aiConfig?`
        <button id="fbAdsAnalyzeBtn" class="fb-ads-btn fb-ads-btn-action">
          ${u.ai} Analyze with AI
        </button>`:""}
    <button id="fbAdsCopyAllTextBtn" class="fb-ads-btn fb-ads-btn-action">
      ${u.copy} Copy All Text
    </button>
      </div>
       <div id="fbAdsAIResult" style="display: none; margin-bottom: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; overflow: hidden;">
          <div class="fb-ads-ai-header" style="padding: 12px 16px; background: #dcfce7; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #bbf7d0;">
            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;">${u.ai} AI Analysis</div>
            <button class="fb-ads-ai-minimize" style="background: none; border: none; font-size: 18px; color: #166534; cursor: pointer; line-height: 1;">−</button>
          </div>
          <div class="fb-ads-ai-content" style="padding: 16px; white-space: pre-wrap;"></div>
       </div>
      <div class="fb-ads-text-output">${t}</div>
    `;const s=e.querySelector(".fb-ads-ai-header"),f=e.querySelector(".fb-ads-ai-content"),r=e.querySelector(".fb-ads-ai-minimize");s&&s.addEventListener("click",()=>{const d=f.style.display==="none";f.style.display=d?"block":"none",r.textContent=d?"−":"+"});const p=document.getElementById("fbAdsAIResult");if(a.aiAnalysisResult){const d=p.querySelector(".fb-ads-ai-content");d.innerHTML=a.aiAnalysisResult,p.style.display="block"}a.aiConfig&&((o=document.getElementById("fbAdsAnalyzeBtn"))==null||o.addEventListener("click",se)),(m=document.getElementById("fbAdsCopyAllTextBtn"))==null||m.addEventListener("click",()=>{const d=document.querySelector(".fb-ads-text-output");if(!d)return;const c=d.querySelectorAll("img, video"),g=[];c.forEach(w=>{g.push(w.style.display),w.style.display="none"});const b=window.getSelection(),$=document.createRange();$.selectNodeContents(d),b.removeAllRanges(),b.addRange($);try{document.execCommand("copy");const w=document.getElementById("fbAdsCopyAllTextBtn"),A=w.innerHTML;w.innerHTML=`${u.check} Copied!`,setTimeout(()=>{w.innerHTML=A},2e3)}catch(w){console.error("Copy failed:",w),alert("Copy failed")}b.removeAllRanges(),c.forEach((w,A)=>{w.style.display=g[A]})})}function P(e){if(!e.top5||e.top5.length===0)return;let i='<div class="fb-ads-list">';e.top5.forEach((t,n)=>{const s=f=>new Date(f).toDateString();i+=`
      <div class="fb-ads-card fb-ads-card-white">
              <div class="fb-ads-ad-header">
                <div class="fb-ads-ad-rank">
                   <div class="fb-ads-rank-number">#${n+1}</div>
                   <div>
                     <div class="fb-ads-library-id-label">Library ID</div>
                     <a href="https://www.facebook.com/ads/library/?id=${t.libraryId}" target="_blank" class="fb-ads-library-id-link">${t.libraryId}</a>
                   </div>
                </div>
                <div class="fb-ads-ad-duration">
                   <div class="fb-ads-duration-label">Duration</div>
                   <div class="fb-ads-duration-value">${t.duration} days</div>
                   <div class="fb-ads-modal-meta">${s(t.startingDate)} - ${s(t.endDate)}</div>
                </div>
              </div>
              <div class="fb-ads-ad-copy-section">
                 ${t.mediaType==="video"?`<div class="fb-ads-ad-image" style="margin-bottom: 12px; text-align: center;"><video src="${t.mediaSrc}" controls style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></video></div>`:t.mediaType==="image"?`<div class="fb-ads-ad-image" style="margin-bottom: 12px; text-align: center;"><img src="${t.mediaSrc}" style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>`:""}
                <div class="fb-ads-ad-copy-header">
                  <div class="fb-ads-ad-copy-label">Ad Copy</div>
                  <button class="fb-ads-copy-btn" 
                    data-copy-text="${encodeURIComponent(t.adText||"")}"
                    data-url="${encodeURIComponent(e.url)}"
                    data-campaign-duration="${e.campaignDurationDays}"
                    data-campaign-ads="${e.adsCount}"
                    data-ad-lib-id="${t.libraryId}"
                    data-ad-duration="${t.duration}"
                    data-ad-dates="${s(t.startingDate)} — ${s(t.endDate)}"
                  >
                    ${u.copy} Copy
                  </button>
                </div>
                <div class="fb-ads-ad-copy">${t.adText||"[No copy available]"}</div>
              </div>
          </div>
      `}),i+="</div>",X(i,`${e.url} `,`${e.adsCount} total ads • ${e.campaignDurationDays} days active`)}function te(){var d;const e=(((d=a.metadata)==null?void 0:d.advertiserName)||"fb_ads_analysis").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""),i=a.rawCampaigns.length;let t=new Date,n=new Date(0);a.rawCampaigns.forEach(c=>{c.firstAdvertised<t&&(t=c.firstAdvertised),c.lastAdvertised>n&&(n=c.lastAdvertised)});const s=c=>`${["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"][c.getMonth()]} -${c.getDate()} -${c.getFullYear()} `,f=s(t),r=s(n),p=`${e} -fb - ads - ${i} -campaigns - from - ${f} -to - ${r}.json`,o="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify({campaigns:a.rawCampaigns,allAds:a.allAds,metadata:a.metadata||{advertiserName:e},aiAnalysisResult:a.aiAnalysisResult||null},null,2)),m=document.createElement("a");m.setAttribute("href",o),m.setAttribute("download",p),document.body.appendChild(m),m.click(),m.remove()}function ae(e){const i=e.target.files[0];if(!i)return;const t=new FileReader;t.onload=n=>{try{const s=JSON.parse(n.target.result);if(!s.campaigns)throw new Error("Invalid format");k(s)}catch(s){alert("Error importing file: "+s.message)}},t.readAsText(i)}function k(e){a.rawCampaigns=e.campaigns||[],a.allAds=e.allAds||[],a.metadata=e.metadata||null,a.isImported=!!e.isImported,a.aiAnalysisResult=e.aiAnalysisResult||null;const i=document.getElementById("fbAdsDownloadBtn");a.isImported?i.style.display="none":i.style.display="inline-flex",a.rawCampaigns.forEach(t=>{t.firstAdvertised=new Date(t.firstAdvertised),t.lastAdvertised=new Date(t.lastAdvertised),t.top5&&t.top5.forEach(n=>{n.startingDate=new Date(n.startingDate),n.endDate=new Date(n.endDate)})}),a.rawCampaigns.sort((t,n)=>new Date(n.firstAdvertised)-new Date(t.firstAdvertised)),C(),M()}async function se(){const e=document.getElementById("fbAdsAnalyzeBtn"),i=document.getElementById("fbAdsAIResult");if(!a.aiConfig){alert("AI Configuration missing. Please check database settings.");return}e.disabled=!0,e.innerHTML=`${u.ai} Analyzing...`,i.style.display="none";let t=[];const n=o=>{try{return new Date(o).toLocaleDateString()}catch{return"N/A"}};if(a.rawCampaigns.forEach(o=>{if(!o.top5||o.top5.length===0)return;let m=!1,d=`CAMPAIGN: ${o.url}
`;d+=`METADATA: Duration: ${o.campaignDurationDays} days | Ads Count: ${o.adsCount} | Active: ${n(o.firstAdvertised)} to ${n(o.lastAdvertised)}
`,d+=`TOP ADS:
`,o.top5.forEach((c,g)=>{!c.adText||c.adText.length<5||(m=!0,d+=`  [Ad #${g+1}] LibID: ${c.libraryId} | Duration: ${c.duration} days | Dates: ${n(c.startingDate)} - ${n(c.endDate)}
`,d+=`  TEXT: ${c.adText.replace(/\n\s*\n/g,`
`).trim()}

`)}),d+=`--------------------------------------------------
`,m&&t.push(d)}),t.length===0){alert("No valid ad content found to analyze."),e.disabled=!1,e.innerHTML=`${u.ai} Analyze with AI`;return}let s=t.join(`
`);s.length>4e4&&(s=s.substring(0,4e4)+`
...[TRUNCATED DATA]`);const f=a.aiConfig.systemPrompt||"You are an expert marketing analyst. Analyze these Facebook ad campaigns. Look for patterns in the successful ads (high duration, high count). Identify hooks, angles, and structures that are working across the timeline. Focus on the Top Ads provided for each campaign.",r=`Analyze the following campaign performance data:

`+s,p=o=>{const m=o.detail;document.removeEventListener("fbAdsAnalyzeResponse",p);const d=document.getElementById("fbAdsAIResult"),c=document.getElementById("fbAdsAnalyzeBtn");if(m&&m.success){const g=m.analysis.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");if(a.aiAnalysisResult=g,d){const b=d.querySelector(".fb-ads-ai-content");b?b.innerHTML=g:d.innerHTML=`<strong>${u.ai} AI Analysis:</strong> <br><br>${g}`,d.style.display="block"}}else{const g=m&&m.error||"Unknown error";console.error("AI Analysis failed:",g),alert("Analysis failed: "+g)}c&&(c.disabled=!1,c.innerHTML=`${u.ai} Analyze with AI`)};document.addEventListener("fbAdsAnalyzeResponse",p),console.log("[FB Ads Visualizer] Dispatching AI analysis request"),document.dispatchEvent(new CustomEvent("fbAdsAnalyzeRequest",{detail:{systemPrompt:f,userContent:r}})),setTimeout(()=>{const o=document.getElementById("fbAdsAnalyzeBtn");o&&o.disabled&&o.innerHTML.includes("Analyzing")&&(document.removeEventListener("fbAdsAnalyzeResponse",p),o.disabled=!1,o.innerHTML=`${u.ai} Analyze with AI`,console.warn("[FB Ads Visualizer] AI request timed out"))},6e4)}document.addEventListener("fbAdsImportData",e=>{console.log("[FB Ads Visualizer] Received imported data via CustomEvent"),k(e.detail)}),document.addEventListener("fbAdsReopen",()=>{console.log("[FB Ads Visualizer] Reopening overlay"),M()}),document.addEventListener("fbAdsConfig",e=>{console.log("[FB Ads Visualizer] Received AI Config"),a.aiConfig=e.detail,C()}),document.addEventListener("fbAdsStatus",e=>{const{scrolling:i,adsFound:t,message:n}=e.detail;i&&(h.classList.remove("hidden"),h.classList.add("minimized"),a.isMinimized=!0);const s=document.getElementById("fbAdsMinimizedBar"),f=s.querySelector(".fb-ads-mini-icon"),r=s.querySelector(".fb-ads-mini-text"),p=document.getElementById("fbAdsMaximizeBtn");if(i){if(f.innerHTML=`<span class="fb-ads-mini-spinner">${u.refresh}</span>`,r.textContent=n,p.style.display="none",!document.getElementById("fbAdsMiniSpinnerStyle")){const o=document.createElement("style");o.id="fbAdsMiniSpinnerStyle",o.textContent=`
      @keyframes fbAdsSpin {100 % { transform: rotate(360deg); }}
      .fb-ads-mini-spinner {display: inline-block; animation: fbAdsSpin 1s linear infinite; }
      .fb-ads-mini-spinner svg { width: 20px; height: 20px; }
      `,document.head.appendChild(o)}}else f.innerHTML=`<img src="${E}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`,r.textContent="Analysis Ready!",s.style.background="",p.style.display="block"}),window.fbAdsReopenOverlay=M;const S=document.getElementById("fbAdsImportedData");if(S)try{const e=JSON.parse(S.textContent);console.log("[FB Ads Visualizer] Found pre-injected data, loading..."),k(e),S.remove()}catch(e){console.error("[FB Ads Visualizer] Error loading pre-injected data:",e)}})();

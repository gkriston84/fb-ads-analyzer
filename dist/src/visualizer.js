(function(){var _;console.log("[FB Ads Analyzer] Visualizer script loaded");const b={timeline:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2v-4h2v4zm4 0h-2v-2h2v2z"/></svg>',top5:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 21h16v2H4zM6 7h12v2H6zM6 11h12v2H6zM6 15h8v2H6z"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',ai:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>',refresh:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',arrowUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>',arrowDown:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>',search:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>'},a={rawCampaigns:[],allAds:[],filterText:"",filterSort:"recent",groupByDomain:!1,isMinimized:!0,currentView:"timeline",aiConfig:null,metadata:null,sortDirection:"asc",isImported:!1};function V(e){return e>=100?"#ef4444":e>=50?"#f97316":e>=20?"#eab308":e>=10?"#22c55e":e>=5?"#3b82f6":"#8b5cf6"}const I=document.getElementById("fbAdsConfig"),E=((_=I==null?void 0:I.dataset)==null?void 0:_.logoUrl)||"",y=document.createElement("div");y.id="fbAdsAnalyzerOverlay",y.className="hidden minimized",y.innerHTML=`
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
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-view="timeline">${b.timeline} Timeline</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-view="top5-text">${b.top5} Top 5 Text</button>
                </div>

                 <div class="fb-ads-control-group">
                  <span style="font-weight: 500; font-size: 13px; color: #374151;">Sort:</span>
                  <button class="fb-ads-btn fb-ads-btn-outline active" data-sort="recent">Start Date</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="duration">Duration</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" data-sort="ads"># of Ads</button>
                  <button class="fb-ads-btn fb-ads-btn-outline" id="fbAdsGroupDomainBtn" title="Group campaigns by domain">${b.folder} Group by Domain</button>
                </div>

                 <div class="fb-ads-control-group" style="flex: 1; max-width: 300px;">
                   <input type="text" id="fbAdsFilterInput" class="fb-ads-input" placeholder="Filter campaigns..." style="width: 100%;">
                 </div>
                
                <div class="fb-ads-control-group" style="margin-left: auto;">
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsDownloadBtn">${b.save} Download Data</button>
                    <button class="fb-ads-btn fb-ads-btn-action" id="fbAdsImportBtn">${b.folder} Import Data</button>
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
    `,document.body.appendChild(y);const D=document.createElement("div");D.className="fb-ads-tooltip",y.appendChild(D),document.getElementById("fbAdsCloseBtn").addEventListener("click",W),document.getElementById("fbAdsMinimizeBtn").addEventListener("click",z),document.getElementById("fbAdsMaximizeBtn").addEventListener("click",z),document.getElementById("fbAdsMinimizedBar").addEventListener("click",z),document.getElementById("fbAdsModalClose").addEventListener("click",O),document.getElementById("fbAdsModalOverlay").addEventListener("click",e=>{e.target.id==="fbAdsModalOverlay"&&O()}),document.getElementById("fbAdsFilterInput").addEventListener("input",e=>{a.filterText=e.target.value.toLowerCase(),C()}),document.getElementById("fbAdsDownloadBtn").addEventListener("click",te),document.getElementById("fbAdsImportBtn").addEventListener("click",()=>{document.getElementById("fbAdsImportInput").click()}),document.getElementById("fbAdsImportInput").addEventListener("change",ae);const N=document.querySelectorAll("[data-view]");N.forEach(e=>{e.addEventListener("click",n=>{N.forEach(i=>i.classList.remove("active")),n.target.classList.add("active"),a.currentView=n.target.getAttribute("data-view");const t=document.getElementById("fbAdsTimelineLegend");a.currentView==="timeline"?t.style.display="flex":t.style.display="none",C()})});const F=document.querySelectorAll("[data-sort]"),j=()=>{F.forEach(e=>{const n=e.getAttribute("data-sort");let t="";n==="recent"&&(t="Start Date"),n==="duration"&&(t="Duration"),n==="ads"&&(t="# of Ads");let i=t;a.filterSort===n?(e.classList.add("active"),i+=a.sortDirection==="asc"?` ${b.arrowUp}`:` ${b.arrowDown}`):e.classList.remove("active"),e.innerHTML=i})};F.forEach(e=>{e.addEventListener("click",n=>{const t=n.target.getAttribute("data-sort");a.filterSort===t?a.sortDirection=a.sortDirection==="asc"?"desc":"asc":(t==="recent"?a.sortDirection="asc":a.sortDirection="desc",a.filterSort=t),j(),C()})}),j();const q=document.getElementById("fbAdsGroupDomainBtn");q.addEventListener("click",()=>{a.groupByDomain=!a.groupByDomain,q.classList.toggle("active"),C()});function M(){y.classList.remove("hidden"),y.classList.remove("minimized"),a.isMinimized=!1}function W(){y.classList.add("hidden")}function z(e){e&&e.stopPropagation(),a.isMinimized=!a.isMinimized,a.isMinimized?y.classList.add("minimized"):y.classList.remove("minimized")}function X(e,n,t){document.getElementById("fbAdsModalTitle").innerText=n,document.getElementById("fbAdsModalMeta").innerText=t,document.getElementById("fbAdsModalBody").innerHTML=e,document.getElementById("fbAdsModalOverlay").style.display="flex",Q(document.getElementById("fbAdsModalBody"))}function O(){document.getElementById("fbAdsModalOverlay").style.display="none"}function K(e,n){if(typeof ClipboardItem<"u"){const t=new Blob([e],{type:"text/plain"}),i=new Blob([n],{type:"text/html"});navigator.clipboard.write([new ClipboardItem({"text/plain":t,"text/html":i})]).catch(s=>{console.error("Rich copy failed, falling back to plain:",s),navigator.clipboard.writeText(e)})}else navigator.clipboard.writeText(e)}function Q(e){e.querySelectorAll(".fb-ads-copy-btn").forEach(t=>{t.addEventListener("click",i=>{const s=i.currentTarget,l=decodeURIComponent(s.dataset.copyText),d={url:s.dataset.url?decodeURIComponent(s.dataset.url):"",campaignDuration:s.dataset.campaignDuration||"",campaignAds:s.dataset.campaignAds||"",libId:s.dataset.adLibId||"",adDuration:s.dataset.adDuration||"",adDates:s.dataset.adDates||""},m=`
             <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #374151;">
                 <p style="margin-bottom: 8px;">
                    <strong>Campaign:</strong> <a href="${d.url}">${d.url}</a><br>
                    ${d.campaignDuration?`<strong>Duration:</strong> ${d.campaignDuration} days`:""} 
                    ${d.campaignAds?`• ${d.campaignAds} ads`:""}
                 </p>
                 <p style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                    <strong>Library ID:</strong> <a href="https://www.facebook.com/ads/library/?id=${d.libId}">${d.libId}</a><br>
                    <strong>Dates:</strong> ${d.adDates} | <strong>Ad Duration:</strong> ${d.adDuration} days
                 </p>
                 <div>
                    ${l.replace(/\n/g,"<br>")}
                 </div>
             </div>
        `,c=`Campaign: ${d.url}
Duration: ${d.campaignDuration} days • ${d.campaignAds} ads

Library ID: ${d.libId}
Dates: ${d.adDates} | Ad Duration: ${d.adDuration} days

---

${l}`;K(c,m);const p=s.innerHTML;s.innerHTML=`${b.check} Copied!`,s.classList.add("success"),setTimeout(()=>{s.innerHTML=p,s.classList.remove("success")},2e3)})})}function C(){a.currentView==="timeline"?Z():a.currentView==="top5-text"&&ee()}function U(e){let n=[...e];return console.log("[FB Ads Visualizer] Processing data. Sort:",a.filterSort,"Group:",a.groupByDomain),a.filterText&&(n=n.filter(t=>t.url.toLowerCase().includes(a.filterText)||t.top5&&t.top5.some(i=>i.adText&&i.adText.toLowerCase().includes(a.filterText)))),n.sort((t,i)=>{let s,l;a.filterSort==="ads"?(s=Number(t.adsCount)||0,l=Number(i.adsCount)||0):a.filterSort==="duration"?(s=Number(t.campaignDurationDays)||0,l=Number(i.campaignDurationDays)||0):(s=new Date(t.firstAdvertised).getTime(),l=new Date(i.firstAdvertised).getTime());const d=s-l;return a.sortDirection==="asc"?d:-d}),a.groupByDomain&&n.sort((t,i)=>{const s=T(t.url),l=T(i.url);return s<l?-1:s>l?1:0}),n}function T(e){try{return new URL(e).hostname.replace("www.","")}catch{return e}}function Z(){const e=document.getElementById("fbAdsChartContent");e.classList.remove("fb-ads-bg-gray"),e.innerHTML="";const n=U(a.rawCampaigns);if(n.length===0){e.innerHTML='<div class="fb-ads-empty-state">No campaigns match criteria</div>';return}const t=document.getElementById("fbAdsSubtitle");a.rawCampaigns.length>0&&(new Date(a.rawCampaigns[a.rawCampaigns.length-1].firstAdvertised),new Date(a.rawCampaigns[0].lastAdvertised),t.textContent=`${a.rawCampaigns.length} campaigns analyzed`);let i=new Date,s=new Date(0);n.forEach(o=>{o.firstAdvertised<i&&(i=o.firstAdvertised),o.lastAdvertised>s&&(s=o.lastAdvertised)});const l=864e5;let d=s-i;d<l&&(d=l);const m=Math.max(l*5,d*.1),c=new Date(i.getFullYear(),i.getMonth(),1),p=new Date(s.getFullYear(),s.getMonth()+1,0,23,59,59,999),r=new Date(Math.min(s.getTime()+m,p.getTime())),f=r-c,w=document.createElement("div");w.className="fb-ads-timeline-header",w.innerHTML=`
       <div class="fb-ads-timeline-label"><strong>Campaign</strong></div>
       <div class="fb-ads-timeline-grid"></div>
    `,e.appendChild(w);const u=w.querySelector(".fb-ads-timeline-grid");let B="";if(d<l*60){let o=new Date(c);for(;o<=r;){const g=(o-c)/f*100;if(g>=0&&g<=100){const v=document.createElement("div");v.className="fb-ads-month-marker",v.style.left=`${g}%`,v.innerHTML=`<div class="fb-ads-month-label">${o.toLocaleString("default",{month:"short",day:"numeric"})}</div>`,u.appendChild(v),B+=`<div class="fb-ads-grid-line" style="left: ${g}%"></div>`}o.setDate(o.getDate()+7)}}else{let o=new Date(c);for(o.setDate(1);o<=r;){const g=(o-c)/f*100;if(g>=0&&g<=100){const v=document.createElement("div");v.className="fb-ads-month-marker",v.style.left=`${g}%`,v.innerHTML=`<div class="fb-ads-month-label">${o.toLocaleString("default",{month:"short",year:"2-digit"})}</div>`,u.appendChild(v),B+=`<div class="fb-ads-grid-line" style="left: ${g}%"></div>`}o.setMonth(o.getMonth()+1)}}const A=document.createElement("div");A.className="fb-ads-timeline-body",A.style.position="relative";const H=document.createElement("div");H.className="fb-ads-global-grid",H.innerHTML=`
       <div class="fb-ads-grid-spacer"></div>
       <div class="fb-ads-grid-area">${B}</div>
    `,A.appendChild(H);let G=null;n.forEach(o=>{const g=T(o.url);if(a.groupByDomain&&g!==G){const x=document.createElement("div");x.className="fb-ads-domain-header",x.innerHTML=`<div class="fb-ads-domain-name">${g}</div>`,A.appendChild(x),G=g}const v=document.createElement("div");v.className="fb-ads-campaign-row";const Y=(o.firstAdvertised-c)/f*100,J=Math.max(.5,(o.lastAdvertised-o.firstAdvertised)/f*100),ne=V(o.adsCount);v.innerHTML=`
          <div class="fb-ads-campaign-info">
             <div class="fb-ads-campaign-url" title="${o.url}">
                <a href="${o.url}" target="_blank" style="color: inherit; text-decoration: none;">${o.url}</a>
                <span style="font-size: 11px; margin-left: 6px;">
                  (<a href="https://web.archive.org/web/*/${o.url}/*" target="_blank" style="color: #6b7280; text-decoration: underline;">Archive</a>)
                </span>
             </div>
             <div class="fb-ads-campaign-meta">
               ${o.campaignDurationDays} days • ${o.adsCount} ads
             </div>
          </div>
          <div class="fb-ads-campaign-timeline">
             <div class="fb-ads-timeline-bg-marker" style="left: ${Y}%; width: ${J}%"></div> 
             <div class="fb-ads-campaign-bar" 
                  style="left: ${Y}%; width: ${J}%; background: ${ne}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
             </div>
          </div>
       `,setTimeout(()=>{const x=v.querySelector(".fb-ads-campaign-bar");x&&(x.addEventListener("mouseenter",()=>{const $=new Date(o.firstAdvertised).toLocaleDateString(),R=new Date(o.lastAdvertised).toLocaleDateString();D.innerHTML=`
               <div class="fb-ads-tooltip-header">Campaign Details</div>
               <div class="fb-ads-tooltip-dates">${$} — ${R}</div>
               <a class="fb-ads-tooltip-action" id="fbAdsTooltipViewBtn">Click to View Top 5 Ads</a>
             `,D.style.display="block";const L=D.querySelector("#fbAdsTooltipViewBtn");L&&(L.onclick=ie=>{ie.stopPropagation(),P(o),D.style.display="none"})}),x.addEventListener("mousemove",$=>{const R=$.clientX+15,L=$.clientY+15;D.style.left=R+"px",D.style.top=L+"px"}),x.addEventListener("mouseleave",()=>{D.style.display="none"}))},0),v.addEventListener("click",x=>{x.target.closest("a")||P(o)}),A.appendChild(v)}),e.appendChild(A)}function ee(){var c,p;const e=document.getElementById("fbAdsChartContent");e.classList.add("fb-ads-bg-gray");const n=document.getElementById("fbAdsSubtitle");if(n.textContent=`Top 5 ads for ${a.rawCampaigns.length} campaigns`,!a.rawCampaigns||a.rawCampaigns.length===0){e.innerHTML='<div class="fb-ads-empty-state">No campaign data available</div>';return}let t="";U(a.rawCampaigns).forEach(r=>{const f=u=>new Date(u).toDateString(),w=V(r.adsCount);t+=`
        <div class="fb-ads-text-campaign fb-ads-card-white" style="border-left: 4px solid ${w};">
          <div class="fb-ads-text-header">
            <strong>${r.url}</strong>
          </div>
          <div class="fb-ads-text-meta">
            ${f(r.firstAdvertised)} — ${f(r.lastAdvertised)} | 
            ${r.campaignDurationDays} days | 
            ${r.adsCount} ads
          </div>
          
          ${r.top5&&r.top5.length>0?`
            <div class="fb-ads-text-ads">
              <div class="fb-ads-text-label">Top 5 Ads</div>
              <div class="fb-ads-grid">
              ${r.top5.map(u=>`
                <div class="fb-ads-text-ad">
                  <div class="fb-ads-text-ad-header">
                    <strong>Library ID:</strong> 
                    <a href="https://www.facebook.com/ads/library/?id=${u.libraryId}" 
                       target="_blank" 
                       class="fb-ads-library-id-link">
                      ${u.libraryId}
                    </a>
                  </div>
                  <div class="fb-ads-text-ad-meta">
                    <strong>Dates:</strong> ${new Date(u.startingDate).toLocaleDateString()} — ${new Date(u.endDate).toLocaleDateString()}<br>
                    <strong>Duration:</strong> ${u.duration} days
                  </div>
                  <div class="fb-ads-text-ad-copy">
                     ${u.mediaType==="video"?`<div style="margin-bottom: 8px;"><video src="${u.mediaSrc}" controls style="max-width: 100%; height: auto; border-radius: 4px;"></video></div>`:u.mediaType==="image"?`<div style="margin-bottom: 8px;"><img src="${u.mediaSrc}" style="max-width: 100%; height: auto; border-radius: 4px;"></div>`:""}
                    <strong>Ad Copy:</strong><br>
                    ${u.adText||"[no copy]"}
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
          ${b.ai} Analyze with AI
        </button>`:""}
    <button id="fbAdsCopyAllTextBtn" class="fb-ads-btn fb-ads-btn-action">
      ${b.copy} Copy All Text
    </button>
      </div>
       <div id="fbAdsAIResult" style="display: none; margin-bottom: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; overflow: hidden;">
          <div class="fb-ads-ai-header" style="padding: 12px 16px; background: #dcfce7; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #bbf7d0;">
            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;">${b.ai} AI Analysis</div>
            <button class="fb-ads-ai-minimize" style="background: none; border: none; font-size: 18px; color: #166534; cursor: pointer; line-height: 1;">−</button>
          </div>
          <div class="fb-ads-ai-content" style="padding: 16px; white-space: pre-wrap;"></div>
       </div>
      <div class="fb-ads-text-output">${t}</div>
    `;const s=e.querySelector(".fb-ads-ai-header"),l=e.querySelector(".fb-ads-ai-content"),d=e.querySelector(".fb-ads-ai-minimize");s&&s.addEventListener("click",()=>{const r=l.style.display==="none";l.style.display=r?"block":"none",d.textContent=r?"−":"+"});const m=document.getElementById("fbAdsAIResult");if(a.aiAnalysisResult){const r=m.querySelector(".fb-ads-ai-content");r.innerHTML=a.aiAnalysisResult,m.style.display="block"}a.aiConfig&&((c=document.getElementById("fbAdsAnalyzeBtn"))==null||c.addEventListener("click",se)),(p=document.getElementById("fbAdsCopyAllTextBtn"))==null||p.addEventListener("click",()=>{const r=document.querySelector(".fb-ads-text-output");if(!r)return;const f=r.querySelectorAll("img, video"),w=[];f.forEach(h=>{w.push(h.style.display),h.style.display="none"});const u=window.getSelection(),B=document.createRange();B.selectNodeContents(r),u.removeAllRanges(),u.addRange(B);try{document.execCommand("copy");const h=document.getElementById("fbAdsCopyAllTextBtn"),A=h.innerHTML;h.innerHTML=`${b.check} Copied!`,setTimeout(()=>{h.innerHTML=A},2e3)}catch(h){console.error("Copy failed:",h),alert("Copy failed")}u.removeAllRanges(),f.forEach((h,A)=>{h.style.display=w[A]})})}function P(e){if(!e.top5||e.top5.length===0)return;let n='<div class="fb-ads-list">';e.top5.forEach((t,i)=>{const s=l=>new Date(l).toDateString();n+=`
      <div class="fb-ads-card fb-ads-card-white">
              <div class="fb-ads-ad-header">
                <div class="fb-ads-ad-rank">
                   <div class="fb-ads-rank-number">#${i+1}</div>
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
                    ${b.copy} Copy
                  </button>
                </div>
                <div class="fb-ads-ad-copy">${t.adText||"[No copy available]"}</div>
              </div>
          </div>
      `}),n+="</div>",X(n,`${e.url} `,`${e.adsCount} total ads • ${e.campaignDurationDays} days active`)}function te(){var r;const e=(((r=a.metadata)==null?void 0:r.advertiserName)||"fb_ads_analysis").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""),n=a.rawCampaigns.length;let t=new Date,i=new Date(0);a.rawCampaigns.forEach(f=>{f.firstAdvertised<t&&(t=f.firstAdvertised),f.lastAdvertised>i&&(i=f.lastAdvertised)});const s=f=>`${["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"][f.getMonth()]} -${f.getDate()} -${f.getFullYear()} `,l=s(t),d=s(i),m=`${e} -fb - ads - ${n} -campaigns - from - ${l} -to - ${d}.json`,c="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify({campaigns:a.rawCampaigns,allAds:a.allAds,metadata:a.metadata||{advertiserName:e},aiAnalysisResult:a.aiAnalysisResult||null},null,2)),p=document.createElement("a");p.setAttribute("href",c),p.setAttribute("download",m),document.body.appendChild(p),p.click(),p.remove()}function ae(e){const n=e.target.files[0];if(!n)return;const t=new FileReader;t.onload=i=>{try{const s=JSON.parse(i.target.result);if(!s.campaigns)throw new Error("Invalid format");k(s)}catch(s){alert("Error importing file: "+s.message)}},t.readAsText(n)}function k(e){a.rawCampaigns=e.campaigns||[],a.allAds=e.allAds||[],a.metadata=e.metadata||null,a.isImported=!!e.isImported,a.aiAnalysisResult=e.aiAnalysisResult||null;const n=document.getElementById("fbAdsDownloadBtn");a.isImported?n.style.display="none":n.style.display="inline-flex",a.rawCampaigns.forEach(t=>{t.firstAdvertised=new Date(t.firstAdvertised),t.lastAdvertised=new Date(t.lastAdvertised),t.top5&&t.top5.forEach(i=>{i.startingDate=new Date(i.startingDate),i.endDate=new Date(i.endDate)})}),a.rawCampaigns.sort((t,i)=>new Date(i.firstAdvertised)-new Date(t.firstAdvertised)),C(),M()}async function se(){const e=document.getElementById("fbAdsAnalyzeBtn"),n=document.getElementById("fbAdsAIResult");if(!a.aiConfig){alert("AI Configuration missing. Please check database settings.");return}e.disabled=!0,e.innerHTML=`${b.ai} Analyzing...`,n.style.display="none";let t=[];if(a.rawCampaigns.forEach(d=>{d.top5&&d.top5.forEach(m=>{m.adText&&m.adText.length>10&&t.push(m.adText)})}),t=[...new Set(t)].slice(0,50),t.length===0){alert("No ad text content found to analyze."),e.disabled=!1,e.innerHTML=`${b.ai} Analyze with AI`;return}const i=a.aiConfig.systemPrompt||"You are an expert marketing analyst. Analyze these Facebook ad copies and identify common hooks, pain points addressed, and CTAs used. Provide a concise bulleted summary of the strategy.",s=`Analyze the following ad copies:

`+t.join(`

---

`),l=d=>{const m=d.detail;document.removeEventListener("fbAdsAnalyzeResponse",l);const c=document.getElementById("fbAdsAIResult"),p=document.getElementById("fbAdsAnalyzeBtn");if(m&&m.success){const r=m.analysis.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");if(a.aiAnalysisResult=r,c){const f=c.querySelector(".fb-ads-ai-content");f?f.innerHTML=r:c.innerHTML=`<strong>${b.ai} AI Analysis:</strong> <br><br>${r}`,c.style.display="block"}}else{const r=m&&m.error||"Unknown error";console.error("AI Analysis failed:",r),alert("Analysis failed: "+r)}p&&(p.disabled=!1,p.innerHTML=`${b.ai} Analyze with AI`)};document.addEventListener("fbAdsAnalyzeResponse",l),console.log("[FB Ads Visualizer] Dispatching AI analysis request"),document.dispatchEvent(new CustomEvent("fbAdsAnalyzeRequest",{detail:{systemPrompt:i,userContent:s}})),setTimeout(()=>{const d=document.getElementById("fbAdsAnalyzeBtn");d&&d.disabled&&d.textContent==="🤖 Analyzing..."&&(document.removeEventListener("fbAdsAnalyzeResponse",l),d.disabled=!1,d.innerHTML=`${b.ai} Analyze with AI`,console.warn("[FB Ads Visualizer] AI request timed out"))},6e4)}document.addEventListener("fbAdsImportData",e=>{console.log("[FB Ads Visualizer] Received imported data via CustomEvent"),k(e.detail)}),document.addEventListener("fbAdsReopen",()=>{console.log("[FB Ads Visualizer] Reopening overlay"),M()}),document.addEventListener("fbAdsConfig",e=>{console.log("[FB Ads Visualizer] Received AI Config"),a.aiConfig=e.detail,C()}),document.addEventListener("fbAdsStatus",e=>{const{scrolling:n,adsFound:t,message:i}=e.detail;n&&(y.classList.remove("hidden"),y.classList.add("minimized"),a.isMinimized=!0);const s=document.getElementById("fbAdsMinimizedBar"),l=s.querySelector(".fb-ads-mini-icon"),d=s.querySelector(".fb-ads-mini-text"),m=document.getElementById("fbAdsMaximizeBtn");if(n){if(l.innerHTML=`<span class="fb-ads-mini-spinner">${b.refresh}</span>`,d.textContent=i,m.style.display="none",!document.getElementById("fbAdsMiniSpinnerStyle")){const c=document.createElement("style");c.id="fbAdsMiniSpinnerStyle",c.textContent=`
      @keyframes fbAdsSpin {100 % { transform: rotate(360deg); }}
      .fb-ads-mini-spinner {display: inline-block; animation: fbAdsSpin 1s linear infinite; }
      .fb-ads-mini-spinner svg { width: 20px; height: 20px; }
      `,document.head.appendChild(c)}}else l.innerHTML=`<img src="${E}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`,d.textContent="Analysis Ready!",s.style.background="",m.style.display="block"}),window.fbAdsReopenOverlay=M;const S=document.getElementById("fbAdsImportedData");if(S)try{const e=JSON.parse(S.textContent);console.log("[FB Ads Visualizer] Found pre-injected data, loading..."),k(e),S.remove()}catch(e){console.error("[FB Ads Visualizer] Error loading pre-injected data:",e)}})();

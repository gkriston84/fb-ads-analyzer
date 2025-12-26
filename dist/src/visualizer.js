(function(){var P;console.log("[FB Ads Analyzer] Visualizer script loaded");const a={rawCampaigns:[],allAds:[],filterText:"",filterSort:"recent",groupByDomain:!1,isMinimized:!0,currentView:"timeline",aiConfig:null,metadata:null,sortDirection:"asc",isImported:!1};function H(e){return e>=100?"#ef4444":e>=50?"#f97316":e>=20?"#eab308":e>=10?"#22c55e":e>=5?"#3b82f6":"#8b5cf6"}const I=document.getElementById("fbAdsConfig"),$=((P=I==null?void 0:I.dataset)==null?void 0:P.logoUrl)||"",v=document.createElement("div");v.id="fbAdsAnalyzerOverlay",v.className="hidden minimized",v.innerHTML=`
      <div class="fb-ads-minimized-bar" id="fbAdsMinimizedBar">
        <div class="fb-ads-mini-content">
          <div class="fb-ads-mini-icon">
            <img src="${$}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
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
                <img src="${$}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb;">
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
    `,document.body.appendChild(v);const w=document.createElement("div");w.className="fb-ads-tooltip",v.appendChild(w),document.getElementById("fbAdsCloseBtn").addEventListener("click",J),document.getElementById("fbAdsMinimizeBtn").addEventListener("click",L),document.getElementById("fbAdsMaximizeBtn").addEventListener("click",L),document.getElementById("fbAdsMinimizedBar").addEventListener("click",L),document.getElementById("fbAdsModalClose").addEventListener("click",q),document.getElementById("fbAdsModalOverlay").addEventListener("click",e=>{e.target.id==="fbAdsModalOverlay"&&q()}),document.getElementById("fbAdsFilterInput").addEventListener("input",e=>{a.filterText=e.target.value.toLowerCase(),D()}),document.getElementById("fbAdsDownloadBtn").addEventListener("click",ee),document.getElementById("fbAdsImportBtn").addEventListener("click",()=>{document.getElementById("fbAdsImportInput").click()}),document.getElementById("fbAdsImportInput").addEventListener("change",te);const N=document.querySelectorAll("[data-view]");N.forEach(e=>{e.addEventListener("click",i=>{N.forEach(d=>d.classList.remove("active")),i.target.classList.add("active"),a.currentView=i.target.getAttribute("data-view");const t=document.getElementById("fbAdsTimelineLegend");a.currentView==="timeline"?t.style.display="flex":t.style.display="none",D()})});const F=document.querySelectorAll("[data-sort]"),j=()=>{F.forEach(e=>{const i=e.getAttribute("data-sort");let t=e.innerText.replace(/ [↑↓]/,"");a.filterSort===i?(e.classList.add("active"),t+=a.sortDirection==="asc"?" ↑":" ↓"):e.classList.remove("active"),e.innerText=t})};F.forEach(e=>{e.addEventListener("click",i=>{const t=i.target.getAttribute("data-sort");a.filterSort===t?a.sortDirection=a.sortDirection==="asc"?"desc":"asc":(t==="recent"?a.sortDirection="asc":a.sortDirection="desc",a.filterSort=t),j(),D()})}),j();const V=document.getElementById("fbAdsGroupDomainBtn");V.addEventListener("click",()=>{a.groupByDomain=!a.groupByDomain,V.classList.toggle("active"),D()});function T(){v.classList.remove("hidden"),v.classList.remove("minimized"),a.isMinimized=!1}function J(){v.classList.add("hidden")}function L(e){e&&e.stopPropagation(),a.isMinimized=!a.isMinimized,a.isMinimized?v.classList.add("minimized"):v.classList.remove("minimized")}function K(e,i,t){document.getElementById("fbAdsModalTitle").innerText=i,document.getElementById("fbAdsModalMeta").innerText=t,document.getElementById("fbAdsModalBody").innerHTML=e,document.getElementById("fbAdsModalOverlay").style.display="flex",X(document.getElementById("fbAdsModalBody"))}function q(){document.getElementById("fbAdsModalOverlay").style.display="none"}function W(e,i){if(typeof ClipboardItem<"u"){const t=new Blob([e],{type:"text/plain"}),d=new Blob([i],{type:"text/html"});navigator.clipboard.write([new ClipboardItem({"text/plain":t,"text/html":d})]).catch(s=>{console.error("Rich copy failed, falling back to plain:",s),navigator.clipboard.writeText(e)})}else navigator.clipboard.writeText(e)}function X(e){e.querySelectorAll(".fb-ads-copy-btn").forEach(t=>{t.addEventListener("click",d=>{const s=d.currentTarget,r=decodeURIComponent(s.dataset.copyText),n={url:s.dataset.url?decodeURIComponent(s.dataset.url):"",campaignDuration:s.dataset.campaignDuration||"",campaignAds:s.dataset.campaignAds||"",libId:s.dataset.adLibId||"",adDuration:s.dataset.adDuration||"",adDates:s.dataset.adDates||""},b=`
             <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #374151;">
                 <p style="margin-bottom: 8px;">
                    <strong>Campaign:</strong> <a href="${n.url}">${n.url}</a><br>
                    ${n.campaignDuration?`<strong>Duration:</strong> ${n.campaignDuration} days`:""} 
                    ${n.campaignAds?`• ${n.campaignAds} ads`:""}
                 </p>
                 <p style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                    <strong>Library ID:</strong> <a href="https://www.facebook.com/ads/library/?id=${n.libId}">${n.libId}</a><br>
                    <strong>Dates:</strong> ${n.adDates} | <strong>Ad Duration:</strong> ${n.adDuration} days
                 </p>
                 <div>
                    ${r.replace(/\n/g,"<br>")}
                 </div>
             </div>
        `,c=`Campaign: ${n.url}
Duration: ${n.campaignDuration} days • ${n.campaignAds} ads

Library ID: ${n.libId}
Dates: ${n.adDates} | Ad Duration: ${n.adDuration} days

---

${r}`;W(c,b);const u=s.innerHTML;s.innerHTML="✅ Copied!",s.classList.add("success"),setTimeout(()=>{s.innerHTML=u,s.classList.remove("success")},2e3)})})}function D(){a.currentView==="timeline"?Q():a.currentView==="top5-text"&&Z()}function O(e){let i=[...e];return console.log("[FB Ads Visualizer] Processing data. Sort:",a.filterSort,"Group:",a.groupByDomain),a.filterText&&(i=i.filter(t=>t.url.toLowerCase().includes(a.filterText)||t.top5&&t.top5.some(d=>d.adText&&d.adText.toLowerCase().includes(a.filterText)))),i.sort((t,d)=>{let s,r;a.filterSort==="ads"?(s=Number(t.adsCount)||0,r=Number(d.adsCount)||0):a.filterSort==="duration"?(s=Number(t.campaignDurationDays)||0,r=Number(d.campaignDurationDays)||0):(s=new Date(t.firstAdvertised).getTime(),r=new Date(d.firstAdvertised).getTime());const n=s-r;return a.sortDirection==="asc"?n:-n}),a.groupByDomain&&i.sort((t,d)=>{const s=M(t.url),r=M(d.url);return s<r?-1:s>r?1:0}),i}function M(e){try{return new URL(e).hostname.replace("www.","")}catch{return e}}function Q(){const e=document.getElementById("fbAdsChartContent");e.classList.remove("fb-ads-bg-gray"),e.innerHTML="";const i=O(a.rawCampaigns);if(i.length===0){e.innerHTML='<div class="fb-ads-empty-state">No campaigns match criteria</div>';return}const t=document.getElementById("fbAdsSubtitle");a.rawCampaigns.length>0&&(new Date(a.rawCampaigns[a.rawCampaigns.length-1].firstAdvertised),new Date(a.rawCampaigns[0].lastAdvertised),t.textContent=`${a.rawCampaigns.length} campaigns analyzed`);let d=new Date,s=new Date(0);i.forEach(o=>{o.firstAdvertised<d&&(d=o.firstAdvertised),o.lastAdvertised>s&&(s=o.lastAdvertised)});const r=864e5;let n=s-d;n<r&&(n=r);const b=Math.max(r*5,n*.1),c=new Date(d.getFullYear(),d.getMonth(),1),u=new Date(s.getFullYear(),s.getMonth()+1,0,23,59,59,999),l=new Date(Math.min(s.getTime()+b,u.getTime())),f=l-c,A=document.createElement("div");A.className="fb-ads-timeline-header",A.innerHTML=`
       <div class="fb-ads-timeline-label"><strong>Campaign</strong></div>
       <div class="fb-ads-timeline-grid"></div>
    `,e.appendChild(A);const m=A.querySelector(".fb-ads-timeline-grid");let C="";if(n<r*60){let o=new Date(c);for(;o<=l;){const g=(o-c)/f*100;if(g>=0&&g<=100){const p=document.createElement("div");p.className="fb-ads-month-marker",p.style.left=`${g}%`,p.innerHTML=`<div class="fb-ads-month-label">${o.toLocaleString("default",{month:"short",day:"numeric"})}</div>`,m.appendChild(p),C+=`<div class="fb-ads-grid-line" style="left: ${g}%"></div>`}o.setDate(o.getDate()+7)}}else{let o=new Date(c);for(o.setDate(1);o<=l;){const g=(o-c)/f*100;if(g>=0&&g<=100){const p=document.createElement("div");p.className="fb-ads-month-marker",p.style.left=`${g}%`,p.innerHTML=`<div class="fb-ads-month-label">${o.toLocaleString("default",{month:"short",year:"2-digit"})}</div>`,m.appendChild(p),C+=`<div class="fb-ads-grid-line" style="left: ${g}%"></div>`}o.setMonth(o.getMonth()+1)}}const h=document.createElement("div");h.className="fb-ads-timeline-body",h.style.position="relative";const S=document.createElement("div");S.className="fb-ads-global-grid",S.innerHTML=`
       <div class="fb-ads-grid-spacer"></div>
       <div class="fb-ads-grid-area">${C}</div>
    `,h.appendChild(S);let _=null;i.forEach(o=>{const g=M(o.url);if(a.groupByDomain&&g!==_){const x=document.createElement("div");x.className="fb-ads-domain-header",x.innerHTML=`<div class="fb-ads-domain-name">${g}</div>`,h.appendChild(x),_=g}const p=document.createElement("div");p.className="fb-ads-campaign-row";const G=(o.firstAdvertised-c)/f*100,Y=Math.max(.5,(o.lastAdvertised-o.firstAdvertised)/f*100),se=H(o.adsCount);p.innerHTML=`
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
             <div class="fb-ads-timeline-bg-marker" style="left: ${G}%; width: ${Y}%"></div> 
             <div class="fb-ads-campaign-bar" 
                  style="left: ${G}%; width: ${Y}%; background: ${se}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
             </div>
          </div>
       `,setTimeout(()=>{const x=p.querySelector(".fb-ads-campaign-bar");x&&(x.addEventListener("mouseenter",()=>{const B=new Date(o.firstAdvertised).toLocaleDateString(),R=new Date(o.lastAdvertised).toLocaleDateString();w.innerHTML=`
               <div class="fb-ads-tooltip-header">Campaign Details</div>
               <div class="fb-ads-tooltip-dates">${B} — ${R}</div>
               <a class="fb-ads-tooltip-action" id="fbAdsTooltipViewBtn">Click to View Top 5 Ads</a>
             `,w.style.display="block";const E=w.querySelector("#fbAdsTooltipViewBtn");E&&(E.onclick=ne=>{ne.stopPropagation(),U(o),w.style.display="none"})}),x.addEventListener("mousemove",B=>{const R=B.clientX+15,E=B.clientY+15;w.style.left=R+"px",w.style.top=E+"px"}),x.addEventListener("mouseleave",()=>{w.style.display="none"}))},0),p.addEventListener("click",x=>{x.target.closest("a")||U(o)}),h.appendChild(p)}),e.appendChild(h)}function Z(){var c,u;const e=document.getElementById("fbAdsChartContent");e.classList.add("fb-ads-bg-gray");const i=document.getElementById("fbAdsSubtitle");if(i.textContent=`Top 5 ads for ${a.rawCampaigns.length} campaigns`,!a.rawCampaigns||a.rawCampaigns.length===0){e.innerHTML='<div class="fb-ads-empty-state">No campaign data available</div>';return}let t="";O(a.rawCampaigns).forEach(l=>{const f=m=>new Date(m).toDateString(),A=H(l.adsCount);t+=`
        <div class="fb-ads-text-campaign fb-ads-card-white" style="border-left: 4px solid ${A};">
          <div class="fb-ads-text-header">
            <strong>${l.url}</strong>
          </div>
          <div class="fb-ads-text-meta">
            ${f(l.firstAdvertised)} — ${f(l.lastAdvertised)} | 
            ${l.campaignDurationDays} days | 
            ${l.adsCount} ads
          </div>
          
          ${l.top5&&l.top5.length>0?`
            <div class="fb-ads-text-ads">
              <div class="fb-ads-text-label">Top 5 Ads</div>
              <div class="fb-ads-grid">
              ${l.top5.map(m=>`
                <div class="fb-ads-text-ad">
                  <div class="fb-ads-text-ad-header">
                    <strong>Library ID:</strong> 
                    <a href="https://www.facebook.com/ads/library/?id=${m.libraryId}" 
                       target="_blank" 
                       class="fb-ads-library-id-link">
                      ${m.libraryId}
                    </a>
                  </div>
                  <div class="fb-ads-text-ad-meta">
                    <strong>Dates:</strong> ${new Date(m.startingDate).toLocaleDateString()} — ${new Date(m.endDate).toLocaleDateString()}<br>
                    <strong>Duration:</strong> ${m.duration} days
                  </div>
                  <div class="fb-ads-text-ad-copy">
                     ${m.mediaType==="video"?`<div style="margin-bottom: 8px;"><video src="${m.mediaSrc}" controls style="max-width: 100%; height: auto; border-radius: 4px;"></video></div>`:m.mediaType==="image"?`<div style="margin-bottom: 8px;"><img src="${m.mediaSrc}" style="max-width: 100%; height: auto; border-radius: 4px;"></div>`:""}
                    <strong>Ad Copy:</strong><br>
                    ${m.adText||"[no copy]"}
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
          🤖 Analyze with AI
        </button>`:""}
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
      <div class="fb-ads-text-output">${t}</div>
    `;const s=e.querySelector(".fb-ads-ai-header"),r=e.querySelector(".fb-ads-ai-content"),n=e.querySelector(".fb-ads-ai-minimize");s&&s.addEventListener("click",()=>{const l=r.style.display==="none";r.style.display=l?"block":"none",n.textContent=l?"−":"+"});const b=document.getElementById("fbAdsAIResult");if(a.aiAnalysisResult){const l=b.querySelector(".fb-ads-ai-content");l.innerHTML=a.aiAnalysisResult,b.style.display="block"}a.aiConfig&&((c=document.getElementById("fbAdsAnalyzeBtn"))==null||c.addEventListener("click",ae)),(u=document.getElementById("fbAdsCopyAllTextBtn"))==null||u.addEventListener("click",()=>{const l=document.querySelector(".fb-ads-text-output");if(!l)return;const f=l.querySelectorAll("img, video"),A=[];f.forEach(y=>{A.push(y.style.display),y.style.display="none"});const m=window.getSelection(),C=document.createRange();C.selectNodeContents(l),m.removeAllRanges(),m.addRange(C);try{document.execCommand("copy");const y=document.getElementById("fbAdsCopyAllTextBtn"),h=y.textContent;y.textContent="✅ Copied!",setTimeout(()=>{y.textContent=h},2e3)}catch(y){console.error("Copy failed:",y),alert("Copy failed")}m.removeAllRanges(),f.forEach((y,h)=>{y.style.display=A[h]})})}function U(e){if(!e.top5||e.top5.length===0)return;let i='<div class="fb-ads-list">';e.top5.forEach((t,d)=>{const s=r=>new Date(r).toDateString();i+=`
      <div class="fb-ads-card fb-ads-card-white">
              <div class="fb-ads-ad-header">
                <div class="fb-ads-ad-rank">
                   <div class="fb-ads-rank-number">#${d+1}</div>
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
                    📋 Copy
                  </button>
                </div>
                <div class="fb-ads-ad-copy">${t.adText||"[No copy available]"}</div>
              </div>
          </div>
      `}),i+="</div>",K(i,`${e.url} `,`${e.adsCount} total ads • ${e.campaignDurationDays} days active`)}function ee(){var l;const e=(((l=a.metadata)==null?void 0:l.advertiserName)||"fb_ads_analysis").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""),i=a.rawCampaigns.length;let t=new Date,d=new Date(0);a.rawCampaigns.forEach(f=>{f.firstAdvertised<t&&(t=f.firstAdvertised),f.lastAdvertised>d&&(d=f.lastAdvertised)});const s=f=>`${["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"][f.getMonth()]} -${f.getDate()} -${f.getFullYear()} `,r=s(t),n=s(d),b=`${e} -fb - ads - ${i} -campaigns - from - ${r} -to - ${n}.json`,c="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify({campaigns:a.rawCampaigns,allAds:a.allAds,metadata:a.metadata||{advertiserName:e},aiAnalysisResult:a.aiAnalysisResult||null},null,2)),u=document.createElement("a");u.setAttribute("href",c),u.setAttribute("download",b),document.body.appendChild(u),u.click(),u.remove()}function te(e){const i=e.target.files[0];if(!i)return;const t=new FileReader;t.onload=d=>{try{const s=JSON.parse(d.target.result);if(!s.campaigns)throw new Error("Invalid format");z(s)}catch(s){alert("Error importing file: "+s.message)}},t.readAsText(i)}function z(e){a.rawCampaigns=e.campaigns||[],a.allAds=e.allAds||[],a.metadata=e.metadata||null,a.isImported=!!e.isImported,a.aiAnalysisResult=e.aiAnalysisResult||null;const i=document.getElementById("fbAdsDownloadBtn");a.isImported?i.style.display="none":i.style.display="inline-flex",a.rawCampaigns.forEach(t=>{t.firstAdvertised=new Date(t.firstAdvertised),t.lastAdvertised=new Date(t.lastAdvertised),t.top5&&t.top5.forEach(d=>{d.startingDate=new Date(d.startingDate),d.endDate=new Date(d.endDate)})}),a.rawCampaigns.sort((t,d)=>new Date(d.firstAdvertised)-new Date(t.firstAdvertised)),D(),T()}async function ae(){const e=document.getElementById("fbAdsAnalyzeBtn"),i=document.getElementById("fbAdsAIResult");if(!a.aiConfig||!a.aiConfig.apiKey){alert("AI Configuration missing. Please check database settings.");return}e.disabled=!0,e.textContent="🤖 Analyzing...",i.style.display="none";let t=[];if(a.rawCampaigns.forEach(n=>{n.top5&&n.top5.forEach(b=>{b.adText&&b.adText.length>10&&t.push(b.adText)})}),t=[...new Set(t)].slice(0,50),t.length===0){alert("No ad text content found to analyze."),e.disabled=!1,e.textContent="🤖 Analyze with AI";return}const d=a.aiConfig.systemPrompt||"You are an expert marketing analyst. Analyze these Facebook ad copies and identify common hooks, pain points addressed, and CTAs used. Provide a concise bulleted summary of the strategy.",s=`Analyze the following ad copies:

`+t.join(`

---

`),r=n=>{const b=n.detail;document.removeEventListener("fbAdsAnalyzeResponse",r);const c=document.getElementById("fbAdsAIResult"),u=document.getElementById("fbAdsAnalyzeBtn");if(b&&b.success){const l=b.analysis.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");if(a.aiAnalysisResult=l,c){const f=c.querySelector(".fb-ads-ai-content");f?f.innerHTML=l:c.innerHTML=`<strong>🤖 AI Analysis:</strong> <br><br>${l}`,c.style.display="block"}}else{const l=b&&b.error||"Unknown error";console.error("AI Analysis failed:",l),alert("Analysis failed: "+l)}u&&(u.disabled=!1,u.textContent="🤖 Analyze with AI")};document.addEventListener("fbAdsAnalyzeResponse",r),console.log("[FB Ads Visualizer] Dispatching AI analysis request"),document.dispatchEvent(new CustomEvent("fbAdsAnalyzeRequest",{detail:{apiKey:a.aiConfig.apiKey,systemPrompt:d,userContent:s}})),setTimeout(()=>{const n=document.getElementById("fbAdsAnalyzeBtn");n&&n.disabled&&n.textContent==="🤖 Analyzing..."&&(document.removeEventListener("fbAdsAnalyzeResponse",r),n.disabled=!1,n.textContent="🤖 Analyze with AI",console.warn("[FB Ads Visualizer] AI request timed out"))},6e4)}document.addEventListener("fbAdsImportData",e=>{console.log("[FB Ads Visualizer] Received imported data via CustomEvent"),z(e.detail)}),document.addEventListener("fbAdsReopen",()=>{console.log("[FB Ads Visualizer] Reopening overlay"),T()}),document.addEventListener("fbAdsConfig",e=>{console.log("[FB Ads Visualizer] Received AI Config"),a.aiConfig=e.detail,D()}),document.addEventListener("fbAdsStatus",e=>{const{scrolling:i,adsFound:t,message:d}=e.detail;i&&(v.classList.remove("hidden"),v.classList.add("minimized"),a.isMinimized=!0);const s=document.getElementById("fbAdsMinimizedBar"),r=s.querySelector(".fb-ads-mini-icon"),n=s.querySelector(".fb-ads-mini-text"),b=document.getElementById("fbAdsMaximizeBtn");if(i){if(r.innerHTML='<span class="fb-ads-mini-spinner">🔄</span>',n.textContent=d,b.style.display="none",!document.getElementById("fbAdsMiniSpinnerStyle")){const c=document.createElement("style");c.id="fbAdsMiniSpinnerStyle",c.textContent=`
      @keyframes fbAdsSpin {100 % { transform: rotate(360deg); }}
      .fb-ads-mini-spinner {display: inline-block; animation: fbAdsSpin 1s linear infinite; }
      `,document.head.appendChild(c)}}else r.innerHTML=`<img src="${$}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`,n.textContent="Analysis Ready!",s.style.background="",b.style.display="block"}),window.fbAdsReopenOverlay=T;const k=document.getElementById("fbAdsImportedData");if(k)try{const e=JSON.parse(k.textContent);console.log("[FB Ads Visualizer] Found pre-injected data, loading..."),z(e),k.remove()}catch(e){console.error("[FB Ads Visualizer] Error loading pre-injected data:",e)}})();

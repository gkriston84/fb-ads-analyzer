(function() {
  console.log("[FB Ads Scraper] Injected into page context");
  let results = [];
  let isRunning = false;
  document.body.setAttribute("data-fb-ads-scraper-loaded", "true");
  function autoScroller() {
    return new Promise((resolve) => {
      console.log("[FB Ads Scraper] Starting auto-scroll...");
      let lastHeight = document.body.scrollHeight;
      let noChangeCount = 0;
      const startTime = Date.now();
      const updateStatus = (count, done = false) => {
        const elapsed = Math.round((Date.now() - startTime) / 1e3);
        document.dispatchEvent(new CustomEvent("fbAdsStatus", {
          detail: {
            scrolling: !done,
            adsFound: count,
            elapsed,
            message: done ? `Analysis Complete (${elapsed}s)` : `Analyzing... (${elapsed}s)`
          }
        }));
      };
      const timer = setInterval(() => {
        window.scrollTo(0, document.body.scrollHeight);
        const links = document.querySelectorAll('a[href*="/ads/library/?id="]');
        let uniqueCount = 0;
        const seen = /* @__PURE__ */ new Set();
        links.forEach((l) => {
          const m = l.href.match(/id=(\d+)/);
          if (m && !seen.has(m[1])) {
            seen.add(m[1]);
            uniqueCount++;
          }
        });
        updateStatus(uniqueCount);
        const newHeight = document.body.scrollHeight;
        if (newHeight === lastHeight) {
          noChangeCount++;
        } else {
          noChangeCount = 0;
          lastHeight = newHeight;
        }
        if (noChangeCount >= 6) {
          clearInterval(timer);
          updateStatus(uniqueCount, true);
          console.log("[FB Ads Scraper] Auto-scroll finished. Ads found:", uniqueCount);
          resolve();
        }
      }, 500);
    });
  }
  function adsAnalyzer() {
    const monthMap = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Sept: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11
    };
    const toMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const inclusiveDayDiff = (start, end) => Math.round((toMidnight(end) - toMidnight(start)) / 864e5) + 1;
    const parseDate = (m, d, y) => new Date(Number(y), monthMap[m], Number(d));
    const formatDate = (d) => {
      const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };
    const libIdRe = /\bLibrary ID:\s*(\d+)\b/;
    const dateRangeRe = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})\s*,\s*(\d{4})\s*[-–—]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})\s*,\s*(\d{4})/i;
    const startedRunningRe = /\bStarted running on\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})\s*,\s*(\d{4})/i;
    const extractLibraryId = (text) => {
      var _a;
      return ((_a = text == null ? void 0 : text.match(libIdRe)) == null ? void 0 : _a[1]) ?? null;
    };
    const extractDates = (text) => {
      const r = text.match(dateRangeRe);
      if (r) return { start: parseDate(r[1], r[2], r[3]), end: parseDate(r[4], r[5], r[6]) };
      const s = text.match(startedRunningRe);
      if (s) return { start: parseDate(s[1], s[2], s[3]), end: /* @__PURE__ */ new Date() };
      return null;
    };
    const findOwningContainer = (el) => {
      let cur = el;
      for (let i = 0; i < 25 && cur; i++) {
        const txt = cur.innerText || "";
        if (txt.includes("Library ID:") && (dateRangeRe.test(txt) || startedRunningRe.test(txt))) {
          return cur;
        }
        cur = cur.parentElement;
      }
      return null;
    };
    const stripAllQueryAndTracking = (rawUrl) => {
      try {
        const u = new URL(rawUrl, location.href);
        u.search = "";
        u.hash = "";
        const path = u.pathname.replace(/\/+$/, "") || "/";
        return `${u.protocol}//${u.host}${path}`;
      } catch {
        return null;
      }
    };
    const unwrapFacebookRedirect = (rawUrl) => {
      try {
        const u = new URL(rawUrl, location.href);
        const host = u.host.toLowerCase();
        if (!host.includes("facebook.com")) return rawUrl;
        const target = u.searchParams.get("u");
        if (!target) return rawUrl;
        const decoded = decodeURIComponent(target);
        return decoded;
      } catch {
        return rawUrl;
      }
    };
    const domainPathKey = (rawUrl) => {
      try {
        const u = new URL(rawUrl, location.href);
        const path = u.pathname.replace(/\/+$/, "") || "/";
        return `${u.host}${path}`;
      } catch {
        return null;
      }
    };
    const extractAdTextAndLinks = (el) => {
      var _a, _b;
      const card = el.closest("div.xh8yej3");
      if (!card) return { adText: null, links: [] };
      const adText = ((_b = (_a = card.querySelector('[style="white-space: pre-wrap;"]')) == null ? void 0 : _a.innerText) == null ? void 0 : _b.trim()) || null;
      const anchors = Array.from(card.querySelectorAll('a[target="_blank"]')).slice(1);
      const seenLinkKeys = /* @__PURE__ */ new Set();
      const links = [];
      let mediaType = null;
      let mediaSrc = null;
      const video = card.querySelector("video");
      if (video && video.src) {
        mediaType = "video";
        mediaSrc = video.src;
      } else {
        const images = Array.from(card.querySelectorAll("img"));
        if (images.length > 1) {
          mediaType = "image";
          mediaSrc = images[1].src;
        } else if (images.length === 1 && !el.innerText.includes("Library ID:")) ;
      }
      for (const a of anchors) {
        const href = a.href;
        if (!href) continue;
        const unwrapped = unwrapFacebookRedirect(href);
        if (unwrapped.startsWith("https://www.facebook.com/help/396404120401278/list") || unwrapped.includes("transparency.meta.com/policies")) {
          continue;
        }
        const cleaned = stripAllQueryAndTracking(unwrapped);
        if (!cleaned) continue;
        const key = domainPathKey(cleaned);
        if (!key || seenLinkKeys.has(key)) continue;
        seenLinkKeys.add(key);
        links.push({ url: cleaned, mediaType, mediaSrc });
      }
      return { adText, links };
    };
    const seenIds = /* @__PURE__ */ new Set();
    const libraryEls = Array.from(document.querySelectorAll("*")).filter((el) => {
      var _a;
      return (_a = el.innerText) == null ? void 0 : _a.includes("Library ID:");
    });
    for (const libEl of libraryEls) {
      const libraryId = extractLibraryId(libEl.innerText);
      if (!libraryId || seenIds.has(libraryId)) continue;
      const container = findOwningContainer(libEl);
      if (!container) continue;
      const dates = extractDates(container.innerText);
      if (!dates) continue;
      const { adText, links } = extractAdTextAndLinks(libEl);
      results.push({
        libraryId,
        startingDate: formatDate(dates.start),
        endDate: formatDate(dates.end),
        duration: inclusiveDayDiff(dates.start, dates.end),
        adText,
        links
      });
      seenIds.add(libraryId);
    }
    results.sort((a, b) => b.duration - a.duration);
    console.log(`[Ads Analyzer] Found ${results.length} ads`);
    return results;
  }
  function logCampaignsWithTop5AdsAndText(results2) {
    if (!Array.isArray(results2)) {
      console.warn("Expected results array");
      return null;
    }
    const parseDate = (s) => new Date(s);
    const dayDiffInclusive = (a, b) => Math.round((b - a) / (1e3 * 60 * 60 * 24)) + 1;
    const campaigns = /* @__PURE__ */ new Map();
    for (const ad of results2) {
      if (!ad || !Array.isArray(ad.links) || !ad.libraryId) continue;
      const start = parseDate(ad.startingDate);
      const end = parseDate(ad.endDate);
      const duration = Number(ad.duration) || 0;
      const copy = typeof ad.adText === "string" ? ad.adText.trim() : "";
      for (const linkObj of ad.links) {
        const url = linkObj.url;
        const mediaType = linkObj.mediaType;
        const mediaSrc = linkObj.mediaSrc;
        if (!campaigns.has(url)) {
          campaigns.set(url, {
            url,
            firstSeen: start,
            lastSeen: end,
            totalAdsCount: 0,
            perCopy: /* @__PURE__ */ new Map()
          });
        }
        const c = campaigns.get(url);
        if (start < c.firstSeen) c.firstSeen = start;
        if (end > c.lastSeen) c.lastSeen = end;
        c.totalAdsCount++;
        const copyKey = copy || "[no-copy]";
        const existing = c.perCopy.get(copyKey);
        const shouldReplace = !existing || duration > existing.duration || duration === existing.duration && (new Date(ad.startingDate) < new Date(existing.startingDate) || ad.startingDate === existing.startingDate && new Date(ad.endDate) > new Date(existing.endDate));
        if (shouldReplace) {
          c.perCopy.set(copyKey, {
            libraryId: ad.libraryId,
            startingDate: ad.startingDate,
            endDate: ad.endDate,
            duration,
            adText: copy,
            // Prioritize storing video if available, else new image, else keep existing
            mediaType: mediaType || (existing ? existing.mediaType : null),
            mediaSrc: mediaSrc || (existing ? existing.mediaSrc : null)
          });
        }
      }
    }
    const campaignsOut = Array.from(campaigns.values()).map((c) => ({
      url: c.url,
      firstAdvertised: c.firstSeen.toISOString(),
      lastAdvertised: c.lastSeen.toISOString(),
      campaignDurationDays: dayDiffInclusive(c.firstSeen, c.lastSeen),
      adsCount: c.totalAdsCount,
      top5: Array.from(c.perCopy.values()).sort((a, b) => b.duration - a.duration).slice(0, 5)
    })).sort((a, b) => new Date(a.firstAdvertised) - new Date(b.firstAdvertised));
    console.log(`[Campaign Processor] Generated ${campaignsOut.length} campaigns`);
    return campaignsOut;
  }
  async function runFullAnalysis() {
    var _a, _b, _c, _d;
    if (isRunning) {
      console.log("[FB Ads Scraper] Already running, skipping");
      return;
    }
    isRunning = true;
    results = [];
    try {
      console.log("[FB Ads Scraper] Step 1: Auto-scrolling...");
      await autoScroller();
      console.log("[FB Ads Scraper] Step 2: Analyzing ads...");
      results = adsAnalyzer();
      console.log("[FB Ads Scraper] Step 3: Processing campaigns...");
      const campaigns = logCampaignsWithTop5AdsAndText(results);
      const advertiserName = ((_b = (_a = document.querySelector('input[placeholder*="Search by"]')) == null ? void 0 : _a.value) == null ? void 0 : _b.trim()) || ((_d = (_c = document.querySelector("h1")) == null ? void 0 : _c.innerText) == null ? void 0 : _d.trim()) || "unknown-advertiser";
      console.log("[FB Ads Scraper] Complete! Sending data...");
      document.dispatchEvent(new CustomEvent("fbAdsImportData", {
        detail: {
          campaigns,
          allAds: results,
          metadata: {
            advertiserName,
            scrapedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      }));
    } catch (error) {
      console.error("[FB Ads Scraper] Error:", error);
      window.postMessage({
        type: "FB_ADS_ERROR",
        error: error.message
      }, "*");
    } finally {
      isRunning = false;
    }
  }
  window.fbAdsAnalyzer = {
    runFullAnalysis,
    results,
    restart: () => {
      console.log("[FB Ads Scraper] Soft restarting...");
      window.scrollTo(0, 0);
      isRunning = false;
      results = [];
      setTimeout(runFullAnalysis, 500);
    }
  };
  document.addEventListener("fbAdsRestart", () => {
    window.fbAdsAnalyzer.restart();
  });
  runFullAnalysis();
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0ZWQuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3RlZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbmplY3RlZCBzY3JpcHQgLSBydW5zIGluIHBhZ2UgY29udGV4dCB3aXRoIGZ1bGwgRE9NIGFjY2Vzc1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGNvbnNvbGUubG9nKCdbRkIgQWRzIFNjcmFwZXJdIEluamVjdGVkIGludG8gcGFnZSBjb250ZXh0Jyk7XHJcblxyXG4gIGxldCByZXN1bHRzID0gW107XHJcbiAgbGV0IGlzUnVubmluZyA9IGZhbHNlO1xyXG5cclxuICAvLyBNYXJrIHNjcmFwZXIgYXMgbG9hZGVkXHJcbiAgZG9jdW1lbnQuYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtZmItYWRzLXNjcmFwZXItbG9hZGVkJywgJ3RydWUnKTtcclxuXHJcbiAgLy8gQXV0by1zY3JvbGwgZnVuY3Rpb25cclxuICBmdW5jdGlvbiBhdXRvU2Nyb2xsZXIoKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ1tGQiBBZHMgU2NyYXBlcl0gU3RhcnRpbmcgYXV0by1zY3JvbGwuLi4nKTtcclxuXHJcbiAgICAgIGxldCBsYXN0SGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgIGxldCBub0NoYW5nZUNvdW50ID0gMDtcclxuXHJcbiAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICBjb25zdCB1cGRhdGVTdGF0dXMgPSAoY291bnQsIGRvbmUgPSBmYWxzZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSBNYXRoLnJvdW5kKChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDApO1xyXG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdmYkFkc1N0YXR1cycsIHtcclxuICAgICAgICAgIGRldGFpbDoge1xyXG4gICAgICAgICAgICBzY3JvbGxpbmc6ICFkb25lLFxyXG4gICAgICAgICAgICBhZHNGb3VuZDogY291bnQsXHJcbiAgICAgICAgICAgIGVsYXBzZWQ6IGVsYXBzZWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IGRvbmUgPyBgQW5hbHlzaXMgQ29tcGxldGUgKCR7ZWxhcHNlZH1zKWAgOiBgQW5hbHl6aW5nLi4uICgke2VsYXBzZWR9cylgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy8gQ291bnQgdW5pcXVlIGFkc1xyXG4gICAgICAgIGNvbnN0IGxpbmtzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYVtocmVmKj1cIi9hZHMvbGlicmFyeS8/aWQ9XCJdJyk7XHJcbiAgICAgICAgbGV0IHVuaXF1ZUNvdW50ID0gMDtcclxuICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGxpbmtzLmZvckVhY2gobCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBtID0gbC5ocmVmLm1hdGNoKC9pZD0oXFxkKykvKTtcclxuICAgICAgICAgIGlmIChtICYmICFzZWVuLmhhcyhtWzFdKSkge1xyXG4gICAgICAgICAgICBzZWVuLmFkZChtWzFdKTtcclxuICAgICAgICAgICAgdW5pcXVlQ291bnQrKztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHN0YXR1cyBiYXJcclxuICAgICAgICB1cGRhdGVTdGF0dXModW5pcXVlQ291bnQpO1xyXG5cclxuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodDtcclxuICAgICAgICBpZiAobmV3SGVpZ2h0ID09PSBsYXN0SGVpZ2h0KSB7XHJcbiAgICAgICAgICBub0NoYW5nZUNvdW50Kys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5vQ2hhbmdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgbGFzdEhlaWdodCA9IG5ld0hlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN0b3AgaWYgbm8gbmV3IGNvbnRlbnQgZm9yIH4zIHNlY29uZHMgKDYgY2hlY2tzICogNTAwbXMpXHJcbiAgICAgICAgaWYgKG5vQ2hhbmdlQ291bnQgPj0gNikge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XHJcbiAgICAgICAgICB1cGRhdGVTdGF0dXModW5pcXVlQ291bnQsIHRydWUpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1tGQiBBZHMgU2NyYXBlcl0gQXV0by1zY3JvbGwgZmluaXNoZWQuIEFkcyBmb3VuZDonLCB1bmlxdWVDb3VudCk7XHJcbiAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyBBZHMgYW5hbHl6ZXIgZnVuY3Rpb25cclxuICBmdW5jdGlvbiBhZHNBbmFseXplcigpIHtcclxuICAgIGNvbnN0IG1vbnRoTWFwID0ge1xyXG4gICAgICBKYW46IDAsIEZlYjogMSwgTWFyOiAyLCBBcHI6IDMsIE1heTogNCwgSnVuOiA1LFxyXG4gICAgICBKdWw6IDYsIEF1ZzogNywgU2VwOiA4LCBTZXB0OiA4LCBPY3Q6IDksIE5vdjogMTAsIERlYzogMTFcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdG9NaWRuaWdodCA9IGQgPT4gbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpKTtcclxuICAgIGNvbnN0IGluY2x1c2l2ZURheURpZmYgPSAoc3RhcnQsIGVuZCkgPT5cclxuICAgICAgTWF0aC5yb3VuZCgodG9NaWRuaWdodChlbmQpIC0gdG9NaWRuaWdodChzdGFydCkpIC8gODY0MDAwMDApICsgMTtcclxuXHJcbiAgICBjb25zdCBwYXJzZURhdGUgPSAobSwgZCwgeSkgPT4gbmV3IERhdGUoTnVtYmVyKHkpLCBtb250aE1hcFttXSwgTnVtYmVyKGQpKTtcclxuICAgIGNvbnN0IGZvcm1hdERhdGUgPSBkID0+IHtcclxuICAgICAgY29uc3QgbSA9IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXTtcclxuICAgICAgcmV0dXJuIGAke21bZC5nZXRNb250aCgpXX0gJHtkLmdldERhdGUoKX0sICR7ZC5nZXRGdWxsWWVhcigpfWA7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGxpYklkUmUgPSAvXFxiTGlicmFyeSBJRDpcXHMqKFxcZCspXFxiLztcclxuICAgIGNvbnN0IGRhdGVSYW5nZVJlID1cclxuICAgICAgL1xcYihKYW58RmVifE1hcnxBcHJ8TWF5fEp1bnxKdWx8QXVnfFNlcHxTZXB0fE9jdHxOb3Z8RGVjKVthLXpdKlxcLj9cXHMrKFxcZHsxLDJ9KVxccyosXFxzKihcXGR7NH0pXFxzKlst4oCT4oCUXVxccyooSmFufEZlYnxNYXJ8QXByfE1heXxKdW58SnVsfEF1Z3xTZXB8U2VwdHxPY3R8Tm92fERlYylbYS16XSpcXC4/XFxzKyhcXGR7MSwyfSlcXHMqLFxccyooXFxkezR9KS9pO1xyXG4gICAgY29uc3Qgc3RhcnRlZFJ1bm5pbmdSZSA9XHJcbiAgICAgIC9cXGJTdGFydGVkIHJ1bm5pbmcgb25cXHMrKEphbnxGZWJ8TWFyfEFwcnxNYXl8SnVufEp1bHxBdWd8U2VwfFNlcHR8T2N0fE5vdnxEZWMpW2Etel0qXFwuP1xccysoXFxkezEsMn0pXFxzKixcXHMqKFxcZHs0fSkvaTtcclxuXHJcbiAgICBjb25zdCBleHRyYWN0TGlicmFyeUlkID0gdGV4dCA9PiB0ZXh0Py5tYXRjaChsaWJJZFJlKT8uWzFdID8/IG51bGw7XHJcblxyXG4gICAgY29uc3QgZXh0cmFjdERhdGVzID0gdGV4dCA9PiB7XHJcbiAgICAgIGNvbnN0IHIgPSB0ZXh0Lm1hdGNoKGRhdGVSYW5nZVJlKTtcclxuICAgICAgaWYgKHIpIHJldHVybiB7IHN0YXJ0OiBwYXJzZURhdGUoclsxXSwgclsyXSwgclszXSksIGVuZDogcGFyc2VEYXRlKHJbNF0sIHJbNV0sIHJbNl0pIH07XHJcbiAgICAgIGNvbnN0IHMgPSB0ZXh0Lm1hdGNoKHN0YXJ0ZWRSdW5uaW5nUmUpO1xyXG4gICAgICBpZiAocykgcmV0dXJuIHsgc3RhcnQ6IHBhcnNlRGF0ZShzWzFdLCBzWzJdLCBzWzNdKSwgZW5kOiBuZXcgRGF0ZSgpIH07XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBmaW5kT3duaW5nQ29udGFpbmVyID0gZWwgPT4ge1xyXG4gICAgICBsZXQgY3VyID0gZWw7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjUgJiYgY3VyOyBpKyspIHtcclxuICAgICAgICBjb25zdCB0eHQgPSBjdXIuaW5uZXJUZXh0IHx8IFwiXCI7XHJcbiAgICAgICAgaWYgKHR4dC5pbmNsdWRlcyhcIkxpYnJhcnkgSUQ6XCIpICYmIChkYXRlUmFuZ2VSZS50ZXN0KHR4dCkgfHwgc3RhcnRlZFJ1bm5pbmdSZS50ZXN0KHR4dCkpKSB7XHJcbiAgICAgICAgICByZXR1cm4gY3VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdXIgPSBjdXIucGFyZW50RWxlbWVudDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgc3RyaXBBbGxRdWVyeUFuZFRyYWNraW5nID0gKHJhd1VybCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHUgPSBuZXcgVVJMKHJhd1VybCwgbG9jYXRpb24uaHJlZik7XHJcbiAgICAgICAgdS5zZWFyY2ggPSBcIlwiO1xyXG4gICAgICAgIHUuaGFzaCA9IFwiXCI7XHJcbiAgICAgICAgY29uc3QgcGF0aCA9ICh1LnBhdGhuYW1lLnJlcGxhY2UoL1xcLyskLywgXCJcIikgfHwgXCIvXCIpO1xyXG4gICAgICAgIHJldHVybiBgJHt1LnByb3RvY29sfS8vJHt1Lmhvc3R9JHtwYXRofWA7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHVud3JhcEZhY2Vib29rUmVkaXJlY3QgPSAocmF3VXJsKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdSA9IG5ldyBVUkwocmF3VXJsLCBsb2NhdGlvbi5ocmVmKTtcclxuICAgICAgICBjb25zdCBob3N0ID0gdS5ob3N0LnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKCFob3N0LmluY2x1ZGVzKFwiZmFjZWJvb2suY29tXCIpKSByZXR1cm4gcmF3VXJsO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHUuc2VhcmNoUGFyYW1zLmdldChcInVcIik7XHJcbiAgICAgICAgaWYgKCF0YXJnZXQpIHJldHVybiByYXdVcmw7XHJcbiAgICAgICAgY29uc3QgZGVjb2RlZCA9IGRlY29kZVVSSUNvbXBvbmVudCh0YXJnZXQpO1xyXG4gICAgICAgIHJldHVybiBkZWNvZGVkO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gcmF3VXJsO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGRvbWFpblBhdGhLZXkgPSAocmF3VXJsKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdSA9IG5ldyBVUkwocmF3VXJsLCBsb2NhdGlvbi5ocmVmKTtcclxuICAgICAgICBjb25zdCBwYXRoID0gKHUucGF0aG5hbWUucmVwbGFjZSgvXFwvKyQvLCBcIlwiKSB8fCBcIi9cIik7XHJcbiAgICAgICAgcmV0dXJuIGAke3UuaG9zdH0ke3BhdGh9YDtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZXh0cmFjdEFkVGV4dEFuZExpbmtzID0gZWwgPT4ge1xyXG4gICAgICBjb25zdCBjYXJkID0gZWwuY2xvc2VzdChcImRpdi54aDh5ZWozXCIpO1xyXG4gICAgICBpZiAoIWNhcmQpIHJldHVybiB7IGFkVGV4dDogbnVsbCwgbGlua3M6IFtdIH07XHJcblxyXG4gICAgICBjb25zdCBhZFRleHQgPVxyXG4gICAgICAgIGNhcmQucXVlcnlTZWxlY3RvcignW3N0eWxlPVwid2hpdGUtc3BhY2U6IHByZS13cmFwO1wiXScpPy5pbm5lclRleHQ/LnRyaW0oKSB8fCBudWxsO1xyXG5cclxuICAgICAgY29uc3QgYW5jaG9ycyA9IEFycmF5LmZyb20oY2FyZC5xdWVyeVNlbGVjdG9yQWxsKCdhW3RhcmdldD1cIl9ibGFua1wiXScpKS5zbGljZSgxKTtcclxuICAgICAgY29uc3Qgc2VlbkxpbmtLZXlzID0gbmV3IFNldCgpO1xyXG4gICAgICBjb25zdCBsaW5rcyA9IFtdO1xyXG5cclxuICAgICAgLy8gRXh0cmFjdCBNZWRpYSAoVmlkZW8gb3IgSW1hZ2UpXHJcbiAgICAgIGxldCBtZWRpYVR5cGUgPSBudWxsO1xyXG4gICAgICBsZXQgbWVkaWFTcmMgPSBudWxsO1xyXG5cclxuICAgICAgLy8gMS4gQ2hlY2sgZm9yIHZpZGVvXHJcbiAgICAgIGNvbnN0IHZpZGVvID0gY2FyZC5xdWVyeVNlbGVjdG9yKCd2aWRlbycpO1xyXG4gICAgICBpZiAodmlkZW8gJiYgdmlkZW8uc3JjKSB7XHJcbiAgICAgICAgbWVkaWFUeXBlID0gJ3ZpZGVvJztcclxuICAgICAgICBtZWRpYVNyYyA9IHZpZGVvLnNyYztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAyLiBDaGVjayBmb3IgaW1hZ2VzIChza2lwIGZpcnN0IG9uZSBhcyBpdCdzIHRoZSBwcm9maWxlIHBpYylcclxuICAgICAgICBjb25zdCBpbWFnZXMgPSBBcnJheS5mcm9tKGNhcmQucXVlcnlTZWxlY3RvckFsbCgnaW1nJykpO1xyXG4gICAgICAgIGlmIChpbWFnZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgbWVkaWFUeXBlID0gJ2ltYWdlJztcclxuICAgICAgICAgIG1lZGlhU3JjID0gaW1hZ2VzWzFdLnNyYztcclxuICAgICAgICB9IGVsc2UgaWYgKGltYWdlcy5sZW5ndGggPT09IDEgJiYgIWVsLmlubmVyVGV4dC5pbmNsdWRlcyhcIkxpYnJhcnkgSUQ6XCIpKSB7XHJcbiAgICAgICAgICAvLyBGYWxsYmFjayBpZiBvbmx5IDEgaW1hZ2UgYW5kIGl0J3Mgbm90IGxpa2VseSB0aGUgc21hbGwgaWNvbiBuZWFyIElEIChoZXVyaXN0aWMpXHJcbiAgICAgICAgICAvLyBCdXQgdXN1YWxseSBmaXJzdCBpbWFnZSBpcyBwcm9maWxlLiBTYWZlIHRvIGRlZmF1bHQgdG8gbnVsbCBpZiBvbmx5IDEgZm91bmQ/XHJcbiAgICAgICAgICAvLyBMZXQncyBzdGljayB0byB0aGUgcnVsZTogXCJUaGUgZmlyc3Qgb25lIGlzIHRoZSBwcm9maWxlLi4uIHNvIHdlIHNob3VsZCBza2lwIHRoYXRcIi5cclxuICAgICAgICAgIC8vIFNvIGlmIGxlbmd0aCA8IDIsIG5vIGFkIGltYWdlLlxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChjb25zdCBhIG9mIGFuY2hvcnMpIHtcclxuICAgICAgICBjb25zdCBocmVmID0gYS5ocmVmO1xyXG4gICAgICAgIGlmICghaHJlZikgY29udGludWU7XHJcblxyXG4gICAgICAgIGNvbnN0IHVud3JhcHBlZCA9IHVud3JhcEZhY2Vib29rUmVkaXJlY3QoaHJlZik7XHJcbiAgICAgICAgaWYgKHVud3JhcHBlZC5zdGFydHNXaXRoKFwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2hlbHAvMzk2NDA0MTIwNDAxMjc4L2xpc3RcIikgfHxcclxuICAgICAgICAgIHVud3JhcHBlZC5pbmNsdWRlcyhcInRyYW5zcGFyZW5jeS5tZXRhLmNvbS9wb2xpY2llc1wiKSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjbGVhbmVkID0gc3RyaXBBbGxRdWVyeUFuZFRyYWNraW5nKHVud3JhcHBlZCk7XHJcbiAgICAgICAgaWYgKCFjbGVhbmVkKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgY29uc3Qga2V5ID0gZG9tYWluUGF0aEtleShjbGVhbmVkKTtcclxuICAgICAgICBpZiAoIWtleSB8fCBzZWVuTGlua0tleXMuaGFzKGtleSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBzZWVuTGlua0tleXMuYWRkKGtleSk7XHJcbiAgICAgICAgbGlua3MucHVzaCh7IHVybDogY2xlYW5lZCwgbWVkaWFUeXBlLCBtZWRpYVNyYyB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHsgYWRUZXh0LCBsaW5rcyB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBzZWVuSWRzID0gbmV3IFNldCgpO1xyXG4gICAgY29uc3QgbGlicmFyeUVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipcIikpXHJcbiAgICAgIC5maWx0ZXIoZWwgPT4gZWwuaW5uZXJUZXh0Py5pbmNsdWRlcyhcIkxpYnJhcnkgSUQ6XCIpKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGxpYkVsIG9mIGxpYnJhcnlFbHMpIHtcclxuICAgICAgY29uc3QgbGlicmFyeUlkID0gZXh0cmFjdExpYnJhcnlJZChsaWJFbC5pbm5lclRleHQpO1xyXG4gICAgICBpZiAoIWxpYnJhcnlJZCB8fCBzZWVuSWRzLmhhcyhsaWJyYXJ5SWQpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGZpbmRPd25pbmdDb250YWluZXIobGliRWwpO1xyXG4gICAgICBpZiAoIWNvbnRhaW5lcikgY29udGludWU7XHJcblxyXG4gICAgICBjb25zdCBkYXRlcyA9IGV4dHJhY3REYXRlcyhjb250YWluZXIuaW5uZXJUZXh0KTtcclxuICAgICAgaWYgKCFkYXRlcykgY29udGludWU7XHJcblxyXG4gICAgICBjb25zdCB7IGFkVGV4dCwgbGlua3MgfSA9IGV4dHJhY3RBZFRleHRBbmRMaW5rcyhsaWJFbCk7XHJcblxyXG4gICAgICByZXN1bHRzLnB1c2goe1xyXG4gICAgICAgIGxpYnJhcnlJZCxcclxuICAgICAgICBzdGFydGluZ0RhdGU6IGZvcm1hdERhdGUoZGF0ZXMuc3RhcnQpLFxyXG4gICAgICAgIGVuZERhdGU6IGZvcm1hdERhdGUoZGF0ZXMuZW5kKSxcclxuICAgICAgICBkdXJhdGlvbjogaW5jbHVzaXZlRGF5RGlmZihkYXRlcy5zdGFydCwgZGF0ZXMuZW5kKSxcclxuICAgICAgICBhZFRleHQsXHJcbiAgICAgICAgbGlua3NcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzZWVuSWRzLmFkZChsaWJyYXJ5SWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYi5kdXJhdGlvbiAtIGEuZHVyYXRpb24pO1xyXG4gICAgY29uc29sZS5sb2coYFtBZHMgQW5hbHl6ZXJdIEZvdW5kICR7cmVzdWx0cy5sZW5ndGh9IGFkc2ApO1xyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgfVxyXG5cclxuICAvLyBQcm9jZXNzIGNhbXBhaWducyB3aXRoIHRvcCA1IGFkc1xyXG4gIGZ1bmN0aW9uIGxvZ0NhbXBhaWduc1dpdGhUb3A1QWRzQW5kVGV4dChyZXN1bHRzKSB7XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzdWx0cykpIHtcclxuICAgICAgY29uc29sZS53YXJuKFwiRXhwZWN0ZWQgcmVzdWx0cyBhcnJheVwiKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGFyc2VEYXRlID0gKHMpID0+IG5ldyBEYXRlKHMpO1xyXG4gICAgY29uc3QgZGF5RGlmZkluY2x1c2l2ZSA9IChhLCBiKSA9PlxyXG4gICAgICBNYXRoLnJvdW5kKChiIC0gYSkgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpICsgMTtcclxuXHJcbiAgICBjb25zdCBjYW1wYWlnbnMgPSBuZXcgTWFwKCk7XHJcblxyXG4gICAgZm9yIChjb25zdCBhZCBvZiByZXN1bHRzKSB7XHJcbiAgICAgIGlmICghYWQgfHwgIUFycmF5LmlzQXJyYXkoYWQubGlua3MpIHx8ICFhZC5saWJyYXJ5SWQpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgY29uc3Qgc3RhcnQgPSBwYXJzZURhdGUoYWQuc3RhcnRpbmdEYXRlKTtcclxuICAgICAgY29uc3QgZW5kID0gcGFyc2VEYXRlKGFkLmVuZERhdGUpO1xyXG4gICAgICBjb25zdCBkdXJhdGlvbiA9IE51bWJlcihhZC5kdXJhdGlvbikgfHwgMDtcclxuICAgICAgY29uc3QgY29weSA9IHR5cGVvZiBhZC5hZFRleHQgPT09IFwic3RyaW5nXCIgPyBhZC5hZFRleHQudHJpbSgpIDogXCJcIjtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgbGlua09iaiBvZiBhZC5saW5rcykge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGxpbmtPYmoudXJsO1xyXG4gICAgICAgIGNvbnN0IG1lZGlhVHlwZSA9IGxpbmtPYmoubWVkaWFUeXBlO1xyXG4gICAgICAgIGNvbnN0IG1lZGlhU3JjID0gbGlua09iai5tZWRpYVNyYztcclxuXHJcbiAgICAgICAgaWYgKCFjYW1wYWlnbnMuaGFzKHVybCkpIHtcclxuICAgICAgICAgIGNhbXBhaWducy5zZXQodXJsLCB7XHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgZmlyc3RTZWVuOiBzdGFydCxcclxuICAgICAgICAgICAgbGFzdFNlZW46IGVuZCxcclxuICAgICAgICAgICAgdG90YWxBZHNDb3VudDogMCxcclxuICAgICAgICAgICAgcGVyQ29weTogbmV3IE1hcCgpXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGMgPSBjYW1wYWlnbnMuZ2V0KHVybCk7XHJcblxyXG4gICAgICAgIGlmIChzdGFydCA8IGMuZmlyc3RTZWVuKSBjLmZpcnN0U2VlbiA9IHN0YXJ0O1xyXG4gICAgICAgIGlmIChlbmQgPiBjLmxhc3RTZWVuKSBjLmxhc3RTZWVuID0gZW5kO1xyXG5cclxuICAgICAgICBjLnRvdGFsQWRzQ291bnQrKztcclxuXHJcbiAgICAgICAgY29uc3QgY29weUtleSA9IGNvcHkgfHwgXCJbbm8tY29weV1cIjtcclxuICAgICAgICBjb25zdCBleGlzdGluZyA9IGMucGVyQ29weS5nZXQoY29weUtleSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNob3VsZFJlcGxhY2UgPVxyXG4gICAgICAgICAgIWV4aXN0aW5nIHx8XHJcbiAgICAgICAgICBkdXJhdGlvbiA+IGV4aXN0aW5nLmR1cmF0aW9uIHx8XHJcbiAgICAgICAgICAoXHJcbiAgICAgICAgICAgIGR1cmF0aW9uID09PSBleGlzdGluZy5kdXJhdGlvbiAmJlxyXG4gICAgICAgICAgICAoXHJcbiAgICAgICAgICAgICAgbmV3IERhdGUoYWQuc3RhcnRpbmdEYXRlKSA8IG5ldyBEYXRlKGV4aXN0aW5nLnN0YXJ0aW5nRGF0ZSkgfHxcclxuICAgICAgICAgICAgICAoXHJcbiAgICAgICAgICAgICAgICBhZC5zdGFydGluZ0RhdGUgPT09IGV4aXN0aW5nLnN0YXJ0aW5nRGF0ZSAmJlxyXG4gICAgICAgICAgICAgICAgbmV3IERhdGUoYWQuZW5kRGF0ZSkgPiBuZXcgRGF0ZShleGlzdGluZy5lbmREYXRlKVxyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHNob3VsZFJlcGxhY2UpIHtcclxuICAgICAgICAgIGMucGVyQ29weS5zZXQoY29weUtleSwge1xyXG4gICAgICAgICAgICBsaWJyYXJ5SWQ6IGFkLmxpYnJhcnlJZCxcclxuICAgICAgICAgICAgc3RhcnRpbmdEYXRlOiBhZC5zdGFydGluZ0RhdGUsXHJcbiAgICAgICAgICAgIGVuZERhdGU6IGFkLmVuZERhdGUsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uLFxyXG4gICAgICAgICAgICBhZFRleHQ6IGNvcHksXHJcbiAgICAgICAgICAgIC8vIFByaW9yaXRpemUgc3RvcmluZyB2aWRlbyBpZiBhdmFpbGFibGUsIGVsc2UgbmV3IGltYWdlLCBlbHNlIGtlZXAgZXhpc3RpbmdcclxuICAgICAgICAgICAgbWVkaWFUeXBlOiBtZWRpYVR5cGUgfHwgKGV4aXN0aW5nID8gZXhpc3RpbmcubWVkaWFUeXBlIDogbnVsbCksXHJcbiAgICAgICAgICAgIG1lZGlhU3JjOiBtZWRpYVNyYyB8fCAoZXhpc3RpbmcgPyBleGlzdGluZy5tZWRpYVNyYyA6IG51bGwpXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYW1wYWlnbnNPdXQgPSBBcnJheS5mcm9tKGNhbXBhaWducy52YWx1ZXMoKSlcclxuICAgICAgLm1hcChjID0+ICh7XHJcbiAgICAgICAgdXJsOiBjLnVybCxcclxuICAgICAgICBmaXJzdEFkdmVydGlzZWQ6IGMuZmlyc3RTZWVuLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgbGFzdEFkdmVydGlzZWQ6IGMubGFzdFNlZW4udG9JU09TdHJpbmcoKSxcclxuICAgICAgICBjYW1wYWlnbkR1cmF0aW9uRGF5czogZGF5RGlmZkluY2x1c2l2ZShjLmZpcnN0U2VlbiwgYy5sYXN0U2VlbiksXHJcbiAgICAgICAgYWRzQ291bnQ6IGMudG90YWxBZHNDb3VudCxcclxuICAgICAgICB0b3A1OiBBcnJheS5mcm9tKGMucGVyQ29weS52YWx1ZXMoKSlcclxuICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmR1cmF0aW9uIC0gYS5kdXJhdGlvbilcclxuICAgICAgICAgIC5zbGljZSgwLCA1KVxyXG4gICAgICB9KSlcclxuICAgICAgLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGEuZmlyc3RBZHZlcnRpc2VkKSAtIG5ldyBEYXRlKGIuZmlyc3RBZHZlcnRpc2VkKSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coYFtDYW1wYWlnbiBQcm9jZXNzb3JdIEdlbmVyYXRlZCAke2NhbXBhaWduc091dC5sZW5ndGh9IGNhbXBhaWduc2ApO1xyXG4gICAgcmV0dXJuIGNhbXBhaWduc091dDtcclxuICB9XHJcblxyXG4gIC8vIE1haW4gZXhlY3V0aW9uIGZ1bmN0aW9uXHJcbiAgYXN5bmMgZnVuY3Rpb24gcnVuRnVsbEFuYWx5c2lzKCkge1xyXG4gICAgaWYgKGlzUnVubmluZykge1xyXG4gICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBTY3JhcGVyXSBBbHJlYWR5IHJ1bm5pbmcsIHNraXBwaW5nJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpc1J1bm5pbmcgPSB0cnVlO1xyXG4gICAgcmVzdWx0cyA9IFtdO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFNjcmFwZXJdIFN0ZXAgMTogQXV0by1zY3JvbGxpbmcuLi4nKTtcclxuICAgICAgYXdhaXQgYXV0b1Njcm9sbGVyKCk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBTY3JhcGVyXSBTdGVwIDI6IEFuYWx5emluZyBhZHMuLi4nKTtcclxuICAgICAgcmVzdWx0cyA9IGFkc0FuYWx5emVyKCk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBTY3JhcGVyXSBTdGVwIDM6IFByb2Nlc3NpbmcgY2FtcGFpZ25zLi4uJyk7XHJcbiAgICAgIGNvbnN0IGNhbXBhaWducyA9IGxvZ0NhbXBhaWduc1dpdGhUb3A1QWRzQW5kVGV4dChyZXN1bHRzKTtcclxuXHJcbiAgICAgIC8vIEV4dHJhY3QgbWV0YWRhdGFcclxuICAgICAgY29uc3QgYWR2ZXJ0aXNlck5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtwbGFjZWhvbGRlcio9XCJTZWFyY2ggYnlcIl0nKT8udmFsdWU/LnRyaW0oKSB8fFxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gxJyk/LmlubmVyVGV4dD8udHJpbSgpIHx8XHJcbiAgICAgICAgJ3Vua25vd24tYWR2ZXJ0aXNlcic7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBTY3JhcGVyXSBDb21wbGV0ZSEgU2VuZGluZyBkYXRhLi4uJyk7XHJcblxyXG4gICAgICAvLyBTZW5kIGRhdGEgdG8gdmlzdWFsaXplclxyXG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZmJBZHNJbXBvcnREYXRhJywge1xyXG4gICAgICAgIGRldGFpbDoge1xyXG4gICAgICAgICAgY2FtcGFpZ25zOiBjYW1wYWlnbnMsXHJcbiAgICAgICAgICBhbGxBZHM6IHJlc3VsdHMsXHJcbiAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICBhZHZlcnRpc2VyTmFtZSxcclxuICAgICAgICAgICAgc2NyYXBlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pKTtcclxuXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdbRkIgQWRzIFNjcmFwZXJdIEVycm9yOicsIGVycm9yKTtcclxuICAgICAgd2luZG93LnBvc3RNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAnRkJfQURTX0VSUk9SJyxcclxuICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZVxyXG4gICAgICB9LCAnKicpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgaXNSdW5uaW5nID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBFeHBvc2UgdG8gd2luZG93IGZvciBtYW51YWwgdHJpZ2dlciBpZiBuZWVkZWRcclxuICB3aW5kb3cuZmJBZHNBbmFseXplciA9IHtcclxuICAgIHJ1bkZ1bGxBbmFseXNpcyxcclxuICAgIHJlc3VsdHMsXHJcbiAgICByZXN0YXJ0OiAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFNjcmFwZXJdIFNvZnQgcmVzdGFydGluZy4uLicpO1xyXG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XHJcbiAgICAgIGlzUnVubmluZyA9IGZhbHNlO1xyXG4gICAgICByZXN1bHRzID0gW107XHJcbiAgICAgIHNldFRpbWVvdXQocnVuRnVsbEFuYWx5c2lzLCA1MDApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgcmVzdGFydCByZXF1ZXN0IGZyb20gdmlzdWFsaXplclxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZiQWRzUmVzdGFydCcsICgpID0+IHtcclxuICAgIHdpbmRvdy5mYkFkc0FuYWx5emVyLnJlc3RhcnQoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1zdGFydCB3aGVuIGluamVjdGVkXHJcbiAgcnVuRnVsbEFuYWx5c2lzKCk7XHJcbn0pKCk7Il0sIm5hbWVzIjpbInJlc3VsdHMiXSwibWFwcGluZ3MiOiJDQUNDLFdBQVk7QUFDWCxVQUFRLElBQUksNkNBQTZDO0FBRXpELE1BQUksVUFBVSxDQUFBO0FBQ2QsTUFBSSxZQUFZO0FBR2hCLFdBQVMsS0FBSyxhQUFhLDhCQUE4QixNQUFNO0FBRy9ELFdBQVMsZUFBZTtBQUN0QixXQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDOUIsY0FBUSxJQUFJLDBDQUEwQztBQUV0RCxVQUFJLGFBQWEsU0FBUyxLQUFLO0FBQy9CLFVBQUksZ0JBQWdCO0FBRXBCLFlBQU0sWUFBWSxLQUFLO0FBRXZCLFlBQU0sZUFBZSxDQUFDLE9BQU8sT0FBTyxVQUFVO0FBQzVDLGNBQU0sVUFBVSxLQUFLLE9BQU8sS0FB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

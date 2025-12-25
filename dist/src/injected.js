(function() {
  console.log("[FB Ads Scraper] Injected into page context");
  let results = [];
  let isRunning = false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0ZWQuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3RlZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbmplY3RlZCBzY3JpcHQgLSBydW5zIGluIHBhZ2UgY29udGV4dCB3aXRoIGZ1bGwgRE9NIGFjY2Vzc1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGNvbnNvbGUubG9nKCdbRkIgQWRzIFNjcmFwZXJdIEluamVjdGVkIGludG8gcGFnZSBjb250ZXh0Jyk7XHJcblxyXG4gIGxldCByZXN1bHRzID0gW107XHJcbiAgbGV0IGlzUnVubmluZyA9IGZhbHNlO1xyXG5cclxuICAvLyBBdXRvLXNjcm9sbCBmdW5jdGlvblxyXG4gIGZ1bmN0aW9uIGF1dG9TY3JvbGxlcigpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBTY3JhcGVyXSBTdGFydGluZyBhdXRvLXNjcm9sbC4uLicpO1xyXG5cclxuICAgICAgbGV0IGxhc3RIZWlnaHQgPSBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodDtcclxuICAgICAgbGV0IG5vQ2hhbmdlQ291bnQgPSAwO1xyXG5cclxuICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgIGNvbnN0IHVwZGF0ZVN0YXR1cyA9IChjb3VudCwgZG9uZSA9IGZhbHNlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZWxhcHNlZCA9IE1hdGgucm91bmQoKERhdGUubm93KCkgLSBzdGFydFRpbWUpIC8gMTAwMCk7XHJcbiAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2ZiQWRzU3RhdHVzJywge1xyXG4gICAgICAgICAgZGV0YWlsOiB7XHJcbiAgICAgICAgICAgIHNjcm9sbGluZzogIWRvbmUsXHJcbiAgICAgICAgICAgIGFkc0ZvdW5kOiBjb3VudCxcclxuICAgICAgICAgICAgZWxhcHNlZDogZWxhcHNlZCxcclxuICAgICAgICAgICAgbWVzc2FnZTogZG9uZSA/IGBBbmFseXNpcyBDb21wbGV0ZSAoJHtlbGFwc2VkfXMpYCA6IGBBbmFseXppbmcuLi4gKCR7ZWxhcHNlZH1zKWBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQpO1xyXG5cclxuICAgICAgICAvLyBDb3VudCB1bmlxdWUgYWRzXHJcbiAgICAgICAgY29uc3QgbGlua3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhW2hyZWYqPVwiL2Fkcy9saWJyYXJ5Lz9pZD1cIl0nKTtcclxuICAgICAgICBsZXQgdW5pcXVlQ291bnQgPSAwO1xyXG4gICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgbGlua3MuZm9yRWFjaChsID0+IHtcclxuICAgICAgICAgIGNvbnN0IG0gPSBsLmhyZWYubWF0Y2goL2lkPShcXGQrKS8pO1xyXG4gICAgICAgICAgaWYgKG0gJiYgIXNlZW4uaGFzKG1bMV0pKSB7XHJcbiAgICAgICAgICAgIHNlZW4uYWRkKG1bMV0pO1xyXG4gICAgICAgICAgICB1bmlxdWVDb3VudCsrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc3RhdHVzIGJhclxyXG4gICAgICAgIHVwZGF0ZVN0YXR1cyh1bmlxdWVDb3VudCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgIGlmIChuZXdIZWlnaHQgPT09IGxhc3RIZWlnaHQpIHtcclxuICAgICAgICAgIG5vQ2hhbmdlQ291bnQrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbm9DaGFuZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICBsYXN0SGVpZ2h0ID0gbmV3SGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3RvcCBpZiBubyBuZXcgY29udGVudCBmb3IgfjMgc2Vjb25kcyAoNiBjaGVja3MgKiA1MDBtcylcclxuICAgICAgICBpZiAobm9DaGFuZ2VDb3VudCA+PSA2KSB7XHJcbiAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcclxuICAgICAgICAgIHVwZGF0ZVN0YXR1cyh1bmlxdWVDb3VudCwgdHJ1ZSk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnW0ZCIEFkcyBTY3JhcGVyXSBBdXRvLXNjcm9sbCBmaW5pc2hlZC4gQWRzIGZvdW5kOicsIHVuaXF1ZUNvdW50KTtcclxuICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIDUwMCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vIEFkcyBhbmFseXplciBmdW5jdGlvblxyXG4gIGZ1bmN0aW9uIGFkc0FuYWx5emVyKCkge1xyXG4gICAgY29uc3QgbW9udGhNYXAgPSB7XHJcbiAgICAgIEphbjogMCwgRmViOiAxLCBNYXI6IDIsIEFwcjogMywgTWF5OiA0LCBKdW46IDUsXHJcbiAgICAgIEp1bDogNiwgQXVnOiA3LCBTZXA6IDgsIFNlcHQ6IDgsIE9jdDogOSwgTm92OiAxMCwgRGVjOiAxMVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB0b01pZG5pZ2h0ID0gZCA9PiBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCkpO1xyXG4gICAgY29uc3QgaW5jbHVzaXZlRGF5RGlmZiA9IChzdGFydCwgZW5kKSA9PlxyXG4gICAgICBNYXRoLnJvdW5kKCh0b01pZG5pZ2h0KGVuZCkgLSB0b01pZG5pZ2h0KHN0YXJ0KSkgLyA4NjQwMDAwMCkgKyAxO1xyXG5cclxuICAgIGNvbnN0IHBhcnNlRGF0ZSA9IChtLCBkLCB5KSA9PiBuZXcgRGF0ZShOdW1iZXIoeSksIG1vbnRoTWFwW21dLCBOdW1iZXIoZCkpO1xyXG4gICAgY29uc3QgZm9ybWF0RGF0ZSA9IGQgPT4ge1xyXG4gICAgICBjb25zdCBtID0gW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xyXG4gICAgICByZXR1cm4gYCR7bVtkLmdldE1vbnRoKCldfSAke2QuZ2V0RGF0ZSgpfSwgJHtkLmdldEZ1bGxZZWFyKCl9YDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbGliSWRSZSA9IC9cXGJMaWJyYXJ5IElEOlxccyooXFxkKylcXGIvO1xyXG4gICAgY29uc3QgZGF0ZVJhbmdlUmUgPVxyXG4gICAgICAvXFxiKEphbnxGZWJ8TWFyfEFwcnxNYXl8SnVufEp1bHxBdWd8U2VwfFNlcHR8T2N0fE5vdnxEZWMpW2Etel0qXFwuP1xccysoXFxkezEsMn0pXFxzKixcXHMqKFxcZHs0fSlcXHMqWy3igJPigJRdXFxzKihKYW58RmVifE1hcnxBcHJ8TWF5fEp1bnxKdWx8QXVnfFNlcHxTZXB0fE9jdHxOb3Z8RGVjKVthLXpdKlxcLj9cXHMrKFxcZHsxLDJ9KVxccyosXFxzKihcXGR7NH0pL2k7XHJcbiAgICBjb25zdCBzdGFydGVkUnVubmluZ1JlID1cclxuICAgICAgL1xcYlN0YXJ0ZWQgcnVubmluZyBvblxccysoSmFufEZlYnxNYXJ8QXByfE1heXxKdW58SnVsfEF1Z3xTZXB8U2VwdHxPY3R8Tm92fERlYylbYS16XSpcXC4/XFxzKyhcXGR7MSwyfSlcXHMqLFxccyooXFxkezR9KS9pO1xyXG5cclxuICAgIGNvbnN0IGV4dHJhY3RMaWJyYXJ5SWQgPSB0ZXh0ID0+IHRleHQ/Lm1hdGNoKGxpYklkUmUpPy5bMV0gPz8gbnVsbDtcclxuXHJcbiAgICBjb25zdCBleHRyYWN0RGF0ZXMgPSB0ZXh0ID0+IHtcclxuICAgICAgY29uc3QgciA9IHRleHQubWF0Y2goZGF0ZVJhbmdlUmUpO1xyXG4gICAgICBpZiAocikgcmV0dXJuIHsgc3RhcnQ6IHBhcnNlRGF0ZShyWzFdLCByWzJdLCByWzNdKSwgZW5kOiBwYXJzZURhdGUocls0XSwgcls1XSwgcls2XSkgfTtcclxuICAgICAgY29uc3QgcyA9IHRleHQubWF0Y2goc3RhcnRlZFJ1bm5pbmdSZSk7XHJcbiAgICAgIGlmIChzKSByZXR1cm4geyBzdGFydDogcGFyc2VEYXRlKHNbMV0sIHNbMl0sIHNbM10pLCBlbmQ6IG5ldyBEYXRlKCkgfTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGZpbmRPd25pbmdDb250YWluZXIgPSBlbCA9PiB7XHJcbiAgICAgIGxldCBjdXIgPSBlbDtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNSAmJiBjdXI7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IHR4dCA9IGN1ci5pbm5lclRleHQgfHwgXCJcIjtcclxuICAgICAgICBpZiAodHh0LmluY2x1ZGVzKFwiTGlicmFyeSBJRDpcIikgJiYgKGRhdGVSYW5nZVJlLnRlc3QodHh0KSB8fCBzdGFydGVkUnVubmluZ1JlLnRlc3QodHh0KSkpIHtcclxuICAgICAgICAgIHJldHVybiBjdXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN1ciA9IGN1ci5wYXJlbnRFbGVtZW50O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBzdHJpcEFsbFF1ZXJ5QW5kVHJhY2tpbmcgPSAocmF3VXJsKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdSA9IG5ldyBVUkwocmF3VXJsLCBsb2NhdGlvbi5ocmVmKTtcclxuICAgICAgICB1LnNlYXJjaCA9IFwiXCI7XHJcbiAgICAgICAgdS5oYXNoID0gXCJcIjtcclxuICAgICAgICBjb25zdCBwYXRoID0gKHUucGF0aG5hbWUucmVwbGFjZSgvXFwvKyQvLCBcIlwiKSB8fCBcIi9cIik7XHJcbiAgICAgICAgcmV0dXJuIGAke3UucHJvdG9jb2x9Ly8ke3UuaG9zdH0ke3BhdGh9YDtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdW53cmFwRmFjZWJvb2tSZWRpcmVjdCA9IChyYXdVcmwpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB1ID0gbmV3IFVSTChyYXdVcmwsIGxvY2F0aW9uLmhyZWYpO1xyXG4gICAgICAgIGNvbnN0IGhvc3QgPSB1Lmhvc3QudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoIWhvc3QuaW5jbHVkZXMoXCJmYWNlYm9vay5jb21cIikpIHJldHVybiByYXdVcmw7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gdS5zZWFyY2hQYXJhbXMuZ2V0KFwidVwiKTtcclxuICAgICAgICBpZiAoIXRhcmdldCkgcmV0dXJuIHJhd1VybDtcclxuICAgICAgICBjb25zdCBkZWNvZGVkID0gZGVjb2RlVVJJQ29tcG9uZW50KHRhcmdldCk7XHJcbiAgICAgICAgcmV0dXJuIGRlY29kZWQ7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiByYXdVcmw7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZG9tYWluUGF0aEtleSA9IChyYXdVcmwpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB1ID0gbmV3IFVSTChyYXdVcmwsIGxvY2F0aW9uLmhyZWYpO1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSAodS5wYXRobmFtZS5yZXBsYWNlKC9cXC8rJC8sIFwiXCIpIHx8IFwiL1wiKTtcclxuICAgICAgICByZXR1cm4gYCR7dS5ob3N0fSR7cGF0aH1gO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBleHRyYWN0QWRUZXh0QW5kTGlua3MgPSBlbCA9PiB7XHJcbiAgICAgIGNvbnN0IGNhcmQgPSBlbC5jbG9zZXN0KFwiZGl2LnhoOHllajNcIik7XHJcbiAgICAgIGlmICghY2FyZCkgcmV0dXJuIHsgYWRUZXh0OiBudWxsLCBsaW5rczogW10gfTtcclxuXHJcbiAgICAgIGNvbnN0IGFkVGV4dCA9XHJcbiAgICAgICAgY2FyZC5xdWVyeVNlbGVjdG9yKCdbc3R5bGU9XCJ3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XCJdJyk/LmlubmVyVGV4dD8udHJpbSgpIHx8IG51bGw7XHJcblxyXG4gICAgICBjb25zdCBhbmNob3JzID0gQXJyYXkuZnJvbShjYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJ2FbdGFyZ2V0PVwiX2JsYW5rXCJdJykpLnNsaWNlKDEpO1xyXG4gICAgICBjb25zdCBzZWVuTGlua0tleXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgIGNvbnN0IGxpbmtzID0gW107XHJcblxyXG4gICAgICAvLyBFeHRyYWN0IE1lZGlhIChWaWRlbyBvciBJbWFnZSlcclxuICAgICAgbGV0IG1lZGlhVHlwZSA9IG51bGw7XHJcbiAgICAgIGxldCBtZWRpYVNyYyA9IG51bGw7XHJcblxyXG4gICAgICAvLyAxLiBDaGVjayBmb3IgdmlkZW9cclxuICAgICAgY29uc3QgdmlkZW8gPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJ3ZpZGVvJyk7XHJcbiAgICAgIGlmICh2aWRlbyAmJiB2aWRlby5zcmMpIHtcclxuICAgICAgICBtZWRpYVR5cGUgPSAndmlkZW8nO1xyXG4gICAgICAgIG1lZGlhU3JjID0gdmlkZW8uc3JjO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIDIuIENoZWNrIGZvciBpbWFnZXMgKHNraXAgZmlyc3Qgb25lIGFzIGl0J3MgdGhlIHByb2ZpbGUgcGljKVxyXG4gICAgICAgIGNvbnN0IGltYWdlcyA9IEFycmF5LmZyb20oY2FyZC5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKSk7XHJcbiAgICAgICAgaWYgKGltYWdlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICBtZWRpYVR5cGUgPSAnaW1hZ2UnO1xyXG4gICAgICAgICAgbWVkaWFTcmMgPSBpbWFnZXNbMV0uc3JjO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaW1hZ2VzLmxlbmd0aCA9PT0gMSAmJiAhZWwuaW5uZXJUZXh0LmluY2x1ZGVzKFwiTGlicmFyeSBJRDpcIikpIHtcclxuICAgICAgICAgIC8vIEZhbGxiYWNrIGlmIG9ubHkgMSBpbWFnZSBhbmQgaXQncyBub3QgbGlrZWx5IHRoZSBzbWFsbCBpY29uIG5lYXIgSUQgKGhldXJpc3RpYylcclxuICAgICAgICAgIC8vIEJ1dCB1c3VhbGx5IGZpcnN0IGltYWdlIGlzIHByb2ZpbGUuIFNhZmUgdG8gZGVmYXVsdCB0byBudWxsIGlmIG9ubHkgMSBmb3VuZD9cclxuICAgICAgICAgIC8vIExldCdzIHN0aWNrIHRvIHRoZSBydWxlOiBcIlRoZSBmaXJzdCBvbmUgaXMgdGhlIHByb2ZpbGUuLi4gc28gd2Ugc2hvdWxkIHNraXAgdGhhdFwiLlxyXG4gICAgICAgICAgLy8gU28gaWYgbGVuZ3RoIDwgMiwgbm8gYWQgaW1hZ2UuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IGEgb2YgYW5jaG9ycykge1xyXG4gICAgICAgIGNvbnN0IGhyZWYgPSBhLmhyZWY7XHJcbiAgICAgICAgaWYgKCFocmVmKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgY29uc3QgdW53cmFwcGVkID0gdW53cmFwRmFjZWJvb2tSZWRpcmVjdChocmVmKTtcclxuICAgICAgICBpZiAodW53cmFwcGVkLnN0YXJ0c1dpdGgoXCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vaGVscC8zOTY0MDQxMjA0MDEyNzgvbGlzdFwiKSB8fFxyXG4gICAgICAgICAgdW53cmFwcGVkLmluY2x1ZGVzKFwidHJhbnNwYXJlbmN5Lm1ldGEuY29tL3BvbGljaWVzXCIpKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsZWFuZWQgPSBzdHJpcEFsbFF1ZXJ5QW5kVHJhY2tpbmcodW53cmFwcGVkKTtcclxuICAgICAgICBpZiAoIWNsZWFuZWQpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBkb21haW5QYXRoS2V5KGNsZWFuZWQpO1xyXG4gICAgICAgIGlmICgha2V5IHx8IHNlZW5MaW5rS2V5cy5oYXMoa2V5KSkgY29udGludWU7XHJcblxyXG4gICAgICAgIHNlZW5MaW5rS2V5cy5hZGQoa2V5KTtcclxuICAgICAgICBsaW5rcy5wdXNoKHsgdXJsOiBjbGVhbmVkLCBtZWRpYVR5cGUsIG1lZGlhU3JjIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4geyBhZFRleHQsIGxpbmtzIH07XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHNlZW5JZHMgPSBuZXcgU2V0KCk7XHJcbiAgICBjb25zdCBsaWJyYXJ5RWxzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKSlcclxuICAgICAgLmZpbHRlcihlbCA9PiBlbC5pbm5lclRleHQ/LmluY2x1ZGVzKFwiTGlicmFyeSBJRDpcIikpO1xyXG5cclxuICAgIGZvciAoY29uc3QgbGliRWwgb2YgbGlicmFyeUVscykge1xyXG4gICAgICBjb25zdCBsaWJyYXJ5SWQgPSBleHRyYWN0TGlicmFyeUlkKGxpYkVsLmlubmVyVGV4dCk7XHJcbiAgICAgIGlmICghbGlicmFyeUlkIHx8IHNlZW5JZHMuaGFzKGxpYnJhcnlJZCkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZmluZE93bmluZ0NvbnRhaW5lcihsaWJFbCk7XHJcbiAgICAgIGlmICghY29udGFpbmVyKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGNvbnN0IGRhdGVzID0gZXh0cmFjdERhdGVzKGNvbnRhaW5lci5pbm5lclRleHQpO1xyXG4gICAgICBpZiAoIWRhdGVzKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGNvbnN0IHsgYWRUZXh0LCBsaW5rcyB9ID0gZXh0cmFjdEFkVGV4dEFuZExpbmtzKGxpYkVsKTtcclxuXHJcbiAgICAgIHJlc3VsdHMucHVzaCh7XHJcbiAgICAgICAgbGlicmFyeUlkLFxyXG4gICAgICAgIHN0YXJ0aW5nRGF0ZTogZm9ybWF0RGF0ZShkYXRlcy5zdGFydCksXHJcbiAgICAgICAgZW5kRGF0ZTogZm9ybWF0RGF0ZShkYXRlcy5lbmQpLFxyXG4gICAgICAgIGR1cmF0aW9uOiBpbmNsdXNpdmVEYXlEaWZmKGRhdGVzLnN0YXJ0LCBkYXRlcy5lbmQpLFxyXG4gICAgICAgIGFkVGV4dCxcclxuICAgICAgICBsaW5rc1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNlZW5JZHMuYWRkKGxpYnJhcnlJZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBiLmR1cmF0aW9uIC0gYS5kdXJhdGlvbik7XHJcbiAgICBjb25zb2xlLmxvZyhgW0FkcyBBbmFseXplcl0gRm91bmQgJHtyZXN1bHRzLmxlbmd0aH0gYWRzYCk7XHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxuICB9XHJcblxyXG4gIC8vIFByb2Nlc3MgY2FtcGFpZ25zIHdpdGggdG9wIDUgYWRzXHJcbiAgZnVuY3Rpb24gbG9nQ2FtcGFpZ25zV2l0aFRvcDVBZHNBbmRUZXh0KHJlc3VsdHMpIHtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShyZXN1bHRzKSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJFeHBlY3RlZCByZXN1bHRzIGFycmF5XCIpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXJzZURhdGUgPSAocykgPT4gbmV3IERhdGUocyk7XHJcbiAgICBjb25zdCBkYXlEaWZmSW5jbHVzaXZlID0gKGEsIGIpID0+XHJcbiAgICAgIE1hdGgucm91bmQoKGIgLSBhKSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSkgKyAxO1xyXG5cclxuICAgIGNvbnN0IGNhbXBhaWducyA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGFkIG9mIHJlc3VsdHMpIHtcclxuICAgICAgaWYgKCFhZCB8fCAhQXJyYXkuaXNBcnJheShhZC5saW5rcykgfHwgIWFkLmxpYnJhcnlJZCkgY29udGludWU7XHJcblxyXG4gICAgICBjb25zdCBzdGFydCA9IHBhcnNlRGF0ZShhZC5zdGFydGluZ0RhdGUpO1xyXG4gICAgICBjb25zdCBlbmQgPSBwYXJzZURhdGUoYWQuZW5kRGF0ZSk7XHJcbiAgICAgIGNvbnN0IGR1cmF0aW9uID0gTnVtYmVyKGFkLmR1cmF0aW9uKSB8fCAwO1xyXG4gICAgICBjb25zdCBjb3B5ID0gdHlwZW9mIGFkLmFkVGV4dCA9PT0gXCJzdHJpbmdcIiA/IGFkLmFkVGV4dC50cmltKCkgOiBcIlwiO1xyXG5cclxuICAgICAgZm9yIChjb25zdCBsaW5rT2JqIG9mIGFkLmxpbmtzKSB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gbGlua09iai51cmw7XHJcbiAgICAgICAgY29uc3QgbWVkaWFUeXBlID0gbGlua09iai5tZWRpYVR5cGU7XHJcbiAgICAgICAgY29uc3QgbWVkaWFTcmMgPSBsaW5rT2JqLm1lZGlhU3JjO1xyXG5cclxuICAgICAgICBpZiAoIWNhbXBhaWducy5oYXModXJsKSkge1xyXG4gICAgICAgICAgY2FtcGFpZ25zLnNldCh1cmwsIHtcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICBmaXJzdFNlZW46IHN0YXJ0LFxyXG4gICAgICAgICAgICBsYXN0U2VlbjogZW5kLFxyXG4gICAgICAgICAgICB0b3RhbEFkc0NvdW50OiAwLFxyXG4gICAgICAgICAgICBwZXJDb3B5OiBuZXcgTWFwKClcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYyA9IGNhbXBhaWducy5nZXQodXJsKTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXJ0IDwgYy5maXJzdFNlZW4pIGMuZmlyc3RTZWVuID0gc3RhcnQ7XHJcbiAgICAgICAgaWYgKGVuZCA+IGMubGFzdFNlZW4pIGMubGFzdFNlZW4gPSBlbmQ7XHJcblxyXG4gICAgICAgIGMudG90YWxBZHNDb3VudCsrO1xyXG5cclxuICAgICAgICBjb25zdCBjb3B5S2V5ID0gY29weSB8fCBcIltuby1jb3B5XVwiO1xyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYy5wZXJDb3B5LmdldChjb3B5S2V5KTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hvdWxkUmVwbGFjZSA9XHJcbiAgICAgICAgICAhZXhpc3RpbmcgfHxcclxuICAgICAgICAgIGR1cmF0aW9uID4gZXhpc3RpbmcuZHVyYXRpb24gfHxcclxuICAgICAgICAgIChcclxuICAgICAgICAgICAgZHVyYXRpb24gPT09IGV4aXN0aW5nLmR1cmF0aW9uICYmXHJcbiAgICAgICAgICAgIChcclxuICAgICAgICAgICAgICBuZXcgRGF0ZShhZC5zdGFydGluZ0RhdGUpIDwgbmV3IERhdGUoZXhpc3Rpbmcuc3RhcnRpbmdEYXRlKSB8fFxyXG4gICAgICAgICAgICAgIChcclxuICAgICAgICAgICAgICAgIGFkLnN0YXJ0aW5nRGF0ZSA9PT0gZXhpc3Rpbmcuc3RhcnRpbmdEYXRlICYmXHJcbiAgICAgICAgICAgICAgICBuZXcgRGF0ZShhZC5lbmREYXRlKSA+IG5ldyBEYXRlKGV4aXN0aW5nLmVuZERhdGUpXHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoc2hvdWxkUmVwbGFjZSkge1xyXG4gICAgICAgICAgYy5wZXJDb3B5LnNldChjb3B5S2V5LCB7XHJcbiAgICAgICAgICAgIGxpYnJhcnlJZDogYWQubGlicmFyeUlkLFxyXG4gICAgICAgICAgICBzdGFydGluZ0RhdGU6IGFkLnN0YXJ0aW5nRGF0ZSxcclxuICAgICAgICAgICAgZW5kRGF0ZTogYWQuZW5kRGF0ZSxcclxuICAgICAgICAgICAgZHVyYXRpb24sXHJcbiAgICAgICAgICAgIGFkVGV4dDogY29weSxcclxuICAgICAgICAgICAgLy8gUHJpb3JpdGl6ZSBzdG9yaW5nIHZpZGVvIGlmIGF2YWlsYWJsZSwgZWxzZSBuZXcgaW1hZ2UsIGVsc2Uga2VlcCBleGlzdGluZ1xyXG4gICAgICAgICAgICBtZWRpYVR5cGU6IG1lZGlhVHlwZSB8fCAoZXhpc3RpbmcgPyBleGlzdGluZy5tZWRpYVR5cGUgOiBudWxsKSxcclxuICAgICAgICAgICAgbWVkaWFTcmM6IG1lZGlhU3JjIHx8IChleGlzdGluZyA/IGV4aXN0aW5nLm1lZGlhU3JjIDogbnVsbClcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNhbXBhaWduc091dCA9IEFycmF5LmZyb20oY2FtcGFpZ25zLnZhbHVlcygpKVxyXG4gICAgICAubWFwKGMgPT4gKHtcclxuICAgICAgICB1cmw6IGMudXJsLFxyXG4gICAgICAgIGZpcnN0QWR2ZXJ0aXNlZDogYy5maXJzdFNlZW4udG9JU09TdHJpbmcoKSxcclxuICAgICAgICBsYXN0QWR2ZXJ0aXNlZDogYy5sYXN0U2Vlbi50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIGNhbXBhaWduRHVyYXRpb25EYXlzOiBkYXlEaWZmSW5jbHVzaXZlKGMuZmlyc3RTZWVuLCBjLmxhc3RTZWVuKSxcclxuICAgICAgICBhZHNDb3VudDogYy50b3RhbEFkc0NvdW50LFxyXG4gICAgICAgIHRvcDU6IEFycmF5LmZyb20oYy5wZXJDb3B5LnZhbHVlcygpKVxyXG4gICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIuZHVyYXRpb24gLSBhLmR1cmF0aW9uKVxyXG4gICAgICAgICAgLnNsaWNlKDAsIDUpXHJcbiAgICAgIH0pKVxyXG4gICAgICAuc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYS5maXJzdEFkdmVydGlzZWQpIC0gbmV3IERhdGUoYi5maXJzdEFkdmVydGlzZWQpKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhgW0NhbXBhaWduIFByb2Nlc3Nvcl0gR2VuZXJhdGVkICR7Y2FtcGFpZ25zT3V0Lmxlbmd0aH0gY2FtcGFpZ25zYCk7XHJcbiAgICByZXR1cm4gY2FtcGFpZ25zT3V0O1xyXG4gIH1cclxuXHJcbiAgLy8gTWFpbiBleGVjdXRpb24gZnVuY3Rpb25cclxuICBhc3luYyBmdW5jdGlvbiBydW5GdWxsQW5hbHlzaXMoKSB7XHJcbiAgICBpZiAoaXNSdW5uaW5nKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFNjcmFwZXJdIEFscmVhZHkgcnVubmluZywgc2tpcHBpbmcnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlzUnVubmluZyA9IHRydWU7XHJcbiAgICByZXN1bHRzID0gW107XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc29sZS5sb2coJ1tGQiBBZHMgU2NyYXBlcl0gU3RlcCAxOiBBdXRvLXNjcm9sbGluZy4uLicpO1xyXG4gICAgICBhd2FpdCBhdXRvU2Nyb2xsZXIoKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFNjcmFwZXJdIFN0ZXAgMjogQW5hbHl6aW5nIGFkcy4uLicpO1xyXG4gICAgICByZXN1bHRzID0gYWRzQW5hbHl6ZXIoKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFNjcmFwZXJdIFN0ZXAgMzogUHJvY2Vzc2luZyBjYW1wYWlnbnMuLi4nKTtcclxuICAgICAgY29uc3QgY2FtcGFpZ25zID0gbG9nQ2FtcGFpZ25zV2l0aFRvcDVBZHNBbmRUZXh0KHJlc3VsdHMpO1xyXG5cclxuICAgICAgLy8gRXh0cmFjdCBtZXRhZGF0YVxyXG4gICAgICBjb25zdCBhZHZlcnRpc2VyTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3BsYWNlaG9sZGVyKj1cIlNlYXJjaCBieVwiXScpPy52YWx1ZT8udHJpbSgpIHx8XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaDEnKT8uaW5uZXJUZXh0Py50cmltKCkgfHxcclxuICAgICAgICAndW5rbm93bi1hZHZlcnRpc2VyJztcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCdbRkIgQWRzIFNjcmFwZXJdIENvbXBsZXRlISBTZW5kaW5nIGRhdGEuLi4nKTtcclxuXHJcbiAgICAgIC8vIFNlbmQgZGF0YSB0byB2aXN1YWxpemVyXHJcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdmYkFkc0ltcG9ydERhdGEnLCB7XHJcbiAgICAgICAgZGV0YWlsOiB7XHJcbiAgICAgICAgICBjYW1wYWlnbnM6IGNhbXBhaWducyxcclxuICAgICAgICAgIGFsbEFkczogcmVzdWx0cyxcclxuICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgIGFkdmVydGlzZXJOYW1lLFxyXG4gICAgICAgICAgICBzY3JhcGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSkpO1xyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGQiBBZHMgU2NyYXBlcl0gRXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICB3aW5kb3cucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6ICdGQl9BRFNfRVJST1InLFxyXG4gICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlXHJcbiAgICAgIH0sICcqJyk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBpc1J1bm5pbmcgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEV4cG9zZSB0byB3aW5kb3cgZm9yIG1hbnVhbCB0cmlnZ2VyIGlmIG5lZWRlZFxyXG4gIHdpbmRvdy5mYkFkc0FuYWx5emVyID0ge1xyXG4gICAgcnVuRnVsbEFuYWx5c2lzLFxyXG4gICAgcmVzdWx0cyxcclxuICAgIHJlc3RhcnQ6ICgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ1tGQiBBZHMgU2NyYXBlcl0gU29mdCByZXN0YXJ0aW5nLi4uJyk7XHJcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcclxuICAgICAgaXNSdW5uaW5nID0gZmFsc2U7XHJcbiAgICAgIHJlc3VsdHMgPSBbXTtcclxuICAgICAgc2V0VGltZW91dChydW5GdWxsQW5hbHlzaXMsIDUwMCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciByZXN0YXJ0IHJlcXVlc3QgZnJvbSB2aXN1YWxpemVyXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZmJBZHNSZXN0YXJ0JywgKCkgPT4ge1xyXG4gICAgd2luZG93LmZiQWRzQW5hbHl6ZXIucmVzdGFydCgpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBBdXRvLXN0YXJ0IHdoZW4gaW5qZWN0ZWRcclxuICBydW5GdWxsQW5hbHlzaXMoKTtcclxufSkoKTsiXSwibmFtZXMiOlsicmVzdWx0cyJdLCJtYXBwaW5ncyI6IkNBQ0MsV0FBWTtBQUNYLFVBQVEsSUFBSSw2Q0FBNkM7QUFFekQsTUFBSSxVQUFVLENBQUE7QUFDZCxNQUFJLFlBQVk7QUFHaEIsV0FBUyxlQUFlO0FBQ3RCLFdBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM5QixjQUFRLElBQUksMENBQTBDO0FBRXRELFVBQUksYUFBYSxTQUFTLEtBQUs7QUFDL0IsVUFBSSxnQkFBZ0I7QUFFcEIsWUFBTSxZQUFZLEtBQUs7QUFFdkIsWUFBTSxlQUFlLENBQUMsT0FBTyxPQUFPLFVBQVU7QUFDNUMsY0FBTSxVQUFVLEtBQUssT0FBTyxLQUFLLElBQUcsSUFBSyxhQUFhLEdBQUk7QUFDMUQsaUJBQVMsY0FBYyxJQUFJLFlBQVksZUFBZTtBQUFBLFVBQ3BELFFBQVE7QUFBQSxZQUNOLFdBQVcsQ0FBQztBQUFBLFlBQ1osVUFBVTtBQUFBLFlBQ1Y7QUFBQSxZQUNBLFNBQVMsT0FBTyxzQkFB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

// Injected script - runs in page context with full DOM access
(function () {
  console.log('[FB Ads Scraper] Injected into page context');

  let results = [];
  let isRunning = false;

  // Auto-scroll function
  function autoScroller() {
    return new Promise((resolve) => {
      const CONFIG = {
        scrollStep: 600,
        scrollDelay: 400,
        maxIdleCycles: 20,
        debug: true
      };

      let lastHeight = 0;
      let idleCycles = 0;

      const log = (...args) =>
        CONFIG.debug && console.log('[AutoScroll]', ...args);

      const scrollToAbsoluteBottom = () => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
        log('Final scroll to absolute bottom');
      };

      const scrollLoop = async () => {
        window.scrollBy(0, CONFIG.scrollStep);
        await new Promise(r => setTimeout(r, CONFIG.scrollDelay));

        const currentHeight =
          document.documentElement.scrollHeight || document.body.scrollHeight;

        if (currentHeight > lastHeight) {
          lastHeight = currentHeight;
          idleCycles = 0;
          log('New content detected');
          scrollLoop();
        } else {
          idleCycles++;
          log(`No new content (${idleCycles}/${CONFIG.maxIdleCycles})`);

          if (idleCycles < CONFIG.maxIdleCycles) {
            scrollLoop();
          } else {
            log('Scrolling complete');
            scrollToAbsoluteBottom();
            setTimeout(() => resolve(), 1000);
          }
        }
      };

      lastHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;

      log('Starting infinite auto-scroll');
      scrollLoop();
    });
  }

  // Ads analyzer function
  function adsAnalyzer() {
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Sept: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const toMidnight = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const inclusiveDayDiff = (start, end) =>
      Math.round((toMidnight(end) - toMidnight(start)) / 86400000) + 1;

    const parseDate = (m, d, y) => new Date(Number(y), monthMap[m], Number(d));
    const formatDate = d => {
      const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    const libIdRe = /\bLibrary ID:\s*(\d+)\b/;
    const dateRangeRe =
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\s*[-–—]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})/i;
    const startedRunningRe =
      /\bStarted running on\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})/i;

    const extractLibraryId = text => text?.match(libIdRe)?.[1] ?? null;

    const extractDates = text => {
      const r = text.match(dateRangeRe);
      if (r) return { start: parseDate(r[1], r[2], r[3]), end: parseDate(r[4], r[5], r[6]) };
      const s = text.match(startedRunningRe);
      if (s) return { start: parseDate(s[1], s[2], s[3]), end: new Date() };
      return null;
    };

    const findOwningContainer = el => {
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
        const path = (u.pathname.replace(/\/+$/, "") || "/");
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
        const path = (u.pathname.replace(/\/+$/, "") || "/");
        return `${u.host}${path}`;
      } catch {
        return null;
      }
    };

    const extractAdTextAndLinks = el => {
      const card = el.closest("div.xh8yej3");
      if (!card) return { adText: null, links: [] };

      const adText =
        card.querySelector('[style="white-space: pre-wrap;"]')?.innerText?.trim() || null;

      const anchors = Array.from(card.querySelectorAll('a[target="_blank"]')).slice(1);
      const seenLinkKeys = new Set();
      const links = [];

      // Extract Media (Video or Image)
      let mediaType = null;
      let mediaSrc = null;

      // 1. Check for video
      const video = card.querySelector('video');
      if (video && video.src) {
        mediaType = 'video';
        mediaSrc = video.src;
      } else {
        // 2. Check for images (skip first one as it's the profile pic)
        const images = Array.from(card.querySelectorAll('img'));
        if (images.length > 1) {
          mediaType = 'image';
          mediaSrc = images[1].src;
        } else if (images.length === 1 && !el.innerText.includes("Library ID:")) {
          // Fallback if only 1 image and it's not likely the small icon near ID (heuristic)
          // But usually first image is profile. Safe to default to null if only 1 found?
          // Let's stick to the rule: "The first one is the profile... so we should skip that".
          // So if length < 2, no ad image.
        }
      }

      for (const a of anchors) {
        const href = a.href;
        if (!href) continue;

        const unwrapped = unwrapFacebookRedirect(href);
        if (unwrapped.startsWith("https://www.facebook.com/help/396404120401278/list") ||
          unwrapped.includes("transparency.meta.com/policies")) {
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

    const seenIds = new Set();
    const libraryEls = Array.from(document.querySelectorAll("*"))
      .filter(el => el.innerText?.includes("Library ID:"));

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

  // Process campaigns with top 5 ads
  function logCampaignsWithTop5AdsAndText(results) {
    if (!Array.isArray(results)) {
      console.warn("Expected results array");
      return null;
    }

    const parseDate = (s) => new Date(s);
    const dayDiffInclusive = (a, b) =>
      Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1;

    const campaigns = new Map();

    for (const ad of results) {
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
            perCopy: new Map()
          });
        }

        const c = campaigns.get(url);

        if (start < c.firstSeen) c.firstSeen = start;
        if (end > c.lastSeen) c.lastSeen = end;

        c.totalAdsCount++;

        const copyKey = copy || "[no-copy]";
        const existing = c.perCopy.get(copyKey);

        const shouldReplace =
          !existing ||
          duration > existing.duration ||
          (
            duration === existing.duration &&
            (
              new Date(ad.startingDate) < new Date(existing.startingDate) ||
              (
                ad.startingDate === existing.startingDate &&
                new Date(ad.endDate) > new Date(existing.endDate)
              )
            )
          );

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

    const campaignsOut = Array.from(campaigns.values())
      .map(c => ({
        url: c.url,
        firstAdvertised: c.firstSeen.toISOString(),
        lastAdvertised: c.lastSeen.toISOString(),
        campaignDurationDays: dayDiffInclusive(c.firstSeen, c.lastSeen),
        adsCount: c.totalAdsCount,
        top5: Array.from(c.perCopy.values())
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5)
      }))
      .sort((a, b) => new Date(a.firstAdvertised) - new Date(b.firstAdvertised));

    console.log(`[Campaign Processor] Generated ${campaignsOut.length} campaigns`);
    return campaignsOut;
  }

  // Main execution function
  async function runFullAnalysis() {
    if (isRunning) {
      console.log('[FB Ads Scraper] Already running, skipping');
      return;
    }

    isRunning = true;
    results = [];

    try {
      console.log('[FB Ads Scraper] Step 1: Auto-scrolling...');
      await autoScroller();

      console.log('[FB Ads Scraper] Step 2: Analyzing ads...');
      results = adsAnalyzer();

      console.log('[FB Ads Scraper] Step 3: Processing campaigns...');
      const campaigns = logCampaignsWithTop5AdsAndText(results);

      console.log('[FB Ads Scraper] Complete! Sending data...');

      // Send data to visualizer
      window.postMessage({
        type: 'FB_ADS_DATA',
        data: campaigns,
        allAds: results
      }, '*');

    } catch (error) {
      console.error('[FB Ads Scraper] Error:', error);
      window.postMessage({
        type: 'FB_ADS_ERROR',
        error: error.message
      }, '*');
    } finally {
      isRunning = false;
    }
  }

  // Expose to window for manual trigger if needed
  window.fbAdsAnalyzer = { runFullAnalysis, results };

  // Auto-start when injected
  runFullAnalysis();
})();
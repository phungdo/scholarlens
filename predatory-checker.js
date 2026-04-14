/**
 * predatory-checker.js — Two-signal predatory / OA-verified detection.
 *   - Beall's list match (bundled via predatory-list.js)
 *   - DOAJ verification via https://doaj.org/api/search/journals/issn:{issn}
 *
 * Loaded after predatory-list.js. Exposes window.PredatoryChecker.
 * Pure-ish: DOAJ fetch is async + cached in localStorage (TTL 30 days).
 */
(function () {
  'use strict';

  const DOAJ_CACHE_PREFIX = 'scholarlens:doaj:';
  const DOAJ_TTL_MS = 30 * 24 * 60 * 60 * 1000;
  const DOAJ_TIMEOUT_MS = 5000;
  const BEALL_MIRROR_URL = 'https://beallslist.net/';

  function normalizeName(s) {
    if (!s) return '';
    return String(s)
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeIssn(issn) {
    if (!issn) return '';
    return String(issn).toUpperCase().replace(/[^0-9X]/g, '');
  }

  // Build normalized Set on first call; cache on the list object for reuse.
  function ensureIndex(L) {
    if (!L._idx) {
      L._idx = {
        issns: new Set((L.issns || []).map(normalizeIssn).filter(Boolean)),
        journals: new Set((L.journals || []).map(normalizeName).filter(Boolean)),
        publishers: new Set((L.publishers || []).map(normalizeName).filter(Boolean)),
      };
    }
    return L._idx;
  }

  // Look up a journal/publisher against the bundled Beall list.
  // Exact-match only — substring matching caused false positives (e.g., "Nature"
  // matching "journal of nature and science"), which is a defamation risk.
  // Returns { matched: bool, type, evidence }.
  function beallLookup(issn, journalName, publisherName) {
    const L = window.PREDATORY_LIST;
    if (!L) return { matched: false };
    const idx = ensureIndex(L);

    const issnNorm = normalizeIssn(issn);
    if (issnNorm && idx.issns.has(issnNorm)) {
      return { matched: true, type: 'issn', evidence: issn };
    }
    const jNorm = normalizeName(journalName);
    if (jNorm && idx.journals.has(jNorm)) {
      return { matched: true, type: 'journal', evidence: jNorm };
    }
    const pNorm = normalizeName(publisherName);
    if (pNorm && idx.publishers.has(pNorm)) {
      return { matched: true, type: 'publisher', evidence: pNorm };
    }
    return { matched: false };
  }

  // localStorage wrapper — silently no-ops in privacy mode.
  function cacheGet(key) {
    try {
      const raw = localStorage.getItem(DOAJ_CACHE_PREFIX + key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.ts !== 'number') return null;
      if (Date.now() - obj.ts > DOAJ_TTL_MS) return null;
      return obj;
    } catch (_) { return null; }
  }
  function cacheSet(key, value) {
    try {
      localStorage.setItem(DOAJ_CACHE_PREFIX + key, JSON.stringify({ ...value, ts: Date.now() }));
    } catch (_) { /* ignore */ }
  }

  async function doajFetch(issn) {
    const issnNorm = normalizeIssn(issn);
    if (!issnNorm || issnNorm.length !== 8) return { found: false };
    const formatted = issnNorm.slice(0, 4) + '-' + issnNorm.slice(4);

    const cached = cacheGet(issnNorm);
    if (cached) return { found: cached.found, url: cached.url };

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), DOAJ_TIMEOUT_MS);
    try {
      const res = await fetch(`https://doaj.org/api/search/journals/issn:${formatted}`, { signal: ctrl.signal });
      if (!res.ok) { cacheSet(issnNorm, { found: false, url: null }); return { found: false }; }
      const data = await res.json();
      const hit = Array.isArray(data.results) && data.results.length > 0;
      const doajId = hit ? data.results[0].id : null;
      const url = doajId ? `https://doaj.org/toc/${doajId}` : `https://doaj.org/search/journals?source=%7B%22query%22%3A%7B%22query_string%22%3A%7B%22query%22%3A%22${formatted}%22%7D%7D%7D`;
      cacheSet(issnNorm, { found: hit, url });
      return { found: hit, url };
    } catch (e) {
      return { found: false };
    } finally {
      clearTimeout(timeout);
    }
  }

  // Main orchestrator. Returns { status: 'beall'|'doaj'|'none', evidence, url }.
  async function checkPredatory(source) {
    if (!source) return { status: 'none' };
    const issn = source.issn_l || (source.issn && source.issn[0]) || '';
    const journal = source.display_name || '';
    const publisher = source.host_organization_name || '';

    let beall = { matched: false };
    try { beall = beallLookup(issn, journal, publisher); } catch (_) { /* ignore */ }

    let doaj = { found: false };
    if (issn) {
      try { doaj = await doajFetch(issn); } catch (_) { /* ignore */ }
    }

    // DOAJ overrides Beall (curated whitelist beats possibly-stale blacklist).
    if (doaj.found) return { status: 'doaj', url: doaj.url };
    if (beall.matched) return { status: 'beall', evidence: beall.evidence, url: BEALL_MIRROR_URL };
    return { status: 'none' };
  }

  function renderPredatoryPill(result) {
    if (!result || result.status === 'none') return '';
    if (result.status === 'doaj') {
      const url = result.url || 'https://doaj.org/';
      return `<a href="${url}" target="_blank" class="stat-pill stat-pill-link pill-verified" title="Listed in Directory of Open Access Journals (DOAJ) — curated trusted open access">
        <span class="stat-val">✅ DOAJ</span>
        <span class="stat-key">Verified OA</span>
      </a>`;
    }
    if (result.status === 'beall') {
      const ev = result.evidence ? ` — matched "${String(result.evidence).replace(/"/g, '&quot;')}"` : '';
      return `<a href="${result.url || BEALL_MIRROR_URL}" target="_blank" class="stat-pill stat-pill-link pill-warn" title="Suspected predatory per Beall's list mirror${ev}. Verify before citing.">
        <span class="stat-val">⚠️ Predatory?</span>
        <span class="stat-key">Beall's list</span>
      </a>`;
    }
    return '';
  }

  window.PredatoryChecker = {
    normalizeName,
    beallLookup,
    doajFetch,
    checkPredatory,
    renderPredatoryPill,
  };
})();

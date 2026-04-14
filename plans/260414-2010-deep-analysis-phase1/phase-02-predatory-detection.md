# Phase 02 — Predatory Journal Detection

**Priority:** High | **Status:** completed | **Effort:** M (~3-4h)

## Overview

Two-signal predatory detection rendered as a single badge in the Source group:
- ⚠️ **Suspected predatory** — match against bundled Beall's list
- ✅ **DOAJ Verified** — listed in Directory of Open Access Journals
- (none) — neither match; show nothing

## Data Sources

### Beall's list (static bundle)
- ~1500 publishers + standalone journals
- Source: archived Beall's list (Wayback Machine, 2016-2017 snapshot) + community-maintained forks (e.g., `beallslist.net` mirror)
- Bundle as JS object: `{ publishers: Set, journals: Set, issns: Set }`
- Match priority: ISSN exact > journal title normalized > publisher name normalized

### DOAJ API
- Endpoint: `https://doaj.org/api/search/journals/issn:{issn}`
- Returns 200 + result if listed, 200 + empty result if not
- No auth, no documented rate limit (be polite: cache results)
- Cache key: ISSN; cache in `localStorage` for 30 days

## UI

New pill in Source pills group (after IF proxy / h-index):
```
[ ⚠️ Predatory? ]   stat-key: "Beall's list"   (red, links to Beall mirror)
[ ✅ DOAJ ]         stat-key: "Verified OA"    (green, links to DOAJ entry)
```

If both fire (rare): show DOAJ verified, suppress predatory warning (DOAJ overrides — they actively curate against predatory).

## Logic

```
checkPredatory(source) → { status: 'beall'|'doaj'|'none', evidence, url }
  1. issn = source.issn_l || source.issn[0]
  2. if !issn → check publisher/title only against Beall
  3. else: parallel:
     a. beallMatch = beallLookup(issn, source.display_name, source.host_organization_name)
     b. doajResult = doajFetch(issn) — cached
  4. doajResult.found → return 'doaj'
  5. beallMatch → return 'beall'
  6. → 'none'
```

Normalize for matching: lowercase, strip punctuation, collapse whitespace.

## Files

**Create:** `predatory-list.js` (~static data, ~30KB minified)
- `window.PREDATORY_LIST = { publishers: [...], journals: [...], issns: [...], lastUpdated: '2026-04-14' }`
- Auto-generated from source list (script in `scripts/build-predatory-list.js` — out of scope for this phase, manual one-time build OK)

**Create:** `predatory-checker.js` (~120 LOC)
- `normalizeName(s)` — lowercase + strip punctuation
- `beallLookup(issn, journalName, publisherName)` → match info or null
- `doajFetch(issn)` → cached promise, returns `{ found: bool, url }`
- `checkPredatory(source)` → resolves to `{ status, evidence, url }`
- `renderPredatoryPill(predatoryResult)` → HTML

**Edit:** `index.html`
- `<head>`: load `predatory-list.js` then `predatory-checker.js` after core_rankings.js
- `renderMetrics()` (~line 3491): make `async` segment OR resolve before render. Cleanest: kick off `checkPredatory(source)` in parallel with other fetches in the main workflow (~line 3098 area), pass result into `renderMetrics()`
- Append pill to `sourcePills`

## LocalStorage Cache

Key: `scholarlens:doaj:{issn}` → JSON `{ found, url, ts }`. TTL 30 days. Wrap in try/catch (incognito mode = no localStorage).

## Implementation Steps

1. Source Beall's list data — pick a maintained mirror, document URL in `predatory-list.js` header comment
2. Manually generate `predatory-list.js` (one-time pull, manual cleanup of bad entries)
3. Create `predatory-checker.js` with normalize + lookup + DOAJ fetch + cache
4. Hook `checkPredatory(sourceData)` after `sourceData = await fetchOpenAlex(...)` (~line 3099)
5. Pass `predatoryResult` into `renderMetrics()` signature
6. Render pill in source group; CSS: `.pill-warn` (red border), `.pill-verified` (green border)
7. Test with: known DOAJ journal (e.g., PLOS ONE, ISSN 1932-6203), known Beall publisher (e.g., OMICS), and a normal journal (Nature)

## Todo

- [x] Source + clean Beall's list → `predatory-list.js`
- [x] Implement `normalizeName` + `beallLookup`
- [x] Implement `doajFetch` with localStorage cache
- [x] Implement `checkPredatory` orchestrator
- [x] Wire into main workflow before `renderMetrics`
- [x] Update `renderMetrics` signature to accept predatory result
- [x] Implement `renderPredatoryPill` + CSS
- [x] Test 3 cases (DOAJ verified, Beall-listed, neither)

## Risks

| Risk | Mitigation |
|------|-----------|
| Beall's list staleness / false positives | Show "list last updated" in tooltip; treat as warning only, not verdict; link to Beall mirror for verification |
| DOAJ API down | Wrap fetch in try/catch, fail silently (just no badge); 5s timeout |
| ISSN missing on source | Fall back to publisher/journal name match; document lower precision |
| Bundle size bloat | Minify list, only store ISSNs as strings (no metadata); ~30KB target |
| Defamation risk (calling journal predatory) | Frame as "Suspected — verify" with link to source; never definitive |

## Success Criteria

- DOAJ Verified pill appears for PLOS ONE
- Predatory warning pill appears for known Beall publisher
- Neither pill appears for Nature / Science
- DOAJ check uses cache on second lookup of same ISSN
- No console errors when ISSN missing or DOAJ down

## Open Questions

- Which Beall mirror is most current/maintained? → research before sourcing list
- Acceptable size for `predatory-list.js`? → target <50KB minified (per brainstorm)

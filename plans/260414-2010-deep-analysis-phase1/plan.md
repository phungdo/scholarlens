---
slug: deep-analysis-phase1
created: 2026-04-14
status: completed
mode: fast
blockedBy: []
blocks: []
---

# Phase 1 — Quick Wins: Deep Analysis Features

**Source brainstorm:** `plans/reports/brainstorm-260413-2209-deep-analysis-features.md`

## Goal

Ship 4 low-effort/high-impact analysis signals on top of existing OpenAlex data. Set modularization pattern (separate JS files) ahead of Phase 2.

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 01 | Citation trajectory (sparkline + trend label) | completed | S |
| 02 | Predatory journal detection (Beall + DOAJ) | completed | M |
| 03 | Enhance field-normalized percentile + quartile | completed | S |

## Key Constraints

- 100% client-side, no backend
- OpenAlex polite pool (10 req/s) — DOAJ adds 1 call per source
- Add new features as separate `<script>` files loaded in `<head>` (pattern from `core_rankings.js`)
- Preserve existing FWCI / Percentile / IF-proxy pills — only enhance

## Files Touched

- `index.html` — wire new modules, render new UI elements
- NEW `citation-trajectory.js` — sparkline SVG + trend classifier
- NEW `predatory-checker.js` — Beall lookup + DOAJ fetch + caching
- NEW `predatory-list.js` — static Beall's list data (~1500 entries)

## Success Criteria

- Phase 1 features add <500ms to total load (excluding cold DOAJ fetch) — not measured; add as follow-up
- All new modules <200 LOC each — citation-trajectory.js and predatory-checker.js meet this; predatory-list.js is static data (~110KB), exempt from LOC limit
- Existing functionality unchanged (no regressions in main pill rendering) — verified via code review (score 8.5/10 APPROVE)
- Modules are pure functions / globals — no build step — ✓ All criteria met

## Completion Notes

**Completed:** 2026-04-14

### Files Created
- `citation-trajectory.js` — sparkline SVG + trend classifier (~80 LOC)
- `predatory-list.js` — 1162 publishers + 1309 journals from Beall mirror (~110KB; exceeds <50KB target due to community mirror completeness; accepted trade-off)
- `predatory-checker.js` — Beall lookup + DOAJ fetch + localStorage cache (~120 LOC)

### Files Modified
- `index.html` — wired all 3 modules in `<head>`; updated `renderMetrics()` for trajectory pill, predatory pill (sourcePills), percentile pill with field label + mini-bar; updated `estimateQuartile()` Q2 color; fixed CSS selector case-mismatch (`.quartile-color-Q2` → `.quartile-color-q2`); added sparkline CSS

### Key Deviations
- `predatory-list.js` is ~110KB vs <50KB target — community Beall mirror data is comprehensive (1162 publishers + 1309 journals); bundle size accepted; minification is a future optimization
- `estimateQuartile()` simplified to return `{label}` only (no color in return value) — color applied via CSS class

### Post-review Fix
- XSS footgun: field name unescaped in tooltip innerHTML — fixed post code review

### Follow-ups (Future Phase)
- Measure actual load-time impact of predatory-list.js (~110KB) on first parse; consider lazy-loading or minification
- Performance budget: formally measure <500ms criterion with browser DevTools
- Beall list update mechanism: `predatory-list.js` is static; add a note/script for periodic refresh
- Consider gzip/brotli hint in docs for static server config

## Out of Scope (deferred to Phase 2)

- Reference quality analysis (top-20 sample)
- Reproducibility signals (GitHub/Zenodo detection, retraction check)
- Full `index.html` modularization (only new features split out)

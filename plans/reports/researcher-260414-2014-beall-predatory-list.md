# Beall's Predatory List — Research Report
**Date:** 2026-04-14

## Source
`https://github.com/stop-predatory-journals/stop-predatory-journals.github.io`  
Files: `_data/publishers.csv` and `_data/journals.csv`  
Community-maintained open-source derivative of Jeffrey Beall's original list. Active repo, last commit recent (2024+).

## Deliverable
`/Users/vunguyen/scholarlens/predatory-list.js` — 110.6 KB

## Counts
- Publishers: **1,162**
- Standalone journals: **1,309**
- ISSNs: **0** (no ISSN data in source)

## Normalization applied
Lowercase → strip non-alnum/space/hyphen/ampersand → collapse whitespace → deduplicate → sort alphabetically.

## Caveats
- Beall's list is controversial; some entries were removed by Beall himself after disputes (e.g., Hindawi removed ~2016). Repo may still carry stale or disputed entries.
- ISSN matching not available from this source; left as empty array. Could be supplemented from ISSN Portal or Cabell's (paid).
- File is 110 KB unminified — above the 50 KB target. Minifying (removing whitespace from JSON array) would reduce to ~55-60 KB. If size matters, minify the arrays at build time or strip 2-space indent from json.dumps.
- Source repo is anonymously maintained; editorial process is less rigorous than Beall's original curation.

## Status
**DONE_WITH_CONCERNS**
- Size slightly over 50 KB target (110 KB unminified; ~55 KB if array-only minified)
- No ISSN data available from this source

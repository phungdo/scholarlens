# ScholarLens

100% client-side academic paper quality checker. Vanilla HTML/CSS/JS single-page app — no build step, no framework, no backend.

## Commands

```bash
# Dev server (any static file server works)
python3 -m http.server 8765

# Open directly
open index.html
```

No build, no lint, no test runner configured. `test_lookup.js` is a manual Node script.

## Architecture

Single-file app — all HTML, CSS, and JS live in `index.html` (~4200 lines).

- **`index.html`** — Entire app: design system CSS vars, glassmorphism UI, all JS logic
- **`core_rankings.js`** — CORE conference rankings database (~1900 lines, auto-generated from `CORE.csv`)
- **`citation-trajectory.js`** — Sparkline SVG renderer + Rising/Stable/Declining classifier; exposes `window.CitationTrajectory`
- **`predatory-list.js`** — Bundled Beall's list static data (1162 publishers + 1309 journals); exposes `window.PREDATORY_LIST`
- **`predatory-checker.js`** — Two-signal predatory detection (Beall's list + DOAJ API); exposes `window.PredatoryChecker`
- **`CORE.csv`** — Raw CORE portal data, source of truth for `core_rankings.js`
- **`test_lookup.js`** — Manual test for CORE ranking lookups (run with `node test_lookup.js`)

Loading order in `<head>`: `core_rankings.js` → `citation-trajectory.js` → `predatory-list.js` → `predatory-checker.js` → pdf-lib

## External APIs (all called client-side)

| API | Purpose | Fallback |
|-----|---------|----------|
| OpenAlex (`api.openalex.org`) | Primary metadata, citations, h-index, author data, citation trajectory | — |
| CrossRef (`api.crossref.org`) | DOI resolution when OpenAlex fails | — |
| Semantic Scholar (`api.semanticscholar.org`) | Keyword extraction, reference data | OpenAlex keywords |
| corsproxy.io | CORS proxy for publisher page keyword scraping | Semantic Scholar fallback |
| DOAJ (`doaj.org/api/search/journals/issn:...`) | Confirm legitimate open access; overrides Beall's list hit | Silent fail (5s timeout) |

## Key Patterns

- **DOI extraction**: Regex-based from pasted text or PDF.js-extracted text
- **PDF handling**: PDF.js (CDN) for text extraction, pdf-lib for page rendering
- **Conference detection**: Matches `proceedings-article` type against `core_rankings.js` lookup table
- **Keyword extraction**: 3-tier: publisher page via CORS proxy → Semantic Scholar API → OpenAlex concepts
- **Citation trajectory**: `window.CitationTrajectory` reads `work.counts_by_year`, renders inline SVG sparkline
- **Predatory detection**: `window.PredatoryChecker` exact-matches publisher/ISSN against `window.PREDATORY_LIST`, then async-checks DOAJ API; DOAJ ✅ overrides Beall's ⚠️; result cached in localStorage 30 days
- **Design system**: CSS custom properties in `:root` (warm earthy palette, `--accent-indigo: #BF5A1E`)

## Conventions

- No modules/imports — all inline `<script>` and `<style>` in `index.html`
- Functions are global, called from inline event handlers and async workflows
- CSS uses BEM-like classes with glassmorphism effects
- Fonts: DM Sans (body), DM Serif Display (headings), JetBrains Mono (code)

## Gotchas

- `core_rankings.js` must be loaded before `index.html` scripts (declared first in `<head>`)
- New modules (`citation-trajectory.js`, `predatory-list.js`, `predatory-checker.js`) must be loaded in order before pdf-lib
- PDF.js page rendering must be `await`ed — skipping causes blurry even pages
- CORS proxy (`corsproxy.io`) is a third-party service; may be unreliable
- DOAJ API is unauthenticated with a 5s timeout; failures are silent (badge simply not shown)
- All API calls are unauthenticated — subject to rate limits (OpenAlex: polite pool, CrossRef: anonymous tier)
- Predatory detection uses exact-match only — substring matching was intentionally avoided to prevent false positives
- `index.html` is monolithic (~4200 lines) — search by function name, not scrolling

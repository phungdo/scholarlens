# Phase 01 — Citation Trajectory

**Priority:** High | **Status:** completed | **Effort:** S (~1-2h)

## Overview

Render a small SVG sparkline of `work.counts_by_year` + a Rising / Stable / Declining label as a new pill in the "📄 This Paper" group.

## Data Source

`work.counts_by_year` — already fetched by `fetchOpenAlex(/works/doi:...)`. Shape:
```js
[ { year: 2024, cited_by_count: 42 }, { year: 2023, cited_by_count: 30 }, ... ]
```

OpenAlex returns up to ~10 most recent years, descending. May be empty for new papers.

## UI

New pill inserted after FWCI / Percentile pills in `paperPills`:
```
[ ▁▂▃▅▇  ↗ Rising ]   stat-key: "Trajectory"
```

- Sparkline: 60×16 SVG, accent color, no axes
- Label: ↗ Rising (green), → Stable (gray), ↘ Declining (orange)
- Tooltip: "Citations per year: 2020:5 → 2024:42"

## Logic

Trend classifier (compare last 3 yrs vs prior 3 yrs avg, ignoring current incomplete year):
- `recent_avg / prior_avg > 1.25` → Rising
- `< 0.75` → Declining
- else → Stable
- Skip if <3 data points → render sparkline only, no label

Drop the current year if it's the latest — partial-year counts skew trend.

## Files

**Create:** `citation-trajectory.js` (~80 LOC)
- `renderSparkline(countsByYear)` → SVG string
- `classifyTrajectory(countsByYear)` → `{ trend: 'rising'|'stable'|'declining'|null, label, color }`
- `renderTrajectoryPill(countsByYear)` → full pill HTML or empty string

**Edit:** `index.html`
- `<head>`: `<script src="citation-trajectory.js"></script>` after core_rankings.js
- `renderMetrics()` (~line 3447): append `paperPills += renderTrajectoryPill(work.counts_by_year)`
- CSS: add `.sparkline-pill svg` styles inline near `.percentile-bar` (~line 1011)

## Implementation Steps

1. Create `citation-trajectory.js` with three pure functions
2. SVG: normalize counts to 0-1, plot polyline points across 60×16 box
3. Classifier: filter empty years, drop incomplete current year, compare windows
4. Wire pill render after Percentile pill in `renderMetrics()`
5. Add CSS for sparkline stroke + pill flex alignment
6. Manual test: 3 DOIs (high-cite established paper, new paper, declining old paper)

## Todo

- [x] Create `citation-trajectory.js` skeleton
- [x] Implement `renderSparkline()`
- [x] Implement `classifyTrajectory()` + edge cases (empty, 1 year, all zeros)
- [x] Implement `renderTrajectoryPill()`
- [x] Wire into `renderMetrics()` in index.html
- [x] Add CSS styles for sparkline pill
- [x] Manual test with 3 DOIs

## Risks

| Risk | Mitigation |
|------|-----------|
| Sparkline cluttered for papers with 1-2 yrs of data | Only render if ≥2 years with non-zero counts |
| Current-year partial counts misleading | Drop latest year from trend calc; show in sparkline but mark |
| Pill row gets too wide on mobile | Sparkline 60px max; `paperPills` row already wraps via flex-wrap |

## Success Criteria

- Pill renders correctly for: high-cite paper, brand-new paper (no data), declining paper
- Sparkline visually communicates trend at a glance
- No JS errors when `counts_by_year` is empty/missing

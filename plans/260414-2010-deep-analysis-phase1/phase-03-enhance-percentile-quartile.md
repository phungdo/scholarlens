# Phase 03 — Enhance Percentile + Quartile Display

**Priority:** Medium | **Status:** completed | **Effort:** S (~1h)

## Overview

Existing pills (`Percentile`, `Quartile`) are functional but minimal. Per brainstorm: enrich Percentile with field name + visual bar, and improve Quartile color semantics.

## Current State (`index.html`)

- Line 3447: `Percentile` pill — shows `pctVal%` + top-1%/10% emoji
- Line 3473: `Quartile` pill — Q1/Q2/Q3/Q4 derived from `2yr_mean_citedness` thresholds
- CSS `.percentile-bar` / `.percentile-fill` defined (~line 1011) but **not currently used**

## Changes

### 1. Percentile pill → field-aware label + mini-bar

Today: `[ 87.4% 🏆 ]   Percentile`
Target: `[ ▓▓▓▓▓▓▓▓░ Top 12% in CS ]   Percentile`

- Use `work.primary_topic.field.display_name` (e.g., "Computer Science") for the field label
- Render the `.percentile-bar` already in CSS (just unused)
- "Top X%" framing instead of "X%" — easier to interpret

### 2. Quartile color palette consistency

Today (`estimateQuartile`):
- Q1 green `#10b981`, Q2 amber `#f59e0b`, Q3 orange `#f97316`, Q4 red `#ef4444`

Brainstorm spec: Q1=green, Q2=blue, Q3=orange, Q4=red

- Change Q2 to blue (`#3b82f6`) for clearer step gradient
- Add tooltip explaining estimation basis ("Estimated from 2yr citation rate; verify on Scimago")

### 3. (Optional micro-improvement) Quartile fallback

If `2yr_mean_citedness` missing but `cited_by_percentile_year.value` available on the **source itself** (rare), use that. Skip if not in OpenAlex source schema.

## Files

**Edit:** `index.html` only — no new modules (this is small)
- `renderMetrics()` ~line 3447: rewrite Percentile pill block
- `estimateQuartile()` ~line 3812: change Q2 color
- CSS `.percentile-bar` (~line 1011): verify width 60px, height 6px; add `--q1/q2/q3/q4-color` vars

## Implementation Steps

1. Update `estimateQuartile()` Q2 hex
2. Add CSS `.quartile-color-q2` to use blue
3. Rewrite Percentile pill HTML to include field name + `.percentile-bar` div
4. Compute `topPct = 100 - pctVal` for "Top X%" label
5. Manual test: paper with primary_topic, paper without, top-1% paper

## Todo

- [x] Update Q2 color in `estimateQuartile()` + CSS
- [x] Rewrite Percentile pill with bar + field label
- [x] Handle missing `primary_topic` (omit field, show "Top X%" only)
- [x] Verify visual on 3 sample DOIs

## Risks

| Risk | Mitigation |
|------|-----------|
| Field name too long (e.g., "Computer Science Applications") breaks pill width | Use `field.display_name` not `subfield`; truncate at 30 chars w/ ellipsis |
| Color change breaks user mental model | Q2 green→blue is one-time, document in commit message |

## Success Criteria

- Percentile pill shows "Top X% in {Field}" with visible mini-bar
- Quartile colors match brainstorm spec (Q1 green, Q2 blue, Q3 orange, Q4 red)
- No regression for papers missing topic/percentile data

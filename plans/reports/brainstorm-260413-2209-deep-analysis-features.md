# Brainstorm: ScholarLens Deep Analysis Features

**Date**: 2026-04-13
**Branch**: improve/ui
**Status**: Approved

## Problem Statement

ScholarLens provides basic paper quality metrics (citations, IF, CORE rank, h-index, OA status) but lacks deeper analysis signals researchers need: journal quartile rankings, reference portfolio quality, field-normalized metrics, predatory journal detection, reproducibility signals, and author credibility assessment.

## Requirements

- **Goal**: Deepen paper analysis capabilities for broad research audience
- **Architecture**: Client-side preferred; backend acceptable case-by-case
- **Constraint**: OpenAlex polite pool rate limit (10 req/s), no auth required
- **Reference analysis**: Sample top 20 refs (10 first + 10 last) to keep fast

## Phased Rollout

### Phase 1 — Quick Wins (Low effort, High impact)

| Feature | Data Source | UI Element |
|---------|-------------|------------|
| Scimago Q1-Q4 badge | OpenAlex Source `summary_stats` / `cited_by_percentile` | Color badge (Q1=green, Q2=blue, Q3=orange, Q4=red) |
| Field-normalized citation score | OpenAlex `cited_by_percentile` | Percentile bar ("Top 12% in CS") |
| Citation trajectory | OpenAlex `counts_by_year` (already fetched) | Sparkline + Rising/Stable/Declining label |
| Predatory journal check | Static Beall's list (~1500) + DOAJ API | Warning/verified badge |

### Phase 2 — Core Analysis (Medium effort, Very High impact)

| Feature | Approach |
|---------|----------|
| Reference quality analysis | Batch OpenAlex calls for top 20 refs → compute Q-rank distribution, avg citations, recency, self-citation % |
| Reproducibility signals | OpenAlex `has_fulltext`, GitHub/Zenodo link detection in abstract, CrossRef `update-to` for retractions |

**Reference analysis UI**: Donut chart (Q1-Q4 breakdown), stat cards (avg age, self-cite %, high-impact %), expandable list.

### Phase 3 — Advanced (Higher effort, Medium impact)

| Feature | Notes |
|---------|-------|
| Author credibility dashboard | Co-author network, publication frequency, institution rank, field diversity via OpenAlex author API |
| Similar papers with quality scores | OpenAlex `related_works` + Semantic Scholar recommendations |

## Architecture Decisions

- **Phase 1-2**: 100% client-side. All data from OpenAlex/CrossRef.
- **Phase 3**: Client-side with localStorage caching for rate-limit mitigation.
- **Predatory list**: Static JS file (like `core_rankings.js`), ~50KB compressed.
- **Retraction Watch**: Bundle top ~40K retracted DOIs as static lookup OR use CrossRef `update-to` field.
- **Modularization**: Extract new features into separate JS files (`reference-analyzer.js`, `predatory-checker.js`, `citation-trajectory.js`) to keep `index.html` manageable.

## Evaluated Alternatives

### Reference Analysis Scale
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Fetch ALL refs | Complete picture | Slow (100+ API calls), rate limit risk | Rejected |
| Top 20 sample | Fast, representative | Incomplete | **Selected** |
| Lazy load on demand | No upfront cost | Extra user interaction | Rejected |

### Predatory Detection
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Beall's list only | Simple, static | Outdated, no positives | Partial |
| DOAJ API only | Authoritative positive signal | Misses non-OA journals | Partial |
| Both combined | Warning (Beall's) + verified (DOAJ) | Two data sources to maintain | **Selected** |

## Risks

| Risk | Mitigation |
|------|-----------|
| OpenAlex rate limits | Request queue w/ 100ms delay, batch using filter API |
| Beall's list staleness | Version the list, show "last updated" date |
| index.html bloat (>5000 lines) | Modularize into separate JS files per feature |
| Scimago data accuracy | Cross-validate OpenAlex percentile vs actual Scimago (manual spot check) |

## Success Metrics

- Phase 1 features add <500ms to total load time
- Reference analysis completes in <10s for 20 refs
- Predatory check has <1% false positive rate
- User can assess paper quality without leaving ScholarLens

## Next Steps

1. Create implementation plan with detailed phases
2. Phase 1 first — ship quick wins to validate approach
3. Modularize JS before Phase 2 to prevent index.html bloat

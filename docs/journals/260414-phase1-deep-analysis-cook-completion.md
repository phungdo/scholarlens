# Phase 1 Deep Analysis: Shipped, Two Near-Misses, One Size Concession

**Date**: 2026-04-14 20:37
**Severity**: Low
**Component**: Deep Analysis features — citation trajectory, predatory publisher/journal checker
**Status**: Resolved

## What Happened

Completed Phase 1 Deep Analysis in a single `/cook` session (code mode, plan pre-existed). Three sub-phases landed:

- `citation-trajectory.js` (~80 LOC): year-over-year citation growth sparkline
- `predatory-checker.js` (~158 LOC): publisher + journal lookup with ⚠️/✅ badges
- `predatory-list.js` (110KB static bundle): 1162 publishers + 1309 journals from the community Beall mirror at stop-predatory-journals
- `index.html` +103 lines wiring everything together
- `README.md`, `CLAUDE.md` updated

Code review landed at **8.5/10 APPROVE**.

## The Brutal Truth

Two bugs were caught, neither at review time — both via ad-hoc Node sanity tests mid-workflow. That's the workflow doing its job, but only barely. If those tests hadn't been run manually, both would have shipped.

## Technical Details

**Bug 1 — False positive defamation risk**: `beallLookup` used bidirectional substring matching. `"Nature"` (from "Nature Publishing Group") matched list entry `"journal of nature and science"`. The plan's own risk section called out defamation risk from false positives. The substring match was silently wrong in exactly that direction. Fixed by building a `Set` index on normalized publisher/journal names and switching to exact match. The plan had suggested word/substring matching; I deviated for legal safety.

**Bug 2 — XSS footgun**: the `field` variable was HTML-escaped in the `innerHTML` path but not in the `title` attribute tooltip. Flagged by code-reviewer. Fixed before finalize. Classic split-path sanitization miss.

## Accepted Deviation

`predatory-list.js` is 110KB against the plan's <50KB soft target. Traded bundle size for 2471 real entries vs a truncated starter set. Right call — a predatory checker with 200 entries is theater.

## Open Follow-Ups

- **Perf not measured**: <500ms criterion for new features was flagged but not verified. Needs a real timing check on cold load with large PDFs.
- **Beall mirror staleness**: static bundle has no update mechanism. Community mirror accuracy degrades over time.

**Owner**: @vunguyen
**Timeline**: perf check before next public release

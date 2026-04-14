# Code Simplifier Report — Phase 1 Deep Analysis

**Date:** 2026-04-14

## Files Modified

- `index.html` — `estimateQuartile()` only (~line 3877)

## Files Unchanged

- `citation-trajectory.js` — clean, no dead code, no meaningful redundancy
- `predatory-checker.js` — clean, constants/cache helpers properly scoped

## Change Made

**`estimateQuartile`**: removed unused `key` and `color` fields from all four return objects. Only `label` is consumed by callers (`quartile-color-${quartile.label}` CSS class, title tooltip). Colors are handled entirely by CSS `.quartile-color-Q*` classes.

**Line diff:** -4 / +4 (net 0 lines, 8 fields removed)

## Rationale

Dead fields: `quartile.key` and `quartile.color` have zero references in index.html or any other file. CSS already encodes the color mapping. Removing them reduces cognitive overhead when reading callers.

## What Was Not Changed

- Double `normalizeCounts` call in `renderTrajectoryPill` — trivial cost on a small array; no meaningful gain
- `PredatoryChecker` exports of `normalizeName`/`beallLookup`/`doajFetch` — intentional for testability
- Predatory guard `if (predatoryResult && window.PredatoryChecker)` — consistent defensive pattern throughout file

## Syntax Verification

`node -c citation-trajectory.js predatory-checker.js` — both pass

## Risks

None — removing unused object fields with zero callers.

**Status:** DONE

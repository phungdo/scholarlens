/**
 * citation-trajectory.js — Sparkline SVG + trend classifier for OpenAlex `counts_by_year`.
 * Pure functions, globals on window. Loaded after core_rankings.js in index.html <head>.
 */
(function () {
  'use strict';

  // Normalize raw counts_by_year: ascending by year, drop empty/undefined years.
  // Optionally drop the latest year (current, partial-year counts skew trend).
  function normalizeCounts(countsByYear, dropCurrent) {
    if (!Array.isArray(countsByYear) || countsByYear.length === 0) return [];
    const now = new Date().getUTCFullYear();
    let arr = countsByYear
      .filter(d => d && typeof d.year === 'number' && typeof d.cited_by_count === 'number')
      .slice()
      .sort((a, b) => a.year - b.year);
    if (dropCurrent && arr.length > 0 && arr[arr.length - 1].year >= now) {
      arr = arr.slice(0, -1);
    }
    return arr;
  }

  // Render a compact 60x16 sparkline polyline.
  function renderSparkline(countsByYear) {
    const data = normalizeCounts(countsByYear, false);
    if (data.length < 2) return '';
    const W = 60, H = 16, P = 1;
    const max = Math.max(...data.map(d => d.cited_by_count), 1);
    const step = (W - 2 * P) / (data.length - 1);
    const points = data.map((d, i) => {
      const x = P + i * step;
      const y = H - P - (d.cited_by_count / max) * (H - 2 * P);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<svg class="sparkline" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
      <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  // Classify trajectory by comparing last-3 vs prior-3 window averages (excluding partial current year).
  function classifyTrajectory(countsByYear) {
    const data = normalizeCounts(countsByYear, true);
    if (data.length < 3) return { trend: null, label: '', color: '' };
    const recent = data.slice(-3);
    const prior = data.slice(-6, -3);
    if (prior.length === 0) return { trend: null, label: '', color: '' };
    const avg = a => a.reduce((s, d) => s + d.cited_by_count, 0) / a.length;
    const priorAvg = avg(prior);
    const recentAvg = avg(recent);
    if (priorAvg <= 0 && recentAvg <= 0) return { trend: null, label: '', color: '' };
    if (priorAvg <= 0) return { trend: 'rising', label: '↗ Rising', color: 'var(--accent-emerald)' };
    const ratio = recentAvg / priorAvg;
    if (ratio > 1.25) return { trend: 'rising', label: '↗ Rising', color: 'var(--accent-emerald)' };
    if (ratio < 0.75) return { trend: 'declining', label: '↘ Declining', color: 'var(--accent-rose)' };
    return { trend: 'stable', label: '→ Stable', color: 'var(--text-muted)' };
  }

  // Build the paper-pill HTML. Returns '' if insufficient data.
  function renderTrajectoryPill(countsByYear) {
    const spark = renderSparkline(countsByYear);
    if (!spark) return '';
    const traj = classifyTrajectory(countsByYear);
    const data = normalizeCounts(countsByYear, false);
    const first = data[0], last = data[data.length - 1];
    const tooltip = `Citations per year: ${first.year}:${first.cited_by_count} → ${last.year}:${last.cited_by_count}`;
    const labelHtml = traj.label
      ? `<span class="trajectory-label" style="color:${traj.color};">${traj.label}</span>`
      : '';
    return `<div class="stat-pill sparkline-pill" title="${tooltip}">
      <span class="stat-val">${spark}${labelHtml}</span>
      <span class="stat-key">Trajectory</span>
    </div>`;
  }

  window.CitationTrajectory = {
    renderSparkline,
    classifyTrajectory,
    renderTrajectoryPill,
  };
})();

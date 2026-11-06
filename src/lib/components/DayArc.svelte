<script lang="ts">
  import type { HourPoint } from '$lib/types';
  import { RISK_META, keyFromLevel, shortHour } from '$lib/utils/risk';
  import { formatNumber, timeWithMinutes } from '$lib/utils/format';

  export let hours: HourPoint[];
  export let currentHour: number;
  export let currentMinute = 0;
  export let peakHour: number;
  export let peakFeels: number;
  export let riskLevel: number;
  export let night = false;
  export let idPrefix = 'arc';
  export let showNow = true;

  const W = 640;
  const H = 290;
  const LEFT = 22;
  const RIGHT = 22;
  const TOP = 46;
  const BOTTOM = 185;
  const BAND_Y = 224;
  const BAND_H = 18;

  $: visible = hours && hours.length ? hours : [];
  $: minFeels = Math.min(...(visible.length ? visible.map((p) => p.feelsC) : [20]));
  $: maxFeels = Math.max(...(visible.length ? visible.map((p) => p.feelsC) : [30]));
  $: padding = Math.max(1.2, (maxFeels - minFeels) * 0.18);
  $: low = minFeels - padding;
  $: high = maxFeels + padding;

  $: points = visible.map((p, index) => ({
    ...p,
    index,
    x: xForIndex(index),
    y: yForFeels(p.feelsC)
  }));

  $: path = makeSmoothPath(points);

  // Peak in visible window
  $: peak = points.reduce(
    (best, p) => (p.feelsC > best.feelsC ? p : best),
    points[0] ?? { x: W / 2, y: TOP, feelsC: 0, hour: 12, index: 0 }
  );

  // Night minimum in nocturnal hours (hours 20 to 6)
  $: nightPoints = points.filter((p) => p.hour >= 20 || p.hour <= 6);
  $: nightMin = nightPoints.length
    ? nightPoints.reduce((best, p) => (p.feelsC < best.feelsC ? p : best), nightPoints[0])
    : null;

  $: displayPeakHour = peakHour ?? peak.hour;
  $: displayPeakFeels = peakFeels ?? peak.feelsC;
  $: peakPoint = points.find((p) => p.hour === displayPeakHour) ?? peak;
  $: peakX = peakPoint.x;
  $: peakY = peakPoint.y;

  // Now marker with exact minute calculation
  $: nowFrac = findNowFrac();
  $: nowX = xForIndex(nowFrac);
  $: nowY = valueAtFrac(nowFrac);

  $: nowLabel = `Ahora · ${timeWithMinutes(currentHour, currentMinute)}`;
  $: peakLabel = `Pico ${shortHour(displayPeakHour)}`;
  $: sameMarker = showNow && Math.abs(peakX - nowX) < 56;
  $: summary = buildSummary();

  // Tick labels along X axis
  $: ticks = computeTicks();

  function findNowFrac(): number {
    if (!visible.length) return 0;
    // Find point matching current hour
    for (let i = 0; i < visible.length; i++) {
      if (visible[i].hour === currentHour) {
        return i + Math.max(0, Math.min(0.99, currentMinute / 60));
      }
    }
    return Math.max(0, Math.min(visible.length - 1, visible.length / 2));
  }

  function xForIndex(index: number): number {
    if (visible.length <= 1) return LEFT;
    const t = Math.max(0, Math.min(1, index / (visible.length - 1)));
    return LEFT + t * (W - LEFT - RIGHT);
  }

  function yForFeels(feels: number): number {
    const t = (feels - low) / Math.max(0.1, high - low);
    return BOTTOM - Math.max(0, Math.min(1, t)) * (BOTTOM - TOP);
  }

  function valueAtFrac(frac: number): number {
    if (!points.length) return TOP;
    const i0 = Math.floor(frac);
    const i1 = Math.min(points.length - 1, i0 + 1);
    if (i0 === i1) return points[i0].y;
    const ratio = frac - i0;
    return points[i0].y + (points[i1].y - points[i0].y) * ratio;
  }

  function computeTicks(): Array<{ x: number; label: string; anchor: string }> {
    if (!visible.length) return [];
    if (visible.length <= 16) {
      // Daytime 6 to 20
      const targetHours = [6, 10, 14, 18, 20];
      return targetHours
        .map((h) => {
          const idx = visible.findIndex((p) => p.hour === h);
          if (idx < 0) return null;
          return {
            x: xForIndex(idx),
            label: `${h} h`,
            anchor: idx === 0 ? 'start' : idx === visible.length - 1 ? 'end' : 'middle'
          };
        })
        .filter((t): t is { x: number; label: string; anchor: string } => Boolean(t));
    }
    // 24h night cycle: 18h to 18h next day
    const indices = [0, 4, 8, 12, 16, 20, visible.length - 1];
    return indices.map((idx, i) => {
      const p = visible[idx];
      return {
        x: xForIndex(idx),
        label: `${p.hour} h`,
        anchor: i === 0 ? 'start' : i === indices.length - 1 ? 'end' : 'middle'
      };
    });
  }

  function makeSmoothPath(pts: typeof points): string {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const tension = 0.16;
      const c1x = p1.x + (p2.x - p0.x) * tension;
      const c1y = p1.y + (p2.y - p0.y) * tension;
      const c2x = p2.x - (p3.x - p1.x) * tension;
      const c2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  function fillFor(level: number): string {
    return ['var(--safe)', 'var(--attention)', 'var(--precaution)', 'var(--danger)', 'var(--extreme)'][
      level
    ];
  }

  function buildSummary(): string {
    if (!visible.length) return 'No hay datos horarios para hoy.';
    const hottest = visible.reduce((best, point) => (point.feelsC > best.feelsC ? point : best));
    const nowFeels = visible.find((p) => p.hour === currentHour)?.feelsC ?? displayPeakFeels;
    const nightStr = nightMin ? ` Mínima nocturna de ${Math.round(nightMin.feelsC)} grados a las ${shortHour(nightMin.hour)}.` : '';
    return `Arco del calor ${visible.length > 16 ? 'en 24 horas' : 'del día'}. Ahora son las ${timeWithMinutes(currentHour, currentMinute)} con ${formatNumber(nowFeels, 1)} grados de sensación térmica, riesgo ${RISK_META[keyFromLevel(riskLevel)].label}. El pico es de ${formatNumber(hottest.feelsC, 1)} grados a las ${shortHour(hottest.hour)}.${nightStr}`;
  }
</script>

<figure class="day-arc">
  <svg
    viewBox={`0 0 ${W} ${H}`}
    role="img"
    aria-labelledby={`${idPrefix}-title ${idPrefix}-desc`}
    preserveAspectRatio="xMidYMid meet"
  >
    <title id={`${idPrefix}-title`}>Arco de calor y riesgo {night ? 'nocturno' : 'del día'}</title>
    <desc id={`${idPrefix}-desc`}>{summary}</desc>

    <defs>
      <linearGradient id={`${idPrefix}-fill`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--risk)" stop-opacity="0.22" />
        <stop offset="100%" stop-color="var(--risk)" stop-opacity="0" />
      </linearGradient>
      <pattern id={`${idPrefix}-diag`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="7" height="7" fill="var(--danger)" />
        <line x1="0" y1="0" x2="0" y2="7" stroke="var(--paper)" stroke-opacity="0.82" stroke-width="2.6" />
      </pattern>
      <pattern id={`${idPrefix}-cross`} width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="var(--extreme)" />
        <path d="M0 0L8 8M8 0L0 8" stroke="var(--paper)" stroke-opacity="0.75" stroke-width="1.3" />
      </pattern>
    </defs>

    {#if points.length}
      <path
        class="arc-area"
        d={`${path} L ${points[points.length - 1].x} ${BAND_Y - 14} L ${points[0].x} ${BAND_Y - 14} Z`}
        fill={`url(#${idPrefix}-fill)`}
      />
      <path class="arc-line" d={path} pathLength="1" fill="none" stroke="var(--risk-ink)" stroke-width="3" stroke-linecap="round" />
    {/if}

    {#if showNow}
      <line
        class="now-line"
        x1={nowX}
        y1={nowY + 12}
        x2={nowX}
        y2={BAND_Y}
        stroke="var(--risk-ink)"
        stroke-width="1.4"
        stroke-dasharray="3 5"
        opacity="0.85"
      />
    {/if}

    <!-- Risk Band by Hour -->
    {#each points as point, index}
      {@const start = index === 0 ? LEFT : (point.x + (points[index - 1]?.x ?? point.x)) / 2}
      {@const end = index === points.length - 1 ? W - RIGHT : (point.x + (points[index + 1]?.x ?? point.x)) / 2}
      <rect
        x={start}
        y={BAND_Y}
        width={Math.max(0, end - start)}
        height={BAND_H}
        fill={fillFor(point.risk)}
        aria-hidden="true"
      />
      {#if point.risk === 3}
        <rect x={start} y={BAND_Y} width={Math.max(0, end - start)} height={BAND_H} fill={`url(#${idPrefix}-diag)`} aria-hidden="true" />
      {:else if point.risk === 4}
        <rect x={start} y={BAND_Y} width={Math.max(0, end - start)} height={BAND_H} fill={`url(#${idPrefix}-cross)`} aria-hidden="true" />
      {/if}
    {/each}

    <!-- Peak Heat Marker -->
    <g class="peak-marker" aria-hidden="true">
      <circle cx={peakX} cy={peakY} r="5" fill="var(--paper)" stroke="var(--risk-ink)" stroke-width="2.2" />
      {#if !sameMarker}
        <line x1={peakX} y1={peakY - 7} x2={peakX} y2={peakY - 18} stroke="var(--risk-ink)" stroke-width="1.2" opacity=".6" />
        <text
          x={peakX}
          y={peakY - 25}
          text-anchor={peakX > W - 140 ? 'end' : peakX < 110 ? 'start' : 'middle'}
          class="peak-text"
        >{peakLabel}</text>
      {/if}
    </g>

    <!-- Night Minimum Marker (when in night mode and not near now) -->
    {#if night && nightMin && Math.abs(nightMin.x - nowX) > 60}
      <g class="night-min-marker" aria-hidden="true">
        <circle cx={nightMin.x} cy={nightMin.y} r="4.5" fill="var(--paper)" stroke="var(--ink-soft)" stroke-width="2" />
        <text
          x={nightMin.x}
          y={Math.min(BAND_Y - 18, nightMin.y + 24)}
          text-anchor={nightMin.x > W - 120 ? 'end' : nightMin.x < 110 ? 'start' : 'middle'}
          class="night-min-text"
        >🌙 {Math.round(nightMin.feelsC)}° mín.</text>
      </g>
    {/if}

    <!-- Now Dot & Label -->
    {#if showNow}
      <circle class="now-halo" cx={nowX} cy={nowY} r="22" fill={night ? 'var(--ink)' : 'var(--attention)'} opacity=".2" />
      <circle
        class="now-dot"
        class:now-dot--night={night}
        cx={nowX}
        cy={nowY}
        r="11.5"
        fill={night ? 'var(--ink)' : 'var(--attention)'}
        stroke="var(--paper)"
        stroke-width="3.5"
      />
      <g class="now-label" aria-hidden="true">
        <text
          x={nowX}
          y={sameMarker ? Math.max(28, nowY - 38) : Math.max(24, nowY - 24)}
          text-anchor={nowX > W - 120 ? 'end' : nowX < 110 ? 'start' : 'middle'}
          class="now-text"
        >{sameMarker ? `Ahora · ${shortHour(displayPeakHour)}` : nowLabel}</text>
      </g>
    {/if}

    <!-- Hour Ticks -->
    {#each ticks as tick}
      <text
        x={tick.x}
        y={BAND_Y + 42}
        text-anchor={tick.anchor}
        class="hour-label"
      >{tick.label}</text>
    {/each}
  </svg>

  <figcaption class="arc-caption">
    {#if night}
      <span>Anocheció 18&nbsp;h</span>
      <span class="arc-caption__peak">
        {#if nightMin}🌙 Mínima nocturna: {Math.round(nightMin.feelsC)}° a las {shortHour(nightMin.hour)}{:else}Pico de riesgo: {shortHour(displayPeakHour)}{/if}
      </span>
      <span>Amanece 6&nbsp;h</span>
    {:else}
      <span>Amanece 6&nbsp;h</span>
      <span class="arc-caption__peak">☀️ Pico de calor: {shortHour(displayPeakHour)} ({Math.round(displayPeakFeels)}°)</span>
      <span>Anochece 20&nbsp;h</span>
    {/if}
  </figcaption>
</figure>

<style>
  .day-arc {
    margin: 0;
    width: 100%;
    min-width: 0;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .arc-line {
    stroke-dasharray: 1;
    animation: draw-arc 1100ms var(--ease-out) both;
  }
  @keyframes draw-arc {
    from {
      stroke-dashoffset: 1;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  .arc-area {
    opacity: 0;
    animation: fade-in 1000ms 250ms ease both;
  }
  .now-dot {
    filter: drop-shadow(0 2px 6px rgba(43, 22, 8, 0.22));
  }
  .now-halo {
    animation: halo 3.6s ease-in-out infinite;
  }
  @keyframes halo {
    0%, 100% {
      opacity: 0.16;
      transform: scale(1);
    }
    50% {
      opacity: 0.3;
    }
  }
  .now-text {
    font-family: var(--font-body);
    font-size: 24px;
    font-weight: 750;
    fill: var(--ink);
    letter-spacing: -0.01em;
  }
  .peak-text {
    font-family: var(--font-body);
    font-size: 22px;
    font-weight: 650;
    fill: var(--ink-soft);
  }
  .night-min-text {
    font-family: var(--font-body);
    font-size: 21px;
    font-weight: 650;
    fill: var(--ink-soft);
  }
  .hour-label {
    font-family: var(--font-body);
    font-size: 22px;
    font-weight: 650;
    fill: var(--ink-soft);
    font-variant-numeric: tabular-nums;
  }
  .arc-caption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 6px;
    font-size: 0.9375rem; /* 15px */
    color: var(--ink-soft);
    line-height: 1.35;
    font-weight: 560;
  }
  .arc-caption span {
    white-space: nowrap;
  }
  .arc-caption__peak {
    color: var(--ink);
    font-weight: 700;
    text-align: center;
  }
  @media (min-width: 768px) {
    .day-arc {
      min-height: 220px;
    }
    .now-text {
      font-size: 23px;
    }
    .peak-text {
      font-size: 21px;
    }
    .night-min-text {
      font-size: 20px;
    }
    .hour-label {
      font-size: 21px;
    }
    .arc-caption {
      font-size: 0.9375rem;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .arc-line {
      animation: none;
      stroke-dashoffset: 0;
    }
    .arc-area,
    .now-halo {
      animation: none;
      opacity: 0.16;
    }
  }
  @media (max-width: 370px) {
    .arc-caption span:first-child,
    .arc-caption span:last-child {
      display: none;
    }
    .arc-caption {
      justify-content: center;
    }
  }
</style>

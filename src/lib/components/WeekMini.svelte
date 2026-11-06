<script lang="ts">
  import { ChevronRight } from '@lucide/svelte';
  import type { DailyPoint } from '$lib/types';
  import { RISK_META } from '$lib/utils/risk';
  import { dayLabel, shortDate } from '$lib/utils/format';

  export let days: DailyPoint[];
  export let todayKey: string;

  // Compute week range for the thermal bar
  $: minTemp = days && days.length ? Math.min(...days.map((d) => d.tempMin)) : 15;
  $: maxTemp = days && days.length ? Math.max(...days.map((d) => d.tempMax)) : 35;
  $: range = Math.max(1, maxTemp - minTemp);

  function barLeft(min: number): number {
    return Math.max(0, Math.min(85, ((min - minTemp) / range) * 100));
  }

  function barWidth(min: number, max: number): number {
    const raw = ((max - min) / range) * 100;
    return Math.max(16, Math.min(100 - barLeft(min), raw));
  }

  function shouldShowBadge(index: number, day: DailyPoint, allDays: DailyPoint[]): boolean {
    // Show badge if risk is elevated (>= 1) or if it changes compared to the previous day.
    // Suppress repeated "Seguro" when there is no change.
    if (day.risk > 0) return true;
    if (index === 0) return false;
    return day.risk !== allDays[index - 1].risk;
  }
</script>

<div class="week">
  <div class="week__head">
    <h2>Los próximos días</h2>
    <a href="/dias">Ver semana <ChevronRight size={15} strokeWidth={2} aria-hidden="true" /></a>
  </div>
  <ol class="week__list">
    {#each days as day, index}
      {@const showBadge = shouldShowBadge(index, day, days)}
      <li>
        <a class="week__row" href={`/dias/${day.date}`}>
          <div class="week__day">
            <span class="week__name">{dayLabel(day.date, todayKey)}</span>
            <span class="week__date">{shortDate(day.date)}</span>
          </div>

          <div class="week__bar-col" aria-hidden="true">
            <div class="week__track">
              <div
                class="week__bar"
                data-level={day.risk}
                style={`left: ${barLeft(day.tempMin)}%; width: ${barWidth(day.tempMin, day.tempMax)}%;`}
              ></div>
            </div>
          </div>

          <div class="week__temps tabular">
            <span class="week__max">{Math.round(day.tempMax)}°</span>
            <span class="week__min">mín.&nbsp;{Math.round(day.tempMin)}°</span>
          </div>

          <div class="week__risk-wrap">
            {#if showBadge}
              <span class="week__risk" data-level={day.risk}>{RISK_META[day.riskKey].label}</span>
            {:else}
              <span class="week__risk-dot" data-level={day.risk} title={RISK_META[day.riskKey].label}></span>
            {/if}
          </div>
        </a>
      </li>
    {/each}
  </ol>
</div>

<style>
  .week {
    width: 100%;
    padding-bottom: 74px; /* Space for desktop floating emergency button */
  }
  .week__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--hairline);
  }
  .week__head h2 {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.035em;
    color: var(--ink);
  }
  .week__head a {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-height: 32px;
    font-size: 0.875rem;
    font-weight: 640;
    text-decoration: none;
    color: var(--ink-soft);
  }
  .week__head a:hover {
    color: var(--ink);
  }
  .week__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .week__row {
    display: grid;
    grid-template-columns: minmax(110px, 1.2fr) minmax(70px, 1fr) auto 64px;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    border-bottom: 1px solid var(--hairline-soft);
    text-decoration: none;
    transition: opacity 150ms ease;
  }
  .week__row:hover {
    opacity: 0.75;
  }
  .week__day {
    display: flex;
    align-items: baseline;
    gap: 7px;
    min-width: 0;
  }
  .week__name {
    font-weight: 650;
    font-size: 0.9375rem;
    color: var(--ink);
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .week__date {
    font-size: 0.875rem;
    font-weight: 540;
    color: var(--ink-soft);
    white-space: nowrap;
  }
  .week__bar-col {
    display: flex;
    align-items: center;
    padding: 0 4px;
  }
  .week__track {
    position: relative;
    width: 100%;
    height: 6px;
    background: var(--hairline-strong);
    border-radius: 999px;
    overflow: hidden;
  }
  .week__bar {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 999px;
    background: var(--safe);
    transition: width 240ms ease;
  }
  .week__bar[data-level='0'] {
    background: var(--safe);
  }
  .week__bar[data-level='1'] {
    background: var(--attention);
  }
  .week__bar[data-level='2'] {
    background: var(--precaution);
  }
  .week__bar[data-level='3'] {
    background: var(--danger);
  }
  .week__bar[data-level='4'] {
    background: var(--extreme);
  }
  .week__temps {
    display: flex;
    align-items: baseline;
    gap: 6px;
    justify-content: flex-end;
    white-space: nowrap;
  }
  .week__max {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 640;
    letter-spacing: -0.04em;
    color: var(--ink);
  }
  .week__min {
    font-size: 0.875rem;
    font-weight: 560;
    color: var(--ink-soft);
  }
  .week__risk-wrap {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    min-width: 58px;
  }
  .week__risk {
    display: inline-block;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    text-align: right;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .week__risk[data-level='0'] {
    color: var(--safe-ink);
  }
  .week__risk[data-level='1'] {
    color: var(--attention-ink);
    background: color-mix(in srgb, var(--attention) 22%, transparent);
  }
  .week__risk[data-level='2'] {
    color: var(--precaution-ink);
    background: color-mix(in srgb, var(--precaution) 22%, transparent);
  }
  .week__risk[data-level='3'] {
    color: var(--danger-ink);
    background: color-mix(in srgb, var(--danger) 18%, transparent);
  }
  .week__risk[data-level='4'] {
    color: var(--extreme-ink);
    background: color-mix(in srgb, var(--extreme) 20%, transparent);
  }
  .week__risk-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--safe);
    opacity: 0.65;
    margin-right: 6px;
  }

  @media (max-width: 900px) {
    .week__row {
      grid-template-columns: minmax(80px, 1.2fr) minmax(50px, 0.8fr) auto 44px;
      gap: 6px;
    }
    .week__date {
      display: none;
    }
  }
</style>
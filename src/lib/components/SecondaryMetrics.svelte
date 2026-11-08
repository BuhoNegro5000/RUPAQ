<script lang="ts">
  import { formatNumber, uvCategory } from '$lib/utils/format';
  import type { AirInfo } from '$lib/types';

  export let uv: number | null;
  export let uvMax: number | null;
  export let air: AirInfo;
</script>

<div class="secondary-metrics">
  <div class="metric">
    <span class="metric__label">UV ahora</span>
    <span class="metric__value tabular">{uv == null ? '—' : formatNumber(uv)}</span>
    <span class="metric__tag">{uvCategory(uv)}</span>
    {#if uvMax != null}
      <span class="metric__detail">Máx. hoy {formatNumber(uvMax)}</span>
    {/if}
  </div>
  <span class="metric__rule" aria-hidden="true"></span>
  <div class="metric">
    <span class="metric__label">Aire</span>
    <span class="metric__value">{air.category}</span>
    {#if air.aqi != null}
      <span class="metric__tag">AQI {formatNumber(air.aqi)}</span>
    {/if}
  </div>
</div>

<style>
  .secondary-metrics {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 18px;
    min-height: 50px;
  }
  .metric {
    display: flex;
    align-items: baseline;
    gap: 7px;
    min-width: 0;
  }
  .metric:last-child {
    justify-content: flex-start;
  }
  .metric__label {
    font-size: 0.9375rem;
    color: var(--ink-soft);
    font-weight: 600;
  }
  .metric__value {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 650;
    letter-spacing: -0.045em;
    line-height: 1;
    white-space: nowrap;
    color: var(--ink);
  }
  .metric__tag {
    font-size: 0.9375rem;
    color: var(--ink-soft);
    font-weight: 560;
    white-space: nowrap;
  }
  .metric__detail {
    flex-basis: 100%;
    font-size: 0.75rem;
    color: var(--ink-soft);
    font-weight: 560;
    white-space: nowrap;
  }
  .metric__rule {
    width: 1px;
    height: 28px;
    background: var(--hairline);
  }
  @media (max-width: 400px) {
    .secondary-metrics {
      gap: 12px;
    }
    .metric {
      gap: 5px;
    }
    .metric__value {
      font-size: 1.25rem;
    }
    .metric__tag {
      font-size: 0.875rem;
    }
  }
</style>

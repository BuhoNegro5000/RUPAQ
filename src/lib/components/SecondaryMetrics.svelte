<script lang="ts">
  import { formatNumber, uvCategory } from '$lib/utils/format';
  import type { AirInfo } from '$lib/types';

  export let uv: number | null;
  export let uvMax: number | null;
  export let air: AirInfo;

  function uvAdvice(value: number | null): string {
    if (value == null) return 'Sin dato de exposición';
    if (value < 3) return 'Protección habitual';
    if (value < 6) return 'Usa sombrero y protector solar';
    if (value < 8) return 'Busca sombra y reaplica protector';
    if (value < 11) return 'Evita el sol del mediodía';
    return 'Evita la exposición al mediodía';
  }
</script>

<div class="secondary-metrics">
  <div class="metric metric--uv">
    <div class="metric__row">
      <span class="metric__label">UV ahora</span>
      <span class="metric__value tabular">{uv == null ? '—' : formatNumber(uv)}</span>
      <span class="metric__tag">{uvCategory(uv)}</span>
    </div>
    {#if uvMax != null}
      <span class="metric__detail">Máximo hoy: {formatNumber(uvMax)}</span>
    {/if}
    <span class="metric__advice">{uvAdvice(uvMax ?? uv)}</span>
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
  .metric--uv {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }
  .metric__row {
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
    font-size: 0.75rem;
    color: var(--ink-soft);
    font-weight: 560;
    white-space: nowrap;
  }
  .metric__advice {
    font-size: 0.6875rem;
    line-height: 1.3;
    color: var(--ink-soft);
    max-width: 15rem;
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

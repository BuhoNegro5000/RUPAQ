<script lang="ts">
  import type { RiskKey } from '$lib/types';

  export let level: number;
  export let label: string;
  export let realTemp: number;
  export let humidity: number;
  export let feelsTemp: number | undefined = undefined;
  export let compact = false;

  const keys: RiskKey[] = ['safe', 'attention', 'precaution', 'danger', 'extreme'];
  $: activeKey = keys[level] ?? 'safe';
  $: diffTemp = feelsTemp !== undefined ? Math.round(feelsTemp) !== Math.round(realTemp) : false;
</script>

<div
  class="risk-row"
  class:risk-row--compact={compact}
  role="img"
  aria-label={`Nivel de riesgo ahora: ${label}. Temperatura real ${Math.round(realTemp)} grados, humedad ${humidity} por ciento.`}
>
  <div class="risk-row__left">
    <span class="segments" aria-hidden="true">
      {#each keys as key, index}
        <span
          class="segment"
          class:segment--active={index === level}
          data-active-level={index === level ? level : undefined}
          data-key={key}
        ></span>
      {/each}
    </span>
    <span class="risk-word" data-key={activeKey}>{label}</span>
  </div>
  <div class="risk-facts" aria-hidden="true">
    {#if diffTemp}
      <span>Real {Math.round(realTemp)}°</span>
    {/if}
    <span>Humedad {humidity} %</span>
  </div>
</div>

<style>
  .risk-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    row-gap: 6px;
    flex-wrap: wrap;
    min-height: 44px;
  }
  .risk-row__left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .segments {
    display: inline-flex;
    gap: 4px;
    flex: none;
  }
  .segment {
    display: block;
    width: 20px;
    height: 12px;
    background: color-mix(in srgb, var(--ink) 16%, transparent);
    border-radius: 1px;
  }
  .segment--active[data-active-level='0'] {
    background: var(--safe);
  }
  .segment--active[data-active-level='1'] {
    background: var(--attention);
  }
  .segment--active[data-active-level='2'] {
    background: var(--precaution);
  }
  .segment--active[data-active-level='3'] {
    background-color: var(--danger);
    background-image: repeating-linear-gradient(
      45deg,
      transparent 0 3px,
      color-mix(in srgb, var(--paper) 82%, transparent) 3px 5px
    );
  }
  .segment--active[data-active-level='4'] {
    background-color: var(--extreme);
    background-image: repeating-linear-gradient(
        45deg,
        transparent 0 4px,
        color-mix(in srgb, var(--paper) 78%, transparent) 4px 5px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent 0 4px,
        color-mix(in srgb, var(--paper) 78%, transparent) 4px 5px
      );
  }
  .risk-word {
    font-family: var(--font-display);
    font-weight: 720;
    font-size: 1.125rem;
    letter-spacing: 0.075em;
    text-transform: uppercase;
    line-height: 1;
    white-space: nowrap;
  }
  .risk-word[data-key='safe'] {
    color: var(--safe-ink);
  }
  .risk-word[data-key='attention'] {
    color: var(--attention-ink);
  }
  .risk-word[data-key='precaution'] {
    color: var(--precaution-ink);
  }
  .risk-word[data-key='danger'] {
    color: var(--danger-ink);
  }
  .risk-word[data-key='extreme'] {
    color: var(--extreme-ink);
  }
  .risk-facts {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
    font-size: 0.9375rem;
    line-height: 1.25;
    color: var(--ink-soft);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .risk-row--compact .segment {
    width: 16px;
    height: 10px;
  }
  @media (max-width: 380px) {
    .segment {
      width: 17px;
    }
    .risk-row__left {
      gap: 9px;
    }
    .risk-word {
      font-size: 1rem;
    }
    .risk-facts {
      font-size: 0.875rem;
    }
  }
</style>

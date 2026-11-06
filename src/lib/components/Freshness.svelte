<script lang="ts">
  import { clock } from '$lib/stores/clock';
  import { forecastOffline } from '$lib/stores/forecast';
  import { relativeFreshness } from '$lib/utils/format';
  import { WifiOff } from '@lucide/svelte';

  export let updatedAt: string;
  export let stale = false;
  export let showSource = true;
</script>

<p class="freshness" class:freshness--stale={stale || $forecastOffline}>
  {#if stale || $forecastOffline}
    <WifiOff size={15} strokeWidth={2} aria-hidden="true" />
  {:else}
    <span class="freshness__dot" aria-hidden="true"></span>
  {/if}
  <span>{relativeFreshness(updatedAt, $clock)}</span>
  {#if showSource}
    <span class="freshness__sep" aria-hidden="true">·</span>
    <a href="/mas/fuentes">Open-Meteo</a>
  {/if}
</p>

<style>
  .freshness {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem; /* 14px */
    color: var(--ink-soft);
    line-height: 1.35;
    flex-wrap: wrap;
    font-weight: 540;
  }
  .freshness a {
    color: var(--ink);
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: var(--hairline-strong);
  }
  .freshness a:hover {
    color: var(--risk-ink);
  }
  .freshness--stale {
    color: var(--danger-ink);
    font-weight: 640;
  }
  .freshness__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }
  .freshness__sep {
    color: var(--ink-mute);
  }
</style>
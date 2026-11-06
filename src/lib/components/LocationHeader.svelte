<script lang="ts">
  import { MapPin, ChevronDown } from '@lucide/svelte';
  import { selectedLocation } from '$lib/stores/location';
  import { fontSheetOpen } from '$lib/stores/ui';

  $: district = $selectedLocation;
  $: label =
    district.distrito === district.provincia
      ? district.distrito
      : `${district.distrito}, ${district.provincia}`;
</script>

<header class="location-head">
  <a class="location" href="/ubicacion" aria-label={`Cambiar ubicación. Ahora: ${label}, ${district.departamento}`}>
    <MapPin size={23} strokeWidth={1.9} aria-hidden="true" />
    <span class="location__text">{label}</span>
    <span class="location__chev"><ChevronDown size={18} strokeWidth={2} aria-hidden="true" /></span>
  </a>
  <button
    type="button"
    class="font-button"
    aria-label="Cambiar tamaño de letra"
    onclick={() => fontSheetOpen.set(true)}
  >
    <span aria-hidden="true">Aa</span>
  </button>
</header>

<style>
  .location-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 56px;
  }
  .location {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 48px;
    margin-left: -4px;
    padding: 0 4px;
    text-decoration: none;
    color: var(--ink);
    font-weight: 660;
    font-size: 1.0625rem;
    letter-spacing: -0.025em;
    max-width: calc(100% - 62px);
  }
  .location__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .location__chev {
    flex: none;
    color: var(--ink-soft);
  }
  .font-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    min-width: 50px;
    border: 1px solid var(--hairline-strong);
    border-radius: 50%;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: -0.04em;
    color: var(--ink);
    background: color-mix(in srgb, var(--paper) 14%, transparent);
  }
  .font-button:hover {
    background: var(--field);
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { MapPin, ChevronDown, Sun, Moon } from '@lucide/svelte';
  import { selectedLocation } from '$lib/stores/location';
  import { fontSheetOpen } from '$lib/stores/ui';
  import { settings, updateSettings } from '$lib/stores/settings';

  let systemDark = false;

  onMount(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark = query.matches;
    const sync = (event: MediaQueryListEvent) => (systemDark = event.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  });

  $: district = $selectedLocation;
  $: label =
    district.distrito === district.provincia
      ? district.distrito
      : `${district.distrito}, ${district.provincia}`;
  $: isDark = $settings.theme === 'auto' ? systemDark : $settings.theme === 'dark';

  function toggleTheme() {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  }
</script>

<header class="location-head">
  <a class="location" href="/ubicacion" aria-label={`Cambiar ubicación. Ahora: ${label}, ${district.departamento}`}>
    <MapPin size={23} strokeWidth={1.9} aria-hidden="true" />
    <span class="location__text">{label}</span>
    <span class="location__chev"><ChevronDown size={18} strokeWidth={2} aria-hidden="true" /></span>
  </a>
  <div class="tools">
    <button
      type="button"
      class="tool-button"
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      onclick={toggleTheme}
    >
      {#if isDark}
        <Sun size={22} strokeWidth={1.9} aria-hidden="true" />
      {:else}
        <Moon size={22} strokeWidth={1.9} aria-hidden="true" />
      {/if}
    </button>
    <button
      type="button"
      class="tool-button font-button"
      aria-label="Cambiar tamaño de letra"
      onclick={() => fontSheetOpen.set(true)}
    >
      <span aria-hidden="true">Aa</span>
    </button>
  </div>
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
    min-width: 0;
    max-width: calc(100% - 124px);
  }
  .tools {
    display: flex;
    flex: none;
    align-items: center;
    gap: 10px;
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
  .tool-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    min-width: 50px;
    border: 1px solid var(--hairline-strong);
    border-radius: 50%;
    color: var(--ink);
    background: color-mix(in srgb, var(--paper) 14%, transparent);
  }
  .tool-button:hover {
    background: var(--field);
  }
  .tool-button:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  .font-button {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: -0.04em;
  }
</style>

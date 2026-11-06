<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    Check,
    ChevronDown,
    MapPin,
    Navigation,
    Search,
    X
  } from '@lucide/svelte';
  import Logo from '$lib/components/Logo.svelte';
  import {
    haversineKm,
    loadAllLocations,
    nearestLocation,
    savedPlaces,
    searchLocations,
    selectedLocation,
    setLocation,
    uniqueSorted
  } from '$lib/stores/location';
  import type { Location } from '$lib/types';

  type GeoState = 'idle' | 'locating' | 'found' | 'error';

  let locations: Location[] = [];
  let loading = true;
  let loadError = '';
  let query = '';
  let departamento = '';
  let provincia = '';
  let geoState: GeoState = 'idle';
  let geoError = '';
  let nearby: { location: Location; distance: number } | null = null;
  let geoSupported = true;

  $: departments = uniqueSorted(locations.map((item) => item.departamento));
  $: provinces = uniqueSorted(
    locations
      .filter((item) => !departamento || item.departamento === departamento)
      .map((item) => item.provincia)
  );
  $: results = locations.length
    ? searchLocations(locations, query, {
        departamento: departamento || undefined,
        provincia: provincia || undefined
      })
    : [];
  $: hasFilters = Boolean(query || departamento || provincia);

  onMount(() => {
    geoSupported = 'geolocation' in navigator;
    void hydrate();
  });

  async function hydrate(): Promise<void> {
    try {
      locations = await loadAllLocations();
      departamento = $selectedLocation.departamento;
      provincia = $selectedLocation.provincia;
    } catch {
      loadError = 'No pudimos cargar la lista de distritos. Revisa tu conexión e inténtalo otra vez.';
    } finally {
      loading = false;
    }
  }

  function choose(location: Location): void {
    setLocation(location);
    void goto('/');
  }

  function onDepartmentChange(): void {
    provincia = '';
  }

  function requestLocation(): void {
    if (!geoSupported) {
      geoState = 'error';
      geoError = 'Este navegador no ofrece ubicación. Elige tu distrito a mano.';
      return;
    }
    geoState = 'locating';
    geoError = '';
    nearby = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!locations.length) {
          geoState = 'error';
          geoError = 'La lista de distritos aún no está lista. Inténtalo otra vez en un momento.';
          return;
        }
        const match = nearestLocation(locations, position.coords.latitude, position.coords.longitude);
        const distance = haversineKm(
          position.coords.latitude,
          position.coords.longitude,
          match.lat,
          match.lon
        );
        nearby = { location: match, distance };
        geoState = 'found';
      },
      (error) => {
        geoState = 'error';
        if (error.code === error.PERMISSION_DENIED) {
          geoError = 'No diste permiso de ubicación. Puedes elegir tu distrito a mano.';
        } else if (error.code === error.TIMEOUT) {
          geoError = 'La ubicación tardó demasiado. Prueba otra vez o elige el distrito a mano.';
        } else {
          geoError = 'No pudimos obtener tu ubicación. Elige el distrito a mano.';
        }
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 }
    );
  }

  function useNearby(): void {
    if (nearby) choose(nearby.location);
  }

  function clearFilters(): void {
    query = '';
    departamento = '';
    provincia = '';
  }
</script>

<svelte:head>
  <title>Elegir Distrito en Perú · RUPAQ</title>
  <meta
    name="description"
    content="Elige tu distrito en Perú con búsqueda por departamento, provincia y distrito, o usa tu ubicación con permiso explícito para obtener pronóstico térmico y alertas de calor."
  />
  <meta property="og:title" content="Elegir Distrito en Perú · RUPAQ" />
  <meta
    property="og:description"
    content="Busca cualquier distrito de la costa, sierra o selva del Perú para conocer la sensación térmica en tiempo real."
  />
  <meta property="og:url" content="https://rupaq.pe/ubicacion" />
</svelte:head>

<div class="screen location-screen">
  <div class="location-page">
    <header class="location-top">
      <a class="top-logo" href="/" aria-label="Volver al inicio de Rupaq">
        <Logo size={28} />
      </a>
      <a class="close" href="/" aria-label="Cerrar y volver al inicio">
        <X size={22} strokeWidth={2} aria-hidden="true" />
      </a>
    </header>

    <main class="location-main">
      <header class="location-head">
        <p class="eyebrow">Tu distrito</p>
        <h1>¿Dónde estás hoy?</h1>
        <p class="intro">
          El calor cambia según la zona, la humedad y la altitud. Rupaq usa el distrito para darte un
          pronóstico y un consejo que tengan sentido.
        </p>
      </header>

      <section class="geo-card" aria-labelledby="geo-title">
        <div class="geo-head">
          <span class="geo-icon" aria-hidden="true"><Navigation size={23} strokeWidth={1.8} /></span>
          <div>
            <h2 id="geo-title">Usar mi ubicación</h2>
            <p>
              Es opcional. Pediremos permiso al navegador y buscaremos el distrito más cercano. No
              guardamos tus coordenadas exactas.
            </p>
          </div>
        </div>

        {#if geoState === 'idle' || geoState === 'error'}
          <button type="button" class="geo-button" onclick={requestLocation} disabled={loading}>
            <Navigation size={19} strokeWidth={1.9} aria-hidden="true" />
            {geoState === 'error' ? 'Intentar otra vez' : 'Usar mi ubicación'}
          </button>
          {#if geoState === 'error'}
            <p class="geo-error" role="status">{geoError}</p>
          {/if}
        {:else if geoState === 'locating'}
          <p class="geo-status" role="status">
            <span class="spinner" aria-hidden="true"></span>
            Buscando el distrito más cercano…
          </p>
        {:else if geoState === 'found' && nearby}
          <div class="geo-result">
            <span class="geo-check" aria-hidden="true"><Check size={18} strokeWidth={2.2} /></span>
            <div>
              <p class="geo-result__name">{nearby.location.distrito}</p>
              <p class="geo-result__detail">
                {nearby.location.provincia}, {nearby.location.departamento} · a
                {nearby.distance < 1
                  ? `${Math.round(nearby.distance * 1000)} m`
                  : `${nearby.distance.toFixed(1)} km`}
                de tu posición
              </p>
              <p class="geo-result__note">
                Es el centro del distrito más cercano, no tu dirección exacta.
              </p>
            </div>
          </div>
          <div class="geo-actions">
            <button type="button" class="btn btn--dark" onclick={useNearby}>
              Usar {nearby.location.distrito}
            </button>
            <button type="button" class="btn btn--ghost" onclick={() => (geoState = 'idle')}>
              Elegir a mano
            </button>
          </div>
        {/if}

        {#if !geoSupported}
          <p class="geo-error">Este navegador no ofrece ubicación. Elige tu distrito abajo.</p>
        {/if}
      </section>

      <section class="current-place" aria-labelledby="current-title">
        <div>
          <p class="eyebrow" id="current-title">Ahora</p>
          <p class="current-name">
            <MapPin size={18} strokeWidth={1.9} aria-hidden="true" />
            {$selectedLocation.distrito}
          </p>
          <p class="current-detail">
            {$selectedLocation.provincia}, {$selectedLocation.departamento} · zona
            {$selectedLocation.zona.replace('_', ' ')}
          </p>
        </div>
        <a href="/" class="current-link">Volver al inicio</a>
      </section>

      {#if $savedPlaces.length}
        <section class="quick-places" aria-labelledby="quick-title">
          <p class="eyebrow" id="quick-title">Guardados</p>
          <div class="quick-list">
            {#each $savedPlaces as place}
              <button
                type="button"
                class="quick-place"
                onclick={() => choose(place)}
                aria-label={`Usar ${place.distrito}`}
              >
                <MapPin size={15} strokeWidth={1.9} aria-hidden="true" />
                {place.distrito}
              </button>
            {/each}
          </div>
        </section>
      {/if}

      <section class="manual" aria-labelledby="manual-title">
        <div class="manual-head">
          <p class="eyebrow">Búsqueda manual</p>
          <h2 id="manual-title" class="section-title">Elige departamento, provincia y distrito</h2>
        </div>

        <div class="search-field">
          <Search size={19} strokeWidth={1.9} aria-hidden="true" />
          <input
            type="search"
            placeholder="Busca un distrito"
            aria-label="Buscar distrito"
            bind:value={query}
            autocomplete="off"
            spellcheck="false"
          />
          {#if query}
            <button type="button" class="clear-search" onclick={() => (query = '')} aria-label="Limpiar búsqueda">
              <X size={17} strokeWidth={2} aria-hidden="true" />
            </button>
          {/if}
        </div>

        <div class="selects">
          <label>
            <span>Departamento</span>
            <span class="select-wrap">
              <select bind:value={departamento} onchange={onDepartmentChange} disabled={loading}>
                <option value="">Todos</option>
                {#each departments as department}
                  <option value={department}>{department}</option>
                {/each}
              </select>
              <ChevronDown size={17} strokeWidth={1.9} aria-hidden="true" />
            </span>
          </label>
          <label>
            <span>Provincia</span>
            <span class="select-wrap">
              <select bind:value={provincia} disabled={loading}>
                <option value="">Todas</option>
                {#each provinces as province}
                  <option value={province}>{province}</option>
                {/each}
              </select>
              <ChevronDown size={17} strokeWidth={1.9} aria-hidden="true" />
            </span>
          </label>
        </div>

        {#if loading}
          <div class="loading-list" aria-busy="true" aria-label="Cargando distritos">
            {#each Array(4) as _}
              <div class="skeleton" style="height: 54px; margin-top: 8px;"></div>
            {/each}
          </div>
        {:else if loadError}
          <div class="load-error" role="status">
            <p>{loadError}</p>
            <button type="button" class="btn btn--ghost" onclick={hydrate}>Reintentar</button>
          </div>
        {:else}
          <div class="results-head">
            <p>
              {#if hasFilters}
                {results.length} {results.length === 1 ? 'distrito' : 'distritos'}
              {:else}
                Elige un departamento o busca tu distrito
              {/if}
            </p>
            {#if hasFilters}
              <button type="button" class="clear-filters" onclick={clearFilters}>Limpiar</button>
            {/if}
          </div>

          {#if results.length}
            <ul class="result-list">
              {#each results as place}
                <li>
                  <button type="button" class="result-row" onclick={() => choose(place)}>
                    <span class="result-main">
                      <span class="result-name">{place.distrito}</span>
                      <span class="result-sub">
                        {place.provincia}, {place.departamento} · ubigeo {place.ubigeo}
                      </span>
                    </span>
                    <span class="result-zone">{place.zona.replace('_', ' ')}</span>
                  </button>
                </li>
              {/each}
            </ul>
            {#if results.length >= 60}
              <p class="results-note">
                Hay más de 60 resultados. Escribe más o elige una provincia para acotar.
              </p>
            {/if}
          {:else if hasFilters}
            <div class="no-results">
              <p>No encontramos ese distrito con los filtros actuales.</p>
              <button type="button" class="btn btn--ghost" onclick={clearFilters}>Limpiar filtros</button>
            </div>
          {/if}
        {/if}
      </section>

      <p class="privacy-note">
        Guardamos el distrito elegido solo en este dispositivo. Lee la
        <a href="/mas/privacidad">política de privacidad</a>.
      </p>
    </main>
  </div>
</div>

<style>
  .location-page {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    padding: 0 var(--pad) calc(34px + var(--safe-bottom));
  }

  .location-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
    padding-top: var(--safe-top);
  }

  .top-logo {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 680;
    letter-spacing: -0.055em;
    text-decoration: none;
    color: var(--ink);
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink);
  }

  .close:hover {
    background: var(--field);
  }

  .location-head {
    padding: 16px 0 22px;
    border-bottom: 1px solid var(--hairline);
  }

  .location-head h1 {
    margin-top: 7px;
    font-size: clamp(2.35rem, 8vw, 3.6rem);
    letter-spacing: -0.055em;
    max-width: 12ch;
  }

  .intro {
    margin-top: 12px;
    max-width: 44ch;
    color: var(--ink-soft);
    font-size: 1.0625rem;
    line-height: 1.48;
  }

  .geo-card {
    margin-top: 20px;
    padding: 17px;
    border: 1px solid var(--hairline);
    border-radius: 16px;
    background: color-mix(in srgb, var(--paper-high) 40%, transparent);
  }

  .geo-head {
    display: flex;
    gap: 12px;
  }

  .geo-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex: none;
    border-radius: 50%;
    background: var(--field);
    color: var(--ink-soft);
  }

  .geo-head h2 {
    font-size: 1.35rem;
    letter-spacing: -0.035em;
  }

  .geo-head p {
    margin-top: 5px;
    color: var(--ink-soft);
    font-size: 0.9375rem;
    line-height: 1.44;
  }

  .geo-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    margin-top: 14px;
    padding: 0 18px;
    border-radius: 999px;
    background: var(--ink);
    color: var(--paper);
    font-weight: 650;
    font-size: 0.9375rem;
  }

  .geo-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .geo-error {
    margin-top: 10px;
    color: var(--danger-ink);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .geo-status {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 14px;
    color: var(--ink-soft);
    font-size: 0.9375rem;
  }

  .spinner {
    width: 17px;
    height: 17px;
    border: 2px solid var(--hairline);
    border-top-color: var(--ink);
    border-radius: 50%;
    animation: spin 700ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .geo-result {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    padding-top: 13px;
    border-top: 1px solid var(--hairline);
  }

  .geo-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex: none;
    border-radius: 50%;
    background: var(--safe);
    color: var(--safe-ink);
  }

  .geo-result__name {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 620;
    letter-spacing: -0.035em;
  }

  .geo-result__detail {
    margin-top: 2px;
    font-size: 0.9375rem;
    color: var(--ink-soft);
  }

  .geo-result__note {
    margin-top: 3px;
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .geo-actions {
    display: flex;
    gap: 8px;
    margin-top: 13px;
    flex-wrap: wrap;
  }

  .geo-actions .btn {
    font-size: 0.9375rem;
    padding: 0 17px;
  }

  .current-place {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--hairline);
  }

  .current-name {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 4px;
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.04em;
  }

  .current-detail {
    color: var(--ink-mute);
    font-size: 0.875rem;
  }

  .current-link {
    flex: none;
    font-size: 0.875rem;
    font-weight: 650;
    color: var(--ink-soft);
    text-decoration: none;
  }

  .quick-places {
    padding-top: 16px;
  }

  .quick-list {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .quick-place {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid var(--hairline);
    border-radius: 999px;
    color: var(--ink-soft);
    font-size: 0.875rem;
    font-weight: 620;
  }

  .quick-place:hover {
    background: var(--field);
  }

  .manual {
    padding-top: 26px;
  }

  .manual-head h2 {
    margin-top: 4px;
    max-width: 24ch;
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 16px;
    min-height: 52px;
    padding: 0 13px;
    border: 1px solid var(--hairline-strong);
    border-radius: 12px;
    background: var(--field);
    color: var(--ink-mute);
  }

  .search-field:focus-within {
    outline: 3px solid var(--focus);
    outline-offset: 1px;
  }

  .search-field input {
    flex: 1;
    min-width: 0;
    height: 50px;
    border: 0;
    background: none;
    outline: none;
    font-size: 1rem;
    color: var(--ink);
  }

  .search-field input::placeholder {
    color: var(--ink-mute);
  }

  .clear-search {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--ink-soft);
  }

  .selects {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-top: 10px;
  }

  .selects label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .selects label > span:first-child {
    font-size: 0.8125rem;
    font-weight: 650;
    color: var(--ink-mute);
  }

  .select-wrap {
    position: relative;
    display: block;
  }

  .select-wrap select {
    width: 100%;
    min-height: 48px;
    padding: 0 34px 0 10px;
    border: 1px solid var(--hairline-strong);
    border-radius: 10px;
    background: var(--paper-high, var(--field));
    appearance: none;
    color: var(--ink);
    font-size: 0.9375rem;
    color-scheme: light dark;
  }

  .select-wrap select:focus {
    outline: 2px solid var(--focus);
    outline-offset: 1px;
  }

  .select-wrap select option {
    background-color: var(--paper, #fcf9f2) !important;
    color: var(--ink, #1f1a17) !important;
    padding: 8px 12px;
  }

  :global([data-phase='night']) .select-wrap select {
    color-scheme: dark;
    background: #2c241f;
    color: #fdf7f0;
    border-color: rgba(255, 235, 215, 0.28);
  }

  :global([data-phase='night']) .select-wrap select option {
    background-color: #201a16 !important;
    color: #fdf7f0 !important;
  }

  :global(html[data-theme='dark']) .select-wrap select {
    background-color: #241d18;
    color: #fdf7f0;
    border-color: rgba(255, 235, 215, 0.28);
  }
  :global(html[data-theme='dark']) .select-wrap select option {
    background-color: #241d18 !important;
    color: #fdf7f0 !important;
  }

  .select-wrap :global(svg) {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--ink-mute);
  }

  .results-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
    padding-bottom: 7px;
    border-bottom: 1px solid var(--hairline);
  }

  .results-head p {
    color: var(--ink-mute);
    font-size: 0.875rem;
  }

  .clear-filters {
    min-height: 34px;
    padding: 0 7px;
    font-size: 0.875rem;
    font-weight: 650;
    color: var(--ink-soft);
  }

  .result-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .result-list li {
    border-bottom: 1px solid var(--hairline-soft);
  }

  .result-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 58px;
    padding: 8px 0;
    text-align: left;
    color: var(--ink);
  }

  .result-row:hover {
    background: color-mix(in srgb, var(--ink) 3%, transparent);
  }

  .result-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .result-name {
    font-weight: 650;
    font-size: 1rem;
  }

  .result-sub {
    color: var(--ink-mute);
    font-size: 0.8125rem;
    line-height: 1.35;
  }

  .result-zone {
    flex: none;
    font-size: 0.75rem;
    color: var(--ink-mute);
    text-transform: capitalize;
    text-align: right;
    max-width: 70px;
  }

  .results-note {
    margin-top: 10px;
    color: var(--ink-mute);
    font-size: 0.875rem;
  }

  .no-results {
    padding: 26px 0;
    border-bottom: 1px solid var(--hairline);
  }

  .no-results p {
    color: var(--ink-soft);
  }

  .no-results .btn {
    margin-top: 12px;
  }

  .load-error {
    padding: 20px 0;
    border-bottom: 1px solid var(--hairline);
  }

  .load-error p {
    color: var(--danger-ink);
    font-size: 0.9375rem;
  }

  .load-error .btn {
    margin-top: 10px;
  }

  .privacy-note {
    margin-top: 24px;
    padding-top: 13px;
    border-top: 1px solid var(--hairline);
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.45;
  }

  @media (min-width: 660px) {
    .geo-card {
      padding: 20px;
    }

    .selects {
      gap: 12px;
    }

    .result-zone {
      max-width: none;
    }
  }
</style>

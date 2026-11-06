<script lang="ts">
  import { goto } from '$app/navigation';
  import { MapPin, Plus, Trash2 } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import {
    removePlace,
    savedPlaces,
    selectedLocation,
    setLocation
  } from '$lib/stores/location';
  import { formatNumber } from '$lib/utils/format';
  import type { Location } from '$lib/types';

  $: current = $selectedLocation;

  function usePlace(place: Location): void {
    setLocation(place, { save: false });
    void goto('/');
  }

  function remove(ubigeo: string, event: MouseEvent): void {
    event.stopPropagation();
    removePlace(ubigeo);
  }
</script>

<svelte:head>
  <title>Mis lugares · Rupaq</title>
  <meta
    name="description"
    content="Guarda hasta tres distritos para revisar el calor de tu casa, tu trabajo y tu familia. Todo queda en tu dispositivo."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page places-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Tus distritos"
      title="Mis lugares"
      intro="Guarda hasta tres distritos: tu casa, el trabajo y donde vive alguien que cuidas. Rupaq no guarda esta lista en ningún servidor."
    />

    <div class="reading-body">
      <section aria-labelledby="saved-title">
        <div class="section-label">
          <h2 id="saved-title">Guardados</h2>
          <span class="count">{$savedPlaces.length} / 3</span>
        </div>

        {#if $savedPlaces.length}
          <ul class="place-list">
            {#each $savedPlaces as place}
              {@const active = place.ubigeo === current.ubigeo}
              <li>
                <div class="place-row" class:place-row--active={active}>
                  <button
                    type="button"
                    class="place-main"
                    onclick={() => usePlace(place)}
                    aria-label={`Usar ${place.distrito}, ${place.provincia}, ${place.departamento}`}
                  >
                    <span class="place-pin" aria-hidden="true"><MapPin size={20} strokeWidth={1.8} /></span>
                    <span class="place-copy">
                      <span class="place-name">
                        {place.distrito}
                        {#if active}<span class="now">Ahora</span>{/if}
                      </span>
                      <span class="place-sub">
                        {place.provincia}, {place.departamento} · {formatNumber(place.altitud)} m ·
                        {place.zona.replace('_', ' ')}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    class="remove"
                    onclick={(event) => remove(place.ubigeo, event)}
                    aria-label={`Quitar ${place.distrito} de mis lugares`}
                  >
                    <Trash2 size={19} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="empty">
            <h2>Todavía no hay lugares</h2>
            <p>
              Cuando elijas un distrito, lo guardamos aquí. Puedes cambiar de lugar en cualquier momento
              desde el nombre del distrito en la parte de arriba.
            </p>
            <a class="btn btn--dark" href="/ubicacion">
              <Plus size={18} strokeWidth={2} aria-hidden="true" />
              Elegir un distrito
            </a>
          </div>
        {/if}

        {#if $savedPlaces.length < 3}
          <a class="add-place" href="/ubicacion">
            <Plus size={19} strokeWidth={2} aria-hidden="true" />
            Agregar otro distrito
          </a>
        {:else}
          <p class="limit-note">
            Llegaste al límite de tres. Quita uno para agregar otro. El límite mantiene la lista corta y
            fácil de leer.
          </p>
        {/if}
      </section>

      {#if current}
        <section aria-labelledby="current-title">
          <h2 id="current-title">Ahora estás viendo</h2>
          <div class="current-card">
            <p class="current-name">{current.distrito}</p>
            <p class="current-detail">
              {current.provincia}, {current.departamento} · {formatNumber(current.altitud)} m de altitud
            </p>
            <p class="current-detail">
              Zona climática: {current.zona.replace('_', ' ')}. Los umbrales de calor se ajustan a esta zona.
            </p>
            <a href="/" class="text-link">Ver el calor de hoy</a>
          </div>
        </section>
      {/if}

      <section aria-labelledby="privacy-title">
        <h2 id="privacy-title">Solo en este dispositivo</h2>
        <p>
          Los lugares se guardan en el almacenamiento local de tu navegador. Si borras los datos del
          sitio, también se borran. No usamos la lista para publicidad ni la enviamos a un servidor.
        </p>
        <p class="disclaimer-box">
          La ubicación que elijas se envía a nuestra API solo para pedir el pronóstico del distrito. No
          guardamos coordenadas exactas ni identificamos personas.
        </p>
      </section>
    </div>
  </div>
</div>

<style>
  .places-page {
    max-width: 820px;
  }

  .section-label h2 {
    margin: 0;
  }

  .count {
    font-size: 0.875rem;
    color: var(--ink-mute);
    font-variant-numeric: tabular-nums;
  }

  .place-list {
    list-style: none;
    margin: 4px 0 0;
    padding: 0;
    border-top: 1px solid var(--hairline);
  }

  .place-list li {
    border-bottom: 1px solid var(--hairline);
  }

  .place-row {
    display: flex;
    align-items: stretch;
    gap: 4px;
  }

  .place-row--active {
    background: color-mix(in srgb, var(--ink) 3%, transparent);
  }

  .place-main {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 12px;
    min-height: 74px;
    padding: 10px 0;
    text-align: left;
    color: var(--ink);
    min-width: 0;
  }

  .place-main:hover .place-name {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .place-pin {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    flex: none;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink-soft);
  }

  .place-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .place-name {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 650;
    font-size: 1.0625rem;
  }

  .now {
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--ink);
    color: var(--paper);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .place-sub {
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.35;
  }

  .remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    flex: none;
    color: var(--ink-mute);
    border-radius: 8px;
  }

  .remove:hover {
    background: var(--field);
    color: var(--danger-ink);
  }

  .add-place {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 50px;
    margin-top: 8px;
    font-weight: 650;
    font-size: 0.9375rem;
    color: var(--ink-soft);
    text-decoration: none;
  }

  .add-place:hover {
    color: var(--ink);
  }

  .limit-note {
    margin-top: 10px;
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.45;
    max-width: 52ch;
  }

  .empty .btn {
    margin-top: 16px;
  }

  .current-card {
    margin-top: 14px;
    padding: 16px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }

  .current-name {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.7rem;
    font-weight: 600;
    letter-spacing: -0.04em;
  }

  .current-detail {
    margin-top: 4px;
    color: var(--ink-soft);
    font-size: 0.9375rem;
    line-height: 1.4;
  }

  .text-link {
    display: inline-flex;
    align-items: center;
    min-height: 42px;
    margin-top: 7px;
    font-weight: 650;
    font-size: 0.9375rem;
    color: var(--ink);
  }
</style>

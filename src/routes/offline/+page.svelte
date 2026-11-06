<script lang="ts">
  import { browser } from '$app/environment';
  import { BookOpen, MapPin, PhoneCall, RefreshCw, WifiOff } from '@lucide/svelte';
  import Logo from '$lib/components/Logo.svelte';
  import { forecast } from '$lib/stores/forecast';
  import { online } from '$lib/stores/clock';
  import { selectedLocation } from '$lib/stores/location';
  import { relativeFreshness } from '$lib/utils/format';

  function retry(): void {
    if (browser) window.location.reload();
  }
</script>

<svelte:head>
  <title>Sin conexión · Rupaq</title>
  <meta name="description" content="Rupaq sin conexión: guías de salud, última predicción guardada y números de emergencia." />
</svelte:head>

<div class="screen offline-screen">
  <div class="offline-page">
    <header class="offline-top">
      <a class="home-logo" href="/" aria-label="Volver al inicio de Rupaq">
        <Logo size={26} />
      </a>
    </header>

    <main class="offline-main">
      <span class="offline-icon" aria-hidden="true">
        {#if $online}<RefreshCw size={28} strokeWidth={1.7} />{:else}<WifiOff size={28} strokeWidth={1.7} />{/if}
      </span>
      <p class="eyebrow">Modo sin conexión</p>
      <h1>{$online ? 'Ya estás en línea' : 'No hay conexión'}</h1>
      <p class="intro">
        {#if $online}
          Puedes volver a Rupaq para actualizar el pronóstico.
        {:else}
          La app sigue funcionando con lo que ya se guardó en este teléfono. Si el pronóstico no se
          actualizó, revisa la hora de la última predicción.
        {/if}
      </p>

      <div class="offline-actions">
        <a class="btn btn--dark" href="/">Ir a Hoy</a>
        <button type="button" class="btn btn--ghost" onclick={retry}>
          <RefreshCw size={17} strokeWidth={1.9} aria-hidden="true" />
          Reintentar
        </button>
      </div>

      {#if $forecast}
        <section class="saved-forecast" aria-labelledby="saved-title">
          <h2 id="saved-title">Última predicción</h2>
          <p class="saved-place">
            <MapPin size={17} strokeWidth={1.8} aria-hidden="true" />
            {$selectedLocation.distrito} · {relativeFreshness($forecast.freshness.updatedAt)}
          </p>
          <p class="saved-temp">{Math.round($forecast.now.feelsC)}°</p>
          <p class="saved-detail">
            Sensación térmica registrada. Puede haber cambiado desde entonces.
          </p>
        </section>
      {:else}
        <p class="no-forecast">
          Todavía no hay una predicción guardada en este dispositivo. Conéctate una vez para que Rupaq
          pueda mostrarla sin internet.
        </p>
      {/if}

      <section class="available" aria-labelledby="available-title">
        <h2 id="available-title">Qué puedes usar ahora</h2>
        <ul>
          <li>
            <a href="/sintomas">
              <BookOpen size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>
                <strong>Guías de síntomas</strong>
                <span>Instrucciones paso a paso, guardadas sin conexión</span>
              </span>
            </a>
          </li>
          <li>
            <a href="/emergencia">
              <PhoneCall size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>
                <strong>Emergencia: 106</strong>
                <span>Qué hacer mientras llega la ayuda</span>
              </span>
            </a>
          </li>
        </ul>
      </section>

      <section class="emergency-note" aria-label="Números de emergencia">
        <p>
          <strong>SAMU 106</strong> · Bomberos 116 · Policía 105
        </p>
        <p>Los teléfonos funcionan sin datos móviles si tienes señal.</p>
      </section>
    </main>
  </div>
</div>

<style>
  .offline-page {
    width: 100%;
    max-width: 680px;
    margin: 0 auto;
    padding: 0 var(--pad) calc(40px + var(--safe-bottom));
  }

  .offline-top {
    display: flex;
    align-items: center;
    min-height: 64px;
    padding-top: var(--safe-top);
  }

  .home-logo {
    text-decoration: none;
    color: var(--ink);
  }

  .offline-main {
    padding-top: 22px;
  }

  .offline-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    margin-bottom: 18px;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink-soft);
  }

  h1 {
    margin-top: 8px;
    font-size: clamp(2.5rem, 9vw, 3.6rem);
    letter-spacing: -0.06em;
    max-width: 13ch;
  }

  .intro {
    margin-top: 13px;
    max-width: 44ch;
    color: var(--ink-soft);
    font-size: 1.0625rem;
    line-height: 1.5;
  }

  .offline-actions {
    display: flex;
    gap: 9px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .saved-forecast {
    margin-top: 30px;
    padding: 18px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }

  .saved-forecast h2 {
    font-size: 1.3rem;
    letter-spacing: -0.035em;
  }

  .saved-place {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 7px;
    color: var(--ink-soft);
    font-size: 0.9375rem;
  }

  .saved-temp {
    margin-top: 7px;
    font-family: var(--font-display);
    font-size: 4.6rem;
    font-weight: 640;
    line-height: 0.8;
    letter-spacing: -0.08em;
    color: var(--ink);
  }

  .saved-detail {
    margin-top: 8px;
    color: var(--ink-mute);
    font-size: 0.875rem;
  }

  .no-forecast {
    margin-top: 24px;
    padding: 16px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.45;
  }

  .available {
    padding-top: 26px;
  }

  .available h2 {
    font-size: 1.35rem;
    letter-spacing: -0.035em;
  }

  .available ul {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    border-top: 1px solid var(--hairline);
  }

  .available li {
    border-bottom: 1px solid var(--hairline);
  }

  .available a {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 65px;
    text-decoration: none;
    color: var(--ink);
  }

  .available a > span {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .available strong {
    font-size: 1rem;
    font-weight: 650;
  }

  .available span span {
    color: var(--ink-mute);
    font-size: 0.875rem;
  }

  .available :global(svg) {
    color: var(--ink-soft);
    flex: none;
  }

  .emergency-note {
    margin-top: 24px;
    padding-top: 13px;
    border-top: 1px solid var(--hairline);
    color: var(--ink-soft);
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .emergency-note p + p {
    margin-top: 3px;
    color: var(--ink-mute);
    font-size: 0.875rem;
  }
</style>

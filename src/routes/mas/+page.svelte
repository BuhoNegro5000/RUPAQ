<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import {
    Bell,
    BookOpen,
    Bug,
    ChevronRight,
    Download,
    Droplets,
    Info,
    ListChecks,
    Lock,
    MapPin,
    MoonStar,
    PhoneCall,
    Share,
    SlidersHorizontal,
    Smartphone,
    Sun,
    UserRound
  } from '@lucide/svelte';
  import LocationHeader from '$lib/components/LocationHeader.svelte';
  import { savedPlaces, selectedLocation } from '$lib/stores/location';
  import { FONT_STEPS, PROFILE_OPTIONS, settings } from '$lib/stores/settings';

  type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };

  let installPrompt: InstallPromptEvent | null = null;
  let standalone = false;
  let isApple = false;
  let installMessage = '';

  $: profileLabels = $settings.profile
    .map((key) => PROFILE_OPTIONS.find((option) => option.key === key)?.label ?? key)
    .join(' · ');
  $: fontLabel = FONT_STEPS.find((step) => step.value === $settings.fontScale)?.label ?? 'Normal';
  $: profileSummary = profileLabels || 'Sin perfil';
  $: placeSummary = $savedPlaces.length
    ? `${$savedPlaces.length} de 3 guardados`
    : 'Solo este dispositivo';

  onMount(() => {
    standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    isApple = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      installPrompt = event as InstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  });

  async function install(): Promise<void> {
    if (!installPrompt) return;
    installMessage = '';
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    installMessage =
      result.outcome === 'accepted'
        ? 'Rupaq se está instalando en tu pantalla de inicio.'
        : 'Puedes instalarla cuando quieras desde el menú del navegador.';
    installPrompt = null;
  }
</script>

<svelte:head>
  <title>Más · Rupaq</title>
  <meta
    name="description"
    content="Planes de acción, perfil de riesgo, lugares guardados, accesibilidad y todo lo que necesitas saber sobre Rupaq."
  />
</svelte:head>

<div class="screen more-screen">
  <div class="page more-page">
    <LocationHeader />

    <header class="more-head">
      <p class="eyebrow">Tu app</p>
      <h1 class="page-title">Más</h1>
      <p class="page-intro">
        Entiende el calor, prepara tu casa y ajusta Rupaq a tu vida. Sin cuentas y sin guardar tus
        datos en un servidor.
      </p>
    </header>

    <section class="status-strip" aria-labelledby="status-title">
      <h2 id="status-title" class="sr-only">Resumen de tu configuración</h2>
      <dl>
        <div>
          <dt>Distrito</dt>
          <dd>{$selectedLocation.distrito}</dd>
        </div>
        <div>
          <dt>Perfil</dt>
          <dd>{profileSummary}</dd>
        </div>
        <div>
          <dt>Letra</dt>
          <dd>{fontLabel}</dd>
        </div>
        <div>
          <dt>Lugares</dt>
          <dd>{placeSummary}</dd>
        </div>
      </dl>
    </section>

    <div class="more-grid">
      <section class="more-group" aria-labelledby="understand-title">
        <p class="eyebrow group-label" id="understand-title">Entender el calor</p>
        <ul class="more-list">
          <li>
            <a class="more-row" href="/mas/ola-de-calor">
              <span class="row-icon" aria-hidden="true"><MoonStar size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Ola de calor y noches</span>
                <span class="row-sub">Por qué el calor que no baja también enferma</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/radiacion-uv">
              <span class="row-icon" aria-hidden="true"><Sun size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Radiación UV y tu piel</span>
                <span class="row-sub">Índice UV, riesgos para piel y ojos, y cómo protegerte</span>
              </span>
              <span class="row-badge">OMS</span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/dengue-y-clima">
              <span class="row-icon" aria-hidden="true"><Bug size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Dengue y enfermedades del clima</span>
                <span class="row-sub">Calor, agua almacenada y vector Aedes (datos MINSA/CDC)</span>
              </span>
              <span class="row-badge">CDC Perú</span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/fuentes">
              <span class="row-icon" aria-hidden="true"><BookOpen size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Fuentes y método</span>
                <span class="row-sub">Datos, umbrales y límites del pronóstico</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
        </ul>
      </section>

      <section class="more-group" aria-labelledby="prepare-title">
        <p class="eyebrow group-label" id="prepare-title">Prepararte</p>
        <ul class="more-list">
          <li>
            <a class="more-row" href="/mas/hidratacion">
              <span class="row-icon" aria-hidden="true"><Droplets size={21} strokeWidth={1.8} /></span>
              <span class="row-copy">
                <span class="row-title">Puntos de hidratación</span>
                <span class="row-sub">Bebederos públicos, caños seguros y recarga en Lima</span>
              </span>
              <span class="row-badge">Guía</span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/plan">
              <span class="row-icon" aria-hidden="true"><ListChecks size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Plan de acción</span>
                <span class="row-sub">Checklists para casa, colegio y trabajo</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/lugares">
              <span class="row-icon" aria-hidden="true"><MapPin size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Mis lugares</span>
                <span class="row-sub">Hasta 3 distritos guardados en este dispositivo</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/alertas">
              <span class="row-icon" aria-hidden="true"><Bell size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Alertas de calor</span>
                <span class="row-sub">Cómo funcionarán los avisos, sin promesas falsas</span>
              </span>
              <span class="row-badge">Fase 2</span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/perfil">
              <span class="row-icon" aria-hidden="true"><UserRound size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Perfil de riesgo</span>
                <span class="row-sub">Ajusta los umbrales a quién cuidas</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/accesibilidad">
              <span class="row-icon" aria-hidden="true"><SlidersHorizontal size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Accesibilidad</span>
                <span class="row-sub">Letra, contraste, modo simple y lectura en voz alta</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
        </ul>
      </section>

      <section class="more-group" aria-labelledby="app-title">
        <p class="eyebrow group-label" id="app-title">La app</p>
        <ul class="more-list">
          <li>
            <a class="more-row" href="/mas/acerca">
              <span class="row-icon" aria-hidden="true"><Info size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Acerca de Rupaq</span>
                <span class="row-sub">Quiénes la hacemos y para qué</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row" href="/mas/privacidad">
              <span class="row-icon" aria-hidden="true"><Lock size={21} strokeWidth={1.7} /></span>
              <span class="row-copy">
                <span class="row-title">Privacidad</span>
                <span class="row-sub">Qué se guarda, qué no y cómo borrarlo</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
          <li>
            <a class="more-row more-row--emergency" href="/emergencia">
              <span class="row-icon row-icon--emergency" aria-hidden="true">
                <PhoneCall size={21} strokeWidth={1.8} />
              </span>
              <span class="row-copy">
                <span class="row-title">Emergencia: 106</span>
                <span class="row-sub">Golpe de calor, desmayo o confusión</span>
              </span>
              <span class="row-chev" aria-hidden="true"><ChevronRight size={19} strokeWidth={1.8} /></span>
            </a>
          </li>
        </ul>
      </section>

      <section class="install" aria-labelledby="install-title">
        <div class="install-icon" aria-hidden="true"><Smartphone size={24} strokeWidth={1.7} /></div>
        <div class="install-copy">
          <h2 id="install-title">{standalone ? 'Rupaq ya está instalada' : 'Lleva Rupaq contigo'}</h2>
          {#if standalone}
            <p>La estás usando como app. Las guías y la última predicción siguen disponibles sin conexión.</p>
          {:else if isApple}
            <p>
              En iPhone o iPad: toca <Share size={15} strokeWidth={1.9} aria-hidden="true" /> Compartir y
              elige <strong>Agregar a inicio</strong>.
            </p>
          {:else}
            <p>Instálala para abrirla en un toque. Funciona sin conexión y no ocupa casi espacio.</p>
            {#if installPrompt}
              <button type="button" class="install-button" onclick={install}>
                <Download size={18} strokeWidth={1.9} aria-hidden="true" />
                Instalar Rupaq
              </button>
            {:else}
              <p class="install-hint">
                Abre el menú del navegador y elige <strong>Instalar app</strong> o
                <strong>Agregar a la pantalla de inicio</strong>.
              </p>
            {/if}
          {/if}
          {#if installMessage}
            <p class="install-message" role="status">{installMessage}</p>
          {/if}
        </div>
      </section>
    </div>

    <footer class="more-foot">
      <p>Rupaq · Hecha en Perú por Green Owl Labs</p>
      <p>Versión 1.0 · Contenido de salud en revisión profesional</p>
    </footer>
  </div>
</div>

<style>
  .more-page {
    max-width: 1080px;
    padding-bottom: 100px;
  }

  .more-head {
    padding: 18px 0 22px;
    border-bottom: 1px solid var(--hairline);
  }

  .more-head .page-intro {
    max-width: 46ch;
  }

  .status-strip {
    border-bottom: 1px solid var(--hairline);
    padding: 12px 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .status-strip::-webkit-scrollbar {
    display: none;
  }

  .status-strip dl {
    display: flex;
    gap: 0;
    margin: 0;
    min-width: max-content;
  }

  .status-strip dl div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 18px;
    border-left: 1px solid var(--hairline-soft);
  }

  .status-strip dl div:first-child {
    padding-left: 0;
    border-left: 0;
  }

  .status-strip dt {
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .status-strip dd {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 620;
    max-width: 30ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .more-grid {
    padding-top: 8px;
  }

  .more-group {
    padding-top: 20px;
  }

  .group-label {
    color: var(--ink-soft);
    margin-bottom: 3px;
  }

  .more-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .more-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 68px;
    padding: 10px 0;
    border-bottom: 1px solid var(--hairline);
    text-decoration: none;
    color: var(--ink);
  }

  .more-row:hover .row-title {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .row-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex: none;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink-soft);
  }

  .row-icon--emergency {
    color: var(--danger-ink);
    border-color: color-mix(in srgb, var(--danger) 45%, transparent);
  }

  .row-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .row-title {
    font-weight: 650;
    font-size: 1rem;
    line-height: 1.28;
  }

  .row-sub {
    font-size: 0.875rem;
    color: var(--ink-mute);
    line-height: 1.35;
  }

  .row-badge {
    flex: none;
    align-self: flex-start;
    margin-top: 5px;
    padding: 1px 6px;
    border: 1px solid var(--hairline-strong);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 720;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  .row-chev {
    flex: none;
    color: var(--ink-mute);
  }

  .install {
    display: flex;
    gap: 14px;
    margin-top: 26px;
    padding: 18px;
    border: 1px solid var(--hairline);
    border-radius: 14px;
  }

  .install-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    flex: none;
    border-radius: 50%;
    background: var(--field);
    color: var(--ink-soft);
  }

  .install-copy {
    min-width: 0;
  }

  .install h2 {
    font-size: 1.3rem;
    letter-spacing: -0.035em;
  }

  .install p {
    margin-top: 6px;
    color: var(--ink-soft);
    font-size: 0.9375rem;
    line-height: 1.45;
  }

  .install p :global(svg) {
    display: inline;
    vertical-align: -2px;
  }

  .install-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 46px;
    margin-top: 10px;
    padding: 0 16px;
    border-radius: 999px;
    background: var(--ink);
    color: var(--paper);
    font-weight: 650;
    font-size: 0.9375rem;
  }

  .install-hint {
    color: var(--ink-mute) !important;
    font-size: 0.875rem !important;
  }

  .install-message {
    color: var(--safe-ink) !important;
    font-weight: 600;
  }

  .more-foot {
    margin-top: 30px;
    padding-top: 14px;
    border-top: 1px solid var(--hairline);
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .more-foot p + p {
    margin-top: 2px;
  }

  @media (min-width: 820px) {
    .more-page {
      padding-bottom: 48px;
    }

    .more-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      column-gap: 54px;
      align-items: start;
    }

    .more-group {
      padding-top: 26px;
    }

    .more-group:nth-of-type(3) {
      grid-column: 1;
    }

    .install {
      grid-column: 2;
      grid-row: 3;
      margin-top: 26px;
    }

    .more-foot {
      grid-column: 1 / -1;
    }
  }
</style>

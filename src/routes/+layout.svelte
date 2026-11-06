<script lang="ts">
  import { browser, dev } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import RailNav from '$lib/components/RailNav.svelte';
  import EmergencyFab from '$lib/components/EmergencyFab.svelte';
  import FontSizeSheet from '$lib/components/FontSizeSheet.svelte';
  import SplashScreen from '$lib/components/SplashScreen.svelte';
  import WelcomeModal from '$lib/components/WelcomeModal.svelte';
  import { clock, online } from '$lib/stores/clock';
  import { forecast, loadForecast, refreshIfStale } from '$lib/stores/forecast';
  import { loadStoredLocation, locationHydrated, selectedLocation } from '$lib/stores/location';
  import { loadSettings, settings } from '$lib/stores/settings';
  import { phaseFromHour } from '$lib/utils/risk';
  import { peruParts } from '$lib/utils/format';

  $: pathname = $page.url.pathname;
  $: isEmergency = pathname === '/emergencia';
  $: isGuide = pathname.startsWith('/sintomas/') && pathname !== '/sintomas';
  $: isLocationPicker = pathname === '/ubicacion';
  $: immersive = isEmergency || isGuide || isLocationPicker;
  $: showNav = !immersive;
  $: showFab = !immersive && !isEmergency;
  $: riskKey = $forecast?.now.riskKey ?? 'safe';
  $: phase = phaseFromHour(peruParts($clock).hour);
  $: documentTitle = titleFor(pathname);

  function titleFor(path: string): string {
    if (path === '/') return 'RUPAQ · Hoy';
    if (path === '/dias') return 'RUPAQ · Días';
    if (path.startsWith('/dias/')) return 'RUPAQ · Día';
    if (path === '/sintomas') return 'RUPAQ · Síntomas';
    if (path.startsWith('/sintomas/')) return 'RUPAQ · Guía de salud';
    if (path === '/emergencia') return 'RUPAQ · Emergencia (106 / 116)';
    if (path === '/ubicacion') return 'RUPAQ · Elegir distrito';
    if (path === '/offline') return 'RUPAQ · Sin conexión';
    if (path === '/mas') return 'RUPAQ · Más';
    const moreTitles: Record<string, string> = {
      '/mas/ola-de-calor': 'RUPAQ · Ola de calor',
      '/mas/plan': 'RUPAQ · Plan de acción',
      '/mas/perfil': 'RUPAQ · Perfil de riesgo',
      '/mas/accesibilidad': 'RUPAQ · Accesibilidad',
      '/mas/lugares': 'RUPAQ · Mis lugares',
      '/mas/alertas': 'RUPAQ · Alertas de calor',
      '/mas/acerca': 'RUPAQ · Acerca de',
      '/mas/fuentes': 'RUPAQ · Fuentes y método',
      '/mas/privacidad': 'RUPAQ · Privacidad',
      '/mas/hidratacion': 'RUPAQ · Puntos de hidratación',
      '/mas/dengue-y-clima': 'RUPAQ · Dengue y enfermedades del clima'
    };
    return moreTitles[path] ?? 'RUPAQ';
  }


  // Los navegadores rechazan un service worker servido tras una redirección,
  // así que se comprueba antes de registrarlo. La app funciona sin él.
  async function registerServiceWorker() {
    try {
      const response = await fetch('/service-worker.js', { redirect: 'manual', cache: 'no-store' });
      if (response.type === 'opaqueredirect' || !response.ok) return;
      await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
    } catch {
      // Se reintentará en la próxima visita.
    }
  }

  onMount(() => {
    loadSettings();
    loadStoredLocation();
    const unsubscribe = selectedLocation.subscribe((location) => {
      if (get(locationHydrated)) void loadForecast(location);
    });
    const unsubscribeForecast = forecast.subscribe(() => {});
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshIfStale(get(selectedLocation));
    };
    document.addEventListener('visibilitychange', onVisible);
    const onOnline = () => refreshIfStale(get(selectedLocation));

    window.addEventListener('online', onOnline);

    const isV0Preview = window.location.hostname.endsWith('.v0.build');
    if (!dev && !isV0Preview && 'serviceWorker' in navigator) {
      void registerServiceWorker();
    }

    return () => {
      unsubscribe();
      unsubscribeForecast();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
  });

  afterNavigate(() => {
    if (browser) {
      document.querySelector('.screen')?.scrollTo?.({ top: 0 });
    }
  });


  $: if (browser && documentTitle && document.title !== documentTitle) {
    document.title = documentTitle;
  }
</script>

<svelte:head>
  <title>{documentTitle}</title>
</svelte:head>

<a class="skip-link" href="#contenido">Saltar al contenido</a>

<div class="app-shell" data-risk={riskKey} data-phase={phase}>
  {#if showNav}
    <RailNav />
  {/if}

  <main id="contenido" class="app-main" class:app-main--immersive={immersive} class:app-main--fab={showFab}>
    <slot />
  </main>

  {#if showFab}
    <EmergencyFab />
  {/if}

  {#if showNav}
    <BottomNav />
  {/if}

  <FontSizeSheet />
  {#if pathname === '/'}
    <SplashScreen />
    <WelcomeModal />
  {/if}

  {#if !$online}
    <p class="offline-chip" role="status">
      Sin conexión. Las guías y tu última predicción siguen disponibles.
    </p>
  {/if}
</div>

<style>
  .app-main--immersive {
    padding-bottom: 0 !important;
  }

  .offline-chip {
    position: fixed;
    z-index: 40;
    top: calc(10px + var(--safe-top));
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink);
    color: var(--paper);
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: var(--shadow-pill);
    max-width: calc(100vw - 32px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (min-width: 768px) {
    .app-main--immersive {
      padding-left: 0 !important;
    }
  }

  :global(::view-transition-old(root)) {
    animation: vt-out 120ms ease both;
  }
  :global(::view-transition-new(root)) {
    animation: vt-in 220ms var(--ease-out) both;
  }
  @keyframes vt-out {
    to {
      opacity: 0.75;
    }
  }
  @keyframes vt-in {
    from {
      opacity: 0.75;
      transform: translateY(4px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(::view-transition-old(root)),
    :global(::view-transition-new(root)) {
      animation: none;
    }
  }
</style>

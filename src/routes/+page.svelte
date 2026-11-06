<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { AlertTriangle, ChevronRight, Droplets, MapPin } from '@lucide/svelte';
  import DayArc from '$lib/components/DayArc.svelte';
  import ErrorState from '$lib/components/ErrorState.svelte';
  import Freshness from '$lib/components/Freshness.svelte';
  import LocationHeader from '$lib/components/LocationHeader.svelte';
  import RiskMeter from '$lib/components/RiskMeter.svelte';
  import SecondaryMetrics from '$lib/components/SecondaryMetrics.svelte';
  import SetupStrip from '$lib/components/SetupStrip.svelte';
  import SkeletonHoy from '$lib/components/SkeletonHoy.svelte';
  import WeekMini from '$lib/components/WeekMini.svelte';
  import { clock } from '$lib/stores/clock';
  import {
    forecast,
    forecastError,
    forecastLoading,
    loadForecast,
    forecastOffline
  } from '$lib/stores/forecast';
  import { selectedLocation } from '$lib/stores/location';
  import { PROFILE_OPTIONS, settings, settingsHydrated } from '$lib/stores/settings';
  import { getActionPhrase, pickProfile } from '$lib/utils/action';
  import { peruParts, timeWithMinutes } from '$lib/utils/format';
  import {
    RISK_META,
    adjustedThresholds,
    keyFromLevel,
    levelFromFeels,
    shortHour
  } from '$lib/utils/risk';

  $: nowParts = peruParts($clock);
  $: data = $forecast;
  $: profiles = $settings.profile;
  $: thresholds = data ? adjustedThresholds(data.location.zona, profiles) : null;
  $: nowLevel =
    data && thresholds ? levelFromFeels(data.now.feelsC, thresholds) : (data?.now.risk ?? 0);
  $: riskMeta = RISK_META[keyFromLevel(nowLevel)];

  $: isNight = nowParts.hour >= 20 || nowParts.hour < 6;

  // Hourly curve: 24h nocturnal window at night, 6h-20h during the day
  $: arcHours = (() => {
    if (!data?.hourly?.length) return [];
    let windowPoints: typeof data.hourly = [];

    if (isNight) {
      // Find current hour index in data.hourly
      const nowIdx = data.hourly.findIndex((p) => {
        const d = new Date(p.time);
        const parts = peruParts(d);
        return parts.hour === nowParts.hour && parts.day === nowParts.day;
      });
      if (nowIdx >= 0) {
        // Start from 18:00 before now (or up to 6h before now)
        let startIdx = nowIdx;
        while (startIdx > 0 && data.hourly[startIdx].hour !== 18 && (nowIdx - startIdx) < 8) {
          startIdx--;
        }
        windowPoints = data.hourly.slice(startIdx, startIdx + 25);
      }
    } else {
      // Daytime: 6:00 to 20:00 of today
      windowPoints = data.hourly.filter((point) => {
        const isToday = point.time.startsWith(data.now.time.slice(0, 10));
        return isToday && point.hour >= 6 && point.hour <= 20;
      });
    }

    if (!windowPoints.length) {
      windowPoints = data.hourly.slice(0, 24);
    }

    return windowPoints.map((point) => ({
      ...point,
      risk: thresholds ? levelFromFeels(point.feelsC, thresholds) : point.risk,
      riskKey: keyFromLevel(thresholds ? levelFromFeels(point.feelsC, thresholds) : point.risk)
    }));
  })();

  $: action = data ? getActionPhrase(data, profiles, nowParts.hour) : null;
  $: profile = pickProfile(profiles);
  $: profileLabel = profile
    ? PROFILE_OPTIONS.find((option) => option.key === profile)?.label
    : null;
  $: setupPending = $settingsHydrated && !$settings.onboarded && !$settings.dismissedSetup;
  $: currentTime = timeWithMinutes(nowParts.hour, nowParts.minute);
  $: peakUpcoming =
    data && action && nowLevel < data.risk.peakLevel && nowParts.hour >= 6 && nowParts.hour < 18;
  $: retry = () => loadForecast($selectedLocation, { force: true });

  onMount(() => {
    if (browser) {
      if (!$forecast) void loadForecast($selectedLocation);
    }
  });
</script>

<svelte:head>
  <title>RUPAQ · Hoy en {$selectedLocation.distrito}</title>
  <meta
    name="description"
    content={`Hoy en ${$selectedLocation.distrito}: ${data ? `${Math.round(data.now.feelsC)}°C de sensación térmica y riesgo ${riskMeta.label}.` : 'consulta el calor y qué hacer.'} Pronóstico en tiempo real y recomendaciones de salud.`}
  />
  <meta property="og:title" content={`RUPAQ · Hoy en ${$selectedLocation.distrito}`} />
  <meta
    property="og:description"
    content={`Sensación térmica actual en ${$selectedLocation.distrito}: ${data ? `${Math.round(data.now.feelsC)}°C (${riskMeta.label})` : 'en tiempo real'}. Pronóstico de calor y salud en Perú.`}
  />
  <meta name="twitter:title" content={`RUPAQ · Hoy en ${$selectedLocation.distrito}`} />
  <meta
    name="twitter:description"
    content={`Sensación térmica actual en ${$selectedLocation.distrito}: ${data ? `${Math.round(data.now.feelsC)}°C (${riskMeta.label})` : 'en tiempo real'}.`}
  />
</svelte:head>

<div class="screen hoy-screen">
  <div class="hoy-layout page">
    <section class="hoy-primary" aria-labelledby="hoy-title">
      <LocationHeader />

      {#if setupPending}
        <SetupStrip />
      {/if}

      {#if data && data.alerts.length}
        <a class="senamhi-alert" href={data.alerts[0].url ?? '/mas/alertas'}>
          <AlertTriangle size={19} strokeWidth={1.8} aria-hidden="true" />
          <span>
            <strong>Aviso SENAMHI: {data.alerts[0].titulo}</strong>
            <span>{data.alerts[0].resumen}</span>
          </span>
          <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
        </a>
      {/if}

      {#if $forecastLoading && !data}
        <SkeletonHoy />
      {:else if !data}
        <ErrorState
          message={$forecastError ?? 'No pudimos cargar el pronóstico de tu distrito.'}
          onretry={retry}
        />
      {:else}
        <div class="hero enter">
          <p class="eyebrow" id="hoy-title">
            Hoy <span aria-hidden="true">·</span> {currentTime}
            <span aria-hidden="true">·</span> sensación térmica
          </p>

          <p class="temperature" aria-label={`${Math.round(data.now.feelsC)} grados de sensación térmica`}>
            <span aria-hidden="true">{Math.round(data.now.feelsC)}<span class="degree">°</span></span>
          </p>

          <div class="risk-line enter-2">
            <RiskMeter
              level={nowLevel}
              label={riskMeta.label}
              realTemp={data.now.tempC}
              feelsTemp={data.now.feelsC}
              humidity={data.now.humidity}
            />
          </div>

          <div class="action-wrap enter-3">
            <p class="action-sentence" data-level={action?.level ?? 'attention'}>
              {action?.phrase ?? RISK_META.attention.description}
            </p>
            <div class="action-footer">
              {#if profileLabel}
                <a class="profile-note" href="/mas/perfil">
                  Ajustado a tu perfil: {profileLabel}
                  <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
                </a>
              {:else}
                <a class="profile-note" href="/mas/perfil">
                  Personaliza este consejo
                  <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
                </a>
              {/if}
              <a class="hydration-pill" href="/mas/hidratacion">
                <Droplets size={14} strokeWidth={2.2} aria-hidden="true" />
                <span>Puntos de agua</span>
              </a>
            </div>
          </div>
        </div>

        {#if $forecastError}
          <p class="stale-note" role="status">{$forecastError}</p>
        {/if}

        <!-- DayArc is the visual centerpiece on the left column in desktop and on mobile -->
        <section class="arc-block enter-4" aria-label="Detalle del día">
          <div class="arc-kicker">
            <span>{isNight ? 'El calor en 24 horas' : 'El día, hora por hora'}</span>
            {#if peakUpcoming && action}
              <span class="arc-kicker__peak">Sube a {RISK_META[action.level].label} a las {shortHour(data.risk.peakHour)}</span>
            {/if}
          </div>
          <DayArc
            idPrefix="hoy-day-arc"
            hours={arcHours}
            currentHour={nowParts.hour}
            currentMinute={nowParts.minute}
            peakHour={data.risk.peakHour}
            peakFeels={data.risk.peakFeels}
            riskLevel={nowLevel}
            night={isNight}
          />
        </section>

        <!-- Secondary metrics: displayed on mobile here, on desktop in right column -->
        <div class="secondary-block mobile-only enter-4">
          <SecondaryMetrics uv={data.now.uv} air={data.now.air} />
          <Freshness
            updatedAt={data.freshness.updatedAt}
            stale={data.freshness.stale || $forecastOffline}
          />
        </div>
      {/if}
    </section>

    <!-- Desktop right column -->
    <aside class="hoy-secondary" aria-label="Detalle del día y la semana">
      {#if data}
        <div class="aside-head">
          <p class="eyebrow">El día</p>
          <p class="aside-place">
            <MapPin size={16} strokeWidth={2} aria-hidden="true" />
            <span>{$selectedLocation.distrito} · {$selectedLocation.zona.replace('_', ' ')}</span>
          </p>
        </div>

        <div class="aside-metrics">
          <SecondaryMetrics uv={data.now.uv} air={data.now.air} />
          <Freshness
            updatedAt={data.freshness.updatedAt}
            stale={data.freshness.stale || $forecastOffline}
          />
        </div>

        <div class="aside-week">
          <WeekMini days={data.daily} todayKey={data.now.time.slice(0, 10)} />
        </div>
      {:else}
        <div class="aside-placeholder" aria-hidden="true"></div>
      {/if}
    </aside>
  </div>
</div>

<style>
  .hoy-screen {
    min-height: 0;
  }

  .hoy-layout {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding-top: calc(20px + var(--safe-top));
    padding-bottom: 12px;
  }

  .hoy-primary {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .hero {
    padding-top: 4px;
  }

  .eyebrow {
    color: var(--ink-soft);
  }
  .eyebrow span {
    color: var(--ink-mute);
  }

  .temperature {
    font-family: var(--font-display);
    font-size: clamp(6.2rem, 26vw, 9.2rem);
    font-weight: 640;
    line-height: 0.78;
    letter-spacing: -0.095em;
    margin: 10px 0 10px -0.055em;
    font-variant-numeric: tabular-nums;
    color: var(--ink);
    font-feature-settings: 'tnum' 1;
    white-space: nowrap;
  }

  .degree {
    display: inline-block;
    font-size: 0.39em;
    line-height: 1;
    vertical-align: top;
    transform: translateY(0.16em);
    margin-left: 0.015em;
    letter-spacing: -0.04em;
    font-weight: 520;
  }

  .risk-line {
    margin: 4px 0 0;
  }

  .action-wrap {
    padding: 16px 0 16px;
    border-bottom: 1px solid var(--hairline);
    margin-top: 6px;
  }

  .action-sentence {
    font-family: var(--font-display);
    font-size: clamp(1.95rem, 4.3vw, 2.5rem);
    font-weight: 560;
    line-height: 1.08;
    letter-spacing: -0.045em;
    color: var(--ink);
    text-wrap: balance;
    max-width: 24ch;
  }

  .action-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .profile-note {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 36px;
    font-size: 0.9375rem; /* 15px */
    font-weight: 600;
    color: var(--ink-soft);
    text-decoration: none;
    transition: color 150ms ease;
  }
  .profile-note:hover {
    color: var(--ink);
  }

  .hydration-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--safe-ink);
    background: color-mix(in srgb, var(--safe) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--safe) 44%, transparent);
    text-decoration: none;
    transition: transform 140ms ease, opacity 140ms ease;
  }
  .hydration-pill:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  .stale-note {
    margin-top: 10px;
    font-size: 0.875rem;
    color: var(--danger-ink);
  }

  .arc-block {
    padding-top: 14px;
    min-width: 0;
    width: 100%;
  }

  .arc-kicker {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.875rem; /* 14px */
    font-weight: 620;
    color: var(--ink-soft);
    margin-bottom: 4px;
  }
  .arc-kicker__peak {
    font-weight: 700;
    color: var(--risk-ink);
    text-align: right;
  }

  .secondary-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 12px;
    margin-top: 6px;
    border-top: 1px solid var(--hairline);
  }

  .hoy-secondary {
    display: none;
  }

  .senamhi-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-top: 1px solid var(--hairline-soft);
    border-bottom: 1px solid var(--hairline-soft);
    text-decoration: none;
    color: var(--ink);
    font-size: 0.9375rem;
    line-height: 1.35;
  }
  .senamhi-alert span {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 1px;
  }
  .senamhi-alert strong {
    font-weight: 700;
  }
  .senamhi-alert span span {
    color: var(--ink-soft);
  }

  .aside-placeholder {
    display: none;
  }

  /* Desktop layout (>= 768px) */
  @media (min-width: 768px) {
    .hoy-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      column-gap: 44px;
      padding-top: 26px;
      padding-bottom: 24px;
      min-height: 100%;
      align-items: start;
    }

    .hoy-primary {
      padding-right: 12px;
      min-height: 0;
      gap: 12px;
    }

    .hero {
      padding-top: 0;
    }

    .temperature {
      font-size: clamp(7.2rem, 14.5vw, 9.6rem);
      margin-top: 10px;
    }

    .action-wrap {
      padding: 14px 0 16px;
      border-bottom: 1px solid var(--hairline);
    }

    .action-sentence {
      font-size: clamp(1.9rem, 3.1vw, 2.45rem);
      max-width: 22ch;
    }

    .arc-block {
      display: block;
      min-height: 235px;
      padding-top: 14px;
    }

    .mobile-only {
      display: none !important;
    }

    .hoy-secondary {
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-width: 0;
      min-height: 0;
      padding-left: 44px;
      border-left: 1px solid var(--hairline);
    }

    .aside-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      min-height: 56px; /* Aligns with LocationHeader (min-height: 56px) */
      margin-bottom: 2px;
    }

    .aside-place {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--ink-soft);
      text-transform: capitalize;
    }

    .aside-metrics {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--hairline);
    }

    .aside-week {
      padding-top: 2px;
      flex: 1;
    }

    .aside-placeholder {
      display: block;
      height: 1px;
    }
  }

  @media (min-width: 768px) and (max-width: 1050px) {
    .hoy-layout {
      column-gap: 28px;
    }
    .hoy-secondary {
      padding-left: 28px;
      gap: 14px;
    }
    .action-sentence {
      font-size: clamp(1.65rem, 2.7vw, 2.05rem);
    }
    .temperature {
      font-size: clamp(6.6rem, 13vw, 8.2rem);
    }
  }

  @media (min-width: 1300px) {
    .hoy-layout {
      column-gap: 72px;
    }
    .hoy-secondary {
      padding-left: 56px;
    }
  }

  @media (max-height: 740px) and (max-width: 767px) {
    .temperature {
      font-size: clamp(5.8rem, 25vw, 7.2rem);
    }
    .action-sentence {
      font-size: clamp(1.75rem, 4.1vw, 2.15rem);
    }
    .arc-block {
      padding-top: 6px;
    }
  }
</style>
<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { ChevronRight, MoonStar, Sunrise } from '@lucide/svelte';
  import ErrorState from '$lib/components/ErrorState.svelte';
  import Freshness from '$lib/components/Freshness.svelte';
  import LocationHeader from '$lib/components/LocationHeader.svelte';
  import { forecast, forecastError, forecastLoading, loadForecast } from '$lib/stores/forecast';
  import { selectedLocation } from '$lib/stores/location';
  import { settings } from '$lib/stores/settings';
  import { getDayPhrase } from '$lib/utils/action';
  import { dayLabel, formatNumber, monthShort, shortDate } from '$lib/utils/format';
  import {
    RISK_META,
    adjustedThresholds,
    keyFromLevel,
    levelFromFeels
  } from '$lib/utils/risk';

  $: data = $forecast;
  $: thresholds = data ? adjustedThresholds(data.location.zona, $settings.profile) : null;
  $: days =
    data?.daily.map((day) => {
      const level = thresholds ? levelFromFeels(day.feelsMax, thresholds) : day.risk;
      return { ...day, risk: level, riskKey: keyFromLevel(level) };
    }) ?? [];
  $: todayKey = data?.now.time.slice(0, 10) ?? '';
  $: weekMin = days.length ? Math.min(...days.map((day) => day.tempMin)) : 0;
  $: weekMax = days.length ? Math.max(...days.map((day) => day.tempMax)) : 1;
  $: hardest = days.reduce(
    (best, day) => (!best || day.feelsMax > best.feelsMax ? day : best),
    days[0]
  );
  $: hottestNight = days.reduce(
    (best, day) => (!best || day.nightMin > best.nightMin ? day : best),
    days[0]
  );
  $: hardestPhrase = data && hardest ? getDayPhrase(data, hardest, $settings.profile) : null;
  $: retry = () => loadForecast($selectedLocation, { force: true });

  function barStart(day: (typeof days)[number]): number {
    return ((day.tempMin - weekMin) / Math.max(1, weekMax - weekMin)) * 100;
  }
  function barWidth(day: (typeof days)[number]): number {
    return ((day.tempMax - day.tempMin) / Math.max(1, weekMax - weekMin)) * 100;
  }

  onMount(() => {
    if (browser && !$forecast) void loadForecast($selectedLocation);
  });
</script>

<svelte:head>
  <title>Pronóstico de 7 Días en {$selectedLocation.distrito} · RUPAQ</title>
  <meta
    name="description"
    content={`Pronóstico de calor para los próximos 7 días en ${$selectedLocation.distrito}, con temperaturas mínimas nocturnas y alertas del día más caluroso.`}
  />
  <meta property="og:title" content={`Pronóstico de 7 Días en ${$selectedLocation.distrito} · RUPAQ`} />
  <meta
    property="og:description"
    content={`Pronóstico extendido de calor para los próximos 7 días en ${$selectedLocation.distrito}. Temperaturas diurnas y nocturnas.`}
  />
  <meta property="og:url" content="https://rupaq.pe/dias" />
  <meta name="twitter:title" content={`Pronóstico de 7 Días en ${$selectedLocation.distrito} · RUPAQ`} />
</svelte:head>

<div class="screen days-screen">
  <div class="page days-page">
    <LocationHeader />

    <div class="days-layout">
      <section class="days-main" aria-labelledby="days-title">
        <header class="days-head">
          <p class="eyebrow">Pronóstico por distrito</p>
          <h1 id="days-title" class="page-title">Siete días</h1>
          <p class="page-intro">
            La máxima de cada día y la noche que no enfría. Mira dónde aprieta y prepara lo que necesitas.
          </p>
        </header>

        {#if $forecastLoading && !data}
          <div class="list-skeleton" aria-busy="true" aria-label="Cargando los próximos siete días">
            {#each Array(6) as _}
              <div class="skeleton-row">
                <div class="skeleton" style="width: 64px; height: 18px;"></div>
                <div class="skeleton" style="width: 100%; height: 12px;"></div>
                <div class="skeleton" style="width: 44px; height: 28px;"></div>
              </div>
            {/each}
          </div>
        {:else if !data}
          <ErrorState
            message={$forecastError ?? 'No pudimos cargar la semana de tu distrito.'}
            onretry={retry}
          />
        {:else}
          <ol class="week-list">
            {#each days as day, index}
              {@const label = dayLabel(day.date, todayKey)}
              <li>
                <a
                  class="day-row"
                  class:day-row--today={day.date === todayKey}
                  href={`/dias/${day.date}`}
                  aria-label={`${label}, ${shortDate(day.date)}. Máxima ${Math.round(day.tempMax)} grados, mínima nocturna ${Math.round(day.nightMin)} grados. Riesgo ${RISK_META[day.riskKey].label}.`}
                >
                  <span class="day-name">
                    <span class="day-name__label">{label}</span>
                    <span class="day-name__date">{formatNumber(day.tempMin)}° de noche</span>
                  </span>

                  <span class="day-bar" aria-hidden="true">
                    <span class="day-bar__track">
                      <span
                        class="day-bar__fill"
                        style={`left:${barStart(day)}%; width:${Math.max(6, barWidth(day))}%;`}
                      ></span>
                      <span class="day-bar__night" style={`left:${barStart(day)}%;`}></span>
                    </span>
                    <span class="day-bar__foot">
                      <span>{Math.round(day.tempMin)}°</span>
                      <span>{Math.round(day.tempMax)}°</span>
                    </span>
                  </span>

                  <span class="day-max">
                    <span class="day-max__number tabular">{Math.round(day.tempMax)}°</span>
                    <span class="day-risk" data-level={day.risk}>
                      <span class="risk-swatch" data-level={day.risk} aria-hidden="true"></span>
                      {RISK_META[day.riskKey].label}
                    </span>
                  </span>

                  <span class="day-chev" aria-hidden="true">
                    <ChevronRight size={18} strokeWidth={1.9} />
                  </span>
                </a>
              </li>
            {/each}
          </ol>

          <div class="week-foot">
            <Freshness
              updatedAt={data.freshness.updatedAt}
              stale={data.freshness.stale}
            />
            <span class="week-source">Mínima nocturna destacada con luna</span>
          </div>
        {/if}
      </section>

      <aside class="days-aside" aria-label="Resumen de la semana">
        {#if data && hardest}
          <section class="insight">
            <p class="eyebrow">Día más duro</p>
            <h2 class="insight__title">
              {dayLabel(hardest.date, todayKey)} <span>{formatNumber(hardest.tempMax)}°</span>
            </h2>
            <p class="insight__phrase">{hardestPhrase?.phrase}</p>
            <dl class="insight__facts">
              <div>
                <dt><Sunrise size={16} strokeWidth={1.8} aria-hidden="true" /> Sensación máxima</dt>
                <dd>{formatNumber(hardest.feelsMax, 1)}° · {RISK_META[hardest.riskKey].label}</dd>
              </div>
              <div>
                <dt><MoonStar size={16} strokeWidth={1.8} aria-hidden="true" /> Noche más caliente</dt>
                <dd>
                  {dayLabel(hottestNight.date, todayKey)} · {formatNumber(hottestNight.nightMin)}°
                </dd>
              </div>
            </dl>
          </section>

          <section class="night-note">
            <p class="eyebrow">Las noches importan</p>
            <p>
              Si la mínima no baja de <strong>24°</strong>, el cuerpo no descansa. Ventila el cuarto,
              usa ropa ligera y deja agua junto a la cama.
            </p>
          </section>

          <section class="legend" aria-label="Escala de riesgo">
            <p class="eyebrow">Escala</p>
            <ul>
              {#each (['safe', 'attention', 'precaution', 'danger', 'extreme'] as const) as key}
                <li>
                  <span class="legend__swatch" data-level={RISK_META[key].level} aria-hidden="true"></span>
                  {RISK_META[key].label}
                </li>
              {/each}
            </ul>
            <p class="legend__note">La palabra y el patrón acompañan siempre al color.</p>
          </section>
        {:else}
          <div class="aside-loading" aria-hidden="true">
            <div class="skeleton" style="width: 50%; height: 16px;"></div>
            <div class="skeleton" style="width: 80%; height: 38px; margin-top: 14px;"></div>
            <div class="skeleton" style="width: 100%; height: 18px; margin-top: 14px;"></div>
            <div class="skeleton" style="width: 90%; height: 18px; margin-top: 8px;"></div>
          </div>
        {/if}
      </aside>
    </div>
  </div>
</div>

<style>
  .days-page {
    max-width: 1120px;
    padding-bottom: 100px;
  }

  .days-head {
    padding: 18px 0 22px;
    border-bottom: 1px solid var(--hairline);
  }

  .days-head .page-intro {
    margin-top: 9px;
    max-width: 40ch;
  }

  .week-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .day-row {
    display: grid;
    grid-template-columns: 94px minmax(80px, 1fr) 64px 16px;
    align-items: center;
    gap: 12px;
    min-height: 74px;
    padding: 9px 0;
    border-bottom: 1px solid var(--hairline);
    text-decoration: none;
    color: var(--ink);
  }
  .day-row:first-child {
    border-top: 1px solid var(--hairline);
  }
  .day-row:hover .day-name__label {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .day-name {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .day-name__label {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 590;
    letter-spacing: -0.035em;
    line-height: 1.1;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .day-name__date {
    font-size: 0.875rem;
    color: var(--ink-mute);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .day-bar {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .day-bar__track {
    position: relative;
    height: 10px;
    background: var(--field);
    border-radius: 2px;
  }
  .day-bar__fill {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--attention), var(--precaution) 60%, var(--danger));
  }
  .day-bar__night {
    position: absolute;
    top: 50%;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--paper);
    border: 1.5px solid var(--ink-soft);
    transform: translate(-50%, -50%);
  }
  .day-bar__foot {
    display: flex;
    justify-content: space-between;
    gap: 4px;
    font-size: 0.875rem;
    color: var(--ink-mute);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .day-max {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    min-width: 0;
  }
  .day-max__number {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 620;
    letter-spacing: -0.055em;
    line-height: 1;
  }
  .day-risk {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.875rem;
    font-weight: 650;
    white-space: nowrap;
  }
  .day-risk[data-level='0'] {
    color: var(--safe-ink);
  }
  .day-risk[data-level='1'] {
    color: var(--attention-ink);
  }
  .day-risk[data-level='2'] {
    color: var(--precaution-ink);
  }
  .day-risk[data-level='3'] {
    color: var(--danger-ink);
  }
  .day-risk[data-level='4'] {
    color: var(--extreme-ink);
  }
  .risk-swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex: none;
  }
  .risk-swatch[data-level='0'] {
    background: var(--safe);
  }
  .risk-swatch[data-level='1'] {
    background: var(--attention);
  }
  .risk-swatch[data-level='2'] {
    background: var(--precaution);
  }
  .risk-swatch[data-level='3'] {
    background-color: var(--danger);
    background-image: repeating-linear-gradient(
      45deg,
      transparent 0 2px,
      color-mix(in srgb, var(--paper) 86%, transparent) 2px 3px
    );
  }
  .risk-swatch[data-level='4'] {
    background-color: var(--extreme);
    background-image: repeating-linear-gradient(
        45deg,
        transparent 0 2px,
        color-mix(in srgb, var(--paper) 82%, transparent) 2px 3px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent 0 2px,
        color-mix(in srgb, var(--paper) 82%, transparent) 2px 3px
      );
  }
  .day-chev {
    color: var(--ink-mute);
    justify-self: end;
  }
  .week-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-top: 10px;
    flex-wrap: wrap;
  }
  .week-source {
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .days-aside {
    padding-top: 20px;
  }

  .insight {
    padding-bottom: 20px;
    border-bottom: 1px solid var(--hairline);
  }
  .insight__title {
    margin-top: 8px;
    font-size: clamp(2rem, 5vw, 2.6rem);
    letter-spacing: -0.05em;
    text-transform: capitalize;
  }
  .insight__title span {
    color: var(--risk-ink);
  }
  .insight__phrase {
    margin-top: 10px;
    font-family: var(--font-display);
    font-size: 1.35rem;
    line-height: 1.15;
    letter-spacing: -0.035em;
    max-width: 26ch;
  }
  .insight__facts {
    margin: 18px 0 0;
    display: grid;
    gap: 10px;
  }
  .insight__facts div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-top: 9px;
    border-top: 1px solid var(--hairline-soft);
  }
  .insight__facts dt {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.9375rem;
    color: var(--ink-soft);
  }
  .insight__facts dd {
    margin: 0;
    font-weight: 650;
    font-size: 0.9375rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .night-note {
    padding: 18px 0;
    border-bottom: 1px solid var(--hairline);
  }
  .night-note p:last-child {
    margin-top: 8px;
    font-size: 1.0625rem;
    line-height: 1.45;
    color: var(--ink-soft);
  }
  .night-note strong {
    color: var(--ink);
  }

  .legend {
    padding-top: 18px;
  }
  .legend ul {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9375rem;
  }
  .legend__swatch {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }
  .legend__swatch[data-level='0'] {
    background: var(--safe);
  }
  .legend__swatch[data-level='1'] {
    background: var(--attention);
  }
  .legend__swatch[data-level='2'] {
    background: var(--precaution);
  }
  .legend__swatch[data-level='3'] {
    background-color: var(--danger);
    background-image: repeating-linear-gradient(45deg, transparent 0 2px, var(--paper) 2px 3px);
  }
  .legend__swatch[data-level='4'] {
    background-color: var(--extreme);
    background-image: repeating-linear-gradient(
        45deg,
        transparent 0 2px,
        var(--paper) 2px 3px
      ),
      repeating-linear-gradient(-45deg, transparent 0 2px, var(--paper) 2px 3px);
  }
  .legend__note {
    margin-top: 10px;
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .list-skeleton {
    border-top: 1px solid var(--hairline);
    margin-top: 0;
  }
  .skeleton-row {
    display: grid;
    grid-template-columns: 70px 1fr 48px;
    align-items: center;
    gap: 14px;
    min-height: 74px;
    border-bottom: 1px solid var(--hairline);
  }
  .aside-loading {
    padding-top: 24px;
  }

  @media (min-width: 900px) {
    .days-page {
      padding-bottom: 40px;
    }
    .days-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
      gap: 58px;
      align-items: start;
    }
    .days-aside {
      padding-top: 96px;
      position: sticky;
      top: 24px;
    }
    .day-row {
      grid-template-columns: 118px minmax(100px, 1fr) 78px 18px;
      min-height: 78px;
    }
    .day-name__label {
      font-size: 1.35rem;
    }
    .day-bar {
      gap: 7px;
    }
    .day-bar__track {
      height: 12px;
    }
    .day-max__number {
      font-size: 2.05rem;
    }
  }

  @media (max-width: 380px) {
    .day-row {
      grid-template-columns: 79px minmax(62px, 1fr) 58px 12px;
      gap: 8px;
    }
    .day-name__label {
      font-size: 1.08rem;
    }
    .day-max__number {
      font-size: 1.55rem;
    }
    .day-risk {
      font-size: 0.875rem;
    }
  }
</style>

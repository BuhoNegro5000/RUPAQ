<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import {
    ChevronLeft,
    ChevronRight,
    Droplets,
    MoonStar,
    Sun,
    Sunrise
  } from '@lucide/svelte';
  import DayArc from '$lib/components/DayArc.svelte';
  import ErrorState from '$lib/components/ErrorState.svelte';
  import Freshness from '$lib/components/Freshness.svelte';
  import LocationHeader from '$lib/components/LocationHeader.svelte';
  import { forecast, forecastError, forecastLoading, loadForecast } from '$lib/stores/forecast';
  import { selectedLocation } from '$lib/stores/location';
  import { settings } from '$lib/stores/settings';
  import { getDayPhrase } from '$lib/utils/action';
  import {
    dayLabel,
    formatNumber,
    longDate,
    shortDate,
    uvCategory
  } from '$lib/utils/format';
  import {
    RISK_META,
    adjustedThresholds,
    keyFromLevel,
    levelFromFeels
  } from '$lib/utils/risk';
  import type { RiskKey } from '$lib/types';

  const recommendations: Record<RiskKey, string[]> = {
    safe: [
      'Aprovecha la mañana para ventilar la casa y hacer lo que exige más esfuerzo.',
      'Toma agua antes de tener sed y mantén una botella a mano.',
      'Si sales al mediodía, camina por la sombra y usa sombrero.'
    ],
    attention: [
      'Adelanta tus salidas y evita el sol directo entre las 11 y las 4.',
      'Toma agua cada hora, aunque no sientas sed.',
      'Revisa que niños, personas mayores y mascotas tengan agua fresca.'
    ],
    precaution: [
      'Baja el ritmo entre las 11 y las 4. Lo pesado puede esperar.',
      'Toma agua cada 30 minutos y busca sombra antes de cansarte.',
      'Cierra cortinas durante el día y abre las ventanas cuando baje la temperatura.'
    ],
    danger: [
      'No salgas entre las 11 y las 4 salvo que sea imprescindible.',
      'Toma agua cada 20 minutos y no hagas esfuerzo físico al sol.',
      'Revisa cada dos horas a quienes viven solos o tienen una enfermedad crónica.'
    ],
    extreme: [
      'Quédate en el lugar más fresco y no salgas durante las horas de más calor.',
      'Toma agua cada 15 minutos y refresca la piel con paños húmedos.',
      'Si alguien confunde, se desmaya o no responde, llama al 106 de inmediato.'
    ]
  };

  $: date = $page.params.date ?? '';
  $: data = $forecast;
  $: thresholds = data ? adjustedThresholds(data.location.zona, $settings.profile) : null;
  $: todayKey = data?.now.time.slice(0, 10) ?? '';
  $: day = data?.daily.find((item) => item.date === date);
  $: dayIndex = data?.daily.findIndex((item) => item.date === date) ?? -1;
  $: previous = dayIndex > 0 ? data?.daily[dayIndex - 1] : undefined;
  $: next =
    data && dayIndex >= 0 && dayIndex < data.daily.length - 1
      ? data.daily[dayIndex + 1]
      : undefined;
  $: level = day
    ? thresholds
      ? levelFromFeels(day.feelsMax, thresholds)
      : day.risk
    : 0;
  $: riskKey = keyFromLevel(level);
  $: risk = RISK_META[riskKey];
  $: phrase = data && day ? getDayPhrase(data, day, $settings.profile) : null;
  $: isToday = date === todayKey;
  $: hourly =
    data?.hourly
      .filter((point) => point.time.startsWith(date))
      .map((point) => {
        const pointLevel = thresholds ? levelFromFeels(point.feelsC, thresholds) : point.risk;
        return { ...point, risk: pointLevel, riskKey: keyFromLevel(pointLevel) };
      }) ?? [];
  $: retry = () => loadForecast($selectedLocation, { force: true });

  onMount(() => {
    if (browser && !$forecast) void loadForecast($selectedLocation);
  });
</script>

<svelte:head>
  <title>{day ? `${dayLabel(day.date, todayKey)} ${shortDate(day.date)}` : 'Día'} · Rupaq</title>
  <meta
    name="description"
    content={day
      ? `Calor en ${$selectedLocation.distrito} para el ${longDate(day.date)}: máxima ${Math.round(day.tempMax)} grados, sensación ${Math.round(day.feelsMax)} grados y riesgo ${risk.label}.`
      : 'Detalle del día en Rupaq.'}
  />
</svelte:head>

<div class="screen day-screen">
  <div class="page day-page">
    <LocationHeader />

    <div class="day-toolbar">
      <a class="back" href="/dias">
        <ChevronLeft size={19} strokeWidth={2} aria-hidden="true" />
        <span>Siete días</span>
      </a>
      {#if data}
        <p class="place">{$selectedLocation.distrito} · {formatNumber(data.location.altitud)} m</p>
      {/if}
    </div>

    {#if $forecastLoading && !data}
      <div class="detail-skeleton" aria-busy="true" aria-label="Cargando el detalle del día">
        <div class="skeleton" style="width: 54%; height: 18px;"></div>
        <div class="skeleton" style="width: 76%; height: 58px; margin-top: 16px;"></div>
        <div class="skeleton" style="width: 100%; height: 160px; margin-top: 26px;"></div>
      </div>
    {:else if !data}
      <ErrorState
        message={$forecastError ?? 'No pudimos cargar este día para tu distrito.'}
        onretry={retry}
      />
    {:else if !day}
      <div class="empty">
        <h2>Ese día no está en el pronóstico</h2>
        <p>La predicción disponible cubre los próximos siete días. Vuelve a la semana para elegir una fecha válida.</p>
        <a class="btn btn--ghost" href="/dias">Ver los siete días</a>
      </div>
    {:else}
      <div class="detail-layout">
        <main class="detail-main">
          <header class="day-hero" data-level={level}>
            <p class="eyebrow">
              {dayLabel(day.date, todayKey)} <span aria-hidden="true">·</span>
              {shortDate(day.date)}
            </p>
            <h1>{longDate(day.date)}</h1>

            <div class="feels-line">
              <p class="feels" aria-label={`${Math.round(day.feelsMax)} grados de sensación máxima`}>
                <span aria-hidden="true">{Math.round(day.feelsMax)}<span class="degree">°</span></span>
              </p>
              <div class="feels-copy">
                <p class="risk-word" data-key={riskKey}>
                  <span class="risk-swatch" data-level={level} aria-hidden="true"></span>
                  {risk.label}
                </p>
                <p class="feels-caption">sensación máxima</p>
                <p class="real">Temperatura real {formatNumber(day.tempMax, 1)}°</p>
              </div>
            </div>

            <p class="day-phrase">{phrase?.phrase}</p>
            {#if phrase?.personalized}
              <a class="profile-note" href="/mas/perfil">
                Ajustado a tu perfil
                <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
              </a>
            {/if}
          </header>

          <section class="arc-section" aria-label="Hora por hora">
            <div class="section-label">
              <p class="eyebrow">El día, hora por hora</p>
              <p class="meta">Pico {formatNumber(day.peakHour)} h</p>
            </div>
            <DayArc
              idPrefix="day-detail-arc"
              hours={hourly}
              currentHour={data.now.hour}
              peakHour={day.peakHour}
              peakFeels={day.feelsMax}
              riskLevel={level}
              showNow={isToday}
            />
          </section>

          <section class="facts" aria-labelledby="facts-title">
            <h2 id="facts-title" class="section-title">Lo que importa</h2>
            <dl class="fact-list">
              <div>
                <dt><Sunrise size={19} strokeWidth={1.8} aria-hidden="true" /> Máxima real</dt>
                <dd>{formatNumber(day.tempMax, 1)}°</dd>
              </div>
              <div>
                <dt><MoonStar size={19} strokeWidth={1.8} aria-hidden="true" /> Mínima nocturna</dt>
                <dd>{formatNumber(day.nightMin, 1)}°</dd>
              </div>
              <div>
                <dt><Sun size={19} strokeWidth={1.8} aria-hidden="true" /> UV máximo</dt>
                <dd>
                  {day.uvMax == null ? 'Sin dato' : `${formatNumber(day.uvMax, 1)} · ${uvCategory(day.uvMax)}`}
                </dd>
              </div>
              <div>
                <dt><Droplets size={19} strokeWidth={1.8} aria-hidden="true" /> Humedad en el pico</dt>
                <dd>{formatNumber(day.humidity)} %</dd>
              </div>
            </dl>
          </section>

          <section class="advice" aria-labelledby="advice-title">
            <h2 id="advice-title" class="section-title">Qué hacer</h2>
            <ul class="advice-list">
              {#each recommendations[riskKey] as item}
                <li><span class="advice-mark" aria-hidden="true"></span>{item}</li>
              {/each}
            </ul>
            <a class="text-link" href="/sintomas">
              Reconocer un golpe de calor
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </section>
        </main>

        <aside class="detail-aside" aria-label="Resumen del día">
          <section class="night-card">
            <p class="eyebrow">La noche</p>
            <p class="night-number tabular">{formatNumber(day.nightMin)}°</p>
            <p class="night-copy">
              {#if day.nightMin >= 24}
                La noche no enfría. El cuerpo descansa peor y el calor se acumula. Ventila el cuarto y deja agua junto a la cama.
              {:else if day.nightMin >= 20}
                La noche baja poco. Duerme con ropa ligera, abre la ventana si el aire de afuera está más fresco y toma agua al despertar.
              {:else}
                La noche permite recuperar el cuerpo. Aprovecha para ventilar y dejar la casa fresca antes de mañana.
              {/if}
            </p>
          </section>

          <section class="quote-card">
            <p class="eyebrow">En una frase</p>
            <p>{phrase?.phrase}</p>
          </section>

          <div class="aside-freshness">
            <Freshness updatedAt={data.freshness.updatedAt} stale={data.freshness.stale} />
          </div>
        </aside>
      </div>

      <nav class="day-nav" aria-label="Otros días">
        {#if previous}
          <a href={`/dias/${previous.date}`} class="day-nav__link day-nav__link--prev">
            <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
            <span>
              <span class="day-nav__kicker">Anterior</span>
              <span class="day-nav__label">{dayLabel(previous.date, todayKey)} · {shortDate(previous.date)}</span>
            </span>
          </a>
        {:else}
          <span></span>
        {/if}
        {#if next}
          <a href={`/dias/${next.date}`} class="day-nav__link day-nav__link--next">
            <span>
              <span class="day-nav__kicker">Siguiente</span>
              <span class="day-nav__label">{dayLabel(next.date, todayKey)} · {shortDate(next.date)}</span>
            </span>
            <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
          </a>
        {/if}
      </nav>
    {/if}
  </div>
</div>

<style>
  .day-page {
    max-width: 1120px;
    padding-bottom: 100px;
  }

  .day-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 52px;
    border-bottom: 1px solid var(--hairline-soft);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 48px;
    margin-left: -6px;
    padding: 0 6px;
    font-size: 0.9375rem;
    font-weight: 650;
    color: var(--ink-soft);
    text-decoration: none;
  }

  .place {
    font-size: 0.875rem;
    color: var(--ink-mute);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .detail-skeleton {
    padding-top: 30px;
  }

  .day-hero {
    padding: 22px 0 20px;
    border-bottom: 1px solid var(--hairline);
  }

  .day-hero .eyebrow {
    color: var(--ink-soft);
  }

  h1 {
    margin-top: 7px;
    font-size: clamp(2rem, 7vw, 3.1rem);
    text-transform: capitalize;
    max-width: 20ch;
  }

  .feels-line {
    display: flex;
    align-items: flex-end;
    gap: 18px;
    margin-top: 20px;
  }

  .feels {
    font-family: var(--font-display);
    font-size: clamp(6.2rem, 24vw, 9rem);
    font-weight: 640;
    line-height: 0.74;
    letter-spacing: -0.09em;
    color: var(--risk-ink);
    font-variant-numeric: tabular-nums;
  }

  .degree {
    display: inline-block;
    font-size: 0.4em;
    line-height: 1;
    vertical-align: top;
    transform: translateY(0.13em);
    margin-left: 0.02em;
    letter-spacing: -0.04em;
    font-weight: 520;
  }

  .feels-copy {
    padding-bottom: 3px;
    min-width: 0;
  }

  .risk-word {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 760;
    letter-spacing: 0.075em;
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .risk-word[data-key='safe'] {
    color: var(--safe-ink);
  }
  .risk-word[data-key='attention'] {
    color: var(--attention-ink);
  }
  .risk-word[data-key='precaution'] {
    color: var(--precaution-ink);
  }
  .risk-word[data-key='danger'] {
    color: var(--danger-ink);
  }
  .risk-word[data-key='extreme'] {
    color: var(--extreme-ink);
  }

  .risk-swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: currentColor;
    flex: none;
  }

  .risk-swatch[data-level='3'],
  .risk-swatch[data-level='4'] {
    background-color: currentColor;
    background-image: repeating-linear-gradient(
      45deg,
      transparent 0 2px,
      var(--paper) 2px 3px
    );
  }

  .feels-caption {
    margin-top: 7px;
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .real {
    margin-top: 2px;
    font-size: 0.9375rem;
    color: var(--ink-soft);
    font-variant-numeric: tabular-nums;
  }

  .day-phrase {
    margin-top: 22px;
    max-width: 32ch;
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 5vw, 2.05rem);
    font-weight: 550;
    line-height: 1.1;
    letter-spacing: -0.045em;
    text-wrap: balance;
  }

  .profile-note {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-height: 36px;
    margin-top: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--ink-mute);
    text-decoration: none;
  }

  .arc-section {
    padding: 20px 0 14px;
    border-bottom: 1px solid var(--hairline);
    min-width: 0;
  }

  .section-label {
    margin-bottom: 4px;
  }

  .facts {
    padding: 22px 0 20px;
    border-bottom: 1px solid var(--hairline);
  }

  .fact-list {
    margin: 14px 0 0;
  }

  .fact-list div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 46px;
    border-top: 1px solid var(--hairline-soft);
  }

  .fact-list div:last-child {
    border-bottom: 1px solid var(--hairline-soft);
  }

  .fact-list dt {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 1rem;
    color: var(--ink-soft);
  }

  .fact-list dd {
    margin: 0;
    font-weight: 650;
    font-size: 1.0625rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .advice {
    padding-top: 22px;
  }

  .advice-list {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
  }

  .advice-list li {
    display: flex;
    gap: 11px;
    padding: 11px 0;
    border-top: 1px solid var(--hairline-soft);
    color: var(--ink-soft);
    font-size: 1.0625rem;
    line-height: 1.42;
  }

  .advice-list li:last-child {
    border-bottom: 1px solid var(--hairline-soft);
  }

  .advice-mark {
    flex: none;
    width: 7px;
    height: 7px;
    margin-top: 0.55em;
    border-radius: 50%;
    background: var(--risk);
  }

  .text-link {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    min-height: 48px;
    margin-top: 8px;
    font-weight: 650;
    font-size: 0.9375rem;
    color: var(--ink-soft);
    text-decoration: none;
  }

  .detail-aside {
    padding-top: 20px;
  }

  .night-card {
    padding-bottom: 18px;
    border-bottom: 1px solid var(--hairline);
  }

  .night-number {
    margin-top: 5px;
    font-family: var(--font-display);
    font-size: 3.8rem;
    font-weight: 620;
    line-height: 0.9;
    letter-spacing: -0.07em;
  }

  .night-copy {
    margin-top: 10px;
    font-size: 1.0625rem;
    line-height: 1.48;
    color: var(--ink-soft);
    max-width: 36ch;
  }

  .quote-card {
    padding: 18px 0;
    border-bottom: 1px solid var(--hairline);
  }

  .quote-card p:last-child {
    margin-top: 8px;
    font-family: var(--font-display);
    font-size: 1.45rem;
    line-height: 1.14;
    letter-spacing: -0.035em;
    text-wrap: balance;
    max-width: 28ch;
  }

  .aside-freshness {
    padding-top: 14px;
  }

  .day-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    padding: 24px 0 0;
    border-top: 1px solid var(--hairline);
    margin-top: 26px;
  }

  .day-nav__link {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 62px;
    text-decoration: none;
    color: var(--ink);
  }

  .day-nav__link--next {
    justify-content: flex-end;
    text-align: right;
  }

  .day-nav__link:hover .day-nav__label {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .day-nav__kicker {
    display: block;
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .day-nav__label {
    display: block;
    margin-top: 2px;
    font-weight: 650;
    font-size: 0.9375rem;
    text-transform: capitalize;
  }

  @media (min-width: 860px) {
    .day-page {
      padding-bottom: 40px;
    }

    .detail-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
      gap: 56px;
      align-items: start;
    }

    .detail-aside {
      position: sticky;
      top: 24px;
      padding-top: 34px;
    }

    .day-hero {
      padding-top: 30px;
    }

    .feels {
      font-size: clamp(7.5rem, 13vw, 10rem);
    }

    .day-nav {
      margin-left: calc(65% + 22px);
    }
  }

  @media (max-width: 380px) {
    .feels-line {
      gap: 10px;
    }

    .feels {
      font-size: 5.8rem;
    }

    .risk-word {
      font-size: 0.875rem;
    }
  }
</style>

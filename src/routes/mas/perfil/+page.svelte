<script lang="ts">
  import { ChevronRight, UserRound } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import { selectedLocation } from '$lib/stores/location';
  import {
    PROFILE_OPTIONS,
    settings,
    toggleProfile,
    updateSettings
  } from '$lib/stores/settings';
  import { adjustedThresholds, baseThresholds } from '$lib/utils/risk';
  import { formatNumber } from '$lib/utils/format';
  import type { ProfileKey } from '$lib/types';

  $: selected = $settings.profile;
  $: adjusted = adjustedThresholds($selectedLocation.zona, selected);
  $: base = baseThresholds($selectedLocation.zona);
  $: lower = Math.abs(base.danger - adjusted.danger);
  $: zoneLabel = $selectedLocation.zona.replace('_', ' ');

  function clearProfiles(): void {
    updateSettings({ profile: [] });
  }
</script>

<svelte:head>
  <title>Perfil de riesgo · Rupaq</title>
  <meta
    name="description"
    content="Ajusta los umbrales de calor de Rupaq si cuidas a niños, embarazadas, adultos mayores o trabajas al aire libre."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page profile-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Tu contexto"
      title="El calor no nos afecta igual"
      intro="Marca a quién cuidas o cómo trabajas. Rupaq baja el umbral de alerta para esa persona y cambia el consejo del día. No es un diagnóstico."
    />

    <div class="reading-body">
      <section aria-labelledby="profiles-title">
        <div class="section-label">
          <h2 id="profiles-title">¿A quién cuidamos?</h2>
          {#if selected.length}
            <button type="button" class="clear" onclick={clearProfiles}>Quitar todos</button>
          {/if}
        </div>

        <ul class="profile-list">
          {#each PROFILE_OPTIONS as option}
            {@const active = selected.includes(option.key)}
            <li>
              <label class="profile-row" class:profile-row--active={active}>
                <span class="profile-icon" aria-hidden="true">
                  <UserRound size={20} strokeWidth={1.8} />
                </span>
                <span class="profile-copy">
                  <span class="profile-name">{option.label}</span>
                  <span class="profile-detail">{option.detail}</span>
                </span>
                <span class="switch">
                  <input
                    type="checkbox"
                    checked={active}
                    onchange={() => toggleProfile(option.key as ProfileKey)}
                    aria-label={`${option.label}: ${active ? 'activo' : 'inactivo'}`}
                  />
                  <span class="switch-track" aria-hidden="true"><span></span></span>
                </span>
              </label>
            </li>
          {/each}
        </ul>
      </section>

      <section aria-labelledby="effect-title">
        <h2 id="effect-title">Qué cambia en la práctica</h2>
        {#if selected.length}
          <p>
            En {$selectedLocation.distrito} ({zoneLabel}), el nivel <strong>Peligro</strong> empieza a
            los <strong>{formatNumber(adjusted.danger, 1)} °C</strong> de sensación térmica. Sin ajuste
            empezaría a los {formatNumber(base.danger, 1)} °C.
          </p>
          {#if lower > 0}
            <div class="pull-stat">
              <span class="pull-stat__number">{formatNumber(lower, 1)}°</span>
              <p class="pull-stat__copy">
                más temprano se activa la alerta para las personas o situaciones que marcaste.
              </p>
            </div>
          {/if}
          <p class="meta">
            El ajuste se limita para no exagerar el riesgo. El nivel también depende de la humedad y de
            la hora del día.
          </p>
        {:else}
          <p>
            Ahora Rupaq usa el umbral general de la zona <strong>{zoneLabel}</strong>. Cuando marques un
            perfil, la alerta se activa a una sensación térmica más baja y el consejo cambia de tono.
          </p>
          <p>
            Por ejemplo, para un niño o una persona mayor, el mismo calor exige más agua, más sombra y
            una revisión más frecuente.
          </p>
        {/if}
        <a class="text-link" href="/mas/plan">
          Preparar un plan para casa
          <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      </section>

      <section aria-labelledby="privacy-title">
        <h2 id="privacy-title">Tus datos, en tu teléfono</h2>
        <p>
          Este perfil se guarda en el almacenamiento local de tu navegador. No hay cuenta, no viaja a un
          servidor y no sabemos quién eres. Puedes borrarlo cuando quieras desde
          <a href="/mas/privacidad">Privacidad</a>.
        </p>
        <p class="disclaimer-box">
          Rupaq ofrece orientación general. No reemplaza una consulta médica. Si tienes una condición de
          salud, consulta con tu profesional de confianza sobre cómo protegerte del calor.
        </p>
      </section>
    </div>
  </div>
</div>

<style>
  .profile-page {
    max-width: 820px;
  }

  .section-label h2 {
    margin: 0;
  }

  .clear {
    min-height: 40px;
    padding: 0 10px;
    border-radius: 999px;
    color: var(--ink-soft);
    font-size: 0.875rem;
    font-weight: 650;
    white-space: nowrap;
  }

  .clear:hover {
    background: var(--field);
  }

  .profile-list {
    margin-top: 4px;
  }

  .profile-row {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    gap: 12px;
    align-items: center;
    min-height: 72px;
    padding: 12px 0;
    border-bottom: 1px solid var(--hairline);
    cursor: pointer;
  }

  .profile-row--active {
    background: color-mix(in srgb, var(--ink) 3%, transparent);
  }

  .profile-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink-mute);
  }

  .profile-row--active .profile-icon {
    color: var(--ink);
    border-color: var(--hairline-strong);
  }

  .profile-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .profile-name {
    font-weight: 650;
    font-size: 1.0625rem;
  }

  .profile-detail {
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.35;
  }

  .switch {
    position: relative;
    flex: none;
  }

  .switch input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }

  .switch-track {
    display: block;
    width: 49px;
    height: 29px;
    padding: 3px;
    border: 1px solid var(--hairline-strong);
    border-radius: 999px;
    transition: background-color 160ms ease;
  }

  .switch-track span {
    display: block;
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background: var(--ink-mute);
    transition: transform 180ms var(--ease-out), background-color 160ms ease;
  }

  .switch input:checked + .switch-track {
    background: var(--ink);
    border-color: var(--ink);
  }

  .switch input:checked + .switch-track span {
    background: var(--paper);
    transform: translateX(20px);
  }

  .switch input:focus-visible + .switch-track {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  .text-link {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    min-height: 44px;
    margin-top: 10px;
    font-weight: 650;
    font-size: 0.9375rem;
    color: var(--ink-soft);
    text-decoration: none;
  }

  .profile-page .reading-body p a {
    color: var(--ink);
  }

  @media (min-width: 660px) {
    .profile-row {
      grid-template-columns: 44px 1fr auto;
      min-height: 78px;
    }

    .profile-icon {
      width: 40px;
      height: 40px;
    }
  }
</style>

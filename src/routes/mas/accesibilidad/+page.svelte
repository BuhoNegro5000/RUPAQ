<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Check, RotateCcw, Square, Volume2 } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import { FONT_STEPS, THEME_OPTIONS, settings, updateSettings } from '$lib/stores/settings';
  import { canSpeak, speak, stopSpeaking } from '$lib/utils/speech';

  let speaking = false;
  let tested = false;

  const sample =
    'El calor está fuerte. Toma agua cada treinta minutos y busca sombra entre las once y las cuatro de la tarde.';

  $: fontLabel = FONT_STEPS.find((step) => step.value === $settings.fontScale)?.label ?? 'Normal';

  $: themeLabel = THEME_OPTIONS.find((option) => option.value === $settings.theme)?.label ?? 'Automático';

  function testVoice(): void {
    if (speaking) {
      stopSpeaking();
      speaking = false;
      return;
    }
    tested = true;
    speaking = true;
    speak(sample, { onEnd: () => (speaking = false) });
  }

  function reset(): void {
    updateSettings({
      fontScale: 1,
      theme: 'auto',
      simple: false,
      contrast: false,
      readAloud: false
    });
    stopSpeaking();
    speaking = false;
  }

  onDestroy(() => {
    if (speaking) stopSpeaking();
  });
</script>

<svelte:head>
  <title>Accesibilidad · Rupaq</title>
  <meta
    name="description"
    content="Ajusta el tamaño de letra, el contraste, el modo simple y la lectura en voz alta de Rupaq."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page access-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="A tu manera"
      title="Que se entienda, siempre"
      intro="Rupaq está pensada para leerse con prisa, con sol encima o con poca batería. Ajusta la letra y el contraste sin cambiar el contenido."
    />

    <div class="reading-body">
      <section aria-labelledby="font-title">
        <div class="section-label">
          <h2 id="font-title">Tamaño de letra</h2>
          <span class="current">{fontLabel}</span>
        </div>
        <div class="font-options" role="group" aria-label="Tamaño de letra">
          {#each FONT_STEPS as step}
            <button
              type="button"
              class="font-option"
              class:font-option--active={$settings.fontScale === step.value}
              aria-pressed={$settings.fontScale === step.value}
              onclick={() => updateSettings({ fontScale: step.value })}
            >
              <span
                class="font-option__sample"
                style={`font-size:${1 + (step.value - 1) * 1.15}rem`}
                aria-hidden="true">Aa</span
              >
              <span class="font-option__label">{step.label}</span>
            </button>
          {/each}
        </div>
        <p class="hint">La letra cambia en toda la app, también en las guías sin conexión.</p>
      </section>

      <section aria-labelledby="theme-title">
        <div class="section-label">
          <h2 id="theme-title">Apariencia</h2>
          <span class="current">{themeLabel}</span>
        </div>
        <div class="theme-options" role="group" aria-label="Apariencia">
          {#each THEME_OPTIONS as option}
            <button
              type="button"
              class="font-option"
              class:font-option--active={$settings.theme === option.value}
              aria-pressed={$settings.theme === option.value}
              onclick={() => updateSettings({ theme: option.value })}
            >
              <span class="font-option__label">{option.label}</span>
              <span class="theme-detail">{option.detail}</span>
            </button>
          {/each}
        </div>
        <p class="hint">Elige fondo claro si lees con sol; oscuro si lees de noche.</p>
      </section>

      <section aria-labelledby="display-title">
        <h2 id="display-title">Lectura y contraste</h2>
        <ul class="setting-list">
          <li>
            <label class="setting-row">
              <span class="setting-copy">
                <span class="setting-name">Modo simple</span>
                <span class="setting-detail">Oculta detalles secundarios y deja lo esencial.</span>
              </span>
              <span class="switch">
                <input
                  type="checkbox"
                  checked={$settings.simple}
                  onchange={(event) => updateSettings({ simple: event.currentTarget.checked })}
                  aria-label="Activar modo simple"
                />
                <span class="switch-track" aria-hidden="true"><span></span></span>
              </span>
            </label>
          </li>
          <li>
            <label class="setting-row">
              <span class="setting-copy">
                <span class="setting-name">Alto contraste</span>
                <span class="setting-detail">Fortalece líneas, texto y estados de foco.</span>
              </span>
              <span class="switch">
                <input
                  type="checkbox"
                  checked={$settings.contrast}
                  onchange={(event) => updateSettings({ contrast: event.currentTarget.checked })}
                  aria-label="Activar alto contraste"
                />
                <span class="switch-track" aria-hidden="true"><span></span></span>
              </span>
            </label>
          </li>
          <li>
            <label class="setting-row">
              <span class="setting-copy">
                <span class="setting-name">Leer en voz alta</span>
                <span class="setting-detail">Lee automáticamente cada paso de las guías.</span>
              </span>
              <span class="switch">
                <input
                  type="checkbox"
                  checked={$settings.readAloud}
                  onchange={(event) => updateSettings({ readAloud: event.currentTarget.checked })}
                  aria-label="Leer las guías en voz alta"
                />
                <span class="switch-track" aria-hidden="true"><span></span></span>
              </span>
            </label>
          </li>
        </ul>

        <div class="voice-test">
          <button
            type="button"
            class="btn btn--ghost"
            onclick={testVoice}
            disabled={!canSpeak()}
          >
            {#if speaking}
              <Square size={17} strokeWidth={2} aria-hidden="true" />
              Detener prueba
            {:else}
              <Volume2 size={18} strokeWidth={1.9} aria-hidden="true" />
              Probar la voz
            {/if}
          </button>
          {#if !canSpeak()}
            <p class="hint">Tu navegador no ofrece lectura en voz alta. El texto sigue disponible.</p>
          {:else if tested}
            <p class="hint" role="status">
              {speaking ? 'Leyendo la muestra…' : 'Fin de la muestra de voz.'}
            </p>
          {/if}
        </div>
      </section>

      <section aria-labelledby="preview-title">
        <h2 id="preview-title">Cómo se ve</h2>
        <div class="preview" aria-label="Vista previa del texto">
          <p class="preview-eyebrow">Hoy · sensación térmica</p>
          <p class="preview-temp">31°</p>
          <p class="preview-risk"><span class="preview-dot" aria-hidden="true"></span> Precaución</p>
          <p class="preview-copy">
            Baja el ritmo entre las 11 y las 4. Toma agua cada 30 minutos y busca sombra.
          </p>
        </div>
      </section>

      <section aria-labelledby="more-title">
        <h2 id="more-title">Más formas de navegar</h2>
        <ul>
          <li>El enlace <strong>Saltar al contenido</strong> aparece al empezar con la tecla Tab.</li>
          <li>Las guías avanzan con <strong>flechas del teclado</strong>, botones grandes o deslizando.</li>
          <li>Los colores de riesgo siempre van acompañados de palabra y patrón.</li>
          <li>La app respeta la preferencia del sistema para reducir animaciones.</li>
          <li>Puedes aumentar el texto hasta 200 % sin perder contenido esencial.</li>
        </ul>
      </section>

      <div class="reset-row">
        <button type="button" class="btn btn--ghost" onclick={reset}>
          <RotateCcw size={17} strokeWidth={1.9} aria-hidden="true" />
          Restablecer accesibilidad
        </button>
      </div>

      <p class="disclaimer-box">
        <Check size={15} strokeWidth={2.2} aria-hidden="true" /> Probado con lector de pantalla,
        navegación por teclado y zoom de texto. Si algo no se entiende, escríbenos desde
        <a href="/mas/acerca">Acerca de Rupaq</a>.
      </p>
    </div>
  </div>
</div>

<style>
  .access-page {
    max-width: 820px;
  }

  .section-label h2 {
    margin: 0;
  }

  .current {
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .font-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
  }

  .font-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 82px;
    border: 1px solid var(--hairline);
    border-radius: 10px;
    color: var(--ink-soft);
  }

  .theme-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
  }

  .theme-detail {
    font-size: 0.75rem;
    line-height: 1.25;
    text-align: center;
    opacity: 0.85;
    padding: 0 6px;
  }

  .font-option:hover {
    background: var(--field);
  }

  .font-option--active,
  .font-option--active:hover {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--paper);
  }

  .font-option__sample {
    font-family: var(--font-display);
    font-weight: 650;
    line-height: 1;
    letter-spacing: -0.05em;
  }

  .font-option__label {
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
  }

  .hint {
    margin-top: 9px;
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .setting-list {
    margin-top: 4px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 70px;
    padding: 11px 0;
    border-bottom: 1px solid var(--hairline);
    cursor: pointer;
  }

  .setting-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .setting-name {
    font-weight: 650;
    font-size: 1.0625rem;
  }

  .setting-detail {
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.38;
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
    z-index: 2;
    cursor: pointer;
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

  .voice-test {
    margin-top: 14px;
  }

  .preview {
    margin-top: 16px;
    padding: 18px;
    border: 1px solid var(--hairline);
    border-radius: 14px;
    background: color-mix(in srgb, var(--paper-high) 55%, transparent);
  }

  .preview-eyebrow {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  .preview-temp {
    margin: 8px 0 0;
    font-family: var(--font-display);
    font-size: 4.2rem;
    font-weight: 640;
    line-height: 0.8;
    letter-spacing: -0.08em;
    color: var(--ink);
  }

  .preview-risk {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    color: var(--precaution-ink);
    font-weight: 700;
    font-size: 0.9375rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .preview-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: var(--precaution);
  }

  .preview-copy {
    margin-top: 8px;
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.45;
    max-width: 40ch;
  }

  .reset-row {
    margin-top: 24px;
  }

  .disclaimer-box :global(svg) {
    display: inline;
    vertical-align: -2px;
  }

  .disclaimer-box a {
    color: var(--ink);
  }

  @media (min-width: 620px) {
    .font-options {
      gap: 10px;
    }

    .font-option {
      min-height: 92px;
    }

    .font-option__label {
      font-size: 0.875rem;
    }
  }
</style>

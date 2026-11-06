<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import {
    ArrowLeft,
    ArrowRight,
    Check,
    PhoneCall,
    RotateCcw,
    Square,
    Volume2
  } from '@lucide/svelte';
  import ConditionIcon from '$lib/components/ConditionIcon.svelte';
  import UrgencyLabel from '$lib/components/UrgencyLabel.svelte';
  import guides from '$lib/content/health-guides.json';
  import { settings } from '$lib/stores/settings';
  import { canSpeak, speak, stopSpeaking } from '$lib/utils/speech';

  let stepIndex = 0;
  let finished = false;
  let speaking = false;
  let autoSpoken = -1;
  let speechToken = 0;
  let touchStartX = 0;

  $: slug = $page.params.slug ?? '';
  $: guide = guides.condiciones.find((item) => item.slug === slug);
  $: steps = guide?.pasos ?? [];
  $: safeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  $: step = steps[safeIndex];
  $: progress = steps.length ? ((safeIndex + 1) / steps.length) * 100 : 0;
  $: lastStep = safeIndex >= steps.length - 1;
  $: urgent = (guide?.urgenciaNivel ?? 0) >= 3;
  $: if (browser && $settings.readAloud && !finished && step && autoSpoken !== safeIndex) {
    autoSpoken = safeIndex;
    readCurrent();
  }

  function readCurrent(): void {
    if (!step || !canSpeak()) return;
    const token = ++speechToken;
    speaking = true;
    speak(`${step.label}. ${step.titulo}. ${step.texto}`, {
      onEnd: () => {
        if (token === speechToken) speaking = false;
      }
    });
  }

  function toggleSpeech(): void {
    if (speaking) {
      speechToken++;
      stopSpeaking();
      speaking = false;
      return;
    }
    readCurrent();
  }

  function stopSpeech(): void {
    if (speaking) {
      speechToken++;
      stopSpeaking();
      speaking = false;
    }
  }

  function goTo(index: number): void {
    if (index < 0 || index >= steps.length) return;
    stopSpeech();
    stepIndex = index;
    finished = false;
  }

  function next(): void {
    if (lastStep) {
      stopSpeech();
      finished = true;
      return;
    }
    goTo(safeIndex + 1);
  }

  function previous(): void {
    if (safeIndex === 0) return;
    goTo(safeIndex - 1);
  }

  function restart(): void {
    stopSpeech();
    finished = false;
    stepIndex = 0;
    autoSpoken = -1;
  }

  function onTouchStart(event: TouchEvent): void {
    touchStartX = event.touches[0]?.clientX ?? 0;
  }

  function onTouchEnd(event: TouchEvent): void {
    const end = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = end - touchStartX;
    if (Math.abs(delta) < 64) return;
    if (delta < 0) next();
    else previous();
  }

  function onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('keydown', onKeydown);
      stopSpeech();
    };
  });
</script>

<svelte:head>
  <title>{guide ? guide.titulo : 'Guía'} · Rupaq</title>
  <meta
    name="description"
    content={guide ? `${guide.titulo}: ${guide.resumen} Instrucciones paso a paso de Rupaq.` : 'Guía de salud de Rupaq.'}
  />
</svelte:head>

<div class="screen guide-screen">
  {#if !guide}
    <div class="guide-missing">
      <h1>No encontramos esa guía</h1>
      <p>Puede que el enlace esté incompleto. Vuelve a la lista de síntomas para elegir una guía disponible.</p>
      <a class="btn btn--dark" href="/sintomas">Ver síntomas</a>
    </div>
  {:else if finished}
    <div class="finish-screen">
      <header class="finish-top">
        <a class="back" href="/sintomas">
          <ArrowLeft size={19} strokeWidth={1.9} aria-hidden="true" />
          Síntomas
        </a>
        <UrgencyLabel label={guide.urgencia} level={guide.urgenciaNivel} />
      </header>

      <main class="finish-main">
        <span class="finish-mark" aria-hidden="true">
          <Check size={34} strokeWidth={2.2} />
        </span>
        <p class="eyebrow">Guía completada</p>
        <h1>Terminaste: {guide.titulo.toLowerCase()}</h1>
        <p class="finish-copy">
          {#if urgent}
            Si los síntomas siguen, empeoran o tienes cualquier duda, llama al 106 o acude al
            establecimiento de salud más cercano. No esperes a que el calor baje.
          {:else}
            Si no mejora en una hora, el dolor aumenta o aparecen señales de alarma, busca atención.
            Ante cualquier duda, llama al 106.
          {/if}
        </p>

        <div class="finish-actions">
          {#if urgent}
            <a class="btn finish-call" href="tel:106">
              <PhoneCall size={20} strokeWidth={2} aria-hidden="true" />
              Llamar al 106
            </a>
          {/if}
          <a class="btn btn--dark" href="/sintomas">Ver otros síntomas</a>
          <button type="button" class="btn btn--ghost" onclick={restart}>
            <RotateCcw size={18} strokeWidth={1.9} aria-hidden="true" />
            Volver a empezar
          </button>
        </div>

        <p class="disclaimer">{guides.aviso}</p>
      </main>
    </div>
  {:else}
    <div class="guide-page">
      <header class="guide-top">
        <div class="guide-top__row">
          <a class="back" href="/sintomas" aria-label="Volver a la lista de síntomas">
            <ArrowLeft size={20} strokeWidth={1.9} aria-hidden="true" />
            <span>Síntomas</span>
          </a>
          <div class="guide-tools">
            <button
              type="button"
              class="tool"
              class:tool--active={speaking}
              onclick={toggleSpeech}
              disabled={!canSpeak()}
              aria-label={speaking ? 'Detener lectura en voz alta' : 'Escuchar esta instrucción'}
            >
              {#if speaking}
                <Square size={17} strokeWidth={2} aria-hidden="true" />
                <span class="tool__label">Detener</span>
              {:else}
                <Volume2 size={19} strokeWidth={1.9} aria-hidden="true" />
                <span class="tool__label">Escuchar</span>
              {/if}
            </button>
            {#if urgent}
              <a class="tool tool--call" href="tel:106" aria-label="Llamar al SAMU, número 106">
                <PhoneCall size={19} strokeWidth={2} aria-hidden="true" />
                <span class="tool__label">106</span>
              </a>
            {/if}
          </div>
        </div>
        <div class="guide-title-row">
          <span class="guide-icon" data-level={guide.urgenciaNivel} aria-hidden="true">
            <ConditionIcon name={guide.icono} size={21} strokeWidth={1.8} />
          </span>
          <p class="guide-name">{guide.titulo}</p>
          <UrgencyLabel label={guide.urgencia} level={guide.urgenciaNivel} />
        </div>
      </header>

      <div
        class="progress"
        role="progressbar"
        aria-label={`Paso ${safeIndex + 1} de ${steps.length}`}
        aria-valuemin="0"
        aria-valuemax={steps.length}
        aria-valuenow={safeIndex + 1}
      >
        <span class="progress__bar" style={`width:${progress}%`}></span>
      </div>

      <main
        class="step-stage"
        ontouchstart={onTouchStart}
        ontouchend={onTouchEnd}
        aria-live="polite"
      >
        <div class="step-card enter">
          <div class="step-meta">
            <span class="step-kind" data-kind={step.kind}>{step.label}</span>
            <span class="step-count" aria-hidden="true">
              {String(safeIndex + 1).padStart(2, '0')}
              <span>/ {String(steps.length).padStart(2, '0')}</span>
            </span>
          </div>

          <h1 class="step-title">{step.titulo}</h1>
          <p class="step-text">{step.texto}</p>

          {#if step.kind === 'call' || (urgent && safeIndex === 0)}
            <a class="step-call" href="tel:106">
              <PhoneCall size={21} strokeWidth={2} aria-hidden="true" />
              <span>Llamar al 106 ahora</span>
            </a>
          {/if}

          {#if step.kind === 'dont'}
            <p class="step-warning" role="note">
              <strong>No lo hagas.</strong> Si tienes duda, llama al 106.
            </p>
          {/if}
        </div>

        <p class="swipe-hint" aria-hidden="true">Desliza o usa las flechas para cambiar de paso</p>
      </main>

      <footer class="guide-controls">
        <button
          type="button"
          class="control-button control-button--back"
          onclick={previous}
          disabled={safeIndex === 0}
        >
          <ArrowLeft size={21} strokeWidth={2} aria-hidden="true" />
          <span class="sr-only">Paso anterior</span>
        </button>
        <button type="button" class="control-next" onclick={next}>
          <span>{lastStep ? 'Terminar' : 'Siguiente'}</span>
          {#if lastStep}
            <Check size={20} strokeWidth={2.1} aria-hidden="true" />
          {:else}
            <ArrowRight size={20} strokeWidth={2.1} aria-hidden="true" />
          {/if}
        </button>
      </footer>
    </div>
  {/if}
</div>

<style>
  .guide-screen {
    overflow: hidden;
  }

  .guide-page {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    width: 100%;
    max-width: 760px;
    height: 100%;
    margin: 0 auto;
    padding: 0 var(--pad);
  }

  .guide-top {
    padding-top: calc(8px + var(--safe-top));
    border-bottom: 1px solid var(--hairline);
  }

  .guide-top__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 48px;
    margin-left: -7px;
    padding: 0 7px;
    font-size: 0.9375rem;
    font-weight: 650;
    color: var(--ink-soft);
    text-decoration: none;
  }

  .back:hover {
    color: var(--ink);
  }

  .guide-tools {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .tool {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 42px;
    padding: 0 9px;
    border-radius: 999px;
    color: var(--ink-soft);
    font-size: 0.875rem;
    font-weight: 650;
  }

  .tool:hover,
  .tool--active {
    background: var(--field);
    color: var(--ink);
  }

  .tool:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .tool--call {
    color: var(--danger-ink);
  }

  .guide-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0 12px;
    min-width: 0;
  }

  .guide-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 31px;
    height: 31px;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    flex: none;
    color: var(--ink-soft);
  }

  .guide-icon[data-level='4'],
  .guide-icon[data-level='3'] {
    border-color: color-mix(in srgb, var(--danger) 50%, transparent);
    color: var(--danger-ink);
  }

  .guide-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 650;
    font-size: 0.9375rem;
    color: var(--ink-soft);
  }

  .progress {
    height: 4px;
    margin: 0 calc(var(--pad) * -1);
    background: var(--field);
  }

  .progress__bar {
    display: block;
    height: 100%;
    background: var(--ink);
    transition: width 260ms var(--ease-out);
  }

  .step-stage {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 0;
    overflow-y: auto;
    padding: 14px 0 10px;
    touch-action: pan-y;
  }

  .step-card {
    width: 100%;
    padding: 8px 0;
  }

  .step-meta {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 14px;
  }

  .step-kind {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 9px;
    border: 1px solid var(--hairline-strong);
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 760;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  .step-kind[data-kind='dont'],
  .step-kind[data-kind='call'] {
    border-color: var(--danger);
    color: var(--danger-ink);
  }

  .step-kind[data-kind='do'] {
    border-color: var(--safe-ink);
    color: var(--safe-ink);
  }

  .step-count {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 600;
    letter-spacing: -0.04em;
    color: var(--ink-soft);
    font-variant-numeric: tabular-nums;
  }

  .step-count span {
    font-size: 0.875rem;
    color: var(--ink-mute);
    font-family: var(--font-body);
    letter-spacing: 0;
  }

  .step-title {
    margin-top: clamp(22px, 5vh, 44px);
    font-size: clamp(2.7rem, 12vw, 4.6rem);
    line-height: 0.97;
    letter-spacing: -0.06em;
    max-width: 14ch;
    text-wrap: balance;
  }

  .step-text {
    margin-top: clamp(16px, 3.5vh, 28px);
    max-width: 39ch;
    font-size: clamp(1.25rem, 5.3vw, 1.6rem);
    line-height: 1.38;
    color: var(--ink-soft);
    text-wrap: pretty;
  }

  .step-call {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 56px;
    margin-top: 24px;
    padding: 0 22px;
    border-radius: 999px;
    background: var(--danger);
    color: var(--paper);
    font-weight: 680;
    font-size: 1.0625rem;
    text-decoration: none;
  }

  .step-call:hover {
    background: var(--danger-ink);
  }

  .step-warning {
    margin-top: 22px;
    padding-top: 13px;
    border-top: 1px solid var(--hairline);
    font-size: 1rem;
    color: var(--danger-ink);
    max-width: 40ch;
  }

  .swipe-hint {
    margin-top: 20px;
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .guide-controls {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 10px;
    align-items: center;
    padding: 12px 0 calc(16px + var(--safe-bottom));
    border-top: 1px solid var(--hairline);
  }

  .control-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border: 1px solid var(--hairline-strong);
    border-radius: 50%;
    color: var(--ink);
  }

  .control-button:disabled {
    opacity: 0.32;
    cursor: not-allowed;
  }

  .control-next {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 56px;
    padding: 0 22px;
    border-radius: 999px;
    background: var(--ink);
    color: var(--paper);
    font-weight: 680;
    font-size: 1.0625rem;
    transition: transform 150ms ease, background-color 150ms ease;
  }

  .control-next:hover {
    background: #41240f;
  }

  .control-next:active {
    transform: scale(0.99);
  }

  .finish-screen {
    width: 100%;
    max-width: 660px;
    height: 100%;
    margin: 0 auto;
    padding: 0 var(--pad) calc(24px + var(--safe-bottom));
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .finish-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: calc(8px + var(--safe-top));
    min-height: 64px;
  }

  .finish-main {
    margin: auto 0;
    padding: 26px 0;
  }

  .finish-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 62px;
    height: 62px;
    margin-bottom: 20px;
    border-radius: 50%;
    background: var(--safe);
    color: var(--safe-ink);
  }

  .finish-main h1 {
    margin-top: 8px;
    font-size: clamp(2.2rem, 8vw, 3.4rem);
    letter-spacing: -0.055em;
    max-width: 18ch;
  }

  .finish-copy {
    margin-top: 15px;
    max-width: 42ch;
    color: var(--ink-soft);
    font-size: 1.0625rem;
    line-height: 1.5;
  }

  .finish-actions {
    display: grid;
    gap: 9px;
    margin-top: 24px;
    max-width: 340px;
  }

  .finish-call {
    background: var(--danger);
    color: var(--paper);
  }

  .disclaimer {
    margin-top: 22px;
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .guide-missing {
    max-width: 560px;
    margin: auto;
    padding: 32px var(--pad);
  }

  .guide-missing h1 {
    font-size: 2.4rem;
    letter-spacing: -0.05em;
  }

  .guide-missing p {
    margin-top: 12px;
    color: var(--ink-soft);
  }

  .guide-missing .btn {
    margin-top: 22px;
  }

  @media (min-width: 720px) {
    .step-stage {
      padding-top: 26px;
      padding-bottom: 26px;
    }

    .step-title {
      font-size: clamp(3.4rem, 7vw, 5rem);
    }

    .step-text {
      font-size: 1.5rem;
    }

    .guide-controls {
      grid-template-columns: 60px minmax(220px, 1fr);
      justify-content: end;
    }

    .control-next {
      justify-self: end;
      min-width: 280px;
    }

    .swipe-hint {
      display: none;
    }
  }

  @media (max-height: 700px) {
    .step-title {
      margin-top: 16px;
      font-size: clamp(2.25rem, 10vw, 3.3rem);
    }

    .step-text {
      margin-top: 14px;
      font-size: clamp(1.1rem, 4.8vw, 1.35rem);
    }

    .step-call {
      margin-top: 16px;
      min-height: 50px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .step-card {
      animation: none;
    }
  }
</style>

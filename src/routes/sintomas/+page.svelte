<script lang="ts">
  import { AlertTriangle, ChevronRight, PhoneCall } from '@lucide/svelte';
  import ConditionIcon from '$lib/components/ConditionIcon.svelte';
  import LocationHeader from '$lib/components/LocationHeader.svelte';
  import UrgencyLabel from '$lib/components/UrgencyLabel.svelte';
  import emergency from '$lib/content/emergency.json';
  import guides from '$lib/content/health-guides.json';

  $: conditions = [...guides.condiciones].sort(
    (a, b) => b.urgenciaNivel - a.urgenciaNivel
  );
</script>

<svelte:head>
  <title>Síntomas de Calor y Primeros Auxilios · RUPAQ</title>
  <meta
    name="description"
    content="Reconoce un golpe de calor, un desmayo, agotamiento, calambres o una erupción por calor. Guías clínicas paso a paso y sin conexión para Perú."
  />
  <meta property="og:title" content="Síntomas de Calor y Primeros Auxilios · RUPAQ" />
  <meta
    property="og:description"
    content="Guías médicas y primeros auxilios ante golpe de calor, desmayo o deshidratación en Perú. Gratis y disponible sin internet."
  />
  <meta property="og:url" content="https://rupaq.pe/sintomas" />
  <meta name="twitter:title" content="Síntomas de Calor y Primeros Auxilios · RUPAQ" />
  <meta
    name="twitter:description"
    content="Reconoce a tiempo un golpe de calor vs agotamiento y aprende cómo actuar en los primeros 10 minutos."
  />
</svelte:head>

<div class="screen symptoms-screen">
  <div class="page symptoms-page">
    <LocationHeader />

    <header class="symptoms-head">
      <p class="eyebrow">Calor y salud</p>
      <h1 class="page-title">¿Qué está pasando?</h1>
      <p class="page-intro">
        Primero descarta una emergencia. Después elige lo que ves. Cada guía te dice qué hacer, paso
        por paso, y funciona sin conexión.
      </p>
    </header>

    <section class="triage" aria-labelledby="triage-title">
      <div class="triage-mark" aria-hidden="true">
        <AlertTriangle size={25} strokeWidth={1.9} />
      </div>
      <div class="triage-body">
        <p class="eyebrow">Primero lo urgente</p>
        <h2 id="triage-title">{emergency.triage.pregunta}</h2>
        <p class="triage-help">{emergency.triage.ayuda}</p>
      </div>
      <div class="triage-actions">
        <a class="btn triage-yes" href="/emergencia">
          <PhoneCall size={19} strokeWidth={2} aria-hidden="true" />
          {emergency.triage.si}
        </a>
        <a class="btn btn--ghost" href="#condiciones">{emergency.triage.no}</a>
      </div>
      <p class="triage-note">Si tienes duda, llama. Es mejor una llamada de más.</p>
    </section>

    <section id="condiciones" class="conditions" aria-labelledby="conditions-title">
      <div class="conditions-head">
        <div>
          <p class="eyebrow">Guías paso a paso</p>
          <h2 id="conditions-title" class="section-title">Elige lo que reconoces</h2>
        </div>
        <p class="conditions-count">{conditions.length} guías</p>
      </div>

      <ol class="condition-list">
        {#each conditions as condition}
          <li>
            <a
              class="condition-row"
              href={`/sintomas/${condition.slug}`}
              aria-label={`${condition.titulo}. ${condition.resumen} Urgencia: ${condition.urgencia}.`}
            >
              <span class="condition-icon" data-level={condition.urgenciaNivel} aria-hidden="true">
                <ConditionIcon name={condition.icono} size={25} strokeWidth={1.7} />
              </span>
              <span class="condition-copy">
                <span class="condition-top">
                  <span class="condition-name">{condition.titulo}</span>
                  <UrgencyLabel label={condition.urgencia} level={condition.urgenciaNivel} />
                </span>
                <span class="condition-summary">{condition.resumen}</span>
              </span>
              <span class="condition-chev" aria-hidden="true">
                <ChevronRight size={19} strokeWidth={1.9} />
              </span>
            </a>
          </li>
        {/each}
      </ol>
    </section>

    <aside class="guide-note">
      <h2>Cómo usar las guías</h2>
      <p>
        Cada pantalla muestra una sola instrucción. Avanza con el botón grande, desliza o usa las
        flechas del teclado. Puedes escucharla en voz alta y volver a empezar cuando quieras.
      </p>
      <p class="disclaimer">{guides.aviso}</p>
    </aside>

    <div class="bottom-emergency">
      <div>
        <p class="eyebrow">Emergencia</p>
        <p>Confusión, desmayo o no responde: llama al 106.</p>
      </div>
      <a class="btn btn--dark" href="/emergencia">
        <PhoneCall size={18} strokeWidth={2} aria-hidden="true" />
        Emergencia
      </a>
    </div>
  </div>
</div>

<style>
  .symptoms-page {
    max-width: 920px;
    padding-bottom: 100px;
  }

  .symptoms-head {
    padding: 18px 0 22px;
    border-bottom: 1px solid var(--hairline);
  }

  .symptoms-head .page-intro {
    max-width: 48ch;
  }

  .triage {
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: 8px 12px;
    margin-top: 22px;
    padding: 18px;
    border: 1px solid var(--danger);
    border-radius: 16px;
    background: color-mix(in srgb, var(--danger) 6%, transparent);
  }

  .triage-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--danger);
    color: var(--paper);
  }

  .triage-body {
    min-width: 0;
  }

  .triage-body .eyebrow {
    color: var(--danger-ink);
  }

  .triage h2 {
    margin-top: 4px;
    font-size: clamp(1.5rem, 5.2vw, 1.9rem);
    line-height: 1.05;
    letter-spacing: -0.04em;
    max-width: 20ch;
  }

  .triage-help {
    margin-top: 8px;
    font-size: 0.9375rem;
    line-height: 1.43;
    color: var(--ink-soft);
  }

  .triage-actions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 10px;
  }

  .triage-yes {
    background: var(--danger);
    color: var(--paper);
  }

  .triage-yes:hover {
    background: var(--danger-ink);
  }

  .triage-note {
    grid-column: 1 / -1;
    margin-top: 4px;
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .conditions {
    padding-top: 30px;
  }

  .conditions-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 14px;
    padding-bottom: 8px;
  }

  .conditions-count {
    font-size: 0.875rem;
    color: var(--ink-mute);
    white-space: nowrap;
  }

  .condition-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--hairline);
  }

  .condition-row {
    display: grid;
    grid-template-columns: 44px 1fr 18px;
    align-items: center;
    gap: 12px;
    min-height: 82px;
    padding: 12px 0;
    border-bottom: 1px solid var(--hairline);
    text-decoration: none;
    color: var(--ink);
  }

  .condition-row:hover .condition-name {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .condition-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink-soft);
  }

  .condition-icon[data-level='4'] {
    color: var(--danger-ink);
    border-color: var(--danger);
  }

  .condition-icon[data-level='3'] {
    color: var(--precaution-ink);
    border-color: color-mix(in srgb, var(--precaution) 60%, transparent);
  }

  .condition-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .condition-top {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .condition-name {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: -0.032em;
    line-height: 1.1;
  }

  .condition-summary {
    color: var(--ink-soft);
    font-size: 0.9375rem;
    line-height: 1.38;
  }

  .condition-chev {
    color: var(--ink-mute);
    justify-self: end;
  }

  .guide-note {
    margin-top: 28px;
    padding: 18px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }

  .guide-note h2 {
    font-size: 1.3rem;
    letter-spacing: -0.035em;
  }

  .guide-note p {
    margin-top: 8px;
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.48;
    max-width: 58ch;
  }

  .guide-note .disclaimer {
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .bottom-emergency {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 22px;
  }

  .bottom-emergency p:last-child {
    margin-top: 4px;
    font-size: 0.9375rem;
    color: var(--ink-soft);
    max-width: 30ch;
  }

  .bottom-emergency .btn {
    flex: none;
  }

  @media (min-width: 620px) {
    .triage {
      grid-template-columns: 52px 1fr auto;
      padding: 22px;
    }

    .triage-mark {
      width: 48px;
      height: 48px;
    }

    .triage-actions {
      grid-column: 3;
      grid-row: 1 / 3;
      align-self: center;
      min-width: 200px;
      margin-top: 0;
    }

    .triage-note {
      grid-column: 2 / 3;
    }
  }

  @media (min-width: 860px) {
    .symptoms-page {
      padding-bottom: 48px;
    }

    .condition-name {
      font-size: 1.35rem;
    }

    .condition-row {
      grid-template-columns: 48px 1fr 20px;
      gap: 16px;
      min-height: 88px;
    }
  }
</style>

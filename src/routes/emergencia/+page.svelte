<script lang="ts">
  import { AlertTriangle, Check, PhoneCall, X } from '@lucide/svelte';
  import Logo from '$lib/components/Logo.svelte';
  import emergency from '$lib/content/emergency.json';

  const otherNumbers = emergency.emergencia.otros;
</script>

<svelte:head>
  <title>Emergencia por Golpe de Calor (SAMU 106) · RUPAQ</title>
  <meta
    name="description"
    content="Qué hacer ante un golpe de calor en Perú: llama al SAMU 106, enfría a la persona y vigila su respiración. Protocolo médico de urgencia sin conexión."
  />
  <meta property="og:title" content="Emergencia por Golpe de Calor (SAMU 106) · RUPAQ" />
  <meta
    property="og:description"
    content="Protocolo médico de urgencia y llamada directa al SAMU 106 y Bomberos 116 ante sospecha de golpe de calor en Perú."
  />
  <meta property="og:url" content="https://rupaq.pe/emergencia" />
  <meta name="twitter:title" content="Emergencia por Golpe de Calor (SAMU 106) · RUPAQ" />
</svelte:head>

<div class="screen emergency-screen">
  <div class="emergency-page">
    <header class="emergency-top">
      <a class="home-logo" href="/" aria-label="Volver al inicio de Rupaq">
        <Logo size={25} />
      </a>
      <a class="close" href="/" aria-label="Cerrar emergencia y volver al inicio">
        <X size={22} strokeWidth={2} aria-hidden="true" />
      </a>
    </header>

    <main class="emergency-main">
      <section class="call-block" aria-labelledby="call-title">
        <p class="eyebrow">Golpe de calor · emergencia</p>
        <h1 id="call-title">Llama ahora al 106</h1>
        <p class="call-copy">
          Si la persona confunde, se desmaya, convulsiona o no responde después del calor, no esperes.
        </p>
        <a class="call-button" href="tel:106" aria-label="Llamar al SAMU, número 106">
          <PhoneCall size={27} strokeWidth={2.1} aria-hidden="true" />
          <span>Llamar al 106</span>
        </a>
        <p class="call-meta">SAMU · Di la dirección exacta y tu distrito.</p>
      </section>

      <section class="steps" aria-labelledby="steps-title">
        <h2 id="steps-title" class="section-title">Mientras llega la ayuda</h2>
        <ol>
          {#each emergency.emergencia.pasos as step, index}
            <li>
              <span class="step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.titulo}</h3>
                <p>{step.texto}</p>
              </div>
            </li>
          {/each}
        </ol>
      </section>

      <section class="avoid" aria-labelledby="avoid-title">
        <div class="avoid-head">
          <AlertTriangle size={22} strokeWidth={1.9} aria-hidden="true" />
          <h2 id="avoid-title">No hagas esto</h2>
        </div>
        <ul>
          {#each emergency.emergencia.no_hacer as item}
            <li>
              <X size={18} strokeWidth={2} aria-hidden="true" />
              <span>{item}</span>
            </li>
          {/each}
        </ul>
      </section>

      <section class="other-numbers" aria-labelledby="other-title">
        <h2 id="other-title" class="section-title">Otros números</h2>
        <ul>
          {#each otherNumbers as item}
            <li>
              <a href={`tel:${item.numero}`} aria-label={`Llamar a ${item.label}, número ${item.numero}`}>
                <span class="other-label">
                  <span>{item.label}</span>
                  <span>{item.detalle}</span>
                </span>
                <span class="other-number">{item.numero}</span>
                <PhoneCall size={18} strokeWidth={1.9} aria-hidden="true" />
              </a>
            </li>
          {/each}
        </ul>
        <p class="note">{emergency.nota}</p>
      </section>

      <div class="after-call">
        <Check size={20} strokeWidth={2} aria-hidden="true" />
        <p>
          Si la persona mejora, igual avísale a un adulto responsable y no la dejes sola. Si vuelve a
          confundirse o se desmaya, llama otra vez.
        </p>
      </div>

      <a class="back-home" href="/">Volver a Rupaq</a>
    </main>
  </div>
</div>

<style>
  .emergency-page {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    padding: 0 var(--pad) calc(32px + var(--safe-bottom));
  }

  .emergency-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
    padding-top: var(--safe-top);
  }

  .home-logo {
    text-decoration: none;
    color: var(--ink);
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink);
    text-decoration: none;
  }

  .close:hover {
    background: var(--field);
  }

  .call-block {
    padding: 20px 0 26px;
    border-bottom: 1px solid var(--hairline);
  }

  .call-block .eyebrow {
    color: var(--danger-ink);
  }

  .call-block h1 {
    margin-top: 8px;
    font-size: clamp(2.55rem, 10vw, 4.1rem);
    letter-spacing: -0.06em;
    max-width: 12ch;
  }

  .call-copy {
    margin-top: 13px;
    max-width: 42ch;
    color: var(--ink-soft);
    font-size: 1.0625rem;
    line-height: 1.48;
  }

  .call-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    min-height: 64px;
    margin-top: 20px;
    padding: 0 24px;
    border-radius: 999px;
    background: var(--danger);
    color: var(--paper);
    font-family: var(--font-display);
    font-size: 1.45rem;
    font-weight: 660;
    letter-spacing: -0.03em;
    text-decoration: none;
    transition: transform 150ms ease, background-color 150ms ease;
  }

  .call-button:hover {
    background: var(--danger-ink);
  }

  .call-button:active {
    transform: scale(0.99);
  }

  .call-meta {
    margin-top: 9px;
    text-align: center;
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .steps {
    padding: 24px 0 8px;
  }

  .steps ol {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
  }

  .steps li {
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 10px;
    padding: 15px 0;
    border-top: 1px solid var(--hairline);
  }

  .steps li:last-child {
    border-bottom: 1px solid var(--hairline);
  }

  .step-number {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 640;
    color: var(--danger-ink);
    letter-spacing: -0.05em;
    line-height: 1.1;
  }

  .steps h3 {
    font-size: 1.25rem;
    letter-spacing: -0.035em;
  }

  .steps p {
    margin-top: 5px;
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.45;
  }

  .avoid {
    margin-top: 18px;
    padding: 18px;
    border: 1px solid var(--danger);
    border-radius: 14px;
    background: color-mix(in srgb, var(--danger) 7%, transparent);
  }

  .avoid-head {
    display: flex;
    align-items: center;
    gap: 9px;
    color: var(--danger-ink);
  }

  .avoid h2 {
    font-size: 1.35rem;
    letter-spacing: -0.035em;
  }

  .avoid ul {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: grid;
    gap: 9px;
  }

  .avoid li {
    display: flex;
    gap: 9px;
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.4;
  }

  .avoid li :global(svg) {
    flex: none;
    margin-top: 3px;
    color: var(--danger-ink);
  }

  .other-numbers {
    padding-top: 26px;
  }

  .other-numbers ul {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
  }

  .other-numbers li {
    border-top: 1px solid var(--hairline-soft);
  }

  .other-numbers li:last-child {
    border-bottom: 1px solid var(--hairline-soft);
  }

  .other-numbers a {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 58px;
    text-decoration: none;
    color: var(--ink);
  }

  .other-label {
    display: flex;
    flex: 1;
    flex-direction: column;
    line-height: 1.25;
  }

  .other-label span:first-child {
    font-weight: 650;
    font-size: 1rem;
  }

  .other-label span:last-child {
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .other-number {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }

  .other-numbers a :global(svg) {
    color: var(--ink-mute);
  }

  .note {
    margin-top: 12px;
    color: var(--ink-mute);
    font-size: 0.875rem;
    line-height: 1.45;
    max-width: 54ch;
  }

  .after-call {
    display: flex;
    gap: 10px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--hairline);
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.45;
  }

  .after-call :global(svg) {
    flex: none;
    margin-top: 2px;
    color: var(--safe-ink);
  }

  .back-home {
    display: inline-flex;
    align-items: center;
    min-height: 48px;
    margin-top: 15px;
    font-weight: 650;
    font-size: 0.9375rem;
    color: var(--ink-soft);
    text-decoration: none;
  }

  @media (min-width: 720px) {
    .emergency-page {
      padding-bottom: 56px;
    }

    .call-block h1 {
      font-size: 4.6rem;
    }

    .call-button {
      width: auto;
      min-width: 320px;
    }

    .call-meta {
      text-align: left;
    }

    .steps h3 {
      font-size: 1.4rem;
    }

    .steps p {
      font-size: 1.0625rem;
    }
  }
</style>

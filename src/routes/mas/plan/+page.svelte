<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Check, RotateCcw } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import plans from '$lib/content/plans.json';

  const STORAGE_KEY = 'rupaq.plan.v1';

  let active = plans.planes[0]?.slug ?? 'casa';
  let checked: Record<string, boolean> = {};
  let hydrated = false;

  $: plan = plans.planes.find((item) => item.slug === active) ?? plans.planes[0];
  $: done = plan ? plan.items.filter((_, index) => checked[`${plan.slug}:${index}`]).length : 0;
  $: total = plan?.items.length ?? 0;
  $: percent = total ? Math.round((done / total) * 100) : 0;

  onMount(() => {
    if (browser) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            checked = parsed as Record<string, boolean>;
          }
        }
      } catch {
        checked = {};
      }
    }
    hydrated = true;
  });

  function persist(): void {
    if (!browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // sin almacenamiento, la lista sigue funcionando en esta visita
    }
  }

  function toggle(key: string): void {
    checked = { ...checked, [key]: !checked[key] };
    persist();
  }

  function resetPlan(): void {
    if (!plan) return;
    const next = { ...checked };
    plan.items.forEach((_, index) => {
      delete next[`${plan.slug}:${index}`];
    });
    checked = next;
    persist();
  }
</script>

<svelte:head>
  <title>Plan de acción · Rupaq</title>
  <meta
    name="description"
    content="Listas de preparación para el calor extremo en casa, el colegio y el trabajo. Se guardan solo en tu dispositivo."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page plan-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Prepararte"
      title="Un plan antes del calor"
      intro="No necesitas hacerlo todo. Elige dónde estás y marca lo que ya tienes listo. La lista se guarda solo en este dispositivo."
    />

    <div class="plan-tabs" role="tablist" aria-label="Elegir plan">
      {#each plans.planes as item}
        <button
          type="button"
          role="tab"
          id={`tab-${item.slug}`}
          aria-selected={active === item.slug}
          aria-controls="plan-panel"
          class="plan-tab"
          class:plan-tab--active={active === item.slug}
          onclick={() => (active = item.slug)}
        >
          {item.titulo}
        </button>
      {/each}
    </div>

    {#if plan}
      <div
        id="plan-panel"
        role="tabpanel"
        tabindex="0"
        aria-labelledby={`tab-${plan.slug}`}
        class="plan-panel"
      >
        <header class="plan-head">
          <div>
            <h2>{plan.titulo}</h2>
            <p>{plan.intro}</p>
          </div>
          <div class="plan-progress" aria-live="polite">
            <span class="plan-progress__count">{done}<span> / {total}</span></span>
            <span class="plan-progress__label">listo</span>
          </div>
        </header>

        <div
          class="progress-track"
          role="progressbar"
          aria-label={`Progreso del plan ${plan.titulo}`}
          aria-valuemin="0"
          aria-valuemax={total}
          aria-valuenow={done}
        >
          <span style={`width:${percent}%`}></span>
        </div>

        <ul class="checklist">
          {#each plan.items as item, index}
            {@const key = `${plan.slug}:${index}`}
            <li>
              <label class="check-item" class:check-item--done={checked[key]}>
                <input
                  type="checkbox"
                  checked={!!checked[key]}
                  onchange={() => toggle(key)}
                />
                <span class="check-box" aria-hidden="true">
                  {#if checked[key]}<Check size={15} strokeWidth={2.6} />{/if}
                </span>
                <span class="check-label">{item}</span>
              </label>
            </li>
          {/each}
        </ul>

        <div class="plan-foot">
          <p>
            {#if hydrated}
              {#if done === total && total > 0}
                Plan completo. Revisa la lista otra vez cuando llegue un día de calor fuerte.
              {:else}
                Puedes volver cuando quieras. Tus marcas se quedan en este navegador.
              {/if}
            {:else}
              Cargando tus marcas guardadas…
            {/if}
          </p>
          <button type="button" class="reset" onclick={resetPlan} disabled={done === 0}>
            <RotateCcw size={16} strokeWidth={1.9} aria-hidden="true" />
            Reiniciar
          </button>
        </div>
      </div>
    {/if}

    <div class="reading-body">
      <section aria-labelledby="why-title">
        <h2 id="why-title">Por qué una lista corta funciona</h2>
        <p>
          En una emergencia es difícil recordar todo. Una lista visible y concreta, con agua, sombra,
          números y personas a revisar, reduce las decisiones bajo presión. Marca solo lo que ya está
          hecho: la lista no sirve si se convierte en otra tarea.
        </p>
      </section>
      <p class="disclaimer-box">
        Este plan es orientación general. En tu trabajo o colegio pueden existir protocolos propios.
        Sigue siempre las indicaciones de la autoridad sanitaria y de tu centro de salud.
      </p>
    </div>
  </div>
</div>

<style>
  .plan-page {
    max-width: 820px;
  }

  .plan-tabs {
    display: flex;
    gap: 6px;
    margin-top: 22px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }

  .plan-tabs::-webkit-scrollbar {
    display: none;
  }

  .plan-tab {
    min-height: 46px;
    padding: 0 16px;
    border: 1px solid var(--hairline);
    border-radius: 999px;
    color: var(--ink-soft);
    font-size: 0.9375rem;
    font-weight: 650;
    white-space: nowrap;
  }

  .plan-tab:hover {
    background: var(--field);
  }

  .plan-tab--active {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--paper);
  }

  .plan-panel {
    padding-top: 20px;
  }

  .plan-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .plan-head h2 {
    font-size: clamp(1.7rem, 4vw, 2.2rem);
    letter-spacing: -0.045em;
  }

  .plan-head p {
    margin-top: 6px;
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.45;
    max-width: 40ch;
  }

  .plan-progress {
    flex: none;
    text-align: right;
  }

  .plan-progress__count {
    display: block;
    font-family: var(--font-display);
    font-size: 2.3rem;
    font-weight: 640;
    line-height: 0.9;
    letter-spacing: -0.06em;
    font-variant-numeric: tabular-nums;
  }

  .plan-progress__count span {
    font-size: 1rem;
    color: var(--ink-mute);
    letter-spacing: 0;
  }

  .plan-progress__label {
    display: block;
    margin-top: 3px;
    font-size: 0.875rem;
    color: var(--ink-mute);
  }

  .progress-track {
    height: 5px;
    margin-top: 16px;
    background: var(--field-strong);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-track span {
    display: block;
    height: 100%;
    background: var(--ink);
    transition: width 220ms var(--ease-out);
  }

  .checklist {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
    border-top: 1px solid var(--hairline);
  }

  .check-item {
    display: grid;
    grid-template-columns: 24px 1fr;
    gap: 11px;
    align-items: start;
    min-height: 60px;
    padding: 14px 0;
    border-bottom: 1px solid var(--hairline);
    cursor: pointer;
  }

  .check-item input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .check-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-top: 1px;
    border: 1.5px solid var(--hairline-strong);
    border-radius: 6px;
    color: var(--paper);
  }

  .check-item input:focus-visible + .check-box {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  .check-item--done .check-box {
    background: var(--ink);
    border-color: var(--ink);
  }

  .check-label {
    color: var(--ink-soft);
    font-size: 1.0625rem;
    line-height: 1.45;
    transition: color 150ms ease;
  }

  .check-item--done .check-label {
    color: var(--ink-mute);
    text-decoration: line-through;
    text-decoration-color: var(--hairline-strong);
  }

  .plan-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 14px;
    flex-wrap: wrap;
  }

  .plan-foot p {
    color: var(--ink-mute);
    font-size: 0.9375rem;
    line-height: 1.4;
    max-width: 48ch;
  }

  .reset {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 42px;
    padding: 0 12px;
    border-radius: 999px;
    color: var(--ink-soft);
    font-size: 0.875rem;
    font-weight: 650;
  }

  .reset:hover:not(:disabled) {
    background: var(--field);
  }

  .reset:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  @media (min-width: 700px) {
    .check-item {
      grid-template-columns: 26px 1fr;
      align-items: center;
      padding: 15px 0;
    }

    .check-box {
      margin-top: 0;
    }
  }
</style>

<script lang="ts">
  import { Bell, ChevronRight, ExternalLink } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import { forecast } from '$lib/stores/forecast';
  import { selectedLocation } from '$lib/stores/location';

  $: alerts = $forecast?.alerts ?? [];
</script>

<svelte:head>
  <title>Alertas de calor · Rupaq</title>
  <meta
    name="description"
    content="El plan de alertas de Rupaq para avisos de calor por distrito. Fase 2, con consentimiento explícito y sin inventar alertas."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page alerts-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Próxima etapa"
      title="Alertas que no gritan de más"
      intro="Rupaq todavía no envía notificaciones. Esta página explica cómo funcionarán y qué puedes usar hoy."
    />

    <div class="reading-body">
      <section aria-labelledby="status-title">
        <div class="section-label">
          <h2 id="status-title">Estado ahora</h2>
          <span class="status-pill"><span aria-hidden="true"></span> Fase 2</span>
        </div>

        {#if alerts.length}
          <ul class="alert-list">
            {#each alerts as alert}
              <li>
                <p class="alert-level">{alert.nivel} · {alert.fuente}</p>
                <h3>{alert.titulo}</h3>
                <p>{alert.resumen}</p>
                {#if alert.url}
                  <a class="alert-link" href={alert.url} target="_blank" rel="noopener noreferrer">
                    Ver aviso oficial
                    <ExternalLink size={15} strokeWidth={1.9} aria-hidden="true" />
                  </a>
                {/if}
              </li>
            {/each}
          </ul>
        {:else}
          <div class="no-alert">
            <span class="no-alert__icon" aria-hidden="true"><Bell size={24} strokeWidth={1.7} /></span>
            <div>
              <h3>No hay avisos oficiales cargados</h3>
              <p>
                No mostramos alertas inventadas. Para {$selectedLocation.distrito}, revisa siempre los
                avisos vigentes de SENAMHI y las indicaciones de tu centro de salud.
              </p>
              <a
                class="btn btn--ghost"
                href="https://www.senamhi.gob.pe"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir SENAMHI
                <ExternalLink size={16} strokeWidth={1.9} aria-hidden="true" />
              </a>
            </div>
          </div>
        {/if}
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title">Cómo funcionarán</h2>
        <ol>
          <li>
            <strong>Permiso explícito.</strong> Solo si tocas “Activar alertas” y aceptas el permiso del
            navegador. Nada de notificaciones silenciosas.
          </li>
          <li>
            <strong>Por distrito, no por persona.</strong> Se activan con el pronóstico de la zona que
            elegiste y el umbral de tu perfil.
          </li>
          <li>
            <strong>Pocas y útiles.</strong> Un aviso cuando el calor sube a un nivel que exige acción,
            no un mensaje diario para recordarte que existe la app.
          </li>
          <li>
            <strong>Se pueden apagar.</strong> En cualquier momento desde la app o los ajustes del
            sistema, sin perder el resto de funciones.
          </li>
        </ol>
      </section>

      <section aria-labelledby="today-title">
        <h2 id="today-title">Lo que sí puedes hacer hoy</h2>
        <p>
          Consulta <a href="/">el calor de hoy</a> cada mañana, revisa
          <a href="/dias">los próximos siete días</a> y activa el perfil que corresponda a tu casa. Si
          hay una persona mayor o un niño cerca, acuerda quién la revisa.
        </p>
        <a class="text-link" href="/mas/perfil">
          Ajustar mi perfil de riesgo
          <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      </section>

      <section aria-labelledby="no-title">
        <h2 id="no-title">Lo que no haremos</h2>
        <ul>
          <li>Inventar una alerta de SENAMHI o presentar como oficial un dato que no lo es.</li>
          <li>Enviar notificaciones sin tu permiso o vender tu ubicación.</li>
          <li>Usar el miedo para que abras la app todos los días.</li>
        </ul>
      </section>

      <p class="source-note">
        El adaptador de avisos de Rupaq está preparado para leer un feed autorizado de SENAMHI cuando
        exista. Mientras no haya uno configurado, la lista permanece vacía a propósito.
      </p>
    </div>
  </div>
</div>

<style>
  .alerts-page {
    max-width: 820px;
  }

  .section-label h2 {
    margin: 0;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border: 1px solid var(--hairline-strong);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 740;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--ink-soft);
  }

  .status-pill span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--attention);
  }

  .no-alert {
    display: flex;
    gap: 14px;
    margin-top: 16px;
    padding: 18px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }

  .no-alert__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    flex: none;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink-soft);
  }

  .no-alert h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  .no-alert p {
    margin-top: 7px;
    max-width: 50ch;
  }

  .no-alert .btn {
    margin-top: 13px;
  }

  .alert-list {
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
  }

  .alert-list li {
    padding: 16px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }

  .alert-level {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 720;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--danger-ink);
  }

  .alert-list h3 {
    margin-top: 5px;
  }

  .alert-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 40px;
    margin-top: 7px;
    font-size: 0.9375rem;
    font-weight: 650;
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
</style>

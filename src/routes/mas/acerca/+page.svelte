<script lang="ts">
  import { browser } from '$app/environment';
  import { BookOpen, ChevronRight, Send, Share2 } from '@lucide/svelte';
  import Logo from '$lib/components/Logo.svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import sources from '$lib/content/sources.json';

  let shareMessage = '';

  async function share(): Promise<void> {
    if (!browser) return;
    const payload = {
      title: 'Rupaq · Calor y salud',
      text: 'Qué hacer hoy frente al calor extremo en tu distrito.',
      url: window.location.origin
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(payload.url);
        shareMessage = 'Enlace copiado. Gracias por compartir.';
      }
    } catch {
      shareMessage = 'No se pudo compartir desde este navegador.';
    }
  }
</script>

<svelte:head>
  <title>Acerca de Rupaq · Rupaq</title>
  <meta
    name="description"
    content="Rupaq es una app gratuita de calor y salud para Perú, hecha por Green Owl Labs. Sin registro, con datos abiertos y guías sin conexión."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page about-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Green Owl Labs"
      title="Una app para decidir rápido"
      intro="Rupaq existe para que cualquier persona en Perú pueda saber, en segundos, cuánto calor va a sentir y qué hacer al respecto."
    />

    <div class="about-mark">
      <Logo size={56} variant="mark" />
      <div>
        <p class="about-name">RUPAQ</p>
        <p class="about-tag">Calor y salud · Perú · Versión 1.0</p>
      </div>
    </div>

    <div class="reading-body">
      <section aria-labelledby="why-title">
        <h2 id="why-title">Por qué la hicimos</h2>
        <p>
          El calor extremo no llega con un solo número. Depende de la humedad, de la zona del país, de si
          la noche enfría y de quién está en casa. La información suele estar dispersa o escrita para
          expertos.
        </p>
        <p>
          Rupaq traduce el pronóstico en una decisión concreta: <strong>qué hacer hoy</strong>. Sin
          cuentas, sin publicidad y sin pedirte más datos de los necesarios.
        </p>
      </section>

      <section aria-labelledby="principles-title">
        <h2 id="principles-title">Lo que nos guía</h2>
        <ul>
          <li><strong>Claridad antes que adornos.</strong> Una acción grande, legible y sin ambigüedad.</li>
          <li><strong>Honestidad sobre los datos.</strong> Si el pronóstico está viejo, lo decimos. Si no hay aviso oficial, no lo inventamos.</li>
          <li><strong>Privacidad por defecto.</strong> Perfil y lugares se quedan en tu dispositivo.</li>
          <li><strong>Accesible de verdad.</strong> Letra grande, contraste, lectura en voz alta y guías que funcionan sin conexión.</li>
          <li><strong>Salud con revisión.</strong> El contenido se basa en fuentes públicas y está siendo revisado por profesionales.</li>
        </ul>
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title">Cómo está hecha</h2>
        <p>
          Rupaq es una aplicación web instalable construida con SvelteKit. Consulta el pronóstico
          horario de Open-Meteo y usa el ubigeo distrital del INEI/RENIEC para ubicar los 1,874 distritos
          del país. El índice de calor se calcula con la regresión de Rothfusz y ajustes para humedad.
        </p>
        <p>
          No usamos Google Fonts en tiempo de ejecución, ni cookies de publicidad, ni rastreadores de
          terceros. Las fuentes se sirven desde la misma app y las guías se guardan para uso sin
          conexión.
        </p>
        <a class="text-link" href="/mas/fuentes">
          Ver todas las fuentes
          <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      </section>

      <section aria-labelledby="review-title">
        <h2 id="review-title">Contenido de salud</h2>
        <div class="review-box">
          <span class="review-icon" aria-hidden="true"><BookOpen size={21} strokeWidth={1.8} /></span>
          <div>
            <p class="review-status">{sources.revisado_por}</p>
            <p>
              Fecha de esta versión: {sources.fecha_revision}. Mientras termina la revisión, el contenido
              es orientación general basada en MINSA, OPS y OMS. No diagnostica ni reemplaza una consulta
              médica.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="feedback-title">
        <h2 id="feedback-title">Habla con nosotros</h2>
        <p>
          Si algo no se entiende, si un dato está mal o si quieres llevar Rupaq a tu comunidad,
          escríbenos. Leemos los mensajes y priorizamos los problemas de salud y accesibilidad.
        </p>
        <p>
          <a
            class="contact-button"
            href="https://t.me/buhonegro4000"
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir contacto en Telegram"
          >
            <Send size={18} strokeWidth={2} aria-hidden="true" />
            Contactar por Telegram
          </a>
        </p>
        <div class="share-row">
          <button type="button" class="btn btn--ghost" onclick={share}>
            <Share2 size={18} strokeWidth={1.9} aria-hidden="true" />
            Compartir RUPAQ
          </button>
          {#if shareMessage}<p class="share-message" role="status">{shareMessage}</p>{/if}
        </div>
      </section>

      <section aria-labelledby="legal-title">
        <h2 id="legal-title">En corto</h2>
        <ul>
          <li>Gratis y sin registro.</li>
          <li>Sin cookies de publicidad ni rastreadores.</li>
          <li>La ubicación se usa solo para elegir el distrito.</li>
          <li>Los datos de salud y lugares quedan en tu navegador.</li>
          <li>Ante una emergencia, llama al 106.</li>
        </ul>
        <a class="text-link" href="/mas/privacidad">
          Leer la política de privacidad
          <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      </section>

      <div class="gowl-footer-card">
        <img
          src="/green-owl-labs-logo-transparent.png"
          alt="Green Owl Labs"
          class="gowl-footer-logo"
          width="72"
          height="72"
        />
        <div>
          <h3>Iniciativa de Green Owl Labs</h3>
          <p>
            Laboratorio de innovación tecnológica comprometido con el diseño de herramientas cívicas,
            salud ambiental y resiliencia climática para el Perú.
          </p>
        </div>
      </div>

      <p class="source-note">
        Hecha en Perú por Green Owl Labs. Rupaq no es un servicio oficial del Estado peruano ni de
        SENAMHI. Los avisos oficiales se consultan en sus canales.
      </p>
    </div>
  </div>
</div>

<style>
  .about-page {
    max-width: 820px;
  }

  .about-mark {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
    padding: 15px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }

  .about-name {
    margin: 0;
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 680;
    letter-spacing: -0.055em;
    line-height: 1;
  }

  .about-tag {
    margin-top: 4px;
    color: var(--ink-mute);
    font-size: 0.875rem;
  }

  .gowl-footer-card {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-top: 32px;
    padding: 20px;
    border-radius: 18px;
    background: color-mix(in srgb, var(--paper-high) 70%, transparent);
    border: 1px solid var(--hairline);
  }

  .gowl-footer-card h3 {
    font-size: 1.0625rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: var(--ink);
    letter-spacing: -0.02em;
  }

  .gowl-footer-card p {
    font-size: 0.875rem;
    color: var(--ink-soft);
    margin: 0;
    line-height: 1.4;
  }

  .gowl-footer-logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    flex-shrink: 0;
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

  .review-box {
    display: flex;
    gap: 12px;
    margin-top: 14px;
    padding: 16px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }

  .review-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    flex: none;
    border: 1px solid var(--hairline);
    border-radius: 50%;
    color: var(--ink-soft);
  }

  .review-status {
    margin: 0 !important;
    color: var(--ink) !important;
    font-weight: 650;
    font-size: 1rem !important;
  }

  .review-box p:last-child {
    margin-top: 5px;
    font-size: 0.9375rem;
  }

  .contact-button {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 46px;
    padding: 0 18px;
    border: 1px solid var(--hairline-strong);
    border-radius: 999px;
    background: var(--ink);
    color: var(--paper);
    font-weight: 700;
    text-decoration: none;
  }

  .contact-button:hover {
    opacity: 0.88;
  }

  .contact-button:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  .share-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
    flex-wrap: wrap;
  }

  .share-message {
    margin: 0 !important;
    font-size: 0.875rem !important;
    color: var(--safe-ink) !important;
  }
</style>

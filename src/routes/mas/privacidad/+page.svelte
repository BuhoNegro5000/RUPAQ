<script lang="ts">
  import { browser } from '$app/environment';
  import { Trash2 } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';

  let cleared = false;

  function clearLocalData(): void {
    if (!browser) return;
    const confirmed = window.confirm(
      'Se borrarán tu distrito, perfil, lugares guardados, listas y la última predicción en este navegador. ¿Continuar?'
    );
    if (!confirmed) return;
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('rupaq.'))
        .forEach((key) => localStorage.removeItem(key));
      cleared = true;
      window.setTimeout(() => window.location.assign('/'), 700);
    } catch {
      cleared = false;
    }
  }
</script>

<svelte:head>
  <title>Privacidad · Rupaq</title>
  <meta
    name="description"
    content="Política de privacidad de Rupaq: qué datos se guardan en tu dispositivo, qué se envía a la API y cómo borrar todo."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page privacy-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Privacidad"
      title="Tus datos se quedan contigo"
      intro="Rupaq no tiene cuentas, no vende datos y no usa rastreadores de publicidad. Esta página explica exactamente qué pasa con tu información."
    />

    <div class="reading-body">
      <section aria-labelledby="summary-title">
        <h2 id="summary-title">En una frase</h2>
        <p>
          Para mostrarte el calor, enviamos el <strong>código de ubigeo del distrito</strong> a nuestra
          API. Todo lo demás —perfil, lugares, listas y preferencias— se guarda en el almacenamiento
          local de tu navegador.
        </p>
        <div class="callout">
          <span class="callout__label">Lo esencial</span>
          <p>
            No pedimos nombre, correo, teléfono ni fecha de nacimiento. No hay login. No usamos cookies de
            publicidad ni píxeles de redes sociales.
          </p>
        </div>
      </section>

      <section aria-labelledby="data-title">
        <h2 id="data-title">Qué datos se usan</h2>
        <h3>Para el pronóstico</h3>
        <ul>
          <li><strong>Distrito elegido:</strong> su código de ubigeo se envía a <code>/api/forecast</code>.</li>
          <li><strong>Coordenadas del distrito:</strong> el servidor las usa para consultar Open-Meteo. No son tu ubicación exacta.</li>
          <li><strong>Datos técnicos:</strong> el proveedor de hosting puede procesar registros básicos como la dirección IP por seguridad y funcionamiento. No los usamos para perfilarte.</li>
        </ul>

        <h3>En tu dispositivo</h3>
        <ul>
          <li>El distrito seleccionado y hasta tres lugares guardados.</li>
          <li>Los perfiles de riesgo que marques.</li>
          <li>Preferencias de letra, contraste, modo simple y lectura en voz alta.</li>
          <li>Las marcas de tus listas de preparación.</li>
          <li>La última predicción y el contenido de las guías para uso sin conexión.</li>
        </ul>
      </section>

      <section aria-labelledby="geo-title">
        <h2 id="geo-title">Ubicación</h2>
        <p>
          La geolocalización es <strong>opcional</strong> y solo se activa si tocas el botón. El navegador
          te pide permiso primero. Si aceptas, tu dispositivo compara tu posición con la lista de
          distritos y elige el más cercano.
        </p>
        <p>
          Las coordenadas exactas no se envían a nuestra API: solo se envía el ubigeo del distrito
          resultante. Puedes negar el permiso y elegir el distrito a mano; la app funciona igual.
        </p>
      </section>

      <section aria-labelledby="cookies-title">
        <h2 id="cookies-title">Cookies y almacenamiento</h2>
        <p>
          No usamos cookies de analítica, publicidad ni seguimiento. Usamos <strong>localStorage</strong>
          porque es necesario para recordar tus preferencias y tus listas. No es una cookie y no viaja
          con cada petición.
        </p>
        <p>
          Si borras los datos del sitio desde tu navegador, se elimina todo lo guardado por Rupaq. También
          puedes hacerlo desde el botón al final de esta página.
        </p>
      </section>

      <section aria-labelledby="law-title">
        <h2 id="law-title">Ley 29733 y tus derechos</h2>
        <p>
          Rupaq se diseña siguiendo los principios de la Ley de Protección de Datos Personales del Perú
          (Ley 29733): finalidad determinada, minimización, consentimiento y seguridad. Como no hay
          cuentas ni base de datos de usuarios, la mayor parte del tratamiento ocurre solo en tu
          dispositivo.
        </p>
        <p>
          Puedes acceder, corregir o borrar tus datos locales en cualquier momento. Para consultas de
          privacidad, escríbenos a
          <a href="mailto:hola@greenowllabs.pe">hola@greenowllabs.pe</a>.
        </p>
      </section>

      <section aria-labelledby="third-title">
        <h2 id="third-title">Servicios de terceros</h2>
        <ul>
          <li><strong>Open-Meteo:</strong> recibe las coordenadas del centro del distrito para devolver el pronóstico.</li>
          <li><strong>Hosting y CDN:</strong> sirven la app y pueden procesar registros técnicos de la solicitud.</li>
          <li><strong>No usamos</strong> Google Analytics, Meta Pixel, Hotjar ni redes de publicidad.</li>
        </ul>
        <p>
          Las fuentes también están listadas en <a href="/mas/fuentes">Fuentes y método</a>.
        </p>
      </section>

      <section aria-labelledby="health-title">
        <h2 id="health-title">Aviso de salud</h2>
        <p>
          Rupaq es orientación general y educativa. No diagnostica, no receta y no reemplaza la atención
          de un profesional de salud. Si tienes una emergencia, llama al <strong>106</strong> o acude al
          establecimiento de salud más cercano.
        </p>
      </section>

      <section aria-labelledby="changes-title">
        <h2 id="changes-title">Cambios y contacto</h2>
        <p>
          Si esta política cambia, actualizaremos la fecha de versión y lo explicaremos aquí. No
          cambiaremos el uso de datos de forma retroactiva sin avisar.
        </p>
        <p class="version">Versión 1.0 · Actualizada el 5 de noviembre de 2026.</p>
        <p>
          Responsable: Green Owl Labs · <a href="mailto:hola@greenowllabs.pe">hola@greenowllabs.pe</a>
        </p>
      </section>

      <section aria-labelledby="delete-title">
        <h2 id="delete-title">Borrar mis datos locales</h2>
        <p>
          Esta acción elimina el distrito, el perfil, los lugares, las listas y la predicción guardada en
          este navegador. No se puede deshacer.
        </p>
        <button type="button" class="delete-button" onclick={clearLocalData}>
          <Trash2 size={18} strokeWidth={1.9} aria-hidden="true" />
          Borrar datos de Rupaq en este dispositivo
        </button>
        {#if cleared}
          <p class="cleared" role="status">Datos borrados. Volviendo al inicio…</p>
        {/if}
      </section>
    </div>
  </div>
</div>

<style>
  .privacy-page {
    max-width: 820px;
  }

  code {
    padding: 1px 4px;
    border-radius: 3px;
    background: var(--field);
    font-size: 0.9em;
  }

  .version {
    color: var(--ink-mute) !important;
    font-size: 0.875rem !important;
  }

  .delete-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 46px;
    margin-top: 14px;
    padding: 0 15px;
    border: 1px solid var(--danger);
    border-radius: 999px;
    color: var(--danger-ink);
    font-size: 0.9375rem;
    font-weight: 650;
  }

  .delete-button:hover {
    background: color-mix(in srgb, var(--danger) 8%, transparent);
  }

  .cleared {
    margin-top: 10px;
    color: var(--safe-ink) !important;
    font-weight: 600;
  }
</style>

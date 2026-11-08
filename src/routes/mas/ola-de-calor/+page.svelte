<script lang="ts">
  import { ChevronRight } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import { forecast } from '$lib/stores/forecast';
  import { selectedLocation } from '$lib/stores/location';
  import { formatNumber, longDate } from '$lib/utils/format';

  $: hottestNight = $forecast?.daily.reduce(
    (best, day) => (!best || day.nightMin > best.nightMin ? day : best),
    $forecast?.daily[0]
  );
</script>

<svelte:head>
  <title>Ola de calor y noches · Rupaq</title>
  <meta
    name="description"
    content="Qué es una ola de calor, por qué la temperatura nocturna importa y cómo proteger la salud cuando el calor no baja en Perú."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Entender el calor"
      title="El calor también de noche"
      intro="Una ola de calor no se mide solo por la tarde más calurosa. Cuando la temperatura no baja de noche, el cuerpo no alcanza a recuperarse."
    />

    <div class="reading-body">
      <section aria-labelledby="what-title">
        <h2 id="what-title">¿Qué es una ola de calor?</h2>
        <p>
          Es un período de calor anormalmente intenso y prolongado para un lugar. No hay un número
          único para todo el Perú: <strong>Iquitos, Piura, Lima y Puno no viven el mismo calor</strong>.
          Por eso Rupaq usa umbrales distintos según la zona climática y la altitud del distrito.
        </p>
        <p>
          Lo que importa no es solo la temperatura del aire. La humedad cambia cuánto puede enfriarse
          el cuerpo por el sudor. Por eso mostramos la <strong>sensación térmica</strong>, calculada con
          el índice de calor.
        </p>
      </section>

      <section aria-labelledby="night-title">
        <h2 id="night-title">La noche es parte de la emergencia</h2>
        <p>
          Durante el día el cuerpo acumula calor. Si la noche sigue caliente, no tiene un descanso para
          recuperarse. El sueño se corta, la deshidratación avanza y el corazón trabaja más.
        </p>
        <div class="callout">
          <span class="callout__label">Una señal importante</span>
          <p>
            Si la mínima nocturna no baja de <strong>24 °C</strong>, el descanso se vuelve difícil,
            sobre todo para personas mayores, embarazadas y quienes tienen enfermedades del corazón o
            los riñones.
          </p>
        </div>
        {#if hottestNight}
          <div class="pull-stat">
            <span class="pull-stat__number">{formatNumber(hottestNight.nightMin)}°</span>
            <p class="pull-stat__copy">
              es la noche más caliente de los próximos días en {$selectedLocation.distrito}, según el
              pronóstico actual. {#if hottestNight.nightMin >= 24}Esa noche el cuerpo no enfría bien.{/if}
            </p>
          </div>
          <p class="meta">
            <a href={`/dias/${hottestNight.date}`}>{longDate(hottestNight.date)}</a>
            · <a href="/dias">ver los siete días</a>
          </p>
        {/if}
      </section>

      <section aria-labelledby="body-title">
        <h2 id="body-title">Qué le pasa al cuerpo</h2>
        <p>
          Para enfriarse, el cuerpo manda más sangre a la piel y suda. Eso funciona hasta que se pierde
          demasiada agua. Entonces aparecen el cansancio, el mareo, el dolor de cabeza y los calambres.
        </p>
        <p>
          En casos graves el sistema de enfriamiento falla: la piel puede estar muy caliente, la persona
          confunde, convulsiona o se desmaya. Eso es un <strong>golpe de calor</strong> y es una
          emergencia.
        </p>
      </section>

      <section aria-labelledby="risk-title">
        <h2 id="risk-title">Quién está en más riesgo</h2>
        <ul>
          <li><strong>Niños y niñas pequeños:</strong> se calientan más rápido y dependen de un adulto para beber agua.</li>
          <li><strong>Personas mayores de 60 años:</strong> sienten menos sed y pueden no notar que tienen calor.</li>
          <li><strong>Embarazadas:</strong> el cuerpo regula peor la temperatura y la deshidratación puede adelantar contracciones.</li>
          <li>
            <strong>Personas con enfermedad crónica o en tratamiento:</strong>
            hipertensión, diabetes, problemas del corazón o renales.
            <em>Atención especial:</em> medicamentos como diuréticos, betabloqueadores o pastillas para la presión/salud mental alteran la sudoración y aceleran la pérdida de líquidos. No suspendas tus dosis, consérvalas en lugar fresco (&lt; 25 °C) y consulta a tu médico.
          </li>
          <li><strong>Quienes trabajan al aire libre:</strong> obra, chacra, reparto, mercados y calle. Necesitan reponer agua y sales minerales para no sufrir calambres severos.</li>
          <li><strong>Personas que viven solas o sin acceso a agua segura de red.</strong></li>
        </ul>
        <p>
          Si cuidas a alguien de estos grupos, revisa cómo está cada dos horas en los días de calor fuerte.
        </p>
      </section>

      <section aria-labelledby="act-title">
        <h2 id="act-title">Qué ayuda de verdad</h2>
        <ol>
          <li>Tomar agua antes de tener sed. Para la mayoría, sorbos cada 20 a 30 minutos.</li>
          <li>Bajar el ritmo entre las 11 y las 4, cuando el sol aprieta más.</li>
          <li>Buscar sombra o un lugar ventilado, y cerrar cortinas durante el día.</li>
          <li>Refrescar la piel con paños húmedos y ropa ligera.</li>
          <li>Revisar a quienes viven solos. Avisar y pedir ayuda sin esperar.</li>
        </ol>
        <p>
          No sirven las soluciones mágicas: el alcohol no hidrata y las bebidas muy azucaradas empeoran la sed.
          <strong>Cuidado con el ventilador:</strong> si la temperatura del aire supera los <strong>35 °C</strong>, el ventilador solo no enfría, sino que actúa como un horno empujando aire caliente sobre la piel. Debe acompañarse siempre de paños húmedos o rociador de agua fresca en cabeza, cuello y axilas.
        </p>
      </section>

      <section class="uv-section" aria-labelledby="uv-title">
        <p class="section-kicker">Riesgo ambiental</p>
        <h2 id="uv-title">Riesgos por exposición a radiación ultravioleta</h2>
        <p>
          La radiación ultravioleta (UV) es parte de la luz solar. No se ve ni se siente como el calor,
          pero puede dañar la piel y los ojos incluso cuando el cielo está nublado o corre viento.
          El <strong>índice UV</strong> indica la intensidad máxima prevista del día: cuanto más alto es,
          menos tiempo necesita la piel para lesionarse.
        </p>

        <div class="uv-callout" role="note">
          <span class="uv-callout__label">Idea clave</span>
          <p>
            El protector solar no enfría el cuerpo ni autoriza a permanecer más tiempo bajo el sol.
            La primera protección es reducir la exposición, buscar sombra y cubrir la piel.
          </p>
        </div>

        <h3>Cómo interpretar el índice UV</h3>
        <div class="uv-levels" role="list" aria-label="Niveles del índice ultravioleta">
          <div class="uv-level uv-level--low" role="listitem">
            <strong>0–2 · Bajo</strong>
            <span>Riesgo reducido para la mayoría. Usa protección si permanecerás al aire libre.</span>
          </div>
          <div class="uv-level uv-level--moderate" role="listitem">
            <strong>3–5 · Moderado</strong>
            <span>Busca sombra, usa sombrero, ropa que cubra la piel y protector solar.</span>
          </div>
          <div class="uv-level uv-level--high" role="listitem">
            <strong>6–7 · Alto</strong>
            <span>La piel desprotegida puede quemarse rápido. Evita el sol del mediodía.</span>
          </div>
          <div class="uv-level uv-level--very-high" role="listitem">
            <strong>8–10 · Muy alto</strong>
            <span>Limita la exposición entre las 10:00 y las 16:00 y refuerza todas las medidas.</span>
          </div>
          <div class="uv-level uv-level--extreme" role="listitem">
            <strong>11 o más · Extremadamente alto</strong>
            <span>Evita la exposición directa al mediodía. La sombra y la ropa son indispensables.</span>
          </div>
        </div>

        <h3>Qué daños puede causar</h3>
        <ul>
          <li><strong>A corto plazo:</strong> enrojecimiento, ardor, dolor, hinchazón y ampollas por quemadura solar.</li>
          <li><strong>En los ojos:</strong> irritación, lagrimeo y sensibilidad a la luz; la exposición acumulada favorece cataratas y otras lesiones.</li>
          <li><strong>A largo plazo:</strong> manchas, envejecimiento prematuro de la piel, daño del sistema inmunitario y mayor riesgo de cáncer de piel.</li>
          <li><strong>Con calor intenso:</strong> una quemadura solar dificulta que la piel regule la temperatura y puede agravar la deshidratación.</li>
        </ul>

        <h3>Protégete mejor</h3>
        <ol>
          <li>Planifica las actividades al aire libre fuera del mediodía y aprovecha la sombra; recuerda que la arena, el agua y superficies claras reflejan UV.</li>
          <li>Usa ropa ligera que cubra brazos y piernas, sombrero de ala ancha y lentes de sol con protección UV400 o 100% UV.</li>
          <li>Aplica protector de amplio espectro SPF 30 o superior 15 minutos antes de salir. Reaplica cada dos horas y después de sudar o mojarte.</li>
          <li>Protege también orejas, cuello, labios, manos, empeines y la parte superior de la cabeza si hay poco cabello.</li>
          <li>No uses camas solares. No existe un bronceado “seguro” ni la piel oscura elimina el riesgo de daño.</li>
        </ol>

        <div class="uv-alert" role="alert">
          <strong>Busca atención médica</strong>
          <p>
            Si hay ampollas extensas, dolor intenso, fiebre, escalofríos, confusión, desmayo o signos de
            deshidratación, aléjate del sol, enfría la piel con agua fresca sin hielo y busca atención.
            No revientes las ampollas ni apliques remedios caseros irritantes.
          </p>
        </div>

        <p class="meta">
          El índice UV cambia según la hora, la nubosidad, la altitud y la ubicación. Consulta el valor
          actual y el máximo del día en RUPAQ; para alertas oficiales, revisa SENAMHI.
        </p>
      </section>

      <nav aria-label="Siguientes pasos">
        <ul class="reading-links">
          <li>
            <a href="/mas/dengue-y-clima">Dengue, agua almacenada y datos CDC/MINSA <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/plan">Preparar un plan para tu casa <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/sintomas">Reconocer los síntomas paso a paso <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/fuentes">Ver fuentes y método de cálculo <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
        </ul>
      </nav>

      <p class="source-note">
        Referencias: OMS, OPS y MINSA sobre calor y salud. Rupaq adapta el mensaje al distrito y a la
        humedad, pero no reemplaza un aviso oficial de SENAMHI ni la evaluación de un profesional de salud.
      </p>
    </div>
  </div>
</div>

<style>
  .pull-stat {
    margin-top: 18px;
  }

  .section-kicker {
    margin-bottom: 8px;
    color: var(--accent, var(--ink-soft));
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .uv-callout,
  .uv-alert {
    margin: 22px 0;
    padding: 18px 20px;
    border-radius: 14px;
  }

  .uv-callout {
    background: color-mix(in srgb, var(--accent, #0f766e) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent, #0f766e) 35%, transparent);
  }

  .uv-alert {
    background: color-mix(in srgb, #dc2626 11%, transparent);
    border: 1px solid color-mix(in srgb, #dc2626 36%, transparent);
  }

  .uv-callout p,
  .uv-alert p {
    margin: 6px 0 0;
  }

  .uv-callout__label {
    color: var(--accent, var(--ink));
    font-size: 0.75rem;
    font-weight: 750;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .uv-levels {
    display: grid;
    gap: 10px;
    margin: 18px 0 26px;
  }

  .uv-level {
    display: grid;
    gap: 4px;
    padding: 13px 15px;
    border-left: 4px solid currentColor;
    border-radius: 10px;
    background: color-mix(in srgb, currentColor 9%, transparent);
  }

  .uv-level strong {
    color: currentColor;
    font-size: 0.95rem;
  }

  .uv-level span {
    color: var(--ink-soft);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .uv-level--low { color: #15803d; }
  .uv-level--moderate { color: #a16207; }
  .uv-level--high { color: #c2410c; }
  .uv-level--very-high { color: #dc2626; }
  .uv-level--extreme { color: #9f1239; }

  .uv-alert strong {
    color: #b91c1c;
  }

  @media (max-width: 640px) {
    .uv-callout,
    .uv-alert {
      padding: 16px;
    }
  }
</style>

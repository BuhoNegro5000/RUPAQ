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

      <section aria-labelledby="uv-title">
        <h2 id="uv-title">El sol también daña: radiación UV</h2>
        <p>
          En días de calor, la radiación ultravioleta puede quemar la piel y los ojos aunque haya nubes
          o viento. Conoce el índice UV de hoy, cómo protegerte y qué hacer si te quemaste.
        </p>
      </section>

      <nav aria-label="Siguientes pasos">
        <ul class="reading-links">
          <li>
            <a href="/mas/radiacion-uv">Riesgos por exposición a radiación ultravioleta <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
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
</style>

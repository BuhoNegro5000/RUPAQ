<script lang="ts">
  import { ChevronRight, Eye, ShieldCheck, Sun } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import { forecast } from '$lib/stores/forecast';
  import { selectedLocation } from '$lib/stores/location';
  import { formatNumber, uvCategory } from '$lib/utils/format';

  type UvLevel = {
    key: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';
    range: string;
    name: string;
    min: number;
    meaning: string;
    action: string;
  };

  const LEVELS: UvLevel[] = [
    {
      key: 'low',
      range: '0 a 2',
      name: 'Bajo',
      min: 0,
      meaning: 'Riesgo reducido para la mayoría de las personas.',
      action: 'No necesitas medidas especiales, salvo que tengas piel muy clara o pases horas al aire libre.'
    },
    {
      key: 'moderate',
      range: '3 a 5',
      name: 'Moderado',
      min: 3,
      meaning: 'La piel clara puede enrojecerse tras un rato al sol.',
      action: 'Busca sombra al mediodía, usa sombrero y lentes, y aplica protector si estarás afuera más de una hora.'
    },
    {
      key: 'high',
      range: '6 a 7',
      name: 'Alto',
      min: 6,
      meaning: 'La piel desprotegida puede quemarse en menos de 30 minutos.',
      action: 'Reduce el sol entre las 10:00 y las 16:00. Combina sombra, ropa que cubra, sombrero, lentes y protector.'
    },
    {
      key: 'very-high',
      range: '8 a 10',
      name: 'Muy alto',
      min: 8,
      meaning: 'El daño llega rápido: la piel clara puede quemarse en 15 a 25 minutos.',
      action: 'Evita la exposición directa entre las 10:00 y las 16:00. Refuerza todas las medidas y reaplica el protector.'
    },
    {
      key: 'extreme',
      range: '11 o más',
      name: 'Extremo',
      min: 11,
      meaning: 'La piel clara puede quemarse en 10 minutos o menos.',
      action: 'Quédate bajo techo o en sombra densa al mediodía. Si sales, cubre la piel, usa lentes y protector abundante.'
    }
  ];

  const SCALE_MAX = 14;

  function levelFor(value: number | null): UvLevel | null {
    if (value == null) return null;
    return [...LEVELS].reverse().find((level) => value >= level.min) ?? LEVELS[0];
  }

  function markerPosition(value: number | null): number {
    if (value == null) return 0;
    return Math.min(Math.max(value, 0), SCALE_MAX) / SCALE_MAX * 100;
  }

  $: uvNow = $forecast?.now.uv ?? null;
  $: uvPeak = $forecast?.daily[0]?.uvMax ?? null;
  $: reference = uvPeak ?? uvNow;
  $: activeLevel = levelFor(reference);
</script>

<svelte:head>
  <title>Radiación ultravioleta y tu piel · Rupaq</title>
  <meta
    name="description"
    content="Qué es el índice UV, cómo interpretarlo en Perú, qué daños causa en la piel y los ojos, quién tiene más riesgo y cómo protegerte paso a paso."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page uv-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Entender el calor"
      title="Radiación UV y tu piel"
      intro="El sol puede dañarte aunque no sientas calor. Aprende a leer el índice UV y a protegerte antes de que aparezca el daño."
    />

    <div class="reading-body">
      <section aria-labelledby="now-title" class="uv-now">
        <p class="eyebrow">En {$selectedLocation.distrito}</p>
        <h2 id="now-title">El índice UV de hoy</h2>

        {#if reference != null && activeLevel}
          <div class="uv-now__grid">
            <div class="uv-now__stat">
              <span class="uv-now__label">Máximo previsto hoy</span>
              <span class="uv-now__number tabular" data-level={activeLevel.key}>
                {formatNumber(reference)}
              </span>
              <span class="uv-now__tag">{activeLevel.name}</span>
            </div>
            <div class="uv-now__stat uv-now__stat--secondary">
              <span class="uv-now__label">Ahora mismo</span>
              <span class="uv-now__number uv-now__number--small tabular">
                {uvNow == null ? '—' : formatNumber(uvNow)}
              </span>
              <span class="uv-now__tag">{uvCategory(uvNow)}</span>
            </div>
          </div>

          <div class="uv-meter" aria-hidden="true">
            <div class="uv-meter__bar">
              <span class="seg seg--low" style="flex: 3"></span>
              <span class="seg seg--moderate" style="flex: 3"></span>
              <span class="seg seg--high" style="flex: 2"></span>
              <span class="seg seg--very-high" style="flex: 3"></span>
              <span class="seg seg--extreme" style="flex: 3"></span>
            </div>
            <span class="uv-meter__marker" style={`left: ${markerPosition(reference)}%`}></span>
            <div class="uv-meter__ticks">
              <span>0</span><span>3</span><span>6</span><span>8</span><span>11+</span>
            </div>
          </div>

          <p class="uv-now__advice"><strong>{activeLevel.meaning}</strong> {activeLevel.action}</p>
        {:else}
          <p>
            Todavía no tenemos el índice UV de hoy. Cuando el pronóstico cargue, aquí verás el valor
            máximo previsto y qué hacer según su nivel.
          </p>
        {/if}
        <p class="meta">
          El máximo del día suele ocurrir cerca del mediodía solar. Es el valor que debes usar para
          planificar tu jornada, no el de la hora en que consultas.
        </p>
      </section>

      <section aria-labelledby="what-title">
        <h2 id="what-title">Qué es la radiación ultravioleta</h2>
        <p>
          La radiación ultravioleta (UV) es una parte invisible de la luz del sol. No se siente como
          calor: puedes tener frío, viento o cielo nublado y aun así recibir una dosis alta.
          El <strong>índice UV</strong> resume su intensidad en un solo número: a mayor índice, menos
          tiempo necesita la piel y los ojos para lesionarse.
        </p>
        <p>
          Hay dos tipos que llegan al suelo. Los <strong>UVB</strong> queman la piel y son la causa
          principal del enrojecimiento. Los <strong>UVA</strong> penetran más hondo, envejecen la piel
          y contribuyen al cáncer de piel, incluso cuando no hay quemadura visible.
        </p>

        <div class="callout">
          <span class="callout__label">Idea clave</span>
          <p>
            El calor y la radiación UV no son lo mismo. Un día fresco y nublado en Lima puede tener un
            índice UV alto. Revisa siempre el índice, no la sensación de calor.
          </p>
        </div>
      </section>

      <section aria-labelledby="peru-title">
        <h2 id="peru-title">Por qué en Perú el UV es tan alto</h2>
        <ul>
          <li><strong>Cercanía a la línea ecuatorial:</strong> los rayos del sol llegan casi de frente, con menos atmósfera que atravesar.</li>
          <li><strong>Altitud:</strong> la radiación UV aumenta cerca de 10 a 12 % por cada 1000 metros de altura. En la sierra el índice suele ser aún mayor que en la costa.</li>
          <li><strong>Reflejo del entorno:</strong> arena, agua, nieve y cemento claro devuelven parte de la radiación y la suman a la que llega directo.</li>
          <li><strong>Nubes delgadas:</strong> pueden dejar pasar hasta 80 % de la radiación UV. La garúa o el cielo blanquecino no te protegen.</li>
          <li><strong>Verano y mediodía:</strong> el índice sube entre diciembre y marzo y alcanza su máximo entre las 11:00 y las 14:00.</li>
        </ul>
      </section>

      <section aria-labelledby="scale-title">
        <h2 id="scale-title">Cómo interpretar el índice UV</h2>
        <p>
          La escala es la misma que usan la OMS, la OPS y el SENAMHI. Cada nivel tiene un color y una
          recomendación de protección.
        </p>
        <ol class="uv-levels" aria-label="Niveles del índice ultravioleta">
          {#each LEVELS as level}
            <li class={`uv-level uv-level--${level.key}`} class:uv-level--active={activeLevel?.key === level.key}>
              <span class="uv-level__chip" aria-hidden="true"></span>
              <div class="uv-level__copy">
                <p class="uv-level__head">
                  <strong>{level.range} · {level.name}</strong>
                  {#if activeLevel?.key === level.key}<span class="uv-level__today">Hoy</span>{/if}
                </p>
                <p class="uv-level__meaning">{level.meaning}</p>
                <p class="uv-level__action">{level.action}</p>
              </div>
            </li>
          {/each}
        </ol>
        <p class="meta">
          Los tiempos de quemadura son referenciales para piel clara sin protección. Varían según el
          tipo de piel, la altitud y la hora.
        </p>
      </section>

      <section aria-labelledby="harm-title">
        <h2 id="harm-title">Qué daños puede causar</h2>
        <div class="harm-grid">
          <article class="harm-card">
            <h3>Piel, a corto plazo</h3>
            <ul>
              <li>Enrojecimiento y ardor que aparecen entre 4 y 8 horas después y alcanzan su pico a las 24 horas.</li>
              <li>Dolor al tacto, hinchazón y ampollas en quemaduras más profundas.</li>
              <li>Descamación de la piel a los pocos días.</li>
              <li>Fiebre, escalofríos y náuseas si la quemadura es extensa.</li>
            </ul>
          </article>
          <article class="harm-card">
            <h3>Piel, a largo plazo</h3>
            <ul>
              <li>Manchas, arrugas tempranas y piel áspera: fotoenvejecimiento.</li>
              <li>Lesiones precancerosas como la queratosis actínica.</li>
              <li>Cáncer de piel: carcinoma basocelular, espinocelular y melanoma, el más agresivo.</li>
              <li>Cada quemadura solar, sobre todo en la infancia, suma al riesgo de toda la vida.</li>
            </ul>
          </article>
          <article class="harm-card">
            <h3>Ojos</h3>
            <ul>
              <li>Fotoqueratitis: córnea quemada por UV, con ardor intenso, lagrimeo y sensación de arenilla horas después de la exposición.</li>
              <li>Pterigión: crecimiento de tejido sobre el ojo, frecuente en quienes trabajan al aire libre.</li>
              <li>Cataratas y daño de la retina por exposición acumulada.</li>
              <li>Cáncer de párpado, en la piel fina que rodea el ojo.</li>
            </ul>
          </article>
          <article class="harm-card">
            <h3>Cuerpo en general</h3>
            <ul>
              <li>Debilita temporalmente las defensas de la piel.</li>
              <li>Puede reactivar el herpes labial.</li>
              <li>Una quemadura extensa dificulta enfriar el cuerpo y agrava la deshidratación.</li>
              <li>Algunos medicamentos aumentan la sensibilidad y provocan reacciones en la piel.</li>
            </ul>
          </article>
        </div>
      </section>

      <section aria-labelledby="heat-title">
        <h2 id="heat-title">UV y calor: un riesgo que se suma</h2>
        <p>
          En una ola de calor, el sol no solo sube la temperatura: también aumenta la dosis de UV. Una
          piel quemada pierde parte de su capacidad para liberar calor y líquidos, así que el cuerpo
          se enfría peor y se deshidrata más rápido.
        </p>
        <ul>
          <li>Si tienes quemadura solar, trata los días calurosos como de riesgo mayor: bebe más agua y descansa en lugares frescos.</li>
          <li>Ropa clara, ligera y de manga larga protege del UV sin recalentar más que la piel expuesta.</li>
          <li>Prefiere salir temprano o al final de la tarde, cuando bajan el UV y la temperatura.</li>
          <li>La sombra de un árbol o un toldo reduce el UV, pero no lo elimina: sigue usando sombrero y lentes.</li>
        </ul>
        <div class="callout callout--danger">
          <span class="callout__label">No lo confundas</span>
          <p>
            Piel muy roja y caliente con confusión, desmayo o falta de sudor puede ser golpe de calor,
            no solo quemadura. Llama al 106.
          </p>
        </div>
      </section>

      <section aria-labelledby="risk-title">
        <h2 id="risk-title">Quién tiene más riesgo</h2>
        <ul>
          <li><strong>Bebés y niños:</strong> su piel es más fina. Los menores de 6 meses deben mantenerse a la sombra y cubiertos, sin protector salvo indicación del pediatra.</li>
          <li><strong>Piel, ojos y cabello claros, con pecas o muchos lunares:</strong> se queman con más facilidad.</li>
          <li><strong>Quienes ya tuvieron quemaduras</strong> o tienen antecedentes familiares de cáncer de piel.</li>
          <li><strong>Trabajo al aire libre:</strong> obra, agricultura, mototaxi, reparto, comercio ambulante, pesca y construcción.</li>
          <li><strong>Deportistas y quienes van a la playa o la sierra</strong>, por la exposición prolongada y el reflejo.</li>
          <li><strong>Personas mayores:</strong> acumulan décadas de exposición y su piel repara más lento.</li>
          <li>
            <strong>Quienes toman medicamentos fotosensibilizantes:</strong>
            algunos antibióticos (como doxiciclina), diuréticos tiazídicos, ciertos antiinflamatorios en gel y tratamientos con retinoides.
            Consulta a tu médico o farmacéutico antes de exponerte.
          </li>
        </ul>
        <p>
          <strong>La piel oscura también se daña.</strong> Tiene más protección natural, pero no es
          inmune: el cáncer de piel en personas de piel morena suele detectarse tarde.
        </p>
      </section>

      <section aria-labelledby="protect-title">
        <h2 id="protect-title">Cómo protegerte, en orden de importancia</h2>
        <ol>
          <li>
            <strong>Sombra y horario.</strong> Evita el sol directo entre las 10:00 y las 16:00. Planifica trabajo, deporte y recreo en otro horario.
          </li>
          <li>
            <strong>Ropa que cubra.</strong> Mangas largas, pantalón y tejidos ligeros y de trama cerrada. Si la tela deja pasar la luz al mirarla, deja pasar UV.
          </li>
          <li>
            <strong>Sombrero de ala ancha o gorro con cubrenuca.</strong> Protege rostro, orejas y cuello, las zonas donde más aparece el cáncer de piel.
          </li>
          <li>
            <strong>Lentes con filtro UV400 o 100 % UV.</strong> Mejor si son envolventes. Un lente oscuro sin filtro es peor que ninguno: dilata la pupila y deja entrar más UV.
          </li>
          <li>
            <strong>Protector solar de amplio espectro, SPF 30 o más.</strong> Úsalo en la piel que no puedes cubrir. Ver cómo aplicarlo abajo.
          </li>
          <li>
            <strong>Hidratación.</strong> Bebe agua con frecuencia mientras estés al aire libre.
          </li>
        </ol>

        <h3>Cómo aplicar el protector solar</h3>
        <ul>
          <li>Aplica unos 15 minutos antes de salir, sobre la piel limpia y seca.</li>
          <li>La cantidad importa: cerca de una cucharadita para rostro y cuello, y unos 30 ml (un vasito de chupito) para todo el cuerpo.</li>
          <li>Reaplica cada 2 horas y siempre después de sudar, nadar o secarte con toalla, aunque diga resistente al agua.</li>
          <li>No olvides orejas, nuca, labios (con bálsamo con SPF), empeines, manos y la coronilla si hay poco cabello.</li>
          <li>Revisa la fecha de vencimiento y guárdalo fuera del sol directo: el calor lo vuelve menos efectivo.</li>
          <li>Un protector no es permiso para quedarte más tiempo al sol. Sirve para reducir el daño, no para anularlo.</li>
        </ul>
      </section>

      <section aria-labelledby="myths-title">
        <h2 id="myths-title">Mitos frecuentes</h2>
        <dl class="myths">
          <div>
            <dt>“Si está nublado no hay UV.”</dt>
            <dd>Falso. Las nubes delgadas dejan pasar gran parte de la radiación. Las quemaduras más inesperadas ocurren en días de cielo blanquecino.</dd>
          </div>
          <div>
            <dt>“Un bronceado base me protege.”</dt>
            <dd>Falso. El bronceado es una señal de que la piel ya se dañó. Solo equivale a un SPF muy bajo.</dd>
          </div>
          <div>
            <dt>“Con piel morena no necesito protección.”</dt>
            <dd>Falso. Protege más, pero no por completo. Sombra, sombrero y lentes siguen siendo necesarios.</dd>
          </div>
          <div>
            <dt>“Con SPF 100 puedo pasar todo el día al sol.”</dt>
            <dd>Falso. La diferencia entre SPF 30 y 100 es pequeña y el efecto se pierde con el sudor y el roce. Lo que cuenta es aplicar bien y reaplicar.</dd>
          </div>
          <div>
            <dt>“Dentro de un carro o tras una ventana estoy a salvo.”</dt>
            <dd>Solo en parte. El vidrio frena casi todo el UVB, pero deja pasar mucho UVA. Los conductores suelen tener más daño en el lado de la ventana.</dd>
          </div>
          <div>
            <dt>“Las camas solares son más seguras que el sol.”</dt>
            <dd>Falso. La OMS las clasifica como cancerígenas. No existe un bronceado artificial seguro.</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="burn-title">
        <h2 id="burn-title">Si ya te quemaste</h2>
        <ol>
          <li>Sal del sol de inmediato y entra a un lugar fresco.</li>
          <li>Enfría la piel con duchas o compresas de agua fresca durante 10 a 15 minutos. No uses hielo directo.</li>
          <li>Bebe agua o suero oral en sorbos frecuentes.</li>
          <li>Aplica una crema hidratante suave o gel de aloe puro sobre la piel intacta.</li>
          <li>Usa ropa suelta de algodón y evita el sol hasta que la piel se recupere por completo.</li>
        </ol>
        <p>
          <strong>No hagas esto:</strong> no revientes las ampollas, no uses mantequilla, pasta dental,
          aceites ni remedios caseros irritantes, y no te rasques ni arranques la piel que se descama.
        </p>

        <div class="callout callout--danger" role="note">
          <span class="callout__label">Busca atención médica</span>
          <p>
            Si hay ampollas extensas o en el rostro, fiebre, escalofríos, confusión, desmayo, vómitos,
            signos de deshidratación o dolor intenso en los ojos, acude a un establecimiento de salud.
            Ante desmayo o confusión, llama al 106. En bebés menores de un año, consulta siempre.
          </p>
        </div>

        <ul class="reading-links">
          <li>
            <a href="/sintomas/quemadura-solar">
              <span class="link-with-icon"><Sun size={19} strokeWidth={1.8} aria-hidden="true" /> Guía paso a paso: quemadura solar</span>
              <ChevronRight size={18} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href="/sintomas/ojos-por-radiacion-uv">
              <span class="link-with-icon"><Eye size={19} strokeWidth={1.8} aria-hidden="true" /> Guía paso a paso: ojos irritados por el sol</span>
              <ChevronRight size={18} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>

      <section aria-labelledby="skin-title">
        <h2 id="skin-title">Revisa tu piel: la regla ABCDE</h2>
        <p>
          El cáncer de piel detectado a tiempo suele tratarse con éxito. Una vez al mes, revisa tu
          cuerpo con un espejo y busca lunares o manchas con estas señales:
        </p>
        <dl class="abcde">
          <div><dt>A</dt><dd><strong>Asimetría.</strong> Una mitad no se parece a la otra.</dd></div>
          <div><dt>B</dt><dd><strong>Bordes</strong> irregulares, borrosos o dentados.</dd></div>
          <div><dt>C</dt><dd><strong>Color</strong> desigual: marrón, negro, rojo, azul o blanco en la misma lesión.</dd></div>
          <div><dt>D</dt><dd><strong>Diámetro</strong> mayor de 6 mm, aproximadamente el de un lápiz.</dd></div>
          <div><dt>E</dt><dd><strong>Evolución.</strong> Cambia de tamaño, forma, color, pica o sangra.</dd></div>
        </dl>
        <p>
          También consulta si aparece una herida que no cierra en cuatro semanas, una mancha rugosa que
          descama o un bulto brillante. Un dermatólogo o tu establecimiento de salud puede evaluarte.
        </p>
      </section>

      <section aria-labelledby="day-title">
        <h2 id="day-title">Qué hacer según el nivel del día</h2>
        <div class="day-plan">
          <div class="day-plan__row day-plan__row--low">
            <strong>UV 0 a 2</strong>
            <span>Vida normal. Lentes y sombrero si estarás varias horas afuera.</span>
          </div>
          <div class="day-plan__row day-plan__row--moderate">
            <strong>UV 3 a 5</strong>
            <span>Protector en rostro y manos. Sombra al mediodía.</span>
          </div>
          <div class="day-plan__row day-plan__row--high">
            <strong>UV 6 a 7</strong>
            <span>Ropa que cubra, sombrero, lentes y protector. Evita el sol fuerte.</span>
          </div>
          <div class="day-plan__row day-plan__row--very-high">
            <strong>UV 8 a 10</strong>
            <span>Reprograma lo que puedas fuera de 10:00 a 16:00. Reaplica cada 2 horas.</span>
          </div>
          <div class="day-plan__row day-plan__row--extreme">
            <strong>UV 11 o más</strong>
            <span>Evita el sol directo al mediodía. Cuida especialmente a niños, mayores y trabajadores.</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="work-title">
        <h2 id="work-title">Si trabajas o estudias al aire libre</h2>
        <ul>
          <li>Pide pausas en sombra o bajo techo en las horas de mayor UV.</li>
          <li>Lleva ropa de manga larga de tela ligera y un sombrero con cubrenuca.</li>
          <li>Guarda el protector en la mochila y programa una alarma para reaplicarlo.</li>
          <li>En colegios, propón que el recreo y la formación sean antes de las 10:00 o después de las 16:00 cuando el índice sea alto.</li>
          <li>Toma agua con frecuencia. El UV intenso casi siempre viene con calor.</li>
        </ul>
      </section>

      <div class="shield" role="note">
        <ShieldCheck size={22} strokeWidth={1.7} aria-hidden="true" />
        <p>
          Protegerte del UV no significa dejar de salir. Se trata de elegir el horario, cubrir la piel y
          cuidar los ojos.
        </p>
      </div>

      <nav aria-label="Siguientes pasos">
        <ul class="reading-links">
          <li>
            <a href="/mas/ola-de-calor">El calor también de noche <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/sintomas">Reconocer los síntomas paso a paso <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/plan">Preparar un plan para tu casa o trabajo <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/fuentes">Ver fuentes y método <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
        </ul>
      </nav>

      <p class="source-note">
        Referencias: OMS, OPS y SENAMHI (Índice UV solar mundial y Perú), MINSA y guías de dermatología
        sobre prevención de cáncer de piel. Rupaq muestra el índice UV del modelo meteorológico para tu
        distrito; consulta SENAMHI para avisos oficiales. Orientación general: no reemplaza la evaluación
        de un profesional de salud. Contenido pendiente de revisión profesional.
      </p>
    </div>
  </div>
</div>

<style>
  .uv-page {
    --uv-low: #3f9b4b;
    --uv-moderate: #e3b81c;
    --uv-high: #e8812a;
    --uv-very-high: #d6362c;
    --uv-extreme: #7b3fa8;
  }

  .uv-now .eyebrow {
    color: var(--ink-soft);
  }

  .uv-now__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 18px 40px;
    margin-top: 16px;
  }

  .uv-now__stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .uv-now__label {
    font-size: 0.875rem;
    font-weight: 650;
    color: var(--ink-mute);
  }

  .uv-now__number {
    font-family: var(--font-display);
    font-size: clamp(3.6rem, 12vw, 5.4rem);
    font-weight: 620;
    line-height: 0.92;
    letter-spacing: -0.07em;
    font-variant-numeric: tabular-nums;
  }

  .uv-now__number--small {
    font-size: clamp(2.2rem, 7vw, 3rem);
    color: var(--ink-soft);
  }

  .uv-now__number[data-level='low'] { color: var(--safe-ink); }
  .uv-now__number[data-level='moderate'],
  .uv-now__number[data-level='high'] { color: var(--precaution-ink); }
  .uv-now__number[data-level='very-high'],
  .uv-now__number[data-level='extreme'] { color: var(--danger-ink); }

  .uv-now__tag {
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .uv-meter {
    position: relative;
    margin-top: 22px;
    max-width: 520px;
  }

  .uv-meter__bar {
    display: flex;
    gap: 3px;
    height: 12px;
  }

  .seg {
    display: block;
    border-radius: 3px;
  }

  .seg--low { background: var(--uv-low); }
  .seg--moderate { background: var(--uv-moderate); }
  .seg--high { background: var(--uv-high); }
  .seg--very-high { background: var(--uv-very-high); }
  .seg--extreme { background: var(--uv-extreme); }

  .uv-meter__marker {
    position: absolute;
    top: -5px;
    width: 4px;
    height: 22px;
    margin-left: -2px;
    border-radius: 2px;
    background: var(--ink);
    box-shadow: 0 0 0 2px var(--paper);
  }

  .uv-meter__ticks {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 0.875rem;
    color: var(--ink-mute);
    font-variant-numeric: tabular-nums;
  }

  .uv-now__advice {
    margin-top: 18px !important;
  }

  .uv-levels {
    margin-top: 16px !important;
    max-width: none !important;
  }

  .reading-body .uv-levels li {
    display: flex;
    gap: 14px;
    padding: 14px 0;
  }

  .reading-body .uv-levels li::before {
    display: none;
  }

  .uv-level__chip {
    flex: none;
    width: 8px;
    border-radius: 4px;
    background: var(--uv-low);
  }

  .uv-level--moderate .uv-level__chip { background: var(--uv-moderate); }
  .uv-level--high .uv-level__chip { background: var(--uv-high); }
  .uv-level--very-high .uv-level__chip { background: var(--uv-very-high); }
  .uv-level--extreme .uv-level__chip { background: var(--uv-extreme); }

  .uv-level__copy {
    min-width: 0;
  }

  .reading-body .uv-level__copy p {
    margin-top: 3px;
    font-size: 1rem;
  }

  .reading-body .uv-level__copy .uv-level__head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 0;
  }

  .reading-body .uv-level__head strong {
    font-family: var(--font-display);
    font-size: 1.2rem;
    letter-spacing: -0.03em;
  }

  .uv-level__today {
    padding: 1px 7px;
    border: 1px solid var(--ink);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .reading-body .uv-level__action {
    color: var(--ink-mute);
  }

  .harm-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 16px;
  }

  .harm-card {
    padding: 4px 0 0;
    border-top: 2px solid var(--ink);
  }

  .reading-body .harm-card h3 {
    margin-top: 10px;
    font-size: 1.15rem;
  }

  .link-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .myths {
    margin: 16px 0 0;
    max-width: 62ch;
  }

  .myths > div {
    padding: 14px 0;
    border-top: 1px solid var(--hairline-soft);
  }

  .myths > div:last-child {
    border-bottom: 1px solid var(--hairline-soft);
  }

  .myths dt {
    font-weight: 700;
    color: var(--ink);
    font-size: 1.0625rem;
  }

  .myths dd {
    margin: 4px 0 0;
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.5;
  }

  .abcde {
    margin: 16px 0 0;
    max-width: 62ch;
  }

  .abcde > div {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 10px 0;
    border-top: 1px solid var(--hairline-soft);
  }

  .abcde > div:last-child {
    border-bottom: 1px solid var(--hairline-soft);
  }

  .abcde dt {
    flex: none;
    width: 1.4em;
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 620;
    line-height: 1;
    letter-spacing: -0.05em;
    color: var(--ink);
  }

  .abcde dd {
    margin: 0;
    color: var(--ink-soft);
    font-size: 1.0625rem;
    line-height: 1.45;
  }

  .day-plan {
    margin-top: 16px;
    max-width: 62ch;
  }

  .day-plan__row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2px;
    padding: 12px 0 12px 16px;
    border-top: 1px solid var(--hairline-soft);
    border-left: 6px solid var(--uv-low);
  }

  .day-plan__row:last-child {
    border-bottom: 1px solid var(--hairline-soft);
  }

  .day-plan__row--moderate { border-left-color: var(--uv-moderate); }
  .day-plan__row--high { border-left-color: var(--uv-high); }
  .day-plan__row--very-high { border-left-color: var(--uv-very-high); }
  .day-plan__row--extreme { border-left-color: var(--uv-extreme); }

  .day-plan__row strong {
    color: var(--ink);
  }

  .day-plan__row span {
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.45;
  }

  .shield {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-top: 30px;
    padding: 16px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
    color: var(--ink-soft);
  }

  .reading-body .shield p {
    margin-top: 0;
  }

  @media (min-width: 720px) {
    .harm-grid {
      grid-template-columns: 1fr 1fr;
      gap: 22px 34px;
    }

    .day-plan__row {
      grid-template-columns: 130px 1fr;
      gap: 16px;
    }
  }
</style>

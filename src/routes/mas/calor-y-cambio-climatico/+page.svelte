<script lang="ts">
  import { ChevronRight } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
</script>

<svelte:head>
  <title>El calor y el cambio climático · Rupaq</title>
  <meta
    name="description"
    content="Cómo el cambio climático hace el calor más frecuente e intenso, por qué el Perú es vulnerable y qué puedes hacer en tu casa, tu barrio y tu ciudad."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Entender el calor"
      title="El calor y el cambio climático"
      intro="Los días de calor siempre han existido. Lo que cambia es que ahora son más frecuentes, más intensos y duran más. Esto es lo que significa para tu salud."
    />

    <div class="reading-body">
      <section aria-labelledby="link-title">
        <h2 id="link-title">Por qué el planeta se calienta</h2>
        <p>
          Al quemar petróleo, gas y carbón, y al talar bosques, se acumulan gases de efecto invernadero
          en la atmósfera. Funcionan como una manta: retienen más calor del que debería quedarse. La
          ciencia reunida por el IPCC lo dice sin rodeos: <strong>la influencia humana ha calentado el
          clima</strong>.
        </p>
        <div class="pull-stat">
          <span class="pull-stat__number">1,1°</span>
          <p class="pull-stat__copy">
            es cuánto más caliente estuvo el planeta en 2011–2020 respecto a 1850–1900, según el IPCC.
          </p>
        </div>
        <p class="meta">
          Y 2024 fue el primer año calendario por encima de 1,5 °C, según la Organización
          Meteorológica Mundial (OMM).
        </p>
      </section>

      <section aria-labelledby="change-title">
        <h2 id="change-title">Cómo cambia el calor que vives</h2>
        <p>
          Un grado más en el promedio parece poco. Pero cuando todo el clima se desplaza, los días muy
          calurosos se vuelven mucho más comunes.
        </p>
        <ul>
          <li><strong>Más olas de calor:</strong> ocurren con más frecuencia y duran más días seguidos.</li>
          <li><strong>Noches que no refrescan:</strong> las mínimas suben, y el cuerpo pierde su descanso.</li>
          <li><strong>Más humedad en el aire caliente:</strong> el aire cálido retiene más vapor de agua, y la sensación térmica sube.</li>
          <li><strong>Temporadas más largas:</strong> el calor llega antes y se queda más tiempo, también para los mosquitos.</li>
        </ul>
        <p>
          Rupaq muestra la <a href="/mas/ola-de-calor">sensación térmica y la noche más caliente</a> de
          tu distrito justamente porque ahí es donde el calor extremo hace daño.
        </p>
      </section>

      <section aria-labelledby="peru-title">
        <h2 id="peru-title">Por qué el Perú es vulnerable</h2>
        <ul>
          <li>
            <strong>El Niño y el mar caliente:</strong> cuando el mar frente a la costa se calienta, el
            calor, la humedad y las lluvias fuertes aumentan en la costa norte y central. El cambio
            climático puede sumarse a ese efecto natural.
          </li>
          <li>
            <strong>Glaciares que retroceden:</strong> los glaciares tropicales de los Andes se han
            reducido por décadas. Son una reserva de agua para ciudades y campos en la época seca.
          </li>
          <li>
            <strong>Agua y calor van juntos:</strong> con calor se necesita más agua, justo cuando hay menos.
            Almacenarla sin tapa favorece criaderos de dengue.
          </li>
          <li>
            <strong>Desigualdad:</strong> quien vive en vivienda de calamina, sin árboles ni agua segura,
            sufre más el mismo día de calor.
          </li>
        </ul>
      </section>

      <section aria-labelledby="city-title">
        <h2 id="city-title">La ciudad se calienta más que el campo</h2>
        <p>
          El cemento y el asfalto absorben calor de día y lo sueltan de noche. Donde hay pocos árboles y
          poca sombra, la temperatura puede ser varios grados más alta que en zonas verdes cercanas.
          Es la <strong>isla de calor urbana</strong>, y es una de las razones por las que las noches en
          la ciudad enfrían menos.
        </p>
        <div class="callout">
          <span class="callout__label">Lo que importa para tu salud</span>
          <p>
            El cambio climático no es solo un tema del futuro. Ya aumenta los días de calor peligroso,
            sobre todo para niños, personas mayores, embarazadas y quienes trabajan al aire libre.
          </p>
        </div>
      </section>

      <section aria-labelledby="do-title">
        <h2 id="do-title">Qué puedes hacer</h2>
        <h3>Para cuidarte (adaptación)</h3>
        <ol>
          <li>Mira el pronóstico de tu distrito y planifica tus salidas fuera de las horas más calientes.</li>
          <li>Prepara tu <a href="/mas/plan">plan de acción</a> antes de la próxima ola de calor.</li>
          <li>Conoce los <a href="/sintomas">síntomas de alarma</a> y cuándo llamar al 106.</li>
          <li>Tapa y limpia los recipientes con agua para evitar criaderos de zancudos.</li>
        </ol>
        <h3>Para frenar el problema (mitigación)</h3>
        <ul>
          <li>Moverte a pie, en bicicleta o en transporte público cuando puedas.</li>
          <li>Ahorrar energía y agua en casa.</li>
          <li>Sembrar y cuidar árboles en tu cuadra, colegio o centro de trabajo.</li>
          <li>Pedir parques, sombra y bebederos públicos a tu municipalidad.</li>
        </ul>
        <p>
          Las acciones individuales ayudan, pero la mayor reducción de emisiones depende de decisiones
          de gobiernos y empresas. Cuidarte hoy y exigir cambios van de la mano.
        </p>
      </section>

      <nav aria-label="Siguientes pasos">
        <ul class="reading-links">
          <li>
            <a href="/mas/ola-de-calor">Ola de calor y noches <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/dengue-y-clima">Dengue, agua almacenada y datos CDC/MINSA <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/plan">Preparar un plan para tu casa <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/fuentes">Ver fuentes y método de cálculo <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
        </ul>
      </nav>

      <p class="source-note">
        Referencias: IPCC (Sexto Informe de Evaluación), Organización Meteorológica Mundial,
        OMS/OPS y SENAMHI. Este resumen es educativo y no reemplaza los informes científicos ni los
        avisos oficiales de tu zona.
      </p>
    </div>
  </div>
</div>

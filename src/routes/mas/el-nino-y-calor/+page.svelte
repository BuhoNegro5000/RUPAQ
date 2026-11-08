<script lang="ts">
  import { ChevronRight } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
</script>

<svelte:head>
  <title>El Niño y el calor · Rupaq</title>
  <meta
    name="description"
    content="Qué es El Niño costero, por qué calienta la costa peruana, cómo afecta tu salud (calor, noches cálidas y dengue) y cómo leer los comunicados oficiales del ENFEN."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Entender el calor"
      title="El Niño y el calor"
      intro="Cuando el mar frente a la costa se calienta más de lo normal, el aire también. Así cambia el calor, la humedad y el riesgo para tu salud."
    />

    <div class="reading-body">
      <section aria-labelledby="what-title">
        <h2 id="what-title">Qué es El Niño</h2>
        <p>
          Es un calentamiento anormal de las aguas del océano Pacífico que altera el clima por meses.
          Se repite cada pocos años, con distinta fuerza, y es un fenómeno natural. Su contrario,
          <strong>La Niña</strong>, es un enfriamiento de esas aguas.
        </p>
        <p>
          En el Perú se vigilan dos versiones, y conviene no confundirlas:
        </p>
        <ul>
          <li>
            <strong>El Niño global (ENSO):</strong> ocurre en el Pacífico central y puede cambiar el
            clima de medio mundo.
          </li>
          <li>
            <strong>El Niño costero:</strong> es el calentamiento del mar justo frente a las costas de
            Perú y Ecuador. Es el que más afecta a nuestra costa, y puede darse sin que haya un
            El Niño global.
          </li>
        </ul>
      </section>

      <section aria-labelledby="why-title">
        <h2 id="why-title">Por qué calienta tu ciudad</h2>
        <p>
          Normalmente, el mar frente a Lima es frío porque sube agua profunda y fresca. Con El Niño
          costero ese aporte se debilita y la superficie se calienta. El resultado se siente en tierra:
        </p>
        <ul>
          <li><strong>Temperaturas más altas</strong> de día en la costa norte y central.</li>
          <li><strong>Noches más cálidas:</strong> el mar caliente suelta calor y humedad también de noche.</li>
          <li><strong>Más humedad:</strong> la sensación térmica sube aunque el termómetro marque poco.</li>
          <li><strong>Menos neblina y garúa</strong> en algunos meses, y lluvias intensas en la costa norte.</li>
        </ul>
        <div class="callout">
          <span class="callout__label">Lo que importa para tu salud</span>
          <p>
            Calor y humedad juntos dificultan que el cuerpo se enfríe. Por eso El Niño aumenta el
            riesgo de golpe de calor y de descanso interrumpido, sobre todo en niños, personas
            mayores y quienes trabajan al aire libre.
          </p>
        </div>
      </section>

      <section aria-labelledby="health-title">
        <h2 id="health-title">Qué cambia en tu salud</h2>
        <ul>
          <li>
            <strong>Golpe de calor y deshidratación:</strong> más días con calor húmedo. Revisa los
            <a href="/sintomas">síntomas de alarma</a>.
          </li>
          <li>
            <strong>Dengue:</strong> el calor acelera al mosquito <em>Aedes aegypti</em>, y las lluvias
            y el agua almacenada le dan criaderos. En 2023, un año con El Niño costero, el dengue
            alcanzó cifras récord en el país. Mira el
            <a href="/mas/dengue-y-clima">dengue y el clima</a>.
          </li>
          <li>
            <strong>Lluvias, huaicos e inundaciones:</strong> dañan viviendas, cortan agua y luz y
            aumentan las enfermedades por agua contaminada.
          </li>
          <li>
            <strong>Servicios de salud y energía bajo presión:</strong> los efectos indirectos del
            <a href="/mas/ola-de-calor">calor extremo</a> se acumulan.
          </li>
        </ul>
      </section>

      <section aria-labelledby="enfen-title">
        <h2 id="enfen-title">Cómo leer los comunicados del ENFEN</h2>
        <p>
          El Comité Multisectorial ENFEN (con IMARPE, SENAMHI, DHN, IGP, INDECI y otras instituciones)
          vigila el mar peruano y publica un comunicado oficial cada quincena. Su estado de alerta
          indica qué esperar:
        </p>
        <ul>
          <li><strong>No activo:</strong> no hay condiciones de El Niño ni de La Niña costeros.</li>
          <li><strong>Vigilancia:</strong> hay señales y puede desarrollarse un evento. Es momento de informarse y prepararse.</li>
          <li><strong>Alerta:</strong> el evento ya está en marcha. Se publica también su magnitud (débil, moderada, fuerte o extraordinaria).</li>
          <li><strong>Finalizado:</strong> las condiciones volvieron a la normalidad.</li>
        </ul>
        <p class="meta">
          Rupaq no reemplaza al ENFEN. Úsalo como complemento y revisa siempre el comunicado vigente.
        </p>
      </section>

      <section aria-labelledby="climate-title">
        <h2 id="climate-title">¿Y el cambio climático?</h2>
        <p>
          El Niño es un ciclo natural; el cambio climático es un calentamiento de fondo, de décadas.
          No son lo mismo, pero se suman: el planeta parte de una temperatura más alta, y cuando llega
          un El Niño los picos de calor pueden ser más intensos. Todavía se estudia cómo cambiará la
          frecuencia y la fuerza de El Niño en el futuro. Más en
          <a href="/mas/calor-y-cambio-climatico">El calor y el cambio climático</a>.
        </p>
      </section>

      <section aria-labelledby="do-title">
        <h2 id="do-title">Qué puedes hacer</h2>
        <ol>
          <li>Revisa el último comunicado del ENFEN y los avisos del SENAMHI cuando haya Vigilancia o Alerta.</li>
          <li>Prepara tu <a href="/mas/plan">plan de acción</a> antes de que empiece la temporada de calor.</li>
          <li>Almacena el agua con tapa y limpia los recipientes cada semana para evitar criaderos de zancudos.</li>
          <li>Toma agua con frecuencia, busca sombra y evita el esfuerzo en las horas más calientes.</li>
          <li>Si vives en zona de quebradas o cauces, conoce tu ruta de evacuación y sigue a INDECI y a tu municipalidad.</li>
        </ol>
      </section>

      <nav aria-label="Siguientes pasos">
        <ul class="reading-links">
          <li>
            <a href="/mas/calor-y-cambio-climatico">El calor y el cambio climático <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/dengue-y-clima">Dengue, agua almacenada y datos CDC/MINSA <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/ola-de-calor">Ola de calor y noches <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
          <li>
            <a href="/mas/fuentes">Ver fuentes y método de cálculo <ChevronRight size={18} aria-hidden="true" /></a>
          </li>
        </ul>
      </nav>

      <p class="source-note">
        Referencias: Comité Multisectorial ENFEN, SENAMHI, IMARPE, Organización Meteorológica Mundial,
        OMS/OPS y CDC Perú. Este resumen es educativo y no reemplaza los comunicados oficiales
        vigentes.
      </p>
    </div>
  </div>
</div>

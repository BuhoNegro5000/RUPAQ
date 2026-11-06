<script lang="ts">
  import { browser } from '$app/environment';
  import {
    AlertTriangle,
    ArrowUpRight,
    Bug,
    CheckCircle2,
    ChevronRight,
    Droplets,
    FileSpreadsheet,
    HeartPulse,
    HelpCircle,
    Info,
    Layers,
    MapPin,
    ShieldAlert,
    ShieldCheck,
    ThermometerSun,
    Waves
  } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import { forecast } from '$lib/stores/forecast';
  import { selectedLocation } from '$lib/stores/location';

  $: district = $selectedLocation;
  $: currentFeels = $forecast ? Math.round($forecast.now.feelsC) : null;
  $: humidity = $forecast ? $forecast.now.humidity : null;

  // Key epidemiological indicators based on MINSA/CDC Peru alerts and epidemiological bulletins
  const REGIONAL_CDC_DATA = [
    {
      region: 'Piura',
      foco: 'Piura, Sullana, Morropón, Paita',
      serotipos: 'DEN-1, DEN-2, DEN-3',
      alerta: 'Hiperendémico',
      riesgo: 'Extremo',
      factorClima: 'Temperaturas > 32 °C y almacenamiento masivo por cortes de agua aceleran el ciclo biológico a 5 días.',
      badgeClass: 'badge--danger'
    },
    {
      region: 'La Libertad',
      foco: 'Trujillo, Ascope, Chepén, Pacasmayo',
      serotipos: 'DEN-1, DEN-2, DEN-3',
      alerta: 'Brote activo',
      riesgo: 'Muy alto',
      factorClima: 'Valles costeros cálidos con alta densidad urbana y floreros en cementerios.',
      badgeClass: 'badge--danger'
    },
    {
      region: 'Lima Metropolitana',
      foco: 'San Juan de Lurigancho, Comas, Puente Piedra, Ate, Carabayllo, Villa María del Triunfo',
      serotipos: 'DEN-1, DEN-2',
      alerta: 'Vigilancia activa',
      riesgo: 'Alto',
      factorClima: 'Humedad costera > 80% y acumulación de agua no potable en conos urbanos periurbanos.',
      badgeClass: 'badge--warning'
    },
    {
      region: 'Loreto / San Martín / Ucayali',
      foco: 'Iquitos, Tarapoto, Pucallpa, Alto Amazonas',
      serotipos: 'DEN-1, DEN-2, DEN-3, DEN-4',
      alerta: 'Endémico permanente',
      riesgo: 'Alto',
      factorClima: 'Calor tropical sostenido (> 34 °C) y lluvias constantes que multiplican criaderos naturales y de recipientes.',
      badgeClass: 'badge--warning'
    },
    {
      region: 'Ica / Áncash / Lambayeque',
      foco: 'Chiclayo, Chimbote, Casma, Ica, Chincha',
      serotipos: 'DEN-1, DEN-2',
      alerta: 'Transmisión estacional',
      riesgo: 'Moderado a Alto',
      factorClima: 'Altas temperaturas en verano y áreas agrícolas con almacenamiento rudimentario.',
      badgeClass: 'badge--attention'
    }
  ];

  // Specific diseases linked to heat and mismanaged water in Peru
  const CLIMATE_DISEASES = [
    {
      id: 'dengue',
      nombre: 'Dengue, Zika y Chikungunya',
      vector: 'Zancudo hembra Aedes aegypti',
      mecanismoClima: 'El calor intenso reduce el periodo de incubación del virus y acorta el desarrollo de larva a mosquito adulto de 15 a solo 5-7 días. Con más calor, el mosquito pica con mayor frecuencia.',
      gestionAgua: 'La escasez o el corte de agua obliga a guardar agua en baldes, cilindros y bidones. Sin tapa hermética, se convierten en criaderos directos dentro del hogar.',
      alarma: 'Fiebre súbita, dolor detrás de los ojos, dolor abdominal continuo, vómitos repetidos o sangrado.',
      icono: Bug,
      urgencia: 'Alerta crítica CDC'
    },
    {
      id: 'eda',
      nombre: 'Enfermedades Diarreicas Agudas (EDA) y Cólera',
      vector: 'Bacterias (E. coli, Salmonella), virus (Rotavirus) y parásitos',
      mecanismoClima: 'Las altas temperaturas aceleran la descomposición de los alimentos no refrigerados y multiplican bacterias en cuestión de 2 a 3 horas a temperatura ambiente.',
      gestionAgua: 'Consumir agua no tratada o manipular agua de bidones con recipientes sucios contamina la fuente familiar provocando brotes diarreicos masivos y deshidratación severa.',
      alarma: 'Más de 3 deposiciones líquidas al día, ojos hundidos, boca seca, llanto sin lágrimas en niños y sed insaciable.',
      icono: Droplets,
      urgencia: 'Riesgo de deshidratación rápida'
    },
    {
      id: 'leptospirosis',
      nombre: 'Leptospirosis',
      vector: 'Bacteria Leptospira (orina de roedores y animales)',
      mecanismoClima: 'Lluvias torrenciales, aniegos por calor o colapso de desagües que forman charcos y lodazales donde la bacteria sobrevive durante semanas con calor.',
      gestionAgua: 'Caminar descalzo o manipular recipientes en charcos sin botas de jebe permite que la bacteria entre por raspaduras o mucosas.',
      alarma: 'Fiebre brusca, ojos rojos (inyección conjuntival) y dolor muy característico en las pantorrillas y espalda baja.',
      icono: Waves,
      urgencia: 'Urgente MINSA'
    }
  ];

  const LAVA_ESCOBILLA_STEPS = [
    {
      num: '1',
      title: 'Lava y escobilla',
      desc: 'Pasa escobilla con fuerza en las paredes internas de tanques, baldes y cilindros cada 3 días. Los huevos del zancudo se pegan a las paredes y sobreviven secos hasta 1 año.'
    },
    {
      num: '2',
      title: 'Tapa herméticamente',
      desc: 'Usa tapas ajustadas o mallas elásticas. No dejes trapos sueltos ni plásticos con huecos que permitan el ingreso de mosquitos hembra.'
    },
    {
      num: '3',
      title: 'Elimina objetos en desuso',
      desc: 'Bota o pon bajo techo botellas, llantas, latas, juguetes y macetas rotas donde se acumule agua de lluvia o riego.'
    },
    {
      num: '4',
      title: 'Reemplaza agua por arena',
      desc: 'En floreros y cementerios, usa arena húmeda o flores artificiales. Cambia a diario el agua de bebederos de mascotas.'
    }
  ];
</script>

<svelte:head>
  <title>Dengue y Enfermedades del Clima en Perú · CDC / MINSA · RUPAQ</title>
  <meta
    name="description"
    content="Vínculo científico entre olas de calor, mala gestión del agua, dengue (Aedes aegypti), EDA y leptospirosis en Perú con datos del CDC/MINSA."
  />
</svelte:head>

<div class="screen climate-screen">
  <div class="page reading-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Salud pública y clima"
      title="Dengue y enfermedades sensibles al clima"
      intro="Cómo las altas temperaturas y el agua almacenada aceleran los brotes en el Perú, con datos epidemiológicos del CDC y el MINSA."
    />

    <div class="reading-body">
      <!-- Status Box -->
      <section class="banner-epidemiologico" aria-labelledby="status-epi-title">
        <div class="banner-head">
          <ShieldAlert size={22} class="banner-icon" aria-hidden="true" />
          <h2 id="status-epi-title">Alerta Sanitaria Nacional: Calor y Agua</h2>
        </div>
        <p class="banner-text">
          Según las alertas del <strong>Centro Nacional de Epidemiología, Prevención y Control de Enfermedades (CDC Perú)</strong>,
          el calentamiento anómalo y los eventos climáticos no solo generan golpes de calor directos, sino que
          <strong>aceleran la transmisión vectorial y las infecciones transmitidas por agua y alimentos</strong>.
        </p>
        <div class="banner-meta">
          <span>Fuente oficial: MINSA / CDC Perú · Salas Situacionales</span>
          <span class="dot" aria-hidden="true">·</span>
          <span>Actualizado 2026</span>
        </div>
      </section>

      <!-- The Core Scientific Connection -->
      <section class="section-card" aria-labelledby="vector-link-title">
        <h2 id="vector-link-title" class="card-title">
          <ThermometerSun size={20} class="inline-icon text-danger" aria-hidden="true" />
          El mecanismo biológico: Calor + Agua Estancada
        </h2>
        <p>
          En condiciones normales de clima templado (20-22 °C), el ciclo biológico del zancudo <em>Aedes aegypti</em>
          (desde que la hembra pone el huevo hasta que emerge el mosquito adulto listo para picar) tarda entre <strong>10 y 15 días</strong>.
        </p>

        <div class="stat-highlight-grid">
          <div class="stat-box">
            <span class="stat-num text-danger">5 a 7 días</span>
            <span class="stat-label">Ciclo acelerado con calor (> 28 °C)</span>
            <p class="stat-desc">El mosquito madura a más del doble de velocidad. Hay más zancudos en menos tiempo.</p>
          </div>
          <div class="stat-box">
            <span class="stat-num text-warning">+ Picaduras</span>
            <span class="stat-label">Mayor tasa de reproducción viral</span>
            <p class="stat-desc">A mayor temperatura ambiental, el virus del dengue se replica más rápido dentro de la glándula salival del vector.</p>
          </div>
          <div class="stat-box">
            <span class="stat-num text-primary">1 año</span>
            <span class="stat-label">Resistencia de los huevos de Aedes</span>
            <p class="stat-desc">Los huevos pueden resistir la desecación pegados a recipientes durante meses esperando agua fresca para eclosionar.</p>
          </div>
        </div>

        <div class="callout callout--danger">
          <strong class="callout-title">El problema social del almacenamiento de agua</strong>
          <p>
            En gran parte de las ciudades de la costa (Lima, Piura, Trujillo, Ica) y la selva peruana, el servicio de agua es discontinuo o proviene de camiones cisterna.
            Esto obliga a millones de familias a almacenar agua en <strong>cilindros, baldes, bidones y tanques</strong>. Si estos depósitos no tienen tapa hermética y no se escobillan, se convierten en verdaderas fábricas de zancudos dentro del propio dormitorio o patio.
          </p>
        </div>
      </section>

      <!-- Diseases Detail -->
      <section class="section-card" aria-labelledby="diseases-title">
        <h2 id="diseases-title" class="card-title">
          <HeartPulse size={20} class="inline-icon" aria-hidden="true" />
          Las 3 enfermedades más sensibles al calor y al agua en el Perú
        </h2>

        <div class="diseases-list">
          {#each CLIMATE_DISEASES as dis}
            <article class="disease-card" id={dis.id}>
              <div class="disease-header">
                <div class="disease-title-row">
                  <svelte:component this={dis.icono} size={22} class="disease-icon" aria-hidden="true" />
                  <div>
                    <h3 class="disease-name">{dis.nombre}</h3>
                    <span class="disease-vector"><strong>Causa / Vector:</strong> {dis.vector}</span>
                  </div>
                </div>
                <span class="disease-badge">{dis.urgencia}</span>
              </div>

              <div class="disease-body">
                <div class="disease-field">
                  <span class="field-label">Impacto del calor:</span>
                  <p>{dis.mecanismoClima}</p>
                </div>

                <div class="disease-field">
                  <span class="field-label">Relación con el agua:</span>
                  <p>{dis.gestionAgua}</p>
                </div>

                <div class="disease-alarm">
                  <span class="alarm-label"><AlertTriangle size={15} aria-hidden="true" /> Signos de alarma MINSA:</span>
                  <p class="alarm-text">{dis.alarma}</p>
                </div>
              </div>
            </article>
          {/each}
        </div>
      </section>

      <!-- Regional CDC Situation Table -->
      <section class="section-card" aria-labelledby="regional-title">
        <h2 id="regional-title" class="card-title">
          <MapPin size={20} class="inline-icon" aria-hidden="true" />
          Panorama Epidemiológico por Regiones (Vigilancia CDC)
        </h2>
        <p class="section-desc">
          Evaluación según salas epidemiológicas y riesgo climático en el territorio peruano:
        </p>

        <div class="table-responsive">
          <table class="cdc-table">
            <thead>
              <tr>
                <th scope="col">Región</th>
                <th scope="col">Focos y distritos críticos</th>
                <th scope="col">Serotipos</th>
                <th scope="col">Nivel de Alerta</th>
                <th scope="col">Factor Climático / Agua</th>
              </tr>
            </thead>
            <tbody>
              {#each REGIONAL_CDC_DATA as row}
                <tr>
                  <td><strong>{row.region}</strong></td>
                  <td>{row.foco}</td>
                  <td><code>{row.serotipos}</code></td>
                  <td>
                    <span class="table-badge {row.badgeClass}">{row.alerta}</span>
                  </td>
                  <td class="table-desc">{row.factorClima}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Protocol: Lava, Escobilla y Tapa -->
      <section class="section-card protocol-card" aria-labelledby="protocol-title">
        <h2 id="protocol-title" class="card-title">
          <ShieldCheck size={20} class="inline-icon text-success" aria-hidden="true" />
          La regla de oro MINSA: Lava, Escobilla y Tapa
        </h2>
        <p class="section-desc">
          El repelente y los insecticidas solo atacan al mosquito que ya vuela. La única forma de evitar brotes comunitarios durante el calor es eliminar los criaderos:
        </p>

        <div class="steps-grid">
          {#each LAVA_ESCOBILLA_STEPS as st}
            <div class="step-box">
              <span class="step-num">{st.num}</span>
              <h3 class="step-title">{st.title}</h3>
              <p class="step-desc">{st.desc}</p>
            </div>
          {/each}
        </div>

        <div class="warning-callout">
          <AlertTriangle size={20} class="warning-icon" aria-hidden="true" />
          <div>
            <strong>¡CUIDADO CON LA AUTOMEDICACIÓN EN DENGUE!</strong>
            <p>
              Si tienes sospecha de dengue (fiebre con dolor de cuerpo o detrás de los ojos),
              <strong>NUNCA tomes aspirina, ibuprofeno, naproxeno ni diclofenaco</strong>. Estos medicamentos alteran la coagulación sanguínea y pueden desencadenar hemorragias graves o mortales.
              Bebe abundante suero oral y acude de inmediato a tu posta o centro de salud más cercano.
            </p>
          </div>
        </div>
      </section>

      <!-- Official Health Lines & Quick Links -->
      <section class="resources-box" aria-labelledby="lines-title">
        <h2 id="lines-title" class="resources-title">Canales Oficiales del MINSA en caso de emergencia</h2>
        <div class="resources-grid">
          <a class="resource-card" href="tel:113">
            <span class="resource-pill">Línea gratuita 113</span>
            <strong>Opción 5: Dengue y enfermedades transmitidas por vectores</strong>
            <span class="resource-note">Atención médica y de enfermería las 24 horas del día a nivel nacional.</span>
          </a>
          <a class="resource-card" href="tel:106">
            <span class="resource-pill">SAMU 106</span>
            <strong>Emergencias y ambulancias</strong>
            <span class="resource-note">Para pacientes con signos de shock, desmayo, vómitos repetidos o sangrado.</span>
          </a>
          <a class="resource-card" href="/sintomas/dengue-y-clima">
            <span class="resource-pill">Guía en RUPAQ</span>
            <strong>Paso a paso ante sospecha de dengue</strong>
            <span class="resource-note">Instrucciones de triaje, hidratación y qué no tomar.</span>
          </a>
          <a class="resource-card" href="/mas/hidratacion">
            <span class="resource-pill">Agua segura</span>
            <strong>Puntos de recarga e hidratación</strong>
            <span class="resource-note">Directorio de agua potable segura para evitar consumir agua contaminada.</span>
          </a>
        </div>
      </section>

      <!-- References Footer -->
      <footer class="sources-footer">
        <p>
          <strong>Referencias y fuentes técnicas:</strong>
          Centro Nacional de Epidemiología, Prevención y Control de Enfermedades (CDC Perú) · Alertas Epidemiológicas por Dengue, Leptospirosis y EDAs · Sala Situacional de Salud del MINSA · Organización Panamericana de la Salud (OPS) "Impacto del Cambio Climático y el Fenómeno El Niño en Enfermedades Infecciosas en Perú".
        </p>
      </footer>
    </div>
  </div>
</div>

<style>
  .climate-screen {
    background: var(--paper);
    color: var(--ink);
  }

  .reading-body {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin-top: 16px;
  }

  /* Banner Epidemiológico */
  .banner-epidemiologico {
    background: #fff4ed;
    border: 1px solid rgba(220, 38, 38, 0.28);
    border-radius: 14px;
    padding: 18px 20px;
    color: #451a03;
  }
  :global(html[data-theme='dark']) .banner-epidemiologico {
    background: rgba(127, 29, 29, 0.2);
    border-color: rgba(239, 68, 68, 0.35);
    color: #fecaca;
  }
  .banner-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .banner-head h2 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: #991b1b;
  }
  :global(html[data-theme='dark']) .banner-head h2 {
    color: #f87171;
  }
  .banner-text {
    font-size: 0.9375rem;
    line-height: 1.55;
    margin: 0 0 10px;
  }
  .banner-meta {
    font-size: 0.8125rem;
    color: #78350f;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  :global(html[data-theme='dark']) .banner-meta {
    color: #fca5a5;
  }

  /* Section Cards */
  .section-card {
    background: var(--field);
    border: 1px solid var(--hairline-strong);
    border-radius: 14px;
    padding: 22px;
  }
  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    letter-spacing: -0.02em;
  }
  .section-desc {
    font-size: 0.9375rem;
    color: var(--ink-soft);
    margin: -6px 0 16px;
    line-height: 1.5;
  }
  .inline-icon {
    flex-shrink: 0;
  }
  .text-danger {
    color: #dc2626;
  }
  .text-warning {
    color: #d97706;
  }
  .text-primary {
    color: #0284c7;
  }
  .text-success {
    color: #16a34a;
  }

  /* Stat Highlights */
  .stat-highlight-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin: 18px 0;
  }
  .stat-box {
    background: var(--paper);
    border: 1px solid var(--hairline);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }
  .stat-num {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 4px;
  }
  .stat-label {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 6px;
  }
  .stat-desc {
    font-size: 0.8125rem;
    color: var(--ink-soft);
    line-height: 1.45;
    margin: 0;
  }

  /* Callouts */
  .callout {
    padding: 16px;
    border-radius: 10px;
    margin-top: 16px;
  }
  .callout--danger {
    background: rgba(220, 38, 38, 0.08);
    border-left: 4px solid #dc2626;
  }
  :global(html[data-theme='dark']) .callout--danger {
    background: rgba(220, 38, 38, 0.16);
  }
  .callout-title {
    display: block;
    font-size: 0.9375rem;
    color: #991b1b;
    margin-bottom: 6px;
  }
  :global(html[data-theme='dark']) .callout-title {
    color: #fca5a5;
  }
  .callout p {
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }

  /* Diseases list */
  .diseases-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 14px;
  }
  .disease-card {
    background: var(--paper);
    border: 1px solid var(--hairline-strong);
    border-radius: 12px;
    padding: 18px;
  }
  .disease-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--hairline);
  }
  .disease-title-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .disease-icon {
    margin-top: 2px;
    color: #d97706;
  }
  .disease-name {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: var(--ink);
  }
  .disease-vector {
    font-size: 0.8125rem;
    color: var(--ink-soft);
  }
  .disease-badge {
    background: #fef3c7;
    color: #92400e;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    white-space: nowrap;
  }
  :global(html[data-theme='dark']) .disease-badge {
    background: #78350f;
    color: #fef3c7;
  }
  .disease-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .disease-field p {
    font-size: 0.875rem;
    line-height: 1.45;
    margin: 2px 0 0;
  }
  .field-label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--ink);
  }
  .disease-alarm {
    background: rgba(220, 38, 38, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    margin-top: 6px;
  }
  .alarm-label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #dc2626;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }
  .alarm-text {
    font-size: 0.875rem;
    color: var(--ink);
    margin: 0;
    line-height: 1.45;
  }

  /* Table styling */
  .table-responsive {
    overflow-x: auto;
    margin-top: 10px;
  }
  .cdc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    text-align: left;
  }
  .cdc-table th {
    background: var(--field);
    padding: 10px 12px;
    font-weight: 700;
    border-bottom: 2px solid var(--hairline-strong);
    color: var(--ink);
    white-space: nowrap;
  }
  .cdc-table td {
    padding: 12px;
    border-bottom: 1px solid var(--hairline);
    vertical-align: top;
    color: var(--ink);
  }
  .cdc-table code {
    font-size: 0.8125rem;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 5px;
    border-radius: 4px;
  }
  :global(html[data-theme='dark']) .cdc-table code {
    background: rgba(255, 255, 255, 0.1);
  }
  .table-desc {
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--ink-soft);
  }
  .table-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
  }
  .badge--danger {
    background: #fee2e2;
    color: #991b1b;
  }
  .badge--warning {
    background: #ffedd5;
    color: #9a3412;
  }
  .badge--attention {
    background: #fef9c3;
    color: #854d0e;
  }
  :global(html[data-theme='dark']) .badge--danger {
    background: #7f1d1d;
    color: #fecaca;
  }
  :global(html[data-theme='dark']) .badge--warning {
    background: #7c2d12;
    color: #fed7aa;
  }
  :global(html[data-theme='dark']) .badge--attention {
    background: #713f12;
    color: #fef08a;
  }

  /* Protocol steps */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin: 16px 0;
  }
  .step-box {
    background: var(--paper);
    border: 1px solid var(--hairline);
    border-radius: 12px;
    padding: 16px;
    position: relative;
  }
  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #16a34a;
    color: #ffffff;
    font-weight: 800;
    font-size: 0.875rem;
    margin-bottom: 8px;
  }
  .step-title {
    font-size: 0.9375rem;
    font-weight: 700;
    margin: 0 0 6px;
  }
  .step-desc {
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--ink-soft);
    margin: 0;
  }

  /* Warning Callout */
  .warning-callout {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #fee2e2;
    border: 2px solid #ef4444;
    border-radius: 12px;
    padding: 16px;
    color: #7f1d1d;
    margin-top: 18px;
  }
  :global(html[data-theme='dark']) .warning-callout {
    background: rgba(127, 29, 29, 0.35);
    border-color: #ef4444;
    color: #fecaca;
  }
  .warning-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: #dc2626;
  }
  :global(html[data-theme='dark']) .warning-icon {
    color: #f87171;
  }
  .warning-callout strong {
    display: block;
    font-size: 0.9375rem;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .warning-callout p {
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }

  /* Resources */
  .resources-box {
    margin-top: 10px;
  }
  .resources-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 14px;
  }
  .resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }
  .resource-card {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-radius: 12px;
    background: var(--field);
    border: 1px solid var(--hairline-strong);
    text-decoration: none;
    color: var(--ink);
    transition: transform 0.15s ease, border-color 0.15s ease;
  }
  .resource-card:hover {
    transform: translateY(-2px);
    border-color: var(--brand, #16a34a);
  }
  .resource-pill {
    display: inline-block;
    align-self: flex-start;
    padding: 2px 8px;
    border-radius: 100px;
    background: rgba(0, 0, 0, 0.08);
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 8px;
  }
  :global(html[data-theme='dark']) .resource-pill {
    background: rgba(255, 255, 255, 0.15);
  }
  .resource-card strong {
    font-size: 0.9375rem;
    margin-bottom: 4px;
  }
  .resource-note {
    font-size: 0.8125rem;
    color: var(--ink-soft);
    line-height: 1.4;
  }

  /* La fase nocturna también oscurece el fondo global, aunque el tema elegido sea automático o claro. */
  :global(.app-shell[data-phase='night']) .banner-epidemiologico,
  :global(.app-shell[data-phase='night']) .callout--danger,
  :global(.app-shell[data-phase='night']) .warning-callout {
    color: #f4e7d6;
  }

  :global(.app-shell[data-phase='night']) .banner-epidemiologico {
    background: rgba(127, 29, 29, 0.2);
    border-color: rgba(239, 68, 68, 0.35);
  }

  :global(.app-shell[data-phase='night']) .banner-head h2,
  :global(.app-shell[data-phase='night']) .banner-meta,
  :global(.app-shell[data-phase='night']) .callout-title,
  :global(.app-shell[data-phase='night']) .warning-callout {
    color: #fecaca;
  }

  :global(.app-shell[data-phase='night']) .disease-badge {
    background: #78350f;
    color: #fef3c7;
  }

  :global(.app-shell[data-phase='night']) .warning-callout {
    border-color: #ef4444;
  }

  :global(.app-shell[data-phase='night']) .resource-pill {
    background: rgba(255, 255, 255, 0.15);
    color: #d9f99d;
  }

  /* Footer */
  .sources-footer {
    font-size: 0.75rem;
    color: var(--ink-muted, #78716c);
    line-height: 1.5;
    border-top: 1px solid var(--hairline);
    padding-top: 16px;
    margin-top: 10px;
  }
</style>

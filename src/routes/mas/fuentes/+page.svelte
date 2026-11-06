<script lang="ts">
  import { ExternalLink } from '@lucide/svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import sources from '$lib/content/sources.json';
  import thresholds from '$lib/content/thresholds.json';

  const zoneLabels: Record<string, string> = {
    costa_norte: 'Costa norte',
    costa_central: 'Costa central',
    sierra: 'Sierra',
    amazonia: 'Amazonía'
  };
  const zones = Object.entries(thresholds.zonas);
</script>

<svelte:head>
  <title>Fuentes y método · Rupaq</title>
  <meta
    name="description"
    content="De dónde vienen los datos de Rupaq, cómo se calcula la sensación térmica y cuáles son los límites del pronóstico."
  />
</svelte:head>

<div class="screen">
  <div class="page reading-page sources-page">
    <PageIntro
      back="/mas"
      backLabel="Más"
      kicker="Transparencia"
      title="De dónde viene el dato"
      intro="Cada número de Rupaq tiene un origen. Aquí explicamos qué usamos, cómo lo calculamos y qué no podemos prometer."
    />

    <div class="reading-body">
      <section aria-labelledby="method-title">
        <h2 id="method-title">El método, en corto</h2>
        <ol>
          <li>
            <strong>Pronóstico:</strong> pedimos temperatura, humedad, UV, viento y probabilidad de lluvia
            por hora a Open-Meteo para el distrito elegido.
          </li>
          <li>
            <strong>Sensación térmica:</strong> calculamos el índice de calor con la regresión de
            Rothfusz cuando la temperatura es alta y el método simple de Steadman cuando hace menos
            calor.
          </li>
          <li>
            <strong>Riesgo:</strong> comparamos la sensación térmica con umbrales por zona climática.
            Si elegiste un perfil, el umbral baja para activar la alerta antes.
          </li>
          <li>
            <strong>Noche:</strong> usamos la temperatura mínima diaria y el horario local de Perú. La
            mínima nocturna destaca cuando el cuerpo no alcanza a recuperarse.
          </li>
          <li>
            <strong>Frescura:</strong> el pronóstico se guarda en caché. Si tiene más de 90 minutos, la
            app lo marca como viejo. Si no hay conexión, usa la última copia guardada.
          </li>
        </ol>
        <p class="method-note">{thresholds.metodo}</p>
      </section>

      <section aria-labelledby="zones-title">
        <h2 id="zones-title">Umbrales por zona</h2>
        <p>
          Son puntos de partida provisionales para comunicar riesgo comunitario. No son un diagnóstico ni
          un aviso oficial. Puno no se comporta como Iquitos, y por eso no usamos un solo número para todo
          el país.
        </p>
        <div class="table-wrap">
          <table>
            <caption class="sr-only">Umbrales de sensación térmica por zona climática</caption>
            <thead>
              <tr>
                <th scope="col">Zona</th>
                <th scope="col">Atención</th>
                <th scope="col">Precaución</th>
                <th scope="col">Peligro</th>
                <th scope="col">Extremo</th>
              </tr>
            </thead>
            <tbody>
              {#each zones as [zone, values]}
                <tr>
                  <th scope="row">{zoneLabels[zone] ?? zone}</th>
                  <td>{values.attention}°</td>
                  <td>{values.precaution}°</td>
                  <td>{values.danger}°</td>
                  <td>{values.extreme}°</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="table-note">
          Los umbrales bajan hasta 3 °C según los perfiles marcados. La app muestra siempre la palabra y
          el patrón, no solo el color.
        </p>
      </section>

      <section aria-labelledby="limits-title">
        <h2 id="limits-title">Lo que el pronóstico no puede hacer</h2>
        <ul>
          <li>No mide el calor dentro de tu casa, un cuarto sin ventanas o un auto.</li>
          <li>No conoce tu estado de salud ni reemplaza una evaluación médica.</li>
          <li>No es un aviso oficial de SENAMHI. Si hay alerta oficial, esa manda.</li>
          <li>Puede fallar si Open-Meteo no responde o si el distrito tiene microclimas muy distintos.</li>
          <li>La altitud y la zona son una aproximación, no una estación meteorológica en tu esquina.</li>
        </ul>
        <div class="callout callout--danger">
          <span class="callout__label">Emergencia</span>
          <p>
            Ante confusión, desmayo, convulsión o dificultad para respirar, llama al <strong>106</strong>.
            No esperes a que el pronóstico cambie.
          </p>
        </div>
      </section>

      <section aria-labelledby="sources-title">
        <h2 id="sources-title">Fuentes consultadas</h2>
        <ul class="source-list">
          {#each sources.fuentes as source}
            <li>
              <p class="source-institution">{source.institucion}</p>
              <h3>{source.titulo}</h3>
              <p>{source.uso}</p>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                Abrir fuente
                <ExternalLink size={15} strokeWidth={1.9} aria-hidden="true" />
              </a>
            </li>
          {/each}
        </ul>
      </section>

      <section aria-labelledby="review-title">
        <h2 id="review-title">Revisión del contenido</h2>
        <div class="review-box">
          <p class="review-status">{sources.revisado_por}</p>
          <p>
            Versión {sources.version} · {sources.fecha_revision}. Los umbrales son una herramienta de
            orientación comunitaria y deben validarse con MINSA y SENAMHI antes de una campaña pública.
          </p>
        </div>
        <p class="source-note">
          Datos meteorológicos de Open-Meteo, licencia CC BY 4.0. Ubigeo distrital de INEI/RENIEC a través
          del proyecto ubigeo-peru-aumentado. Rupaq no está afiliada a SENAMHI ni al Estado peruano.
        </p>
      </section>
    </div>
  </div>
</div>

<style>
  .sources-page {
    max-width: 860px;
  }

  .method-note {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--hairline);
    color: var(--ink-mute) !important;
    font-size: 0.9375rem !important;
  }

  .table-wrap {
    margin-top: 16px;
    overflow-x: auto;
    border-top: 1px solid var(--hairline);
  }

  table {
    width: 100%;
    min-width: 480px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 11px 8px;
    border-bottom: 1px solid var(--hairline-soft);
    text-align: right;
    font-size: 0.9375rem;
  }

  th:first-child {
    text-align: left;
  }

  thead th {
    font-size: 0.8125rem;
    color: var(--ink-mute);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
  }

  tbody th {
    font-weight: 650;
  }

  tbody td {
    color: var(--ink-soft);
  }

  .table-note {
    margin-top: 10px;
    color: var(--ink-mute) !important;
    font-size: 0.875rem !important;
  }

  .source-list {
    margin-top: 4px;
  }

  .source-list li {
    padding: 16px 0 !important;
  }

  .source-institution {
    margin: 0 !important;
    font-size: 0.875rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-mute) !important;
  }

  .source-list h3 {
    margin-top: 4px;
    font-size: 1.15rem;
  }

  .source-list p {
    margin-top: 5px;
    font-size: 0.9375rem;
  }

  .source-list a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 40px;
    margin-top: 4px;
    font-size: 0.9375rem;
    font-weight: 650;
    color: var(--ink-soft);
  }

  .review-box {
    margin-top: 14px;
    padding: 15px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }

  .review-status {
    margin: 0 !important;
    color: var(--ink) !important;
    font-weight: 650;
  }

  @media (min-width: 700px) {
    th,
    td {
      padding: 12px 12px;
    }
  }
</style>

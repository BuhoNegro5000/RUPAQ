<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import {
    ChevronLeft,
    Compass,
    Droplet,
    Droplets,
    ExternalLink,
    Filter,
    Flame,
    HeartPulse,
    Info,
    Layers,
    Map,
    MapPin,
    Navigation,
    Plus,
    Search,
    Share2,
    ShieldCheck,
    Sparkles,
    Store,
    ThumbsDown,
    ThumbsUp,
    Wind,
    X
  } from '@lucide/svelte';
  import {
    INITIAL_HYDRATION_POINTS,
    calculateDistanceKm,
    formatDistance,
    getDirectionsUrl,
    type HydrationCategory,
    type HydrationPoint
  } from '$lib/data/hydration-points';
  import { selectedLocation } from '$lib/stores/location';
  import { forecast } from '$lib/stores/forecast';
  import HydrationMap from '$lib/components/HydrationMap.svelte';

  // State
  let allPoints: HydrationPoint[] = [];
  let userCoords: { lat: number; lon: number } | null = null;
  let isLocating = false;
  let geoError = '';
  let selectedCategory: 'all' | HydrationCategory = 'all';
  let selectedDistrict = 'all';
  let searchQuery = '';
  let selectedPoint: HydrationPoint | null = null;
  let showMap = true;
  let reportedPoints: Record<string, 'ok' | 'issue'> = {};

  // New point form state
  let showAddModal = false;
  let newName = '';
  let newDistrict = 'Miraflores';
  let newAddress = '';
  let newCategory: HydrationCategory = 'fountain';
  let newDescription = '';
  let newHasPets = false;
  let formSuccess = '';

  // Calculator state
  let calcActivity: 'rest' | 'walk' | 'sport' | 'work' = 'walk';
  let calcHours = 2;
  $: ambientTemp = $forecast?.now.tempC ?? 27;

  $: districtsList = Array.from(
    new Set(allPoints.map((p) => p.district))
  ).sort();

  // Load points and user feedback from localStorage
  onMount(() => {
    if (!browser) return;

    // Load custom user points
    const savedCustomPoints = localStorage.getItem('rupaq_custom_hydration_points');
    let customPoints: HydrationPoint[] = [];
    if (savedCustomPoints) {
      try {
        customPoints = JSON.parse(savedCustomPoints);
      } catch (e) {
        console.warn('Failed to parse custom points:', e);
      }
    }

    allPoints = [...customPoints, ...INITIAL_HYDRATION_POINTS];

    // Load reported points status
    const savedReports = localStorage.getItem('rupaq_hydration_reports');
    if (savedReports) {
      try {
        reportedPoints = JSON.parse(savedReports);
      } catch (e) {}
    }

    // Try reading current district from store to set default filter if present in Lima
    const currentDist = $selectedLocation.distrito;
    if (currentDist && districtsList.includes(currentDist)) {
      selectedDistrict = currentDist;
    }
  });

  // Request user GPS
  function requestLocation() {
    if (!('geolocation' in navigator)) {
      geoError = 'Tu navegador no soporta geolocalización.';
      return;
    }

    isLocating = true;
    geoError = '';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        isLocating = false;
        // Reset district filter to 'all' so nearby points from any adjacent district appear
        selectedDistrict = 'all';
      },
      (err) => {
        isLocating = false;
        geoError = 'No pudimos obtener tu ubicación. Elige tu distrito en el filtro.';
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Filtered and sorted points
  $: filteredPoints = allPoints
    .filter((pt) => {
      if (selectedCategory !== 'all' && pt.category !== selectedCategory) {
        return false;
      }
      if (selectedDistrict !== 'all' && pt.district !== selectedDistrict) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = pt.name.toLowerCase().includes(q);
        const matchesAddress = pt.address.toLowerCase().includes(q);
        const matchesDistrict = pt.district.toLowerCase().includes(q);
        const matchesDesc = pt.description.toLowerCase().includes(q);
        if (!matchesName && !matchesAddress && !matchesDistrict && !matchesDesc) {
          return false;
        }
      }
      return true;
    })
    .map((pt) => {
      let distanceKm: number | null = null;
      if (userCoords) {
        distanceKm = calculateDistanceKm(
          userCoords.lat,
          userCoords.lon,
          pt.lat,
          pt.lon
        );
      }
      return { ...pt, distanceKm };
    })
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return a.name.localeCompare(b.name);
    });

  function selectPoint(pt: HydrationPoint) {
    selectedPoint = pt;
  }

  function reportPoint(id: string, status: 'ok' | 'issue') {
    reportedPoints[id] = status;
    if (browser) {
      localStorage.setItem('rupaq_hydration_reports', JSON.stringify(reportedPoints));
    }
  }

  function saveCustomPoint() {
    if (!newName.trim() || !newAddress.trim()) return;

    // Use approximate district coordinate or user coords
    const baseLat = userCoords ? userCoords.lat : -12.12;
    const baseLon = userCoords ? userCoords.lon : -77.03;

    const newPt: HydrationPoint = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      district: newDistrict,
      address: newAddress.trim(),
      category: newCategory,
      categoryLabel:
        newCategory === 'fountain'
          ? 'Bebedero público gratuito'
          : newCategory === 'climate_refuge'
          ? 'Refugio climatizado'
          : 'Tienda 24h',
      description: newDescription.trim() || 'Punto registrado por la comunidad.',
      lat: baseLat + (Math.random() - 0.5) * 0.005,
      lon: baseLon + (Math.random() - 0.5) * 0.005,
      isFree: newCategory === 'fountain',
      hasPetsWater: newHasPets,
      hasAC: newCategory === 'climate_refuge',
      is24h: newCategory === 'convenience',
      hasRestrooms: newCategory === 'climate_refuge',
      verifiedStatus: 'user',
      reportOkCount: 1
    };

    allPoints = [newPt, ...allPoints];

    if (browser) {
      const saved = localStorage.getItem('rupaq_custom_hydration_points');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newPt);
      localStorage.setItem('rupaq_custom_hydration_points', JSON.stringify(list));
    }

    formSuccess = '¡Punto guardado con éxito! Ya aparece en tu lista y mapa.';
    setTimeout(() => {
      showAddModal = false;
      newName = '';
      newAddress = '';
      newDescription = '';
      formSuccess = '';
    }, 1500);
  }

  // Hydration calculator calculation
  $: calcResult = (() => {
    let baseMlPerHour = 250;
    if (calcActivity === 'walk') baseMlPerHour = 450;
    if (calcActivity === 'sport') baseMlPerHour = 750;
    if (calcActivity === 'work') baseMlPerHour = 900;

    // Temperature adjustment
    if (ambientTemp > 28) baseMlPerHour *= 1.25;
    if (ambientTemp > 32) baseMlPerHour *= 1.45;

    const totalMl = Math.round(baseMlPerHour * calcHours);
    const totalLiters = (totalMl / 1000).toFixed(1);
    const refills750ml = Math.ceil(totalMl / 750);
    const intakeIntervalMins = calcActivity === 'sport' || calcActivity === 'work' ? 20 : 35;

    return {
      totalLiters,
      refills750ml,
      intakeIntervalMins,
      needsElectrolytes: calcHours >= 1.5 && (calcActivity === 'sport' || calcActivity === 'work' || ambientTemp >= 30)
    };
  })();
</script>

<svelte:head>
  <title>Puntos de Hidratación en Lima · RUPAQ</title>
  <meta
    name="description"
    content="Herramienta interactiva para ubicar bebederos públicos gratuitos, refugios climáticos con aire acondicionado y tiendas 24h de agua en Lima. Cálculo de distancia GPS y cómo llegar con Google Maps."
  />
  <meta property="og:title" content="Puntos de Hidratación en Lima · RUPAQ" />
  <meta
    property="og:description"
    content="Mapa interactivo de bebederos públicos, refugios climáticos con A/C y puntos de recarga de agua en Lima. Con geolocalización GPS y calculadora de hidratación."
  />
  <meta property="og:url" content="https://rupaq.pe/mas/hidratacion" />
  <meta name="twitter:title" content="Puntos de Hidratación en Lima · RUPAQ" />
  <meta
    name="twitter:description"
    content="Mapa interactivo de bebederos públicos y refugios climáticos en Lima con cálculo de distancia y ruta inmediata."
  />
</svelte:head>

<div class="screen hydration-screen" role="region" aria-label="Módulo de Puntos de Hidratación">
  <div class="page hydration-page">
    <!-- Header -->
    <header class="hydration-header">
      <a class="back-link" href="/mas" aria-label="Volver al menú Más">
        <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
        <span>Más</span>
      </a>
      <div class="header-titles">
        <div class="tool-badge">
          <Droplet size={14} strokeWidth={2.5} aria-hidden="true" />
          <span>Herramienta Interactiva</span>
        </div>
        <h1 class="page-title">Puntos de Hidratación</h1>
        <p class="page-sub">
          Ubica bebederos públicos gratuitos, refugios climáticos y fuentes de recarga en Lima con cálculo de distancia GPS y ruta inmediata.
        </p>
      </div>
    </header>

    <!-- Barra de Control Rápido: GPS, Búsqueda y Filtros -->
    <section class="toolbar-card" aria-label="Controles de búsqueda de agua">
      <div class="toolbar-top">
        <div class="search-input-wrap">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por parque, calle o lugar..."
            bind:value={searchQuery}
            aria-label="Buscar punto de hidratación"
          />
          {#if searchQuery}
            <button
              type="button"
              class="clear-btn"
              onclick={() => (searchQuery = '')}
              aria-label="Limpiar búsqueda"
            >
              <X size={16} strokeWidth={2} />
            </button>
          {/if}
        </div>

        <button
          type="button"
          class="gps-btn"
          class:gps-btn--active={userCoords !== null}
          onclick={requestLocation}
          disabled={isLocating}
          aria-label="Usar mi ubicación GPS para ordenar por cercanía"
        >
          <Navigation size={18} strokeWidth={2} class={isLocating ? 'spin-anim' : ''} aria-hidden="true" />
          <span>{isLocating ? 'Ubicando…' : userCoords ? 'GPS Activo' : 'Cerca de mí'}</span>
        </button>
      </div>

      {#if geoError}
        <p class="geo-alert" role="alert">{geoError}</p>
      {/if}

      <!-- Filtros de categoría -->
      <div class="category-chips" role="radiogroup" aria-label="Filtrar por categoría">
        <button
          type="button"
          class="chip"
          class:chip--active={selectedCategory === 'all'}
          onclick={() => (selectedCategory = 'all')}
        >
          Todos ({allPoints.length})
        </button>
        <button
          type="button"
          class="chip"
          class:chip--active={selectedCategory === 'fountain'}
          onclick={() => (selectedCategory = 'fountain')}
        >
          🚰 Bebederos gratuitos
        </button>
        <button
          type="button"
          class="chip"
          class:chip--active={selectedCategory === 'climate_refuge'}
          onclick={() => (selectedCategory = 'climate_refuge')}
        >
          ❄️ Refugios con A/C
        </button>
        <button
          type="button"
          class="chip"
          class:chip--active={selectedCategory === 'convenience'}
          onclick={() => (selectedCategory = 'convenience')}
        >
          🏪 Tiendas 24h
        </button>
      </div>

      <!-- Selector de Distrito y Vista -->
      <div class="toolbar-bottom">
        <div class="district-select-wrap">
          <label for="district-picker">Distrito:</label>
          <select id="district-picker" bind:value={selectedDistrict}>
            <option value="all">Todos los distritos de Lima</option>
            {#each districtsList as dist}
              <option value={dist}>{dist}</option>
            {/each}
          </select>
        </div>

        <div class="view-toggles">
          <button
            type="button"
            class="view-toggle-btn"
            class:view-toggle-btn--active={showMap}
            onclick={() => (showMap = !showMap)}
            aria-label={showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
          >
            <Map size={16} strokeWidth={2} aria-hidden="true" />
            <span>{showMap ? 'Ocultar mapa' : 'Ver mapa'}</span>
          </button>

          <button
            type="button"
            class="add-point-trigger"
            onclick={() => (showAddModal = true)}
            aria-label="Registrar un nuevo punto de agua"
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            <span>Añadir punto</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Mapa Interactivo Leaflet -->
    {#if showMap}
      <section class="map-section" aria-label="Visualizador en mapa">
        <HydrationMap
          points={filteredPoints}
          {selectedPoint}
          {userCoords}
          onSelect={selectPoint}
        />
        <div class="map-legend">
          <span class="legend-item"><span class="legend-dot" style="background: #2563eb;"></span> Bebedero público</span>
          <span class="legend-item"><span class="legend-dot" style="background: #7c3aed;"></span> Refugio climatizado</span>
          <span class="legend-item"><span class="legend-dot" style="background: #d97706;"></span> Tienda 24h</span>
        </div>
      </section>
    {/if}

    <!-- Puntos de Hidratación -->
    <section class="points-section" aria-labelledby="results-title">
      <div class="results-meta">
        <h2 id="results-title">
          {filteredPoints.length === 1
            ? '1 punto de hidratación disponible'
            : `${filteredPoints.length} puntos de hidratación disponibles`}
        </h2>
        {#if userCoords}
          <span class="sorted-badge">📍 Ordenados por cercanía a tu ubicación</span>
        {/if}
      </div>

      <ul class="points-grid">
        {#each filteredPoints as pt (pt.id)}
          <li class="point-item">
            <article
              class="point-card"
              class:point-card--selected={selectedPoint?.id === pt.id}
            >
              <div class="card-head">
                <span
                  class="cat-badge"
                  class:cat-badge--fountain={pt.category === 'fountain'}
                  class:cat-badge--refuge={pt.category === 'climate_refuge'}
                  class:cat-badge--store={pt.category === 'convenience'}
                >
                  {pt.category === 'fountain' ? '🚰 Bebedero público' : pt.category === 'climate_refuge' ? '❄️ Refugio con A/C' : '🏪 Tienda 24h'}
                </span>

                {#if pt.distanceKm !== null}
                  <span class="distance-pill">
                    <Navigation size={13} strokeWidth={2.2} aria-hidden="true" />
                    {formatDistance(pt.distanceKm)}
                  </span>
                {/if}
              </div>

              <h3 class="card-title">{pt.name}</h3>
              <p class="card-district">
                <MapPin size={14} strokeWidth={2} aria-hidden="true" />
                <strong>{pt.district}:</strong> {pt.address}
              </p>
              <p class="card-desc">{pt.description}</p>

              <!-- Badges de características -->
              <div class="amenities-row">
                {#if pt.isFree}
                  <span class="amenity-tag">💧 100% Gratuito</span>
                {/if}
                {#if pt.hasPetsWater}
                  <span class="amenity-tag">🐕 Caño para mascotas</span>
                {/if}
                {#if pt.hasAC}
                  <span class="amenity-tag">❄️ Aire acondicionado</span>
                {/if}
                {#if pt.is24h}
                  <span class="amenity-tag">🕒 Abierto 24 horas</span>
                {/if}
                {#if pt.hasRestrooms}
                  <span class="amenity-tag">🚻 Servicios higiénicos</span>
                {/if}
                {#if pt.verifiedStatus === 'user'}
                  <span class="amenity-tag amenity-tag--user">⭐ Registrado por ti</span>
                {/if}
              </div>

              <!-- Acciones del punto -->
              <div class="card-actions">
                <a
                  href={getDirectionsUrl(pt.lat, pt.lon)}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-directions"
                >
                  <Navigation size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Cómo llegar</span>
                  <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
                </a>

                <!-- Comprobación comunitaria -->
                <div class="report-box" aria-label="Confirmar estado del bebedero">
                  <span class="report-label">¿Está saliendo agua?</span>
                  <button
                    type="button"
                    class="report-btn"
                    class:report-btn--active={reportedPoints[pt.id] === 'ok'}
                    onclick={() => reportPoint(pt.id, 'ok')}
                    title="Confirmar que sale agua con buena presión"
                  >
                    <ThumbsUp size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Sí ({reportedPoints[pt.id] === 'ok' ? (pt.reportOkCount ?? 0) + 1 : pt.reportOkCount ?? 0})</span>
                  </button>
                  <button
                    type="button"
                    class="report-btn"
                    class:report-btn--active={reportedPoints[pt.id] === 'issue'}
                    onclick={() => reportPoint(pt.id, 'issue')}
                    title="Reportar que no sale agua o está roto"
                  >
                    <ThumbsDown size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Sin agua</span>
                  </button>
                </div>
              </div>
            </article>
          </li>
        {:else}
          <li class="empty-state">
            <Droplets size={36} strokeWidth={1.5} aria-hidden="true" />
            <p>No se encontraron puntos con estos filtros.</p>
            <button
              type="button"
              class="reset-filters-btn"
              onclick={() => {
                selectedCategory = 'all';
                selectedDistrict = 'all';
                searchQuery = '';
              }}
            >
              Restablecer todos los filtros
            </button>
          </li>
        {/each}
      </ul>
    </section>

    <!-- Calculadora Táctica de Hidratación Urbana -->
    <section class="calculator-section" aria-labelledby="calc-title">
      <div class="calc-card">
        <div class="calc-head">
          <div class="calc-badge">
            <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
            <span>Herramienta de cálculo</span>
          </div>
          <h2 id="calc-title">Calculadora de Hidratación para tu Salida</h2>
          <p>
            Calcula la cantidad de líquido que tu cuerpo perderá hoy con base en la temperatura actual de
            <strong>{ambientTemp}°C</strong> y tu nivel de esfuerzo.
          </p>
        </div>

        <div class="calc-grid">
          <!-- Opciones de entrada -->
          <div class="calc-inputs">
            <label class="calc-field-label">
              <span>Tu actividad al aire libre:</span>
              <div class="activity-selector">
                <button
                  type="button"
                  class="activity-opt"
                  class:activity-opt--active={calcActivity === 'rest'}
                  onclick={() => (calcActivity = 'rest')}
                >
                  🛋️ En reposo / Sombra
                </button>
                <button
                  type="button"
                  class="activity-opt"
                  class:activity-opt--active={calcActivity === 'walk'}
                  onclick={() => (calcActivity = 'walk')}
                >
                  🚶 Caminata urbana
                </button>
                <button
                  type="button"
                  class="activity-opt"
                  class:activity-opt--active={calcActivity === 'sport'}
                  onclick={() => (calcActivity = 'sport')}
                >
                  🏃 Deporte / Ciclismo
                </button>
                <button
                  type="button"
                  class="activity-opt"
                  class:activity-opt--active={calcActivity === 'work'}
                  onclick={() => (calcActivity = 'work')}
                >
                  ☀️ Trabajo al sol
                </button>
              </div>
            </label>

            <label class="calc-field-label">
              <span>Tiempo de exposición previsto:</span>
              <div class="hours-slider-wrap">
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  bind:value={calcHours}
                  aria-label="Horas de exposición"
                />
                <div class="slider-labels">
                  <span>1 hora</span>
                  <strong class="hours-display">{calcHours} {calcHours === 1 ? 'hora' : 'horas'}</strong>
                  <span>8 horas</span>
                </div>
              </div>
            </label>
          </div>

          <!-- Resultados dinámicos -->
          <div class="calc-outputs">
            <div class="output-metric">
              <span class="metric-label">Líquido recomendado:</span>
              <div class="metric-big">
                <strong>{calcResult.totalLiters}</strong>
                <span>Litros</span>
              </div>
              <p class="metric-hint">
                Equivale a rellenar un tomatodo estándar de 750 ml <strong>{calcResult.refills750ml} {calcResult.refills750ml === 1 ? 'vez' : 'veces'}</strong>.
              </p>
            </div>

            <div class="output-pills">
              <div class="pill-info">
                <strong>Frecuencia de tomas</strong>
                <span>Bebe pequeños sorbos cada {calcResult.intakeIntervalMins} minutos sin esperar a tener sed.</span>
              </div>

              {#if calcResult.needsElectrolytes}
                <div class="pill-info pill-info--alert">
                  <strong>⚠️ Reposición de sales</strong>
                  <span>Por la intensidad y calor, complementa con agua de coco, suero oral o agua con una pizca de sal y limón.</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Guía y Protocolo Táctico -->
    <section class="tactical-guide" aria-labelledby="guide-title">
      <h2 id="guide-title" class="section-title">Estrategia Urbana para no quedar Deshidratado</h2>
      <div class="tactical-grid">
        <div class="tactical-card">
          <div class="tac-icon">🏠</div>
          <h3>Sal con la botella ya llena</h3>
          <p>
            El agua de caño en Lima es tratada y potable para la mayoría de residentes. Llena tu botella en casa u hotel. Los bebederos de la calle son para <em>rellenar en ruta</em>, no para empezar de cero.
          </p>
        </div>

        <div class="tactical-card">
          <div class="tac-icon">🛡️</div>
          <h3>Botellas con filtro portátil</h3>
          <p>
            Si tienes estómago sensible o vienes de fuera, una botella con filtro incorporado (tipo Grayl o LifeStraw) te permite rellenar en cualquier caño o parque de la ciudad con total tranquilidad microbiológica.
          </p>
        </div>

        <div class="tactical-card">
          <div class="tac-icon">☕</div>
          <h3>Pide recarga en cafeterías</h3>
          <p>
            En distritos como Miraflores, Barranco y San Isidro, la mayoría de cafeterías y restaurantes rellenan tu botella con agua filtrada si estás consumiendo o lo pides amablemente.
          </p>
        </div>

        <div class="tactical-card">
          <div class="tac-icon">🗺️</div>
          <h3>Apps con capa OpenStreetMap</h3>
          <p>
            Apps offline como <strong>Organic Maps</strong> y <strong>OsmAnd</strong> permiten descargar el mapa de Lima y activar la capa de "drinking_water" para ver fuentes incluso sin señal celular.
          </p>
        </div>
      </div>
    </section>
  </div>
</div>

<!-- Modal para Registrar Nuevo Punto de Agua -->
{#if showAddModal}
  <div
    class="modal-backdrop"
    role="presentation"
    onclick={() => (showAddModal = false)}
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        class="modal-close"
        onclick={() => (showAddModal = false)}
        aria-label="Cerrar ventana"
      >
        <X size={20} strokeWidth={2} />
      </button>

      <h2 id="add-modal-title">Registrar nuevo punto de agua</h2>
      <p class="modal-sub">
        ¿Conoces una fuente, bebedero o lugar de recarga que no aparece en la lista? Agrégalo para que se guarde en tu dispositivo.
      </p>

      <form onsubmit={(e) => { e.preventDefault(); saveCustomPoint(); }}>
        <div class="form-group">
          <label for="pt-name">Nombre del punto / parque:</label>
          <input
            id="pt-name"
            type="text"
            required
            placeholder="Ej. Bebedero Parque Clorinda Matto"
            bind:value={newName}
          />
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="pt-dist">Distrito:</label>
            <select id="pt-dist" bind:value={newDistrict}>
              {#each districtsList as dist}
                <option value={dist}>{dist}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="pt-cat">Tipo:</label>
            <select id="pt-cat" bind:value={newCategory}>
              <option value="fountain">🚰 Bebedero público gratuito</option>
              <option value="climate_refuge">❄️ Refugio con A/C</option>
              <option value="convenience">🏪 Tienda 24h</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="pt-addr">Dirección o referencia exacta:</label>
          <input
            id="pt-addr"
            type="text"
            required
            placeholder="Ej. Av. Arequipa cdra. 45, junto a la ciclovía"
            bind:value={newAddress}
          />
        </div>

        <div class="form-group">
          <label for="pt-desc">Observaciones (presión, estado, sombra):</label>
          <input
            id="pt-desc"
            type="text"
            placeholder="Ej. Sale agua limpia, buena presión y hay sombra."
            bind:value={newDescription}
          />
        </div>

        <label class="checkbox-label">
          <input type="checkbox" bind:checked={newHasPets} />
          <span>Tiene caño inferior para mascotas</span>
        </label>

        {#if formSuccess}
          <p class="success-message">{formSuccess}</p>
        {/if}

        <div class="modal-actions">
          <button type="submit" class="btn-primary">
            Guardar punto
          </button>
          <button type="button" class="btn-secondary" onclick={() => (showAddModal = false)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .hydration-page {
    max-width: 1040px;
    padding-bottom: 120px;
  }

  .hydration-header {
    padding: 16px 0 20px;
    border-bottom: 1px solid var(--hairline);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--ink-soft);
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    margin-bottom: 10px;
  }

  .tool-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--safe) 22%, transparent);
    color: var(--safe-ink);
    font-size: 0.8125rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .page-title {
    font-family: var(--font-display);
    font-size: clamp(1.85rem, 4vw, 2.5rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.035em;
    margin: 0;
  }

  .page-sub {
    margin-top: 6px;
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.45;
    max-width: 60ch;
  }

  /* Toolbar */
  .toolbar-card {
    margin-top: 20px;
    padding: 18px;
    background: var(--paper-high);
    border: 1px solid var(--hairline-strong);
    border-radius: 20px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .toolbar-top {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .search-input-wrap {
    flex: 1;
    min-width: 240px;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: var(--paper);
    border: 1px solid var(--hairline-strong);
    border-radius: 12px;
  }

  .search-input-wrap input {
    flex: 1;
    height: 46px;
    border: none;
    background: transparent;
    color: var(--ink);
    font-size: 0.9375rem;
    outline: none;
    padding-left: 8px;
  }

  .clear-btn {
    color: var(--ink-mute);
    padding: 4px;
    border-radius: 50%;
  }

  .gps-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    padding: 0 18px;
    border-radius: 12px;
    background: var(--ink);
    color: var(--paper);
    font-weight: 650;
    font-size: 0.9375rem;
    cursor: pointer;
    flex: none;
    transition: transform 0.15s ease;
  }

  .gps-btn--active {
    background: #0284c7;
    color: #ffffff;
  }

  .geo-alert {
    color: var(--danger-ink);
    font-size: 0.875rem;
    margin: -4px 0 0;
  }

  .category-chips {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }

  .category-chips::-webkit-scrollbar {
    display: none;
  }

  .chip {
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid var(--hairline-strong);
    background: var(--paper);
    color: var(--ink-soft);
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .chip--active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  .toolbar-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding-top: 10px;
    border-top: 1px solid var(--hairline);
  }

  .district-select-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .district-select-wrap label {
    font-size: 0.875rem;
    font-weight: 650;
    color: var(--ink-soft);
  }

  .district-select-wrap select {
    min-height: 40px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid var(--hairline-strong);
    background: var(--paper);
    color: var(--ink);
    font-size: 0.9375rem;
  }

  .district-select-wrap select option {
    background-color: var(--paper);
    color: var(--ink);
  }

  .view-toggles {
    display: flex;
    gap: 8px;
  }

  .view-toggle-btn,
  .add-point-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid var(--hairline-strong);
    background: var(--paper);
    color: var(--ink);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  .view-toggle-btn--active {
    background: color-mix(in srgb, var(--ink) 10%, var(--paper));
    border-color: var(--ink-mute);
  }

  .add-point-trigger {
    background: color-mix(in srgb, var(--safe) 15%, var(--paper));
    color: var(--safe-ink);
    border-color: var(--safe);
  }

  /* Map section */
  .map-section {
    margin-top: 18px;
  }

  .map-legend {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: 0.8125rem;
    color: var(--ink-soft);
    flex-wrap: wrap;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  /* Results meta */
  .results-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 26px;
    flex-wrap: wrap;
  }

  .results-meta h2 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .sorted-badge {
    font-size: 0.8125rem;
    color: #0284c7;
    font-weight: 650;
    background: color-mix(in srgb, #0284c7 15%, transparent);
    padding: 3px 10px;
    border-radius: 999px;
  }

  /* Points Grid */
  .points-section {
    margin-top: 14px;
  }

  .points-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 14px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .point-item {
    display: flex;
    flex-direction: column;
  }

  .point-card {
    height: 100%;
    background: var(--paper-high);
    border: 1px solid var(--hairline-strong);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .point-card:hover {
    border-color: var(--ink-soft);
  }

  .point-card--selected {
    border-color: #0284c7;
    box-shadow: 0 0 0 2px #0284c7;
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .cat-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
  }

  .cat-badge--fountain {
    background: color-mix(in srgb, #2563eb 15%, transparent);
    color: #2563eb;
  }

  .cat-badge--refuge {
    background: color-mix(in srgb, #7c3aed 15%, transparent);
    color: #7c3aed;
  }

  .cat-badge--store {
    background: color-mix(in srgb, #d97706 15%, transparent);
    color: #d97706;
  }

  :global([data-phase='night']) .cat-badge--fountain {
    color: #60a5fa;
  }

  :global([data-phase='night']) .cat-badge--refuge {
    color: #c084fc;
  }

  :global([data-phase='night']) .cat-badge--store {
    color: #fbbf24;
  }

  .distance-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8125rem;
    font-weight: 700;
    color: #0284c7;
    background: color-mix(in srgb, #0284c7 15%, transparent);
    padding: 2px 8px;
    border-radius: 999px;
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 8px 0 4px;
  }

  .card-district {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.875rem;
    color: var(--ink-soft);
    margin: 0;
  }

  .card-desc {
    font-size: 0.875rem;
    line-height: 1.4;
    color: var(--ink-soft);
    margin: 8px 0;
  }

  .amenities-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }

  .amenity-tag {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--paper);
    color: var(--ink-soft);
    border: 1px solid var(--hairline);
  }

  .amenity-tag--user {
    background: color-mix(in srgb, #f59e0b 15%, transparent);
    color: #d97706;
    border-color: #f59e0b;
  }

  .card-actions {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--hairline);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .btn-directions {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    min-height: 42px;
    border-radius: 10px;
    background: var(--ink);
    color: var(--paper);
    font-size: 0.875rem;
    font-weight: 650;
    text-decoration: none;
    transition: opacity 0.15s ease;
  }

  .btn-directions:hover {
    opacity: 0.92;
  }

  .report-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    font-size: 0.8125rem;
  }

  .report-label {
    color: var(--ink-mute);
    font-size: 0.75rem;
  }

  .report-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--hairline);
    background: var(--paper);
    color: var(--ink-soft);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }

  .report-btn--active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  /* Empty state */
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 48px 16px;
    color: var(--ink-soft);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .reset-filters-btn {
    padding: 8px 18px;
    border-radius: 999px;
    background: var(--ink);
    color: var(--paper);
    font-size: 0.875rem;
    font-weight: 650;
    cursor: pointer;
  }

  /* Calculator */
  .calculator-section {
    margin-top: 40px;
  }

  .calc-card {
    background: var(--paper-high);
    border: 1px solid var(--hairline-strong);
    border-radius: 24px;
    padding: 24px;
  }

  .calc-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, #f59e0b 20%, transparent);
    color: var(--attention-ink);
    font-size: 0.8125rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .calc-head h2 {
    font-family: var(--font-display);
    font-size: clamp(1.35rem, 3vw, 1.65rem);
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 0;
  }

  .calc-head p {
    color: var(--ink-soft);
    font-size: 0.9375rem;
    margin-top: 4px;
  }

  .calc-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 20px;
  }

  @media (min-width: 768px) {
    .calc-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .calc-field-label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 650;
    color: var(--ink);
    margin-bottom: 16px;
  }

  .activity-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .activity-opt {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--hairline-strong);
    background: var(--paper);
    color: var(--ink-soft);
    font-size: 0.875rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }

  .activity-opt--active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  .hours-slider-wrap input {
    width: 100%;
    margin-top: 4px;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8125rem;
    color: var(--ink-mute);
    margin-top: 4px;
  }

  .hours-display {
    color: var(--ink);
    font-size: 0.9375rem;
  }

  .calc-outputs {
    background: var(--paper);
    border: 1px solid var(--hairline-strong);
    border-radius: 18px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }

  .metric-label {
    font-size: 0.875rem;
    color: var(--ink-mute);
    font-weight: 600;
  }

  .metric-big {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin: 4px 0;
  }

  .metric-big strong {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 800;
    line-height: 1;
    color: #0284c7;
  }

  .metric-big span {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink);
  }

  .metric-hint {
    font-size: 0.875rem;
    color: var(--ink-soft);
    margin: 0;
  }

  .output-pills {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pill-info {
    font-size: 0.8125rem;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--field);
    color: var(--ink-soft);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pill-info strong {
    color: var(--ink);
  }

  .pill-info--alert {
    background: color-mix(in srgb, var(--danger) 15%, transparent);
    color: var(--danger-ink);
    border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  }

  /* Tactical guide */
  .tactical-guide {
    margin-top: 40px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin-bottom: 14px;
  }

  .tactical-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 14px;
  }

  .tactical-card {
    background: var(--paper-high);
    border: 1px solid var(--hairline-strong);
    border-radius: 18px;
    padding: 18px;
  }

  .tac-icon {
    font-size: 1.75rem;
    margin-bottom: 8px;
  }

  .tactical-card h3 {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 6px;
  }

  .tactical-card p {
    font-size: 0.875rem;
    line-height: 1.42;
    color: var(--ink-soft);
    margin: 0;
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(20, 10, 4, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .modal-card {
    position: relative;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    background: var(--paper);
    color: var(--ink);
    border: 1px solid var(--hairline-strong);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    color: var(--ink-mute);
    cursor: pointer;
  }

  .modal-card h2 {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0 0 4px;
  }

  .modal-sub {
    font-size: 0.875rem;
    color: var(--ink-soft);
    margin: 0 0 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }

  .form-group label {
    font-size: 0.8125rem;
    font-weight: 650;
    color: var(--ink-soft);
  }

  .form-group input,
  .form-group select {
    min-height: 44px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid var(--hairline-strong);
    background: var(--paper-high);
    color: var(--ink);
    font-size: 0.9375rem;
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: var(--ink-soft);
    margin: 12px 0 16px;
    cursor: pointer;
  }

  .success-message {
    padding: 8px 12px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--safe) 20%, transparent);
    color: var(--safe-ink);
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
  }

  .btn-primary {
    flex: 1;
    min-height: 44px;
    border-radius: 10px;
    background: var(--ink);
    color: var(--paper);
    font-size: 0.9375rem;
    font-weight: 650;
    cursor: pointer;
  }

  .btn-secondary {
    padding: 0 18px;
    border-radius: 10px;
    background: var(--paper-high);
    color: var(--ink-soft);
    font-size: 0.9375rem;
    font-weight: 650;
    border: 1px solid var(--hairline);
    cursor: pointer;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  :global(.spin-anim) {
    animation: spin 0.8s linear infinite;
  }
</style>

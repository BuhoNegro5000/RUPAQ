<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { HydrationPoint } from '$lib/data/hydration-points';
  import { getDirectionsUrl } from '$lib/data/hydration-points';
  import { MapPin, Navigation, Droplets, ExternalLink } from '@lucide/svelte';

  export let points: HydrationPoint[] = [];
  export let selectedPoint: HydrationPoint | null = null;
  export let userCoords: { lat: number; lon: number } | null = null;
  export let onSelect: (point: HydrationPoint) => void = () => {};

  let mapContainer: HTMLElement;
  let mapInstance: any = null;
  let LInstance: any = null;
  let markersLayer: any = null;
  let userMarker: any = null;
  let isMapReady = false;

  const CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
    fountain: { bg: '#2563eb', border: '#ffffff' },
    climate_refuge: { bg: '#7c3aed', border: '#ffffff' },
    convenience: { bg: '#d97706', border: '#ffffff' }
  };

  onMount(async () => {
    if (!browser) return;

    try {
      const leaflet = await import('leaflet');
      LInstance = leaflet.default ?? leaflet;

      // Fix icon assets paths if needed
      if (!mapContainer) return;

      // Initialize map centered in Lima
      const centerLat = userCoords ? userCoords.lat : -12.115;
      const centerLon = userCoords ? userCoords.lon : -77.03;

      mapInstance = LInstance.map(mapContainer, {
        center: [centerLat, centerLon],
        zoom: userCoords ? 14 : 13,
        zoomControl: true,
        attributionControl: true
      });

      // Standard OpenStreetMap tiles
      LInstance.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance);

      markersLayer = LInstance.layerGroup().addTo(mapInstance);
      isMapReady = true;

      renderMarkers();
    } catch (err) {
      console.warn('Leaflet map initialization skipped or failed:', err);
    }
  });

  onDestroy(() => {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  });

  $: if (isMapReady && (points || userCoords)) {
    renderMarkers();
  }

  $: if (isMapReady && selectedPoint && mapInstance) {
    flyToPoint(selectedPoint);
  }

  function createCustomIcon(point: HydrationPoint, isSelected: boolean) {
    const config = CATEGORY_COLORS[point.category] ?? { bg: '#0284c7', border: '#ffffff' };
    const size = isSelected ? 36 : 28;
    const border = isSelected ? '3px solid #f97316' : `2px solid ${config.border}`;
    const shadow = isSelected ? '0 0 12px rgba(249,115,22,0.8)' : '0 2px 6px rgba(0,0,0,0.3)';
    const iconChar = point.category === 'fountain' ? '🚰' : point.category === 'climate_refuge' ? '❄️' : '🏪';

    return LInstance.divIcon({
      className: 'custom-hydration-pin',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${config.bg};
          border: ${border};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${shadow};
          font-size: ${isSelected ? '18px' : '14px'};
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${iconChar}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function renderMarkers() {
    if (!mapInstance || !LInstance || !markersLayer) return;

    markersLayer.clearLayers();

    // User position marker
    if (userCoords) {
      const userIcon = LInstance.divIcon({
        className: 'user-location-pin',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            background: #2563eb;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(37,99,235,0.4);
            transform: translate(-50%, -50%);
          "></div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      userMarker = LInstance.marker([userCoords.lat, userCoords.lon], { icon: userIcon })
        .addTo(markersLayer)
        .bindPopup('<strong>Tu ubicación actual</strong>');
    }

    // Hydration points
    for (const point of points) {
      const isSelected = selectedPoint?.id === point.id;
      const marker = LInstance.marker([point.lat, point.lon], {
        icon: createCustomIcon(point, isSelected)
      }).addTo(markersLayer);

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; max-width: 220px;">
          <strong style="display:block; font-size: 14px; margin-bottom: 2px;">${point.name}</strong>
          <span style="display:inline-block; font-size: 11px; padding: 1px 6px; border-radius: 4px; background: #e0f2fe; color: #0369a1; font-weight: 600; margin-bottom: 4px;">
            ${point.categoryLabel}
          </span>
          <p style="margin: 4px 0; color: #475569; font-size: 12px;">${point.address}</p>
          <div style="margin-top: 8px;">
            <a href="${getDirectionsUrl(point.lat, point.lon)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #0f172a; color: #fff; padding: 5px 10px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600;">
              Cómo llegar ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelect(point);
      });
    }
  }

  function flyToPoint(point: HydrationPoint) {
    if (!mapInstance) return;
    mapInstance.flyTo([point.lat, point.lon], 16, { duration: 1 });
  }

  export function recenterOnUser() {
    if (mapInstance && userCoords) {
      mapInstance.flyTo([userCoords.lat, userCoords.lon], 15, { duration: 1 });
    }
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<div class="map-wrapper">
  <div bind:this={mapContainer} class="leaflet-map-element" role="application" aria-label="Mapa interactivo de puntos de hidratación en Lima"></div>
  {#if userCoords}
    <button
      type="button"
      class="recenter-btn"
      onclick={recenterOnUser}
      aria-label="Centrar en mi ubicación"
    >
      <Navigation size={17} strokeWidth={2} aria-hidden="true" />
      <span>Mi posición</span>
    </button>
  {/if}
</div>

<style>
  .map-wrapper {
    position: relative;
    width: 100%;
    height: 380px;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid var(--hairline-strong);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .leaflet-map-element {
    width: 100%;
    height: 100%;
    z-index: 1;
    background: var(--paper-high);
  }

  /* Night mode filter on map tiles */
  :global([data-phase='night']) .leaflet-map-element :global(.leaflet-tile-pane) {
    filter: invert(100%) hue-rotate(180deg) brightness(92%) contrast(90%);
  }

  .recenter-btn {
    position: absolute;
    bottom: 14px;
    right: 14px;
    z-index: 1000;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--paper);
    color: var(--ink);
    border: 1px solid var(--hairline-strong);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
    font-size: 0.8125rem;
    font-weight: 650;
    cursor: pointer;
  }

  .recenter-btn:hover {
    background: var(--paper-high);
  }

  :global(.custom-hydration-pin) {
    background: transparent !important;
    border: none !important;
  }
</style>

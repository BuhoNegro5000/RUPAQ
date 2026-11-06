<script lang="ts">
  import { goto } from '$app/navigation';
  import { settings, updateSettings, settingsHydrated } from '$lib/stores/settings';
  import { selectedLocation } from '$lib/stores/location';
  import {
    Activity,
    Compass,
    HeartPulse,
    MapPin,
    ShieldCheck,
    Sun,
    Droplets,
    PhoneCall,
    UserCheck,
    ChevronRight,
    Sparkles,
    X
  } from '@lucide/svelte';

  $: open = $settingsHydrated && !$settings.onboarded;

  let activeTab = 0;

  // Interactive Demo 1 state: Humidity toggle
  let demoHumidityHigh = true;
  $: demoTemp = 30;
  $: demoFeels = demoHumidityHigh ? 36 : 31;
  $: demoRisk = demoHumidityHigh ? 'Peligro' : 'Seguro';
  $: demoRiskColor = demoHumidityHigh ? 'var(--danger)' : 'var(--safe)';

  // Interactive Demo 2 state: Profile selector
  let demoProfile = 'general';
  const profileAdvices: Record<string, string> = {
    general: 'Toma agua con frecuencia y planifica pausas en la sombra entre 12 h y 16 h.',
    ninos: 'Hidratación obligatoria cada hora. Protege cabeza y cuello con sombrero.',
    adultos: 'Evita esfuerzo en horas de sol. Monitorea presión y mantén ambiente ventilado.',
    trabajo: 'Pausa de 15 min cada hora bajo sombra. Repón sales y líquidos sin esperar sed.'
  };

  function dismiss() {
    updateSettings({ onboarded: true });
  }

  function pickLocation() {
    updateSettings({ onboarded: true });
    void goto('/ubicacion');
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      dismiss();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <div
    class="modal-backdrop"
    role="presentation"
    onclick={dismiss}
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <button type="button" class="close-btn" onclick={dismiss} aria-label="Cerrar bienvenida">
        <X size={20} strokeWidth={2} />
      </button>

      <header class="welcome-header">
        <div class="brand-pill">
          <img src="/gowl-mark.png" alt="" width="20" height="20" aria-hidden="true" />
          <span>Green Owl Labs presenta</span>
        </div>
        <h2 id="welcome-title" class="welcome-title">Bienvenido a RUPAQ</h2>
        <p class="welcome-sub">
          Asistente de calor extremo y salud para el Perú. 100% privado, sin registro y listo sin conexión.
        </p>
      </header>

      <!-- Interactive Tab Navigator -->
      <nav class="feature-tabs" aria-label="Explorar características">
        <button
          type="button"
          class="tab-btn"
          class:tab-btn--active={activeTab === 0}
          onclick={() => (activeTab = 0)}
        >
          <Sun size={17} strokeWidth={2} aria-hidden="true" />
          <span>Calor real</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          class:tab-btn--active={activeTab === 1}
          onclick={() => (activeTab = 1)}
        >
          <UserCheck size={17} strokeWidth={2} aria-hidden="true" />
          <span>Tu perfil</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          class:tab-btn--active={activeTab === 2}
          onclick={() => (activeTab = 2)}
        >
          <HeartPulse size={17} strokeWidth={2} aria-hidden="true" />
          <span>Emergencias</span>
        </button>
      </nav>

      <!-- Tab Panels with Live Micro-Interactions -->
      <div class="tab-content">
        {#if activeTab === 0}
          <div class="interactive-panel enter">
            <div class="panel-header">
              <span class="panel-tag">Estándar Científico NOAA</span>
              <h3>La temperatura sola no dice cuánto calor sientes</h3>
              <p>
                En la costa y selva del Perú, la humedad multiplica el calor corporal. Comprueba cómo impacta:
              </p>
            </div>

            <div class="demo-box">
              <div class="demo-controls">
                <span class="control-label">Nivel de humedad:</span>
                <div class="toggle-group">
                  <button
                    type="button"
                    class="toggle-chip"
                    class:toggle-chip--active={!demoHumidityHigh}
                    onclick={() => (demoHumidityHigh = false)}
                  >
                    45% Seco
                  </button>
                  <button
                    type="button"
                    class="toggle-chip"
                    class:toggle-chip--active={demoHumidityHigh}
                    onclick={() => (demoHumidityHigh = true)}
                  >
                    82% Húmedo (Lima/Piura)
                  </button>
                </div>
              </div>

              <div class="demo-result">
                <div class="demo-result__metric">
                  <span class="metric-label">Termómetro</span>
                  <span class="metric-val">{demoTemp}°</span>
                </div>
                <div class="demo-result__arrow">➔</div>
                <div class="demo-result__metric">
                  <span class="metric-label">Sensación Térmica</span>
                  <span class="metric-val metric-val--big" style={`color: ${demoRiskColor};`}>{demoFeels}°</span>
                </div>
                <div class="demo-badge" style={`background: ${demoRiskColor}; color: #fff;`}>
                  {demoRisk}
                </div>
              </div>
            </div>
          </div>
        {:else if activeTab === 1}
          <div class="interactive-panel enter">
            <div class="panel-header">
              <span class="panel-tag">Prevención Personalizada</span>
              <h3>Consejos adaptados a tu salud o labor</h3>
              <p>El calor no afecta igual a todos. Selecciona un grupo para ver el consejo:</p>
            </div>

            <div class="profile-pills">
              {#each [
                { id: 'general', label: 'General' },
                { id: 'ninos', label: 'Niños o bebés' },
                { id: 'adultos', label: 'Adultos mayores' },
                { id: 'trabajo', label: 'Trabajo al aire libre' }
              ] as item}
                <button
                  type="button"
                  class="profile-chip"
                  class:profile-chip--active={demoProfile === item.id}
                  onclick={() => (demoProfile = item.id)}
                >
                  {item.label}
                </button>
              {/each}
            </div>

            <div class="advice-preview-card">
              <Sparkles size={18} strokeWidth={2} class="sparkle-icon" aria-hidden="true" />
              <p>{profileAdvices[demoProfile]}</p>
            </div>
          </div>
        {:else if activeTab === 2}
          <div class="interactive-panel enter">
            <div class="panel-header">
              <span class="panel-tag">Primeros Auxilios Sin Internet</span>
              <h3>Guías de emergencia listas en cualquier lugar</h3>
              <p>Ante sospecha de golpe de calor, llama de inmediato y actúa en los primeros 10 minutos:</p>
            </div>

            <div class="emergency-preview-grid">
              <div class="call-pill-demo">
                <PhoneCall size={18} strokeWidth={2} aria-hidden="true" />
                <div>
                  <strong>106 SAMU</strong>
                  <span>Ambulancia gratuita</span>
                </div>
              </div>
              <div class="call-pill-demo">
                <PhoneCall size={18} strokeWidth={2} aria-hidden="true" />
                <div>
                  <strong>116 Bomberos</strong>
                  <span>Rescate y urgencias</span>
                </div>
              </div>
            </div>

            <ol class="emergency-steps-mini">
              <li>Llevar a la persona a la sombra o lugar ventilado.</li>
              <li>Aflojar ropa apretada y aplicar paños fríos en cuello y axilas.</li>
              <li>Si está consciente, dar agua fresca en pequeños sorbos.</li>
            </ol>
          </div>
        {/if}
      </div>

      <div class="current-loc-badge">
        <MapPin size={16} strokeWidth={2} aria-hidden="true" />
        <span>Distrito seleccionado: <strong>{$selectedLocation.distrito}, {$selectedLocation.provincia}</strong></span>
      </div>

      <footer class="welcome-actions">
        <button type="button" class="btn-primary" onclick={dismiss}>
          Empezar a usar RUPAQ
        </button>
        <button type="button" class="btn-secondary" onclick={pickLocation}>
          <Compass size={17} strokeWidth={2} aria-hidden="true" />
          Cambiar distrito
        </button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: rgba(26, 14, 5, 0.58);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fade-in 200ms ease;
  }

  .modal-card {
    position: relative;
    width: 100%;
    max-width: 580px;
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    background: var(--paper);
    color: var(--ink);
    border-radius: 24px;
    padding: 28px 24px 22px;
    box-shadow: 0 20px 48px rgba(35, 18, 6, 0.32);
    border: 1px solid var(--hairline-strong);
    animation: slide-up 240ms var(--ease-out);
  }

  .close-btn {
    position: absolute;
    top: 18px;
    right: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--field);
    color: var(--ink);
    cursor: pointer;
    border: 1px solid var(--hairline);
    transition: background 150ms ease, transform 150ms ease;
  }
  .close-btn:hover {
    background: var(--field-strong);
    transform: scale(1.05);
  }

  .welcome-header {
    text-align: left;
    margin-bottom: 18px;
    padding-right: 36px;
  }

  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px;
    border-radius: 999px;
    background: var(--field-strong);
    font-size: 0.8125rem;
    font-weight: 650;
    color: var(--ink-soft);
    margin-bottom: 10px;
    border: 1px solid var(--hairline);
  }

  .welcome-title {
    font-size: clamp(1.8rem, 4.6vw, 2.3rem);
    letter-spacing: -0.04em;
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .welcome-sub {
    font-size: 0.9375rem;
    color: var(--ink-soft);
    line-height: 1.42;
    margin: 0;
  }

  /* Feature Tabs */
  .feature-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    background: var(--field);
    padding: 4px;
    border-radius: 14px;
    margin-bottom: 16px;
    border: 1px solid var(--hairline);
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 4px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 620;
    color: var(--ink-soft);
    background: transparent;
    cursor: pointer;
    transition: all 180ms ease;
  }
  .tab-btn--active {
    background: var(--paper);
    color: var(--ink);
    box-shadow: 0 2px 8px rgba(35, 18, 6, 0.12);
  }

  .tab-content {
    min-height: 200px;
    margin-bottom: 18px;
  }

  .interactive-panel {
    background: var(--field);
    border: 1px solid var(--hairline-strong);
    border-radius: 18px;
    padding: 18px;
  }

  .panel-tag {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--risk-ink);
    margin-bottom: 4px;
  }

  .panel-header h3 {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 2px 0 6px;
  }
  .panel-header p {
    font-size: 0.875rem;
    color: var(--ink-soft);
    line-height: 1.4;
    margin: 0 0 12px;
  }

  /* Demo 1 Styles */
  .demo-box {
    background: var(--paper);
    border: 1px solid var(--hairline);
    border-radius: 14px;
    padding: 14px;
  }
  .demo-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .control-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--ink-soft);
  }
  .toggle-group {
    display: inline-flex;
    gap: 6px;
  }
  .toggle-chip {
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 650;
    background: var(--field);
    color: var(--ink-soft);
    cursor: pointer;
    border: 1px solid var(--hairline);
    transition: all 150ms ease;
  }
  .toggle-chip--active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  .demo-result {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 8px 12px;
    background: var(--field);
    border-radius: 10px;
  }
  .demo-result__metric {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .metric-label {
    font-size: 0.75rem;
    color: var(--ink-soft);
    font-weight: 600;
  }
  .metric-val {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
  }
  .metric-val--big {
    font-size: 2rem;
    transition: color 240ms ease;
  }
  .demo-result__arrow {
    font-size: 1.25rem;
    color: var(--ink-soft);
  }
  .demo-badge {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 750;
    transition: background 240ms ease;
  }

  /* Demo 2 Styles */
  .profile-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .profile-chip {
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 600;
    background: var(--paper);
    color: var(--ink-soft);
    cursor: pointer;
    border: 1px solid var(--hairline-strong);
    transition: all 150ms ease;
  }
  .profile-chip--active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }
  .advice-preview-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: var(--paper);
    border: 1px solid var(--hairline);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 0.9375rem;
    line-height: 1.4;
    color: var(--ink);
    animation: fade-in 180ms ease;
  }
  :global(.sparkle-icon) {
    color: var(--attention-ink);
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* Demo 3 Styles */
  .emergency-preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
  .call-pill-demo {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--paper);
    border: 1px solid var(--hairline-strong);
    border-radius: 12px;
    padding: 10px 12px;
  }
  .call-pill-demo strong {
    display: block;
    font-size: 0.9375rem;
    color: var(--danger-ink);
  }
  .call-pill-demo span {
    font-size: 0.75rem;
    color: var(--ink-soft);
  }
  .emergency-steps-mini {
    margin: 0;
    padding-left: 20px;
    font-size: 0.8125rem;
    color: var(--ink-soft);
    line-height: 1.45;
  }

  /* Bottom actions */
  .current-loc-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 14px;
    border-radius: 12px;
    background: var(--field);
    border: 1px solid var(--hairline);
    font-size: 0.875rem;
    color: var(--ink-soft);
    margin-bottom: 18px;
  }
  .current-loc-badge strong {
    color: var(--ink);
  }

  .welcome-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 50px;
    border-radius: var(--radius-pill);
    background: var(--ink);
    color: var(--paper);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: var(--shadow-pill);
    transition: transform 150ms ease, opacity 150ms ease;
  }
  .btn-primary:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    min-height: 44px;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--ink-soft);
    font-size: 0.9375rem;
    font-weight: 620;
    cursor: pointer;
    border: 1px solid var(--hairline-strong);
    transition: background 150ms ease, color 150ms ease;
  }
  .btn-secondary:hover {
    background: var(--field);
    color: var(--ink);
  }

  @media (max-width: 480px) {
    .modal-card {
      padding: 22px 18px 18px;
    }
    .feature-tabs {
      font-size: 0.8125rem;
    }
    .tab-btn {
      padding: 6px 2px;
      font-size: 0.8125rem;
    }
    .emergency-preview-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
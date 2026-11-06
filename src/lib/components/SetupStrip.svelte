<script lang="ts">
  import { settings, updateSettings } from '$lib/stores/settings';
  import { MapPin, UserRound, X } from '@lucide/svelte';

  function dismiss() {
    updateSettings({ dismissedSetup: true });
  }
</script>

<aside class="setup-strip" aria-label="Personaliza Rupaq">
  <div class="setup-copy">
    <strong>Hazlo tuyo</strong>
    <span>Distrito y perfil, en 30 segundos</span>
  </div>
  <div class="setup-actions">
    <a href="/ubicacion" aria-label="Elegir distrito">
      <MapPin size={17} strokeWidth={1.9} aria-hidden="true" />
      <span>Distrito</span>
    </a>
    <a href="/mas/perfil" aria-label="Elegir perfil">
      <UserRound size={17} strokeWidth={1.9} aria-hidden="true" />
      <span>Perfil</span>
    </a>
    <button type="button" onclick={dismiss} aria-label="Ocultar esta sugerencia">
      <X size={18} strokeWidth={1.9} aria-hidden="true" />
    </button>
  </div>
</aside>

<style>
  .setup-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 50px;
    padding: 7px 0;
    border-top: 1px solid var(--hairline-soft);
    border-bottom: 1px solid var(--hairline-soft);
  }
  .setup-copy {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    min-width: 0;
  }
  .setup-copy strong {
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--ink);
  }
  .setup-copy span {
    font-size: 0.875rem;
    color: var(--ink-soft);
    font-weight: 540;
    line-height: 1.25;
  }
  .setup-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: none;
  }
  .setup-actions a,
  .setup-actions button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 40px;
    padding: 0 8px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 650;
    text-decoration: none;
    color: var(--ink);
  }
  .setup-actions a:hover,
  .setup-actions button:hover {
    background: var(--field);
  }
  @media (max-width: 380px) {
    .setup-copy span {
      display: none;
    }
    .setup-actions a span {
      display: none;
    }
    .setup-actions a {
      padding: 0 10px;
    }
  }
</style>

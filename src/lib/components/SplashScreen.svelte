<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let visible = true;
  let fading = false;

  onMount(() => {
    if (!browser) return;
    const alreadyShown = sessionStorage.getItem('rupaq_splash_seen');
    if (alreadyShown) {
      visible = false;
      return;
    }

    sessionStorage.setItem('rupaq_splash_seen', 'true');

    const fadeTimer = setTimeout(() => {
      fading = true;
    }, 1300);

    const removeTimer = setTimeout(() => {
      visible = false;
    }, 1750);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  });

  function dismiss() {
    fading = true;
    setTimeout(() => {
      visible = false;
    }, 250);
  }
</script>

{#if visible}
  <div
    class="splash-overlay"
    class:splash-fade={fading}
    role="presentation"
    onclick={dismiss}
    onkeydown={(e) => e.key === 'Escape' && dismiss()}
    tabindex="-1"
  >
    <div class="splash-card">
      <div class="splash-logo-wrap">
        <img
          src="/gowl-mark.png"
          alt="Green Owl Labs"
          class="splash-logo"
          width="92"
          height="92"
        />
      </div>
      <p class="splash-by">Desarrollado por</p>
      <h1 class="splash-brand">Green Owl Labs</h1>
      <p class="splash-tagline">Tecnología climática y salud pública para Perú</p>
    </div>
  </div>
{/if}

<style>
  .splash-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, #fffaf2 0%, #f7efe3 70%, #ebdcc8 100%);
    cursor: pointer;
    transition: opacity 400ms ease, visibility 400ms ease;
  }

  .splash-fade {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }

  .splash-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 24px;
    animation: splash-appear 650ms var(--ease-out) both;
  }

  .splash-logo-wrap {
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    border-radius: 24px;
    background: rgba(43, 22, 8, 0.04);
    box-shadow: 0 10px 28px rgba(43, 22, 8, 0.08);
  }

  .splash-logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .splash-by {
    font-size: 0.875rem;
    font-weight: 540;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin: 0 0 4px;
  }

  .splash-brand {
    font-family: var(--font-display);
    font-size: 1.85rem;
    font-weight: 750;
    letter-spacing: -0.04em;
    color: var(--ink);
    margin: 0 0 8px;
    line-height: 1.15;
  }

  .splash-tagline {
    font-size: 0.9375rem;
    color: var(--ink-mute);
    max-width: 28ch;
    margin: 0;
    line-height: 1.35;
  }

  @keyframes splash-appear {
    from {
      opacity: 0;
      transform: scale(0.92) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .splash-card {
      animation: none;
    }
    .splash-overlay {
      transition: none;
    }
  }
</style>

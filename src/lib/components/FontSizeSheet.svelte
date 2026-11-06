<script lang="ts">
  import { FONT_STEPS, THEME_OPTIONS, settings, updateSettings } from '$lib/stores/settings';
  import { fontSheetOpen } from '$lib/stores/ui';
  import BottomSheet from './BottomSheet.svelte';
  import { Check } from '@lucide/svelte';

  function choose(value: number) {
    updateSettings({ fontScale: value });
  }

  function close() {
    fontSheetOpen.set(false);
  }
</script>

<BottomSheet open={$fontSheetOpen} title="Tamaño de letra" onclose={close}>
  <p class="intro">Elige cómo quieres leer Rupaq. El cambio se queda en este dispositivo.</p>
  <div class="options" role="group" aria-label="Tamaño del texto">
    {#each FONT_STEPS as step}
      <button
        type="button"
        class="option"
        aria-pressed={$settings.fontScale === step.value}
        onclick={() => choose(step.value)}
      >
        <span class="sample" style={`font-size:${1 + (step.value - 1) * 1.55}rem`}>Aa</span>
        <span class="label">{step.label}</span>
        {#if $settings.fontScale === step.value}
          <Check size={18} strokeWidth={2.2} aria-hidden="true" />
        {/if}
      </button>
    {/each}
  </div>
  <p class="hint">
    Con el texto más grande, Hoy puede necesitar un poco de scroll. El resto de la app se adapta.
  </p>
  <h3 class="theme-title" id="theme-sheet-title">Apariencia</h3>
  <div class="theme-options" role="group" aria-labelledby="theme-sheet-title">
    {#each THEME_OPTIONS as option}
      <button
        type="button"
        class="theme-option"
        aria-pressed={$settings.theme === option.value}
        onclick={() => updateSettings({ theme: option.value })}
      >
        {option.label}
      </button>
    {/each}
  </div>
  <a class="more" href="/mas/accesibilidad" onclick={close}>Más ajustes de accesibilidad</a>
</BottomSheet>

<style>
  .intro {
    color: var(--ink-soft);
    margin-bottom: 14px;
    max-width: 34ch;
  }
  .options {
    display: grid;
    gap: 0;
    border-top: 1px solid var(--hairline);
  }
  .option {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 64px;
    border-bottom: 1px solid var(--hairline);
    text-align: left;
    color: var(--ink);
  }
  .option[aria-pressed='true'] {
    font-weight: 650;
  }
  .sample {
    display: inline-flex;
    width: 54px;
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.06em;
    line-height: 1;
  }
  .label {
    flex: 1;
  }
  .hint {
    margin-top: 16px;
    font-size: 0.9375rem;
    color: var(--ink-mute);
    line-height: 1.4;
  }
  .theme-title {
    margin-top: 20px;
    font-size: 1.0625rem;
    font-weight: 650;
  }
  .theme-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 10px;
  }
  .theme-option {
    min-height: 52px;
    border: 1px solid var(--hairline);
    border-radius: 10px;
    color: var(--ink-soft);
    font-weight: 600;
  }
  .theme-option[aria-pressed='true'] {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--paper);
  }
  .theme-option:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  .more {
    display: inline-flex;
    min-height: 48px;
    align-items: center;
    margin-top: 8px;
    font-weight: 650;
    text-underline-offset: 4px;
  }
</style>

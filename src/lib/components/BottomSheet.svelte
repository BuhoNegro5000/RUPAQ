<script lang="ts">
  import { browser } from '$app/environment';
  import { tick } from 'svelte';
  import { X } from '@lucide/svelte';

  export let open = false;
  export let title = '';
  export let onclose: () => void = () => (open = false);

  const titleId = `sheet-title-${Math.random().toString(36).slice(2, 8)}`;
  let panel: HTMLDivElement;
  let previousFocus: HTMLElement | null = null;
  let wasOpen = false;

  $: if (browser) {
    if (open && !wasOpen) {
      previousFocus = document.activeElement as HTMLElement;
      wasOpen = true;
      void tick().then(() => panel?.focus());
    } else if (!open && wasOpen) {
      wasOpen = false;
      previousFocus?.focus?.();
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose();
      return;
    }
    if (event.key !== 'Tab') return;
    const nodes = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!nodes?.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
  <button class="sheet-backdrop" aria-label="Cerrar ventana" onclick={onclose}></button>
  <div
    class="sheet"
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    tabindex="-1"
    bind:this={panel}
  >
    <div class="sheet__handle" aria-hidden="true"></div>
    <div class="sheet__head">
      <h2 id={titleId}>{title}</h2>
      <button class="icon-button" type="button" onclick={onclose} aria-label="Cerrar">
        <X size={22} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
    <div class="sheet__body">
      <slot />
    </div>
  </div>
{/if}

<style>
  .sheet__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }
  .sheet__head h2 {
    font-size: 1.75rem;
    letter-spacing: -0.045em;
  }
  .sheet__body {
    padding-bottom: 4px;
  }
</style>

<script lang="ts">
  import { CloudOff, RefreshCw } from '@lucide/svelte';

  export let message: string;
  export let onretry: () => void;
</script>

<div class="error-state" role="status">
  <CloudOff size={30} strokeWidth={1.6} aria-hidden="true" />
  <div>
    <h2>El pronóstico no está disponible</h2>
    <p>{message}</p>
  </div>
  <button type="button" class="btn btn--ghost" onclick={onretry}>
    <RefreshCw size={18} strokeWidth={1.8} aria-hidden="true" />
    Reintentar
  </button>
</div>

<style>
  .error-state {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px 16px;
    padding: 22px 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
    align-items: start;
  }
  .error-state h2 {
    font-size: 1.4rem;
    margin-bottom: 5px;
  }
  .error-state p {
    font-size: 1rem;
    color: var(--ink-soft);
    max-width: 46ch;
  }
  .error-state .btn {
    grid-column: 1 / -1;
    justify-self: start;
  }
</style>

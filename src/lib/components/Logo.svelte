<script lang="ts">
  export let size = 32;
  export let variant: 'mark' | 'full' | 'stacked' = 'full';
  export let label = 'RUPAQ';
</script>

<span class="logo logo--{variant}" aria-label={label} role="img">
  <img
    src="/rupaq-symbol-web.png"
    width={size}
    height={size}
    alt=""
    class="logo__symbol"
  />
  {#if variant !== 'mark'}
    <span class="logo__word">RUPAQ</span>
  {/if}
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: var(--ink);
    text-decoration: none;
    line-height: 1;
  }

  .logo--stacked {
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .logo__symbol {
    display: block;
    object-fit: contain;
    flex-shrink: 0;
  }

  .logo__word {
    font-family: var(--font-display);
    font-size: 1.45rem;
    font-weight: 750;
    letter-spacing: -0.015em;
    line-height: 1;
    color: var(--ink);
  }

  .logo--stacked .logo__word {
    font-size: 1.15rem;
    letter-spacing: -0.01em;
  }

  .logo--mark {
    gap: 0;
  }
</style>

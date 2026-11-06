<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  export let back = '/mas';
  export let backLabel = 'Más';
  export let kicker = '';
  export let title: string;
  export let intro: string | null = null;
  export let compact = false;
</script>

<header class="page-intro" class:page-intro--compact={compact}>
  <a class="back" href={back}>
    <ArrowLeft size={19} strokeWidth={1.9} aria-hidden="true" />
    <span>{backLabel}</span>
  </a>
  {#if kicker}<p class="eyebrow">{kicker}</p>{/if}
  <h1 class="page-title">{title}</h1>
  {#if intro}<p class="intro">{intro}</p>{/if}
</header>

<style>
  .page-intro {
    padding: calc(12px + var(--safe-top)) 0 24px;
    border-bottom: 1px solid var(--hairline);
  }
  .page-intro--compact {
    padding-bottom: 16px;
  }
  .back {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 44px;
    margin-left: -6px;
    padding: 0 6px;
    font-size: 0.9375rem;
    font-weight: 650;
    color: var(--ink-soft);
    text-decoration: none;
  }
  .back:hover {
    color: var(--ink);
  }
  .eyebrow {
    margin-top: 10px;
    color: var(--ink-soft);
  }
  h1 {
    margin-top: 7px;
    max-width: 18ch;
  }
  .intro {
    margin-top: 13px;
    max-width: 46ch;
    color: var(--ink-soft);
    font-size: 1.0625rem;
    line-height: 1.48;
  }
</style>

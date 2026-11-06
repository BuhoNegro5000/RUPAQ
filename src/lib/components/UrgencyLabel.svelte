<script lang="ts">
  export let label: string;
  export let level: number;
</script>

<span class="urgency" data-level={level}>{label}</span>

<style>
  .urgency {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 7px;
    border: 1px solid currentColor;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 760;
    letter-spacing: 0.075em;
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .urgency[data-level='4'] {
    background: var(--extreme);
    border-color: var(--extreme);
    color: var(--paper);
  }
  .urgency[data-level='3'] {
    color: var(--danger-ink);
  }
  .urgency[data-level='2'] {
    color: var(--precaution-ink);
  }
  .urgency[data-level='1'] {
    color: var(--ink-soft);
  }
</style>

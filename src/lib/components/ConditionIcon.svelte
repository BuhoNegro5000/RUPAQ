<script lang="ts">
  import {
    Bug,
    CloudSun,
    Droplets,
    Eye,
    HeartPulse,
    Sparkles,
    Sun,
    ThermometerSun,
    Zap
  } from '@lucide/svelte';

  export let name: string;
  export let size = 26;
  export let strokeWidth = 1.7;

  const icons = {
    'thermometer-sun': ThermometerSun,
    'cloud-sun': CloudSun,
    droplets: Droplets,
    zap: Zap,
    sparkles: Sparkles,
    'heart-pulse': HeartPulse,
    bug: Bug,
    sun: Sun,
    eye: Eye
  } as const;
</script>

<svelte:component this={icons[name as keyof typeof icons] ?? ThermometerSun} {size} {strokeWidth} aria-hidden="true" />

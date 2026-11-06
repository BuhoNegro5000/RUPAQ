<script lang="ts">
  import { PhoneCall } from '@lucide/svelte';
  import { forecast } from '$lib/stores/forecast';

  $: riskKey = $forecast?.now.riskKey ?? 'safe';
</script>

<a
  class="emergency-fab"
  class:emergency-fab--safe={riskKey === 'safe'}
  class:emergency-fab--danger={riskKey === 'danger' || riskKey === 'extreme'}
  href="/emergencia"
  aria-label="Llamar a emergencia: abrir guía y números"
  data-risk={riskKey}
>
  <PhoneCall size={20} strokeWidth={2} aria-hidden="true" />
  <span>Llamar a emergencia</span>
</a>

<script lang="ts">
  import { page } from '$app/stores';
  import { CalendarDays, HeartPulse, Menu, Sun } from '@lucide/svelte';

  const items = [
    { href: '/', label: 'Hoy', icon: Sun },
    { href: '/dias', label: 'Días', icon: CalendarDays },
    { href: '/sintomas', label: 'Síntomas', icon: HeartPulse },
    { href: '/mas', label: 'Más', icon: Menu }
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }
</script>

<nav class="bottom-nav" aria-label="Navegación principal">
  {#each items as item}
    {@const active = isActive(item.href, $page.url.pathname)}
    <a
      class="bottom-nav__item"
      href={item.href}
      aria-current={active ? 'page' : undefined}
      data-sveltekit-preload-data="hover"
    >
      <item.icon size={23} strokeWidth={active ? 2.1 : 1.75} aria-hidden="true" />
      <span>{item.label}</span>
    </a>
  {/each}
</nav>

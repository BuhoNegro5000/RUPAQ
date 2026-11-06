<script lang="ts">
  import { page } from '$app/stores';
  import { CalendarDays, HeartPulse, Menu, Sun } from '@lucide/svelte';
  import Logo from './Logo.svelte';

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

<aside class="rail-nav" aria-label="Navegación principal">
  <a class="rail-nav__brand" href="/" aria-label="Rupaq, ir a Hoy">
    <Logo size={42} variant="stacked" />
  </a>
  <nav class="rail-nav__items">
    {#each items as item}
      {@const active = isActive(item.href, $page.url.pathname)}
      <a
        class="rail-nav__item"
        href={item.href}
        aria-current={active ? 'page' : undefined}
        data-sveltekit-preload-data="hover"
      >
        <item.icon size={23} strokeWidth={active ? 2.1 : 1.75} aria-hidden="true" />
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>
  <div class="rail-nav__foot">
    <a href="/mas/acerca" class="rail-nav__made" aria-label="Acerca de Green Owl Labs">
      <img src="/gowl-mark.png" alt="" width="28" height="28" class="rail-nav__owl" aria-hidden="true" />
      <span>Green Owl Labs</span>
    </a>
  </div>
</aside>

<style>
  .rail-nav__brand {
    text-decoration: none;
    margin-bottom: 38px;
  }
  .rail-nav__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    padding: 0 12px;
  }
  .rail-nav__item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 62px;
    border-radius: 14px;
    color: var(--ink-soft);
    font-size: 0.875rem;
    font-weight: 620;
    text-decoration: none;
    transition: color 160ms ease, background-color 160ms ease;
  }
  .rail-nav__item:hover {
    color: var(--ink);
    background: var(--field);
  }
  .rail-nav__item::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    width: 3px;
    height: 24px;
    border-radius: 3px;
    background: transparent;
    transform: translateY(-50%);
    transition: background-color 180ms ease;
  }
  .rail-nav__item[aria-current='page'] {
    color: var(--ink);
  }
  .rail-nav__item[aria-current='page']::before {
    background: var(--ink);
  }
  .rail-nav__foot {
    margin-top: auto;
    padding: 0 8px;
    text-align: center;
  }
  .rail-nav__made {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--ink-mute);
    letter-spacing: 0.01em;
    text-decoration: none;
    padding: 8px 4px;
    border-radius: 12px;
    transition: color 150ms ease, background 150ms ease;
  }
  .rail-nav__made:hover {
    color: var(--ink);
    background: var(--field);
  }
  .rail-nav__owl {
    width: 26px;
    height: 26px;
    object-fit: contain;
    border-radius: 6px;
  }
</style>

import { browser } from '$app/environment';
import { readable } from 'svelte/store';

export const clock = readable(new Date(), (set) => {
  if (!browser) return;
  const tick = () => set(new Date());
  tick();
  const timer = window.setInterval(tick, 30_000);
  return () => window.clearInterval(timer);
});

export const online = readable(true, (set) => {
  if (!browser) return;
  set(navigator.onLine);
  const onOnline = () => set(true);
  const onOffline = () => set(false);
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
});

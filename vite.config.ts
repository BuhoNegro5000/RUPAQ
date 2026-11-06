import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

// The v0 preview proxy rewrites `?svelte&type=style` into `?svelte=&type=style`.
// vite-plugin-svelte only recognises the bare `svelte` flag, so the rewritten URL
// falls through to PostCSS, which then tries to parse the whole .svelte file as CSS.
function normalizeSvelteQuery(): Plugin {
  return {
    name: 'rupaq:normalize-svelte-query',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.includes('svelte=')) {
          req.url = req.url.replace(/([?&])svelte=(?=&|$)/, '$1svelte');
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [normalizeSvelteQuery(), sveltekit()],
  server: {
    port: 5173,
    strictPort: false
  }
});

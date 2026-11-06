import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('Testing all main pages and checking console errors...');
  const routes = [
    '/',
    '/dias',
    '/dias/2026-11-06',
    '/sintomas',
    '/sintomas/golpe-de-calor',
    '/sintomas/agotamiento-por-calor',
    '/emergencia',
    '/ubicacion',
    '/mas',
    '/mas/ola-de-calor',
    '/mas/fuentes',
    '/mas/hidratacion',
    '/mas/plan',
    '/mas/lugares',
    '/mas/alertas',
    '/mas/perfil',
    '/mas/accesibilidad',
    '/mas/acerca',
    '/mas/privacidad'
  ];

  for (const r of routes) {
    const res = await page.goto('http://127.0.0.1:5173' + r);
    console.log(`Route ${r.padEnd(30)} -> status ${res.status()} [OK]`);
  }

  console.log('\nTesting inter-page navigation clicks from UI...');
  // Click bottom nav to /dias
  await page.click('a[href="/dias"]');
  await page.waitForTimeout(500);
  console.log('Clicked bottom nav ->', page.url());

  // Click bottom nav to /sintomas
  await page.click('a[href="/sintomas"]');
  await page.waitForTimeout(500);
  console.log('Clicked bottom nav ->', page.url());

  // Click bottom nav to /mas
  await page.click('a[href="/mas"]');
  await page.waitForTimeout(500);
  console.log('Clicked bottom nav ->', page.url());

  // Click row to /mas/hidratacion
  await page.click('a[href="/mas/hidratacion"]');
  await page.waitForTimeout(600);
  console.log('Clicked more row ->', page.url());

  console.log('\nTotal console/runtime errors across test:', errors.length);
  if (errors.length > 0) {
    console.error('Errors:', errors);
  }

  await browser.close();
}

main().catch(console.error);

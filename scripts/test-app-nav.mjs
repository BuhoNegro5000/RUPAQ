import { chromium } from 'playwright';

async function testAppNavigation() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.addInitScript(() => {
    localStorage.setItem('rupaq.settings.v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const res = await page.evaluate(async () => {
    const nav = await import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/node_modules/@sveltejs/kit/src/runtime/app/navigation.js");
    try {
      await nav.goto('/dias');
      return { success: true, url: window.location.href };
    } catch (e) {
      return { error: e.stack || e.toString() };
    }
  });

  console.log('nav.goto result:', res);
  await browser.close();
}

testAppNavigation();

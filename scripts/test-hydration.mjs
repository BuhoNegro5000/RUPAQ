import { chromium } from 'playwright';

async function testHydrationStatus() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.addInitScript(() => {
    localStorage.setItem('rupaq.settings.v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGEERROR:', err));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const sveltekitStatus = await page.evaluate(() => {
    return {
      hasSvelteKit: typeof window.__sveltekit !== 'undefined',
      sveltekitKeys: typeof window.__sveltekit !== 'undefined' ? Object.keys(window.__sveltekit) : []
    };
  });

  console.log('SvelteKit client status:', sveltekitStatus);

  // Check what happens when calling goto directly
  const gotoResult = await page.evaluate(async () => {
    try {
      if (window.__sveltekit && window.__sveltekit.goto) {
        await window.__sveltekit.goto('/dias');
        return { success: true, url: window.location.href };
      }
      return { error: 'no goto found' };
    } catch (e) {
      return { error: e.toString() };
    }
  });
  console.log('window.__sveltekit.goto result:', gotoResult);

  await browser.close();
}

testHydrationStatus().catch(console.error);

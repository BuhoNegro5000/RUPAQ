import { chromium } from 'playwright';

async function testClickStepByStep() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.addInitScript(() => {
    localStorage.setItem('rupaq.settings.v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const res = await page.evaluate(async () => {
    const link = document.querySelector('.rail-nav__items a[href="/dias"]');
    const client = await import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/node_modules/@sveltejs/kit/src/runtime/client/client.js");
    
    // Check navigation intent for link.href
    const intent = client.get_navigation_intent(new URL(link.href));
    
    // Test _goto directly with this intent
    try {
      const gRes = await client._goto(new URL(link.href), {}, 0);
      return { intent, gRes, currentUrl: window.location.href };
    } catch (e) {
      return { intent, error: e.stack || e.toString() };
    }
  });

  console.log('Result:', JSON.stringify(res, null, 2));
  await browser.close();
}

testClickStepByStep();

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
    
    // Simulate what client.js does on click
    const client = await import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/node_modules/@sveltejs/kit/src/runtime/client/client.js");
    
    return {
      clientKeys: Object.keys(client)
    };
  });

  console.log('Result:', res);
  await browser.close();
}

testClickStepByStep();

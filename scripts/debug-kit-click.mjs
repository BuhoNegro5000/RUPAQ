import { chromium } from 'playwright';

async function debugKitClick() {
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
    const link = document.querySelector('.rail-nav__items a[href="/dias"]');
    
    // Intercept all events
    const log = [];
    ['click', 'navigate', 'popstate'].forEach(evt => {
      window.addEventListener(evt, e => {
        log.push({ type: evt, target: e.target?.tagName, defaultPrevented: e.defaultPrevented });
      }, { capture: true });
    });

    link.click();
    await new Promise(r => setTimeout(r, 600));

    return { log, url: window.location.href };
  });

  console.log('Result:', JSON.stringify(res, null, 2));
  await browser.close();
}

debugKitClick();

import { chromium } from 'playwright';

async function traceNavigate() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.addInitScript(() => {
    localStorage.setItem('rupaq.settings.v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERR:', err));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const res = await page.evaluate(async () => {
    const link = document.querySelector('.rail-nav__items a[href="/dias"]');
    
    // Track history.pushState and replaceState
    const hist = [];
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function(...args) {
      hist.push({ type: 'pushState', args });
      return origPush.apply(this, args);
    };
    history.replaceState = function(...args) {
      hist.push({ type: 'replaceState', args });
      return origReplace.apply(this, args);
    };

    link.click();
    await new Promise(r => setTimeout(r, 600));

    return { hist, url: window.location.href };
  });

  console.log('Trace result:', res);
  await browser.close();
}

traceNavigate();

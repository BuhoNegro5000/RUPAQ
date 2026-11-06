import { chromium } from 'playwright';

async function stepNavigate() {
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
    const nav = await import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/node_modules/@sveltejs/kit/src/runtime/app/navigation.js");
    
    // Add beforeNavigate hook test
    let beforeCalled = false;
    nav.beforeNavigate((nav) => {
      beforeCalled = true;
      console.log('beforeNavigate triggered:', nav.to?.url?.href);
    });

    const link = document.querySelector('.rail-nav__items a[href="/dias"]');
    link.click();
    await new Promise(r => setTimeout(r, 600));

    return { beforeCalled, url: window.location.href };
  });

  console.log('Step result:', res);
  await browser.close();
}

stepNavigate();

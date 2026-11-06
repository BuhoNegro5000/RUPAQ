import { chromium } from 'playwright';

async function testViteHydration() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.addInitScript(() => {
    localStorage.setItem('rupaq.settings.v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);

  const testNav = await page.evaluate(async () => {
    const link = document.querySelector('.rail-nav__items a[href="/dias"]');
    link.click();
    await new Promise(r => setTimeout(r, 400));
    return window.location.href;
  });

  console.log('Result after click:', testNav);
  await browser.close();
}

testViteHydration();

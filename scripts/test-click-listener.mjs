import { chromium } from 'playwright';

async function testClickWithListeners() {
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

  // Check what happens on click in the browser context
  const clickInfo = await page.evaluate(async () => {
    const link = document.querySelector('.rail-nav__items a[href="/dias"]');
    if (!link) return { error: 'link not found' };

    let defaultPrevented = false;
    const testHandler = (e) => {
      defaultPrevented = e.defaultPrevented;
    };
    window.addEventListener('click', testHandler, { capture: true });

    link.click();

    return {
      href: link.getAttribute('href'),
      pathname: window.location.pathname
    };
  });

  console.log('Evaluate click result:', clickInfo);
  await page.waitForTimeout(500);
  console.log('After evaluate URL:', page.url());

  await browser.close();
}

testClickWithListeners().catch(console.error);

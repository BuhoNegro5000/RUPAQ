import { chromium } from 'playwright';

async function checkKitRouter() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.addInitScript(() => {
    localStorage.setItem('rupaq.settings.v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const check = await page.evaluate(async () => {
    // SvelteKit attaches router to window or document
    const link = document.querySelector('.rail-nav__items a[href="/dias"]');
    
    // Check if event listener prevents default
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    const dispatched = link.dispatchEvent(event);
    
    return {
      dispatched,
      defaultPrevented: event.defaultPrevented
    };
  });

  console.log('Router check:', check);
  await browser.close();
}

checkKitRouter();

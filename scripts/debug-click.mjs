import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleMessages.push(`[pageerror] ${err.message}`));

  console.log('1. Loading /mas ...');
  await page.goto('http://127.0.0.1:5173/mas');
  await page.waitForTimeout(600);

  console.log('Is element visible?');
  const isVis = await page.isVisible('a[href="/mas/hidratacion"]');
  console.log('Visible:', isVis);

  console.log('2. Clicking "Puntos de hidratacion"...');
  await page.click('a[href="/mas/hidratacion"]');
  
  // Wait up to 3s and print URL every 500ms
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(500);
    console.log(`URL at +${(i+1)*500}ms:`, page.url());
  }

  console.log('Console messages:', consoleMessages);
  await browser.close();
}

main().catch(console.error);

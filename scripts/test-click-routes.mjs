import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  console.log('1. Loading /mas ...');
  await page.goto('http://127.0.0.1:5173/mas');
  await page.waitForTimeout(600);

  console.log('2. Clicking "Puntos de hidratacion"...');
  await page.click('a[href="/mas/hidratacion"]');
  await page.waitForTimeout(600);
  console.log(' -> Landed on:', page.url());

  console.log('3. Returning to /mas and clicking "Mis lugares"...');
  await page.goto('http://127.0.0.1:5173/mas');
  await page.waitForTimeout(600);
  await page.click('a[href="/mas/lugares"]');
  await page.waitForTimeout(600);
  console.log(' -> Landed on:', page.url());

  console.log('4. Navigating to /sintomas and clicking condition card...');
  await page.goto('http://127.0.0.1:5173/sintomas');
  await page.waitForTimeout(600);
  await page.click('a[href="/sintomas/golpe-de-calor"]');
  await page.waitForTimeout(600);
  console.log(' -> Landed on:', page.url());

  console.log('5. Navigating to /dias...');
  await page.goto('http://127.0.0.1:5173/dias');
  await page.waitForTimeout(600);
  console.log(' -> Landed on:', page.url());

  console.log('6. Navigating to /ubicacion...');
  await page.goto('http://127.0.0.1:5173/ubicacion');
  await page.waitForTimeout(600);
  console.log(' -> Landed on:', page.url());

  console.log('\nTotal Console/Page Errors:', consoleErrors);
  await browser.close();
}

main().catch(console.error);

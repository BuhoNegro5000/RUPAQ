import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  // Go to /mas
  await page.goto('http://127.0.0.1:5173/mas');
  await page.waitForTimeout(500);
  const rows = await page.locator('.more-row').all();
  console.log('Total more-rows:', rows.length);
  for (const r of rows) {
    const text = (await r.innerText()).replace(/\n/g, ' ');
    const href = await r.getAttribute('href');
    console.log(`  ${href} -> ${text}`);
  }

  // Click on hidratacion
  await page.click('a[href="/mas/hidratacion"]');
  await page.waitForTimeout(500);
  console.log('URL after clicking hidratacion:', page.url());

  // Check /ubicacion
  await page.goto('http://127.0.0.1:5173/ubicacion');
  await page.waitForTimeout(500);
  const selects = await page.locator('select').all();
  for (const s of selects) {
    const val = await s.evaluate(el => ({
      colorScheme: getComputedStyle(el).colorScheme,
      color: getComputedStyle(el).color,
      bg: getComputedStyle(el).backgroundColor
    }));
    console.log('Select:', val);
  }

  await browser.close();
}

main().catch(console.error);

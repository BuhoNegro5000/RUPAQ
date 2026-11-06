import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const CAPTURE_DIR = 'C:/Users/RICARDO/.gemini/antigravity/brain/78d2e0ea-802e-44c4-ade8-c4a1f40e7681/captures';
if (!fs.existsSync(CAPTURE_DIR)) {
  fs.mkdirSync(CAPTURE_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  
  // 1. Verify /ubicacion in Desktop 1280 (Night mode)
  console.log('--- 1. Testing /ubicacion select contrast in night mode ---');
  const page = await context.newPage();
  
  // Set localStorage to dismiss welcome modal so it does not block navigation
  await page.addInitScript(() => {
    localStorage.setItem('rupaq-settings-v1', JSON.stringify({
      onboarded: true,
      profile: [],
      fontScale: 1,
      simpleMode: false,
      contrastBoost: false,
      soundEnabled: false,
      hapticsEnabled: true,
      notifications: false
    }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  await page.goto('http://127.0.0.1:5173/ubicacion');
  await page.waitForTimeout(600);

  const sel = page.locator('.select-wrap select').first();
  const selInfo = await sel.evaluate(el => ({
    colorScheme: getComputedStyle(el).colorScheme,
    color: getComputedStyle(el).color,
    bg: getComputedStyle(el).backgroundColor
  }));
  console.log('Select computed style:', selInfo);

  const opt = sel.locator('option').first();
  const optInfo = await opt.evaluate(el => ({
    colorScheme: getComputedStyle(el).colorScheme,
    color: getComputedStyle(el).color,
    bg: getComputedStyle(el).backgroundColor
  }));
  console.log('Option computed style:', optInfo);

  // Take screenshot of /ubicacion
  await page.screenshot({ path: path.join(CAPTURE_DIR, '13-ubicacion-contrast-1280.png'), fullPage: false });
  console.log('Saved 13-ubicacion-contrast-1280.png');

  // 2. Test navigation from /mas to /mas/hidratacion
  console.log('--- 2. Testing navigation from /mas to /mas/hidratacion ---');
  await page.goto('http://127.0.0.1:5173/mas');
  await page.waitForTimeout(400);
  
  const hidraRow = page.locator('a[href="/mas/hidratacion"]');
  const count = await hidraRow.count();
  console.log('Found hidratacion link in /mas:', count);
  if (count > 0) {
    await hidraRow.click();
    await page.waitForTimeout(500);
    console.log('Current URL after clicking hidratacion:', page.url());
  }

  // 3. Test /mas/hidratacion interactive features
  console.log('--- 3. Testing /mas/hidratacion interactive features ---');
  await page.goto('http://127.0.0.1:5173/mas/hidratacion');
  await page.waitForTimeout(800);

  // Verify map exists
  const mapEl = page.locator('.leaflet-map-element');
  console.log('Map element present:', await mapEl.count());

  // Verify points count
  const cards = page.locator('.point-card');
  console.log('Total point cards loaded:', await cards.count());

  // Filter by category: Bebederos gratuitos
  console.log('Filtering by Bebederos...');
  await page.click('button:has-text("Bebederos gratuitos")');
  await page.waitForTimeout(300);
  console.log('Cards after filter:', await page.locator('.point-card').count());

  // Reset filter to Todos
  await page.click('button:has-text("Todos")');
  await page.waitForTimeout(300);

  // Search filter
  console.log('Testing search query: Kennedy...');
  await page.fill('input[placeholder*="Buscar"]', 'Kennedy');
  await page.waitForTimeout(300);
  console.log('Cards matching Kennedy:', await page.locator('.point-card').count());

  // Clear search
  await page.click('.clear-btn');
  await page.waitForTimeout(300);

  // Calculator interaction
  console.log('Testing hydration calculator...');
  await page.click('button:has-text("Deporte / Ciclismo")');
  await page.waitForTimeout(200);
  const metricBig = await page.locator('.metric-big strong').innerText();
  console.log('Calculated liquid for sport:', metricBig, 'Litros');

  // Save screenshot Desktop 1280
  await page.screenshot({ path: path.join(CAPTURE_DIR, '14-hidratacion-herramienta-1280.png'), fullPage: false });
  console.log('Saved 14-hidratacion-herramienta-1280.png');

  // 4. Test Mobile 375x812
  console.log('--- 4. Testing mobile viewport 375x812 ---');
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://127.0.0.1:5173/mas/hidratacion');
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(CAPTURE_DIR, '15-hidratacion-herramienta-375.png'), fullPage: false });
  console.log('Saved 15-hidratacion-herramienta-375.png');
  await mobileContext.close();

  // 5. Axe Accessibility Check
  console.log('--- 5. Running Axe Accessibility Audit ---');
  await mobilePage.close();
  const axeResults = await new AxeBuilder({ page }).analyze();
  console.log('Axe violations count:', axeResults.violations.length);
  if (axeResults.violations.length > 0) {
    for (const v of axeResults.violations) {
      console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`);
    }
  }

  await page.close();
  await browser.close();
  console.log('--- Verification complete! ---');
}

run().catch(console.error);

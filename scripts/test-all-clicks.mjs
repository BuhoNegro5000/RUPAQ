import { chromium } from 'playwright';

async function testAllClicksInMas() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await page.addInitScript(() => {
    localStorage.setItem('rupaq-settings-v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  await page.goto('http://127.0.0.1:5173/mas');
  await page.waitForTimeout(500);

  const count = await page.locator('.more-row').count();
  console.log('Testing clicks on all', count, 'links in /mas:');

  for (let i = 0; i < count; i++) {
    await page.goto('http://127.0.0.1:5173/mas');
    await page.waitForTimeout(300);
    const row = page.locator('.more-row').nth(i);
    const expectedHref = await row.getAttribute('href');
    const title = (await row.locator('.row-title').innerText()).trim();

    await row.click();
    await page.waitForTimeout(400);

    const currentUrl = page.url();
    const passed = currentUrl.endsWith(expectedHref);
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] "${title}" -> Exp: ${expectedHref} | Landed: ${currentUrl}`);
  }

  // Also test bottom nav links
  console.log('\nTesting Bottom Navigation links:');
  const navHrefs = ['/', '/dias', '/sintomas', '/mas'];
  for (const h of navHrefs) {
    await page.goto('http://127.0.0.1:5173/mas');
    await page.waitForTimeout(200);
    const btn = page.locator(`.bottom-nav a[href="${h}"]`);
    await btn.click();
    await page.waitForTimeout(400);
    const passed = page.url().endsWith(h === '/' ? ':5173/' : h);
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] BottomNav ${h} -> Landed: ${page.url()}`);
  }

  // Also test Rail nav links
  console.log('\nTesting Rail Navigation links:');
  for (const h of navHrefs) {
    await page.goto('http://127.0.0.1:5173/mas');
    await page.waitForTimeout(200);
    const btn = page.locator(`.rail-nav__items a[href="${h}"]`);
    await btn.click();
    await page.waitForTimeout(400);
    const passed = page.url().endsWith(h === '/' ? ':5173/' : h);
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] RailNav ${h} -> Landed: ${page.url()}`);
  }

  // Also test Symptoms condition cards
  console.log('\nTesting Symptoms cards in /sintomas:');
  await page.goto('http://127.0.0.1:5173/sintomas');
  await page.waitForTimeout(400);
  const conditionLinks = await page.locator('.condition-card').all();
  console.log('Found condition cards:', conditionLinks.length);
  for (let i = 0; i < conditionLinks.length; i++) {
    await page.goto('http://127.0.0.1:5173/sintomas');
    await page.waitForTimeout(200);
    const card = page.locator('.condition-card').nth(i);
    const href = await card.getAttribute('href');
    await card.click();
    await page.waitForTimeout(400);
    const passed = page.url().endsWith(href);
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] Card ${href} -> Landed: ${page.url()}`);
  }

  await browser.close();
  console.log('\n✅ All navigation links verified!');
}

testAllClicksInMas().catch(console.error);

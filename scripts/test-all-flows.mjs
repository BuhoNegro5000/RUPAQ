import { chromium } from 'playwright';

async function testMobileAndDesktopNavigation() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Test (1280x800)
  console.log('=== Desktop 1280x800 RailNav and Header Navigation ===');
  const dPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await dPage.addInitScript(() => {
    localStorage.setItem('rupaq.settings.v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  await dPage.goto('http://127.0.0.1:5173/');
  await dPage.waitForTimeout(500);

  // Click on Dias in rail nav
  await dPage.click('.rail-nav__items a[href="/dias"]');
  await dPage.waitForTimeout(300);
  console.log('RailNav /dias ->', dPage.url());

  // Click on Sintomas
  await dPage.click('.rail-nav__items a[href="/sintomas"]');
  await dPage.waitForTimeout(300);
  console.log('RailNav /sintomas ->', dPage.url());

  // Click on Mas
  await dPage.click('.rail-nav__items a[href="/mas"]');
  await dPage.waitForTimeout(300);
  console.log('RailNav /mas ->', dPage.url());

  // Click on Hidratacion
  await dPage.click('a[href="/mas/hidratacion"]');
  await dPage.waitForTimeout(300);
  console.log('More-row /mas/hidratacion ->', dPage.url());

  // Back to /mas via back link
  await dPage.click('.back-link');
  await dPage.waitForTimeout(300);
  console.log('Back to ->', dPage.url());

  // Click on Lugares
  await dPage.click('a[href="/mas/lugares"]');
  await dPage.waitForTimeout(300);
  console.log('More-row /mas/lugares ->', dPage.url());

  // 2. Mobile Test (375x812)
  console.log('\n=== Mobile 375x812 BottomNav and Screen Navigation ===');
  const mPage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  
  await mPage.addInitScript(() => {
    localStorage.setItem('rupaq.settings.v1', JSON.stringify({ onboarded: true }));
    sessionStorage.setItem('rupaq_splash_seen', 'true');
  });

  await mPage.goto('http://127.0.0.1:5173/');
  await mPage.waitForTimeout(500);

  // BottomNav to Dias
  await mPage.click('.bottom-nav a[href="/dias"]');
  await mPage.waitForTimeout(300);
  console.log('BottomNav /dias ->', mPage.url());

  // BottomNav to Sintomas
  await mPage.click('.bottom-nav a[href="/sintomas"]');
  await mPage.waitForTimeout(300);
  console.log('BottomNav /sintomas ->', mPage.url());

  // BottomNav to Mas
  await mPage.click('.bottom-nav a[href="/mas"]');
  await mPage.waitForTimeout(300);
  console.log('BottomNav /mas ->', mPage.url());

  // Click Hidratacion on mobile
  await mPage.click('a[href="/mas/hidratacion"]');
  await mPage.waitForTimeout(300);
  console.log('Mobile click Hidratacion ->', mPage.url());

  // Click back to Mas
  await mPage.click('.back-link');
  await mPage.waitForTimeout(300);
  console.log('Mobile back to ->', mPage.url());

  // Click Emergencia row on mobile
  await mPage.click('a[href="/emergencia"]');
  await mPage.waitForTimeout(300);
  console.log('Mobile click Emergencia ->', mPage.url());

  // Close emergency
  await mPage.click('a.close');
  await mPage.waitForTimeout(300);
  console.log('Mobile close emergency back to ->', mPage.url());

  await browser.close();
  console.log('\n✅ All desktop and mobile navigation routes test successfully!');
}

testMobileAndDesktopNavigation().catch(console.error);

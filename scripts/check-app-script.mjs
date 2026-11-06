import { chromium } from 'playwright';

async function checkAppScript() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(500);

  const res = await page.evaluate(async () => {
    try {
      const app = await import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/.svelte-kit/generated/client/app.js");
      const rootMod = await app.root();
      return { rootKeys: Object.keys(rootMod), rootDefault: typeof rootMod.default };
    } catch (e) {
      return { error: e.stack || e.toString() };
    }
  });

  console.log('App root check:', res);
  await browser.close();
}

checkAppScript();

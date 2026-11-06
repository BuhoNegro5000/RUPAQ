import { chromium } from 'playwright';

async function checkImport() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const evalResult = await page.evaluate(async () => {
    try {
      const [kit, app] = await Promise.all([
        import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/node_modules/@sveltejs/kit/src/runtime/client/entry.js"),
        import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/.svelte-kit/generated/client/app.js")
      ]);
      return { kit: Object.keys(kit), app: Object.keys(app) };
    } catch (e) {
      return { error: e.stack || e.toString() };
    }
  });

  console.log('Eval result:', evalResult);
  await browser.close();
}

checkImport();

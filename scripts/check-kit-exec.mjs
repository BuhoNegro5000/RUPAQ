import { chromium } from 'playwright';

async function checkKitExec() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(500);

  const res = await page.evaluate(async () => {
    try {
      const [kit, app] = await Promise.all([
        import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/node_modules/@sveltejs/kit/src/runtime/client/entry.js"),
        import("/@fs/C:/Users/RICARDO/Downloads/APPCALORYSALUD/.svelte-kit/generated/client/app.js")
      ]);
      
      const target = document.querySelector('body > div');
      console.log('Target element:', target);
      
      const started = await kit.start(app, target, {
        node_ids: [0, 2],
        data: [null, null],
        form: null,
        error: null
      });
      return { success: true };
    } catch (e) {
      return { error: e.stack || e.toString() };
    }
  });

  console.log('Kit exec result:', res);
  await browser.close();
}

checkKitExec();

import { chromium } from 'playwright';

async function checkConsoleDetailed() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const allConsole = [];
  page.on('console', msg => allConsole.push({ type: msg.type(), text: msg.text(), location: msg.location() }));
  page.on('pageerror', err => allConsole.push({ type: 'pageerror', text: err.stack || err.toString() }));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  console.log('All console events:');
  allConsole.forEach(c => console.log(JSON.stringify(c)));

  await browser.close();
}

checkConsoleDetailed();

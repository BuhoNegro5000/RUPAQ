import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('static/audit-captures');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Mock forecast generator for exact scenarios
function generateForecast({ distrito, provincia, zona, feelsC, tempC, humidity, risk, riskKey, hour = 12 }) {
  const dateStr = '2026-11-05';
  const hourly = [];
  for (let h = 0; h < 48; h++) {
    const d = new Date(Date.UTC(2026, 10, 5, h, 0, 0));
    const hNum = d.getUTCHours();
    // Simulate diurnal thermal curve
    const cycle = Math.sin(((hNum - 8) / 24) * 2 * Math.PI);
    const hFeels = hNum >= 12 && hNum <= 15 ? feelsC : Math.round(feelsC - 6 + cycle * 5);
    hourly.push({
      time: d.toISOString(),
      hour: hNum,
      tempC: Math.round(hFeels - (humidity > 60 ? 4 : 1)),
      feelsC: hFeels,
      humidity: humidity,
      risk: hFeels >= 42 ? 4 : hFeels >= 38 ? 3 : hFeels >= 32 ? 2 : hFeels >= 27 ? 1 : 0,
      riskKey: hFeels >= 42 ? 'extreme' : hFeels >= 38 ? 'danger' : hFeels >= 32 ? 'precaution' : hFeels >= 27 ? 'attention' : 'safe',
      pop: 5,
      uv: hNum >= 10 && hNum <= 16 ? 9 : 0
    });
  }

  const daily = [
    { date: '2026-11-05', tempMax: feelsC, tempMin: 22, popMax: 0, uvMax: 9, risk, riskKey },
    { date: '2026-11-06', tempMax: feelsC + 1, tempMin: 23, popMax: 0, uvMax: 10, risk, riskKey },
    { date: '2026-11-07', tempMax: feelsC - 1, tempMin: 21, popMax: 10, uvMax: 9, risk: Math.max(0, risk - 1), riskKey: risk === 3 ? 'precaution' : 'safe' },
    { date: '2026-11-08', tempMax: feelsC - 2, tempMin: 21, popMax: 5, uvMax: 8, risk: Math.max(0, risk - 1), riskKey: risk === 3 ? 'precaution' : 'safe' },
    { date: '2026-11-09', tempMax: feelsC, tempMin: 22, popMax: 0, uvMax: 9, risk, riskKey },
    { date: '2026-11-10', tempMax: feelsC + 2, tempMin: 24, popMax: 0, uvMax: 11, risk: Math.min(4, risk + 1), riskKey: risk === 3 ? 'extreme' : 'attention' },
    { date: '2026-11-11', tempMax: feelsC, tempMin: 22, popMax: 0, uvMax: 9, risk, riskKey }
  ];

  return {
    source: 'open-meteo',
    location: {
      ubigeo: '200101',
      distrito,
      provincia,
      departamento: provincia,
      lat: -5.1945,
      lon: -80.6328,
      altitud: 36,
      zona
    },
    now: {
      time: `2026-11-05T${String(hour).padStart(2, '0')}:34:00-05:00`,
      tempC,
      feelsC,
      humidity,
      risk,
      riskKey,
      uv: hour >= 10 && hour <= 16 ? 9 : 0,
      air: { aqi: 35, pm25: 8.5, category: 'Buena', level: 0 },
      isNight: hour < 6 || hour >= 18
    },
    risk: {
      currentLevel: risk,
      peakLevel: Math.max(risk, 3),
      peakHour: 14,
      peakFeels: feelsC + 1,
      sustainedHours: 4,
      dangerHours: risk >= 3 ? [12, 13, 14, 15] : []
    },
    hourly,
    daily,
    alerts: [],
    freshness: {
      updatedAt: new Date().toISOString(),
      stale: false,
      minutesAgo: 12
    }
  };
}

async function run() {
  const browser = await chromium.launch();
  const axeResults = [];

  const scenarios = [
    {
      name: '01-seguro-dia-1280',
      width: 1280,
      height: 800,
      colorScheme: 'light',
      hour: 12,
      minute: 15,
      data: generateForecast({
        distrito: 'Lima',
        provincia: 'Lima',
        zona: 'costa_central',
        feelsC: 24,
        tempC: 22,
        humidity: 65,
        risk: 0,
        riskKey: 'safe',
        hour: 12
      })
    },
    {
      name: '02-seguro-noche-1280',
      width: 1280,
      height: 800,
      colorScheme: 'light',
      hour: 23,
      minute: 34,
      data: generateForecast({
        distrito: 'Lima',
        provincia: 'Lima',
        zona: 'costa_central',
        feelsC: 23,
        tempC: 23,
        humidity: 82,
        risk: 0,
        riskKey: 'safe',
        hour: 23
      })
    },
    {
      name: '03-peligro-mediodia-1280',
      width: 1280,
      height: 800,
      colorScheme: 'light',
      hour: 13,
      minute: 0,
      data: generateForecast({
        distrito: 'Piura',
        provincia: 'Piura',
        zona: 'costa_norte',
        feelsC: 44,
        tempC: 36,
        humidity: 58,
        risk: 3,
        riskKey: 'danger',
        hour: 13
      })
    },
    {
      name: '04-peligro-mediodia-375',
      width: 375,
      height: 812,
      colorScheme: 'light',
      hour: 13,
      minute: 0,
      data: generateForecast({
        distrito: 'Piura',
        provincia: 'Piura',
        zona: 'costa_norte',
        feelsC: 44,
        tempC: 36,
        humidity: 58,
        risk: 3,
        riskKey: 'danger',
        hour: 13
      })
    },
    {
      name: '05-peligro-dark-1280',
      width: 1280,
      height: 800,
      colorScheme: 'dark',
      hour: 13,
      minute: 0,
      data: generateForecast({
        distrito: 'Piura',
        provincia: 'Piura',
        zona: 'costa_norte',
        feelsC: 44,
        tempC: 36,
        humidity: 58,
        risk: 3,
        riskKey: 'danger',
        hour: 13
      })
    },
    {
      name: '06-peligro-dark-375',
      width: 375,
      height: 812,
      colorScheme: 'dark',
      hour: 13,
      minute: 0,
      data: generateForecast({
        distrito: 'Piura',
        provincia: 'Piura',
        zona: 'costa_norte',
        feelsC: 44,
        tempC: 36,
        humidity: 58,
        risk: 3,
        riskKey: 'danger',
        hour: 13
      })
    },
    {
      name: '07-extremo-1280',
      width: 1280,
      height: 800,
      colorScheme: 'light',
      hour: 14,
      minute: 20,
      data: generateForecast({
        distrito: 'Iquitos',
        provincia: 'Maynas',
        zona: 'selva_baja',
        feelsC: 46,
        tempC: 37,
        humidity: 78,
        risk: 4,
        riskKey: 'extreme',
        hour: 14
      })
    },
    {
      name: '08-mobile-390x844-noscroll',
      width: 390,
      height: 844,
      colorScheme: 'light',
      hour: 12,
      minute: 0,
      data: generateForecast({
        distrito: 'Lima',
        provincia: 'Lima',
        zona: 'costa_central',
        feelsC: 24,
        tempC: 22,
        humidity: 65,
        risk: 0,
        riskKey: 'safe',
        hour: 12
      })
    }
  ];

  for (const sc of scenarios) {
    const context = await browser.newContext({
      viewport: { width: sc.width, height: sc.height },
      colorScheme: sc.colorScheme
    });
    const page = await context.newPage();

    // Set mock time
    const fixedIso = `2026-11-05T${String(sc.hour).padStart(2, '0')}:${String(sc.minute).padStart(2, '0')}:00-05:00`;
    await page.clock.setFixedTime(new Date(fixedIso));

    // Intercept API
    await page.route('**/api/forecast*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sc.data)
      });
    });

    // Populate localStorage so welcome modal is dismissed for main audits
    await page.addInitScript((loc) => {
      window.localStorage.setItem('rupaq.settings.v1', JSON.stringify({
        onboarded: true,
        dismissedSetup: true,
        fontScale: 'normal',
        profile: []
      }));
      window.localStorage.setItem('rupaq.location.v1', JSON.stringify(loc));
    }, sc.data.location);

    await page.goto('http://127.0.0.1:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    // Save screenshot
    const shotPath = path.join(outDir, `${sc.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Captured ${sc.name} -> ${shotPath}`);

    // If mobile 390x844, check scroll height vs client height
    if (sc.name === '08-mobile-390x844-noscroll') {
      const scrollInfo = await page.evaluate(() => {
        const screen = document.querySelector('.screen');
        return {
          scrollHeight: screen ? screen.scrollHeight : document.body.scrollHeight,
          clientHeight: screen ? screen.clientHeight : window.innerHeight
        };
      });
      console.log(`Mobile scroll check: scrollHeight=${scrollInfo.scrollHeight}, clientHeight=${scrollInfo.clientHeight}`);
    }

    // Run Axe Accessibility Contrast Audit
    try {
      const axe = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
      axeResults.push({
        scenario: sc.name,
        violations: axe.violations
      });
      console.log(`Axe contrast check for ${sc.name}: ${axe.violations.length} violations`);
    } catch (err) {
      console.error(`Axe check error on ${sc.name}:`, err.message);
    }

    await page.close();
    await context.close();
  }

  // Also capture the Interactive Welcome Modal
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: 'light'
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.localStorage.setItem('rupaq.settings.v1', JSON.stringify({
        onboarded: false,
        dismissedSetup: false,
        fontScale: 'normal',
        profile: []
      }));
    });
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    const welcomeShotPath = path.join(outDir, '09-bienvenida-interactiva-1280.png');
    await page.screenshot({ path: welcomeShotPath });
    console.log(`Captured Welcome Modal -> ${welcomeShotPath}`);
    await page.close();
    await context.close();
  }

  // Also capture Welcome Modal mobile
  {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      colorScheme: 'light'
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.localStorage.setItem('rupaq.settings.v1', JSON.stringify({
        onboarded: false,
        dismissedSetup: false,
        fontScale: 'normal',
        profile: []
      }));
    });
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    const welcomeShotPath = path.join(outDir, '10-bienvenida-interactiva-375.png');
    await page.screenshot({ path: welcomeShotPath });
    console.log(`Captured Welcome Modal Mobile -> ${welcomeShotPath}`);
    await page.close();
    await context.close();
  }

  await browser.close();

  // Summary
  console.log('\n--- AXE ACCESSIBILITY SUMMARY ---');
  let totalViolations = 0;
  for (const r of axeResults) {
    totalViolations += r.violations.length;
    if (r.violations.length > 0) {
      console.log(`FAIL: ${r.scenario} had ${r.violations.length} violations:`, JSON.stringify(r.violations.map(v => v.nodes.map(n => n.html))));
    } else {
      console.log(`PASS: ${r.scenario} -> 0 color-contrast errors.`);
    }
  }
  console.log(`Total contrast violations across all scenarios: ${totalViolations}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

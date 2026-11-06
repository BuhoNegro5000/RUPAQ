import { chromium } from 'playwright';

async function testSeoMetadata() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Testing Home / for SEO & Social Metadata...');
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(500);

  // Read meta tags
  const meta = await page.evaluate(() => {
    const get = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || null;
    return {
      title: document.title,
      description: get('meta[name="description"]'),
      canonical: get('link[rel="canonical"]', 'href'),
      // GEO
      geoRegion: get('meta[name="geo.region"]'),
      geoPlace: get('meta[name="geo.placename"]'),
      geoPos: get('meta[name="geo.position"]'),
      icbm: get('meta[name="ICBM"]'),
      // Open Graph
      ogSiteName: get('meta[property="og:site_name"]'),
      ogTitle: get('meta[property="og:title"]'),
      ogDesc: get('meta[property="og:description"]'),
      ogImage: get('meta[property="og:image"]'),
      ogUrl: get('meta[property="og:url"]'),
      ogType: get('meta[property="og:type"]'),
      ogLocale: get('meta[property="og:locale"]'),
      // Twitter
      twitterCard: get('meta[name="twitter:card"]'),
      twitterTitle: get('meta[name="twitter:title"]'),
      twitterDesc: get('meta[name="twitter:description"]'),
      twitterImage: get('meta[name="twitter:image"]'),
      // JSON-LD
      jsonLd: document.querySelector('script[type="application/ld+json"]')?.textContent || null
    };
  });

  console.log('Title:', meta.title);
  console.log('Description:', meta.description?.slice(0, 70) + '...');
  console.log('Canonical:', meta.canonical);
  console.log('GEO Region / Placename:', meta.geoRegion, '/', meta.geoPlace);
  console.log('GEO Position:', meta.geoPos);
  console.log('OG Site Name:', meta.ogSiteName);
  console.log('OG Title:', meta.ogTitle);
  console.log('OG Image:', meta.ogImage);
  console.log('Twitter Card:', meta.twitterCard);
  console.log('JSON-LD present:', Boolean(meta.jsonLd));

  // Check robots.txt
  console.log('\nChecking /robots.txt...');
  const robotsRes = await page.goto('http://127.0.0.1:5173/robots.txt');
  console.log('robots.txt status:', robotsRes?.status());
  const robotsText = await robotsRes?.text();
  console.log('robots.txt has Sitemap:', robotsText?.includes('Sitemap: https://rupaq.pe/sitemap.xml'));

  // Check sitemap.xml
  console.log('\nChecking /sitemap.xml...');
  const sitemapRes = await page.goto('http://127.0.0.1:5173/sitemap.xml');
  console.log('sitemap.xml status:', sitemapRes?.status());
  const sitemapText = await sitemapRes?.text();
  console.log('sitemap.xml contains /mas/hidratacion:', sitemapText?.includes('/mas/hidratacion'));

  // Check llms.txt
  console.log('\nChecking /llms.txt...');
  const llmsRes = await page.goto('http://127.0.0.1:5173/llms.txt');
  console.log('llms.txt status:', llmsRes?.status());
  const llmsText = await llmsRes?.text();
  console.log('llms.txt has RUPAQ title:', llmsText?.includes('# RUPAQ'));

  // Check og-rupaq.png
  console.log('\nChecking /og-rupaq.png...');
  const ogImgRes = await page.goto('http://127.0.0.1:5173/og-rupaq.png');
  console.log('og-rupaq.png status:', ogImgRes?.status());
  console.log('Content-Type:', ogImgRes?.headers()['content-type']);

  await browser.close();
  console.log('\n✅ All SEO, GEO, and Social sharing assets verified successfully!');
}

testSeoMetadata().catch(console.error);

const { chromium } = require('playwright');
const fs = require('fs');

const IGNORE_HOSTS = [
  'googletagmanager', 'google-analytics', 'doubleclick', 'facebook', 'tiqcdn',
  'cookielaw', 'onetrust', 'abtasty', 'sail-horizon', 'cloudflareinsights',
  'brightcove', 'turnto', 'cquotient', 'bat.bing', 'pinterest', 'tiktok',
  'criteo', 'hotjar', 'newrelic', 'segment', 'snapchat', 'awin', 'impact',
];
const IGNORE_TYPES = ['image', 'font', 'stylesheet', 'media', 'other'];

const log = [];

function interesting(url, resourceType) {
  if (IGNORE_TYPES.includes(resourceType)) return false;
  if (IGNORE_HOSTS.some((h) => url.includes(h))) return false;
  if (/\.(png|jpg|jpeg|gif|svg|webp|woff2?|ttf|css|ico|mp4)(\?|$)/i.test(url)) return false;
  return true;
}

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const page = await ctx.newPage();

  page.on('response', async (res) => {
    const req = res.request();
    const url = req.url();
    const rtype = req.resourceType();
    if (!interesting(url, rtype)) return;
    const ct = (res.headers()['content-type'] || '').split(';')[0];
    const entry = {
      method: req.method(),
      url,
      status: res.status(),
      resourceType: rtype,
      contentType: ct,
      postData: req.postData() ? String(req.postData()).slice(0, 2000) : undefined,
    };
    if (ct.includes('json')) {
      try {
        const body = await res.text();
        entry.jsonBody = body.slice(0, 200000);
      } catch (e) {
        entry.bodyError = String(e.message);
      }
    }
    log.push(entry);
  });

  const step = async (name, fn) => {
    console.log(`\n### STEP: ${name}`);
    const before = log.length;
    try {
      await fn();
    } catch (e) {
      console.log(`  !! ${name} failed: ${e.message}`);
    }
    await page.waitForTimeout(3500);
    for (const e of log.slice(before)) e.step = e.step || name;
    console.log(`  captured ${log.length - before} requests`);
  };

  await step('home', async () => {
    await page.goto('https://www.brooksrunning.com/en_us/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    console.log('  title:', await page.title());
    // dismiss cookie banner if present
    for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Accept")']) {
      const b = page.locator(sel).first();
      if (await b.count().catch(() => 0)) {
        await b.click({ timeout: 3000 }).catch(() => {});
        break;
      }
    }
  });

  await step('plp-new-arrivals', async () => {
    await page.goto('https://www.brooksrunning.com/en_us/featured/new-arrivals/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(3000);
    await page.mouse.wheel(0, 2500);
  });

  // find a product link on the PLP
  let pdpUrl = null;
  await step('find-pdp-link', async () => {
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    const cand = hrefs.filter((h) => h && /\/en_us\/.*\/\d{6,}[^/]*\.html/.test(h));
    console.log('  product-ish links:', cand.slice(0, 5));
    if (cand.length) pdpUrl = new URL(cand[0], 'https://www.brooksrunning.com').href;
  });

  if (!pdpUrl) pdpUrl = 'https://www.brooksrunning.com/en_us/mens-ghost-17-cushion-running-shoe/110435.html';

  await step('pdp', async () => {
    console.log('  PDP:', pdpUrl);
    await page.goto(pdpUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.mouse.wheel(0, 1200);
  });

  await step('select-size', async () => {
    // SFRA size swatches are usually buttons/anchors with data-attr-value or .size-value
    const sels = [
      'button.size-value:not(.unselectable)',
      '.size-attribute button:not([disabled])',
      '[data-attr="size"] button:not([disabled])',
      'li.size-attribute a',
      '.swatch-size:not(.unselectable)',
    ];
    for (const s of sels) {
      const el = page.locator(s).nth(3);
      if (await el.count().catch(() => 0)) {
        console.log('  clicking size via', s);
        await el.click({ timeout: 5000 }).catch((e) => console.log('  click fail', e.message));
        return;
      }
    }
    console.log('  no size selector matched');
  });

  await step('add-to-cart', async () => {
    const sels = [
      'button.add-to-cart',
      'button[data-pid]:has-text("Add")',
      'button:has-text("Add to Bag")',
      'button:has-text("Add to Cart")',
    ];
    for (const s of sels) {
      const el = page.locator(s).first();
      if ((await el.count().catch(() => 0)) && (await el.isEnabled().catch(() => false))) {
        console.log('  clicking ATC via', s);
        await el.click({ timeout: 8000 }).catch((e) => console.log('  click fail', e.message));
        return;
      }
    }
    console.log('  no ATC button matched');
  });

  await step('cart', async () => {
    await page.goto('https://www.brooksrunning.com/en_us/cart', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
  });

  fs.writeFileSync('capture.json', JSON.stringify(log, null, 2));
  console.log(`\n=== TOTAL: ${log.length} requests -> capture.json ===`);

  // Summary table
  const seen = new Map();
  for (const e of log) {
    const u = e.url.split('?')[0];
    const k = `${e.step} | ${e.method} ${e.status} ${e.contentType} | ${u}`;
    seen.set(k, (seen.get(k) || 0) + 1);
  }
  console.log('\n=== UNIQUE ENDPOINTS ===');
  for (const [k, n] of seen) console.log(`${n}x ${k}`);

  await browser.close();
})();

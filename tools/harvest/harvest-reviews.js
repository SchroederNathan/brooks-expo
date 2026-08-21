/**
 * Captures the Brooks PDP review summary and three newest TurnTo reviews.
 *
 * Brooks's SFCC controllers are behind Akamai Bot Manager, so this follows the
 * same warmed-browser boundary as the main catalog harvest. The checked-in
 * output doubles as a checkpoint; pass --refresh to recapture existing styles.
 *
 * @ref LLP 0002#turnto-reviews — Reviews are snapshot data because their SFCC
 * controller cannot be reached directly from React Native.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CATALOG = path.join(ROOT, 'packages', 'catalog', 'catalog.json');
const OUTPUT = path.join(ROOT, 'packages', 'catalog', 'reviews.json');
const SFCC = 'https://www.brooksrunning.com/on/demandware.store/Sites-BrooksRunning-Site/en_US';
const refresh = process.argv.includes('--refresh');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function writeSnapshot(products) {
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify({
      harvestedAt: new Date().toISOString(),
      source: 'brooksrunning.com (en_US) — SFCC TurnTo review controllers',
      products,
    })
  );
}

(async () => {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const existing = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  const products = refresh ? {} : existing?.products || {};
  const ids = catalog.products.map((product) => product.id);
  const todo = ids.filter((id) => products[id] == null);

  console.log(`=== Capturing reviews for ${todo.length} products (${ids.length - todo.length} cached) ===`);
  if (!todo.length) return;

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  });
  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['image', 'font', 'media', 'stylesheet'].includes(type)) return route.abort();
    return route.continue();
  });

  const page = await context.newPage();
  const warmSession = async () => {
    await page.goto('https://www.brooksrunning.com/en_us/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(5000);
  };

  await warmSession();
  console.log('  (Akamai session warmed)');

  let captured = 0;
  for (const id of todo) {
    try {
      const result = await page.evaluate(
        async ({ id, SFCC }) => {
          const get = async (action) => {
            const response = await fetch(`${SFCC}/${action}?pid=${encodeURIComponent(id)}`, {
              credentials: 'include',
              headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!response.ok) throw new Error(`${action} -> ${response.status}`);
            return response.json();
          };

          const [top, summary] = await Promise.all([
            get('TurnTo-GetReviews'),
            get('TurnTo-GetReviewsSummaryAccordion'),
          ]);
          const model = summary.reviewsSummaryModel || {};
          return {
            averageRating:
              typeof model.averageRating === 'number' ? model.averageRating : null,
            reviewCount:
              typeof model.reviews === 'number'
                ? model.reviews
                : top.topReviewsModel?.totalReviews || 0,
            dimensions: (model.dimensions || [])
              .filter((dimension) => typeof dimension.average === 'number')
              .map((dimension) => ({
                label: dimension.label,
                average: dimension.average,
                values: (dimension.values || []).map((value) => value.label),
              })),
            recent: (top.topReviewsModel?.reviews || []).slice(0, 3).map((review) => ({
              id: review.id,
              publishedDate: review.publishedDate,
              title: review.title,
              text: review.text,
              rating: review.rating,
              author: review.author,
              badge: review.badge || null,
            })),
          };
        },
        { id, SFCC }
      );
      products[id] = result;
      captured += 1;
      if (captured % 10 === 0) {
        writeSnapshot(products);
        console.log(`  ${captured}/${todo.length} (${id}, ${result.reviewCount} reviews)`);
      }
    } catch (error) {
      console.log(`  ! ${id}: ${String(error.message).slice(0, 100)}`);
      try {
        await warmSession();
      } catch {}
    }
    await sleep(125);
  }

  writeSnapshot(products);
  await browser.close();
  console.log(`-> ${path.relative(ROOT, OUTPUT)} (${Object.keys(products).length} products)`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

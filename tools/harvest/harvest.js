/**
 * Brooks catalog harvester.
 *
 * 1. Enumerate products per category via the public Constructor.io browse API.
 * 2. For each product+color, call SFCC Product-Variation from inside a real
 *    browser session (Akamai blocks plain HTTP clients) to get price, sizes,
 *    stock, images, specs, and ratings.
 * 3. Emit a normalized catalog.json.
 *
 * Polite: low concurrency, delays, on-disk checkpoint so it never re-fetches.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CIO_KEY = 'key_pCFzYTxeXssfLwfW';
const CIO_UUID = '69d04a98-171c-43b8-9b91-d6406301690b';
const SFCC = 'https://www.brooksrunning.com/on/demandware.store/Sites-BrooksRunning-Site/en_US';

const CATEGORIES = [
  { id: 'featured-new-arrivals', label: 'New Arrivals' },
  { id: 'featured-best-sellers', label: 'Best Sellers' },
  { id: 'mens-shoes-road-running-shoes', label: "Men's Road" },
  { id: 'womens-shoes-road-running-shoes', label: "Women's Road" },
  { id: 'featured-trail-running-collection', label: 'Trail' },
  { id: 'sale', label: 'Sale' },
  { id: 'mens-shoes', label: "Men's Shoes" },
  { id: 'womens-shoes', label: "Women's Shoes" },
  { id: 'mens-apparel', label: "Men's Apparel" },
  { id: 'womens-apparel', label: "Women's Apparel" },
];

const CKPT = path.join(__dirname, 'checkpoint.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cioBrowse(groupId, page_, perPage = 100) {
  const url =
    `https://ac.cnstrc.com/browse/group_id/${groupId}?c=ciojs-2.1439.2&key=${CIO_KEY}` +
    `&i=${CIO_UUID}&s=1&num_results_per_page=${perPage}&page=${page_}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`cio ${groupId} p${page_} -> ${r.status}`);
  return (await r.json()).response;
}

(async () => {
  // ---------- Phase 1: enumerate catalog via Constructor ----------
  console.log('=== Phase 1: enumerating products via Constructor.io ===');
  const index = new Map(); // styleId -> {id,name,groups:Set,cio}
  const categoryMembers = {}; // categoryId -> [styleId]
  const facetsByCategory = {};

  for (const cat of CATEGORIES) {
    let page_ = 1;
    let total = Infinity;
    const ids = [];
    while ((page_ - 1) * 100 < total && page_ <= 3) {
      let r;
      try {
        r = await cioBrowse(cat.id, page_);
      } catch (e) {
        console.log(`  ! ${cat.id}: ${e.message}`);
        break;
      }
      total = r.total_num_results;
      if (page_ === 1) facetsByCategory[cat.id] = r.facets;
      for (const it of r.results || []) {
        const d = it.data;
        const sid = String(d.id);
        ids.push(sid);
        if (!index.has(sid)) {
          index.set(sid, {
            id: sid,
            name: d.name,
            gender: d.gender && d.gender.value,
            description: d.description,
            cushion: d.spec_FeelUnderFootTitle,
            image: d.image_url,
            url: d.url,
            groups: new Set(d.group_ids || []),
            productType: (d.facets || []).find((f) => f.name === 'productType')?.values?.[0],
            features: (d.facets || []).find((f) => f.name === 'productFeatures')?.values || [],
          });
        } else {
          for (const g of d.group_ids || []) index.get(sid).groups.add(g);
        }
      }
      page_++;
      await sleep(250);
    }
    categoryMembers[cat.id] = [...new Set(ids)];
    console.log(`  ${cat.id}: ${categoryMembers[cat.id].length} products (of ${total})`);
  }
  console.log(`  => ${index.size} unique products`);

  // ---------- Phase 2: enrich each product via SFCC (real browser) ----------
  const checkpoint = fs.existsSync(CKPT) ? JSON.parse(fs.readFileSync(CKPT, 'utf8')) : {};
  const todo = [...index.keys()].filter((id) => !checkpoint[id]);
  console.log(`\n=== Phase 2: enriching ${todo.length} products via SFCC (${Object.keys(checkpoint).length} cached) ===`);

  if (todo.length) {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const ctx = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      viewport: { width: 1440, height: 900 },
    });
    // block heavy assets to keep the harvest light
    await ctx.route('**/*', (route) => {
      const t = route.request().resourceType();
      if (['image', 'font', 'media', 'stylesheet'].includes(t)) return route.abort();
      route.continue();
    });
    const page = await ctx.newPage();
    await page.goto('https://www.brooksrunning.com/en_us/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(5000);
    console.log('  (Akamai session warmed)');

    let done = 0;
    for (const sid of todo) {
      try {
        const data = await page.evaluate(
          async ({ sid, SFCC }) => {
            const j = async (u) => {
              const r = await fetch(u, {
                credentials: 'include',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
              });
              if (!r.ok) throw new Error(`${r.status}`);
              return r.json();
            };
            // master call -> all colors, price, specs
            const base = await j(`${SFCC}/Product-Variation?pid=${sid}&quantity=1`);
            const p = base.product;
            if (!p) return null;
            const colorAttr = (p.variationAttributes || []).find((a) => a.id === 'color');
            const colors = [];
            for (const c of (colorAttr && colorAttr.values) || []) {
              // per-color call -> that color's size availability + price
              let cp = p;
              try {
                const cr = await j(
                  `${SFCC}/Product-Variation?pid=${sid}&dwvar_${sid}_color=${encodeURIComponent(c.value)}&quantity=1`
                );
                if (cr.product) cp = cr.product;
              } catch (e) {}
              const sizeAttr = (cp.variationAttributes || []).find(
                (a) => a.id === 'size_Shoe' || a.id === 'size_Apparel' || a.id === 'size'
              );
              const widthAttr = (cp.variationAttributes || []).find((a) => a.id === 'width');
              colors.push({
                code: c.value,
                name: String(c.displayValue || '').replace(/^\d+\s*-\s*/, ''),
                images: ((c.images && c.images.pdpTiny) || []).map((im) => ({
                  url: String(im.url).split('?')[0],
                  alt: im.altSEO || im.alt,
                })),
                price: cp.price && cp.price.sales ? cp.price.sales.value : null,
                listPrice: cp.price && cp.price.list ? cp.price.list.value : null,
                sizeAttrId: sizeAttr && sizeAttr.id,
                sizes: ((sizeAttr && sizeAttr.values) || []).map((s) => ({
                  value: s.value,
                  label: s.displayValue,
                  available: !!s.selectable,
                })),
                widths: ((widthAttr && widthAttr.values) || []).map((w) => ({
                  value: w.value,
                  label: w.displayValue,
                  available: !!w.selectable,
                })),
                soldOut: !!cp.isSoldOut,
              });
              await new Promise((r) => setTimeout(r, 120));
            }
            return {
              id: p.id,
              name: p.productName,
              price: p.price && p.price.sales ? p.price.sales.value : null,
              listPrice: p.price && p.price.list ? p.price.list.value : null,
              hasSale: !!p.hasSale,
              description: p.description,
              bestFor: (p.bestForSpecs || []).map((b) => b.text),
              productFeatures: (p.productFeatures || []).map((f) => f.text || f).slice(0, 8),
              starRating: p.starRating ? Number(p.starRating) : null,
              reviewCount: p.reviewCount || 0,
              badge: p.badge && p.badge.badgeLabel ? p.badge.badgeLabel : null,
              support: p.productShoeSupportLevel,
              experience: p.productFootwearExperience,
              style: p.productStyle,
              widths: p.productWidths,
              isShoe: !!p.isShoe,
              isApparel: !!p.isApparel,
              productType: p.productType,
              sizeChartId: p.sizeChartId,
              colors,
            };
          },
          { sid, SFCC }
        );
        if (data) checkpoint[sid] = data;
        done++;
        if (done % 10 === 0) {
          fs.writeFileSync(CKPT, JSON.stringify(checkpoint));
          console.log(`  ${done}/${todo.length} (${sid} ${data ? data.name : 'null'})`);
        }
      } catch (e) {
        console.log(`  ! ${sid}: ${String(e.message).slice(0, 80)}`);
        // re-warm session on failure
        try {
          await page.goto('https://www.brooksrunning.com/en_us/', {
            waitUntil: 'domcontentloaded',
            timeout: 45000,
          });
          await page.waitForTimeout(3000);
        } catch (e2) {}
      }
      await sleep(150);
    }
    fs.writeFileSync(CKPT, JSON.stringify(checkpoint));
    await browser.close();
  }

  // ---------- Phase 3: normalize ----------
  console.log('\n=== Phase 3: building catalog.json ===');
  const products = [];
  for (const [sid, cio] of index) {
    const s = checkpoint[sid];
    if (!s || !s.colors || !s.colors.length) continue;
    const colors = s.colors.filter((c) => c.images && c.images.length);
    if (!colors.length) continue;
    products.push({
      id: sid,
      name: s.name || cio.name,
      gender: cio.gender || null,
      productType: s.isShoe ? 'Shoes' : s.isApparel ? 'Apparel' : cio.productType || 'Other',
      franchise: s.style || null,
      price: s.price ?? colors[0].price,
      listPrice: s.listPrice ?? colors[0].listPrice,
      onSale: !!s.hasSale || colors.some((c) => c.listPrice && c.price && c.listPrice > c.price),
      description: String(s.description || cio.description || '').trim(),
      bestFor: s.bestFor || [],
      features: (cio.features || []).slice(0, 6),
      cushion: cio.cushion || null,
      support: s.support || null,
      experience: s.experience || null,
      rating: s.starRating,
      reviewCount: s.reviewCount,
      badge: s.badge,
      groups: [...cio.groups],
      colors,
      url: cio.url,
    });
  }
  products.sort((a, b) => a.name.localeCompare(b.name));

  const categories = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    productIds: (categoryMembers[c.id] || []).filter((id) => products.find((p) => p.id === id)),
  }));

  const out = {
    harvestedAt: new Date().toISOString(),
    source: 'brooksrunning.com (en_US) — Constructor.io browse + SFCC Product-Variation',
    counts: {
      products: products.length,
      shoes: products.filter((p) => p.productType === 'Shoes').length,
      apparel: products.filter((p) => p.productType === 'Apparel').length,
      colorways: products.reduce((n, p) => n + p.colors.length, 0),
    },
    categories,
    facets: facetsByCategory['featured-new-arrivals'] || [],
    products,
  };
  // Minified: this ships inside the app bundle, where every byte is parse time
  // on a cold start.
  fs.writeFileSync(path.join(__dirname, 'catalog.json'), JSON.stringify(out));
  console.log(JSON.stringify(out.counts, null, 1));
  console.log('-> catalog.json');
})();

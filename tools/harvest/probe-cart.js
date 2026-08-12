const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.goto(
    'https://www.brooksrunning.com/en_us/mens/shoes/road-running-shoes/hyperion-max-4/110498.html?dwvar_110498_color=197',
    { waitUntil: 'domcontentloaded', timeout: 60000 }
  );
  await page.waitForTimeout(5000);

  const out = await page.evaluate(async () => {
    const B = '/on/demandware.store/Sites-BrooksRunning-Site/en_US';
    const log = [];

    // 1. Fully-specified variant -> get the variant pid + readyToOrder
    const vr = await fetch(
      `${B}/Product-Variation?pid=110498&dwvar_110498_color=197&dwvar_110498_size_Shoe=9.0&dwvar_110498_width=1D&quantity=1`,
      { credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } }
    );
    const vd = await vr.json();
    const prod = vd.product;
    log.push({
      step: 'Product-Variation (full selection)',
      status: vr.status,
      variantId: prod.id,
      readyToOrder: prod.readyToOrder,
      available: prod.available,
      price: prod.price && prod.price.sales && prod.price.sales.formatted,
      selectedSize: (prod.variationAttributes.find((a) => a.id === 'size_Shoe') || {}).values
        ?.filter((v) => v.selected)
        .map((v) => v.value),
    });

    // 2. Add to cart
    const body = new URLSearchParams({
      pid: prod.id,
      quantity: '1',
      options: '[]',
displayOutOfStock: 'false',
    });
    const ar = await fetch(`${B}/Cart-AddProduct`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: body.toString(),
    });
    const at = await ar.text();
    let ad = null;
    try {
      ad = JSON.parse(at);
    } catch (e) {}
    log.push({
      step: 'Cart-AddProduct',
      status: ar.status,
      ct: ar.headers.get('content-type'),
      keys: ad ? Object.keys(ad) : null,
      error: ad && ad.error,
      message: ad && ad.message,
      quantityTotal: ad && ad.quantityTotal,
      cartItems: ad && ad.cart && ad.cart.items && ad.cart.items.map((i) => ({
        id: i.id,
        name: i.productName,
        qty: i.quantity,
        price: i.price && i.price.sales && i.price.sales.formatted,
        size: i.variationAttributes && i.variationAttributes.map((v) => `${v.displayName}:${v.displayValue}`),
      })),
      totals: ad && ad.cart && ad.cart.totals,
    });

    // 3. Read cart back as JSON
    const gr = await fetch(`${B}/Cart-GetCart`, {
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    const gt = await gr.text();
    let gd = null;
    try { gd = JSON.parse(gt); } catch (e) {}
    log.push({
      step: 'Cart-GetCart',
      status: gr.status,
      ct: gr.headers.get('content-type'),
      keys: gd ? Object.keys(gd) : null,
      numItems: gd && gd.numItems,
      grandTotal: gd && gd.totals && gd.totals.grandTotal,
    });

    return log;
  });

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();

/**
 * The app's shippable identity, in one place.
 *
 * Everything a store listing keys off — display name, bundle identifier,
 * Android package, deep-link scheme — lives here and nowhere else, so
 * swapping the app's identity is a single-file edit rather than a hunt
 * through `app.json`, the native projects, and the router.
 *
 * Plain CommonJS on purpose: `app.config.ts` runs in Node and Metro bundles
 * this same file for the app, and CJS is the one module format both read
 * without a loader (`tsx`) in between.
 *
 * Why the identifiers are brand-neutral while `name` is not: the bundle
 * identifier cannot be changed once a build is uploaded to App Store Connect,
 * so it is fixed up front and deliberately says nothing about whose catalog
 * the app is showing. The display name is cheap to change per version and is
 * what the de-branding work swaps.
 */

/** @typedef {{ name: string, bundleIdentifier: string, androidPackage: string, scheme: string }} Brand */

/** @type {Brand} */
const brand = {
  name: 'Brooks',
  bundleIdentifier: 'com.exponathan.ecommercedemo',
  androidPackage: 'com.exponathan.ecommercedemo',
  scheme: 'brooks',
};

module.exports = { brand };

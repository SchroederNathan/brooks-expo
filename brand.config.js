/**
 * The app's shippable identity, in one place.
 *
 * Everything a store listing or a build keys off — display name, bundle
 * identifier, Android package, deep-link scheme, Expo slug — lives here and
 * nowhere else, so swapping the app's identity is a single-file edit rather
 * than a hunt through `app.json`, the native projects, and the router.
 *
 * Plain CommonJS on purpose: `app.config.ts` runs in Node and Metro bundles
 * this same file for the app, and CJS is the one module format both read
 * without a loader (`tsx`) in between.
 *
 * The bundle identifier cannot be changed once a build is uploaded to App
 * Store Connect, so it is fixed up front and deliberately says nothing about
 * whose catalog the app shows.
 *
 * `slug` must match the EAS project it is linked to (`extra.eas.projectId` in
 * app.json resolves to `@exponathan/<slug>`). Changing it here without
 * renaming that project in the Expo dashboard makes `eas build` fail.
 */

/** @typedef {{ name: string, bundleIdentifier: string, androidPackage: string, scheme: string, slug: string }} Brand */

/** @type {Brand} */
const brand = {
  name: 'Ecommerce Demo',
  bundleIdentifier: 'com.exponathan.ecommercedemo',
  androidPackage: 'com.exponathan.ecommercedemo',
  scheme: 'ecomdemo',
  slug: 'ecommerce-demo',
};

module.exports = { brand };

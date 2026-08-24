import type { ConfigContext, ExpoConfig } from 'expo/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { brand } = require('./brand.config.js');

/**
 * Dynamic app config.
 *
 * `app.json` still holds everything that is not identity. Expo reads it first
 * and passes it in as `config`, so this file only has to overlay the four
 * fields that decide which app this is. Keeping the split means a brand swap
 * touches `brand.config.js` alone and never produces a conflicting second
 * copy of the bundle identifier.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: brand.name,
  slug: config.slug ?? 'brooks-expo',
  scheme: brand.scheme,
  ios: {
    ...config.ios,
    bundleIdentifier: brand.bundleIdentifier,
  },
  android: {
    ...config.android,
    package: brand.androidPackage,
  },
});

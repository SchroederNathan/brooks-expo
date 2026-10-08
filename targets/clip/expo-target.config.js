// eslint-disable-next-line @typescript-eslint/no-var-requires
const { brand, appGroup } = require('../../brand.config.js');

/**
 * The App Clip: the same JS bundle as the app, opened from a link on
 * `brand.domain` before the app is installed. Its bundle identifier is the
 * plugin's default, `<app>.clip`.
 *
 * @ref LLP 0007#what-the-clip-is
 *
 * @type {import('@bacons/apple-targets/app.plugin').ConfigFunction}
 */
module.exports = () => ({
  type: 'clip',
  // Without it the home screen and App Library label the Clip "clip".
  displayName: brand.name,
  icon: '../../assets/icon.png',
  // App Clips that support only iOS 17 and later may be up to 100 MB, as long
  // as they are opened from digital links only. A React Native Clip does not
  // fit the 15 MB limit that QR codes and NFC tags need.
  // @ref LLP 0007#size-decides-the-invocations
  deploymentTarget: '17.6',
  entitlements: {
    'com.apple.developer.associated-domains': [`appclips:${brand.domain}`],
    // The plugin copies App Groups only from `ios.entitlements`, and
    // `expo-widgets` adds the app's group in its own plugin, so the Clip names
    // it here. @ref LLP 0007#the-bag-lives-in-the-app-group
    'com.apple.security.application-groups': [appGroup],
  },
});

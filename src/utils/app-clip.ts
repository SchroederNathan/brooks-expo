/**
 * The App Clip, as the JS sees it.
 *
 * @ref LLP 0007#one-bundle-two-binaries — The Clip runs this same bundle. This
 * file is the one place a screen asks which binary it is in, so the Clip's
 * differences stay listed together.
 */
import BrooksAppClip from '../../modules/brooks-app-clip/src/BrooksAppClipModule';

/** True only inside the App Clip. Fixed for the life of the process. */
export const isAppClip = BrooksAppClip?.isAppClip ?? false;

/**
 * Where "Bag" goes. The app's bag is a tab; the Clip has no tabs, so it
 * pushes its own `/bag` screen. @ref LLP 0007#routes
 */
export const bagHref = isAppClip ? '/bag' : '/cart';

/** Where an empty bag sends the shopper: Browse, or the Clip's New Arrivals. */
export const shopHref = isAppClip ? '/new-arrivals' : '/(tabs)/(shop)/shop';

/**
 * Offers the full app with the App Store's own overlay. Does nothing outside
 * the Clip. @ref LLP 0007#the-full-app-offer
 */
export function promptFullApp(): void {
  BrooksAppClip?.promptFullAppAsync().catch(() => {});
}

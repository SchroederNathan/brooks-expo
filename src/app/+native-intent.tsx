/**
 * Rewrites an incoming link before the router matches it.
 *
 * @ref LLP 0007#routes — App Store Connect's default App Clip link,
 * `https://appclip.apple.com/id?p=<clip bundle id>`, reaches the Clip with
 * Apple's host and an `/id` path. It names no screen, so it opens the Clip's
 * first screen. Links on our own domain pass through unchanged.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (new URL(path).hostname === 'appclip.apple.com') return '/';
  } catch {
    // Not an absolute URL: a path the router can match as it is.
  }
  return path;
}

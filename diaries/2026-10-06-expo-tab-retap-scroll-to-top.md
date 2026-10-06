# Tab re-tap scrolls to the top

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5 (Claude Code)
**System:** Expo
**Scope:** A tap on the focused tab, when its screen is scrolled down, scrolls
back to the top. Both tab bars.

## Outcome

- Every tab scroll root calls `useScrollToTop` from `expo-router`:
  `ScreenScrollView` (Cart, Profile, Finder results), `useHeaderScroll`
  (Home, Browse), Browse's search results, and the Finder's quiz and activity
  pages (one ref, because only one page is mounted at a time).
- `GlassTabs` sets `disableScrollToTop` on every trigger, so one mechanism owns
  the scroll under both bars. Pop-to-top under the glass bar stays native.
- LLP 0003: the JS-bar section and the glass-bar list now describe the re-tap
  scroll. The old "scroll-to-top is the system's" line is marked superseded.
- Evidence: `bun run typecheck` clean. On an iPhone 17 Pro (iOS 26.5), Home
  and Browse were scrolled two screens down, then their tab was tapped again.
  Both came back to the top under the JS bar and under the glass bar. Home's
  blue header and Browse's search row came back with them. Profile and the
  Finder were not scrolled in the test: the guest pitch and the first quiz page
  fit on one screen. Cart was not opened.

## What worked well

- `useScrollToTop` needs only a `tabPress` event on a parent `tab` navigator.
  The custom `BrooksTabBar` already emits one, and `NativeTabs` emits one on a
  repeated selection too, so one hook covers both bars.
- It reads `ref.current`, which Reanimated's `useAnimatedRef` sets, so the
  header's existing animated ref worked with no wrapper.

## Friction and blockers

- The worktree had no `node_modules`; `bun install` was needed before the
  library source could be read.
- My first pushed-screen test assumed the category list opens inside the tab.
  It opens on the root stack, over the tab bar, so the third tap opened a
  product instead.

## What was hard

- Reading why the system's scroll-to-top missed Browse: react-native-screens
  follows only `subviews[0]` from the tab's top view controller
  (`RNSScrollViewFinder`). A screen whose first child is not the scroll view is
  skipped without any warning.

## Comparative friction

Not observed.

## Improvement ideas

- Document in the `NativeTabs` reference that the repeated-selection scroll
  follows only the first-subview chain, and that `tabPress` still fires on a
  repeated selection, so `useScrollToTop` is a working fallback.

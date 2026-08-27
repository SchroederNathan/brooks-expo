# Search empty state replaces the trending chip rail

**Date:** 2026-08-27
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Remove Browse's horizontally scrolling chip rail; centre an empty
state between the search field and the keyboard.

## Outcome

`screens/shop/search-results` no longer draws a `ChipRail`. With fewer than two
characters typed it returns a single centred empty state (eyebrow, squiggle,
`VOICE.emptySearch`, `VOICE.emptySearchHint`) instead of six trending chips. The
same rail carried the Constructor index's live **term** suggestions, so those
went with it. Product hits are untouched. `onTerm` had no caller left and was
dropped from the component's props and from Browse's call site.

Two follow-on changes fell out of the removal:

- "No matches" keyed on `live.terms.length === 0 && live.products.length === 0`.
  With terms no longer drawn, a query that matched a term but no shoe would have
  shown an empty screen with no explanation. Products alone decide it now.
- The empty state keeps a `ScrollView` with `flexGrow: 1` and nothing to scroll,
  purely so `keyboardDismissMode="on-drag"` still works. A bare `View` would
  have made the keyboard undismissable by drag, which it was not before.

Verified on the iPhone 17 Pro Max simulator (iOS 27.0) at `scale: 1`: free
region 142 to 608.3pt, copy centred at 375.5pt against a true centre of
375.15pt. Typing `ghost` still returns five joined hits with the summary row now
directly under the field.

## What worked well

- `useReanimatedKeyboardAnimation` from react-native-keyboard-controller is the
  right primitive for this. One animated `paddingBottom` on the UI thread gives
  both the centring and the follow-the-keyboard motion, with no layout listener
  and no second source of truth for the keyboard's height.
- Measuring a full-resolution screenshot with PIL rather than eyeballing it. The
  first attempt *looked* centred in a downscaled capture; it was 41pt high.
- `tab-bar.tsx` already documented that the JS bar shortens the screen rather
  than covering it, and already published its measured height through
  `BottomTabBarHeightCallbackContext` precisely so `useBottomTabBarHeight()`
  would be right. The fix was one hook call because a previous session had
  written that down.

## Friction and blockers

The app was attached to a Metro on **8084**, not the 8082 recorded in project
memory. A second `expo start` from the same project root had bound 8084 after
8081 was taken. `debugger-reload-metro` against 8082 failed with "no CDP
targets", which reads like the app is dead rather than like it is talking to a
different server. `curl localhost:<port>/json/list` across every listening node
port found it in one step. That is the cheaper first move than trusting a
remembered port.

## What was hard

The coordinate space mismatch, and that it is invisible without measurement.
Keyboard Controller reports the keyboard frame relative to the **window**. The
view being padded ends at the **tab bar's top edge**. Both numbers are correct,
and subtracting one from the other is the app's job. Nothing in the API surface
suggests the question needs asking. The error is a silent 41 to 84pt offset that
looks plausible in a screenshot: the copy is still in the upper-middle of a
blank area, just not centred in it.

Anything that centres content against the keyboard inside a tab navigator has
this bug. The symptom, slightly-too-high content, is exactly what a designer
would report as "feels a bit off" rather than as a layout error.

## Comparative friction

Not observed. This task touched Expo only.

## Improvement ideas

- react-native-keyboard-controller could expose the keyboard's overlap with the
  *nearest view* rather than only the window-relative frame. A
  `useKeyboardOverlap(ref)` hook, or a documented recipe for subtracting a tab
  bar or bottom inset, would cover it. `KeyboardAvoidingView` solves the padding
  case; the "centre something in the remaining gap" case has no equivalent, and
  the naive version is wrong by exactly the tab bar's height.
- `useBottomTabBarHeight()` throwing when it is outside a tab navigator makes it
  awkward to use in a component that might be reused off a tab. A companion that
  returns `0`, or the raw context read, would let bodies like this one stay
  portable without a try/catch or a duplicate context import.
- A Metro-side hint would have saved a detour. When `debugger-reload-metro`
  finds no CDP targets on the given port, listing the other local Metro servers
  that *do* have one attached would turn a dead end into an answer. The
  information is one `/json/list` per port away.

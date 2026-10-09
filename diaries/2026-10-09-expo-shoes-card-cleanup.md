# Shoes tab card cleanup and the 70% line at the limit

**Date:** 2026-10-09
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** Shoes tab: remove the Finder card, retire with an X, hide the 70% mark at 100% on the bar and the widget; LLP 0006

## Outcome

Three design fixes the user asked for on the Shoes tab and the mileage
widget:

- The navy "Shoe Finder" card under the pairs is gone. "Find its
  replacement" on a worn pair already opens the Finder.
- "Retire this pair", a gray text link under the card's actions, is now an
  X in the card's top right corner. It keeps the confirm alert.
- At 100%, the bar on the card and the widget's ruler no longer draw the
  70% mark. A full bar with a line three-quarters along read as "not done
  yet".

`bun run typecheck` passes.

Checked on a new iPhone 17 Pro simulator (iOS 26.5, Debug build, Metro on
port 8095), with two pairs added through the store in `debugger-evaluate`:
a Ghost 17 at 300 of 300 mi and a pair typed in by hand at 180 of 400 mi.

- The Shoes tab: the 100% bar is all lime with no tick. The 45% bar keeps its
  tick at 70%. Each card has an X at the top right, level with the photo's
  top edge and the badge's right edge. The list ends at "Add a pair".
- The X opened "Retire your Glycerin 21?"; Cancel kept the pair.
- The small and medium widgets in the gallery, and the medium widget on the
  home screen, showed all 16 ticks in ink at one length for the 100% pair.
  After the Ghost 17 was retired, the home screen widget showed the
  180-mile pair with the long 70% tick.

## What worked well

- The `BrooksIcon` set already had the site's `close` glyph, which Login
  uses, so the X matches the rest of the app.
- `__r.getModules()` in `debugger-evaluate` found `src/store/shoes.ts` by
  its `verboseName`. Calling `addShoe` and `retireShoe` there set up both
  states in seconds, without the add sheet.
- The widget repaints from the App Group snapshot, so retiring a pair from
  the debugger changed the home screen widget with no app in front.

## Friction and blockers

- The worktree had no `node_modules` and no simulator had a build of the
  app. A full `expo run:ios` on a new simulator was needed for visual QA.
- The dev client opened on its launcher, searching for the LAN address.
  Opening `exp+ecommerce-demo://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8095`
  listed the server, and a tap loaded it.

## What was hard

- Choosing when the mark goes. The user named 100%. Between 70% and 100%
  the mark still says where "time to replace" began, so it stays there.

## Comparative friction

Not observed.

## Improvement ideas

Not observed.

## Follow-ups

- With no worn pair, the Shoes tab has no way to the Finder. Browse and
  Profile still have one. Check with the user whether the empty-state link
  is enough.

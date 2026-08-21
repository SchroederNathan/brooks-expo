import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { BrooksIcon, type BrooksIconName } from '@/components/icons';
import { Txt } from '@/components/themed-text';
import { colors, radius } from '@/theme';

/**
 * Icons for the app-owned bottom tab bar.
 *
 * @ref LLP 0003#icons-and-the-logo — Three of the five tabs are real sprite
 * glyphs lifted verbatim from brooksrunning.com: `#icon-search` (Shoe Finder),
 * `#icon-cart` (Cart), `#icon-account` (Profile). The sprite has no home and no
 * storefront glyph — a website needs neither — so Home and Browse are drawn
 * here to sit at the real set's line weight.
 *
 * Shoe Finder wears the magnifier, not `#icon-filters`. The funnel was the first
 * choice — it is the site's own glyph and "narrow this down" is exactly what the
 * quiz does — but its top bar is a full-width horizontal rule 21px wide, which
 * merges with the tab bar's 18px focus rule directly above it into a four-bar
 * stack. The indicator stops indicating. Any glyph whose top edge is a long
 * horizontal is disqualified by a bar with a top rule; the magnifier's ring is
 * not. Search itself is a pushed screen, so the tab bar is the only place this
 * glyph appears as a destination.
 *
 * Weight normalization: the sprite encodes non-uniform line weights (the cart's
 * line-work is ~1.3 viewBox units, the account's ~1.4, the funnel's 1.75), so
 * equal render sizes read as unequal strokes. A fill cannot be thinned, only
 * fattened, so each glyph is thickened up to a shared ~2.2px and the two drawn
 * glyphs stroke at 2.2 directly.
 */

const STROKE = 2.2;

export type TabIconName = 'home' | 'browse' | 'finder' | 'cart' | 'account';

/**
 * Sprite-backed tabs. `size` is per glyph, not shared: `BrooksIcon` scales to
 * fit a `size` box on the glyph's *longer* axis, so a single value would render
 * the wide-and-short funnel wider than the tall-and-narrow account figure. These
 * values equalize drawn width instead — except the account figure, which is
 * taller than wide, so it is matched on height the way a person glyph should be.
 * `thicken` then brings each glyph's encoded weight up to the shared ~2.2px; the
 * funnel reaches it unaided (1.75 viewBox units × 21/16.89 ≈ 2.18).
 */
const sprite: Partial<Record<TabIconName, { name: BrooksIconName; size: number; thicken: number }>> =
  {
    finder: { name: 'search', size: 21, thicken: 0 },
    cart: { name: 'cart', size: 20, thicken: 0.9 },
    account: { name: 'account', size: 20, thicken: 0.65 },
  };

export function TabIcon({
  name,
  color,
  badge,
}: {
  name: TabIconName;
  color: string;
  badge?: number;
}) {
  const real = sprite[name];

  return (
    <View style={styles.slot}>
      {real ? (
        <BrooksIcon name={real.name} size={real.size} color={color} thicken={real.thicken} />
      ) : (
        <Drawn name={name} color={color} />
      )}
      {badge ? (
        <View style={styles.badge}>
          {/* Lime fill with blue text — the site's exact cart-badge treatment,
              which the system tab bar could not render (its badge text is
              fixed white on iOS). An app-owned bar gets it back. */}
          <Txt variant="caption" c={colors.blue} style={styles.badgeText}>
            {badge > 9 ? '9+' : badge}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

/** Home and Browse: no sprite equivalent, drawn at the real set's weight. */
function Drawn({ name, color }: { name: TabIconName; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {name === 'home' && (
        <Path
          d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {name === 'browse' && (
        /* The 2×2 grid the site uses for its catalog "tile view" control. Sized
           from the outside in: the 21.6 outer span is centered in the 24-box,
           the inter-square gap matches the stroke weight so the negative space
           reads as even, and what is left (7.5) is the square. Smaller squares
           close their holes at this stroke and read as four blobs. */
        <>
          {[
            [2.3, 2.3],
            [14.2, 2.3],
            [2.3, 14.2],
            [14.2, 14.2],
          ].map(([x, y]) => (
            <Rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={7.5}
              height={7.5}
              rx={1.6}
              stroke={color}
              strokeWidth={STROKE}
            />
          ))}
        </>
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  slot: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: { fontSize: 10, lineHeight: 13 },
});

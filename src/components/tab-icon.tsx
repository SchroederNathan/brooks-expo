import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { BrooksIcon } from '@/components/icons';
import { Txt } from '@/components/themed-text';
import { colors, radius } from '@/theme';

/**
 * The finder, bag, and account tabs use the site's real header glyphs
 * (#icon-search, #icon-cart, #icon-account — see icons.tsx). Home and shop
 * have no equivalent on brooksrunning.com (a website needs neither), so those
 * two stay hand-drawn to match the real set's line weight.
 *
 * The three real glyphs encode different native line weights (search ≈2.2px at
 * this size, cart ≈1.4, account ≈1.6), so cart and account are thickened up to
 * search's weight and the drawn pair strokes at the same ~2.2. Active state is
 * color-only, matching the real icons, which cannot change weight.
 */
function Icon({ name, active }: { name: string; active: boolean }) {
  const c = active ? colors.ink : colors.inkFaint;
  const w = 2.2;
  if (name === 'finder' || name === 'bag' || name === 'account') {
    const real = { finder: 'search', bag: 'cart', account: 'account' } as const;
    const thicken = { finder: 0, bag: 0.85, account: 0.6 } as const;
    return (
      <View style={styles.slot}>
        <BrooksIcon name={real[name]} size={21} color={c} thicken={thicken[name]} />
      </View>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {name === 'home' && (
        <Path
          d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5"
          stroke={c}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {name === 'shop' && (
        <>
          <Path
            d="M4 7h16l-1.2 13H5.2L4 7Z"
            stroke={c}
            strokeWidth={w}
            strokeLinejoin="round"
          />
          <Path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3" stroke={c} strokeWidth={w} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export function TabIcon({ name, focused, badge }: { name: string; focused: boolean; badge?: number }) {
  return (
    <View>
      <Icon name={name} active={focused} />
      {badge ? (
        <View style={styles.badge}>
          {/* Lime fill with blue text — the site's exact cart-badge treatment. */}
          <Txt variant="caption" c={colors.blue} style={styles.badgeText}>
            {badge > 9 ? '9+' : badge}
          </Txt>
        </View>
      ) : null}
    </View>
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

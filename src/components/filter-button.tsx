import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BrooksIcon } from './icons';
import { Press } from './press';
import { Txt } from './themed-text';
import { colors, spacing } from '../theme';

/**
 * The site's `Filter & sort` control, as a square outlined button carrying the
 * `#icon-filters` sprite glyph (three shortening bars) and, once something is
 * applied, the count.
 *
 * @ref LLP 0003#plp — brooksrunning.com's PLP opens its filter panel from one
 * button whose label is `Filter & sort`; the glyph is the one the site ships in
 * its own sprite. Two sizes: `icon` is the 48pt square that sits beside the
 * search field, `label` carries the words for a control row with room. Idle it
 * wears the chips' hairline rule; applied filters turn the rule ink and add the
 * count.
 */
export function FilterButton({
  count = 0,
  onPress,
  variant = 'icon',
  style,
}: {
  /** Applied filters. Zero draws no badge. */
  count?: number;
  onPress?: () => void;
  variant?: 'icon' | 'label';
  style?: StyleProp<ViewStyle>;
}) {
  const active = count > 0;
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={active ? `Filter & sort, ${count} applied` : 'Filter & sort'}
      onPress={onPress}
      scaleTo={0.95}
      style={[
        styles.button,
        active && styles.active,
        variant === 'label' && styles.labelButton,
        style,
      ]}
    >
      <BrooksIcon name="filters" size={17} color={colors.ink} />
      {variant === 'label' ? (
        <Txt variant="button">{active ? `Filter & sort (${count})` : 'Filter & sort'}</Txt>
      ) : active ? (
        <View style={styles.badge}>
          <Txt variant="tiny" c={colors.surface}>
            {count}
          </Txt>
        </View>
      ) : null}
    </Press>
  );
}

export const FILTER_BUTTON_SIZE = 48;

const styles = StyleSheet.create({
  button: {
    width: FILTER_BUTTON_SIZE,
    height: FILTER_BUTTON_SIZE,
    // Idle it matches the chips' hairline; the ink outline is the applied state.
    borderWidth: 1.5,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  active: { borderColor: colors.ink },
  labelButton: {
    width: undefined,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: -1.5,
    right: -1.5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

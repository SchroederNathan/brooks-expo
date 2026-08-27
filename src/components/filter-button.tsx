import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BrooksIcon } from './icons';
import { OUTLINE_BUTTON_SIZE, OutlineIconButton } from './outline-icon-button';
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
 *
 * The `icon` variant is `OutlineIconButton` — the shape it shares with the
 * dismiss button on the field's other side. `label` keeps its own `Press`
 * because it is a text button, not a square.
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
  const label = active ? `Filter & sort, ${count} applied` : 'Filter & sort';

  if (variant === 'label') {
    return (
      <Press
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        scaleTo={0.95}
        style={[styles.labelButton, active && styles.active, style]}
      >
        <BrooksIcon name="filters" size={17} color={colors.ink} />
        <Txt variant="button">{active ? `Filter & sort (${count})` : 'Filter & sort'}</Txt>
      </Press>
    );
  }

  return (
    <OutlineIconButton
      icon="filters"
      active={active}
      accessibilityLabel={label}
      onPress={onPress}
      style={style}
    >
      {active ? (
        <View style={styles.badge}>
          <Txt variant="tiny" c={colors.surface}>
            {count}
          </Txt>
        </View>
      ) : null}
    </OutlineIconButton>
  );
}

export const FILTER_BUTTON_SIZE = OUTLINE_BUTTON_SIZE;

const styles = StyleSheet.create({
  labelButton: {
    height: OUTLINE_BUTTON_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  active: { borderColor: colors.ink },
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

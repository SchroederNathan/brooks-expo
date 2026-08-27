import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { BrooksIcon, type BrooksIconName } from './icons';
import { Press } from './press';
import { colors } from '../theme';

/**
 * The 48pt outlined square that flanks Browse's search field: one sprite glyph
 * centred on white, inside the chips' hairline rule.
 *
 * @ref LLP 0003#browse-is-the-search-screen — Two controls wear this shape, one
 * on each side of the field (`Filter & sort` right, dismiss left), so the rule
 * weight, the square metric and the ink-outline "active" state live here rather
 * than being restated per button. `children` is for anything drawn *over* the
 * glyph — the filter count badge is the only one today.
 */
export const OUTLINE_BUTTON_SIZE = 48;

export function OutlineIconButton({
  icon,
  iconSize = 17,
  active = false,
  accessibilityLabel,
  onPress,
  children,
  style,
}: {
  icon: BrooksIconName;
  iconSize?: number;
  /** Trades the hairline for the ink rule. */
  active?: boolean;
  accessibilityLabel: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      scaleTo={0.95}
      style={[styles.button, active && styles.active, style]}
    >
      <BrooksIcon name={icon} size={iconSize} color={colors.ink} />
      {children}
    </Press>
  );
}

const styles = StyleSheet.create({
  button: {
    width: OUTLINE_BUTTON_SIZE,
    height: OUTLINE_BUTTON_SIZE,
    // Idle it matches the chips' hairline; the ink outline is the applied state.
    borderWidth: 1.5,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  active: { borderColor: colors.ink },
});

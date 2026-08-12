import { StyleSheet, ViewProps } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { select } from '../utils/haptics';
import { Press } from './press';
import { Txt } from './themed-text';

/** Square selectable chip: sizes, filters, sort options. */
export function Chip({
  label,
  selected,
  disabled,
  onPress,
  style,
  size = 'md',
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewProps['style'];
  size?: 'sm' | 'md';
}) {
  return (
    <Press
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      onPress={
        disabled
          ? undefined
          : () => {
              select();
              onPress?.();
            }
      }
      haptic={false}
      disabled={disabled}
      scaleTo={0.94}
      style={[
        styles.chip,
        size === 'sm' && { height: 34, paddingHorizontal: spacing.md, minWidth: 0 },
        selected && { backgroundColor: colors.ink, borderColor: colors.ink },
        disabled && { borderColor: colors.hairline, backgroundColor: colors.surface },
        style,
      ]}
    >
      <Txt
        variant="caption"
        c={disabled ? colors.inkFaint : selected ? colors.surface : colors.ink}
        style={disabled ? styles.struck : undefined}
      >
        {label}
      </Txt>
    </Press>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 58,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.none,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  struck: { textDecorationLine: 'line-through' },
});

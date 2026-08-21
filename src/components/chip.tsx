import { StyleSheet, ViewProps } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { colors, radius, spacing } from '../theme';
import { select } from '../utils/haptics';
import { Press } from './press';
import { Txt } from './themed-text';

/**
 * Square selectable chip: sizes, filters, sort options.
 *
 * @ref LLP 0003#pdp-purchase-controls — Product options stay white when
 * selected and gain an ink outline; unavailable choices use the storefront's
 * corner-to-corner slash instead of striking through only the label.
 */
export function Chip({
  label,
  selected,
  disabled,
  onPress,
  style,
  size = 'md',
  appearance = 'filled',
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewProps['style'];
  size?: 'sm' | 'md';
  appearance?: 'filled' | 'productOption';
}) {
  const isProductOption = appearance === 'productOption';
  let textColor: string = colors.ink;

  if (isProductOption) {
    textColor = disabled ? colors.controlBorder : colors.inkMuted;
  } else if (disabled) {
    textColor = colors.inkFaint;
  } else if (selected) {
    textColor = colors.surface;
  }

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
        isProductOption && styles.productOption,
        selected && (isProductOption ? styles.productOptionSelected : styles.filledSelected),
        disabled && (isProductOption ? styles.productOptionDisabled : styles.filledDisabled),
        style,
      ]}
    >
      <Txt
        variant={isProductOption ? 'option' : 'caption'}
        c={textColor}
        style={[styles.label, disabled && !isProductOption ? styles.struck : undefined]}
      >
        {label}
      </Txt>
      {disabled && isProductOption ? (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <Line
            x1="0"
            y1="100"
            x2="100"
            y2="0"
            stroke={colors.controlBorder}
            strokeWidth="1.5"
          />
        </Svg>
      ) : null}
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
  filledSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  filledDisabled: { borderColor: colors.hairline, backgroundColor: colors.surface },
  productOption: {
    minWidth: 0,
    height: 48,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  productOptionSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
    borderWidth: 2,
  },
  productOptionDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
  },
  label: { textAlign: 'center' },
  struck: { textDecorationLine: 'line-through' },
});

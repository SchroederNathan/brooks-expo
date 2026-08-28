import { StyleSheet, ViewProps } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { border, colors, radius, spacing } from '../theme';
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
      onPress={disabled ? undefined : onPress}
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
          {/* `strokeWidth` is not a `border` token: it is viewBox units in a
              100x100 box stretched over the chip, so it renders sub-point. */}
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
    borderWidth: border.rule,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  /**
   * The filled variant keeps the resting width: its selection is the ink fill,
   * so widening the rule would move the label without showing anything. The
   * border only follows the fill so no pale edge survives around it.
   */
  filledSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  filledDisabled: { borderColor: colors.controlBorder, backgroundColor: colors.surface },
  productOption: {
    minWidth: 0,
    height: 48,
    paddingHorizontal: spacing.xs,
    borderWidth: border.rule,
    borderColor: colors.controlBorder,
  },
  productOptionSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
    borderWidth: border.emphasis,
  },
  productOptionDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
  },
  label: { textAlign: 'center' },
  struck: { textDecorationLine: 'line-through' },
});

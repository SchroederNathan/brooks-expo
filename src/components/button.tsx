import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { tap } from '../utils/haptics';
import { Txt } from './themed-text';

/**
 * Brooks buttons: 50pt tall and square. Primary actions use the brand's
 * uppercase label and hard offset shadow; the PDP purchase variant follows
 * the storefront's blue, sentence-case, split-label treatment without a
 * shadow.
 *
 * @ref LLP 0003#brand — Square corners and the hard offset press shadow are not
 * stylistic preferences; they are what Brooks's own buttons do. Rounding these
 * would make the app read as a generic commerce template. The shadow is an
 * absolutely positioned view, not a shadow prop, so it renders identically on
 * every platform.
 *
 * @ref LLP 0003#pdp-purchase-controls — The purchase CTA is the deliberate
 * exception: blue fill, sentence-case action at left, price at right. Its
 * disabled state keeps white copy on the site's `#707070` secondary gray.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  accessory,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'onDark' | 'purchase';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewProps['style'];
  /** Right-aligned text inside the button, e.g. a price. */
  accessory?: string;
}) {
  const isPurchase = variant === 'purchase';
  const bg =
    disabled ? (isPurchase ? colors.inkMuted : colors.surfaceSunken)
    : isPurchase ? colors.blue
    : variant === 'primary' ? colors.ink
    : variant === 'onDark' ? colors.surface
    : colors.surface;
  const fg =
    disabled ? (isPurchase ? colors.surface : colors.inkFaint)
    : variant === 'primary' || isPurchase ? colors.surface
    : colors.ink;

  const inert = disabled || loading;

  return (
    <View style={[styles.buttonWrap, style]}>
      {!inert && !isPurchase ? <View style={styles.buttonShadow} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!inert, busy: !!loading }}
        disabled={inert}
        onPress={() => {
          if (inert) return;
          tap(Haptics.ImpactFeedbackStyle.Medium);
          onPress?.();
        }}
        style={[
          styles.button,
          { backgroundColor: bg },
          variant === 'secondary' && { borderWidth: 3, borderColor: colors.ink },
          isPurchase && styles.purchaseButton,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            <Txt variant={isPurchase ? 'body' : 'button'} c={fg}>
              {title}
            </Txt>
            {accessory ? (
              <Txt
                variant={isPurchase ? 'price' : 'button'}
                c={fg}
                style={isPurchase ? undefined : styles.accessory}
              >
                {isPurchase ? accessory : `  ·  ${accessory}`}
              </Txt>
            ) : null}
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrap: { position: 'relative' },
  buttonShadow: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.ink,
  },
  button: {
    height: 50,
    borderRadius: radius.none,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  purchaseButton: { justifyContent: 'space-between' },
  accessory: { opacity: 0.85 },
});

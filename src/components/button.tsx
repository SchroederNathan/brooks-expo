import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewProps } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../theme';
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
 *
 * @ref LLP 0003#screen-patterns — Pressing a shadowed button pushes its face
 * down onto the shadow, so the two flatten into one block: the site's own
 * hover/active treatment, which on touch is press-in. It runs as a native CSS
 * transition over `motion.press` so it never touches the JS thread per frame,
 * and it is off under reduced motion (the face simply sits flat while pressed).
 */

/** The hard shadow's offset, and how far the face travels to meet it. */
const SHADOW_OFFSET = 4;
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
  const shadowed = !inert && !isPurchase;
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);

  const face = {
    transform: [
      { translateX: shadowed && pressed ? SHADOW_OFFSET : 0 },
      { translateY: shadowed && pressed ? SHADOW_OFFSET : 0 },
    ],
    transitionProperty: ['transform'] as const,
    transitionDuration: reduced ? 0 : motion.press,
    transitionTimingFunction: 'ease-out' as const,
  };

  return (
    <View style={[styles.buttonWrap, style]}>
      {shadowed ? <View style={styles.buttonShadow} /> : null}
      <Animated.View style={face}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!inert, busy: !!loading }}
        disabled={inert}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={() => {
          if (inert) return;
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrap: { position: 'relative' },
  buttonShadow: {
    position: 'absolute',
    left: SHADOW_OFFSET,
    top: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
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

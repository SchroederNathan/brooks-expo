import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { tap } from '../utils/haptics';
import { Txt } from './themed-text';

/**
 * Brooks buttons: 50pt tall, square, uppercase label. The hard offset shadow
 * is the site's signature rest state; press-shift motion is currently off
 * pending the motion overhaul.
 *
 * @ref LLP 0003#brand — Square corners and the hard offset press shadow are not
 * stylistic preferences; they are what Brooks's own buttons do. Rounding these
 * would make the app read as a generic commerce template. The shadow is an
 * absolutely positioned view, not a shadow prop, so it renders identically on
 * every platform.
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
  variant?: 'primary' | 'secondary' | 'onDark';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewProps['style'];
  /** Right-aligned text inside the button, e.g. a price. */
  accessory?: string;
}) {
  const bg =
    disabled ? colors.surfaceSunken
    : variant === 'primary' ? colors.ink
    : variant === 'onDark' ? colors.surface
    : colors.surface;
  const fg =
    disabled ? colors.inkFaint
    : variant === 'primary' ? colors.surface
    : colors.ink;

  const inert = disabled || loading;

  return (
    <View style={[styles.buttonWrap, style]}>
      {!inert && <View style={styles.buttonShadow} />}
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
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            <Txt variant="button" c={fg}>
              {title}
            </Txt>
            {accessory ? (
              <Txt variant="button" c={fg} style={{ opacity: 0.85 }}>
                {`  ·  ${accessory}`}
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
});

/**
 * The shared vocabulary every screen is built from.
 *
 * @ref LLP 0003#brand — Square corners and the hard offset press shadow are not
 * stylistic preferences; they are what Brooks's own buttons do. Rounding these
 * would make the app read as a generic commerce template.
 */
import * as Haptics from 'expo-haptics';
import { Image, type ImageStyle } from 'expo-image';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { brooksImage } from '../data/images';
import { color, font, motion, radius, space, type } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Haptics throw on web in some browsers; make them a no-op there. */
export function tap(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(style).catch(() => {});
}

export function select() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

export function notify(t: Haptics.NotificationFeedbackType) {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(t).catch(() => {});
}

/* ------------------------------------------------------------------ type --- */

export function Txt({
  variant = 'body',
  c = color.ink,
  style,
  ...rest
}: TextProps & { variant?: keyof typeof type; c?: string }) {
  return <Text {...rest} style={[type[variant], { color: c }, style]} />;
}

/* --------------------------------------------------------------- pressable - */

export function Press({
  children,
  style,
  scaleTo = 0.97,
  haptic = true,
  onPressIn,
  onPress,
  ...rest
}: PressableProps & { scaleTo?: number; haptic?: boolean; children: React.ReactNode }) {
  const s = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      style={[animated, style as ViewStyle]}
      onPressIn={(e) => {
        s.value = withSpring(scaleTo, { damping: 20, stiffness: 400 });
        onPressIn?.(e);
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 18, stiffness: 300 });
      }}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

/* ----------------------------------------------------------------- button -- */

/**
 * Brooks buttons: 50pt tall, square, uppercase label. On press the fill shifts
 * up-left and a hard shadow appears behind it, so the button reads as a physical
 * sticker being pushed. That is the site's signature interaction.
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
  const shift = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: -shift.value }, { translateY: -shift.value }],
  }));

  const bg =
    disabled ? color.surfaceSunken
    : variant === 'primary' ? color.ink
    : variant === 'onDark' ? color.surface
    : color.surface;
  const fg =
    disabled ? color.inkFaint
    : variant === 'primary' ? color.surface
    : color.ink;

  const inert = disabled || loading;

  return (
    <View style={[styles.buttonWrap, style]}>
      {!inert && <View style={styles.buttonShadow} />}
      <AnimatedPressable
        disabled={inert}
        onPressIn={() => {
          shift.value = withTiming(4, { duration: 80 });
        }}
        onPressOut={() => {
          shift.value = withTiming(0, { duration: 120 });
        }}
        onPress={() => {
          if (inert) return;
          tap(Haptics.ImpactFeedbackStyle.Medium);
          onPress?.();
        }}
        style={[
          styles.button,
          { backgroundColor: bg },
          variant === 'secondary' && { borderWidth: 3, borderColor: color.ink },
          animated,
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
      </AnimatedPressable>
    </View>
  );
}

/* ------------------------------------------------------------------- chip -- */

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
        size === 'sm' && { height: 34, paddingHorizontal: space.md, minWidth: 0 },
        selected && { backgroundColor: color.ink, borderColor: color.ink },
        disabled && { borderColor: color.hairline, backgroundColor: color.surface },
        style,
      ]}
    >
      <Txt
        variant="caption"
        c={disabled ? color.inkFaint : selected ? color.surface : color.ink}
        style={disabled ? styles.struck : undefined}
      >
        {label}
      </Txt>
    </Press>
  );
}

/* ------------------------------------------------------------------ price -- */

export function fmt(v: number | null | undefined): string {
  if (v == null) return '';
  return `$${v.toFixed(2).replace(/\.00$/, '')}`;
}

export function Price({
  value,
  listValue,
  large,
}: {
  value: number | null;
  listValue?: number | null;
  large?: boolean;
}) {
  const onSale = listValue != null && value != null && listValue > value;
  const pct = onSale ? Math.round((1 - value! / listValue!) * 100) : 0;
  return (
    <View style={styles.row}>
      <Txt variant={large ? 'priceLarge' : 'price'} c={onSale ? color.sale : color.ink}>
        {value == null ? '—' : fmt(value)}
      </Txt>
      {onSale && (
        <>
          <Txt variant={large ? 'body' : 'bodySmall'} c={color.inkMuted} style={styles.struck}>
            {fmt(listValue)}
          </Txt>
          <Txt variant={large ? 'caption' : 'tiny'} c={color.sale}>
            {pct}% off
          </Txt>
        </>
      )}
    </View>
  );
}

/* ----------------------------------------------------------------- rating -- */

export function Stars({ value, count }: { value: number | null; count?: number }) {
  if (value == null) return null;
  const full = Math.round(value);
  return (
    <View style={[styles.row, { gap: 5 }]}>
      <Txt variant="tiny" c={color.ink}>
        {'★'.repeat(full)}
        <Txt variant="tiny" c={color.hairline}>
          {'★'.repeat(Math.max(0, 5 - full))}
        </Txt>
      </Txt>
      <Txt variant="tiny" c={color.inkMuted}>
        {value.toFixed(1)}
        {count ? ` (${count})` : ''}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ badge -- */

export function Badge({
  label,
  tone = 'ink',
}: {
  label: string;
  tone?: 'ink' | 'lime' | 'sale' | 'light';
}) {
  const bg =
    tone === 'lime' ? color.lime
    : tone === 'sale' ? color.sale
    : tone === 'light' ? color.surface
    : color.ink;
  const fg = tone === 'lime' ? color.blue : tone === 'light' ? color.ink : color.surface;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Txt variant="eyebrow" c={fg} style={{ fontSize: 10, letterSpacing: 0.8 }}>
        {label}
      </Txt>
    </View>
  );
}

/* --------------------------------------------------------------- skeleton -- */

export function Skeleton({ style }: { style?: ViewProps['style'] }) {
  const o = useSharedValue(0.35);
  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ backgroundColor: color.surfaceSunken }, style, a]} />;
}

/* ------------------------------------------------------------ brooks image - */

/**
 * Product photography, always sized through the Brooks CDN so a 170pt tile
 * fetches a ~340px image rather than the 2500px master.
 */
export function ShoeImage({
  url,
  width,
  height,
  style,
  contentFit = 'contain',
  priority,
  transition = motion.base,
}: {
  url: string;
  width: number;
  height?: number;
  style?: ImageStyle;
  contentFit?: 'contain' | 'cover';
  priority?: 'low' | 'normal' | 'high';
  transition?: number;
}) {
  const h = height ?? width;
  return (
    <Image
      source={{ uri: brooksImage(url, { width: width * 2, height: h * 2 }) }}
      style={[{ width, height: h }, style]}
      contentFit={contentFit}
      transition={transition}
      priority={priority}
      cachePolicy="memory-disk"
      recyclingKey={url}
    />
  );
}

/** Editorial/lifestyle photography: fills its frame, no CDN transparency tricks. */
export function Photo({
  url,
  style,
  width,
  height,
  priority,
}: {
  url: string;
  style?: ImageStyle;
  width: number;
  height: number;
  priority?: 'low' | 'normal' | 'high';
}) {
  return (
    <Image
      source={{ uri: brooksImage(url, { width: width * 2, height: height * 2, fit: 'cut' }) }}
      style={[{ width: '100%', height: '100%' }, style]}
      contentFit="cover"
      transition={motion.slow}
      priority={priority}
      cachePolicy="memory-disk"
    />
  );
}

/* ---------------------------------------------------------------- section -- */

export function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
  onDark,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
  onDark?: boolean;
}) {
  const fg = onDark ? color.surface : color.ink;
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Txt variant="eyebrow" c={onDark ? color.lime : color.inkMuted} style={{ marginBottom: 6 }}>
            {eyebrow}
          </Txt>
        ) : null}
        <Txt variant="h2" c={fg}>
          {title}
        </Txt>
      </View>
      {action ? (
        <Press onPress={onAction} scaleTo={0.95} style={styles.sectionAction}>
          <Txt variant="eyebrow" c={fg} style={{ fontSize: 11 }}>
            {action}
          </Txt>
          <View style={[styles.underline, { backgroundColor: fg }]} />
        </Press>
      ) : null}
    </View>
  );
}

export function Divider({ style }: { style?: ViewProps['style'] }) {
  return <View style={[{ height: 1, backgroundColor: color.hairline }, style]} />;
}

/** Empty/error state illustration stand-in — a Brooks-ish hand-drawn squiggle. */
export function Squiggle({ w = 120, c = color.lime }: { w?: number; c?: string }) {
  return <View style={{ width: w, height: 6, backgroundColor: c, marginVertical: space.md }} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  buttonWrap: { position: 'relative' },
  buttonShadow: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: -4,
    bottom: -4,
    backgroundColor: color.ink,
  },
  button: {
    height: 50,
    borderRadius: radius.none,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: space.lg,
  },
  chip: {
    minWidth: 58,
    paddingHorizontal: space.md,
    height: 44,
    borderRadius: radius.none,
    borderWidth: 1.5,
    borderColor: color.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  struck: { textDecorationLine: 'line-through' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.none,
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: space.gutter,
    marginBottom: space.lg,
    gap: space.md,
  },
  sectionAction: { paddingVertical: 4, gap: 3 },
  underline: { height: 3, width: '100%' },
});

export { font };

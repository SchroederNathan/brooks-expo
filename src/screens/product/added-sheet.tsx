import { router } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BUTTON_HEIGHT, Button } from '@/components/button';
import { BrooksIcon } from '@/components/icons';
import { Press } from '@/components/press';
import { Price } from '@/components/price';
import { ShoeImage } from '@/components/shoe-image';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { heroImage } from '@/data/images';
import { formatPrice } from '@/data/query';
import type { Colorway, Product } from '@/data/types';
import { useCart } from '@/store/cart';
import { colors, motion, spacing } from '@/theme';

import { alsoLike } from './also-like';

export interface AddedLine {
  product: Product;
  colorway: Colorway;
  size: string;
  width: string | null;
}

const { width: SCREEN_W } = Dimensions.get('window');
const LINE_IMAGE = 96;
/** Two tiles and a sliver of the third, so the rail says it scrolls. */
const TILE_W = Math.round((SCREEN_W - spacing.gutter) / 2.25);

/** No overshoot: the shell's edges must never pass the screen's. */
const OPEN = { duration: 460, dampingRatio: 1, overshootClamping: true } as const;
const CLOSE = { duration: 360, dampingRatio: 1, overshootClamping: true } as const;
/** Under ~2pt of the shell's travel: the fold reads as finished. */
const FOLD_LANDED = 0.004;

/** Where a flick would come to rest if it kept decelerating (Apple's decay form). */
function project(velocity: number, decelerationRate = 0.998) {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** The further past the edge, the less the sheet follows. */
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/**
 * The add-to-bag confirmation: the sticky `Add to cart` button grows into a
 * sheet, and closing the sheet folds it back into the button.
 *
 * @ref LLP 0003#add-to-bag-sheet — The sheet is the button, not a second
 * surface that replaces it. One layer (the shell) runs from the button's face
 * to the sheet's frame while its fill turns from Brooks blue to white. It clips
 * the sheet's content, which fades in once the shell is mostly open.
 * `progress` is owned by the PDP so the sticky bar can hand off to the shell.
 *
 * It is a transparent RN `Modal` rather than an overlay view so the scrim also
 * covers the PDP's native header (back and share), and so Android's back
 * gesture and VoiceOver treat it as modal.
 */
export function AddedSheet({
  line,
  progress,
  bottomInset,
  onClosed,
}: {
  line: AddedLine;
  progress: SharedValue<number>;
  bottomInset: number;
  onClosed: () => void;
}) {
  const cart = useCart();
  const reduced = useReducedMotion();
  const { product, colorway } = line;

  /** The sheet's measured height; 0 until its first layout. */
  const height = useSharedValue(0);
  const drag = useSharedValue(0);
  const dragStart = useSharedValue(0);
  /**
   * 1 once a drag commits to dismissing: the sheet keeps its full frame and
   * slides off, while the scrim and the sticky bar still follow `progress`.
   */
  const detached = useSharedValue(0);
  const opened = useRef(false);

  const recs = useMemo(() => alsoLike(catalog, product), [product]);
  const price = colorway.price ?? product.price;
  const sizeLabel = colorway.sizes.find((s) => s.value === line.size)?.label ?? line.size;
  const widthLabel = line.width ? colorway.widths.find((w) => w.value === line.width)?.label : undefined;
  const fit = [`Size ${sizeLabel}`, widthLabel].filter(Boolean).join(' · ');

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      height.set(e.nativeEvent.layout.height);
      if (opened.current) return;
      opened.current = true;
      progress.set(withSpring(1, OPEN));
    },
    [height, progress]
  );

  /** Set while folding, so a second tap cannot queue a second exit. */
  const closing = useRef(false);
  /** Where to go once the fold lands, if anywhere. */
  const afterClose = useRef<(() => void) | null>(null);
  /** 1 while a fold is running; the UI-thread twin of `closing`. */
  const folding = useSharedValue(0);

  const finishClose = useCallback(() => {
    onClosed();
    afterClose.current?.();
    afterClose.current = null;
  }, [onClosed]);

  /**
   * Fold back into the button, then run `then`. Leaving for another screen
   * folds first too: the sheet goes back to where it came from before the
   * next screen arrives, instead of vanishing.
   */
  const foldThen = useCallback(
    (then: (() => void) | null) => {
      if (closing.current) return;
      closing.current = true;
      afterClose.current = then;
      folding.set(1);
      drag.set(withSpring(0, CLOSE));
      progress.set(withSpring(0, CLOSE));
    },
    [drag, folding, progress]
  );

  // Finish the fold when it lands visually, not when the spring settles: a
  // critically damped spring spends its last ~200ms creeping under a pixel,
  // and a navigation waiting on that reads as lag.
  useAnimatedReaction(
    () => folding.get() === 1 && progress.get() < FOLD_LANDED,
    (landed, was) => {
      if (!landed || was) return;
      folding.set(0);
      scheduleOnRN(finishClose);
    },
    [finishClose]
  );

  const close = useCallback(() => foldThen(null), [foldThen]);
  const markClosing = useCallback(() => {
    closing.current = true;
  }, []);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        // Let the horizontal rail win a sideways swipe.
        .activeOffsetY([-10, 10])
        .failOffsetX([-10, 10])
        .onStart(() => {
          dragStart.set(drag.get());
        })
        .onUpdate((e) => {
          const next = dragStart.get() + e.translationY;
          drag.set(next >= 0 ? next : rubberband(next, height.get()));
        })
        .onEnd((e) => {
          const h = height.get();
          if (drag.get() + project(e.velocityY) > h * 0.4) {
            scheduleOnRN(markClosing);
            detached.set(1);
            progress.set(withTiming(0, { duration: motion.base }));
            drag.set(
              withSpring(
                h,
                { duration: 300, dampingRatio: 1, velocity: e.velocityY, overshootClamping: true },
                (finished) => {
                  if (finished) scheduleOnRN(onClosed);
                }
              )
            );
          } else {
            drag.set(withSpring(0, { duration: 300, dampingRatio: 0.8, velocity: e.velocityY }));
          }
        }),
    [drag, dragStart, detached, height, progress, onClosed, markClosing]
  );

  const scrimStyle = useAnimatedStyle(() => {
    const h = height.get();
    const dragged = h > 0 ? interpolate(drag.get(), [0, h], [1, 0], Extrapolation.CLAMP) : 1;
    return { opacity: progress.get() * dragged };
  });

  /**
   * The shell's frame at the current progress: the button's face at 0, the
   * full-width sheet at 1. A detached (drag-dismissed) or reduced-motion sheet
   * keeps the full frame.
   */
  const frame = () => {
    'worklet';
    const g = reduced || detached.get() === 1 ? 1 : progress.get();
    return {
      g,
      left: interpolate(g, [0, 1], [spacing.gutter, 0]),
      bottom: interpolate(g, [0, 1], [bottomInset + spacing.md, 0]),
      height: interpolate(g, [0, 1], [BUTTON_HEIGHT, height.get() || BUTTON_HEIGHT]),
    };
  };

  // The shell clips the sheet's content, so nothing shows outside the frame it
  // has grown to. Its frame is a layout pass per frame; the content inside is
  // absolutely positioned at a fixed width, so that pass does not reflow it.
  const shellStyle = useAnimatedStyle(() => {
    const f = frame();
    return {
      left: f.left,
      right: f.left,
      bottom: f.bottom,
      height: f.height,
      backgroundColor: interpolateColor(f.g, [0, 0.4], [colors.blue, colors.surface]),
      opacity: reduced && detached.get() === 0 ? progress.get() : 1,
      transform: [{ translateY: drag.get() }],
    };
  });

  /** The button's own label, riding the shell until it has grown past it. */
  const ghostStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : interpolate(progress.get(), [0, 0.2], [1, 0], Extrapolation.CLAMP),
  }));

  /** Pinned to the screen inside the moving shell, by undoing the shell's offsets. */
  const contentStyle = useAnimatedStyle(() => {
    const f = frame();
    const p = progress.get();
    const settled = reduced || detached.get() === 1;
    return {
      left: -f.left,
      bottom: -f.bottom,
      opacity: settled ? 1 : interpolate(p, [0.4, 0.9], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: settled ? 0 : interpolate(p, [0.4, 1], [spacing.lg, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
    >
      {/* Gesture Handler needs its own root inside a Modal on Android. */}
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          {/* Hidden from assistive tech: the sheet's own Close is the
              labelled way out, and a full-screen button would be read first. */}
          <Pressable
            style={StyleSheet.absoluteFill}
            accessible={false}
            importantForAccessibility="no"
            onPress={close}
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.shell, shellStyle]}>
            <Animated.View
              accessibilityViewIsModal
              onLayout={onLayout}
              style={[styles.sheet, { paddingBottom: bottomInset + spacing.lg }, contentStyle]}
            >
              <View style={styles.grabber} />

              <View style={styles.head}>
                <Txt variant="h3" accessibilityRole="header">
                  Added to your bag
                </Txt>
                <Press accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={close}>
                  <BrooksIcon name="closeThin" size={22} color={colors.ink} />
                </Press>
              </View>

              <View style={styles.line}>
                <View style={styles.lineImage}>
                  <ShoeImage url={heroImage(colorway.images)} width={LINE_IMAGE} transition={0} />
                </View>
                <View style={styles.lineText}>
                  <Txt variant="productTitle" numberOfLines={2}>
                    {product.name}
                  </Txt>
                  <Txt variant="bodySmall" c={colors.inkMuted} numberOfLines={1}>
                    {colorway.name}
                  </Txt>
                  <Txt variant="bodySmall" c={colors.inkMuted} numberOfLines={1}>
                    {fit}
                  </Txt>
                  <View style={styles.linePrice}>
                    <Price value={price} listValue={colorway.listPrice ?? product.listPrice} />
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <Button title="Keep shopping" variant="secondary" style={styles.action} onPress={close} />
                <Button
                  title={`Bag (${cart.count})`}
                  style={styles.action}
                  onPress={() => foldThen(() => router.navigate('/cart'))}
                />
              </View>

              {recs.length ? (
                <>
                  <Txt variant="h3" style={styles.recsTitle}>
                    You might also like…
                  </Txt>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={TILE_W + spacing.md}
                    contentContainerStyle={styles.rail}
                  >
                    {recs.map((p) => (
                      <RecTile
                        key={p.id}
                        product={p}
                        onPress={() =>
                          foldThen(() =>
                            router.push({
                              pathname: '/product/[id]',
                              params: { id: p.id, color: p.colors.find((c) => !c.soldOut)?.code },
                            })
                          )
                        }
                      />
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        <Animated.View
          style={[styles.ghost, { bottom: bottomInset + spacing.md }, ghostStyle]}
          pointerEvents="none"
        >
          <Txt variant="body" c={colors.surface}>
            Add to cart
          </Txt>
          {price == null ? null : (
            <Txt variant="price" c={colors.surface}>
              {formatPrice(price)}
            </Txt>
          )}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function RecTile({ product, onPress }: { product: Product; onPress: () => void }) {
  const colorway = product.colors.find((c) => !c.soldOut) ?? product.colors[0];
  return (
    <Press accessibilityRole="link" onPress={onPress} style={styles.tile}>
      <View style={styles.tileImage}>
        <ShoeImage url={heroImage(colorway.images)} width={TILE_W} transition={0} />
      </View>
      <Txt variant="productTitle" numberOfLines={1} style={styles.tileName}>
        {product.name}
      </Txt>
      <Price value={colorway.price ?? product.price} listValue={colorway.listPrice ?? product.listPrice} />
    </Press>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: colors.overlay },
  shell: { position: 'absolute', overflow: 'hidden' },
  ghost: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    height: BUTTON_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  sheet: { position: 'absolute', width: SCREEN_W },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    marginTop: spacing.sm,
    backgroundColor: colors.controlBorder,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    marginTop: spacing.xl,
  },
  lineImage: { backgroundColor: colors.surfaceAlt },
  lineText: { flex: 1, gap: 2 },
  linePrice: { marginTop: spacing.xs },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    marginTop: spacing.xl,
  },
  action: { flex: 1 },
  recsTitle: { paddingHorizontal: spacing.gutter, marginTop: spacing.xxl, marginBottom: spacing.lg },
  rail: { paddingHorizontal: spacing.gutter, gap: spacing.md },
  tile: { width: TILE_W },
  tileImage: { backgroundColor: colors.surfaceAlt, marginBottom: spacing.sm },
  tileName: { marginBottom: 2 },
});

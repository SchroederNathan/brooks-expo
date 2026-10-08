import { router } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Divider } from '@/components/divider';
import { Press } from '@/components/press';
import { RunHappyPromise } from '@/components/run-happy-promise';
import { Screen, ScreenHeading, ScreenScrollView } from '@/components/screen';
import { ShoeImage } from '@/components/shoe-image';
import { Squiggle } from '@/components/squiggle';
import { Txt } from '@/components/themed-text';
import { fmt } from '@/utils/format-price';
import { VOICE } from '@/data/editorial';
import { useCart, type CartItemView } from '@/store/cart';
import { border, colors, spacing } from '@/theme';
import { isAppClip, promptFullApp, shopHref } from '@/utils/app-clip';
import { useTabBarOverlap } from '@/utils/native-tabs';

/**
 * The Bag.
 *
 * @ref LLP 0003#cart — GOAT's immediacy: swipe-to-delete with undo, quantity
 * steppers, the PDP's Run Happy Promise band under the totals, and Brooks's
 * own empty-state voice. Each line carries the real Brooks variant id (LLP 0002), which is the
 * point where this prototype's cart and Brooks's production cart speak the same
 * language.
 */
export function Cart() {
  const cart = useCart();
  const tabBarOverlap = useTabBarOverlap();
  // 0 in the Bag tab, which hides its header. The App Clip pushes the bag
  // under the transparent native bar, so the heading starts below the back
  // chevron. @ref LLP 0007#routes
  const headerHeight = useHeaderHeight();
  const [undo, setUndo] = useState<CartItemView | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const removeWithUndo = useCallback(
    (item: CartItemView) => {
      cart.remove(item.variantId);
      setUndo(item);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndo(null), 5000);
    },
    [cart]
  );

  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  if (cart.items.length === 0) {
    // No heading: the empty state's own copy names the screen, and a "Bag (0)"
    // title above it would only say the same thing twice.
    return (
      <Screen style={styles.empty}>
        <Txt variant="eyebrow" c={colors.inkMuted}>
          Your bag
        </Txt>
        <Squiggle />
        <Txt variant="h2" style={{ textAlign: 'center' }}>
          {VOICE.emptyCart}
        </Txt>
        <Button
          title="Find your run"
          style={{ marginTop: spacing.xl, alignSelf: 'stretch' }}
          // Switch to the Browse tab rather than push a copy of it onto the
          // Cart stack, where the native back chevron sat over its title. The
          // Clip has no tabs; it goes back to its New Arrivals.
          onPress={() => router.navigate(shopHref)}
        />
        {undo && <UndoBar item={undo} onUndo={() => restore(cart, undo, setUndo)} />}
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      {/* @ref LLP 0003#the-header-collapses-on-scroll — the blue header is
          Home's alone. Nothing it could carry belongs here: there is no cart
          glyph on the cart, and search, browse, and account are each one
          tab-bar tap away. */}
      <ScreenScrollView
        contentContainerStyle={[styles.content, headerHeight > 0 && { paddingTop: headerHeight + spacing.md }]}
      >
        <ScreenHeading>
          Bag{' '}
          <Txt variant="h3" c={colors.inkMuted}>
            ({cart.count})
          </Txt>
        </ScreenHeading>

        {/* ----------------------------------------------------- LINE ITEMS -- */}
        <View>
          {cart.items.map((item) => (
            <View key={item.variantId}>
              <ReanimatedSwipeable
                friction={2}
                rightThreshold={64}
                overshootRight={false}
                renderRightActions={(progress_, drag) => (
                  <DeleteAction drag={drag} onPress={() => removeWithUndo(item)} />
                )}
              >
                <View style={styles.line}>
                  <Press
                    scaleTo={0.97}
                    onPress={() =>
                      router.push({
                        pathname: '/product/[id]',
                        params: { id: item.productId, color: item.colorCode },
                      })
                    }
                    style={styles.lineImage}
                  >
                    <ShoeImage url={item.imageUrl} width={92} height={92} />
                  </Press>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="productTitle" numberOfLines={1}>
                      {item.product.name}
                    </Txt>
                    <Txt variant="tiny" c={colors.inkMuted} numberOfLines={1}>
                      {item.colorName}
                    </Txt>
                    <Txt variant="tiny" c={colors.inkMuted}>
                      Size {item.size}
                      {item.width ? ` · ${widthLabel(item)}` : ''}
                    </Txt>

                    <View style={styles.lineFooter}>
                      <Stepper
                        value={item.quantity}
                        onChange={(q) => {
                          if (q === 0) removeWithUndo(item);
                          else cart.setQuantity(item.variantId, q);
                        }}
                      />
                      <Txt variant="price">{fmt(item.lineTotal)}</Txt>
                    </View>
                  </View>
                </View>
              </ReanimatedSwipeable>
              <Divider style={{ marginHorizontal: spacing.gutter }} />
            </View>
          ))}
        </View>

        {/* -------------------------------------------------------- TOTALS -- */}
        <View style={styles.totals}>
          <Row label="Subtotal" value={fmt(cart.subtotal)} />
          <Row
            label="Shipping"
            value={cart.shipping === 0 ? 'Free' : fmt(cart.shipping)}
            valueColor={cart.shipping === 0 ? colors.success : colors.ink}
          />
          <Divider style={{ marginVertical: spacing.md }} />
          <Row label="Total" value={fmt(cart.total)} big />
        </View>

        <RunHappyPromise style={{ marginTop: spacing.xl }} />

        {isAppClip && <FullAppOffer />}
      </ScreenScrollView>

      {/* ------------------------------------------------------ STICKY BAR -- */}
      {/* No fill and no rule: the button floats over the rows that scroll
          behind it. Under the glass tab bar it pads up past the bar. */}
      <View style={[styles.stickyBar, { paddingBottom: spacing.md + tabBarOverlap }]}>
        <Button
          title="Checkout"
          accessory={fmt(cart.total)}
          // Checkout is out of scope: no order is ever placed, so the button
          // has nothing to open.
        />
      </View>

      {undo && (
        <UndoBar item={undo} onUndo={() => restore(cart, undo, setUndo)} />
      )}
    </View>
  );
}

/**
 * The App Clip's one ask: install the full app. The bag lives in the App
 * Group, so it is already there when the app opens, and the copy can promise
 * that. @ref LLP 0007#the-full-app-offer
 */
function FullAppOffer() {
  return (
    <View style={styles.offer}>
      <Txt variant="eyebrow">Your bag comes with you</Txt>
      <Txt variant="bodySmall" style={{ marginTop: spacing.xs }}>
        Get the full app and this bag is waiting when you open it, with Shoe Finder and mileage
        tracking for the pairs you own.
      </Txt>
      <Button
        title="Get the app"
        variant="secondary"
        style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
        onPress={promptFullApp}
      />
    </View>
  );
}

function widthLabel(item: CartItemView): string {
  const cw = item.product.colors.find((c) => c.code === item.colorCode);
  return cw?.widths.find((w) => w.value === item.width)?.label ?? item.width;
}

function restore(
  cart: ReturnType<typeof useCart>,
  item: CartItemView,
  setUndo: (v: CartItemView | null) => void
) {
  cart.add({
    productId: item.productId,
    colorCode: item.colorCode,
    size: item.size,
    width: item.width,
    quantity: item.quantity,
  });
  setUndo(null);
}

function Row({
  label,
  value,
  valueColor = colors.ink,
  big,
}: {
  label: string;
  value: string;
  valueColor?: string;
  big?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Txt variant={big ? 'h3' : 'body'} c={big ? colors.ink : colors.inkMuted}>
        {label}
      </Txt>
      <Txt variant={big ? 'priceLarge' : 'price'} c={valueColor}>
        {value}
      </Txt>
    </View>
  );
}

/** Circle-free, of course: a square stepper with a pill only on the hit area. */
function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.stepper}>
      <Press onPress={() => onChange(value - 1)} hitSlop={8} style={styles.stepBtn}>
        <Txt variant="h3" c={colors.ink}>
          −
        </Txt>
      </Press>
      <Txt variant="caption" style={styles.stepValue}>
        {value}
      </Txt>
      <Press onPress={() => onChange(value + 1)} hitSlop={8} style={styles.stepBtn}>
        <Txt variant="h3" c={colors.ink}>
          +
        </Txt>
      </Press>
    </View>
  );
}

function DeleteAction({ drag, onPress }: { drag: SharedValue<number>; onPress: () => void }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + 96 }],
  }));
  return (
    <Animated.View style={[styles.deleteAction, style]}>
      <Press onPress={onPress} style={styles.deletePress}>
        <Txt variant="eyebrow" c={colors.surface} style={{ fontSize: 11 }}>
          Remove
        </Txt>
      </Press>
    </Animated.View>
  );
}

/**
 * 100 clears the sticky checkout bar (≈87pt tall) it floats over, plus the glass
 * tab bar's overlap, which the checkout bar grows by.
 */
function UndoBar({ item, onUndo }: { item: CartItemView; onUndo: () => void }) {
  const tabBarOverlap = useTabBarOverlap();
  return (
    <View style={[styles.undo, { bottom: 100 + tabBarOverlap }]}>
      <Txt variant="caption" c={colors.surface} numberOfLines={1} style={{ flex: 1 }}>
        Removed {item.product.name}
      </Txt>
      <Press onPress={onUndo} hitSlop={8}>
        <Txt variant="eyebrow" c={colors.lime} style={{ fontSize: 11 }}>
          Undo
        </Txt>
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  empty: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  /** 100 clears the sticky checkout bar the last content would otherwise sit under. */
  content: { paddingBottom: 100 },

  line: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
  },
  lineImage: { backgroundColor: colors.surfaceAlt },
  lineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: border.rule,
    borderColor: colors.controlBorder,
  },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 26, textAlign: 'center' },

  offer: { paddingHorizontal: spacing.gutter, marginTop: spacing.xl },

  deleteAction: { width: 96, backgroundColor: colors.sale },
  deletePress: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  totals: { paddingHorizontal: spacing.gutter, marginTop: spacing.xl },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    // The screen's bottom edge IS the tab bar's top edge (the bar is a flex
    // sibling, not an overlay), so this clears nothing but itself.
    paddingBottom: spacing.md,
  },

  undo: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    bottom: 100,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});

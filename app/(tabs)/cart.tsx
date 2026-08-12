import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Divider,
  Press,
  ShoeImage,
  Squiggle,
  Txt,
  fmt,
  notify,
  select,
  tap,
} from '../../src/components/primitives';
import { heroImage } from '../../src/data/images';
import { VOICE } from '../../src/data/editorial';
import { useCart, type CartItemView } from '../../src/store/cart';
import { color, space } from '../../src/theme/tokens';

const FREE_SHIPPING_OVER = 100;

/**
 * The Bag.
 *
 * @ref LLP 0003#cart — GOAT's immediacy: swipe-to-delete with undo, a
 * free-shipping progress bar, quantity steppers, and Brooks's own empty-state
 * voice. Each line carries the real Brooks variant id (LLP 0002), which is the
 * point where this prototype's cart and Brooks's production cart speak the same
 * language.
 */
export default function Cart() {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const [undo, setUndo] = useState<CartItemView | null>(null);
  const [scopeNote, setScopeNote] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const removeWithUndo = useCallback(
    (item: CartItemView) => {
      cart.remove(item.variantId);
      notify(Haptics.NotificationFeedbackType.Warning);
      setUndo(item);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndo(null), 5000);
    },
    [cart]
  );

  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  if (!cart.hydrated) return <View style={styles.root} />;

  if (cart.items.length === 0) {
    return (
      <View style={[styles.root, styles.empty, { paddingTop: insets.top + 90 }]}>
        <Txt variant="eyebrow" c={color.inkMuted}>
          Your bag
        </Txt>
        <Squiggle />
        <Txt variant="h2" style={{ textAlign: 'center' }}>
          {VOICE.emptyCart}
        </Txt>
        <Button
          title="Find your run"
          style={{ marginTop: space.xl, alignSelf: 'stretch' }}
          onPress={() => router.push('/shop')}
        />
        {undo && <UndoBar item={undo} onUndo={() => restore(cart, undo, setUndo)} insets={insets.bottom} />}
      </View>
    );
  }

  const progress = Math.min(1, cart.subtotal / FREE_SHIPPING_OVER);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.lg,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Txt variant="h1">
            Bag{' '}
            <Txt variant="h3" c={color.inkMuted}>
              ({cart.count})
            </Txt>
          </Txt>
        </View>

        {/* ------------------------------------------- FREE SHIPPING METER -- */}
        <View style={styles.shipCard}>
          <Txt variant="caption">
            {cart.freeShippingRemaining > 0 ? (
              <>
                You're{' '}
                <Txt variant="caption" c={color.blue}>
                  {fmt(cart.freeShippingRemaining)}
                </Txt>{' '}
                from free shipping
              </>
            ) : (
              'You’ve earned free shipping 🎉'
            )}
          </Txt>
          <View style={styles.track}>
            <Animated.View
              layout={LinearTransition.duration(300)}
              style={[styles.fill, { width: `${Math.max(4, progress * 100)}%` }]}
            />
          </View>
        </View>

        {/* ----------------------------------------------------- LINE ITEMS -- */}
        <View style={{ marginTop: space.lg }}>
          {cart.items.map((item) => (
            <Animated.View
              key={item.variantId}
              layout={LinearTransition.duration(260)}
              exiting={FadeOut.duration(200)}
            >
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
                    haptic={false}
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
                    <Txt variant="tiny" c={color.inkMuted} numberOfLines={1}>
                      {item.colorName}
                    </Txt>
                    <Txt variant="tiny" c={color.inkMuted}>
                      Size {item.size}
                      {item.width ? ` · ${widthLabel(item)}` : ''}
                    </Txt>
                    {/* The real Brooks variant id — the cart's proof of fidelity. */}
                    <Txt variant="tiny" c={color.inkFaint}>
                      #{item.variantId}
                    </Txt>

                    <View style={styles.lineFooter}>
                      <Stepper
                        value={item.quantity}
                        onChange={(q) => {
                          select();
                          if (q === 0) removeWithUndo(item);
                          else cart.setQuantity(item.variantId, q);
                        }}
                      />
                      <Txt variant="price">{fmt(item.lineTotal)}</Txt>
                    </View>
                  </View>
                </View>
              </ReanimatedSwipeable>
              <Divider style={{ marginHorizontal: space.gutter }} />
            </Animated.View>
          ))}
        </View>

        {/* -------------------------------------------------------- TOTALS -- */}
        <View style={styles.totals}>
          <Row label="Subtotal" value={fmt(cart.subtotal)} />
          <Row
            label="Shipping"
            value={cart.shipping === 0 ? 'Free' : fmt(cart.shipping)}
            valueColor={cart.shipping === 0 ? color.success : color.ink}
          />
          <Divider style={{ marginVertical: space.md }} />
          <Row label="Total" value={fmt(cart.total)} big />
        </View>

        {scopeNote && (
          <Animated.View entering={FadeInDown.duration(240)} style={styles.scopeNote}>
            <Txt variant="eyebrow" c={color.lime} style={{ fontSize: 10 }}>
              Prototype note
            </Txt>
            <Txt variant="bodySmall" c={color.surface} style={{ marginTop: space.xs }}>
              The journey ends here by design — no order is ever placed. Every line
              above already carries the exact variant id Brooks's own Cart-AddProduct
              endpoint accepts, so the last mile is documented, not guessed.
            </Txt>
          </Animated.View>
        )}

        <View style={styles.promise}>
          <Txt variant="eyebrow" c={color.inkMuted} style={{ fontSize: 10 }}>
            {VOICE.promiseTitle}
          </Txt>
          <Txt variant="bodySmall" c={color.inkSoft} style={{ marginTop: 4 }}>
            {VOICE.promise}
          </Txt>
        </View>
      </ScrollView>

      {/* ------------------------------------------------------ STICKY BAR -- */}
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + 66 }]}>
        <Button
          title="Checkout"
          accessory={fmt(cart.total)}
          onPress={() => {
            tap(Haptics.ImpactFeedbackStyle.Medium);
            setScopeNote(true);
          }}
        />
      </View>

      {undo && (
        <UndoBar item={undo} onUndo={() => restore(cart, undo, setUndo)} insets={insets.bottom} />
      )}
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
  valueColor = color.ink,
  big,
}: {
  label: string;
  value: string;
  valueColor?: string;
  big?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Txt variant={big ? 'h3' : 'body'} c={big ? color.ink : color.inkMuted}>
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
      <Press haptic={false} onPress={() => onChange(value - 1)} hitSlop={8} style={styles.stepBtn}>
        <Txt variant="h3" c={color.ink}>
          −
        </Txt>
      </Press>
      <Txt variant="caption" style={styles.stepValue}>
        {value}
      </Txt>
      <Press haptic={false} onPress={() => onChange(value + 1)} hitSlop={8} style={styles.stepBtn}>
        <Txt variant="h3" c={color.ink}>
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
      <Press haptic={false} onPress={onPress} style={styles.deletePress}>
        <Txt variant="eyebrow" c={color.surface} style={{ fontSize: 11 }}>
          Remove
        </Txt>
      </Press>
    </Animated.View>
  );
}

function UndoBar({
  item,
  onUndo,
  insets,
}: {
  item: CartItemView;
  onUndo: () => void;
  insets: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(160)}
      style={[styles.undo, { bottom: insets + 130 }]}
    >
      <Txt variant="caption" c={color.surface} numberOfLines={1} style={{ flex: 1 }}>
        Removed {item.product.name}
      </Txt>
      <Press haptic={false} onPress={onUndo} hitSlop={8}>
        <Txt variant="eyebrow" c={color.lime} style={{ fontSize: 11 }}>
          Undo
        </Txt>
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.surface },
  empty: { alignItems: 'center', paddingHorizontal: space.xxl },
  head: { paddingHorizontal: space.gutter, marginBottom: space.lg },

  shipCard: {
    marginHorizontal: space.gutter,
    padding: space.lg,
    backgroundColor: color.surfaceAlt,
    gap: space.md,
  },
  track: { height: 8, backgroundColor: color.surface, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: color.lime, borderWidth: 1, borderColor: color.ink },

  line: {
    flexDirection: 'row',
    gap: space.lg,
    paddingHorizontal: space.gutter,
    paddingVertical: space.lg,
    backgroundColor: color.surface,
  },
  lineImage: { backgroundColor: color.surfaceAlt },
  lineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: color.hairline,
  },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 26, textAlign: 'center' },

  deleteAction: { width: 96, backgroundColor: color.sale },
  deletePress: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  totals: { paddingHorizontal: space.gutter, marginTop: space.xl },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },

  scopeNote: {
    marginHorizontal: space.gutter,
    marginTop: space.lg,
    backgroundColor: color.navy,
    padding: space.lg,
  },

  promise: {
    marginHorizontal: space.gutter,
    marginTop: space.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: color.hairline,
  },

  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.hairline,
  },

  undo: {
    position: 'absolute',
    left: space.gutter,
    right: space.gutter,
    backgroundColor: color.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
});

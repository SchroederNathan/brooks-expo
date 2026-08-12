import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpecMeter } from '../../src/components/SpecMeter';
import {
  Badge,
  Button,
  Chip,
  Divider,
  Press,
  Price,
  ShoeImage,
  Stars,
  Txt,
  notify,
  select,
} from '../../src/components/primitives';
import { catalog } from '../../src/data/catalog';
import { heroImage } from '../../src/data/images';
import { supportLabel } from '../../src/data/labels';
import { byId, colorwayOf, formatPrice } from '../../src/data/query';
import { useCart } from '../../src/store/cart';
import { color, shadow, space } from '../../src/theme/tokens';

const { width: W } = Dimensions.get('window');
const GALLERY_H = Math.round(W * 0.92);

const CUSHION_STOPS = ['Responsive', 'Balanced', 'Plush'];
const SUPPORT_STOPS = ['neutral', 'flexible_support', 'balanced_support', 'structured_support', 'max_support'];

/**
 * The PDP.
 *
 * @ref LLP 0003#pdp — GOAT's presentation with Zappos's fit confidence: an
 * edge-to-edge swipeable gallery, colorway swatches that are real shoe
 * thumbnails (Brooks colorways are multi-color, so dots lie), a size grid with
 * out-of-stock struck through (`selectable: false`, LLP 0002), width at equal
 * rank with size, and a sticky "Add to Bag · $150" bar.
 */
export default function ProductDetail() {
  const { id, color: colorParam } = useLocalSearchParams<{ id: string; color?: string }>();
  const insets = useSafeAreaInsets();
  const cart = useCart();

  const product = byId(catalog, String(id));
  const [colorCode, setColorCode] = useState<string | undefined>(
    colorParam ? String(colorParam) : undefined
  );
  const [size, setSize] = useState<string | null>(null);
  const [width, setWidth] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [needsSize, setNeedsSize] = useState(false);
  const [added, setAdded] = useState<{ image: string; name: string } | null>(null);

  const galleryRef = useRef<FlatList>(null);
  const scrollRef = useRef<ScrollView>(null);
  const sizesY = useRef(0);
  const shake = useSharedValue(0);

  const colorway = product ? colorwayOf(product, colorCode) : undefined;

  /** Default the width to Medium when available — it is what most people wear. */
  useEffect(() => {
    if (!colorway) return;
    const avail = colorway.widths.filter((w) => w.available);
    if (width && avail.some((w) => w.value === width)) return;
    const medium = avail.find((w) => /1D|1B/.test(w.value));
    setWidth((medium ?? avail[0])?.value ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorway?.code]);

  /** Selected size can disappear when the colorway changes; drop it if so. */
  useEffect(() => {
    if (!colorway || !size) return;
    const still = colorway.sizes.find((s) => s.value === size);
    if (!still?.available) setSize(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorway?.code]);

  const images = useMemo(() => {
    if (!colorway) return [];
    const hero = heroImage(colorway.images);
    // Hero angle first, then the rest in catalog order.
    return [
      ...colorway.images.filter((i) => i.url === hero),
      ...colorway.images.filter((i) => i.url !== hero),
    ];
  }, [colorway]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (!product || !colorway) {
    return (
      <View style={[styles.root, styles.missing, { paddingTop: insets.top + 80 }]}>
        <Txt variant="h2">We lost that one</Txt>
        <Txt variant="body" c={color.inkMuted} style={{ marginTop: space.md, textAlign: 'center' }}>
          That product isn't in this catalog snapshot.
        </Txt>
        <Button title="Back" variant="secondary" style={{ marginTop: space.xl }} onPress={() => router.back()} />
      </View>
    );
  }

  const price = colorway.price ?? product.price;
  const listPrice = colorway.listPrice ?? product.listPrice;
  const sizeUnit = colorway.sizeAttrId === 'size_Apparel' ? 'size' : 'US size';
  const canAdd = !colorway.soldOut && colorway.sizes.some((s) => s.available);

  const onAdd = () => {
    if (!size) {
      // Brooks-flavored error: shake the size grid, error haptic, scroll to it.
      setNeedsSize(true);
      notify(Haptics.NotificationFeedbackType.Error);
      shake.value = withSequence(
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      scrollRef.current?.scrollTo({ y: Math.max(0, sizesY.current - 140), animated: true });
      return;
    }
    const widthVal = width ?? colorway.widths.find((w) => w.available)?.value ?? '1D';
    cart.add({ productId: product.id, colorCode: colorway.code, size, width: widthVal });
    notify(Haptics.NotificationFeedbackType.Success);
    setAdded({ image: heroImage(colorway.images), name: product.name });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
      >
        {/* ------------------------------------------------------- GALLERY -- */}
        <View style={{ height: GALLERY_H, backgroundColor: color.surfaceAlt }}>
          <FlatList
            ref={galleryRef}
            data={images}
            key={colorway.code}
            keyExtractor={(i) => i.url}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / W))
            }
            renderItem={({ item, index }) => (
              <ShoeImage
                url={item.url}
                width={W}
                height={GALLERY_H}
                priority={index === 0 ? 'high' : 'normal'}
              />
            )}
          />
          <View style={styles.galleryBadges}>
            {product.badge ? (
              <Badge label={product.badge} tone={product.badge === 'Sale' ? 'sale' : 'lime'} />
            ) : null}
          </View>
          {/* Page dots — squares, of course. */}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((img, i) => (
                <View key={img.url} style={[styles.dot, i === galleryIndex && styles.dotOn]} />
              ))}
            </View>
          )}
        </View>

        {/* --------------------------------------------------------- TITLE -- */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.block}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              {product.franchise ? (
                <Txt variant="eyebrow" c={color.inkMuted}>
                  {product.gender === 'womens' ? "Women's" : product.gender === 'mens' ? "Men's" : ''}{' '}
                  {product.franchise}
                </Txt>
              ) : null}
              <Txt variant="pdpTitle" style={{ marginTop: 4 }}>
                {product.name}
              </Txt>
            </View>
            <Price value={price} listValue={listPrice} large />
          </View>
          {product.rating ? (
            <View style={{ marginTop: space.sm }}>
              <Stars value={product.rating} count={product.reviewCount} />
            </View>
          ) : null}
        </Animated.View>

        {/* -------------------------------------------------------- COLORS -- */}
        <View style={styles.block}>
          <View style={styles.rowBetween}>
            <Txt variant="eyebrow" c={color.inkMuted}>
              Color
            </Txt>
            <Txt variant="caption" c={color.inkMuted} numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
              {colorway.name}
            </Txt>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.swatchRail}
          >
            {product.colors.map((c) => (
              <Press
                key={c.code}
                haptic={false}
                scaleTo={0.92}
                onPress={() => {
                  select();
                  setColorCode(c.code);
                  setGalleryIndex(0);
                }}
                style={[styles.swatch, c.code === colorway.code && styles.swatchOn]}
              >
                <ShoeImage url={heroImage(c.images)} width={64} height={64} transition={0} />
                {c.soldOut ? <View style={styles.swatchSoldOut} /> : null}
              </Press>
            ))}
          </ScrollView>
        </View>

        {/* --------------------------------------------------------- WIDTH -- */}
        {colorway.widths.length > 0 && (
          <View style={styles.block}>
            <Txt variant="eyebrow" c={color.inkMuted} style={{ marginBottom: space.md }}>
              Width
            </Txt>
            <View style={styles.chipWrap}>
              {colorway.widths.map((w) => (
                <Chip
                  key={w.value}
                  label={w.label}
                  selected={width === w.value}
                  disabled={!w.available}
                  onPress={() => setWidth(w.value)}
                />
              ))}
            </View>
            <Txt variant="tiny" c={color.inkMuted} style={{ marginTop: space.sm }}>
              Four widths is the Brooks difference — most running brands stop at one.
            </Txt>
          </View>
        )}

        {/* --------------------------------------------------------- SIZES -- */}
        <Animated.View
          style={[styles.block, shakeStyle]}
          onLayout={(e) => {
            sizesY.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.rowBetween}>
            <Txt variant="eyebrow" c={needsSize && !size ? color.sale : color.inkMuted}>
              Select {sizeUnit}
            </Txt>
            {needsSize && !size ? (
              <Txt variant="caption" c={color.sale}>
                Pick a size first
              </Txt>
            ) : null}
          </View>
          <View style={[styles.chipWrap, { marginTop: space.md }]}>
            {colorway.sizes.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                selected={size === s.value}
                disabled={!s.available}
                onPress={() => {
                  setSize(s.value);
                  setNeedsSize(false);
                }}
              />
            ))}
          </View>
          {colorway.sizes.some((s) => !s.available) ? (
            <Txt variant="tiny" c={color.inkMuted} style={{ marginTop: space.sm }}>
              Struck-through sizes are out of stock in this color.
            </Txt>
          ) : null}
        </Animated.View>

        {/* ---------------------------------------------------------- FIT --- */}
        {(product.cushion || product.support) && (
          <View style={[styles.block, styles.fitCard]}>
            <Txt variant="h3" style={{ marginBottom: space.lg }}>
              How it runs
            </Txt>
            <View style={{ gap: space.xl }}>
              <SpecMeter label="Feel under foot" stops={CUSHION_STOPS} value={product.cushion} />
              {product.support ? (
                <SpecMeter
                  label="Support"
                  stops={SUPPORT_STOPS.map((s) => supportLabel(s) ?? s)}
                  value={supportLabel(product.support)}
                />
              ) : null}
            </View>
            {product.bestFor.length > 0 && (
              <View style={{ marginTop: space.xl }}>
                <Txt variant="eyebrow" c={color.inkMuted} style={{ fontSize: 11, marginBottom: space.sm }}>
                  Best for
                </Txt>
                <View style={styles.chipWrap}>
                  {product.bestFor.map((b) => (
                    <View key={b} style={styles.bestFor}>
                      <Txt variant="caption">{b}</Txt>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ---------------------------------------------------- DESCRIPTION -- */}
        {product.description ? (
          <View style={styles.block}>
            <Txt variant="h3" style={{ marginBottom: space.md }}>
              About this {product.productType === 'Shoes' ? 'shoe' : 'piece'}
            </Txt>
            <Txt variant="body" c={color.inkSoft}>
              {product.description}
            </Txt>
          </View>
        ) : null}

        {product.features.length > 0 && (
          <View style={styles.block}>
            <Divider style={{ marginBottom: space.lg }} />
            {product.features.map((f) => (
              <View key={f} style={styles.feature}>
                <View style={styles.featureTick} />
                <Txt variant="body" c={color.inkSoft} style={{ flex: 1 }}>
                  {f}
                </Txt>
              </View>
            ))}
          </View>
        )}

        {/* ------------------------------------------------------- PROMISE -- */}
        <View style={[styles.block, styles.promise]}>
          <Txt variant="eyebrow" c={color.inkMuted}>
            Run Happy Promise
          </Txt>
          <Txt variant="body" style={{ marginTop: space.sm }}>
            Take it for a 90-day trial run. If you're not happy, we're not happy.
          </Txt>
        </View>
      </ScrollView>

      {/* ------------------------------------------------------ TOP BUTTONS -- */}
      <View style={[styles.topBar, { top: insets.top + space.sm }]}>
        <Press onPress={() => router.back()} scaleTo={0.9} style={styles.circleBtn}>
          <Txt variant="h3">‹</Txt>
        </Press>
        <Press
          onPress={() => router.push('/cart')}
          scaleTo={0.9}
          style={styles.circleBtn}
        >
          <Txt variant="caption">Bag{cart.count ? ` · ${cart.count}` : ''}</Txt>
        </Press>
      </View>

      {/* ------------------------------------------------------ STICKY BAR -- */}
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + space.md }]}>
        <Button
          title={
            colorway.soldOut ? 'Sold out' : size ? 'Add to bag' : `Select ${sizeUnit}`
          }
          accessory={canAdd ? formatPrice(price) : undefined}
          disabled={!canAdd}
          onPress={onAdd}
        />
      </View>

      {/* --------------------------------------------------- ADDED OVERLAY -- */}
      {added && (
        <AddedToast
          image={added.image}
          name={added.name}
          bottomInset={insets.bottom}
          onDone={() => setAdded(null)}
        />
      )}
    </View>
  );
}

/**
 * Add-to-bag confirmation: the shoe springs in over the sticky bar, then the
 * toast offers the bag. Auto-dismisses; tapping "View bag" goes straight there.
 */
function AddedToast({
  image,
  name,
  bottomInset,
  onDone,
}: {
  image: string;
  name: string;
  bottomInset: number;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      exiting={FadeOut.duration(180)}
      style={[styles.toast, { bottom: bottomInset + 92 }]}
    >
      <View style={styles.toastImage}>
        <ShoeImage url={image} width={54} height={54} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="caption" c={color.surface} numberOfLines={1}>
          {name}
        </Txt>
        <Txt variant="tiny" c="rgba(255,255,255,0.7)">
          Added to your bag
        </Txt>
      </View>
      <Press
        onPress={() => {
          onDone();
          router.push('/cart');
        }}
        scaleTo={0.94}
        style={styles.toastCta}
      >
        <Txt variant="eyebrow" c={color.blue} style={{ fontSize: 10 }}>
          View bag
        </Txt>
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.surface },
  missing: { alignItems: 'center', paddingHorizontal: space.xxl },

  galleryBadges: { position: 'absolute', top: 108, left: space.gutter },
  dots: {
    position: 'absolute',
    bottom: space.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 6, height: 6, backgroundColor: color.inkFaint },
  dotOn: { backgroundColor: color.ink, width: 18 },

  block: { paddingHorizontal: space.gutter, marginTop: space.xl },
  titleRow: { flexDirection: 'row', gap: space.lg, alignItems: 'flex-start' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },

  swatchRail: { gap: space.sm, marginTop: space.md },
  swatch: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.hairline,
    backgroundColor: color.surfaceAlt,
  },
  swatchOn: { borderColor: color.ink },
  swatchSoldOut: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },

  fitCard: {
    backgroundColor: color.surfaceAlt,
    marginHorizontal: space.gutter,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
  },
  bestFor: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.hairline,
  },

  feature: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', marginBottom: space.md },
  featureTick: { width: 8, height: 8, backgroundColor: color.lime, marginTop: 8 },

  promise: {
    borderWidth: 1,
    borderColor: color.hairline,
    marginHorizontal: space.gutter,
    padding: space.lg,
  },

  topBar: {
    position: 'absolute',
    left: space.gutter,
    right: space.gutter,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleBtn: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: space.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
    ...shadow.bar,
  },

  toast: {
    position: 'absolute',
    left: space.gutter,
    right: space.gutter,
    backgroundColor: color.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
  },
  toastImage: { backgroundColor: color.surfaceAlt },
  toastCta: {
    backgroundColor: color.lime,
    paddingHorizontal: space.md,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

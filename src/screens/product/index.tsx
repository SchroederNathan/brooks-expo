import * as Haptics from 'expo-haptics';
import { Link, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpecMeter } from '@/screens/product/spec-meter';
import { BrooksIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Divider } from '@/components/divider';
import { Press } from '@/components/press';
import { Price } from '@/components/price';
import { ShoeImage } from '@/components/shoe-image';
import { Stars } from '@/components/stars';
import { Txt } from '@/components/themed-text';
import { UnderlineRail } from '@/components/underline-rail';
import { notify, select } from '@/utils/haptics';
import { catalog } from '@/data/catalog';
import { heroImage } from '@/data/images';
import { supportLabel } from '@/data/labels';
import { byId, colorwayOf, formatPrice } from '@/data/query';
import { useCart } from '@/store/cart';
import { colors, shadows, spacing } from '@/theme';

const { width: W } = Dimensions.get('window');
const GALLERY_H = Math.round(W * 0.92);

const CUSHION_STOPS = ['Responsive', 'Balanced', 'Plush'];
const SUPPORT_STOPS = ['neutral', 'flexible_support', 'balanced_support', 'structured_support', 'max_support'];

/**
 * The PDP.
 *
 * @ref LLP 0003#pdp — GOAT's presentation with Zappos's fit confidence: an
 * edge-to-edge swipeable gallery, colorway swatches that are real shoe
 * thumbnails (Brooks colorways are multi-color, so dots lie) with a sliding
 * ink underline (`UnderlineRail`), a size grid with
 * out-of-stock struck through (`selectable: false`, LLP 0002), width at equal
 * rank with size, and a sticky "Add to Bag · $150" bar.
 */
export function ProductDetail({ id, colorParam }: { id: string; colorParam?: string }) {
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

  if (!product || !colorway) {
    return (
      <View style={[styles.root, styles.missing, { paddingTop: insets.top + 80 }]}>
        <Txt variant="h2">We lost that one</Txt>
        <Txt variant="body" c={colors.inkMuted} style={{ marginTop: spacing.md, textAlign: 'center' }}>
          That product isn't in this catalog snapshot.
        </Txt>
        <Button title="Back" variant="secondary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </View>
    );
  }

  const price = colorway.price ?? product.price;
  const listPrice = colorway.listPrice ?? product.listPrice;
  const sizeUnit = colorway.sizeAttrId === 'size_Apparel' ? 'size' : 'US size';
  const canAdd = !colorway.soldOut && colorway.sizes.some((s) => s.available);

  const onAdd = () => {
    if (!size) {
      setNeedsSize(true);
      notify(Haptics.NotificationFeedbackType.Error);
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
        {/* @ref LLP 0003#pdp — AppleZoomTarget is the gallery bounds so the
            tile photo lands on the hero, not the full screen. Size is known
            on first paint (window width), which the zoom transition needs. */}
        <Link.AppleZoomTarget>
          <View
            collapsable={false}
            style={{ height: GALLERY_H, width: W, backgroundColor: colors.surfaceAlt }}
          >
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
            {/* Page dots — squares, of course. */}
            {images.length > 1 && (
              <View style={styles.dots}>
                {images.map((img, i) => (
                  <View key={img.url} style={[styles.dot, i === galleryIndex && styles.dotOn]} />
                ))}
              </View>
            )}
          </View>
        </Link.AppleZoomTarget>

        {/* --------------------------------------------------------- TITLE -- */}
        <View style={styles.block}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              {product.franchise ? (
                <Txt variant="eyebrow" c={colors.inkMuted}>
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
            <View style={{ marginTop: spacing.sm }}>
              <Stars value={product.rating} count={product.reviewCount} />
            </View>
          ) : null}
        </View>

        {/* -------------------------------------------------------- COLORS -- */}
        <View style={styles.block}>
          <View style={styles.rowBetween}>
            <Txt variant="eyebrow" c={colors.inkMuted}>
              Color
            </Txt>
            <Txt variant="caption" c={colors.inkMuted} numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
              {colorway.name}
            </Txt>
          </View>
          <UnderlineRail
            selectedIndex={Math.max(
              0,
              product.colors.findIndex((c) => c.code === colorway.code)
            )}
            gap={spacing.sm}
            scrollable
            style={{ marginTop: spacing.md }}
          >
            {product.colors.map((c) => (
              <Press
                key={c.code}
                haptic={false}
                scaleTo={0.92}
                accessibilityRole="button"
                accessibilityState={{ selected: c.code === colorway.code }}
                onPress={() => {
                  select();
                  setColorCode(c.code);
                  setGalleryIndex(0);
                }}
                style={styles.swatch}
              >
                <ShoeImage url={heroImage(c.images)} width={64} height={64} transition={0} />
                {c.soldOut ? <View style={styles.swatchSoldOut} /> : null}
              </Press>
            ))}
          </UnderlineRail>
        </View>

        {/* --------------------------------------------------------- WIDTH -- */}
        {colorway.widths.length > 0 && (
          <View style={styles.block}>
            <Txt variant="eyebrow" c={colors.inkMuted} style={{ marginBottom: spacing.md }}>
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
            <Txt variant="tiny" c={colors.inkMuted} style={{ marginTop: spacing.sm }}>
              Four widths is the Brooks difference — most running brands stop at one.
            </Txt>
          </View>
        )}

        {/* --------------------------------------------------------- SIZES -- */}
        <View
          style={styles.block}
          onLayout={(e) => {
            sizesY.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.rowBetween}>
            <Txt variant="eyebrow" c={needsSize && !size ? colors.sale : colors.inkMuted}>
              Select {sizeUnit}
            </Txt>
            {needsSize && !size ? (
              <Txt variant="caption" c={colors.sale}>
                Pick a size first
              </Txt>
            ) : null}
          </View>
          <View style={[styles.chipWrap, { marginTop: spacing.md }]}>
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
            <Txt variant="tiny" c={colors.inkMuted} style={{ marginTop: spacing.sm }}>
              Struck-through sizes are out of stock in this colors.
            </Txt>
          ) : null}
        </View>

        {/* ---------------------------------------------------------- FIT --- */}
        {(product.cushion || product.support) && (
          <View style={[styles.block, styles.fitCard]}>
            <Txt variant="h3" style={{ marginBottom: spacing.lg }}>
              How it runs
            </Txt>
            <View style={{ gap: spacing.xl }}>
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
              <View style={{ marginTop: spacing.xl }}>
                <Txt variant="eyebrow" c={colors.inkMuted} style={{ fontSize: 11, marginBottom: spacing.sm }}>
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
            <Txt variant="h3" style={{ marginBottom: spacing.md }}>
              About this {product.productType === 'Shoes' ? 'shoe' : 'piece'}
            </Txt>
            <Txt variant="body" c={colors.inkSoft}>
              {product.description}
            </Txt>
          </View>
        ) : null}

        {product.features.length > 0 && (
          <View style={styles.block}>
            <Divider style={{ marginBottom: spacing.lg }} />
            {product.features.map((f) => (
              <View key={f} style={styles.feature}>
                <View style={styles.featureTick} />
                <Txt variant="body" c={colors.inkSoft} style={{ flex: 1 }}>
                  {f}
                </Txt>
              </View>
            ))}
          </View>
        )}

        {/* ------------------------------------------------------- PROMISE -- */}
        <View style={[styles.block, styles.promise]}>
          <Txt variant="eyebrow" c={colors.inkMuted}>
            Run Happy Promise
          </Txt>
          <Txt variant="body" style={{ marginTop: spacing.sm }}>
            Take it for a 90-day trial run. If you're not happy, we're not happy.
          </Txt>
        </View>
      </ScrollView>

      {/* ------------------------------------------------------ TOP BUTTONS -- */}
      <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
        <Press onPress={() => router.back()} scaleTo={0.9} style={styles.circleBtn}>
          <BrooksIcon name="caretLeft" size={16} />
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
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + spacing.md }]}>
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
 * Add-to-bag confirmation over the sticky bar. Auto-dismisses; tapping
 * "View bag" goes straight there.
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
    <View style={[styles.toast, { bottom: bottomInset + 92 }]}>
      <View style={styles.toastImage}>
        <ShoeImage url={image} width={54} height={54} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="caption" c={colors.surface} numberOfLines={1}>
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
        <Txt variant="eyebrow" c={colors.blue} style={{ fontSize: 10 }}>
          View bag
        </Txt>
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  missing: { alignItems: 'center', paddingHorizontal: spacing.xxl },

  dots: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 6, height: 6, backgroundColor: colors.inkFaint },
  dotOn: { backgroundColor: colors.ink, width: 18 },

  block: { paddingHorizontal: spacing.gutter, marginTop: spacing.xl },
  titleRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  swatch: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  swatchSoldOut: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  fitCard: {
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: spacing.gutter,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  bestFor: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },

  feature: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.md },
  featureTick: { width: 8, height: 8, backgroundColor: colors.lime, marginTop: 8 },

  promise: {
    borderWidth: 1,
    borderColor: colors.hairline,
    marginHorizontal: spacing.gutter,
    padding: spacing.lg,
  },

  topBar: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleBtn: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },

  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    boxShadow: shadows.bar,
  },

  toast: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  toastImage: { backgroundColor: colors.surfaceAlt },
  toastCta: {
    backgroundColor: colors.lime,
    paddingHorizontal: spacing.md,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

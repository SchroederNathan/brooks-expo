import { Image } from 'expo-image';
import { Link, router, Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPaginationDots } from '@/components/animated-pagination-dots';
import {
  BalancedCushionIcon,
  BalancedSupportIcon,
  BrooksIcon,
  InfoIcon,
} from '@/components/icons';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Press } from '@/components/press';
import { Price } from '@/components/price';
import { ShoeImage } from '@/components/shoe-image';
import { Stars } from '@/components/stars';
import { Txt } from '@/components/themed-text';
import { UnderlineRail } from '@/components/underline-rail';
import { catalog } from '@/data/catalog';
import { heroImage } from '@/data/images';
import { supportLabel } from '@/data/labels';
import { byId, colorwayOf, formatPrice } from '@/data/query';
import { reviewsFor } from '@/data/reviews';
import { useCart } from '@/store/cart';
import { border, colors, headerIcon, shadows, spacing } from '@/theme';

import { ReviewsPanel } from './reviews-panel';

const { width: W } = Dimensions.get('window');
const GALLERY_H = W;
const OPTION_CONTENT_W = W - spacing.gutter * 2;
const OPTION_GAP = spacing.xs;
const SIZE_OPTION_W = (OPTION_CONTENT_W - OPTION_GAP * 4) / 5;
const WIDTH_OPTION_W = (OPTION_CONTENT_W - OPTION_GAP * 3) / 4;

// @ref LLP 0003#pdp-detail-sections — Brooks pairs these catalog taxonomy
// values with fixed explanatory copy on the live PDP.
const CUSHION_DESCRIPTION: Record<string, string> = {
  Balanced: 'A blend of soft and dynamic cushioning that offers a smooth feeling with each step.',
};

const SUPPORT_DESCRIPTION: Record<string, string> = {
  balanced_support: 'Secure heel with dynamic forefoot helps provide inherent stability.',
};

/**
 * The PDP.
 *
 * @ref LLP 0003#pdp — GOAT's presentation with Zappos's fit confidence: an
 * edge-to-edge swipeable gallery, colorway swatches that are real shoe
 * thumbnails (Brooks colorways are multi-color, so dots lie) with a sliding
 * ink underline (`UnderlineRail`), a size grid with diagonally marked
 * out-of-stock choices (`selectable: false`, LLP 0002), width at equal rank
 * with size, and a sticky blue purchase bar.
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
  const [needsSize, setNeedsSize] = useState(false);
  const [added, setAdded] = useState<{ image: string; name: string } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const sizesY = useRef(0);
  const galleryProgress = useSharedValue(0);

  const colorway = product ? colorwayOf(product, colorCode) : undefined;
  const reviewData = product ? reviewsFor(product.id) : undefined;
  const reviewRating = reviewData ? reviewData.averageRating : product?.rating ?? null;
  const reviewCount = reviewData ? reviewData.reviewCount : product?.reviewCount ?? 0;

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

  useEffect(() => {
    galleryProgress.set(0);
  }, [colorway?.code, galleryProgress]);

  const handleGalleryScroll = useAnimatedScrollHandler((event) => {
    galleryProgress.set(event.contentOffset.x / W);
  });

  /**
   * The share sheet gets the product's own brooksrunning.com URL — the catalog
   * carries it (LLP 0002), and a real link is the only share worth offering: the
   * app has no deep-link host of its own to hand someone instead.
   *
   * Declared above the missing-product early return so the hook order is stable.
   */
  const onShare = useCallback(() => {
    if (!product) return;
    // One item, not two: iOS adds `message` and `url` to the activity sheet
    // *separately*, so setting both on the same link makes the sheet announce
    // "2 Links". `url` is the iOS-only field, and Android has no `url` at all —
    // so each platform gets the one field it reads.
    Share.share(
      Platform.OS === 'ios' ? { url: product.url } : { message: product.url },
      { subject: product.name }
    ).catch(() => {});
  }, [product]);

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
  const readyToAdd = canAdd && !!size && (colorway.widths.length === 0 || !!width);

  const onAdd = () => {
    if (!size) {
      setNeedsSize(true);
      scrollRef.current?.scrollTo({ y: Math.max(0, sizesY.current - 140), animated: true });
      return;
    }
    const widthVal = width ?? colorway.widths.find((w) => w.available)?.value ?? '1D';
    cart.add({ productId: product.id, colorCode: colorway.code, size, width: widthVal });
    setAdded({ image: heroImage(colorway.images), name: product.name });
  };

  return (
    <View style={styles.root}>
      {/* The stack's own bar, transparent over the gallery: a native back
          chevron on the left, share on the right. @ref LLP
          0003#pushed-screens-wear-the-native-header — the cart lost its slot
          here. It was a square box reading "Bag · 1" that duplicated the tab
          bar's badge two inches below it; share is the thing a PDP actually
          owes the reader, and it is the one action no other chrome offers. */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={headerIcon.share}
          accessibilityLabel={`Share ${product.name}`}
          onPress={onShare}
        />
      </Stack.Toolbar>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        // The header is transparent and the gallery runs under it, so UIKit must
        // not inset the content past it.
        contentInsetAdjustmentBehavior="never"
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
            <Animated.FlatList
              data={images}
              key={colorway.code}
              keyExtractor={(i) => i.url}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleGalleryScroll}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => (
                <ShoeImage
                  url={item.url}
                  width={W}
                  height={GALLERY_H}
                  contentFit="cover"
                  priority={index === 0 ? 'high' : 'normal'}
                />
              )}
            />
            {/* Page dots — squares, of course. */}
            <AnimatedPaginationDots
              count={images.length}
              progress={galleryProgress}
              style={styles.dots}
            />
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
          {reviewRating ? (
            <View style={{ marginTop: spacing.sm }}>
              <Stars value={reviewRating} count={reviewCount} />
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
            style={styles.colorRail}
            contentContainerStyle={styles.colorRailContent}
          >
            {product.colors.map((c) => (
              <Press
                key={c.code}
                scaleTo={0.92}
                accessibilityRole="button"
                accessibilityState={{ selected: c.code === colorway.code }}
                onPress={() => setColorCode(c.code)}
                style={styles.swatch}
              >
                <ShoeImage url={heroImage(c.images)} width={64} height={64} transition={0} />
                {c.soldOut ? <View style={styles.swatchSoldOut} /> : null}
              </Press>
            ))}
          </UnderlineRail>
        </View>

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
          <View style={[styles.optionWrap, { marginTop: spacing.md }]}>
            {colorway.sizes.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                appearance="productOption"
                selected={size === s.value}
                disabled={!s.available}
                style={styles.sizeOption}
                onPress={() => {
                  setSize(s.value);
                  setNeedsSize(false);
                }}
              />
            ))}
          </View>
        </View>

        {/* --------------------------------------------------------- WIDTH -- */}
        {colorway.widths.length > 0 && (
          <View style={styles.block}>
            <Txt variant="eyebrow" c={colors.inkMuted} style={{ marginBottom: spacing.md }}>
              Select width
            </Txt>
            <View style={styles.optionWrap}>
              {colorway.widths.map((w) => (
                <Chip
                  key={w.value}
                  label={w.label}
                  appearance="productOption"
                  selected={width === w.value}
                  disabled={!w.available}
                  style={styles.widthOption}
                  onPress={() => setWidth(w.value)}
                />
              ))}
            </View>
            <Txt variant="tiny" c={colors.inkMuted} style={{ marginTop: spacing.sm }}>
              Four widths is the Brooks difference — most running brands stop at one.
            </Txt>
          </View>
        )}

        {/* ------------------------------------------------------- PROMISE -- */}
        <RunHappyPromise />

        {/* ------------------------------------------------------- DETAILS -- */}
        <View style={styles.detailsSection}>
          <AccordionHeader
            label="Product details"
            open={detailsOpen}
            onPress={() => setDetailsOpen((open) => !open)}
          />
          {detailsOpen ? (
            <View style={styles.detailsPanel}>
              {product.description ? (
                <Txt variant="body" style={styles.detailsDescription}>
                  {product.description}
                </Txt>
              ) : null}

              {product.bestFor.length > 0 ? (
                <ProductDetailRow label="Best for">
                  <Txt variant="body">{product.bestFor.join(', ')}</Txt>
                </ProductDetailRow>
              ) : null}

              {product.cushion ? (
                <ProductDetailRow
                  label="Cushion"
                  icon={product.cushion === 'Balanced' ? <BalancedCushionIcon /> : undefined}
                >
                  <Txt variant="body">{product.cushion}</Txt>
                  {CUSHION_DESCRIPTION[product.cushion] ? (
                    <Txt variant="body" style={styles.detailSupportingText}>
                      {CUSHION_DESCRIPTION[product.cushion]}
                    </Txt>
                  ) : null}
                </ProductDetailRow>
              ) : null}

              {product.support ? (
                <ProductDetailRow
                  label="Support"
                  icon={
                    product.support === 'balanced_support' ? <BalancedSupportIcon /> : undefined
                  }
                >
                  <Txt variant="body">{supportLabel(product.support)}</Txt>
                  {SUPPORT_DESCRIPTION[product.support] ? (
                    <Txt variant="body" style={styles.detailSupportingText}>
                      {SUPPORT_DESCRIPTION[product.support]}
                    </Txt>
                  ) : null}
                </ProductDetailRow>
              ) : null}

              {product.features.length > 0 ? (
                <ProductDetailRow label="Features">
                  <Txt variant="body">{product.features.join(', ')}</Txt>
                </ProductDetailRow>
              ) : null}
            </View>
          ) : null}

          {reviewRating != null ? (
            <>
              <AccordionHeader
                label={`Reviews (${reviewCount})`}
                open={reviewsOpen}
                onPress={() => setReviewsOpen((open) => !open)}
                accessory={<Stars value={reviewRating} size={14} showSummary={false} />}
              />
              {reviewsOpen ? (
                <ReviewsPanel
                  rating={reviewRating}
                  count={reviewCount}
                  data={reviewData}
                  productUrl={product.url}
                />
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* ------------------------------------------------------ STICKY BAR -- */}
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          variant="purchase"
          title="Add to cart"
          accessory={price == null ? undefined : formatPrice(price)}
          disabled={!readyToAdd}
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

function RunHappyPromise() {
  return (
    <View style={styles.promiseBand}>
      <Image
        source={require('../../../assets/home/run-happy-promise.png')}
        style={styles.promiseSeal}
        contentFit="contain"
      />
      <View style={{ flex: 1 }}>
        <View style={styles.promiseTitleRow}>
          <Txt variant="eyebrow">90-day free returns</Txt>
          <InfoIcon size={14} />
        </View>
        <Txt variant="bodySmall" style={{ marginTop: spacing.xs }}>
          Take our gear for a 90-day test run. If you don’t love it, return it for free.
        </Txt>
      </View>
    </View>
  );
}

function AccordionHeader({
  label,
  open,
  onPress,
  accessory,
}: {
  label: string;
  open: boolean;
  onPress: () => void;
  accessory?: ReactNode;
}) {
  return (
    <Press
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      style={styles.accordionHeader}
    >
      <Txt variant="eyebrow" style={{ flex: 1 }}>
        {label}
      </Txt>
      {accessory ? <View style={styles.accordionAccessory}>{accessory}</View> : null}
      <BrooksIcon name={open ? 'caretUp' : 'caretDown'} size={16} color={colors.ink} />
    </Press>
  );
}

function ProductDetailRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelColumn}>
        <Txt variant="productTitle">{label}</Txt>
        {icon ? <View style={styles.detailIcon}>{icon}</View> : null}
      </View>
      <View style={styles.detailValueColumn}>{children}</View>
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
  },

  block: { paddingHorizontal: spacing.gutter, marginTop: spacing.xl },
  titleRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  // @ref LLP 0003#screen-patterns — Keep swatches aligned to the PDP gutter,
  // while the horizontal rail itself bleeds to the screen edges.
  colorRail: { marginTop: spacing.md, marginHorizontal: -spacing.gutter },
  colorRailContent: { paddingHorizontal: spacing.gutter },

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

  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: OPTION_GAP },
  sizeOption: { width: SIZE_OPTION_W },
  widthOption: { width: WIDTH_OPTION_W, paddingHorizontal: 0 },

  promiseBand: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  promiseSeal: { width: 68, height: 68 },
  promiseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  detailsSection: {
    marginHorizontal: spacing.gutter,
    marginTop: spacing.xxl,
    borderTopWidth: border.rule,
    borderTopColor: colors.inkMuted,
  },
  accordionHeader: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: border.rule,
    borderBottomColor: colors.inkMuted,
  },
  accordionAccessory: { marginLeft: 'auto' },
  detailsPanel: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: border.rule,
    borderBottomColor: colors.inkMuted,
  },
  detailsDescription: { marginBottom: spacing.xxl },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  detailLabelColumn: { width: 112, flexShrink: 0 },
  detailValueColumn: { flex: 1 },
  detailIcon: { marginTop: spacing.sm },
  detailSupportingText: { marginTop: spacing.sm },

  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: border.rule,
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

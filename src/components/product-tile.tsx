import { Link } from 'expo-router';
import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { heroImage } from '@/data/images';
import { priceRange } from '@/data/query';
import type { Product } from '@/data/types';
import { colors, radius, spacing } from '@/theme';
import { Badge } from '@/components/badge';
import { Press } from '@/components/press';
import { Price } from '@/components/price';
import { ShoeImage } from '@/components/shoe-image';
import { Stars } from '@/components/stars';
import { Txt } from '@/components/themed-text';
import { UnderlineRail } from '@/components/underline-rail';
import { select } from '@/utils/haptics';

/**
 * The catalog tile.
 *
 * @ref LLP 0003#tile — Colorway swatches live on the tile and swap its image in
 * place. This is the highest-value borrow in the whole survey: it lets someone
 * rule a shoe in or out on color without paying a navigation round-trip.
 * Selected color is an ink underline (`UnderlineRail`), not a boxed border.
 */

const SWATCHES_SHOWN = 4;
const SWATCH_GAP = spacing.xs;
// Apple HIG minimum touch target; the shortfall is made up with hitSlop, not size.
const MIN_TOUCH = 48;
function ProductTileImpl({
  product,
  width,
  index = 0,
}: {
  product: Product;
  width: number;
  index?: number;
}) {
  const [ci, setCi] = useState(0);
  const colorway = product.colors[ci] ?? product.colors[0];
  const { min, max } = priceRange(product);

  const isNew = product.badge === 'New Style';
  const soldOut = product.colors.every((c) => c.soldOut);

  // Four swatches plus the "+N" counter split the tile width into five slots,
  // so the swatch size scales with the tile instead of being fixed.
  const slot = Math.floor((width - SWATCH_GAP * SWATCHES_SHOWN) / (SWATCHES_SHOWN + 1));
  const slop = Math.max(0, Math.ceil((MIN_TOUCH - slot) / 2));
  const hiddenColors = product.colors.length - SWATCHES_SHOWN;

  return (
    <Link
      href={{
        pathname: '/product/[id]',
        params: { id: product.id, color: colorway.code },
      }}
      asChild
    >
      <Press style={StyleSheet.flatten([styles.card, { width }])} scaleTo={0.975}>
        <View style={{ width, height: width, marginBottom: spacing.xs }}>
          {/* Host View, not ShoeImage: AppleZoom slots native zoom props onto
              a single ref-capable child. @ref LLP 0003#tile */}
          <Link.AppleZoom>
            <View style={StyleSheet.flatten([styles.imageWrap, { width, height: width }])}>
              <ShoeImage
                url={heroImage(colorway.images)}
                width={width}
                height={width}
                priority={index < 4 ? 'high' : 'normal'}
                transition={0}
              />
            </View>
          </Link.AppleZoom>
          <View style={styles.badges} pointerEvents="none">
            {isNew ? <Badge label="New" variant="lime" /> : null}
            {product.onSale ? <Badge label="Sale" variant="sale" /> : null}
            {soldOut ? <Badge label="Sold out" /> : null}
          </View>
        </View>

        {product.colors.length > 1 ? (
          <UnderlineRail
            selectedIndex={ci}
            gap={SWATCH_GAP}
            style={styles.swatches}
            trailing={
              hiddenColors > 0 ? (
                <View style={[styles.swatchMore, { width: slot, height: slot }]}>
                  <Txt variant="tiny" c={colors.inkMuted}>
                    +{hiddenColors}
                  </Txt>
                </View>
              ) : null
            }
          >
            {product.colors.slice(0, SWATCHES_SHOWN).map((c, i) => (
              <Press
                key={c.code}
                haptic={false}
                scaleTo={0.85}
                hitSlop={slop}
                accessibilityRole="button"
                accessibilityState={{ selected: i === ci }}
                onPress={() => {
                  select();
                  setCi(i);
                }}
                style={[styles.swatch, { width: slot, height: slot }]}
              >
                <ShoeImage
                  url={heroImage(c.images)}
                  width={slot}
                  height={slot}
                  transition={0}
                />
              </Press>
            ))}
          </UnderlineRail>
        ) : (
          <View style={{ height: spacing.lg }} />
        )}

        <Txt variant="productTitle" numberOfLines={1}>
          {product.name}
        </Txt>
        <Txt variant="tiny" c={colors.inkMuted} numberOfLines={1} style={{ marginTop: 1 }}>
          {[product.cushion && `${product.cushion} cushion`, colorway.name]
            .filter(Boolean)
            .join(' · ')}
        </Txt>

        <View style={{ marginTop: 5 }}>
          {min === max ? (
            <Price value={min} listValue={product.listPrice} />
          ) : (
            <Txt variant="price">{`$${min} – $${max}`}</Txt>
          )}
        </View>
        {product.rating ? (
          <View style={{ marginTop: 3 }}>
            <Stars value={product.rating} count={product.reviewCount} />
          </View>
        ) : null}
      </Press>
    </Link>
  );
}

export const ProductTile = memo(ProductTileImpl);

const styles = StyleSheet.create({
  card: {},
  imageWrap: {
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  badges: { position: 'absolute', top: spacing.sm, left: spacing.sm, gap: 4, alignItems: 'flex-start' },
  swatches: { marginBottom: spacing.lg },
  swatch: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.none,
  },
  swatchMore: { alignItems: 'center', justifyContent: 'center' },
});

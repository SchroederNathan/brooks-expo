import { router } from 'expo-router';
import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { heroImage } from '../data/images';
import { priceRange } from '../data/query';
import type { Product } from '../data/types';
import { color, radius, space } from '../theme/tokens';
import { Badge, Press, Price, ShoeImage, Stars, Txt, select } from './primitives';

/**
 * The catalog tile.
 *
 * @ref LLP 0003#tile — Colorway swatches live on the tile and swap its image in
 * place. This is the highest-value borrow in the whole survey: it lets someone
 * rule a shoe in or out on color without paying a navigation round-trip, which is
 * exactly where Brooks's 8-colorway products otherwise punish the shopper.
 */
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

  return (
    <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 40).duration(280)}>
      <Press
        style={[styles.card, { width }]}
        scaleTo={0.975}
        onPress={() =>
          router.push({
            pathname: '/product/[id]',
            params: { id: product.id, color: colorway.code },
          })
        }
      >
        <View style={[styles.imageWrap, { width, height: width }]}>
          <ShoeImage
            url={heroImage(colorway.images)}
            width={width}
            height={width}
            priority={index < 4 ? 'high' : 'normal'}
          />
          <View style={styles.badges}>
            {isNew ? <Badge label="New" tone="lime" /> : null}
            {product.onSale ? <Badge label="Sale" tone="sale" /> : null}
            {soldOut ? <Badge label="Sold out" /> : null}
          </View>
        </View>

        {product.colors.length > 1 ? (
          <View style={styles.swatches}>
            {product.colors.slice(0, 5).map((c, i) => (
              <Press
                key={c.code}
                haptic={false}
                scaleTo={0.85}
                hitSlop={6}
                onPress={() => {
                  select();
                  setCi(i);
                }}
                style={[styles.swatch, i === ci && styles.swatchOn]}
              >
                <ShoeImage url={heroImage(c.images)} width={20} height={20} transition={0} />
              </Press>
            ))}
            {product.colors.length > 5 ? (
              <Txt variant="tiny" c={color.inkMuted} style={{ marginLeft: 2 }}>
                +{product.colors.length - 5}
              </Txt>
            ) : null}
          </View>
        ) : (
          <View style={{ height: 10 }} />
        )}

        <Txt variant="productTitle" numberOfLines={1}>
          {product.name}
        </Txt>
        <Txt variant="tiny" c={color.inkMuted} numberOfLines={1} style={{ marginTop: 1 }}>
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
    </Animated.View>
  );
}

export const ProductTile = memo(ProductTileImpl);

const styles = StyleSheet.create({
  card: {},
  imageWrap: {
    backgroundColor: color.surfaceAlt,
    overflow: 'hidden',
    marginBottom: space.sm,
  },
  badges: { position: 'absolute', top: space.sm, left: space.sm, gap: 4, alignItems: 'flex-start' },
  swatches: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 28 },
  swatch: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radius.none,
  },
  swatchOn: { borderColor: color.blue },
});

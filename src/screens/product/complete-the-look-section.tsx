import { Link, router } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { Dimensions, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/button';
import { Press } from '@/components/press';
import { ShoeImage } from '@/components/shoe-image';
import { Txt } from '@/components/themed-text';
import { ZoomSource } from '@/components/zoom-source';
import { catalog } from '@/data/catalog';
import { heroImage } from '@/data/images';
import type { Colorway, Product } from '@/data/types';
import { colors, font, spacing } from '@/theme';
import { fmt } from '@/utils/format-price';

import {
  completeTheLook,
  laydownImage,
  lookColorway,
  priceOf,
  SLOT_LABEL,
  type LookPiece,
} from './complete-the-look';

const { width: W } = Dimensions.get('window');
const SIDE = W - spacing.gutter * 2;

/**
 * Where each piece lies on the card, as fractions of its side. The product
 * itself always takes the bottom-right spot, the largest one.
 */
const SPOTS = [
  { left: 0.03, top: 0.03, size: 0.5 },
  { left: 0.5, top: 0.08, size: 0.46 },
  { left: 0.06, top: 0.56, size: 0.38 },
] as const;
const ANCHOR = { left: 0.42, top: 0.55, width: 0.56, height: 0.42 } as const;

/**
 * "Complete the look" on the PDP: the product laid out with a top, a bottom
 * and socks (or, under apparel, a shoe and the other pieces), and one button
 * that opens the Shop the look sheet to add them all.
 *
 * @ref LLP 0003#complete-the-look — Nike's outfit card on one `surfaceAlt`
 * field, the colour Brooks shoots on, so laydown photos sit in it without
 * edges. Each piece wears a square price tag and still opens its own PDP. The
 * picks are the most-reviewed piece per slot, the same for every reader, so
 * the copy never says "for you".
 */
export function CompleteTheLookSection({
  product,
  colorway,
  size,
  width,
}: {
  product: Product;
  /** The colorway the reader has picked on this PDP. */
  colorway: Colorway;
  /** The fit picked on this PDP, if any; the sheet starts the product on it. */
  size: string | null;
  width: string | null;
}) {
  const pieces = useMemo(() => completeTheLook(catalog, product), [product]);
  if (!pieces.length) return null;

  const anchorLabel = product.productType === 'Shoes' ? 'This shoe' : 'This piece';
  const total = [priceOf(product, colorway), ...pieces.map((p) => priceOf(p.product, lookColorway(p.product)))]
    .filter((v): v is number => v != null)
    .reduce((a, b) => a + b, 0);

  const openSheet = () =>
    router.push({
      pathname: '/shop-the-look',
      params: { id: product.id, color: colorway.code, size: size ?? '', width: width ?? '' },
    });

  return (
    <View style={styles.section}>
      <Txt variant="h3" accessibilityRole="header">
        Complete the look
      </Txt>
      <Txt variant="bodySmall" c={colors.inkMuted} style={styles.subline}>
        Our most-reviewed gear to run in with it.
      </Txt>

      <View style={styles.card}>
        {pieces.map((piece, i) => {
          const spot = SPOTS[i];
          const px = Math.round(SIDE * spot.size);
          const c = lookColorway(piece.product);
          return (
            <PieceLink
              key={piece.product.id}
              piece={piece}
              colorway={c}
              style={[styles.piece, { left: SIDE * spot.left, top: SIDE * spot.top }]}
            >
              <ZoomSource width={px} height={px}>
                <ShoeImage url={laydownImage(c)} width={px} transition={0} />
              </ZoomSource>
              <View style={styles.tag}>
                <Txt variant="tiny" style={styles.tagText}>
                  {fmt(priceOf(piece.product, c))}
                </Txt>
              </View>
            </PieceLink>
          );
        })}
        <View
          style={[styles.piece, { left: SIDE * ANCHOR.left, top: SIDE * ANCHOR.top }]}
          accessible
          accessibilityLabel={`${anchorLabel}: ${product.name}`}
        >
          <ShoeImage
            url={heroImage(colorway.images)}
            width={Math.round(SIDE * ANCHOR.width)}
            height={Math.round(SIDE * ANCHOR.height)}
            transition={0}
          />
          <View style={[styles.tag, styles.anchorTag]}>
            <Txt variant="tiny" c={colors.surface} style={styles.tagText}>
              {anchorLabel}
            </Txt>
          </View>
        </View>
      </View>

      <Button
        title="Shop the look"
        variant="secondary"
        accessory={`${pieces.length + 1} pieces · ${fmt(total)}`}
        style={styles.cta}
        onPress={openSheet}
      />
    </View>
  );
}

/** A piece that opens its own PDP, its photo zooming into the gallery on iOS. */
function PieceLink({
  piece,
  colorway,
  style,
  children,
}: {
  piece: LookPiece;
  /** The colorway the piece shows, and so the one its PDP opens on. */
  colorway: Colorway;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <Link
      href={{ pathname: '/product/[id]', params: { id: piece.product.id, color: colorway.code } }}
      asChild
    >
      {/* `Link asChild` rejects a style array on its child. */}
      <Press
        accessibilityRole="link"
        accessibilityLabel={`${SLOT_LABEL[piece.slot]}: ${piece.product.name}, ${fmt(priceOf(piece.product, colorway))}`}
        scaleTo={0.97}
        style={StyleSheet.flatten(style)}
      >
        {children}
      </Press>
    </Link>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxxl, paddingHorizontal: spacing.gutter },
  subline: { marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { width: SIDE, height: SIDE, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  piece: { position: 'absolute' },
  tag: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.surface,
  },
  anchorTag: { backgroundColor: colors.ink, left: undefined, right: spacing.sm },
  tagText: { fontFamily: font.bold, letterSpacing: 0.6, textTransform: 'uppercase' },
  cta: { marginTop: spacing.lg },
});

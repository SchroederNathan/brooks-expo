import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { BrooksIcon } from '@/components/icons';
import { Press } from '@/components/press';
import { ShoeImage } from '@/components/shoe-image';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { heroImage } from '@/data/images';
import { byId, colorwayOf } from '@/data/query';
import type { Colorway, Product } from '@/data/types';
import { useCart, type CartLine } from '@/store/cart';
import { border, colors, headerIcon, nativeSheetHeader, spacing } from '@/theme';
import { fmt } from '@/utils/format-price';

import {
  completeTheLook,
  defaultWidth,
  laydownImage,
  lookColorway,
  priceOf,
  SLOT_LABEL,
  slotOf,
  type LookSlot,
} from './complete-the-look';

const THUMB = 72;
const CHECK = 24;
const SIZE_CHIP = 56;
const SIZE_STEP = SIZE_CHIP + spacing.xs;
/** The size row's first chip sits under the thumb, past the checkbox. */
const SIZES_LEAD = spacing.gutter + CHECK + spacing.md;
const { width: SCREEN_W } = Dimensions.get('window');

/** One line of the look: the PDP's own product first, then each piece. */
interface Row {
  product: Product;
  colorway: Colorway;
  /** `This shoe` / `This piece` for the PDP's product, else the slot. */
  label: string;
  /** Where the starting size came from, said under the chips. */
  sizeFrom: 'page' | 'bag' | null;
  image: string;
}

/** Slots whose letter sizes mean the same body: a bag's M top says M shorts. */
const GARMENT: LookSlot[] = ['top', 'bottom', 'layer'];

/**
 * The size this reader already chose for the same kind of piece, from the
 * most recent line in the bag that has it in stock in this colorway.
 *
 * @ref LLP 0003#shop-the-look — The reader's own earlier choice, not a
 * prediction: socks only from socks, shoes only from shoes, and a top, bottom
 * or layer from any of the three. A size the colorway does not stock is skipped.
 */
function sizeFromBag(lines: CartLine[], product: Product, colorway: Colorway) {
  const slot = slotOf(product);
  if (!slot) return null;
  const same = (s: LookSlot | null) =>
    s === slot || (s != null && GARMENT.includes(s) && GARMENT.includes(slot));
  const line = [...lines]
    .sort((a, b) => b.addedAt - a.addedAt)
    .find((l) => {
      const p = byId(catalog, l.productId);
      return p && same(slotOf(p)) && colorway.sizes.some((s) => s.value === l.size && s.available);
    });
  return line ? { size: line.size, width: line.width } : null;
}

/**
 * Shop the look: every piece of the PDP's "Complete the look" with a size row
 * each, and one button that adds the checked pieces to the bag.
 *
 * @ref LLP 0003#shop-the-look — Ulta's "Now wearing" list and Instacart's
 * "Add all" in the Filter & sort sheet's frame: a native form sheet with the
 * title and close in the native bar on iOS, no rules, and a footer
 * button. The button counts the checked pieces and carries their sum;
 * pressed with a size missing, it marks those rows instead of adding. The
 * total is a plain sum: the catalog has no bundle prices (LLP 0002).
 *
 * Once added, the same sheet confirms what went in, with `Keep shopping` and
 * `Bag (n)` as the add-to-bag sheet has them. The confirmation lives here,
 * not in that sheet: that sheet grows out of `Add to cart`, which the reader
 * did not press.
 */
export function ShopTheLookSheet({
  id,
  color,
  size: pageSize,
  width: pageWidth,
}: {
  id: string;
  color?: string;
  size?: string;
  width?: string;
}) {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const product = byId(catalog, id);

  const rows = useMemo<Row[]>(() => {
    if (!product) return [];
    const own = colorwayOf(product, color) ?? product.colors[0];
    return [
      {
        product,
        colorway: own,
        label: product.productType === 'Shoes' ? 'This shoe' : 'This piece',
        sizeFrom: pageSize ? 'page' : null,
        image: heroImage(own.images),
      },
      ...completeTheLook(catalog, product).map((piece) => {
        const c = lookColorway(piece.product);
        return {
          product: piece.product,
          colorway: c,
          label: SLOT_LABEL[piece.slot],
          sizeFrom: null,
          image: laydownImage(c),
        };
      }),
    ];
    // Built once per opening: the bag changing under the sheet must not reset it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, color]);

  /** Starting fit per row: the PDP's own pick, then the bag, then nothing. */
  const [fit, setFit] = useState<Record<string, { size: string | null; width: string | null; from: Row['sizeFrom'] }>>(
    () =>
      Object.fromEntries(
        rows.map((r, i) => {
          const fromPage = i === 0 && pageSize ? { size: pageSize, width: pageWidth || null } : null;
          const fromBag = fromPage ? null : sizeFromBag(cart.lines, r.product, r.colorway);
          const start = fromPage ?? fromBag;
          return [
            r.product.id,
            {
              size: start?.size ?? null,
              width: start?.width && r.colorway.widths.some((w) => w.value === start.width && w.available)
                ? start.width
                : defaultWidth(r.colorway),
              from: fromPage ? 'page' : fromBag ? 'bag' : null,
            },
          ];
        })
      )
  );
  /** Pieces the bag already holds, in any colorway or size. */
  const [inBag] = useState(() => new Set(cart.lines.map((l) => l.productId)));
  /** Every piece starts checked, except one the bag already holds: no doubles. */
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(rows.map((r) => [r.product.id, !inBag.has(r.product.id)]))
  );
  /** Set once the pieces are in the bag; the sheet then confirms them. */
  const [added, setAdded] = useState<Row[] | null>(null);
  /** Set by an add with a size missing: those rows then ask for one, in red. */
  const [needsSize, setNeedsSize] = useState(false);
  const listRef = useRef<ScrollView>(null);
  /** Each row's top in the list, to scroll to the first one missing a size. */
  const rowY = useRef<Record<string, number>>({});
  /**
   * The sheet's native bar covers the top of the list. The list pads itself
   * by the bar's height instead of letting UIKit inset it: with UIKit's
   * inset, the top of the list sits at a negative offset, and `scrollTo`
   * clamps negative offsets to 0, which left the first row under the bar.
   * Android's sheet has no bar, and the list starts under its own head.
   */
  const headerHeight = useHeaderHeight();
  const insetTop = nativeSheetHeader ? headerHeight : 0;
  /** The footer floats over the list's end; the list pads by its height. */
  const [footerH, setFooterH] = useState(0);

  const picked = rows.filter((r) => checked[r.product.id]);
  const missing = picked.filter((r) => !fit[r.product.id]?.size);
  const total = picked
    .map((r) => priceOf(r.product, r.colorway))
    .filter((v): v is number => v != null)
    .reduce((a, b) => a + b, 0);

  // @ref LLP 0003#shop-the-look — The button stays live with a size missing,
  // as the PDP's does: pressing it marks each row that still needs one and
  // scrolls to the first, instead of a grey button that does not say why.
  const addAll = () => {
    if (missing.length) {
      setNeedsSize(true);
      const y = rowY.current[missing[0].product.id];
      if (y != null) listRef.current?.scrollTo({ y: y - insetTop - spacing.sm, animated: true });
      return;
    }
    for (const r of picked) {
      const f = fit[r.product.id];
      if (!f?.size) return;
      cart.add({
        productId: r.product.id,
        colorCode: r.colorway.code,
        size: f.size,
        // Apparel has no widths; the variant id still wants one (as on the PDP).
        width: f.width ?? r.colorway.widths.find((w) => w.available)?.value ?? '1D',
      });
    }
    setAdded(picked);
  };

  const title = added ? 'Added to your bag' : 'Shop the look';

  if (!product) return null;

  return (
    <View collapsable={false} style={styles.root}>
      {nativeSheetHeader ? (
        <>
          <Stack.Screen options={{ title }} />
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              icon={headerIcon.close}
              accessibilityLabel="Close"
              onPress={() => router.back()}
            />
          </Stack.Toolbar>
          {/* Takes the head's place as the first native subview, so
              react-native-screens does not size the list to the whole sheet
              (see the Filter & sort sheet). */}
          <View collapsable={false} />
        </>
      ) : (
        <View style={styles.head}>
          <Txt variant="h2">{title}</Txt>
          <Press accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={() => router.back()}>
            <BrooksIcon name="closeThin" size={22} color={colors.ink} />
          </Press>
        </View>
      )}

      <View collapsable={false} style={styles.scroll}>
        <ScrollView
          ref={listRef}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[styles.body, { paddingTop: insetTop, paddingBottom: footerH }]}
          showsVerticalScrollIndicator={false}
        >
          {added
            ? added.map((r) => (
                <AddedRow key={r.product.id} row={r} fit={fit[r.product.id]} />
              ))
            : rows.map((r) => (
                <PieceRow
                  key={r.product.id}
                  row={r}
                  needsSize={needsSize && !!checked[r.product.id] && !fit[r.product.id]?.size}
                  onLayout={(y) => {
                    rowY.current[r.product.id] = y;
                  }}
                  checked={!!checked[r.product.id]}
                  inBag={inBag.has(r.product.id)}
                  fit={fit[r.product.id]}
                  onToggle={() => setChecked((c) => ({ ...c, [r.product.id]: !c[r.product.id] }))}
                  onSize={(size) =>
                    setFit((f) => ({ ...f, [r.product.id]: { ...f[r.product.id], size, from: null } }))
                  }
                />
              ))}
        </ScrollView>
      </View>

      {/* @ref LLP 0003#add-to-bag-sheet — The PDP's sticky bar, again: no
          panel of its own, the list fades to white behind the button. The
          band is `box-none`, so the faded part still passes taps to the list. */}
      <View
        pointerEvents="box-none"
        onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0)', colors.surface]}
          locations={[0, 0.5]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {added ? (
          <View style={styles.footerPair}>
            <Button title="Keep shopping" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
            <Button
              title={`Bag (${cart.count})`}
              style={{ flex: 1 }}
              // From a form sheet `navigate` mounts the tabs inside the sheet;
              // `dismissTo` closes the sheet and the PDP, then shows the bag.
              onPress={() => router.dismissTo('/cart')}
            />
          </View>
        ) : (
          // Disabled only with nothing checked: there is then nothing to add.
          <Button
            variant="purchase"
            title={picked.length ? `Add ${picked.length} to bag` : 'Pick a piece'}
            accessory={picked.length ? fmt(total) : undefined}
            disabled={!picked.length}
            onPress={addAll}
          />
        )}
      </View>
    </View>
  );
}

function PieceRow({
  row,
  needsSize,
  onLayout,
  checked,
  inBag,
  fit,
  onToggle,
  onSize,
}: {
  row: Row;
  needsSize: boolean;
  onLayout: (y: number) => void;
  checked: boolean;
  inBag: boolean;
  fit: { size: string | null; width: string | null; from: Row['sizeFrom'] };
  onToggle: () => void;
  onSize: (size: string) => void;
}) {
  const { product, colorway } = row;
  const widthLabel = fit.width ? colorway.widths.find((w) => w.value === fit.width)?.label : undefined;
  const sizeLabel = fit.size ? colorway.sizes.find((s) => s.value === fit.size)?.label : undefined;

  // A shoe has 15+ sizes: if the picked one would start off screen, open the
  // row on it, with one chip of context before it. Read once, so picking
  // another size does not move the row under the finger.
  const [startX] = useState(() => {
    const i = colorway.sizes.findIndex((s) => s.value === fit.size);
    const end = SIZES_LEAD + (i + 1) * SIZE_STEP;
    return i > 1 && end > SCREEN_W - spacing.gutter ? (i - 1) * SIZE_STEP : 0;
  });

  return (
    <View style={styles.row} onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>
      <Press
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={`${row.label}: ${product.name}, ${fmt(priceOf(product, colorway))}`}
        onPress={onToggle}
        style={styles.rowHead}
      >
        <View style={[styles.check, checked && styles.checkOn]}>
          {checked ? <BrooksIcon name="checkmarkNoCircle" size={11} color={colors.surface} thicken={0.6} /> : null}
        </View>
        <View style={[styles.thumb, !checked && styles.off]}>
          <ShoeImage url={row.image} width={THUMB} transition={0} />
        </View>
        <View style={styles.rowText}>
          {/* Faded when unchecked, all but the in-bag note: it is the reason. */}
          <View style={[styles.rowText, !checked && styles.off]}>
            <Txt variant="eyebrow" c={colors.inkMuted}>
              {row.label}
            </Txt>
            <Txt variant="productTitle" numberOfLines={2}>
              {product.name}
            </Txt>
            <Txt variant="caption" c={colors.inkMuted} numberOfLines={1}>
              {[colorway.name, widthLabel].filter(Boolean).join(' · ')}
            </Txt>
          </View>
          {inBag ? (
            <Txt variant="tiny" c={colors.success} style={styles.inBag}>
              Already in your bag
            </Txt>
          ) : null}
        </View>
        <Txt variant="price" style={!checked && styles.off}>
          {fmt(priceOf(product, colorway))}
        </Txt>
      </Press>

      {checked ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: startX, y: 0 }}
            style={styles.sizes}
            contentContainerStyle={styles.sizesContent}
          >
            {colorway.sizes.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                appearance="productOption"
                selected={fit.size === s.value}
                disabled={!s.available}
                style={styles.sizeChip}
                onPress={() => onSize(s.value)}
              />
            ))}
          </ScrollView>
          {needsSize ? (
            <Txt variant="tiny" c={colors.sale} style={styles.from}>
              Pick a size
            </Txt>
          ) : fit.from && sizeLabel ? (
            <Txt variant="tiny" c={colors.inkMuted} style={styles.from}>
              {fit.from === 'page' ? `Size ${sizeLabel}, as picked on this page` : `Size ${sizeLabel}, as in your bag`}
            </Txt>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function AddedRow({ row, fit }: { row: Row; fit: { size: string | null; width: string | null } }) {
  const { product, colorway } = row;
  const sizeLabel = colorway.sizes.find((s) => s.value === fit.size)?.label ?? fit.size;
  const widthLabel = fit.width ? colorway.widths.find((w) => w.value === fit.width)?.label : undefined;
  return (
    <View style={[styles.row, styles.rowHead]}>
      <View style={styles.thumb}>
        <ShoeImage url={row.image} width={THUMB} transition={0} />
      </View>
      <View style={styles.rowText}>
        <Txt variant="productTitle" numberOfLines={2}>
          {product.name}
        </Txt>
        <Txt variant="caption" c={colors.inkMuted} numberOfLines={1}>
          {colorway.name}
        </Txt>
        <Txt variant="caption" c={colors.inkMuted} numberOfLines={1}>
          {[`Size ${sizeLabel}`, widthLabel].filter(Boolean).join(' · ')}
        </Txt>
      </View>
      <Txt variant="price">{fmt(priceOf(product, colorway))}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  head: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  scroll: { flex: 1 },
  body: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl },
  /** No rules anywhere in the list: whitespace separates the rows. */
  row: { paddingVertical: spacing.lg },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: {
    width: CHECK,
    height: CHECK,
    borderWidth: border.rule,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.ink },
  thumb: { width: THUMB, height: THUMB, backgroundColor: colors.surfaceAlt },
  rowText: { flex: 1, gap: 2 },
  off: { opacity: 0.4 },
  inBag: { marginTop: 2 },
  // The size row bleeds to the sheet's edges, its first chip under the thumb.
  sizes: { marginTop: spacing.md, marginHorizontal: -spacing.gutter },
  sizesContent: {
    paddingLeft: SIZES_LEAD,
    paddingRight: spacing.gutter,
    gap: spacing.xs,
  },
  sizeChip: { width: SIZE_CHIP },
  from: { marginTop: spacing.sm, marginLeft: CHECK + spacing.md },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xxxl,
  },
  footerPair: { flexDirection: 'row', gap: spacing.md },
});

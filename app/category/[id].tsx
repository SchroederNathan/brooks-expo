import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterSheet, SORT_OPTIONS, countActiveFilters } from '../../src/components/FilterSheet';
import { ProductTile } from '../../src/components/ProductTile';
import { Chip, Press, Squiggle, Txt } from '../../src/components/primitives';
import { catalog } from '../../src/data/catalog';
import {
  applyFilters,
  productsIn,
  sortProducts,
  type Filters,
  type SortKey,
} from '../../src/data/query';
import type { Product } from '../../src/data/types';
import { color, space } from '../../src/theme/tokens';

const { width: W } = Dimensions.get('window');
const GRID_GAP = space.lg;
const TILE_W = Math.floor((W - space.gutter * 2 - GRID_GAP) / 2);
/** Where the large title sits; past it the bar title fades in. */
const TITLE_ZONE = 64;

/**
 * The PLP.
 *
 * @ref LLP 0003#plp — Zappos's utility with adidas's rhythm: a collapsing large
 * title, a control row with `Filter (n)` and franchise quick-chips, a 2-up grid
 * of ProductTiles, and a full-height filter sheet with a live result count.
 */
export default function Category() {
  const { id, title, franchise } = useLocalSearchParams<{
    id: string;
    title?: string;
    franchise?: string;
  }>();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<SortKey>('featured');
  const [activeFranchise, setActiveFranchise] = useState<string | null>(
    franchise ? String(franchise) : null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const base = useMemo(() => productsIn(catalog, String(id)), [id]);

  /** Franchise chips: the franchises actually present here, biggest first. */
  const franchises = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of base) if (p.franchise) m.set(p.franchise, (m.get(p.franchise) ?? 0) + 1);
    return [...m.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([f]) => f);
  }, [base]);

  const inFranchise = useMemo(
    () => (activeFranchise ? base.filter((p) => p.franchise === activeFranchise) : base),
    [base, activeFranchise]
  );
  const products = useMemo(
    () => sortProducts(applyFilters(inFranchise, filters), sort),
    [inFranchise, filters, sort]
  );

  const nFilters = countActiveFilters(filters);
  const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? 'Featured';
  const screenTitle = title ? String(title) : 'Shop';

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const barTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [TITLE_ZONE - 14, TITLE_ZONE + 18], [0, 1], 'clamp'),
  }));

  return (
    <View style={styles.root}>
      {/* Bar: back, collapsed title, search. Sits on white above the grid. */}
      <View style={[styles.bar, { paddingTop: insets.top }]}>
        <View style={styles.barRow}>
          <Press onPress={() => router.back()} scaleTo={0.9} hitSlop={10} style={styles.barBtn}>
            <Txt variant="h3">‹</Txt>
          </Press>
          <Animated.View style={[styles.barTitle, barTitleStyle]}>
            <Txt variant="productTitle" numberOfLines={1}>
              {screenTitle}
            </Txt>
          </Animated.View>
          <Press
            onPress={() => router.push('/search')}
            scaleTo={0.9}
            hitSlop={10}
            style={styles.barBtn}
          >
            <Txt variant="h3">⌕</Txt>
          </Press>
        </View>

        {/* Control row — stays put while the grid scrolls. */}
        <View style={styles.controls}>
          <Chip
            label={nFilters ? `Filter (${nFilters})` : 'Filter'}
            size="sm"
            selected={nFilters > 0}
            onPress={() => setSheetOpen(true)}
          />
          <Chip label={`Sort · ${sortLabel}`} size="sm" onPress={() => setSheetOpen(true)} />
          {franchises.length > 1 && <View style={styles.controlDivider} />}
          {franchises.length > 1 && (
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: space.sm, paddingRight: space.gutter }}
            >
              {franchises.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  size="sm"
                  selected={activeFranchise === f}
                  onPress={() => setActiveFranchise(activeFranchise === f ? null : f)}
                />
              ))}
            </Animated.ScrollView>
          )}
        </View>
      </View>

      <Animated.FlatList
        data={products}
        keyExtractor={(p: Product) => p.id}
        numColumns={2}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: GRID_GAP, paddingHorizontal: space.gutter }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, gap: space.xl }}
        ListHeaderComponent={
          <View style={styles.head}>
            <Txt variant="h1">{activeFranchise ?? screenTitle}</Txt>
            <Txt variant="caption" c={color.inkMuted} style={{ marginTop: 4 }}>
              {products.length} {products.length === 1 ? 'style' : 'styles'}
            </Txt>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Txt variant="eyebrow" c={color.inkMuted}>
              Nothing here yet
            </Txt>
            <Squiggle />
            <Txt variant="body" c={color.inkMuted} style={{ textAlign: 'center' }}>
              No styles match that combination. Try clearing a filter.
            </Txt>
            <Chip
              label="Clear filters"
              style={{ marginTop: space.lg }}
              onPress={() => {
                setFilters({});
                setActiveFranchise(null);
              }}
            />
          </View>
        }
        renderItem={({ item, index }) => <ProductTile product={item} width={TILE_W} index={index} />}
      />

      <FilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        products={inFranchise}
        filters={filters}
        sort={sort}
        onApply={(f, s) => {
          setFilters(f);
          setSort(s);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.surface },
  bar: {
    backgroundColor: color.surface,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: color.hairline,
  },
  barRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
  },
  barBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  barTitle: { flex: 1, alignItems: 'center' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.gutter,
    paddingBottom: space.md,
  },
  controlDivider: { width: 1, height: 22, backgroundColor: color.hairline },
  head: { paddingHorizontal: space.gutter, paddingTop: space.lg, paddingBottom: space.sm },
  empty: {
    alignItems: 'center',
    paddingHorizontal: space.xxl,
    paddingTop: 80,
  },
});

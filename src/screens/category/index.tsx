import { router, Stack } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterSheet, SORT_OPTIONS, countActiveFilters } from '@/screens/category/filter-sheet';
import { ProductTile } from '@/components/product-tile';
import { Chip } from '@/components/chip';
import { Squiggle } from '@/components/squiggle';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import {
  applyFilters,
  productsIn,
  sortProducts,
  type Filters,
  type SortKey,
} from '@/data/query';
import type { Product } from '@/data/types';
import { requestSearchFocus } from '@/store/search-focus';
import { colors, headerIcon, spacing } from '@/theme';

const { width: W } = Dimensions.get('window');
const GRID_GAP = spacing.lg;
const TILE_W = Math.floor((W - spacing.gutter * 2 - GRID_GAP) / 2);
/** Where the large title sits; past it the bar title appears. */
const TITLE_ZONE = 64;

/**
 * The PLP.
 *
 * @ref LLP 0003#plp — Zappos's utility with adidas's rhythm: a collapsing large
 * title, a control row with `Filter (n)` and franchise quick-chips, a 2-up grid
 * of ProductTiles, and a full-height filter sheet with a live result count.
 */
export function Category({
  id,
  title,
  franchise,
}: {
  id: string;
  title?: string;
  franchise?: string;
}) {
  const insets = useSafeAreaInsets();
  // The bar is transparent and this screen pays for its own top inset, so the
  // layout does not move when a zoom transition paints it. @ref header.plain
  const headerHeight = useHeaderHeight();
  const [showBarTitle, setShowBarTitle] = useState(false);

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

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = e.nativeEvent.contentOffset.y > TITLE_ZONE;
    if (next !== showBarTitle) setShowBarTitle(next);
  };

  return (
    <View style={styles.root}>
      {/* The stack's own bar carries back and search now. Its title stays empty
          until the in-content large title has scrolled away, which is the
          collapse this screen always had — the row that used to draw it is
          gone. @ref LLP 0003#pushed-screens-wear-the-native-header */}
      <Stack.Screen options={{ headerTitle: showBarTitle ? screenTitle : '' }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={headerIcon.search}
          accessibilityLabel="Search"
          onPress={() => {
            requestSearchFocus();
            router.navigate('/(tabs)/(shop)/shop');
          }}
        />
      </Stack.Toolbar>

      {/* Control row — stays put while the grid scrolls. Its white runs up
          behind the transparent bar, which is where the bar's surface comes
          from. */}
      <View style={[styles.controls, { paddingTop: headerHeight + spacing.sm }]}>
        <Chip
          label={nFilters ? `Filter (${nFilters})` : 'Filter'}
          size="sm"
          selected={nFilters > 0}
          onPress={() => setSheetOpen(true)}
        />
        <Chip label={`Sort · ${sortLabel}`} size="sm" onPress={() => setSheetOpen(true)} />
        {franchises.length > 1 && <View style={styles.controlDivider} />}
        {franchises.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.gutter }}
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
          </ScrollView>
        )}
      </View>

      <FlatList
        data={products}
        keyExtractor={(p: Product) => p.id}
        numColumns={2}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: GRID_GAP, paddingHorizontal: spacing.gutter }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, gap: spacing.xl }}
        ListHeaderComponent={
          <View style={styles.head}>
            <Txt variant="h1">{activeFranchise ?? screenTitle}</Txt>
            <Txt variant="caption" c={colors.inkMuted} style={{ marginTop: 4 }}>
              {products.length} {products.length === 1 ? 'style' : 'styles'}
            </Txt>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Txt variant="eyebrow" c={colors.inkMuted}>
              Nothing here yet
            </Txt>
            <Squiggle />
            <Txt variant="body" c={colors.inkMuted} style={{ textAlign: 'center' }}>
              No styles match that combination. Try clearing a filter.
            </Txt>
            <Chip
              label="Clear filters"
              style={{ marginTop: spacing.lg }}
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
  root: { flex: 1, backgroundColor: colors.surface },
  /**
   * The one bar this screen still draws. Back, title, and search moved to the
   * native header; what is left is the filter/sort row, which is screen content
   * a UINavigationBar has no slot for.
   */
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    zIndex: 10,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  controlDivider: { width: 1, height: 22, backgroundColor: colors.hairline },
  head: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: 80,
  },
});

import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { FilterButton } from '@/components/filter-button';
import { OUTLINE_BUTTON_SIZE, OutlineIconButton } from '@/components/outline-icon-button';
import { ProductTile } from '@/components/product-tile';
import { useScreenTopPadding } from '@/components/screen';
import { Squiggle } from '@/components/squiggle';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { productsIn } from '@/data/query';
import {
  applySearchFilters,
  countSearchFilters,
  SEARCH_SORTS,
  sortSearchResults,
} from '@/data/search-query';
import type { Product } from '@/data/types';
import {
  clearSearchFilterState,
  patchSearchFilterState,
  useSearchFilterState,
} from '@/store/search-filters';
import { colors, motion, spacing } from '@/theme';

const { width: W } = Dimensions.get('window');
const GRID_GAP = spacing.lg;
const TILE_W = Math.floor((W - spacing.gutter * 2 - GRID_GAP) / 2);
/** Where the large title sits; past it the bar title appears. */
const TITLE_ZONE = 64;

/**
 * The PLP.
 *
 * @ref LLP 0003#plp — Zappos's utility with adidas's rhythm: a collapsing large
 * title over a 2-up grid of ProductTiles. [observed 2026-08-28] The chrome
 * above the grid is one row of Browse's outlined squares — back on the left,
 * `Filter & sort` on the right — and the filter panel is the same form sheet
 * Search opens (`/search-filters`), fed through `store/search-filters`.
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
  // No native bar: this screen draws its own, so it takes the same safe-area
  // rhythm as the headerless anchors and owns every pixel of its top band.
  // @ref LLP 0003#pushed-screens-wear-the-native-header
  const paddingTop = useScreenTopPadding();
  const reduceMotion = useReducedMotion();
  const [showBarTitle, setShowBarTitle] = useState(false);
  const barTitle = useSharedValue(0);
  useEffect(() => {
    barTitle.set(withTiming(showBarTitle ? 1 : 0, { duration: reduceMotion ? 0 : motion.base }));
  }, [showBarTitle, barTitle, reduceMotion]);
  const barTitleStyle = useAnimatedStyle(() => ({ opacity: barTitle.get() }));

  const { filters, sort } = useSearchFilterState();
  const nFilters = countSearchFilters(filters);

  /** The category, narrowed to one franchise when a franchise tile opened it. */
  const base = useMemo(() => {
    const all = productsIn(catalog, String(id));
    return franchise ? all.filter((p) => p.franchise === franchise) : all;
  }, [id, franchise]);
  const products = useMemo(
    () => sortSearchResults(applySearchFilters(base, filters), sort),
    [base, filters, sort]
  );

  const sortLabel = SEARCH_SORTS.find((o) => o.key === sort)?.label ?? '';
  const screenTitle = franchise ?? (title ? String(title) : 'Shop');

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = e.nativeEvent.contentOffset.y > TITLE_ZONE;
    if (next !== showBarTitle) setShowBarTitle(next);
  };

  /**
   * The sheet counts and facets whatever `candidates` holds, so this screen
   * hands it the category just before presenting. Set on press rather than on
   * mount because Browse's results, still mounted under this push, own the
   * same slot while they are on screen.
   */
  const openFilters = () => {
    patchSearchFilterState({ candidates: base });
    router.push('/search-filters');
  };

  return (
    <View style={styles.root}>
      {/* The app's own bar: back and `Filter & sort` as the outlined squares
          that flank Browse's search field, so a push out of Browse keeps the
          controls it left. The title fades in between them once the in-content
          large title has scrolled away — the same 64pt collapse this screen
          always had. @ref LLP 0003#pushed-screens-wear-the-native-header */}
      <View style={[styles.bar, { paddingTop }]}>
        <OutlineIconButton
          icon="caretLeft"
          iconSize={18}
          accessibilityLabel="Back"
          onPress={() => router.back()}
        />
        <Animated.View style={[styles.barTitle, barTitleStyle]} pointerEvents="none">
          <Txt variant="barTitle" numberOfLines={1}>
            {screenTitle}
          </Txt>
        </Animated.View>
        <FilterButton count={nFilters} onPress={openFilters} />
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
            <Txt variant="h1">{screenTitle}</Txt>
            <Txt variant="caption" c={colors.inkMuted} style={{ marginTop: 4 }}>
              {products.length} {products.length === 1 ? 'style' : 'styles'}
              {sort !== 'recommended' ? ` · ${sortLabel}` : ''}
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
              No styles match those filters. Try clearing one.
            </Txt>
            <Chip
              label="Clear filters"
              style={{ marginTop: spacing.lg }}
              onPress={clearSearchFilterState}
            />
          </View>
        }
        renderItem={({ item, index }) => <ProductTile product={item} width={TILE_W} index={index} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  /**
   * Back, collapsing title, `Filter & sort` — one row of Browse's outlined
   * squares, on the screen's white. The only chrome above the grid.
   */
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    zIndex: 10,
  },
  barTitle: {
    flex: 1,
    height: OUTLINE_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  head: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: 80,
  },
});

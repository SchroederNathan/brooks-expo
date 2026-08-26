import { Link, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrooksIcon } from '@/components/icons';
import { Photo } from '@/components/photo';
import { Press } from '@/components/press';
import { ScreenHeading, ScreenScrollView } from '@/components/screen';
import { Txt } from '@/components/themed-text';
import { ZoomSource } from '@/components/zoom-source';
import { catalog } from '@/data/catalog';
import { VOICE } from '@/data/editorial';
import { heroImage } from '@/data/images';
import { productsIn } from '@/data/query';
import { colors, spacing } from '@/theme';

const FRANCHISE_WIDTH = 120;
/** Inside the card's 1pt rule, which the art sits within rather than under. */
const FRANCHISE_ART_WIDTH = FRANCHISE_WIDTH - 2;
const FRANCHISE_ART_HEIGHT = 80;

/** The shape of the Brooks site's own shop navigation. */
const SECTIONS = [
  {
    title: 'Shop by gender',
    rows: [
      { id: 'womens-shoes', label: "Women's Shoes" },
      { id: 'mens-shoes', label: "Men's Shoes" },
      { id: 'womens-apparel', label: "Women's Apparel" },
      { id: 'mens-apparel', label: "Men's Apparel" },
    ],
  },
  {
    title: 'Featured',
    rows: [
      { id: 'featured-new-arrivals', label: 'New Arrivals' },
      { id: 'featured-best-sellers', label: 'Best Sellers' },
      { id: 'featured-trail-running-collection', label: 'Trail' },
      { id: 'featured-shoes-in-widths', label: 'Shoes in Widths' },
      { id: 'sale', label: 'Sale' },
    ],
  },
];

/** Brooks's franchises, the way runners actually shop. */
const FRANCHISES = ['Ghost', 'Glycerin', 'Adrenaline', 'Hyperion', 'Cascadia', 'Launch'];

export function Shop() {
  // Nothing above the title. Every control the old blue header could have
  // carried already sits closer to the thumb: search is the field below,
  // account and cart are tabs, and Browse *is* the site's mega menu, so the
  // hamburger would only point at the screen the reader is already on.
  // @ref LLP 0003#the-header-collapses-on-scroll — the header is Home's alone.
  return (
    <ScreenScrollView>
      <ScreenHeading>Shop</ScreenHeading>
      <Press onPress={() => router.push('/search')} scaleTo={0.97} style={styles.searchBar}>
        <BrooksIcon name="search" size={15} color={colors.inkMuted} />
        <Txt variant="body" c={colors.inkMuted}>
          Search shoes, apparel…
        </Txt>
      </Press>

      {/* Franchise shortcuts — the fastest path for a runner who knows the shoe. */}
      <Txt variant="eyebrow" c={colors.inkMuted} style={styles.railLabel}>
        Franchises
      </Txt>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {FRANCHISES.map((f) => {
          const p = catalog.products.find((x) => x.franchise === f && x.colors.length);
          return (
            /* The shoe itself opens the franchise, so it zooms into it.
               @ref LLP 0003#zoom-transitions */
            <Link
              key={f}
              href={{
                pathname: '/category/[id]',
                params: { id: 'brooks-running-shoes', title: f, franchise: f },
              }}
              asChild
            >
              <Press accessibilityRole="button" scaleTo={0.95} style={styles.franchise}>
                <ZoomSource
                  width={FRANCHISE_ART_WIDTH}
                  height={FRANCHISE_ART_HEIGHT}
                  style={styles.franchiseArt}
                >
                  {p ? (
                    <Photo
                      url={heroImage(p.colors[0].images)}
                      width={FRANCHISE_ART_WIDTH}
                      height={FRANCHISE_ART_HEIGHT}
                    />
                  ) : null}
                </ZoomSource>
                <Txt variant="caption" style={{ padding: spacing.sm }}>
                  {f}
                </Txt>
              </Press>
            </Link>
          );
        })}
      </ScrollView>

      {/* Shoe Finder moved off the tab bar when the native search tab took the
          fifth slot; this card is its primary entry point now. */}
      <Press scaleTo={0.98} style={styles.finderCard} onPress={() => router.navigate('/(tabs)/(finder)/finder')}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Txt variant="eyebrow" c={colors.lime}>
            Shoe Finder
          </Txt>
          <Txt variant="h3" c={colors.surface}>
            {VOICE.finderWelcome}
          </Txt>
        </View>
        <BrooksIcon name="caretRight" size={16} color={colors.surface} />
      </Press>

      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Txt variant="eyebrow" c={colors.inkMuted} style={{ paddingHorizontal: spacing.gutter }}>
            {s.title}
          </Txt>
          <View style={{ marginTop: spacing.md }}>
            {s.rows.map((r) => {
              const n = productsIn(catalog, r.id).length;
              return (
                <Press
                  key={r.id}
                  scaleTo={0.99}
                  style={styles.row}
                  onPress={() =>
                    router.push({
                      pathname: '/category/[id]',
                      params: { id: r.id, title: r.label },
                    })
                  }
                >
                  <Txt variant="h3">{r.label}</Txt>
                  <View style={styles.rowRight}>
                    <Txt variant="tiny" c={colors.inkMuted}>
                      {n}
                    </Txt>
                    <BrooksIcon name="caretRight" size={14} color={colors.inkFaint} />
                  </View>
                </Press>
              );
            })}
          </View>
        </View>
      ))}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    height: 48,
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  railLabel: { paddingHorizontal: spacing.gutter, marginBottom: spacing.md },
  rail: { paddingHorizontal: spacing.gutter, gap: spacing.md },
  franchise: { width: FRANCHISE_WIDTH, borderWidth: 1, borderColor: colors.hairline },
  franchiseArt: { backgroundColor: colors.surfaceAlt },
  finderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.blue,
  },
  section: { marginTop: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});

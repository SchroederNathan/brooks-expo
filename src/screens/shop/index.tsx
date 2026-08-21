import { router } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { BrooksIcon } from '@/components/icons';
import { Photo } from '@/components/photo';
import { Press } from '@/components/press';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { VOICE } from '@/data/editorial';
import { heroImage } from '@/data/images';
import { productsIn } from '@/data/query';
import { colors, spacing } from '@/theme';

const { width: W } = Dimensions.get('window');

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
  return (
    <ScrollView
      style={{ backgroundColor: colors.surface }}
      contentInsetAdjustmentBehavior="automatic"
      // The native tab bar insets scroll content automatically, so only a
      // breathing-room pad remains.
      contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.head}>
        <Txt variant="h1">Shop</Txt>
        <Press onPress={() => router.push('/search')} scaleTo={0.97} style={styles.searchBar}>
          <BrooksIcon name="search" size={15} color={colors.inkMuted} />
          <Txt variant="body" c={colors.inkMuted}>
            Search shoes, apparel…
          </Txt>
        </Press>
      </View>

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
            <Press
              key={f}
              scaleTo={0.95}
              style={styles.franchise}
              onPress={() =>
                router.push({
                  pathname: '/category/[id]',
                  params: { id: 'brooks-running-shoes', title: f, franchise: f },
                })
              }
            >
              <View style={styles.franchiseArt}>
                {p ? (
                  <Photo url={heroImage(p.colors[0].images)} width={120} height={80} />
                ) : null}
              </View>
              <Txt variant="caption" style={{ padding: spacing.sm }}>
                {f}
              </Txt>
            </Press>
            );
        })}
      </ScrollView>

      {/* Shoe Finder moved off the tab bar when the native search tab took the
          fifth slot; this card is its primary entry point now. */}
      <Press scaleTo={0.98} style={styles.finderCard} onPress={() => router.push('/finder')}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.gutter, gap: spacing.lg, marginBottom: spacing.xl },
  searchBar: {
    height: 48,
    backgroundColor: colors.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  railLabel: { paddingHorizontal: spacing.gutter, marginBottom: spacing.md },
  rail: { paddingHorizontal: spacing.gutter, gap: spacing.md },
  franchise: { width: 120, borderWidth: 1, borderColor: colors.hairline },
  franchiseArt: { height: 80, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
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

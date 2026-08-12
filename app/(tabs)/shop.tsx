import { router } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Photo, Press, Txt } from '../../src/components/primitives';
import { catalog } from '../../src/data/catalog';
import { heroImage } from '../../src/data/images';
import { productsIn } from '../../src/data/query';
import { color, space } from '../../src/theme/tokens';

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

export default function Shop() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: color.surface }}
      contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: insets.bottom + 96 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.head}>
        <Txt variant="h1">Shop</Txt>
        <Press onPress={() => router.push('/search')} scaleTo={0.97} style={styles.searchBar}>
          <Txt variant="body" c={color.inkMuted}>
            ⌕　Search shoes, apparel…
          </Txt>
        </Press>
      </View>

      {/* Franchise shortcuts — the fastest path for a runner who knows the shoe. */}
      <Txt variant="eyebrow" c={color.inkMuted} style={styles.railLabel}>
        Franchises
      </Txt>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {FRANCHISES.map((f, i) => {
          const p = catalog.products.find((x) => x.franchise === f && x.colors.length);
          return (
            <Animated.View key={f} entering={FadeInDown.delay(i * 50).duration(300)}>
              <Press
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
                <Txt variant="caption" style={{ padding: space.sm }}>
                  {f}
                </Txt>
              </Press>
            </Animated.View>
          );
        })}
      </ScrollView>

      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Txt variant="eyebrow" c={color.inkMuted} style={{ paddingHorizontal: space.gutter }}>
            {s.title}
          </Txt>
          <View style={{ marginTop: space.md }}>
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
                    <Txt variant="tiny" c={color.inkMuted}>
                      {n}
                    </Txt>
                    <Txt variant="h3" c={color.inkFaint}>
                      ›
                    </Txt>
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
  head: { paddingHorizontal: space.gutter, gap: space.lg, marginBottom: space.xl },
  searchBar: {
    height: 48,
    backgroundColor: color.surfaceAlt,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  railLabel: { paddingHorizontal: space.gutter, marginBottom: space.md },
  rail: { paddingHorizontal: space.gutter, gap: space.md },
  franchise: { width: 120, borderWidth: 1, borderColor: color.hairline },
  franchiseArt: { height: 80, backgroundColor: color.surfaceAlt, overflow: 'hidden' },
  section: { marginTop: space.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.gutter,
    paddingVertical: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: color.hairline,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});

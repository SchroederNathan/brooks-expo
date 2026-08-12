import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Countdown } from '../../src/components/Countdown';
import { ProductTile } from '../../src/components/ProductTile';
import {
  Badge,
  Button,
  Photo,
  Press,
  SectionHeader,
  Squiggle,
  Txt,
} from '../../src/components/primitives';
import { BrooksWordmark } from '../../src/components/Wordmark';
import { catalog } from '../../src/data/catalog';
import { HERO, STORIES, USE_CASES, VOICE } from '../../src/data/editorial';
import { productsIn } from '../../src/data/query';
import { color, motion, space, type } from '../../src/theme/tokens';

const { width: W } = Dimensions.get('window');
const HERO_H = Math.round(W * 1.25);
const TILE_W = Math.round(W * 0.62);

export default function Home() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const newArrivals = useMemo(
    () => productsIn(catalog, 'featured-new-arrivals').slice(0, 10),
    []
  );
  const bestSellers = useMemo(() => productsIn(catalog, 'featured-best-sellers').slice(0, 10), []);

  /**
   * The header starts transparent over the hero video still and cross-fades into
   * a blurred white bar once the hero is most of the way gone. This one behavior
   * does more than any other to make the screen read as native.
   */
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_H * 0.55, HERO_H * 0.85], [0, 1], 'clamp'),
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_H * 0.55, HERO_H * 0.85], [1, 0], 'clamp'),
  }));
  const logoDarkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_H * 0.55, HERO_H * 0.85], [0, 1], 'clamp'),
  }));
  /** Parallax: the hero drifts at half scroll speed and scales up when overscrolled. */
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-200, 0, HERO_H], [-100, 0, HERO_H * 0.45]) },
      { scale: interpolate(scrollY.value, [-200, 0], [1.25, 1], 'clamp') },
    ],
  }));

  return (
    <View style={styles.root}>
      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Animated.View style={[StyleSheet.absoluteFill, barStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView tint="light" intensity={70} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: color.surface }]} />
          )}
          <View style={styles.headerHairline} />
        </Animated.View>

        <View style={styles.headerRow}>
          <View>
            <Animated.View style={logoStyle}>
              <BrooksWordmark width={104} color={color.surface} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, logoDarkStyle]}>
              <BrooksWordmark width={104} color={color.ink} />
            </Animated.View>
          </View>
          <View style={styles.headerActions}>
            <HeaderIcon onPress={() => router.push('/search')} scrollY={scrollY} glyph="search" />
          </View>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {/* ---------------------------------------------------------- HERO -- */}
        <View style={[styles.hero, { height: HERO_H }]}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            <Photo url={HERO.image} width={W} height={HERO_H} priority="high" />
          </Animated.View>
          <LinearGradient
            colors={['rgba(14,19,31,0.45)', 'rgba(14,19,31,0.05)', 'rgba(14,19,31,0.85)']}
            locations={[0, 0.42, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroContent}>
            {/* The site's own entrance: fade + 40px rise, staggered ~80ms. */}
            <Animated.View entering={FadeInDown.duration(motion.slow).delay(0)}>
              <Countdown target={HERO.attemptAt} />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(motion.slow).delay(motion.heroStagger)}>
              <Txt variant="eyebrow" c={color.lime} style={{ marginTop: space.lg }}>
                {HERO.eyebrow}
              </Txt>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(motion.slow).delay(motion.heroStagger * 2)}
            >
              <Txt variant="hero" c={color.surface} style={{ marginTop: space.sm }}>
                {HERO.title}
              </Txt>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(motion.slow).delay(motion.heroStagger * 3)}
            >
              <Txt variant="body" c="rgba(255,255,255,0.88)" style={{ marginTop: space.md }}>
                {HERO.body}
              </Txt>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(motion.slow).delay(motion.heroStagger * 4)}
              style={{ marginTop: space.xl, alignSelf: 'flex-start' }}
            >
              <Button
                title={HERO.cta}
                variant="onDark"
                onPress={() =>
                  router.push({
                    pathname: '/category/[id]',
                    params: { id: HERO.ctaCategory, title: "Kerr's training gear" },
                  })
                }
              />
            </Animated.View>
          </View>
        </View>

        {/* ------------------------------------------------------ USE CASES -- */}
        <View style={styles.block}>
          <SectionHeader eyebrow="Shop by" title="Wherever the day takes you" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            snapToInterval={148 + space.md}
            decelerationRate="fast"
          >
            {USE_CASES.map((u) => (
              <Press
                key={u.id}
                scaleTo={0.96}
                style={styles.useCase}
                onPress={() =>
                  router.push({
                    pathname: '/category/[id]',
                    params: { id: u.id, title: u.label },
                  })
                }
              >
                <UseCaseArt id={u.id} />
                <View style={{ padding: space.md }}>
                  <Txt variant="h3">{u.label}</Txt>
                  <Txt variant="tiny" c={color.inkMuted}>
                    {u.caption}
                  </Txt>
                </View>
              </Press>
            ))}
          </ScrollView>
        </View>

        {/* --------------------------------------------------- NEW ARRIVALS -- */}
        <View style={styles.block}>
          <SectionHeader
            eyebrow="Just landed"
            title="New arrivals"
            action="See all"
            onAction={() =>
              router.push({
                pathname: '/category/[id]',
                params: { id: 'featured-new-arrivals', title: 'New Arrivals' },
              })
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            snapToInterval={TILE_W + space.lg}
            decelerationRate="fast"
          >
            {newArrivals.map((p, i) => (
              <ProductTile key={p.id} product={p} width={TILE_W} index={i} />
            ))}
          </ScrollView>
        </View>

        {/* ------------------------------------------------------- RUN CLUB -- */}
        <Press
          style={styles.runClub}
          scaleTo={0.98}
          onPress={() => router.push('/login')}
        >
          <View style={{ flex: 1 }}>
            <Txt variant="eyebrow" c={color.lime}>
              Brooks Run Club
            </Txt>
            <Txt variant="h2" c={color.surface} style={{ marginTop: space.sm }}>
              {VOICE.runClub}
            </Txt>
            <Txt variant="bodySmall" c="rgba(255,255,255,0.75)" style={{ marginTop: space.sm }}>
              Free shipping, early access, and a birthday gift.
            </Txt>
            <View style={styles.joinRow}>
              <Txt variant="eyebrow" c={color.surface} style={{ fontSize: 11 }}>
                Join now
              </Txt>
              <View style={styles.joinUnderline} />
            </View>
          </View>
        </Press>

        {/* ---------------------------------------------------- BEST SELLERS - */}
        <View style={styles.block}>
          <SectionHeader
            eyebrow="Loved by runners"
            title="Build your training rotation"
            action="See all"
            onAction={() =>
              router.push({
                pathname: '/category/[id]',
                params: { id: 'featured-best-sellers', title: 'Best Sellers' },
              })
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            snapToInterval={TILE_W + space.lg}
            decelerationRate="fast"
          >
            {bestSellers.map((p, i) => (
              <ProductTile key={p.id} product={p} width={TILE_W} index={i} />
            ))}
          </ScrollView>
        </View>

        {/* -------------------------------------------------------- STORIES -- */}
        <View style={styles.block}>
          <SectionHeader eyebrow="Read" title="Stories to transform your run" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            snapToInterval={W * 0.76 + space.md}
            decelerationRate="fast"
          >
            {STORIES.map((s) => (
              <Press
                key={s.id}
                scaleTo={0.97}
                style={[styles.story, { width: W * 0.76 }]}
                onPress={() =>
                  router.push({
                    pathname: '/category/[id]',
                    params: {
                      id: 'shopCategory' in s ? s.shopCategory : 'featured-best-sellers',
                      title: s.shopLabel,
                      franchise: 'shopFranchise' in s ? s.shopFranchise : undefined,
                    },
                  })
                }
              >
                <View style={styles.storyImage}>
                  <Photo url={s.image} width={W * 0.76} height={200} />
                  <LinearGradient
                    colors={['transparent', 'rgba(14,19,31,0.75)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.storyBadge}>
                    <Badge label={s.eyebrow} tone="light" />
                  </View>
                </View>
                <View style={{ paddingVertical: space.md }}>
                  <Txt variant="h3">{s.title}</Txt>
                  <Txt variant="tiny" c={color.inkMuted} style={{ marginTop: 4 }}>
                    {s.readTime}
                  </Txt>
                  <View style={styles.joinRow}>
                    <Txt variant="eyebrow" c={color.ink} style={{ fontSize: 11 }}>
                      {s.shopLabel}
                    </Txt>
                    <View style={[styles.joinUnderline, { backgroundColor: color.ink }]} />
                  </View>
                </View>
              </Press>
            ))}
          </ScrollView>
        </View>

        {/* -------------------------------------------------------- PROMISE -- */}
        <View style={styles.promise}>
          <Txt variant="eyebrow" c={color.inkMuted}>
            {VOICE.promiseTitle}
          </Txt>
          <Squiggle />
          <Txt variant="h2" style={{ textAlign: 'center' }}>
            {VOICE.promise}
          </Txt>
          <Txt variant="script" c={color.inkMuted} style={{ marginTop: space.md }}>
            {VOICE.tagline}
          </Txt>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/** Header icon that inverts as the bar turns white. */
function HeaderIcon({
  glyph,
  onPress,
  scrollY,
}: {
  glyph: string;
  onPress: () => void;
  scrollY: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    color: interpolate(scrollY.value, [HERO_H * 0.55, HERO_H * 0.85], [1, 0], 'clamp') > 0.5
      ? color.surface
      : color.ink,
  }));
  return (
    <Press onPress={onPress} scaleTo={0.9} hitSlop={10}>
      <Animated.Text style={[type.h3, style]}>{glyph === 'search' ? '⌕' : '·'}</Animated.Text>
    </Press>
  );
}

/** Lightweight art for the use-case rail: a real product shot on a tinted field. */
function UseCaseArt({ id }: { id: string }) {
  const p = productsIn(catalog, id)[0];
  const img = p?.colors[0]?.images[0]?.url;
  return (
    <View style={styles.useCaseArt}>
      {img ? (
        <Photo url={img} width={148} height={110} />
      ) : (
        <View style={{ flex: 1, backgroundColor: color.surfaceSunken }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.surface },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerHairline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: color.hairline,
  },
  headerRow: {
    height: 52,
    paddingHorizontal: space.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: { flexDirection: 'row', gap: space.lg, alignItems: 'center' },

  hero: { width: '100%', overflow: 'hidden', backgroundColor: color.ink },
  heroContent: {
    position: 'absolute',
    left: space.gutter,
    right: space.gutter,
    bottom: space.xl,
  },

  block: { marginTop: space.xxxl },
  rail: { paddingHorizontal: space.gutter, gap: space.lg },

  useCase: {
    width: 148,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: color.surface,
  },
  useCaseArt: { height: 110, backgroundColor: color.surfaceAlt, overflow: 'hidden' },

  runClub: {
    backgroundColor: color.navy,
    marginTop: space.xxxl,
    marginHorizontal: space.gutter,
    padding: space.xl,
    flexDirection: 'row',
  },
  joinRow: { marginTop: space.lg, alignSelf: 'flex-start', gap: 3 },
  joinUnderline: { height: 3, backgroundColor: color.lime, width: '100%' },

  story: { marginRight: 0 },
  storyImage: { height: 200, backgroundColor: color.surfaceAlt, overflow: 'hidden' },
  storyBadge: { position: 'absolute', top: space.md, left: space.md },

  promise: {
    marginTop: space.xxxl,
    marginBottom: space.xl,
    paddingHorizontal: space.xxl,
    paddingVertical: space.xxxl,
    backgroundColor: color.surfaceAlt,
    alignItems: 'center',
  },
});

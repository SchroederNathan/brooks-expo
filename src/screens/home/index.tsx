import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useMemo } from 'react';
import {
  FlatList,
  type ListRenderItemInfo,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useBrooksHeader } from '@/components/brooks-header';
import { ProductTile } from '@/components/product-tile';
import { Press } from '@/components/press';
import { StretchyParallaxScrollView } from '@/components/stretchy-parallax-scroll-view';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { HERO, HOME_GEAR, LONGER_DAYS, STORIES, USE_CASES } from '@/data/editorial';
import { productsIn } from '@/data/query';
import type { Product } from '@/data/types';
import { colors, font, spacing } from '@/theme';

// @ref LLP 0003#expo-implementation-paper-home-port — The Paper Home artboard
// supplies this screen's geometry; the app's system NativeTabs remain the shell.
const PAPER_WIDTH = 393;
const PAPER_HERO_HEIGHT = 491;
const GEAR_CARD_WIDTH = 172;
const USE_CASE_WIDTH = 152;
const PRODUCT_WIDTH = 244;
const STORY_WIDTH = 240;
/**
 * How far the promise block's colour is carried below the last pixel of
 * content. Generous enough to outrun a hard fling's rubber band on the tallest
 * frame; it is a flat fill, so height costs nothing to draw.
 */
const OVERSCROLL_FILL = 1000;
const keyById = (item: { id: string }) => item.id;

type GearItem = (typeof HOME_GEAR)[number];
type UseCaseItem = (typeof USE_CASES)[number];
type StoryItem = (typeof STORIES)[number];

function renderGearItem({ item }: ListRenderItemInfo<GearItem>) {
  return <GearCard item={item} />;
}

function renderUseCaseItem({ item }: ListRenderItemInfo<UseCaseItem>) {
  return <UseCaseCard item={item} />;
}

function renderProductItem({ item, index }: ListRenderItemInfo<Product>) {
  return <ProductTile product={item} width={PRODUCT_WIDTH} index={index} />;
}

function renderStoryItem({ item }: ListRenderItemInfo<StoryItem>) {
  return <StoryCard story={item} />;
}

export function Home() {
  // Search alone: Home is the one screen where the header should not compete
  // with the hero, and every other control it could carry is a tab away.
  // The hero runs under the bar rather than below it — the site's own header
  // floats over its hero — so `headerHeight` is deliberately unused here.
  const { header, handlers, scrollRef } = useBrooksHeader({
    actions: ['search'],
    hiddenStatusBarStyle: 'light',
  });
  const { width } = useWindowDimensions();
  const heroHeight = Math.round((width / PAPER_WIDTH) * PAPER_HERO_HEIGHT);

  const player = useVideoPlayer(HERO.video, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  const newArrivals = useMemo(() => {
    const leadIds = ['120482', '120443']; // Ghost 18, then Adrenaline GTS 25 — Paper order.
    const leads = leadIds
      .map((id) => catalog.products.find((product) => product.id === id))
      .filter((product) => product != null);
    const remainder = productsIn(catalog, 'featured-new-arrivals').filter(
      (product) => !leadIds.includes(product.id)
    );
    return [...leads, ...remainder].slice(0, 10);
  }, []);

  return (
    <View collapsable={false} style={styles.root}>
      <StretchyParallaxScrollView
        headerHeight={heroHeight}
        scrollHandlers={handlers}
        scrollRef={scrollRef}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        header={
          <View style={styles.hero}>
            <VideoView
              style={StyleSheet.absoluteFill}
              player={player}
              nativeControls={false}
              contentFit="cover"
              surfaceType="textureView"
              allowsVideoFrameAnalysis={false}
              playsInline
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(14,19,31,0.60)', 'rgba(14,19,31,0.24)', 'rgba(14,19,31,0.08)']}
              locations={[0, 0.48, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          </View>
        }
        foreground={
          <View style={styles.heroContent}>
            <View>
              <Txt variant="eyebrow" c={colors.surface}>
                {HERO.eyebrow}
              </Txt>
            </View>
            <View>
              <Txt variant="hero" c={colors.surface} style={styles.heroTitle}>
                {HERO.title}
              </Txt>
            </View>
            <View>
              <Txt variant="body" c="rgba(255,255,255,0.90)" style={styles.heroBody}>
                {HERO.body}
              </Txt>
            </View>
            <View style={styles.heroAction}>
              <UnderlinedAction
                label={HERO.cta}
                onPress={() =>
                  router.push({
                    pathname: '/category/[id]',
                    params: { id: HERO.ctaCategory, title: HERO.ctaTitle },
                  })
                }
                onDark
              />
            </View>
          </View>
        }
      >
        <View style={styles.gearSection}>
          <Image
            source={require('../../../assets/home/summer-sky.webp')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <SectionTitle>Summer’s hottest new gear</SectionTitle>
          <FlatList
            horizontal
            data={HOME_GEAR}
            keyExtractor={keyById}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gearRail}
            renderItem={renderGearItem}
          />
        </View>

        <LongerDays />

        <View style={styles.useCaseSection}>
          <SectionTitle>Wherever the day takes you</SectionTitle>
          <FlatList
            horizontal
            data={USE_CASES}
            keyExtractor={keyById}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.useCaseRail}
            renderItem={renderUseCaseItem}
          />
        </View>

        <View style={styles.productSection}>
          <SectionTitle>New arrivals</SectionTitle>
          <FlatList
            horizontal
            data={newArrivals}
            keyExtractor={keyById}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={PRODUCT_WIDTH + spacing.lg}
            contentContainerStyle={styles.productRail}
            renderItem={renderProductItem}
          />
        </View>

        <View style={styles.storySection}>
          <SectionTitle>Stories to transform your run</SectionTitle>
          <FlatList
            horizontal
            data={STORIES}
            keyExtractor={keyById}
            showsHorizontalScrollIndicator={false}
            snapToInterval={STORY_WIDTH + spacing.lg}
            decelerationRate="fast"
            contentContainerStyle={styles.storyRail}
            renderItem={renderStoryItem}
          />
        </View>

        <View style={styles.promise}>
          <Image
            source={require('../../../assets/home/run-happy-promise.png')}
            style={styles.promiseSeal}
            contentFit="contain"
          />
          <Txt c={colors.surface} style={[styles.promiseText, styles.promiseLead]}>
            Take it for a 90-day trial run.
          </Txt>
          <Txt c={colors.surface} style={styles.promiseText}>
            If you’re not happy, we’re not happy.
          </Txt>
        </View>
        <View pointerEvents="none" style={styles.overscrollFill} />
      </StretchyParallaxScrollView>
      {header}
    </View>
  );
}

/**
 * The site's "Longer days. Longer runs." banner.
 *
 * @ref LLP 0003#the-home-feature — The harvested collage, rebuilt as two layers.
 * The backdrop runs the height of the section less `photoOverhang`, so the copy
 * rides it, it shows through the photo's left inset the way the site's does, and
 * the photo hangs past its bottom edge. The backdrop is `bottom`-anchored rather
 * than given a height, so it tracks a copy block that sizes to its own text.
 */
function LongerDays() {
  const { width } = useWindowDimensions();
  const photoLeft = Math.round(width * LONGER_DAYS.photoInset);
  const photoWidth = width - photoLeft;
  const photoHeight = Math.round((photoWidth / LONGER_DAYS.photoWidth) * LONGER_DAYS.photoHeight);

  return (
    <View style={styles.longerDays}>
      <Image
        source={LONGER_DAYS.backdrop}
        style={[styles.longerDaysBackdrop, { bottom: LONGER_DAYS.photoOverhang }]}
        contentFit="cover"
      />
      <View style={styles.longerDaysCopy}>
        <Txt variant="hero">{LONGER_DAYS.title}</Txt>
        <Txt variant="body" style={styles.longerDaysBody}>
          {LONGER_DAYS.body}
        </Txt>
        <View style={styles.longerDaysActions}>
          {LONGER_DAYS.ctas.map((cta) => (
            <UnderlinedAction
              key={cta.id}
              label={cta.label}
              onPress={() =>
                router.push({
                  pathname: '/category/[id]',
                  params: { id: cta.category, title: cta.title },
                })
              }
            />
          ))}
        </View>
      </View>
      <Image
        source={LONGER_DAYS.photo}
        style={{ marginLeft: photoLeft, width: photoWidth, height: photoHeight }}
        contentFit="cover"
      />
    </View>
  );
}

function GearCard({ item }: { item: GearItem }) {
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={item.label}
      scaleTo={0.97}
      style={styles.gearCard}
      onPress={() =>
        router.push({
          pathname: '/category/[id]',
          params: { id: item.id, title: item.label },
        })
      }
    >
      <Image source={item.image} style={styles.gearImage} contentFit="cover" />
      <Txt variant="tiny" style={styles.gearLabel}>
        {item.label}
      </Txt>
    </Press>
  );
}

function UseCaseCard({ item }: { item: UseCaseItem }) {
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={item.label}
      scaleTo={0.97}
      style={styles.useCaseCard}
      onPress={() =>
        router.push({
          pathname: '/category/[id]',
          params: { id: item.id, title: item.label },
        })
      }
    >
      <Image source={item.image} style={styles.useCaseImage} contentFit="cover" />
      <Txt variant="eyebrow" style={styles.useCaseLabel}>
        {item.label}
      </Txt>
    </Press>
  );
}

function StoryCard({ story }: { story: StoryItem }) {
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={story.title}
      scaleTo={0.98}
      style={styles.storyCard}
      onPress={() =>
        router.push({
          pathname: '/category/[id]',
          params: { id: story.shopCategory, title: story.shopLabel },
        })
      }
    >
      <Image source={story.image} style={styles.storyImage} contentFit="cover" />
      <View style={styles.storyMeta}>
        <Txt variant="tiny" c={colors.blue} style={styles.storyEyebrow}>
          {story.eyebrow}
        </Txt>
        <Txt variant="tiny" c={colors.inkMuted}>
          {story.date}
        </Txt>
      </View>
      <Txt style={styles.storyTitle}>{story.title}</Txt>
    </Press>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Txt variant="h2" style={styles.sectionTitle}>
        {children}
      </Txt>
    </View>
  );
}

function UnderlinedAction({
  label,
  onPress,
  onDark = false,
}: {
  label: string;
  onPress: () => void;
  onDark?: boolean;
}) {
  const color = onDark ? colors.surface : colors.ink;
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={label}
      scaleTo={0.96}
      style={styles.underlinedAction}
      onPress={onPress}
    >
      <Txt variant="button" c={color}>
        {label}
      </Txt>
      <View style={[styles.actionUnderline, { backgroundColor: color }]} />
    </Press>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: { flex: 1, width: '100%', overflow: 'hidden', backgroundColor: colors.ink },
  heroContent: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    bottom: 32,
  },
  heroTitle: { marginTop: 10 },
  heroBody: { marginTop: 12, lineHeight: 22 },
  heroAction: { marginTop: 22, alignSelf: 'flex-start' },

  sectionTitleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.gutter,
  },
  sectionTitle: {
    maxWidth: 353,
    fontFamily: font.bold,
    textAlign: 'center',
  },

  gearSection: { paddingTop: 36, paddingBottom: 40, overflow: 'hidden' },
  gearRail: { paddingHorizontal: spacing.gutter, gap: spacing.md },
  gearCard: { width: GEAR_CARD_WIDTH, gap: spacing.md, alignItems: 'center' },
  gearImage: { width: GEAR_CARD_WIDTH, height: GEAR_CARD_WIDTH },
  gearLabel: {
    fontFamily: font.bold,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  useCaseSection: { paddingVertical: 36 },
  useCaseRail: { paddingHorizontal: spacing.gutter, gap: spacing.md },
  useCaseCard: { width: USE_CASE_WIDTH, gap: spacing.md },
  useCaseImage: { width: USE_CASE_WIDTH, height: 200 },
  useCaseLabel: { textAlign: 'center' },

  productSection: { paddingVertical: 40 },
  productRail: { paddingHorizontal: spacing.gutter, gap: spacing.lg },

  longerDays: { backgroundColor: colors.surface },
  longerDaysBackdrop: { position: 'absolute', top: 0, right: 0, left: 0 },
  longerDaysCopy: {
    paddingTop: 56,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.gutter,
  },
  longerDaysBody: { marginTop: spacing.lg, maxWidth: 300 },
  longerDaysActions: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.xl },

  storySection: { paddingVertical: 40 },
  storyRail: { paddingHorizontal: spacing.gutter, gap: spacing.lg },
  storyCard: { width: STORY_WIDTH },
  storyImage: { width: STORY_WIDTH, height: 150 },
  storyMeta: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, paddingTop: 14 },
  storyEyebrow: { fontFamily: font.bold, letterSpacing: 1.1, textTransform: 'uppercase' },
  storyTitle: {
    paddingTop: 6,
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.17,
  },

  promise: {
    alignItems: 'center',
    justifyContent: 'center',
    // Equal top and bottom: the seal and the promise read as centred in the
    // block, which they cannot if a bottom spacer carries the block lower than
    // its own padding. The bar below shortens the screen rather than covering
    // it, so the block owes it no clearance of its own.
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.blue,
  },
  promiseSeal: { width: 79, height: 79 },
  promiseLead: { marginTop: spacing.gutter },
  promiseText: {
    color: colors.surface,
    fontFamily: font.bold,
    fontSize: 19,
    lineHeight: 26,
    letterSpacing: -0.19,
    textAlign: 'center',
  },
  /**
   * Paints the rubber band under the footer so a bottom overscroll reveals more
   * Brooks blue rather than the page's white. It hangs *outside* the content
   * box rather than being extra section height, so it adds nothing to the
   * scroll view's content size: the end of the promise block is still the end
   * of the scroll, and the scroll indicator still tells the truth.
   */
  overscrollFill: {
    position: 'absolute',
    right: 0,
    bottom: -OVERSCROLL_FILL,
    left: 0,
    height: OVERSCROLL_FILL,
    backgroundColor: colors.blue,
  },

  underlinedAction: { alignItems: 'stretch', gap: 4, alignSelf: 'flex-start' },
  actionUnderline: { height: 2, alignSelf: 'stretch' },
});

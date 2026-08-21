import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useMemo } from 'react';
import {
  FlatList,
  type ListRenderItemInfo,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductTile } from '@/components/product-tile';
import { Press } from '@/components/press';
import { StretchyParallaxScrollView } from '@/components/stretchy-parallax-scroll-view';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { HERO, HOME_GEAR, STORIES, USE_CASES } from '@/data/editorial';
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
  const insets = useSafeAreaInsets();
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
      <StatusBar style="dark" animated />
      <StretchyParallaxScrollView
        headerHeight={heroHeight}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
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
          <UnderlinedAction
            label="Shop all new arrivals"
            style={styles.centeredAction}
            onPress={() =>
              router.push({
                pathname: '/category/[id]',
                params: { id: 'featured-new-arrivals', title: 'New Arrivals' },
              })
            }
          />
        </View>

        <View style={styles.runClub}>
          <Image
            source={require('../../../assets/home/run-club.jpg')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={styles.runClubScrim}>
            <Txt variant="h1" c={colors.surface} style={styles.centeredText}>
              Brooks Run Club
            </Txt>
            <Txt variant="body" c="rgba(255,255,255,0.88)" style={styles.runClubBody}>
              FREE shipping and early access to new gear.
            </Txt>
            <UnderlinedAction label="Join now" onPress={() => router.push('/login')} onDark />
          </View>
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
        <View
          pointerEvents="none"
          style={[styles.promiseTabClearance, { height: insets.bottom + 48 }]}
        />
      </StretchyParallaxScrollView>
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
  style,
}: {
  label: string;
  onPress: () => void;
  onDark?: boolean;
  style?: object;
}) {
  const color = onDark ? colors.surface : colors.ink;
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={label}
      scaleTo={0.96}
      style={[styles.underlinedAction, style]}
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
  centeredAction: { alignSelf: 'center', marginTop: 28 },

  runClub: { height: 240, overflow: 'hidden' },
  runClubScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'rgba(14,19,31,0.38)',
  },
  centeredText: { textAlign: 'center' },
  runClubBody: { marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 22, textAlign: 'center' },

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
    paddingVertical: spacing.xxl,
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
  promiseTabClearance: { backgroundColor: colors.blue },

  underlinedAction: { alignItems: 'stretch', gap: 4, alignSelf: 'flex-start' },
  actionUnderline: { height: 2, alignSelf: 'stretch' },
});

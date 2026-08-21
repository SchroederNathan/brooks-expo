import * as Linking from 'expo-linking';
import { StyleSheet, View } from 'react-native';

import { Press } from '@/components/press';
import { Stars } from '@/components/stars';
import { Txt } from '@/components/themed-text';
import type { ProductReviews, ReviewDimension } from '@/data/types';
import { colors, spacing } from '@/theme';

/**
 * The expanded Brooks review summary, fit rails, and newest TurnTo reviews.
 *
 * @ref LLP 0003#pdp-reviews — Preserve the storefront's information order
 * while using native press targets and the app's existing type and icon system.
 */
export function ReviewsPanel({
  rating,
  count,
  data,
  productUrl,
}: {
  rating: number;
  count: number;
  data?: ProductReviews;
  productUrl: string;
}) {
  const openBrooksReviews = () => {
    void Linking.openURL(`${productUrl}#reviews`);
  };
  const dimensions = (data?.dimensions || []).slice(0, 2);
  const recent = data?.recent || [];

  return (
    <View style={styles.panel}>
      <View style={styles.summary}>
        <Txt variant="h1" style={styles.score}>
          {rating.toFixed(1)}
        </Txt>
        <Stars value={rating} size={20} showSummary={false} />
        <Press
          accessibilityRole="button"
          haptic={false}
          onPress={() => {}}
          scaleTo={0.98}
          style={styles.primaryCta}
        >
          <Txt variant="productTitle" c={colors.surface}>
            Write a review
          </Txt>
        </Press>
      </View>

      {dimensions.length > 0 ? (
        <View style={styles.dimensions}>
          {dimensions.map((dimension) => (
            <ReviewFitMeter key={dimension.label} dimension={dimension} />
          ))}
        </View>
      ) : null}

      {recent.length > 0 ? (
        <>
          <View style={styles.listHeader}>
            <Txt variant="caption">3 most recent reviews</Txt>
            <Press accessibilityRole="link" onPress={openBrooksReviews} hitSlop={8}>
              <Txt variant="caption" style={styles.textLink}>
                See all reviews
              </Txt>
            </Press>
          </View>

          <View style={styles.list}>
            {recent.map((review) => (
              <View key={review.id} style={styles.item}>
                <View style={styles.metaRow}>
                  <View style={{ gap: spacing.xs }}>
                    <Stars value={review.rating} size={14} showSummary={false} />
                    <Txt variant="caption" c={colors.inkMuted}>
                      {review.publishedDate}
                    </Txt>
                  </View>
                  <Txt variant="productTitle" style={styles.author}>
                    {review.author}
                  </Txt>
                </View>
                <Txt variant="h3" style={styles.title} selectable>
                  {review.title}
                </Txt>
                <Txt variant="body" selectable>
                  {review.text}
                </Txt>
              </View>
            ))}
          </View>

          <Press
            accessibilityRole="link"
            onPress={openBrooksReviews}
            scaleTo={0.98}
            style={styles.secondaryCta}
          >
            <Txt variant="productTitle">See all reviews</Txt>
          </Press>
        </>
      ) : (
        <Txt variant="body" c={colors.inkMuted} style={styles.fallback}>
          Rated {rating.toFixed(1)} out of 5 by {count}{' '}
          {count === 1 ? 'runner' : 'runners'}.
        </Txt>
      )}
    </View>
  );
}

function ReviewFitMeter({ dimension }: { dimension: ReviewDimension }) {
  const lastIndex = Math.max(1, dimension.values.length - 1);
  const markerStart = Math.max(0, Math.min(85, (dimension.average / lastIndex) * 100 - 7.5));

  return (
    <View style={styles.dimension}>
      <Txt variant="productTitle" style={{ textAlign: 'center' }}>
        {dimension.label}
      </Txt>
      <View style={styles.fitRail}>
        <View style={[styles.fitMarker, { left: `${markerStart}%` }]} />
      </View>
      <View style={styles.fitLabels}>
        <Txt variant="tiny">{dimension.values[0]}</Txt>
        <Txt variant="tiny" style={{ textAlign: 'right' }}>
          {dimension.values[dimension.values.length - 1]}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkMuted,
  },
  summary: { alignItems: 'center' },
  score: {
    fontSize: 48,
    lineHeight: 52,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.sm,
  },
  primaryCta: {
    minWidth: 190,
    minHeight: 56,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  dimensions: { gap: spacing.xl, marginTop: spacing.xxxl },
  dimension: { gap: spacing.md },
  fitRail: {
    height: 3,
    backgroundColor: colors.hairline,
    position: 'relative',
  },
  fitMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '15%',
    backgroundColor: colors.ink,
  },
  fitLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  listHeader: {
    marginTop: spacing.xxxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textLink: { textDecorationLine: 'underline' },
  list: { gap: spacing.xxl, marginTop: spacing.xxl },
  item: { gap: spacing.xs },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  author: { flexShrink: 1, textAlign: 'right' },
  title: { marginTop: spacing.md },
  secondaryCta: {
    alignSelf: 'center',
    minWidth: 190,
    minHeight: 56,
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
  },
  fallback: { marginTop: spacing.xl, textAlign: 'center' },
});

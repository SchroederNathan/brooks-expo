import { StyleSheet, View } from 'react-native';

import { BrooksIcon } from './icons';
import { colors, spacing } from '../theme';
import { Txt } from './themed-text';

/**
 * Rating stars drawn with the site's own border-star glyphs (full/half/empty),
 * replacing an earlier text-glyph (★) stand-in.
 */
export function Stars({
  value,
  count,
  size = 11,
  showSummary = true,
  summary = 'rating',
}: {
  value: number | null;
  count?: number;
  size?: number;
  showSummary?: boolean;
  /**
   * `rating` prints `4.5 (60)`; `count` prints `(60)` alone, which is what the
   * site's catalog tile shows next to the glyphs.
   */
  summary?: 'rating' | 'count';
}) {
  if (value == null) return null;
  const half = Math.round(value * 2) / 2;
  const label = [summary === 'rating' ? value.toFixed(1) : null, count ? `(${count})` : null]
    .filter(Boolean)
    .join(' ');
  return (
    <View style={[styles.row, { gap: 5 }]}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <BrooksIcon
            key={i}
            name={i <= half ? 'borderStarFull' : i - 0.5 === half ? 'borderStarHalf' : 'borderStarEmpty'}
            size={size}
            color={colors.ink}
          />
        ))}
      </View>
      {showSummary && label ? (
        <Txt variant="tiny" c={colors.inkMuted}>
          {label}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});

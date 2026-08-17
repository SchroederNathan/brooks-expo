import { StyleSheet, View } from 'react-native';

import { BrooksIcon } from './icons';
import { colors, spacing } from '../theme';
import { Txt } from './themed-text';

/**
 * Rating stars drawn with the site's own border-star glyphs (full/half/empty),
 * replacing an earlier text-glyph (★) stand-in.
 */
export function Stars({ value, count }: { value: number | null; count?: number }) {
  if (value == null) return null;
  const half = Math.round(value * 2) / 2;
  return (
    <View style={[styles.row, { gap: 5 }]}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <BrooksIcon
            key={i}
            name={i <= half ? 'borderStarFull' : i - 0.5 === half ? 'borderStarHalf' : 'borderStarEmpty'}
            size={11}
            color={colors.ink}
          />
        ))}
      </View>
      <Txt variant="tiny" c={colors.inkMuted}>
        {value.toFixed(1)}
        {count ? ` (${count})` : ''}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});

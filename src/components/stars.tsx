import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { Txt } from './themed-text';

export function Stars({ value, count }: { value: number | null; count?: number }) {
  if (value == null) return null;
  const full = Math.round(value);
  return (
    <View style={[styles.row, { gap: 5 }]}>
      <Txt variant="tiny" c={colors.ink}>
        {'★'.repeat(full)}
        <Txt variant="tiny" c={colors.hairline}>
          {'★'.repeat(Math.max(0, 5 - full))}
        </Txt>
      </Txt>
      <Txt variant="tiny" c={colors.inkMuted}>
        {value.toFixed(1)}
        {count ? ` (${count})` : ''}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

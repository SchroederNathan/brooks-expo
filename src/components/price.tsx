import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { fmt } from '../utils/format-price';
import { Txt } from './themed-text';

export function Price({
  value,
  listValue,
  large,
}: {
  value: number | null;
  listValue?: number | null;
  large?: boolean;
}) {
  const onSale = listValue != null && value != null && listValue > value;
  const pct = onSale ? Math.round((1 - value! / listValue!) * 100) : 0;
  return (
    <View style={styles.row}>
      <Txt variant={large ? 'priceLarge' : 'price'} c={onSale ? colors.sale : colors.ink}>
        {value == null ? '—' : fmt(value)}
      </Txt>
      {onSale && (
        <>
          <Txt variant={large ? 'body' : 'bodySmall'} c={colors.inkMuted} style={styles.struck}>
            {fmt(listValue)}
          </Txt>
          <Txt variant={large ? 'caption' : 'tiny'} c={colors.sale}>
            {pct}% off
          </Txt>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  struck: { textDecorationLine: 'line-through' },
});

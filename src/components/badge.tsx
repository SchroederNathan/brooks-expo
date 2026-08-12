import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';
import { Txt } from './themed-text';

export function Badge({
  label,
  variant = 'ink',
}: {
  label: string;
  variant?: 'ink' | 'lime' | 'sale' | 'light';
}) {
  const bg =
    variant === 'lime' ? colors.lime
    : variant === 'sale' ? colors.sale
    : variant === 'light' ? colors.surface
    : colors.ink;
  const fg = variant === 'lime' ? colors.blue : variant === 'light' ? colors.ink : colors.surface;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Txt variant="eyebrow" c={fg} style={{ fontSize: 10, letterSpacing: 0.8 }}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.none,
    alignSelf: 'flex-start',
  },
});

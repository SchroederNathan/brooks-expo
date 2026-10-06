import { Image } from 'expo-image';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { InfoIcon } from '@/components/icons';
import { Txt } from '@/components/themed-text';
import { colors, spacing } from '@/theme';

/**
 * The `#F8F8F8` returns band: the Run Happy Promise seal, the
 * `90-day free returns` label, and one line of trial copy.
 *
 * @ref LLP 0003#pdp-detail-sections — the live PDP's band, drawn once and
 * shown on the PDP and in the Bag.
 */
export function RunHappyPromise({ style }: { style?: ViewProps['style'] }) {
  return (
    <View style={[styles.band, style]}>
      <Image
        source={require('../../assets/home/run-happy-promise.png')}
        style={styles.seal}
        contentFit="contain"
      />
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Txt variant="eyebrow">90-day free returns</Txt>
          <InfoIcon size={14} />
        </View>
        <Txt variant="bodySmall" style={{ marginTop: spacing.xs }}>
          Take our gear for a 90-day test run. If you don’t love it, return it for free.
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  seal: { width: 68, height: 68 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

import { StyleSheet, View } from 'react-native';

import { color, space } from '../theme/tokens';
import { Txt } from './primitives';

/**
 * The PDP cushion/support meter.
 *
 * @ref LLP 0003#wow-list — Turns Brooks's technical fit story into a graphic: a
 * labeled track with a lime marker on the stop this shoe occupies. Brooks's own
 * PDP renders these as "Feel under foot" and "Support level" scales.
 */
export function SpecMeter({
  label,
  stops,
  value,
}: {
  label: string;
  stops: string[];
  /** Which stop this product sits on; null hides the meter. */
  value: string | null;
}) {
  const idx = value ? stops.indexOf(value) : -1;
  if (idx < 0) return null;

  return (
    <View style={styles.root}>
      <Txt variant="eyebrow" c={color.inkMuted} style={{ fontSize: 11 }}>
        {label}
      </Txt>
      <View style={styles.track}>
        {stops.map((s, i) => (
          <View key={s} style={[styles.segment, i === idx && styles.segmentOn]} />
        ))}
      </View>
      <View style={styles.labels}>
        {stops.map((s, i) => (
          <Txt
            key={s}
            variant="tiny"
            c={i === idx ? color.ink : color.inkFaint}
            style={[
              { flex: 1 },
              i === 0
                ? { textAlign: 'left' }
                : i === stops.length - 1
                  ? { textAlign: 'right' }
                  : { textAlign: 'center' },
            ]}
          >
            {s}
          </Txt>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm },
  track: { flexDirection: 'row', gap: 4, height: 8 },
  segment: { flex: 1, backgroundColor: color.surfaceSunken },
  segmentOn: { backgroundColor: color.lime, borderWidth: 1, borderColor: color.ink },
  labels: { flexDirection: 'row' },
});

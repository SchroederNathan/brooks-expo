import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { color, space } from '../theme/tokens';
import { Txt } from './primitives';

/**
 * Live countdown to Josh Kerr's mile record attempt.
 *
 * @ref LLP 0003#editorial — Brooks's own hero is a static campaign banner. Making
 * it tick is the one place the app should out-do the website: a phone is a device
 * you check, and the attempt is days away. Tabular numerals keep the digits from
 * jittering as they change.
 */
export function Countdown({ target, onDark }: { target: number; onDark?: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, target - now);
  const done = remaining === 0;

  const s = Math.floor(remaining / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const fg = onDark ? color.ink : color.surface;
  const bg = onDark ? color.lime : color.ink;

  if (done) {
    return (
      <View style={[styles.pill, { backgroundColor: color.lime }]}>
        <Txt variant="eyebrow" c={color.blue} style={{ fontSize: 11 }}>
          Race day
        </Txt>
      </View>
    );
  }

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: color.lime }]} />
      <Txt variant="mono" c={fg} style={styles.figure}>
        {pad(days)}d {pad(hours)}h {pad(mins)}m {pad(secs)}s
      </Txt>
    </View>
  );
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 999 },
  figure: { fontSize: 14, letterSpacing: 0.5 },
});

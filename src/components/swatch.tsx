import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { parseSwatch, SWATCH_BG } from '@/data/images';
import { radius } from '@/theme';

/**
 * Stands in for product photography.
 *
 * The synthetic catalog has no pictures, so a colorway is drawn as the colors
 * it names. Each of a colorway's frames gets a different composition, keyed off
 * the frame index, so swiping the PDP gallery still changes what is on screen
 * and the pagination dots mean something.
 *
 * Deliberately abstract rather than a drawn shoe: a placeholder that reads as a
 * placeholder is honest, and nothing here can be mistaken for someone's
 * product shot.
 */

/** Gradient direction per composition, cycling through the frame index. */
const ANGLES: { start: { x: number; y: number }; end: { x: number; y: number } }[] = [
  { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
  { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
  { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
];

export function Swatch({
  url,
  width,
  height,
  style,
  rounded = true,
}: {
  url: string;
  width: number;
  height?: number;
  style?: ViewStyle;
  rounded?: boolean;
}) {
  const h = height ?? width;
  const { stops, frame } = parseSwatch(url);

  // A single-colour colourway would make LinearGradient a no-op, so give it a
  // second stop derived from the first to keep a hint of depth.
  const colors: [string, string, ...string[]] =
    stops.length > 1
      ? (stops as [string, string, ...string[]])
      : [stops[0], shade(stops[0], -0.12)];

  const angle = ANGLES[Math.abs(frame) % ANGLES.length];

  return (
    <View
      style={[
        {
          width,
          height: h,
          backgroundColor: SWATCH_BG,
          borderRadius: rounded ? radius.sm : 0,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={angle.start}
        end={angle.end}
        style={StyleSheet.absoluteFill}
      />
      {/* A third stop reads as an accent band rather than a third gradient
          leg, which keeps two- and three-colour colourways visually distinct. */}
      {stops.length > 2 ? (
        <View
          style={{
            position: 'absolute',
            backgroundColor: stops[2],
            left: 0,
            right: 0,
            bottom: 0,
            height: Math.max(3, h * 0.14),
            opacity: 0.9,
          }}
        />
      ) : null}
    </View>
  );
}

/** Lighten (positive) or darken (negative) a hex colour by a fraction. */
function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const next = amount < 0 ? v * (1 + amount) : v + (255 - v) * amount;
    return Math.max(0, Math.min(255, Math.round(next)));
  });
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
